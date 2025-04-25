from extensions.ext_database import db
from models.account import Account
from models.kapp import AppAccountJoins
from services.kapp.error import AppMemberNotFoundError


class KAppAppService:
    """
    KAppAppService provides methods for managing app members and permissions:

    Methods:
        get_app_members(app_id: str) -> list[Account]:
            Get list of members who have access to the app
            Returns list of Account objects with their roles

        add_app_member(app_id: str, user_id: str, role: str) -> AppUserJoins:
            Add a user as member to the app with specified role
            Returns the created AppUserJoins record
            Raises error if user already has access

        remove_app_member(app_id: str, user_id: str) -> None:
            Remove a user's access from the app
            Raises error if user is not a member
    """

    @staticmethod
    def get_app_members(app_id: str) -> list[Account]:
        """
        Get list of members who have access to the app
        Returns list of Account objects with their roles
        """

        # Query join table and accounts
        query = (
            db.session.query(Account, AppAccountJoins.permission)
            .join(AppAccountJoins, Account.id == AppAccountJoins.account_id)
            .filter(AppAccountJoins.app_id == app_id)
            .order_by(AppAccountJoins.created_at)
        )
        # Attach permission as attribute for each account
        members = []
        for account, permission in query:
            account.kapp_permission = permission
            members.append(account)
        return members

    @staticmethod
    def add_app_member(app_id: str, account_id_list: list[str], permission: str) -> list[AppAccountJoins]:
        """
        Add users as members to the app with specified permission.
        Returns a list of created AppAccountJoins records.
        Ignores if any user already has access.
        """
        created_joins = []
        for account_id in account_id_list:
            exists = db.session.query(AppAccountJoins).filter_by(app_id=app_id, account_id=account_id).first()
            if exists:
                continue  # Ignore if already exists 
            join = AppAccountJoins(app_id=app_id, account_id=account_id, permission=permission)
            db.session.add(join)
            db.session.commit()
            created_joins.append(join)
        return created_joins


    @staticmethod
    def remove_app_member(app_id: str, account_id: str) -> None:
        """
        Remove a user's access from the app
        Raises error if user is not a member
        """

        join = (
            db.session.query(AppAccountJoins)
            .filter_by(app_id=app_id, account_id=account_id)
            .first()
        )
        if not join:
            raise AppMemberNotFoundError("User is not a member of this app.")
        db.session.delete(join)
        db.session.commit()

    @staticmethod
    def update_app_member_permission(app_id: str, account_id: str, new_permission: str) -> None:
        """Update member permission"""
        target_member_join = AppAccountJoins.query.filter_by(app_id=app_id, account_id=account_id).first()

        if target_member_join.permission == new_permission:
            raise RoleAlreadyAssignedError("The provided permission is already assigned to the member.")

        if new_permission == "owner":
            # Find the current owner and change their role to 'admin'
            current_owner_join = AppAccountJoins.query.filter_by(app_id=app_id, permission="owner").first()
            current_owner_join.permission = "admin"

        # Update the permission of the target member
        target_member_join.permission = new_permission
        db.session.commit()
