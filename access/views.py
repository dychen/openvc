import os
import requests

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_GET

# Create your views here.

@require_GET
def find_person(request):
    """
    Args:
        request [HTTPRequest]: Accepts the following params: email
    Return:
        [JsonResponse]: {
            'firstName': 'John',
            'lastName': 'Doe',
            'location': 'San Francisco, California',
            'gender': 'Male',
            'photoUrl': '...',
            'linkedinUrl': '...',
            'organizations': [{
                'company': 'Google',
                'title': 'Software Engineer',
                'startDate': '2014',
                'current': true
            }, ...]
        }
        Or an empty JSON response if the contact was not found
    """
    def validate_params(params):
        # TODO: Validate email
        return 'email' in params

    def parse_fc_response(data):
        """
        Args:
            data [dict]: {
                "status": 200,
                "requestId": "a44b98df-c45a-4a06-b747-79574a9e2486",
                "likelihood": 0.89,
                "photos": [{
                    "type": "twitter",
                    "typeId": "twitter",
                    "typeName": "Twitter",
                    "url": "...",
                    "isPrimary": true
                }, ...],
                "contactInfo": {
                    "websites": [{
                        "url": "..."
                    }],
                    "familyName": "Doe",
                    "fullName": "John Doe",
                    "givenName": "John"
                },
                "organizations": [{
                    "isPrimary": true,
                    "name": "Google",
                    "startDate": "2014",
                    "title": "Software Engineer",
                    "current": true
                }, ...],
                "demographics": {
                    locationDeduced": {
                        "normalizedLocation": "San Francisco, California",
                        "deducedLocation": "San Francisco, California,
                                            United States",
                        "city": { "name": "San Francisco" },
                        "state": { "name": "California", "code": "CA" },
                        "country": {
                            "deduced": true,
                            "name": "United States",
                            "code": "US"
                        },
                        "continent": {
                            "deduced": true,
                            "name": "North America"
                        },
                        "county": {
                            "deduced": true,
                            "name": "San Francisco"
                        },
                        "likelihood": 1
                    },
                    "locationGeneral": "San Francisco, CA",
                    "gender": "Male"
                },
                "socialProfiles": [{
                    "type": "linkedin",
                    "typeId": "linkedin",
                    "typeName": "LinkedIn",
                    "url": "...",
                    "username": "johndoe123"
                }, ...],
                "digitalFootprint": { UNUSED }
            }
        """
        def nested_get(d, keys, default=None):
            for key in keys:
                try:
                    d = d[key]
                except (KeyError, ValueError, TypeError):
                    return default
            return d
        def get_photo(d, default=None):
            try:
                return [profile for profile in d['photos']
                        if 'isPrimary' in profile
                        and profile['isPrimary']][0]['url']
            except IndexError:
                try:
                    return d['photos'][0]['url']
                except (KeyError, IndexError):
                    return default
            except KeyError:
                return default
        def get_linkedin(d, default=None):
            try:
                return [profile for profile in d['socialProfiles']
                        if profile['type'] == 'linkedin'][0]['url']
            except KeyError, IndexError:
                return default
        def get_organizations(d, default=None):
            try:
                return [{
                    'company': nested_get(org, ['name'], None),
                    'title': nested_get(org, ['title'], None),
                    'startDate': nested_get(org, ['startDate'], None),
                    'current': nested_get(org, ['current'], None)
                } for org in d['organizations']]
            except KeyError:
                return default

        return {
            'firstName': data['contactInfo']['givenName'],
            'lastName': data['contactInfo']['familyName'],
            'location': nested_get(data, ['locationDeduced',
                                          'normalizedLocation']),
            'gender': nested_get(data, ['locationDeduced', 'gender']),
            'photoUrl': get_photo(data),
            'linkedinUrl': get_linkedin(data),
            'organizations': get_organizations(data)
        }

    params = request.GET
    if not validate_params(params):
        return JsonResponse({})

    fc_response = requests.get(
        'https://api.fullcontact.com/v2/person.json',
        params={
            'email': params['email'],
            'apiKey': os.environ['FULLCONTACT_API_KEY']
        }
    )
    if fc_response.status_code == 200:
        try:
            contact_data = parse_fc_response(fc_response.json())
            return JsonResponse(contact_data)
        # Response wasn't in the expected format or wasn't a JSON object
        except ValueError:
            return JsonResponse({})
