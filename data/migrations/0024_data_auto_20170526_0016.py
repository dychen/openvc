# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-05-26 00:16
from __future__ import unicode_literals

from django.db import migrations

def migrate_field_source(apps, schema_editor):
    """This is an irreversible migration"""
    CustomField = apps.get_model('data', 'CustomField')
    CustomFieldSource = apps.get_model('data', 'CustomFieldSource')
    DataSource = apps.get_model('data', 'DataSource')
    DataSourceOption = apps.get_model('data', 'DataSourceOption')
    default_source, _ = DataSource.objects.get_or_create(source='self')
    default_source_option, _ = DataSourceOption.objects.update_or_create(
        source=default_source, defaults={
            'model': 'self', 'field': 'self'
        }
    )
    for field in CustomField.objects.all():
        CustomFieldSource.objects.create(
            field=field,
            source=default_source,
            source_option=default_source_option,
            account=field.account,
            owner=field.owner
        )

class Migration(migrations.Migration):

    dependencies = [
        ('data', '0023_data_auto_20170525_2255'),
    ]

    operations = [
        migrations.RunPython(migrate_field_source),
    ]
