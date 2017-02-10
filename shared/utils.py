from dateutil import parser as dateparser
from django.core.exceptions import PermissionDenied
from users.models import User

def parse_date(datestr):
    if datestr:
        return dateparser.parse(datestr.strip()).date()
    return None

def check_authentication(request):
    try:
        # Header: Bearer [token]
        _, token = request.META['HTTP_AUTHORIZATION'].split(' ')
        return User.objects.get(auth_token=token)
    except KeyError:
        # No token included in auth headers
        raise PermissionDenied('No token found')
    except User.DoesNotExist:
        # No user found for given token
        raise PermissionDenied('Could not authenticate')
