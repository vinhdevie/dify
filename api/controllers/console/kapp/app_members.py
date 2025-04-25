from typing import Required
from urllib import parse

from flask_login import current_user  # type: ignore
from flask_restful import Resource, abort, marshal_with, reqparse  # type: ignore

from configs import dify_config
from controllers.console import api
from controllers.console.wraps import (
    account_initialization_required,
    setup_required,
)
from extensions.ext_database import db
from fields.kapp_fields import account_with_app_permission_list_fields

from libs.login import login_required
from models.account import Account
from models.kapp import AppAccountPermission
from services.kapp.app_service import KAppAppService


class KAppMemberListApi(Resource):
    """List all members of current app."""

    @setup_required
    @login_required
    @account_initialization_required
    @marshal_with(account_with_app_permission_list_fields)
    def get(self, app_id):
        members = KAppAppService.get_app_members(app_id)
        return {"result": "success", "accounts": members}, 200

    @setup_required
    @login_required
    @account_initialization_required
    def post(self, app_id):
        parser = reqparse.RequestParser()
        parser.add_argument("account_id_list", type=list[str], required=True, location="json")
        parser.add_argument("permission", type=str, required=True, location="json")
        args = parser.parse_args()
        account_id_list = args["account_id_list"]
        permission = args["permission"]

        try:
            KAppAppService.add_app_member(app_id, account_id_list, permission)
        except Exception as e:
            raise ValueError(str(e))

        return {"result": "success"}, 200

    @setup_required
    @login_required
    @account_initialization_required
    def delete(self, app_id):
        parser = reqparse.RequestParser()
        parser.add_argument("account_id", type=str, required=True, location="json")
        args = parser.parse_args()
        account_id = args["account_id"]

        try:
            KAppAppService.remove_app_member(app_id, account_id)
        except Exception as e:
            raise ValueError(str(e))

        return {"result": "success"}, 200

class KAppMemberUpdatePermissionApi(Resource):
    """Update member permission."""

    @setup_required
    @login_required
    @account_initialization_required
    def patch(self, app_id, member_id):
        parser = reqparse.RequestParser()
        parser.add_argument("permission", type=str, required=True, location="json")
        args = parser.parse_args()
        new_permission = args["permission"]

        if not AppAccountPermission.is_valid_permission(new_permission):
            return {"code": "invalid-permission", "message": "Invalid permission"}, 400

        member = db.session.get(Account, str(member_id))
        if not member:
            abort(404)

        try:
            KAppAppService.update_app_member_permission(app_id, member_id, new_permission)
        except Exception as e:
            raise ValueError(str(e))

        return {"result": "success"}, 200


api.add_resource(KAppMemberListApi, "/kova/app/<uuid:app_id>/members")
api.add_resource(KAppMemberUpdatePermissionApi, "/kova/app/<uuid:app_id>/members/<uuid:member_id>/update-permission")
