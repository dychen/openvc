import json
from django.db import models
from shared.utils import parse_date

class Person(models.Model):

    def _get_full_name(self):
        names = [n for n in [self.first_name, self.last_name] if n]
        return ' '.join(names)

    first_name = models.TextField()
    last_name  = models.TextField()
    email      = models.EmailField(null=True, blank=True, unique=True)
    location   = models.TextField(null=True, blank=True)
    gender     = models.TextField(null=True, blank=True)
    race       = models.TextField(null=True, blank=True)
    website    = models.TextField(null=True, blank=True)
    photo_url  = models.TextField(null=True, blank=True)
    # Should be unique, but don't add a constraint for more flexibility around
    # user input.
    linkedin_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    full_name = property(_get_full_name)

    def __unicode__(self):
        return self.full_name

    def __get_current_employment(self):
        return (self.employment.filter(current=True)
                               .order_by('end_date', 'start_date',
                                         'company__name', 'title'))
    def __get_null_employment(self):
        """Assume None in end_date implies present"""
        return (self.employment.filter(end_date__isnull=True)
                               .exclude(current=True)
                               .order_by('end_date', 'start_date',
                                         'company__name', 'title'))
    def __get_remaining_employment(self):
        return (self.employment.exclude(current=True)
                               .exclude(end_date__isnull=True)
                               .order_by('end_date', 'start_date',
                                         'company__name', 'title'))

    @classmethod
    def update_or_create_duplicate_check(cls, **kwargs):
        if 'email' in kwargs and kwargs['email']:
            person, _ = Person.objects.update_or_create(
                email=kwargs['email'], defaults=kwargs
            )
            return person
        elif 'linkedin_url' in kwargs and kwargs['linkedin_url']:
            person, _ = Person.objects.update_or_create(
                linkedin_url=kwargs['linkedin_url'], defaults=kwargs
            )
            return person
        else:
            return Person.objects.create(**kwargs)

    def get_latest_employment(self):
        try:
            current = self.__get_current_employment().last()
            if current:
                return current
            else:
                current = self.__get_null_employment().last()
                if current:
                    return current
                else:
                    return self.__get_remaining_employment().last()
        except Employment.DoesNotExist:
            return None

    def get_ordered_employment(self, reverse=False):
        current_employment = [e for e in self.__get_current_employment()]
        null_employment = [e for e in self.__get_null_employment()]
        remaining_employment = [e for e in self.__get_remaining_employment()]
        all_employment = (remaining_employment
                          + null_employment
                          + current_employment)
        return all_employment if not reverse else all_employment[::-1]

    def get_api_format(self):
        latest_employment = self.get_latest_employment()
        if latest_employment:
            (company, title) = (latest_employment.company.name,
                                latest_employment.title)
        else:
            (company, title) = (None, None)

        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'name': self.full_name,
            'company': company,
            'title': title,
            'location': self.location,
            'email': self.email,
            'photoUrl': self.photo_url,
            'linkedinUrl': self.linkedin_url,
        }

    @classmethod
    def create_from_api(cls, request_json):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            'company': [str],
            'title': [str],
            'location': [str],
            'email': [str],
            'photoUrl': [str],
            'linkedinUrl': [str]
        }
        """
        person_dict = {}
        if request_json.get('firstName'):
            person_dict['first_name'] = request_json.get('firstName')
        if request_json.get('lastName'):
            person_dict['last_name'] = request_json.get('lastName')
        if request_json.get('location'):
            person_dict['location'] = request_json.get('location')
        if request_json.get('email'):
            person_dict['email'] = request_json.get('email')
        if request_json.get('photoUrl'):
            person_dict['photo_url'] = request_json.get('photoUrl')
        if request_json.get('linkedinUrl'):
            person_dict['linkedin_url'] = request_json.get('linkedinUrl')
        person = Person.update_or_create_duplicate_check(**person_dict)

        if request_json.get('company') and request_json.get('title'):
            company, _ = Company.objects.get_or_create(
                name=request_json.get('company')
            )
            # Don't create a new Employment object if
            # (person, company, title) already exists
            Employment.objects.get_or_create(
                person=person, company=company,
                title=request_json.get('title')
            )
        return person

    def update_from_api(self, request_json):
        """
        Expected request body:
        {
            'firstName': [required] [str],
            'lastName': [required] [str],
            'location': [str],
            'email': [str],
            'photoUrl': [str],
            'linkedinUrl': [str]
        }
        """
        if request_json.get('firstName'):
            self.first_name = request_json.get('firstName')
        if request_json.get('lastName'):
            self.last_name = request_json.get('lastName')
        if request_json.get('location'):
            self.location = request_json.get('location')
        if request_json.get('email'):
            self.email = request_json.get('email')
        if request_json.get('photoUrl'):
            self.photo_url = request_json.get('photoUrl')
        if request_json.get('linkedinUrl'):
            self.linkedin_url = request_json.get('linkedinUrl')
        self.save()
        return self

    def get_api_experience(self):
        return [employment.get_api_format()
                for employment in self.get_ordered_employment(reverse=True)]

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

    def __unicode__(self):
        return u'%s' % self.name

class CompanyTag(models.Model):
    company    = models.ForeignKey(Company, related_name='tags')
    tag        = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Employment(models.Model):
    person     = models.ForeignKey(Person, related_name='employment')
    company    = models.ForeignKey(Company, related_name='employment')
    title      = models.TextField(null=True, blank=True)
    location   = models.TextField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date   = models.DateField(null=True, blank=True)
    current    = models.NullBooleanField(default=False)
    notes      = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u'%s %s' % (self.person, self.company)

    def get_api_format(self):
        return {
            'id': self.id,
            'company': self.company.name,
            'title': self.title,
            'location': self.location,
            'startDate': self.start_date,
            'endDate': self.end_date,
            'notes': self.notes,
        }

    @classmethod
    def create_from_api(cls, person, request_json):
        """
        Expected request body:
        {
            'company': [required] [str],
            'title': [str],
            'location': [str],
            'startDate': [str],
            'endDate': [str],
            'notes': [str]
        }
        """
        company, _ = Company.objects.get_or_create(
            name=request_json.get('company')
        )

        employment_dict = {}
        if request_json.get('title'):
            employment_dict['title'] = request_json.get('title')
        if request_json.get('location'):
            employment_dict['location'] = request_json.get('location')
        if request_json.get('startDate'):
            employment_dict['start_date'] = parse_date(request_json.get('startDate'))
        if request_json.get('endDate'):
            employment_dict['end_date'] = parse_date(request_json.get('endDate'))
        if request_json.get('notes'):
            employment_dict['notes'] = request_json.get('notes')
        return Employment.objects.create(person=person, company=company,
                                         **employment_dict)

    def update_from_api(self, request_json):
        """
        Expected request body:
        {
            'company': [str],
            'title': [str],
            'location': [str],
            'startDate': [str],
            'endDate': [str],
            'notes': [str]
        }
        """
        if request_json.get('company'):
            company, _ = Company.objects.get_or_create(
                name=request_json.get('company')
            )
            self.company = company
        if request_json.get('title'):
            self.title = request_json.get('title')
        if request_json.get('location'):
            self.location = request_json.get('location')
        if request_json.get('startDate'):
            self.start_date = parse_date(request_json.get('startDate'))
        if request_json.get('endDate'):
            self.end_date = parse_date(request_json.get('endDate'))
        if request_json.get('notes'):
            self.notes = request_json.get('notes')
        self.save()
        return self

