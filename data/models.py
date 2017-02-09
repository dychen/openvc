from django.db import models

class Person(models.Model):

    def _get_full_name(self):
        names = [n for n in [self.first_name, self.last_name] if n]
        return ' '.join(names)

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

    full_name = property(_get_full_name)

    def __unicode__(self):
        return self.full_name

    def __get_current_employment(self):
        return (self.employment.filter(current=True)
                               .order_by('end_date', 'start_date'))
    def __get_null_employment(self):
        """Assume None in end_date implies present"""
        return (self.employment.filter(end_date__isnull=True)
                               .exclude(current=True)
                               .order_by('end_date', 'start_date'))
    def __get_remaining_employment(self):
        return (self.employment.exclude(current=True)
                               .exclude(end_date__isnull=True)
                               .order_by('end_date', 'start_date'))

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

