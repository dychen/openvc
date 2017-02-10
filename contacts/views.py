import datetime
import json

from django.db import IntegrityError
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from users.models import User
from contacts.models import Connection
from data.models import Company, Person, Employment
from shared.utils import parse_date, check_authentication

def create_contact(request_json):
    if request_json.get('firstName') and request_json.get('lastName'):
        person_dict = {}
        if request_json.get('firstName'):
            person_dict['first_name'] = request_json.get('firstName')
        if request_json.get('lastName'):
            person_dict['last_name'] = request_json.get('lastName')
        if request_json.get('location'):
            person_dict['location'] = request_json.get('location')
        if request_json.get('email'):
            person_dict['email'] = request_json.get('email')
        if request_json.get('photoUrl'):
            person_dict['photo_url'] = request_json.get('photoUrl')
        if request_json.get('linkedinUrl'):
            person_dict['linkedin_url'] = request_json.get('linkedinUrl')
        person = Person.update_or_create_duplicate_check(**person_dict)

        if request_json.get('company') and request_json.get('title'):
            company, _ = Company.objects.get_or_create(
                name=request_json.get('company')
            )
            # Don't create a new Employment object if
            # (person, company, title) already exists
            Employment.objects.get_or_create(
                person=person, company=company,
                title=request_json.get('title')
            )
        return person
    else:
        # Can not create person - validation issues
        raise Person.DoesNotExist

def format_contact_dict(person, connected=True):
    def get_company(person):
        latest_employment = person.get_latest_employment()
        return latest_employment.company.name if latest_employment else None

    def get_title(person):
        latest_employment = person.get_latest_employment()
        return latest_employment.title if latest_employment else None

    return {
        'id': person.id,
        'firstName': person.first_name,
        'lastName': person.last_name,
        'name': person.full_name,
        'company': get_company(person),
        'title': get_title(person),
        'location': person.location,
        'email': person.email,
        'photoUrl': person.photo_url,
        'linkedinUrl': person.linkedin_url,
        'tags': [], # TODO
        'interactions': [], #TODO
        'connected': connected,
    }

class UserContacts(APIView):

    authentication_classes = (TokenAuthentication,)

    def __get_user_contacts(self, user):
        return [
            format_contact_dict(connection.person, connected=True)
            for connection in user.connections.order_by('person__first_name',
                                                        'person__last_name')
        ]

    # GET /contacts/self
    def get(self, request, format=None):
        user = check_authentication(request)
        return Response(self.__get_user_contacts(user),
                        status=status.HTTP_200_OK)

    # POST /contacts/self
    def post(self, request, format=None):
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            person = create_contact(request_json)

            Connection.objects.update_or_create(
                user=user, person=person,
                defaults={ 'date': datetime.date.today() }
            )

            return Response(format_contact_dict(person, connected=True),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class AllContacts(APIView):

    authentication_classes = (TokenAuthentication,)

    def __get_all_contacts(self, user):
        connection_ids = set(user.connections.values_list('person__id',
                                                          flat=True))
        return [
            format_contact_dict(person,
                                connected=(person.id in connection_ids))
            for person in Person.objects.order_by('first_name', 'last_name')
        ]

    # GET /contacts/all
    def get(self, request, format=None):
        user = check_authentication(request)
        return Response(self.__get_all_contacts(user),
                        status=status.HTTP_200_OK)

    # POST /contacts/all
    def post(self, request, format=None):
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            person = create_contact(request_json, connected=False)

            return Response(format_contact_dict(person),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class ContactsConnect(APIView):

    authentication_classes = (TokenAuthentication,)

    def post(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            person_id = int(id)
            person = Person.objects.get(id=person_id)
            Connection.objects.create(
                user=user, person=person, date=datetime.date.today()
            )
            return Response({ 'id': person_id }, status=status.HTTP_200_OK)

        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({ 'error': 'Connection already exists' },
                            status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            person_id = int(id)
            person = Person.objects.get(id=person_id)
            connection = Connection.objects.get(user=user, person=person)
            connection.delete()
            return Response({ 'id': person_id }, status=status.HTTP_200_OK)

        except (Person.DoesNotExist, Connection.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class ContactInteractions(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /contacts/interactions
    def get(self, request, format=None):
        user = check_authentication(request)
        if user:
            return Response(self.__get_all_contacts(),
                            status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

    # POST /contacts/interactions
    def post(self, request, format=None):
        pass

    # POST /contacts/interactions/:id

    # DELETE /contacts/interactions

