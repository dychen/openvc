from dateutil import parser as dateparser

def parse_date(datestr):
    if datestr:
        return dateparser.parse(datestr.strip()).date()
    return None

