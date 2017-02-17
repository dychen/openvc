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
from users import views as user_views
from contacts import views as contact_views
from data import views as data_views

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
    url(r'^api/v1/users/company/team$', user_views.CompanyTeam.as_view()),
    url(r'^api/v1/users/company/team/(?P<id>[0-9]+)$',
        user_views.CompanyTeam.as_view()),
    url(r'^api/v1/users/company/board$', user_views.CompanyBoard.as_view()),
    url(r'^api/v1/users/company/board/(?P<id>[0-9]+)$',
        user_views.CompanyBoard.as_view()),
    url(r'^api/v1/users/company/investments$',
        user_views.CompanyInvestments.as_view()),
    url(r'^api/v1/users/company/investments/(?P<id>[0-9]+)$',
        user_views.CompanyInvestments.as_view()),
    url(r'^api/v1/users/company/metrics/row$',
        user_views.CompanyMetricsRow.as_view()),

    # Contacts API
    url(r'^api/v1/contacts/self$', contact_views.UserContacts.as_view()),
    url(r'^api/v1/contacts/self/(?P<id>[0-9]+)$',
        contact_views.UserContacts.as_view()),
    url(r'^api/v1/contacts/all$', contact_views.AllContacts.as_view()),
    url(r'^api/v1/contacts/connect/(?P<id>[0-9]+)$',
        contact_views.ContactConnect.as_view()),
    url(r'^api/v1/contacts/interactions$',
        contact_views.ContactInteractions.as_view()),
    url(r'^api/v1/contacts/interactions/(?P<id>[0-9]+)$',
        contact_views.ContactInteractions.as_view()),

    # Data API
    url(r'^api/v1/data/person/(?P<person_id>[0-9]+)/experience$',
        data_views.PersonEmployment.as_view()),
    url(r'^api/v1/data/person/(?P<person_id>[0-9]+)/experience/'
         '(?P<employment_id>[0-9]+)$',
        data_views.PersonEmployment.as_view()),

    # Entity resolution API
    url(r'^api/v1/match/person$', data_views.MatchPerson.as_view()),
]
