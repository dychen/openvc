# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-23 01:53
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0015_auto_20170322_2340'),
    ]

    operations = [
        migrations.AlterField(
            model_name='deal',
            name='company',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='deals', to='data.Company'),
        ),
    ]