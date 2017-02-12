import datetime
import json

from django.db import IntegrityError
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from users.models import User
from contacts.models import Connection, Interaction
from data.models import Company, Person, Employment
from shared.utils import parse_date, check_authentication

def format_contact_dict(person, user, connected=True):
    person_dict = person.get_api_format()
    person_dict['tags'] = [] # TODO
    person_dict['interactions'] = [
        format_interaction_dict(interaction)
        for interaction in (person.interactions.filter(user=user)
                                  .order_by('-date', 'label',
                                            'user__person__first_name',
                                            'user__person__last_name'))
    ]
    person_dict['connected'] = connected
    return person_dict

def format_interaction_dict(interaction):
    return {
        'id': interaction.id,
        'personId': interaction.person.id,
        'user': interaction.user.person.full_name,
        'label': interaction.label,
        'notes': interaction.notes,
        'date': interaction.date,
    }

class UserContacts(APIView):

    authentication_classes = (TokenAuthentication,)

    def __get_user_contacts(self, user):
        return [
            format_contact_dict(connection.person, user, connected=True)
            for connection in user.connections.order_by('person__first_name',
                                                        'person__last_name')
        ]

    # GET /contacts/self
    def __get_all(self, request, format=None):
        user = check_authentication(request)
        return Response(self.__get_user_contacts(user),
                        status=status.HTTP_200_OK)

    # GET /contacts/self/:id
    def __get_one(self, request, person_id, format=None):
        try:
            user = check_authentication(request)
            # TODO: Set restrictions to connections
            #person = user.connections.get(person__id=person_id).person
            person = Person.objects.get(id=person_id)
            return Response(format_contact_dict(person, user, connected=True),
                            status=status.HTTP_200_OK)
        except (Person.DoesNotExist, Connection.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id=None, format=None):
        if id:
            return self.__get_one(request, id, format=format)
        else:
            return self.__get_all(request, format=format)

    # POST /contacts/self
    def __post_create(self, request, format=None):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            'company': [str],
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

        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            validate(request_json)
            person = Person.create_from_api(request_json)

            Connection.objects.update_or_create(
                user=user, person=person,
                defaults={ 'date': datetime.date.today() }
            )

            return Response(format_contact_dict(person, user, connected=True),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /contacts/self/:id
    def __post_update(self, request, person_id, format=None):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            'company': [str],
            'title': [str],
            'location': [str],
            'email': [str],
            'photoUrl': [str],
            'linkedinUrl': [str]
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            # TODO: Set restrictions to connections
            #person = user.connections.get(person__id=person_id).person
            person = Person.objects.get(id=person_id)
            person = person.update_from_api(request_json)
            return Response(person.get_api_format(), status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

class AllContacts(APIView):

    authentication_classes = (TokenAuthentication,)

    def __get_all_contacts(self, user):
        connection_ids = set(user.connections.values_list('person__id',
                                                          flat=True))
        return [
            format_contact_dict(person, user,
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
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            'company': [str],
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

        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            validate(request_json)
            person = Person.create_from_api(request_json)

            return Response(format_contact_dict(person, user, connected=False),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class ContactConnect(APIView):

    authentication_classes = (TokenAuthentication,)

    def post(self, request, id=None, format=None):
        """
        Expected request body: None
        """
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

    # POST /contacts/interactions
    def __post_create(self, request, format=None):
        """
        Expected request body:
        {
            'personId': [required] [int],
            'label': [str],
            'notes': [str],
            'date': [str],
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            interactions_dict = {}
            # Restrict to user's connections
            person = user.connections.get(
                person__id=request_json.get('personId')
            ).person
            date = (parse_date(request_json.get('date'))
                    if request_json.get('date')
                    else datetime.date.today())

            interaction = Interaction.objects.create(
                user=user,
                person=person,
                label=request_json.get('label'),
                notes=request_json.get('notes'),
                date=date
            )
            return Response(format_interaction_dict(interaction),
                            status=status.HTTP_201_CREATED)

        except (Person.DoesNotExist, Connection.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({ 'error': 'Connection already exists' },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /contacts/interactions/:id
    def __post_update(self, request, interaction_id, format=None):
        """
        Expected request body:
        {
            'personId': [int],
            'label': [str],
            'notes': [str],
            'date': [str],
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            interaction = user.interactions.get(id=interaction_id)
            if request_json.get('personId'):
                # Restrict to user's connections
                person = user.connections.get(
                    person__id=request_json.get('personId')
                ).person
                interaction.person = person
            if request_json.get('label'):
                interaction.label = request_json.get('label')
            if request_json.get('notes'):
                interaction.notes = request_json.get('notes')
            if request_json.get('date'):
                interaction.date = parse_date(request_json.get('date'))
            interaction.save()
            return Response(format_interaction_dict(interaction),
                            status=status.HTTP_200_OK)

        except (Person.DoesNotExist, Connection.DoesNotExist,
                Interaction.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({ 'error': 'Connection already exists' },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /contacts/interactions/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            interaction_id = int(id)
            interaction = user.interactions.get(id=interaction_id)
            interaction.delete()
            return Response({ 'id': interaction_id }, status=status.HTTP_200_OK)

        except Interaction.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

