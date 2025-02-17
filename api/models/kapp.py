from sqlalchemy import func

from .types import StringUUID
from .engine import db


class AppPermission(db.Model):
    __tablename__ = "app_permissions"

    id = db.Column(StringUUID, primary_key=True, server_default=db.text("uuid_generate_v4()"))
    user_id = db.Column(StringUUID, nullable=False)
    app_id = db.Column(StringUUID, nullable=False)
    permission = db.Column(db.String(255), nullable=False)

    created_by = db.Column(StringUUID, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.current_timestamp())
    updated_by = db.Column(StringUUID, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False, server_default=func.current_timestamp())
