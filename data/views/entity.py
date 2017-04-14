import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from users.models import Account
from data.models import Company, Person, Employment
from shared.auth import check_authentication

# TODO: Refactor these

def get_fields(request):
    return [camel_to_snake(field)
            for field in request.GET.get('fields').split(',')]

def snake_to_camel(s):
    s_arr = s.split('_')
    return s_arr[0] + ''.join(w.title() for w in s_arr[1:])

import re
def camel_to_snake(s):
    """
    http://stackoverflow.com/questions/1175208/
        elegant-python-function-to-convert-camelcase-to-snake-case
    """
    s2 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', s)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s2).lower()

def get_api_field_format(s):
    return snake_to_camel(s)

def get_db_field_format(s):
    return camel_to_snake(s)

def get_api_format(obj, fields):
    return {
        snake_to_camel(field): getattr(obj, field)
        for field in (fields + ['id']) if hasattr(obj, field)
    }

def create_from_api(model, account, fields, request_json):
    obj_dict = {}
    for field in fields:
        api_field = get_api_field_format(field)
        if api_field in request_json:
            obj_dict[field] = request_json.get(api_field)
    return model.objects.create(account=account, **obj_dict)

def update_from_api(obj, account, fields, request_json):
    for field in fields:
        api_field = get_api_field_format(field)
        if api_field in request_json:
            setattr(obj, field, request_json.get(api_field))
    obj.save()
    return obj

class CompanyView(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /data/company
    def __get_list(self, request, format=None):
        try:
            user = check_authentication(request)
            account = user.account
            companies = Company.objects.filter(account=account)
            return Response([
                get_api_format(company, get_fields(request))
                for company in companies
            ], status=status.HTTP_200_OK)

        except Account.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # GET /data/company/:id
    def __get_one(self, request, company_id, format=None):
        try:
            user = check_authentication(request)
            account = user.account
            company = Company.objects.get(account=account, id=company_id)
            return Response(get_api_format(company, get_fields(request)),
                            status=status.HTTP_200_OK)

        except (Account.DoesNotExist, Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None, format=None):
        if id:
            return self.__get_one(request, id, format=format)
        else:
            return self.__get_list(request, format=format)

    # POST /data/company
    def __post_create(self, request, format=None):
        """
        Expected request body:
        {
            'name': [required] [str],
            ... // Other fields are user-configured and optional
        }
        """
        def validate(request_json):
            if not (request_json.get('name')):
                raise ValidationError('Company name is required.')
            return request_json

        try:
            user = check_authentication(request)
            account = user.account
            fields = get_fields(request)
            request_json = validate(json.loads(request.body))
            company = create_from_api(Company, account, fields, request_json)

            return Response(get_api_format(company, fields),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Account.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /data/company/:id
    def __post_update(self, request, company_id, format=None):
        """
        Expected request body:
        {
            ... // All fields are user-configured and optional
        }
        """
        try:
            user = check_authentication(request)
            account = user.account
            fields = get_fields(request)
            request_json = json.loads(request.body)
            company = Company.objects.get(account=account, id=company_id)
            company = update_from_api(company, account, fields, request_json)

            return Response(get_api_format(company, fields),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Account.DoesNotExist, Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /data/company/:id
    def delete(self, request, id=None, format=None):
        try:
            # TODO
            return Response({ 'id': int(id) },
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Account.DoesNotExist, Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class PersonView(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /data/person
    def __get_list(self, request, format=None):
        try:
            user = check_authentication(request)
            account = user.account
            people = Person.objects.filter(account=account)
            return Response([
                get_api_format(person, get_fields(request))
                for person in people
            ], status=status.HTTP_200_OK)

        except Account.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # GET /data/person/:id
    def __get_one(self, request, person_id, format=None):
        try:
            user = check_authentication(request)
            account = user.account
            person = Person.objects.get(account=account, id=person_id)
            return Response(get_api_format(person, get_fields(request)),
                            status=status.HTTP_200_OK)

        except (Account.DoesNotExist, Person.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None, format=None):
        if id:
            return self.__get_one(request, id, format=format)
        else:
            return self.__get_list(request, format=format)

    # POST /data/person
    def __post_create(self, request, format=None):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            ... // All fields are user-configured and optional
        }
        """
        def validate(request_json):
            if not (request_json.get('firstName')
                    and request_json.get('lastName')):
                raise ValidationError('First and last name are required.')
            return request_json

        try:
            user = check_authentication(request)
            account = user.account
            fields = get_fields(request)
            request_json = validate(json.loads(request.body))
            person = create_from_api(Person, account, fields, request_json)

            return Response(get_api_format(person, fields),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Account.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /data/person/:id
    def __post_update(self, request, person_id, format=None):
        """
        Expected request body:
        {
            'firstName': [str],
            'lastName': [str],
            ... // Other fields are user-configured and optional
        }
        """
        try:
            user = check_authentication(request)
            account = user.account
            fields = get_fields(request)
            request_json = json.loads(request.body)
            person = Person.objects.get(account=account, id=person_id)
            person = update_from_api(person, account, fields, request_json)

            return Response(get_api_format(person, fields),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Account.DoesNotExist, Person.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /data/person/:id
    def delete(self, request, id=None, format=None):
        try:
            # TODO
            return Response({ 'id': int(id) },
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Account.DoesNotExist, Person.DoesNotExist) as e:
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
            employment = Employment.create_from_api(user.account, person,
                                                    request_json)

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

    # DELETE /data/person/:person_id/employment/:employment_id
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

