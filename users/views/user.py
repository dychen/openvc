import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from data.models import Person, Employment
from shared.auth import check_authentication

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
            account = user.get_active_account()
            request_json = json.loads(request.body)
            person = user.person
            employment = Employment.create_from_api(account, person,
                                                    request_json)

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
