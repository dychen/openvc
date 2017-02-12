from django.core.exceptions import PermissionDenied
from rest_framework.exceptions import NotAuthenticated
from users.models import User

def check_authentication(request):
    try:
        # Header: Bearer [token]
        _, token = request.META['HTTP_AUTHORIZATION'].split(' ')
        return User.objects.get(auth_token=token)
    except KeyError:
        # No token included in auth headers
        raise NotAuthenticated('No token found')
    except User.DoesNotExist:
        # No user found for given token
        raise NotAuthenticated('Could not authenticate')
