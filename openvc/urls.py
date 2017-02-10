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

    # Contacts API
    url(r'^api/v1/contacts/self$', contact_views.UserContacts.as_view()),
    url(r'^api/v1/contacts/all$', contact_views.AllContacts.as_view()),

    # Data API
]
