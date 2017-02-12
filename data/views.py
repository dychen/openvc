import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from data.models import Company, Person, Employment
from shared.auth import check_authentication


class PersonEmployment(APIView):

    authentication_classes = (TokenAuthentication,)

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

        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            validate(request_json)
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

