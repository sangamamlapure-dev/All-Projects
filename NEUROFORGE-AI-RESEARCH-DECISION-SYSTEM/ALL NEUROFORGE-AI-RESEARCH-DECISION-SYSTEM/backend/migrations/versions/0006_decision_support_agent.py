"""Add Decision Support Agent result table.

Revision ID: 0006_decision_support_agent
Revises: 0005_evaluation_agent
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006_decision_support_agent"
down_revision = "0005_evaluation_agent"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "research_decision_support",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("research_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("decision_support_data", sa.JSON(), nullable=True),
        sa.Column("error_code", sa.String(length=60), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["research_id"], ["research.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("research_id", name="uq_research_decision_support_research_id"),
    )


def downgrade() -> None:
    op.drop_table("research_decision_support")
