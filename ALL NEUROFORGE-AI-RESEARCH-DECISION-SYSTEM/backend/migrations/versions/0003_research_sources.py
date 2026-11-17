"""Persist research sources and evidence status.

Revision ID: 0003_research_sources
Revises: 0002_add_ai_response
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003_research_sources"
down_revision = "0002_add_ai_response"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("research", sa.Column("evidence_status", sa.String(length=20), nullable=True))
    op.create_table(
        "research_sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("research_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("snippet", sa.Text(), nullable=True),
        sa.Column("published_date", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("used_in_answer", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.ForeignKeyConstraint(["research_id"], ["research.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("research_id", "source_number", name="uq_research_sources_number"),
    )
    op.create_index("ix_research_sources_research_id", "research_sources", ["research_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_research_sources_research_id", table_name="research_sources")
    op.drop_table("research_sources")
    op.drop_column("research", "evidence_status")
