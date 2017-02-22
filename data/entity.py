from django.db import connection
from data.models import Person, Company

def levenshtein(s1, s2, limit=100):
    # Compare s2 (comparator, possible match) against s1 (target, string being
    # matched against). Skip if the target is empty, proceed with comparison
    # if comparator is empty.
    if not s1:
        return 0
    (s1, s2) = (s1.lower(), s2.lower() if s2 else '')
    previous_row = range(len(s1) + 1)
    for j, c2 in enumerate(s2):
        current_row = [j + 1]
        for i, c1 in enumerate(s1):
            i += 1
            insert = previous_row[i] + 1
            delete = current_row[i - 1] + 1
            replace = previous_row[i - 1] + int(c1 != c2)
            current_row.append(min(insert, delete, replace))
        if min(current_row) > limit:
            return limit
        previous_row = current_row
    return previous_row[-1]

def match_person(data, count=1):
    """
    Args:
        data [dict]: {
            'first_name': [str],
            'last_name': [str],
            'company': [str],
            'email': [str],
            'location': [str],
            'linkedin_url': [str],
        }
        count [int]: Number of results to return.

    Returns:
        [list]: Up to @count person objects that are the closest matches to
                the input @data: [<Person>, <Person>, ...].
    """

    def threshold(data, comp_data):
        """Filters dataset to only attempt to match most relevant ones"""
        return (data['first_name'] == comp_data['first_name']
                or data['last_name'] == comp_data['last_name']
                or data['company'] == comp_data['company']
                or data['linkedin_url'] == comp_data['linkedin_url'])

    def calculate_similarity(target_data, comp_data):
        return (
            levenshtein(target_data['first_name'], comp_data['first_name'])
            + levenshtein(target_data['last_name'], comp_data['last_name'])
            + levenshtein(target_data['company'], comp_data['company'])
            + levenshtein(target_data['email'], comp_data['email'])
        )

    def get_records(score_tuples, count):
        results = []
        person_ids = set([])
        for score, score_tuple in score_tuples:
            if len(results) >= count:
                break
            if score_tuple['id'] not in person_ids:
                results.append(Person.objects.get(id=score_tuple['id']))
                person_ids.add(score_tuple['id'])
        return results

    matches = []
    # Raw SQL for performance
    # TODO: Cache this query in a materialized view
    RAW_SQL = '''
SELECT p.id, p.first_name, p.last_name, p.email, p.location, c.name, p.linkedin_url
FROM data_person p
JOIN data_employment e ON p.id=e.person_id
JOIN data_company c on c.id=e.company_id
'''
    cursor = connection.cursor()
    cursor.execute(RAW_SQL)

    target_data = {
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'email': data['email'],
        'location': data['location'],        
        'company': data['company'],
        'linkedin_url': data['linkedin_url'],
    }

    for row in cursor.fetchall():
        person_id, first_name, last_name, email, location, company, \
            linkedin_url = row
        comp_data = {
            'id': person_id,
            'first_name': first_name,
            'last_name': last_name,
            'location': location,
            'email': email,
            'company': company,
            'linkedin_url': linkedin_url,
        }
        if threshold(target_data, comp_data):
            matches.append((calculate_similarity(target_data, comp_data),
                           comp_data))

    # Sort matches in ascending order (best matches have smaller scores)
    return get_records(sorted(matches, key=lambda x: x[0]), count)

def match_company(data, count=1):
    """
    Args:
        data [dict]: {
            'name': [str],
            'segment': [str],
            'sector': [str],
            'location': [str],
        }
        count [int]: Number of results to return.

    Returns:
        [list]: Up to @count company objects that are the closest matches to
                the input @data: [<Company>, <Company>, ...].
    """

    def threshold(data, comp_data):
        """Filters dataset to only attempt to match most relevant ones"""
        return True

    def calculate_similarity(target_data, comp_data):
        return (
            levenshtein(target_data['name'], comp_data['name'])
            + levenshtein(target_data['segment'], comp_data['segment'])
            + levenshtein(target_data['sector'], comp_data['sector'])
            + levenshtein(target_data['location'], comp_data['location'])
        )

    def get_records(score_tuples, count):
        results = []
        company_ids = set([])
        for score, score_tuple in score_tuples:
            if len(results) >= count:
                break
            if score_tuple['id'] not in company_ids:
                results.append(Company.objects.get(id=score_tuple['id']))
                company_ids.add(score_tuple['id'])
        return results

    matches = []
    # Raw SQL for performance
    # TODO: Cache this query in a materialized view
    RAW_SQL = '''
SELECT c.id, c.name, c.segment, c.sector, c.location FROM data_company c
'''
    cursor = connection.cursor()
    cursor.execute(RAW_SQL)

    target_data = {
        'name': data['name'],
        'segment': data['segment'],
        'sector': data['sector'],
        'location': data['location'],
    }

    for row in cursor.fetchall():
        company_id, name, segment, sector, location, = row
        comp_data = {
            'id': company_id,
            'name': name,
            'segment': segment,
            'sector': sector,
            'location': location,
        }
        if threshold(target_data, comp_data):
            matches.append((calculate_similarity(target_data, comp_data),
                           comp_data))

    # Sort matches in ascending order (best matches have smaller scores)
    return get_records(sorted(matches, key=lambda x: x[0]), count)
