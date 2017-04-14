import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from data.entity import match_person, match_company
from shared.auth import check_authentication


class MatchPerson(APIView):
    """
    WARNING: Matching is a slow process (O(MN^2), where M is the number of
             results and N is the average length of the result). This could
             block server threads, especially if the frontend makes repeated
             calls as the user updates input data.
    """

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
            user = check_authentication(request)
            account = user.account
            person_data = {
                self._VALID_FIELD_MAP[k]: request.query_params[k]
                if k in request.query_params else ''
                for k in self._VALID_FIELD_MAP
            }
            return Response([
                person.get_api_format()
                for person in match_person(person_data, account,
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
            user = check_authentication(request)
            account = user.account
            company_data = {
                self._VALID_FIELD_MAP[k]: request.query_params[k]
                if k in request.query_params else ''
                for k in self._VALID_FIELD_MAP
            }
            return Response([
                company.get_api_format()
                for company in match_company(company_data, account,
                                             count=self._NUM_RESULTS)
            ], status=status.HTTP_200_OK)
        except ValueError:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

