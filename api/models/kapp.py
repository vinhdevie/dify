

from .engine import db
from .types import StringUUID


class AppUserJoins(db.Model):  # type: ignore[name-defined]
    __tablename__ = "app_user_joins"
    __table_args__ = (db.PrimaryKeyConstraint("id", name="app_user_joins_pkey"),)

    id = db.Column(
        StringUUID, nullable=False, server_default=db.text("uuid_generate_v4()")
    )
    user_id = db.Column(StringUUID, nullable=False)
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
