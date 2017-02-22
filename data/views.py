import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from data.models import Company, Person, Employment
from data.entity import match_person, match_company
from shared.auth import check_authentication


class MatchPerson(APIView):

    authentication_classes = (TokenAuthentication,)

    _VALID_FIELD_MAP = {
        'firstName': 'first_name',
        'lastName': 'last_name',
        'company': 'company',
        'location': 'location',
        'email': 'email',
        'linkedinUrl': 'linkedin_url',
    }
    _NUM_RESULTS = 3

    def get(self, request, format=None):
        try:
            person_data = {
                self._VALID_FIELD_MAP[k]: request.query_params[k]
                if k in request.query_params else ''
                for k in self._VALID_FIELD_MAP
            }
            return Response([
                person.get_api_format()
                for person in match_person(person_data,
                                           count=self._NUM_RESULTS)
            ], status=status.HTTP_200_OK)
        except ValueError:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class MatchCompany(APIView):

    authentication_classes = (TokenAuthentication,)

    _VALID_FIELD_MAP = {
        'name': 'name',
        'segment': 'segment',
        'sector': 'sector',
        'location': 'location',
    }
    _NUM_RESULTS = 3

    def get(self, request, format=None):
        try:
            company_data = {
                self._VALID_FIELD_MAP[k]: request.query_params[k]
                if k in request.query_params else ''
                for k in self._VALID_FIELD_MAP
            }
            return Response([
                company.get_api_format()
                for company in match_company(company_data,
                                             count=self._NUM_RESULTS)
            ], status=status.HTTP_200_OK)
        except ValueError:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class PersonEmployment(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /data/person/:person_id/experience
    def get(self, request, person_id, format=None):
        try:
            user = check_authentication(request)
            person = Person.objects.get(id=person_id)
            return Response(person.get_api_experience(),
                            status=status.HTTP_200_OK)

        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /data/person/:person_id/experience
    def __post_create(self, request, person_id, format=None):
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
            request_json = validate(json.loads(request.body))
            person = Person.objects.get(id=person_id)
            employment = Employment.create_from_api(person, request_json)

            return Response(employment.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /data/person/:person_id/employment/:employment_id
    def __post_update(self, request, person_id, employment_id, format=None):
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
            employment = Employment.objects.get(id=employment_id,
                                                person__id=person_id)
            employment = employment.update_from_api(request_json)

            return Response(employment.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, person_id, employment_id=None, format=None):
        if employment_id:
            return self.__post_update(request, person_id, employment_id,
                                      format=format)
        else:
            return self.__post_create(request, person_id, format=format)

    # POST /data/person/:person_id/employment/:employment_id
    def delete(self, request, person_id, employment_id=None, format=None):
        try:
            user = check_authentication(request)
            Employment.objects.get(id=employment_id,
                                   person__id=person_id).delete()

            return Response({ 'id': int(employment_id) },
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

