import json
from dateutil import parser as dateparser

from django.http import JsonResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User
from data.models import Company, Person, Employment

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

def get_self(request):
    user = check_authentication(request)
    if user:
        return JsonResponse({
            'id': user.id,
            'firstName': 'Daniel',
            'lastName': 'Chen',
            'name': 'Daniel Chen',
            'company': 'Andreessen Horowitz',
            'title': 'Test User',
            'photoUrl': 'https://media.licdn.com/media/p/7/005/0b1/15a/0634b6f.jpg',
            'email': 'daniel@a16z.com',
            'linkedinUrl': 'https://www.linkedin.com/in/danielyoungchen',
            'experience': []
        })
    else:
        return JsonResposne({})

class UserExperience(APIView):

    authentication_classes = (TokenAuthentication,)

    def get(self, request, format=None):
        return Response({

        })

    def post(self, request, format=None):
        def parse_date(datestr):
            if datestr:
                return dateparser.parse(datestr.strip()).date()
            return None

        request_json = json.loads(request.body)
        user = check_authentication(request)
        person = user.person
        company, _ = Company.objects.get_or_create(
            name=request_json.get('company')
        )
        employment = Employment.objects.create(
            person=person,
            company=company,
            title=request_json.get('title'),
            start_date=parse_date(request_json.get('startDate')),
            end_date=parse_date(request_json.get('endDate')),
            notes=request_json.get('notes'),
        )
        return Response({
            'id': employment.id,
            'company': employment.company.name,
            'title': employment.title,
            'startDate': employment.start_date,
            'endDate': employment.end_date,
            'notes': employment.notes,
        })

def get_user(request):
    return
