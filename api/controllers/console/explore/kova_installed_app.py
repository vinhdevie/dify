from datetime import UTC, datetime
from typing import Any

from flask import request
from flask_login import current_user  # type: ignore
from flask_restful import Resource, inputs, marshal_with, reqparse  # type: ignore
from sqlalchemy import and_
from werkzeug.exceptions import BadRequest, Forbidden, NotFound

from controllers.console import api
from controllers.console.explore.wraps import (
    InstalledAppResource,
)
from controllers.console.wraps import (
    account_initialization_required,
    cloud_edition_billing_resource_check,
)
from extensions.ext_database import db
from fields.installed_app_fields import installed_app_list_fields
from libs.login import login_required
from models import App, AppUserJoins, InstalledApp, RecommendedApp
from services.account_service import TenantService


class KovaInstalledAppsListApi(Resource):
    @login_required
    @account_initialization_required
    @marshal_with(installed_app_list_fields)
    def get(self):
        app_id = request.args.get("app_id", default=None, type=str)
        current_tenant_id = current_user.current_tenant_id
        user_id = current_user.id
        user_apps = []

        # Get installed apps for tenant
        installed_apps_query = db.session.query(InstalledApp).filter(
            InstalledApp.tenant_id == current_tenant_id
        )
        if app_id:
            installed_apps_query = installed_apps_query.filter(
                InstalledApp.app_id == app_id
            )
        installed_apps = installed_apps_query.all()

        # Get user app permissions
        user_apps_query = db.session.query(AppUserJoins).filter(
            AppUserJoins.user_id == user_id
        )
        if app_id:
            user_apps_query = user_apps_query.filter(AppUserJoins.app_id == app_id)
        user_apps = user_apps_query.all()

        # Filter installed apps by user permissions
        installed_apps = [
            app
            for app in installed_apps
            if any(user_app.app_id == app.app_id for user_app in user_apps)
        ]

        current_user.role = TenantService.get_user_role(
            current_user, current_user.current_tenant
        )
        installed_app_list: list[dict[str, Any]] = [
            {
                "id": installed_app.id,
                "app": installed_app.app,
                "app_owner_tenant_id": installed_app.app_owner_tenant_id,
                "is_pinned": installed_app.is_pinned,
                "last_used_at": installed_app.last_used_at,
                "editable": current_user.role in {"owner", "admin"},
                "uninstallable": current_tenant_id == installed_app.app_owner_tenant_id,
                "kapp_permission": next(
                    (
                        user_app.permission
                        for user_app in user_apps
                        if user_app.app_id == installed_app.app_id
                    ),
                    None,
                ),
            }
            for installed_app in installed_apps
            if installed_app.app is not None
        ]
        installed_app_list.sort(
            key=lambda app: (
                -app["is_pinned"],
                app["last_used_at"] is None,
                (
                    -app["last_used_at"].timestamp()
                    if app["last_used_at"] is not None
                    else 0
                ),
            )
        )

        return {"installed_apps": installed_app_list}

    @login_required
    @account_initialization_required
    @cloud_edition_billing_resource_check("apps")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("app_id", type=str, required=True, help="Invalid app_id")
        args = parser.parse_args()

        recommended_app = RecommendedApp.query.filter(
            RecommendedApp.app_id == args["app_id"]
        ).first()
        if recommended_app is None:
            raise NotFound("App not found")

        current_tenant_id = current_user.current_tenant_id
        app = db.session.query(App).filter(App.id == args["app_id"]).first()

        if app is None:
            raise NotFound("App not found")

        if not app.is_public:
            raise Forbidden("You can't install a non-public app")

        installed_app = InstalledApp.query.filter(
            and_(
                InstalledApp.app_id == args["app_id"],
                InstalledApp.tenant_id == current_tenant_id,
            )
        ).first()

        if installed_app is None:
            # todo: position
            recommended_app.install_count += 1

            new_installed_app = InstalledApp(
                app_id=args["app_id"],
                tenant_id=current_tenant_id,
                app_owner_tenant_id=app.tenant_id,
                is_pinned=False,
                last_used_at=datetime.now(UTC).replace(tzinfo=None),
            )
            db.session.add(new_installed_app)
            db.session.commit()

        return {"message": "App installed successfully"}


class KovaInstalledAppApi(InstalledAppResource):
    """
    update and delete an installed app
    use InstalledAppResource to apply default decorators and get installed_app
    """

    def delete(self, installed_app):
        if installed_app.app_owner_tenant_id == current_user.current_tenant_id:
            raise BadRequest("You can't uninstall an app owned by the current tenant")

        db.session.delete(installed_app)
        db.session.commit()

        return {"result": "success", "message": "App uninstalled successfully"}

    def patch(self, installed_app):
        parser = reqparse.RequestParser()
        parser.add_argument("is_pinned", type=inputs.boolean)
        args = parser.parse_args()

        commit_args = False
        if "is_pinned" in args:
            installed_app.is_pinned = args["is_pinned"]
            commit_args = True

        if commit_args:
            db.session.commit()

        return {"result": "success", "message": "App info updated successfully"}


api.add_resource(KovaInstalledAppsListApi, "/kova/installed-apps")
api.add_resource(KovaInstalledAppApi, "/kova/installed-apps/<uuid:installed_app_id>")
