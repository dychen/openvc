from data.integrations.crunchbase import API_MAP, get_organizations_csv
from data.integrations.salesforce import get_accounts_with_auth
from data.models import CustomFieldSource, CustomRecord, DataSource

from data.sql import get_custom_data

def get_values_list(field_values):
    """
    Currently only used for entity resolution in the Salesforce updater
    [{'value': [val], 'source': [source]}, ...] => [[val], ...]
    """
    return [v['value'] for v in field_values]

def sync_table(custom_table, user):
    def create_field_map(custom_table, source_name, model_name):
        """
        Returns:
            { [string: DataSourceOption field name]: [CustomField object] }
        """
        field_sources = CustomFieldSource.objects.filter(
            field__table=custom_table,
            source__name=source_name,
            source_option__model=model_name
        )
        return {
            field_source.source_option.field: field_source.field
            for field_source in field_sources
        }

    print 'Syncing...', custom_table

    # Crunchbase
    field_map = create_field_map(custom_table, 'crunchbase', 'organization')
    LIMIT = 500  # For testing
    ct = 0       # For testing
    source = DataSource.objects.get(name='crunchbase')
    for organization in get_organizations_csv():
        if ct >= LIMIT:
            break
        formatted_response = {
            field.api_name: organization[api_name]
            for api_name, field in field_map.iteritems()
            if organization[api_name] # Filter null values
        }
        # TODO: Upsert
        CustomRecord.update_or_create_from_source(
            user, custom_table, formatted_response, source, organization['uuid']
        )
        ct += 1

    # Salesforce
    # Currently does a lookup to see if there's already a match by name and
    # resolve to that entity if so; otherwise, skips (does not create a new
    # entity - yet)
    field_map = create_field_map(custom_table, 'salesforce', 'account')
    data_map = get_custom_data(custom_table.id)
    name_field = field_map['Name'].api_name # Custom field API name for the
                                            # Salesforce Name field
    source = DataSource.objects.get(name='salesforce')
    for account in get_accounts_with_auth(poll=True):
        formatted_response = {
            field.api_name: account[api_name]
            for api_name, field in field_map.iteritems()
            if account[api_name] # Filter null values
        }
        data_map_matches = [r_id for r_id, r_dict in data_map.iteritems()
                            if name_field in r_dict
                            and formatted_response[name_field]
                            in get_values_list(r_dict[name_field])]
        if data_map_matches:
            # Just take the first matching row for now. Don't want to have to
            # deal with many CustomRecord objects tying to a single source key
            # (in this case, SFDC Id)
            print 'MATCH', data_map_matches, formatted_response
            CustomRecord.objects.get(id=data_map_matches[0]).update_from_api(
                user, custom_table, formatted_response, source=source,
                source_key=account['Id']
            )

    # Add additional integrations here


