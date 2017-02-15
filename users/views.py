import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from users.models import User, Account, UserAccount
from data.models import Company, Person, Employment, BoardMember
from shared.auth import check_authentication
from shared.utils import parse_date

class UserSelf(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/self
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            person = user.person
            return Response(person.get_api_format(), status=status.HTTP_200_OK)

        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/self
    def post(self, request, format=None):
        """
        Expected request body:
        {
            'firstName': [str],
            'lastName': [str],
            'location': [str],
            'email': [str],
            'photoUrl': [str],
            'linkedinUrl': [str]
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            person = user.person.update_from_api(request_json)
            return Response(person.get_api_format(), status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class UserExperience(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/experience
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            person = user.person
            return Response(person.get_api_experience(),
                            status=status.HTTP_200_OK)

        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/experience
    def __post_create(self, request, format=None):
        """
        Expected request body:
        {
            'company': [required] [str],
            'title': [str],
            'location': [str],
            'startDate': [str],
            'endDate': [str],
            'notes': [str]
        }
        """
        def validate(request_json):
            if not (request_json.get('company')):
                raise ValidationError('Company name is required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            person = user.person
            employment = Employment.create_from_api(person, request_json)

            return Response(employment.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/experience/:id
    def __post_update(self, request, employment_id, format=None):
        """
        Expected request body:
        {
            'company': [str],
            'title': [str],
            'location': [str],
            'startDate': [str],
            'endDate': [str],
            'notes': [str]
        }
        """

        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            employment = user.person.employment.get(id=employment_id)
            employment = employment.update_from_api(request_json)

            return Response(employment.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /users/experience/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            person = user.person
            employment_id = int(id)
            employment = person.employment.get(id=employment_id)
            employment.delete()
            return Response({ 'id': employment_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyTeam(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/company/team
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            return Response(company.get_api_team(), status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/team
    def __post_create(self, request, format=None):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            'title': [str],
            'location': [str],
            'email': [str],
            'photoUrl': [str],
            'linkedinUrl': [str]
        }
        """
        def validate(request_json):
            if not (request_json.get('firstName')
                    and request_json.get('lastName')):
                raise ValidationError('First name and last name are required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            company = user.get_active_account().company
            person = Person.create_from_api(request_json)
            Employment.objects.create(
                person=person,
                company=company,
                title=request_json.get('title'),
                current=True
            )
            return Response(person.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/team/:id
    def __post_update(self, request, person_id, format=None):
        """
        Expected request body:
        {
            'firstName': [str],
            'lastName': [str],
            'title': [str],
            'email': [str],
            'photoUrl': [str]
        }
        """
        def validate(request_json):
            if not (request_json.get('firstName')
                    and request_json.get('lastName')):
                raise ValidationError('First name and last name are required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            company = user.get_active_account().company
            person = Person.objects.get(id=person_id)
            person = person.update_from_api(request_json)

            employment = (Employment.objects
                                    .filter(person=person, company=company,
                                            current=True)
                                    .order_by('end_date', 'start_date')
                                    .last())
            if request_json.get('title'):
                employment.title = request_json.get('title')
                employment.save()
            return Response(person.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Employment.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /users/company/team/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            person_id = int(id)
            person = Person.objects.get(id=person_id)
            employment = person.employment.filter(person=person,
                                                  company=company,
                                                  current=True)
            employment.update(current=False)
            return Response({ 'id': person_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyBoard(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/company/board
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            return Response(company.get_api_board(), status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/board
    def __post_create(self, request, format=None):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            'location': [str],
            'email': [str],
            'photoUrl': [str],
            'linkedinUrl': [str]
        }
        """
        def validate(request_json):
            if not (request_json.get('firstName')
                    and request_json.get('lastName')):
                raise ValidationError('First name and last name are required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            company = user.get_active_account().company
            person = Person.create_from_api(request_json)
            BoardMember.objects.create(person=person, company=company,
                                       current=True)
            return Response(person.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/board/:id
    def __post_update(self, request, person_id, format=None):
        """
        Expected request body:
        {
            'firstName': [str],
            'lastName': [str],
            'email': [str],
            'photoUrl': [str]
        }
        """
        def validate(request_json):
            if not (request_json.get('firstName')
                    and request_json.get('lastName')):
                raise ValidationError('First name and last name are required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            person = Person.objects.get(id=person_id)
            person = person.update_from_api(request_json)

            return Response(person.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Employment.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /users/company/board/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            person_id = int(id)
            person = Person.objects.get(id=person_id)
            employment = (person.board_members.filter(person=person,
                                                      company=company)
                                              .delete())
            return Response({ 'id': person_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

