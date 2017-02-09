import json
from dateutil import parser as dateparser

from django.http import JsonResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from users.models import User
from data.models import Company, Person, Employment

def parse_date(datestr):
    if datestr:
        return dateparser.parse(datestr.strip()).date()
    return None

def check_authentication(request):
    try:
        # Header: Bearer [token]
        _, token = request.META['HTTP_AUTHORIZATION'].split(' ')
        return User.objects.get(auth_token=token)
    except KeyError:
        # No token included in auth headers
        return None
    except User.DoesNotExist:
        # No user found for given token
        return None

def get_person_experience(person):
    return [
        {
            'id': employment.id,
            'company': employment.company.name,
            'title': employment.title,
            'location': employment.location,
            'startDate': employment.start_date,
            'endDate': employment.end_date,
            'notes': employment.notes,
        }
        for employment in person.get_ordered_employment(reverse=True)
    ]

class UserSelf(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /self
    def get(self, request, format=None):
        user = check_authentication(request)
        if user:
            user = check_authentication(request)
            person = user.person
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
                'experience': get_person_experience(person)
            }, status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

    # GET /self
    def post(self, request, format=None):
        request_json = json.loads(request.body)
        try:
            user = check_authentication(request)
            person = user.person
            if request_json.get('firstName'):
                person.first_name = request_json.get('firstName')
            if request_json.get('lastName'):
                person.last_name = request_json.get('lastName')
            if request_json.get('location'):
                person.location = request_json.get('location')
            if request_json.get('email'):
                person.email = request_json.get('email')
            if request_json.get('photoUrl'):
                person.photo_url = request_json.get('photoUrl')
            if request_json.get('linkedinUrl'):
                person.linkedin_url = request_json.get('linkedinUrl')
            person.save()

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
            }, status=status.HTTP_200_OK)
        except Person.DoesNotExist:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

class UserExperience(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /experience
    def get(self, request, format=None):
        return Response({

        })

    # POST /experience
    def __post_create(self, request, format=None):
        request_json = json.loads(request.body)
        try:
            user = check_authentication(request)
            person = user.person
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
        except Person.DoesNotExist:
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

    # POST /experience/:id
    def __post_update(self, request, employment_id, format=None):
        request_json = json.loads(request.body)
        try:
            user = check_authentication(request)
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
        except (Person.DoesNotExist, Employment.DoesNotExist):
            return Response({}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /experience/:id
    def delete(self, request, format=None):
        request_json = json.loads(request.body)
        try:
            user = check_authentication(request)
            person = user.person
            employment = person.employment.get(id=request_json.get('id'))
            employment_id = employment.id # Save - this gets set to None after
                                          # deletion
            employment.delete()
            return Response({
                'id': employment_id
            }, status=status.HTTP_200_OK)
        except (Person.DoesNotExist, Employment.DoesNotExist):
            return Response({}, status=status.HTTP_400_BAD_REQUEST)
