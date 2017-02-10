import datetime
import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from users.models import User
from contacts.models import Contact
from data.models import Company, Person, Employment
from shared.utils import parse_date, check_authentication

def get_company(person):
    latest_employment = person.get_latest_employment()
    return latest_employment.company.name if latest_employment else None

def get_title(person):
    latest_employment = person.get_latest_employment()
    return latest_employment.title if latest_employment else None

class UserContacts(APIView):

    authentication_classes = (TokenAuthentication,)

    def __get_user_contacts(self, user):
        return [
            {
                'id': contact.id,
                'firstName': contact.person.first_name,
                'lastName': contact.person.last_name,
                'name': contact.person.full_name,
                'company': get_company(contact.person),
                'title': get_title(contact.person),
                'location': contact.person.location,
                'email': contact.person.email,
                'photoUrl': contact.person.photo_url,
                'linkedinUrl': contact.person.linkedin_url,
                'tags': [], # TODO
                'interactions': [], #TODO
            }
            for contact in user.contacts.order_by('person__first_name',
                                                  'person__last_name')
        ]

    # GET /contacts/self
    def get(self, request, format=None):
        user = check_authentication(request)
        if user:
            user = check_authentication(request)
            return Response(self.__get_user_contacts(user),
                            status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

    # POST /contacts/self
    def post(self, request, format=None):
        request_json = json.loads(request.body)
        try:
            user = check_authentication(request)
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

                Contact.objects.update_or_create(
                    user=user, person=person,
                    defaults={ 'connection_date': datetime.date.today() }
                )
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

                latest_employment = person.get_latest_employment()
                if latest_employment:
                    (company, title) = (latest_employment.company.name,
                                        latest_employment.title)
                else:
                    (company, title) = (None, None)
                return Response({
                    'id': person.id,
                    'firstName': person.first_name,
                    'lastName': person.last_name,
                    'name': person.full_name,
                    'company': company,
                    'title': title,
                    'location': person.location,
                    'email': person.email,
                    'photoUrl': person.photo_url,
                    'linkedinUrl': person.linkedin_url,
                    'tags': [], # TODO
                    'interactions': [], #TODO
                }, status=status.HTTP_200_OK)
            else:
                return Response({}, status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

class AllContacts(APIView):

    authentication_classes = (TokenAuthentication,)

    def __get_all_contacts(self):
        return [
            {
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
                'tags': [], # TODO,
                'interactions': [], #TODO
            }
            for person in Person.objects.order_by('first_name', 'last_name')
        ]

    # GET /contacts/all
    def get(self, request, format=None):
        user = check_authentication(request)
        if user:
            user = check_authentication(request)
            return Response(self.__get_all_contacts(),
                            status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

