import datetime
import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from users.models import User, Account, UserAccount
from data.models import (Company, Person, Employment, BoardMember, Investment,
                         InvestorInvestment, Metric)
from shared.auth import check_authentication
from shared.utils import parse_date, get_quarters_until

class InvestorPortfolio(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/self
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            person = user.person
            company = user.get_active_account().company
            return Response(company.get_api_portfolio(),
                            status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

