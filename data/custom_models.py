from django.db import models
from shared.constants import DEFAULT_ACCOUNT_ID, DATA_TYPES
from data.api import get_api_format, create_from_api, update_from_api

def generate_api_name(display_name):
    return (''.join([c for c in display_name if c.isalnum() or c == ' '])
              .replace(' ', '_'))

class CustomTable(models.Model):
    API_FIELDS = ['display_name', 'api_name', 'icon',
                  { 'field': 'owner', 'related_fields': ['email'] }]
    REQUIRED_FIELDS = ['display_name']

    account    = models.ForeignKey('users.Account',
                                   related_name='custom_tables',
                                   default=DEFAULT_ACCOUNT_ID)
    owner      = models.ForeignKey('users.User', related_name='custom_tables')

    display_name = models.TextField()
    api_name   = models.TextField()
    icon       = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('account', 'api_name')

    def get_api_format(self):
        return get_api_format(self, self.API_FIELDS)

    @classmethod
    def create_from_api(cls, user, request_json):
        if 'displayName' in request_json:
            request_json['apiName'] = generate_api_name(
                request_json['displayName']
            )
        request_json['owner'] = user
        return create_from_api(cls, user.account, cls.API_FIELDS, request_json)

    def update_from_api(self, user, request_json):
        if 'displayName' in request_json:
            request_json['apiName'] = generate_api_name(
                request_json['displayName']
            )
        return update_from_api(self, user.account, self.API_FIELDS, request_json)

class CustomField(models.Model):
    API_FIELDS = [
        'display_name', 'api_name', 'type', 'required',
        { 'field': 'table', 'related_fields': ['display_name', 'api_name', 'icon'] },
        #{ 'related_table': ['display_name', 'api_name', 'icon'] },
        { 'field': 'owner', 'related_fields': ['email'] },
    ]
    REQUIRED_FIELDS = ['display_name']

    DATA_TYPE_CHOICES = [(v, k) for k, v in DATA_TYPES.iteritems()]

    account    = models.ForeignKey('users.Account',
                                   related_name='custom_fields',
                                   default=DEFAULT_ACCOUNT_ID)
    owner      = models.ForeignKey('users.User', related_name='custom_fields')

    table      = models.ForeignKey(CustomTable, related_name='custom_fields')
    display_name = models.TextField()
    api_name   = models.TextField()
    type       = models.TextField(choices=DATA_TYPE_CHOICES)
    related_field = models.ForeignKey('CustomField', null=True, blank=True,
                                      related_name='related_custom_fields')
    required   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('table', 'api_name')

    def get_api_format(self):
        return get_api_format(self, self.API_FIELDS)

    @classmethod
    def create_from_api(cls, user, table, request_json):
        if 'displayName' in request_json:
            request_json['apiName'] = generate_api_name(
                request_json['displayName']
            )
        request_json['owner'] = user
        request_json['table'] = table
        return create_from_api(cls, user.account, cls.API_FIELDS, request_json)

    def update_from_api(self, user, table, request_json):
        if 'displayName' in request_json:
            request_json['apiName'] = generate_api_name(
                request_json['displayName']
            )
        request_json['table'] = table
        return update_from_api(self, user.account, self.API_FIELDS, request_json)

class CustomRecord(models.Model):
    API_FIELDS = [
        { 'field': 'table', 'related_fields': ['display_name', 'api_name', 'icon'] },
        { 'field': 'owner', 'related_fields': ['email'] },
        #{ 'custom_data': ['field', 'value'] },
    ]
    REQUIRED_FIELDS = []

    account    = models.ForeignKey('users.Account',
                                   related_name='custom_records',
                                   default=DEFAULT_ACCOUNT_ID)
    owner      = models.ForeignKey('users.User', related_name='custom_records')

    table      = models.ForeignKey(CustomTable, related_name='custom_records')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_api_format(self):
        # TODO: Optimize
        record = { 'id': self.id }
        for custom_field in self.table.custom_fields.all():
            try:
                record[custom_field.api_name] = CustomData.objects.get(
                    account=self.account, record=self, field=custom_field
                ).value
            except CustomData.DoesNotExist:
                record[custom_field.api_name] = None
        return record

    @classmethod
    def create_from_api(cls, user, table, request_json):
        record = CustomRecord.objects.create(account=user.account, owner=user,
                                             table=table)
        for field_name, value in request_json.iteritems():
            # TODO: Transform value based on type
            try:
                field = CustomField.objects.get(table=table,
                                                api_name=field_name)
                CustomData.objects.create(field=field, record=record,
                                          owner=user, account=user.account,
                                          value=value)
            except CustomField.DoesNotExist:
                continue
        return record

    def update_from_api(self, user, table, request_json):
        for field_name, value in request_json.iteritems():
            # TODO: Transform value based on type
            try:
                field = CustomField.objects.get(table=table,
                                                api_name=field_name)
                CustomData.objects.update_or_create(field=field, record=self,
                                                    owner=user,
                                                    account=user.account,
                                                    defaults={ 'value': value })
            except CustomField.DoesNotExist:
                continue
        return self

class CustomData(models.Model):
    API_FIELDS = [
        'value',
        #{ 'field': ['display_name', 'api_name', 'type'] },
        #{ 'record': [] },
        #{ 'owner': ['email'] },
    ]

    account    = models.ForeignKey('users.Account',
                                   related_name='custom_data',
                                   default=DEFAULT_ACCOUNT_ID)
    owner      = models.ForeignKey('users.User', related_name='custom_data')

    field      = models.ForeignKey(CustomField, related_name='custom_data')
    record     = models.ForeignKey(CustomRecord, related_name='custom_data')
    value      = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('field', 'record')

    def get_api_format(self):
        return get_api_format(self, self.API_FIELDS)

    @classmethod
    def create_from_api(cls, user, request_json):
        request_json['owner'] = user
        return create_from_api(cls, user.account, cls.API_FIELDS, request_json)

    def update_from_api(self, user, request_json):
        return update_from_api(self, user.account, self.API_FIELDS, request_json)
