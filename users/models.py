from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from data.models import Person, Company, Deal
from contacts.models import Interaction

DEFAULT_ACCOUNT_ID = 1

class CusomUserManager(BaseUserManager):
    def create_user(self, email, role, password=None):
        """
        Creates and saves a user with the given email and password.
        Called via command line user creation.
        """
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(email=self.normalize_email(email), role=role,)

        user.set_password(password)
        user.save(using=self._db)
        #Person.objects.update_or_create(email=email)
        return user

    def create_superuser(self, email, role, password):
        """
        Creates and saves a superuser with the given email and password.
        Called via command line user creation.
        """
        user = self.create_user(email, role=role, password=password,)
        user.is_admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    """
    Inherited fields:
    last_login   | timestamp with time zone | 
    password     | character varying(128)   | not null
    """
    ROLES = {
        'Investor': 'Investor',
        'Founder': 'Founder',
    }
    ROLE_CHOICES = [(v, k) for k, v in ROLES.iteritems()]

    email      = models.EmailField(max_length=255, unique=True)
    person     = models.ForeignKey(Person, related_name='users',
                                   null=True, blank=True)
    role       = models.CharField(max_length=50, choices=ROLE_CHOICES)
    is_active  = models.BooleanField(default=True)
    is_admin   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Inherited from AbstractUser
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']

    objects = CusomUserManager()

    def get_full_name(self):
        # The user is identified by their email address
        return self.email

    def get_short_name(self):
        # The user is identified by their email address
        return self.email

    def __unicode__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        # TODO
        return True

    def has_module_perms(self, app_label):
        # TODO
        return True

    def get_active_account(self):
        """
        Throws:
            [UserAccount.MultipleObjectsReturned]
            [UserAccount.DoesNotExist]
            [Account.DoesNotExist]
        """
        return self.user_accounts.get(active=True).account

    def add_to_account(self, account):
        self.user_accounts.update(active=False)
        UserAccount.objects.update_or_create(
            user=self,
            account=account,
            defaults={ 'active': True }
        )

    @property
    def is_staff(self):
        # TODO
        return self.is_admin

    def get_portfolio_company(self, company_id):
        return self.get_active_account().get_portfolio_company(company_id)

    def get_interactions(self, person):
        return [
            interaction.get_api_format()
            for interaction in (self.interactions.filter(person=person)
                                    .order_by('-date', 'label'))
        ]

    def get_company_interactions(self, company):
        # TODO: Filter for people currently employed at the company
        return [
            interaction.get_api_format() for interaction in
            (self.interactions.filter(person__employment__company=company)
                              .order_by('-date', 'label'))
        ]

class Account(models.Model):
    company    = models.OneToOneField(Company, unique=True,
                                      related_name='account')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return unicode(self.company)

    def get_portfolio_company(self, company_id):
        return self.account_portfolio.get(company__id=company_id).company

    def get_deals(self, **kwargs):
        args = { 'account': self }
        return Deal.objects.filter(**args).order_by('name')

    def get_portfolio(self, **kwargs):
        args = { 'account_portfolio__account': self }
        args.update(kwargs)
        return Company.objects.filter(**args).order_by('name')

    def get_api_deals(self):
        if self.company.investor:
            return [deal.get_api_format() for deal in self.get_deals()]
        else:
            return []

    def get_api_portfolio(self):
        if self.company.investor:
            return [
                company.get_api_portco_format(self.company.investor)
                for company in self.get_portfolio()
            ]
        else:
            return []

    def get_company_interactions(self, company):
        # TODO: Filter for people currently employed at the company
        return [
            interaction.get_api_format() for interaction in
            Interaction.objects.filter(
                user__user_accounts__account=self,
                person__employment__company=company
            ).order_by('-date', 'label')
        ]

class UserAccount(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   related_name='user_accounts')
    account    = models.ForeignKey(Account, related_name='account_users')
    active     = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'account')

    def __unicode__(self):
        return u'%s %s %s' % (unicode(self.user), unicode(self.account),
                              self.active)

class AccountPortfolio(models.Model):
    account    = models.ForeignKey(Account, related_name='account_portfolio')
    company    = models.ForeignKey(Company, related_name='account_portfolio')
    active     = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('account', 'company')

    def __unicode__(self):
        return u'%s %s %s' % (unicode(self.account), unicode(self.company),
                              self.active)

