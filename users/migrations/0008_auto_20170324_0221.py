# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-24 02:21
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_auto_20170221_2318'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='company',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='company_account', to='data.Company'),
        ),
    ]