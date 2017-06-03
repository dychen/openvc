from data.integrations.crunchbase import API_MAP, get_organizations_csv
from data.models import CustomFieldSource, CustomRecord, DataSource

def sync_table(custom_table, user):
    def create_field_map(custom_table, source_name, model_name):
        """
        Returns:
            { [DataSourceOption field name]: [CustomField object] }
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
        }
        # TODO: Upsert
        CustomRecord.update_or_create_from_source(
            user, custom_table, formatted_response, source, organization['uuid']
        )
        ct += 1
    # Add additional integrations here
