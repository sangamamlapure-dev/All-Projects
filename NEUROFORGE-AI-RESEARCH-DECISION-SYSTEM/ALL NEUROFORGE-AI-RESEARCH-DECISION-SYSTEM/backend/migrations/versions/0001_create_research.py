"""Create research table.

Revision ID: 0001_create_research
Revises:
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_create_research"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "research",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("research_question", sa.Text(), nullable=False),
        sa.Column("research_type", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_research_created_at", "research", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_research_created_at", table_name="research")
    op.drop_table("research")
