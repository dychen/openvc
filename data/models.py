from django.db import models

class Person(models.Model):
    first_name = models.TextField(null=True, blank=True)
    last_name  = models.TextField(null=True, blank=True)
    email      = models.EmailField(unique=True)
    location   = models.TextField(null=True, blank=True)
    gender     = models.TextField(null=True, blank=True)
    race       = models.TextField(null=True, blank=True)
    website    = models.TextField(null=True, blank=True)
    photo_url  = models.TextField(null=True, blank=True)
    linkedin_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PersonTag(models.Model):
    person     = models.ForeignKey(Person, related_name='tags')
    tag        = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Company(models.Model):
    name       = models.TextField(null=True, blank=True)
    location   = models.TextField(null=True, blank=True)
    website    = models.TextField(null=True, blank=True)
    logo_url   = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CompanyTag(models.Model):
    company    = models.ForeignKey(Company, related_name='tags')
    tag        = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Employment(models.Model):
    person     = models.ForeignKey(Person, related_name='employment')
    company    = models.ForeignKey(Company, related_name='employment')
    title      = models.TextField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date   = models.DateField(null=True, blank=True)
    current    = models.NullBooleanField()
    notes      = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

