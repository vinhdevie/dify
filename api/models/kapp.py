from enum import StrEnum

from .engine import db
from .types import StringUUID


class AppAccountPermission(StrEnum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    NORMAL = "normal"
    DATASET_OPERATOR = "dataset_operator"

    @staticmethod
    def is_valid_permission(permission: str) -> bool:
        if not permission:
            return False
        return permission in {
            AppAccountPermission.OWNER,
            AppAccountPermission.ADMIN,
            AppAccountPermission.EDITOR,
            AppAccountPermission.NORMAL,
            AppAccountPermission.DATASET_OPERATOR,
        }


class AppAccountJoins(db.Model):  # type: ignore[name-defined]
    __tablename__ = "app_account_joins"
    __table_args__ = (db.PrimaryKeyConstraint("id", name="app_account_joins_pkey"),)

    id = db.Column(
        StringUUID, nullable=False, server_default=db.text("uuid_generate_v4()")
    )
    account_id = db.Column(StringUUID, nullable=False)
    app_id = db.Column(StringUUID, nullable=False)
    permission = db.Column(db.String(255), nullable=False)
    created_by = db.Column(StringUUID, nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.text("CURRENT_TIMESTAMP(0)")
    )
    updated_by = db.Column(StringUUID, nullable=True)
    updated_at = db.Column(
        db.DateTime, nullable=False, server_default=db.text("CURRENT_TIMESTAMP(0)")
    )
