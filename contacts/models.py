from django.conf import settings
from django.db import models
from data.models import Person

class Connection(models.Model):
    # Should be users.User
    user       = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   related_name='connections')
    person     = models.ForeignKey(Person, related_name='connections')
    date       = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'person')

    def __unicode__(self):
        return u'%s: %s' % (unicode(self.user), unicode(self.person))

class Interaction(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   related_name='interactions')
    person     = models.ForeignKey(Person, related_name='interactions')
    label      = models.TextField(null=True, blank=True)
    notes      = models.TextField(null=True, blank=True)
    date       = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u'%s: %s (%s)' % (unicode(self.user), unicode(self.person),
                                 self.interaction_date)

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

