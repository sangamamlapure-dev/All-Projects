from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Research, ResearchSource
from app.schemas.research import ResearchCreate
from app.services.source_retriever import RetrievedSource


class ResearchNotFoundError(Exception):
    """Raised when a requested research record does not exist."""


class ResearchService:
    """Database operations for requests, source records, and Research Agent outputs."""

    def create_research(self, session: Session, request: ResearchCreate) -> Research:
        record = Research(
            question=request.question,
            research_type=request.research_type.value,
            description=request.description,
            status="pending",
        )
        try:
            session.add(record)
            session.commit()
            session.refresh(record)
        except Exception:
            session.rollback()
            raise
        return record

    def set_processing(self, session: Session, record: Research) -> Research:
        return self._save(session, record, status="processing", error_code=None)

    def save_sources(self, session: Session, record: Research, sources: list[RetrievedSource]) -> Research:
        try:
            record.sources = [
                ResearchSource(
                    source_number=index,
                    title=source.title,
                    url=source.url,
                    snippet=source.snippet,
                    published_date=source.published_date,
                    used_in_answer=False,
                )
                for index, source in enumerate(sources, start=1)
            ]
            session.commit()
            session.refresh(record)
        except Exception:
            session.rollback()
            raise
        return record

    def set_completed(
        self,
        session: Session,
        record: Research,
        answer: str,
        evidence_status: str,
        used_source_numbers: list[int],
    ) -> Research:
        try:
            used = set(used_source_numbers)
            record.ai_response = answer
            record.evidence_status = evidence_status
            record.error_code = None
            record.status = "completed"
            for source in record.sources:
                source.used_in_answer = source.source_number in used
            session.commit()
            session.refresh(record)
        except Exception:
            session.rollback()
            raise
        return record

    def set_failed(self, session: Session, record: Research, error_code: str) -> Research:
        return self._save(session, record, status="failed", error_code=error_code)

    @staticmethod
    def _save(session: Session, record: Research, **fields) -> Research:
        try:
            for name, value in fields.items():
                setattr(record, name, value)
            session.commit()
            session.refresh(record)
        except Exception:
            session.rollback()
            raise
        return record

    def get_research(self, session: Session, research_id: str) -> Research:
        from uuid import UUID

        record = session.scalars(
            select(Research).options(selectinload(Research.sources)).where(Research.id == UUID(research_id))
        ).first()
        if record is None:
            raise ResearchNotFoundError(research_id)
        return record

    def list_research(self, session: Session, limit: int = 100) -> list[Research]:
        return list(session.scalars(
            select(Research).options(selectinload(Research.sources)).order_by(Research.created_at.desc()).limit(limit)
        ))
