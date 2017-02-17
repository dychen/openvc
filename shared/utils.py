import datetime
from dateutil import parser as dateparser
from dateutil.relativedelta import relativedelta

def parse_date(datestr):
    if datestr:
        return dateparser.parse(datestr.strip()).date()
    return None

def get_quarter(d, offset=0):
    """
    Gets the end of quarter date from an input date (e.g., dates from January
    to March 2015 -> 3/3/2015). The offset parameter can be used to get the end
    of quarter date a number quarters before or after the input date (e.g. an
    offset of 1 will return the next quarter's date, -1 will return the
    previous quarter's date).

    Args:
        d [datetime.date]: Input date.
        offset [int]: Number of quarters before or after the target date.

    Returns:
        [datetime.date]: The end of quarter date for the input date.
    """

    # Get the first day of the following quarter minus one day
    month = (((d.month - 1) / 3 + 1) * 3 + 1) % 12
    # Wrap around the year if necessary
    year = d.year + 1 if month == 1 else d.year
    return (datetime.date(year, month, 1)
            + relativedelta(months=3*offset) # Add quarter offset
            - datetime.timedelta(days=1))    # Subtract one day

def get_quarters_since(d, count):
    starting = get_quarter(d)
    return [starting + relativedelta(months=3*i) for i in range(count)]

def get_quarters_until(d, count):
    ending = get_quarter(d)
    return [ending - relativedelta(months=3*i) for i in range(count)][::-1]

