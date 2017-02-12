from django.conf import settings
from django.db import models
from data.models import Person
from shared.utils import parse_date

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

    def get_api_format(self):
        return {
            'id': self.id,
            'personId': self.person.id,
            'user': self.user.person.full_name,
            'label': self.label,
            'notes': self.notes,
            'date': self.date,
        }

    @classmethod
    def create_from_api(cls, user, person, request_json):
        interaction_dict = {}
        if request_json.get('label'):
            interaction_dict['label'] = request_json.get('label')
        if request_json.get('notes'):
            interaction_dict['notes'] = request_json.get('notes')
        interaction_dict['date'] = (
            parse_date(request_json.get('date'))
            if request_json.get('date')
            else datetime.date.today()
        )

        return Interaction.objects.create(user=user, person=person,
                                          **interaction_dict)

    def update_from_api(self, request_json):
        """
        Expected request body:
        {
            'label': [str],
            'notes': [str],
            'date': [str],
        }
        """
        if request_json.get('label'):
            self.label = request_json.get('label')
        if request_json.get('notes'):
            self.notes = request_json.get('notes')
        if request_json.get('date'):
            self.date = parse_date(request_json.get('date'))
        self.save()
        return self

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

