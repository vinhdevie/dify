from flask_restful import fields  # type: ignore

from fields.member_fields import account_with_role_fields


account_with_app_permission_fields = {
    **account_with_role_fields,
    "kapp_permission": fields.String,
}

account_with_app_permission_list_fields = {
    "accounts": fields.List(fields.Nested(account_with_app_permission_fields))
}
