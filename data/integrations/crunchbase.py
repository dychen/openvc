import os
import csv
import time
import requests
from data.models import create_defaults_hash
from data.models import Company, Investor, DEFAULT_ACCOUNT_ID

ORGANIZATION_API_URL = 'https://api.crunchbase.com/v/3/odm-organizations'
ORGANIZATION_CSV_PATH = 'files/crunchbase/organizations.csv'

# Map of models to the available fields in the model's response.
API_MAP = {
    'organization': ['primary_role', 'name', 'crunchbase_url', 'homepage_url',
                     'profile_image_url', 'location_city', 'short_description']
}

def create_organization(crunchbase_id, data):
    """
    Args:
        crunchbase_id [str]: E.g., 144bb0c465c1e8bfc7ccafbd5506581e.
        data [dict]: The 'properties' hash in a JSON response
    """
    # TODO: Entity resolution
    company_defaults = create_defaults_hash(data, {
        'name': 'name',
        'permalink': 'crunchbase_permalink',
        'logo_url': 'profile_image_url',
        'location': 'city_name',
        'website': 'homepage_url',
        'description': 'short_description',
    })
    company, _ = Company.objects.update_or_create(
        account=DEFAULT_ACCOUNT_ID,
        crunchbase_id=crunchbase_id,
        defaults=company_defaults
    )
    if data['primary_role'] == 'investor':
        investor_defaults = create_defaults_hash(data, {
            'name': 'name',
        })
        investor_defaults.update({ 'type': 'COMPANY' })
        Investor.objects.update_or_create(
            account=DEFAULT_ACCOUNT_ID,
            company=company,
            defaults=investor_defaults
        )

def get_organizations(poll=True, wait=1, **params):
    """
    organization_types: Filter by one or more types. Multiple types are
                        separated by commas. Available types are 'company',
                        'investor', 'school', and 'group'. Multiple
                        organization_types are logically AND'd. (See
                        primary_role in the API response).

    API response format: {
        'metadata': {
            'api_path_prefix': u'https://api.crunchbase.com',
            'version': 3,
            ...
        },
        'data': {
            'paging': {
                'total_items': 507002,
                'current_page': 1,
                'number_of_pages': 5071,
                'prev_page_url': None,
                'sort_order': 'created_at DESC',
                'items_per_page': 100,
                'next_page_url': 'https://api.crunchbase.com/v/3/organizations'
                                 '?page=2'
            },
            'items': [{
                'type': 'OrganizationSummary',
                'uuid': '144bb0c465c1e8bfc7ccafbd5506581e',
                'properties': {
                    'primary_role': 'group',
                    'permalink': 'vendor-security-alliance',
                    'name': 'Vendor Security Alliance',
                    'web_path': 'organization/vendor-security-alliance',
                    'api_path': 'organizations/vendor-security-alliance',
                    'homepage_url': None,
                    'twitter_url': None,
                    'linkedin_url': None,
                    'facebook_url': None,
                    'profile_image_url': None,
                    'domain': None,
                    'short_description': '...',
                    'city_name': None,
                    'region_name': None
                    'country_code': None,
                    'created_at': 1489441176,
                    'updated_at': 1489441176,
                }
            }, ...]
        }
    }
    API docs: https://data.crunchbase.com/docs/odm-organizations
    """
    print 'Calling API with params:', params

    api_params = {
        'user_key': os.environ['CRUNCHBASE_API_TOKEN']
    }
    api_params.update(params)
    response = requests.get(ORGANIZATION_API_URL, params=api_params).json()
    if 'data' in response:
        data = response['data']

        for organization in data['items']:
            create_organization(organization['uuid'],
                                organization['properties'])

        if poll and data['paging']['next_page_url']:
            get_organizations(poll=True, page=data['paging']['current_page']+1)

    else:
        if wait <= 1024:
            print 'API error, retrying in %s. %s' % (wait, response)
            time.sleep(wait)
            get_organizations(poll=True, wait=wait*2, **params)
        else:
            print 'Maximum retries exceeded, aborting...'
            return

def get_organizations_csv():
    """
    CSV format:
        crunchbase_uuid, type, primary_role, name, crunchbase_url,
        homepage_domain, homepage_url, profile_image_url, facebook_url,
        twitter_url, linkedin_url, stock_symbol, location_city,
        location_region, location_country_code, short_description
    """
    with open(ORGANIZATION_CSV_PATH, 'r') as f:
        csvreader = csv.reader(f)
        next(csvreader) # Skip the header row

        ct = 0
        for line in csvreader:
            ct += 1
            if ct % 1000 == 0:
                print '%d organizations parsed' % ct

            crunchbase_uuid, _, primary_role, name, crunchbase_url, _, \
                homepage_url, profile_image_url, _, _, _, _, \
                location_city, _, _, short_description = line

            organization = {
                'uuid': crunchbase_uuid,
                'primary_role': primary_role,
                'name': name,
                'crunchbase_url': crunchbase_url,
                'homepage_url': homepage_url,
                'profile_image_url': profile_image_url,
                'location_city': location_city,
                'short_description': short_description,
            }
            yield organization
            #create_organization(crunchbase_uuid, organization)

