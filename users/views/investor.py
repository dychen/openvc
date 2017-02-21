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

    # GET /users/portfolio
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

class CompanyTeam(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/portfolio/:company_id/team
    def get(self, request, company_id, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            return Response(company.get_api_team(), status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/team
    def __post_create(self, request, company_id, format=None):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
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
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            person = Person.create_from_api(request_json)
            Employment.objects.create(
                person=person,
                company=company,
                title=request_json.get('title'),
                current=True
            )
            return Response(person.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/team/:person_id
    def __post_update(self, request, company_id, person_id, format=None):
        """
        Expected request body:
        {
            'firstName': [str],
            'lastName': [str],
            'title': [str],
            'email': [str],
            'photoUrl': [str]
        }
        """
        def validate(request_json):
            if not (request_json.get('firstName')
                    and request_json.get('lastName')):
                raise ValidationError('First name and last name are required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            person = Person.objects.get(id=person_id)
            person = person.update_from_api(request_json)

            employment_dict = {}
            if request_json.get('title'):
                employment_dict['title'] = request_json.get('title')
            Employment.objects.update_or_create(
                person=person, company=company, current=True,
                defaults=employment_dict
            )

            return Response(person.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Employment.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, company_id, person_id=None, format=None):
        if person_id:
            return self.__post_update(request, company_id, person_id,
                                      format=format)
        else:
            return self.__post_create(request, company_id, format=format)

    # DELETE /users/portfolio/:company_id/team/:person_id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            person_id = int(person_id)
            person = Person.objects.get(id=person_id)
            employment = person.employment.filter(person=person,
                                                  company=company,
                                                  current=True)
            employment.update(current=False)
            return Response({ 'id': person_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyBoard(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/portfolio/:company_id/board
    def get(self, request, company_id, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            return Response(company.get_api_board(), status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/board
    def __post_create(self, request, company_id, format=None):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
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
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            person = Person.create_from_api(request_json)
            BoardMember.objects.create(person=person, company=company,
                                       current=True)
            return Response(person.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/board/:person_id
    def __post_update(self, request, company_id, person_id, format=None):
        """
        Expected request body:
        {
            'firstName': [str],
            'lastName': [str],
            'email': [str],
            'photoUrl': [str]
        }
        """
        def validate(request_json):
            if not (request_json.get('firstName')
                    and request_json.get('lastName')):
                raise ValidationError('First name and last name are required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            person = Person.objects.get(id=person_id)
            person = person.update_from_api(request_json)

            BoardMember.objects.update_or_create(
                person=person, company=company, current=True
            )

            return Response(person.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Employment.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, company_id, person_id=None, format=None):
        if person_id:
            return self.__post_update(request, company_id, person_id,
                                      format=format)
        else:
            return self.__post_create(request, company_id, format=format)

    # DELETE /users/portfolio/:company_id/board/:person_id
    def delete(self, request, company_id, person_id=None, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            person_id = int(person_id)
            person = Person.objects.get(id=person_id)
            employment = (person.board_members.filter(person=person,
                                                      company=company)
                                              .delete())
            return Response({ 'id': person_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyInvestments(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/portfolio/:company_id/investments
    def get(self, request, company_id, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            return Response(company.get_api_investments(),
                            status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/investments
    def __post_create(self, request, company_id, format=None):
        """
        Expected request body:
        {
            'series': [required] [str],
            'date': [datetime.date],
            'preMoney': [float],
            'raised': [float],
            'postMoney': [float],
            'sharePrice': [float]
        }
        """
        def validate(request_json):
            if not (request_json.get('series')):
                raise ValidationError('Series name is required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            investment = Investment.create_from_api(company, request_json)
            return Response(investment.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/investments/:investment_id
    def __post_update(self, request, company_id, investment_id, format=None):
        """
        Expected request body:
        {
            'series': [str],
            'date': [datetime.date],
            'preMoney': [float],
            'raised': [float],
            'postMoney': [float],
            'sharePrice': [float]
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            investment = Investment.objects.get(id=investment_id,
                                                company=company)

            investment = investment.update_from_api(request_json)
            return Response(investment.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, company_id, investment_id=None, format=None):
        if investment_id:
            return self.__post_update(request, company_id, investment_id,
                                      format=format)
        else:
            return self.__post_create(request, company_id, format=format)

    # DELETE /users/portfolio/:company_id/investments/:investment_id
    def delete(self, request, company_id, investment_id=None, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            investment_id = int(investment_id)
            investment = Investment.objects.get(id=investment_id,
                                                company=company)
            investment.delete()
            return Response({ 'id': investment_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyInvestors(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/portfolio/:company_id/investments/:investment_id/investors
    def get(self, request, company_id, investment_id, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)

            investment = (user.get_active_account().company
                              .investments.get(id=investment_id,
                                               company=company))
            return Response(investment.get_api_investors(),
                            status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist,
                Investment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/investments/:investment_id/investors
    def __post_create(self, request, company_id, investment_id, format=None):
        """
        Expected request body:
        {
            'investor': [required] [str],
            'investorType': [str],
            'date': [datetime.date],
            'invested': [float],
            'ownership': [float],
            'shares': [float]
        }
        """
        def validate(request_json):
            if not (request_json.get('investor')):
                raise ValidationError('Investor name is required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)

            investment = (user.get_active_account().company
                              .investments.get(id=investment_id,
                                               company=company))

            investor_investment = InvestorInvestment.create_from_api(
                investment, request_json
            )
            return Response(investor_investment.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist,
                Investment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/investments/:investment_id/investors
    #      /:investor_investment_id
    def __post_update(self, request, company_id, investment_id,
                      investor_investment_id, format=None):
        """
        Expected request body:
        {
            'investor': [required] [str],
            'investorType': [str],
            'date': [datetime.date],
            'invested': [float],
            'ownership': [float],
            'shares': [float]
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            investment = (user.get_active_account().company
                              .investments.get(id=investment_id,
                                               company=company))

            investor_investment = InvestorInvestment.objects.get(
                investment=investment,
                id=investor_investment_id
            )
            investor_investment = investor_investment.update_from_api(
                request_json
            )
            return Response(investor_investment.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist,
                Investment.DoesNotExist,
                InvestorInvestment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, company_id, investment_id,
             investor_investment_id=None, format=None):
        if investor_investment_id:
            return self.__post_update(request, company_id, investment_id,
                                      investor_investment_id, format=format)
        else:
            return self.__post_create(request, company_id, investment_id,
                                      format=format)

    # DELETE /users/portfolio/:company_id/investments/:investment_id/investors
    #        /:investor_investment_id
    def delete(self, request, company_id, investment_id,
               investor_investment_id=None, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            investment = (user.get_active_account().company
                              .investments.get(id=investment_id,
                                               company=company))

            investor_investment_id = int(investor_investment_id)
            Investor_investment.objects.get(id=investor_investment_id,
                                            investment=investment).delete()
            return Response({ 'id': investor_investment_id },
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Investment.DoesNotExist,
                InvestorInvestment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyMetrics(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/portfolio/:company_id/metrics
    def get(self, request, company_id, format=None):
        try:
            # TODO: Coordinate this with the frontend
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            return Response(company.get_api_metrics(),
                            status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/metrics
    def __post_create(self, request, company_id, format=None):
        """
        Expected request body:
        {
            'metric': [required] [str],
            [datestring]: [float],
            [datestring]: [float],
            [datestring]: [float],
            ...
        }
        """
        def validate(request_json):
            if not (request_json.get('metric')):
                raise ValidationError('Metric name is required.')
            return request_json

        try:
            user = check_authentication(request)
            request_json = validate(json.loads(request.body))
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            metric = Metric.create_from_api(company, request_json)
            return Response(metric.get_api_list_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/portfolio/:company_id/metrics/:metric_id
    def __post_update(self, request, company_id, metric_id, format=None):
        """
        Expected request body:
        {
            'metric': [str],
            [datestring]: [float],
            [datestring]: [float],
            [datestring]: [float],
            ...
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            metric = Metric.objects.get(id=metric_id, company=company)

            metric = metric.update_from_api(request_json)
            return Response(metric.get_api_list_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, company_id, metric_id=None, format=None):
        if metric_id:
            return self.__post_update(request, company_id, metric_id,
                                      format=format)
        else:
            return self.__post_create(request, company_id, format=format)

    # DELETE /users/portfolio/:company_id/metrics/:metric_id
    def delete(self, request, company_id, metric_id=None, format=None):
        try:
            user = check_authentication(request)
            user_company = user.get_active_account().company
            company = user_company.get_portfolio().get(id=company_id)
            metric_id = int(metric_id)
            metric = Metric.objects.get(id=metric_id, company=company)
            metric.delete()
            return Response({ 'id': metric_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

