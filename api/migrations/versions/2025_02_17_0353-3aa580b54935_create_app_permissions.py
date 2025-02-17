"""create app permissions

Revision ID: 3aa580b54935
Revises: a91b476a53de
Create Date: 2025-02-17 03:53:55.816841

"""
from alembic import op
import models as models
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3aa580b54935'
down_revision = 'a91b476a53de'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'app_permissions',
        sa.Column('id', models.types.StringUUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', models.types.StringUUID(), nullable=False),
        sa.Column('app_id', models.types.StringUUID(), nullable=False),
        sa.Column('permission', sa.String(255), nullable=False),
        sa.Column('created_by', models.types.StringUUID(), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP(0)'), nullable=False),
        sa.Column('updated_by', models.types.StringUUID(), nullable=True),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP(0)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('app_permissions')
