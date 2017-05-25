from django.apps import apps as django_apps
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import FieldDoesNotExist
from rest_framework.exceptions import ValidationError

from shared.utils import snake_to_camel, camel_to_snake

def __get_api_field_format(s):
    return snake_to_camel(s)

def __get_db_field_format(s):
    return camel_to_snake(s)

def __hasfield(obj, field):
    """
    Args:
        obj [class/object]: Class or object inheriting from
                            django.db.models.Model. Can either be a model class
                            (e.g. <class 'data.models.Company'>) or an instance
                            (e.g. <Company: Google>).
        field [str]: Field to check (e.g. 'name', 'date')
    """
    try:
        obj._meta.get_field(field)
        return True
    except FieldDoesNotExist:
        return False

def get_fields(request):
    return [camel_to_snake(field)
            for field in request.GET.get('fields').split(',')]

def validate_request(request_json, required_fields):
    for field in required_fields:
        if not (request_json.get(__get_api_field_format(field))):
            raise ValidationError('%s is required.' % field)
    return request_json

def get_api_format(obj, fields):
    result = {}
    for field in fields + ['id']:
        if type(field) is dict:
            result[field['field']] = get_api_format(getattr(obj, field['field']),
                                                    field['related_fields'])
        else:
            if __hasfield(obj, field):
                result[snake_to_camel(field)] = getattr(obj, field)
    return result

def create_from_api(model, account, fields, request_json):
    obj_dict = {}
    for field in fields:
        if type(field) is dict:
            # TODO: Test this method
            api_field = __get_api_field_format(field['field'])
            if api_field in request_json and __hasfield(model, field['field']):
                obj_json = request_json.get(api_field)
                if obj_json and 'id' in obj_json:
                    try:
                        related_obj = django_apps.get_model(
                            field['model']
                        ).objects.get(
                            account=account, id=obj_json['id']
                        )
                        obj_dict[field['field']] = related_obj
                        # TODO: Recursively decide whether to create or update
                        update_from_api(related_obj, account,
                                        field['related_fields'], obj_json)
                    except ObjectDoesNotExist:
                        continue
        else:
            api_field = __get_api_field_format(field)
            if api_field in request_json and __hasfield(model, field):
                obj_dict[field] = request_json.get(api_field)
    return model.objects.create(account=account, **obj_dict)

def update_from_api(obj, account, fields, request_json):
    for field in fields:
        if type(field) is dict:
            api_field = __get_api_field_format(field['field'])
            if api_field in request_json and __hasfield(obj, field['field']):
                obj_json = request_json.get(api_field)
                if obj_json and 'id' in obj_json:
                    try:
                        related_obj = django_apps.get_model(
                            field['model']
                        ).objects.get(
                            account=account, id=obj_json['id']
                        )
                        setattr(obj, field['field'], related_obj)
                        update_from_api(related_obj, account,
                                        field['related_fields'], obj_json)
                    except ObjectDoesNotExist:
                        continue
        else:
            api_field = __get_api_field_format(field)
            if api_field in request_json and __hasfield(obj, field):
                setattr(obj, field, request_json.get(api_field))
    obj.save()
    return obj
