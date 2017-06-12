from django.db import connection

# Module-level
# TODO: Consider impact on performance
cursor = connection.cursor()

def get_custom_data(table_id, field_names=None):
    """
    Returns:
        [dict]: {
            [row_id]: {
                [field_api_name]: [{
                    'source': [source_name],
                    'value': [value],
                }, ...],
                ...
            },
            ...
        }
    """
    FIELD_CLAUSE = (' AND cf.api_name IN (%s) ' % field_names.join(',')
                    if field_names else '')
    RAW_SQL = '''
SELECT ct.api_name, cr.id, cf.id, cf.api_name, cf.type, ds.name, cd.value
    FROM data_customtable ct JOIN data_customfield cf ON ct.id=cf.table_id
        JOIN data_customfieldsource cfs ON cf.id=cfs.field_id
        JOIN data_customdata cd ON cd.field_id=cfs.id
        JOIN data_customrecord cr ON cr.id=cd.record_id
        JOIN data_datasource ds ON cfs.source_id=ds.id
        JOIN users_account a ON ct.account_id=a.id
    WHERE ct.id=%s %s;''' % (table_id, FIELD_CLAUSE)
    cursor.execute(RAW_SQL)

    results = {}
    for row in cursor.fetchall():
        table_name, row_id, field_id, field_name, field_type, source, value = row

        if row_id not in results:
            results[row_id] = {}
        if field_name not in results[row_id]:
            results[row_id][field_name] = []

        results[row_id][field_name].append({'source': source, 'value': value})
    return results

