import datetime
import json

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from users.models import User, Account, UserAccount
from data.models import (Company, Person, Employment, BoardMember, Investment,
                         Metric)
from shared.auth import check_authentication
from shared.utils import parse_date, get_quarters_until

class UserSelf(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/self
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            person = user.person
            return Response(person.get_api_format(), status=status.HTTP_200_OK)

        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/self
    def post(self, request, format=None):
        """
        Expected request body:
        {
            'firstName': [str],
            'lastName': [str],
            'location': [str],
            'email': [str],
            'photoUrl': [str],
            'linkedinUrl': [str]
        }
        """
        try:
            user = check_authentication(request)
            request_json = json.loads(request.body)
            person = user.person.update_from_api(request_json)
            return Response(person.get_api_format(), status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class UserExperience(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/experience
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            person = user.person
            return Response(person.get_api_experience(),
                            status=status.HTTP_200_OK)

        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/experience
    def __post_create(self, request, format=None):
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
            request_json = json.loads(request.body)
            person = user.person
            employment = Employment.create_from_api(person, request_json)

            return Response(employment.get_api_format(),
                            status=status.HTTP_201_CREATED)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except Person.DoesNotExist as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/experience/:id
    def __post_update(self, request, employment_id, format=None):
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
            employment = user.person.employment.get(id=employment_id)
            employment = employment.update_from_api(request_json)

            return Response(employment.get_api_format(),
                            status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /users/experience/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            person = user.person
            employment_id = int(id)
            employment = person.employment.get(id=employment_id)
            employment.delete()
            return Response({ 'id': employment_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyTeam(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/company/team
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            return Response(company.get_api_team(), status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/team
    def __post_create(self, request, format=None):
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
            company = user.get_active_account().company
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

    # POST /users/company/team/:id
    def __post_update(self, request, person_id, format=None):
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
            company = user.get_active_account().company
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

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /users/company/team/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            person_id = int(id)
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

    # GET /users/company/board
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            return Response(company.get_api_board(), status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/board
    def __post_create(self, request, format=None):
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
            company = user.get_active_account().company
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

    # POST /users/company/board/:id
    def __post_update(self, request, person_id, format=None):
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
            company = user.get_active_account().company
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

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /users/company/board/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            person_id = int(id)
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

    # GET /users/company/investments
    def get(self, request, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            return Response(company.get_api_investments(),
                            status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/investments
    def __post_create(self, request, format=None):
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
            company = user.get_active_account().company
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

    # POST /users/company/investments/:id
    def __post_update(self, request, investment_id, format=None):
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
            investment = Investment.objects.get(id=investment_id)
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

    def post(self, request, id=None, format=None):
        if id:
            return self.__post_update(request, id, format=format)
        else:
            return self.__post_create(request, format=format)

    # DELETE /users/company/investments/:id
    def delete(self, request, id=None, format=None):
        try:
            user = check_authentication(request)
            company = user.get_active_account().company
            investment_id = int(id)
            investment = Investment.objects.get(id=investment_id)
            investment.delete()
            return Response({ 'id': investment_id }, status=status.HTTP_200_OK)

        except (TypeError, ValueError) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)
        except (Person.DoesNotExist, Employment.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

class CompanyMetricsRow(APIView):

    authentication_classes = (TokenAuthentication,)

    # GET /users/company/metrics/row
    def get(self, request, format=None):
        try:
            # TODO: Coordinate this with the frontend
            user = check_authentication(request)
            company = user.get_active_account().company
            metric_names = (company.metrics.distinct('name').order_by('name')
                                           .values_list('name', flat=True))
            response_json = []
            for i, metric_name in enumerate(metric_names):
                response_dict = { 'id': i, 'metric': metric_name }
                dates = get_quarters_until(datetime.date.today(), 9)
                for date in dates:
                    datestr = date.strftime('%Y-%m-%d')
                    try:
                        response_dict[datestr] = Metric.objects.get(
                            company=company, name=metric_name, date=date,
                            interval='Quarter', estimated=False
                        ).value
                    except Metric.DoesNotExist:
                        response_dict[datestr] = None
                response_json.append(response_dict)

            return Response(response_json,
                            status=status.HTTP_200_OK)

        except (UserAccount.MultipleObjectsReturned,
                UserAccount.DoesNotExist,
                Account.DoesNotExist,
                Company.DoesNotExist) as e:
            return Response({ 'error': str(e) },
                            status=status.HTTP_400_BAD_REQUEST)

    # POST /users/company/metrics/row
    def post(self, request, id=None, format=None):
        """
        Expected request body:
        {
            'id': [required] [int], # Used for frontend row uniqueness
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
            company = user.get_active_account().company
            metric = request_json.get('metric')
            response_json = {
                'id': company.metrics.distinct('name').count() + 1,
                'metric': metric,
            }

            for k, v in request_json.iteritems():
                try:
                    date = datetime.datetime.strptime(k, '%Y-%m-%d').date()
                    if v:
                        Metric.objects.update_or_create(
                            company=company,
                            name=metric,
                            date=date,
                            interval='Quarter',
                            estimated=False,
                            defaults={ 'value': v }
                        )
                    response_json[k] = v
                except ValueError:
                    continue

            return Response(response_json,
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

