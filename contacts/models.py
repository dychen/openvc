from django.conf import settings
from django.db import models
from data.models import Person

class Contact(models.Model):
    # Should be users.User
    user       = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   related_name='contacts')
    person     = models.ForeignKey(Person, related_name='contacts')
    connection_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'person')

    def __unicode__(self):
        return u'%s: %s' % (unicode(user), unicode(person))

class Interaction(models.Model):
    contact    = models.ForeignKey(Contact, related_name='interactions')
    title      = models.TextField(null=True, blank=True)
    notes      = models.TextField(null=True, blank=True)
    interaction_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Event(models.Model):
    title      = models.TextField(null=True, blank=True)
    notes      = models.TextField(null=True, blank=True)
    event_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Participants(models.Model):
    event      = models.ForeignKey(Event, related_name='participants')
    person     = models.ForeignKey(Event, related_name='participation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

