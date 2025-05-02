"""add user connector tables

Revision ID: 9a72d81f3e4c
Revises: 1236a387d85e
Create Date: 2023-10-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '9a72d81f3e4c'
down_revision = '1236a387d85e'
branch_labels = None
depends_on = None


def upgrade():
    # Create user_connectors table
    op.create_table(
        'user_connectors',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tool_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('setup_status', sa.String(), nullable=False, server_default='needs_setup'),
        sa.Column('config_data', sa.JSON(), nullable=True),
        sa.Column('encrypted_credentials', sa.String(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tool_id'], ['tools.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='uq_user_connector_name')
    )
    
    # Create agent_connector_links table
    op.create_table(
        'agent_connector_links',
        sa.Column('agent_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_connector_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ),
        sa.ForeignKeyConstraint(['user_connector_id'], ['user_connectors.id'], ),
        sa.PrimaryKeyConstraint('agent_id', 'user_connector_id')
    )


def downgrade():
    # Drop tables in reverse order
    op.drop_table('agent_connector_links')
    op.drop_table('user_connectors') 