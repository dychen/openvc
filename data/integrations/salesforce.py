import os
import requests

class APIError(Exception):
    pass

def format_sfdc_id(sfdc_id):
    """
    Truncate 18-char Salesforce IDs to 15 characters
    """
    return sfdc_id[:-3] if sfdc_id and len(sfdc_id) == 18 else sfdc_id

ACCOUNT_SOQL = 'SELECT Id, Name, Description, Website FROM Account';

def get_api_token():
    r = requests.post(
        'https://a16z.my.salesforce.com/services/oauth2/token',
        data={
            'grant_type': 'password',
            'client_id': os.environ['SALESFORCE_API_CLIENT_ID'],
            'client_secret': os.environ['SALESFORCE_API_CLIENT_SECRET'],
            'username': os.environ['SALESFORCE_API_USERNAME'],
            'password': os.environ['SALESFORCE_API_PASSWORD']
        })
    try:
        data = r.json()
        return data['access_token']
    except KeyError:
        msg = '[ERROR]: Could not grant Salesforce token: %s' % data
        print msg
        raise APIError(msg)

def get_accounts(token, poll=True, wait=1, **params):
    """
    API response format: {
        'totalSize': 20000,
        'done': false,
        'nextRecordsUrl': '/services/data/v20.0/query/...',
        'records': [
            {
                'attributes': {
                    'type': 'Account',
                    'url': '/services/data/v20.0/sobjects/Account/...'
                },
                'Id': '...',
                'Name': 'My Company',
                'Website': 'www.mycompany.com',
                'Description': '...',
                ...
            },
            ...
        ]
    }
    """
    results = params['results'] if 'results' in params else []
    URL = (params['url'] if 'url' in params
           else ('https://%s/services/data/v20.0/query/'
                 % os.environ['SALESFORCE_API_INSTANCE']))
    PARAMS = {'q': ACCOUNT_SOQL}
    HEADERS = {'Authorization': 'Bearer %s' % token}
    print 'Fetching Salesforce data', URL
    response = requests.get(URL, params=PARAMS, headers=HEADERS)
    response = response.json()
    if 'records' in response:
        results += [{
            'Id': record['Id'],
            'Name': record['Name'],
            'Website': record['Website'],
            'Description': record['Description']
        } for record in response['records']]
    if (poll and 'done' in response and not response['done']
        and 'nextRecordsUrl' in response):
        next_url = ('https://%s/%s' % (os.environ['SALESFORCE_API_INSTANCE'],
                                       response['nextRecordsUrl']))
        return get_accounts(token, poll, wait, url=next_url, results=results)
    else:
        return results

def get_accounts_with_auth(**params):
    token = get_api_token()
    return get_accounts(token, **params)
