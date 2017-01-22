from __future__ import unicode_literals

from django.db import models

# Person entities

class Person(models.Model):
    first_name = models.TextField(null=True, blank=True)
    last_name  = models.TextField(null=True, blank=True)
    email      = models.EmailField(unique=True)
    location   = models.TextField(null=True, blank=True)
    gender     = models.TextField(null=True, blank=True)
    race       = models.TextField(null=True, blank=True)
    website    = models.TextField(null=True, blank=True)
    picture_url = models.TextField(null=True, blank=True)
    linkedin_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class User(models.Model):
    person_id  = models.OneToOneField(Person, unique=True,
                                      related_name='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Corporate entities

class Company(models.Model):
    name       = models.TextField(null=True, blank=True)
    location   = models.TextField(null=True, blank=True)
    website    = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Startup(models.Model):
    company_id = models.OneToOneField(Company, unique=True,
                                      related_name='startup')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Firm(models.Model):
    company_id = models.OneToOneField(Company, unique=True,
                                      related_name='firm')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Person-Company Relationships

class Partner(models.Model):
    person_id  = models.ForeignKey(Person, related_name='partners')
    firm_id    = models.ForeignKey(Firm, related_name='partners')
    title      = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Employee(models.Model):
    person_id  = models.ForeignKey(Person, related_name='employees')
    startup_id = models.ForeignKey(Startup, related_name='employees')
    title      = models.TextField(null=True, blank=True)
    founder    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Person related entities

class PersonEmail(models.Model):
    person_id  = models.ForeignKey(Person, related_name='emails')
    email      = models.EmailField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PersonOrganizations(models.Model):
    person_id  = models.ForeignKey(Person, related_name='organizations')
    company    = models.TextField(null=True, blank=True)
    title      = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date   = models.DateField(null=True, blank=True)
    current    = models.NullBooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Corporate related entities

class Round(models.Model):
    startup    = models.ForeignKey(Startup, related_name='rounds')
    raised     = models.DecimalField(max_digits=20, decimal_places=5,
                                     null=True, blank=True)
    pre_money  = models.DecimalField(max_digits=20, decimal_places=5,
                                     null=True, blank=True)
    post_money = models.DecimalField(max_digits=20, decimal_places=5,
                                     null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Investment(models.Model):
    round      = models.ForeignKey(Round, related_name='investments')
    ownership  = models.FloatField(null=True, blank=True)
    investor   = models.ForeignKey(Firm, related_name='investments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Startup-Investor Relationships

class Application(models.Model):
    pass
