"""Add AI response and provider error code.

Revision ID: 0002_add_ai_response
Revises: 0001_create_research
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_add_ai_response"
down_revision = "0001_create_research"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("research", sa.Column("ai_response", sa.Text(), nullable=True))
    op.add_column("research", sa.Column("error_code", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("research", "error_code")
    op.drop_column("research", "ai_response")
