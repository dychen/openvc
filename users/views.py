import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from users.models import User
from data.models import Company, Person, Employment
from shared.utils import parse_date, check_authentication

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
        return Response({})

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
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            person = user.person
            if request_json.get('company'):
                company, _ = Company.objects.get_or_create(
                    name=request_json.get('company')
                )
                employment = Employment.objects.create(
                    person=person,
                    company=company,
                    title=request_json.get('title'),
                    location=request_json.get('location'),
                    start_date=parse_date(request_json.get('startDate')),
                    end_date=parse_date(request_json.get('endDate')),
                    notes=request_json.get('notes'),
                )
                return Response({
                    'id': employment.id,
                    'company': employment.company.name,
                    'title': employment.title,
                    'location': employment.location,
                    'startDate': employment.start_date,
                    'endDate': employment.end_date,
                    'notes': employment.notes,
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({ 'error': 'No company provided' },
                                status=status.HTTP_400_BAD_REQUEST)

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
            if request_json.get('company'):
                company, _ = Company.objects.get_or_create(
                    name=request_json.get('company')
                )
                employment.company = company
            if request_json.get('title'):
                employment.title = request_json.get('title')
            if request_json.get('location'):
                employment.location = request_json.get('location')
            if request_json.get('startDate'):
                employment.start_date = parse_date(request_json.get('startDate'))
            if request_json.get('endDate'):
                employment.end_date = parse_date(request_json.get('endDate'))
            if request_json.get('notes'):
                employment.notes = request_json.get('notes')
            employment.save()
            return Response({
                'id': employment.id,
                'company': employment.company.name,
                'title': employment.title,
                'location': employment.location,
                'startDate': employment.start_date,
                'endDate': employment.end_date,
                'notes': employment.notes,
            }, status=status.HTTP_200_OK)

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

