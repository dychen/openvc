"""openvc URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from rest_framework.authtoken import views as authoken_views
from users.views import user as user_views
from users.views import founder as founder_views
from users.views import investor as investor_views
from contacts import views as contact_views
from data.views import entity as entity_views
from data.views import match as match_views
from data.views import custom_views as custom_views

urlpatterns = [
    # Admin API
    url(r'^admin/', admin.site.urls),

    # Auth API
    url(r'^api/v1/auth/token$', authoken_views.obtain_auth_token),

    # Users API
    url(r'^api/v1/users/self$', user_views.UserSelf.as_view()),
    url(r'^api/v1/users/experience$', user_views.UserExperience.as_view()),
    url(r'^api/v1/users/experience/(?P<id>[0-9]+)$',
        user_views.UserExperience.as_view()),

    # Users - Founder API
    url(r'^api/v1/users/company/team$', founder_views.CompanyTeam.as_view()),
    url(r'^api/v1/users/company/team/(?P<id>[0-9]+)$',
        founder_views.CompanyTeam.as_view()),
    url(r'^api/v1/users/company/board$', founder_views.CompanyBoard.as_view()),
    url(r'^api/v1/users/company/board/(?P<id>[0-9]+)$',
        founder_views.CompanyBoard.as_view()),
    url(r'^api/v1/users/company/investments$',
        founder_views.CompanyInvestments.as_view()),
    url(r'^api/v1/users/company/investments/(?P<id>[0-9]+)$',
        founder_views.CompanyInvestments.as_view()),
    url(r'^api/v1/users/company/investments/(?P<investment_id>[0-9]+)/'
         'investors$',
        founder_views.CompanyInvestors.as_view()),
    url(r'^api/v1/users/company/investments/(?P<investment_id>[0-9]+)/'
         'investors/(?P<investor_investment_id>[0-9]+)$',
        founder_views.CompanyInvestors.as_view()),
    url(r'^api/v1/users/company/metrics$',
        founder_views.CompanyMetrics.as_view()),
    url(r'^api/v1/users/company/metrics/(?P<id>[0-9]+)$',
        founder_views.CompanyMetrics.as_view()),

    # Users - Investor API
    url(r'^api/v1/users/portfolio$',
        investor_views.InvestorPortfolio.as_view()),
    url(r'^api/v1/users/portfolio/(?P<id>[0-9]+)$',
        investor_views.InvestorPortfolio.as_view()),

    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/team$',
        investor_views.CompanyTeam.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/team/'
         '(?P<person_id>[0-9]+)$',
        investor_views.CompanyTeam.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/board$',
        investor_views.CompanyBoard.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/board/'
         '(?P<person_id>[0-9]+)$',
        investor_views.CompanyBoard.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/investments$',
        investor_views.CompanyInvestments.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/investments/'
         '(?P<investment_id>[0-9]+)$',
        investor_views.CompanyInvestments.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/investments/'
         '(?P<investment_id>[0-9]+)/'
         'investors$',
        investor_views.CompanyInvestors.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/investments/'
         '(?P<investment_id>[0-9]+)/investors/(?P<investor_investment_id>[0-9]+)$',
        investor_views.CompanyInvestors.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/metrics$',
        investor_views.CompanyMetrics.as_view()),
    url(r'^api/v1/users/portfolio/(?P<company_id>[0-9]+)/metrics/'
         '(?P<metric_id>[0-9]+)$',
        investor_views.CompanyMetrics.as_view()),
    url(r'^api/v1/users/deals$', investor_views.InvestorDeals.as_view()),
    url(r'^api/v1/users/deals/(?P<deal_id>[0-9]+)$',
        investor_views.InvestorDeals.as_view()),

    # Contacts API
    url(r'^api/v1/contacts/self$', contact_views.UserContacts.as_view()),
    url(r'^api/v1/contacts/self/(?P<id>[0-9]+)$',
        contact_views.UserContacts.as_view()),
    url(r'^api/v1/contacts/all$', contact_views.AllContacts.as_view()),
    url(r'^api/v1/contacts/connect/(?P<id>[0-9]+)$',
        contact_views.ContactConnect.as_view()),
    url(r'^api/v1/contacts/(?P<person_id>[0-9]+)/interactions$',
        contact_views.ContactInteractions.as_view()),
    url(r'^api/v1/contacts/(?P<person_id>[0-9]+)/interactions/'
         '(?P<interaction_id>[0-9]+)$',
        contact_views.ContactInteractions.as_view()),

    # Data API
    url(r'^api/v1/data/company$', entity_views.CompanyView.as_view()),
    url(r'^api/v1/data/company/(?P<id>[0-9]+)$',
        entity_views.CompanyView.as_view()),
    url(r'^api/v1/data/person$', entity_views.PersonView.as_view()),
    url(r'^api/v1/data/person/(?P<id>[0-9]+)$',
        entity_views.PersonView.as_view()),

    url(r'^api/v1/data/person/(?P<person_id>[0-9]+)/experience$',
        entity_views.PersonEmployment.as_view()),
    url(r'^api/v1/data/person/(?P<person_id>[0-9]+)/experience/'
         '(?P<employment_id>[0-9]+)$',
        entity_views.PersonEmployment.as_view()),

    # Custom Tables API
    url(r'^api/v1/tables$',
        custom_views.CustomTableView.as_view()),
    url(r'^api/v1/tables/(?P<id>[0-9]+)$',
        custom_views.CustomTableView.as_view()),
    url(r'^api/v1/tables/(?P<table_id>[0-9]+)/fields$',
        custom_views.CustomFieldView.as_view()),
    url(r'^api/v1/tables/(?P<table_id>[0-9]+)/fields/(?P<field_id>[0-9]+)$',
        custom_views.CustomFieldView.as_view()),
    url(r'^api/v1/tables/(?P<table_id>[0-9]+)/records$',
        custom_views.CustomRecordView.as_view()),
    url(r'^api/v1/tables/(?P<table_id>[0-9]+)/records/(?P<record_id>[0-9]+)$',
        custom_views.CustomRecordView.as_view()),

    url(r'^api/v1/sources$', custom_views.DataSourceView.as_view()),
    url(r'^api/v1/tables/(?P<id>[0-9]+)/sync$',
        custom_views.CustomTableSyncView.as_view()),

    # Entity resolution API
    url(r'^api/v1/match/person$', match_views.MatchPerson.as_view()),
    url(r'^api/v1/match/company$', match_views.MatchCompany.as_view()),
]
