from dateutil import parser as dateparser
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
        return None
    except User.DoesNotExist:
        # No user found for given token
        return None
