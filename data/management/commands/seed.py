from django.core.management.base import BaseCommand, CommandError
from data.integrations import crunchbase

class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('--site', '-s',
            action='store',
            dest='site',
            default='crunchbase',
            help='Name of the site to seed data from.'
        )
        parser.add_argument('--type', '-t',
            action='store',
            dest='type',
            help="Type of data to retrieve (e.g. 'organizations')."
        )

    def handle(self, *args, **options):
        if options['site'] == 'crunchbase':
            if options['type'] == 'organizations':
                print 'Getting organizations'
                #crunchbase.get_organizations(poll=True)
                crunchbase.get_organizations_csv()
