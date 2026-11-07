from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import ResearchAnalysis
from app.services.agent_run_service import claim_existing_run


class AnalysisService:
    """Persist one explicit Analysis Agent run per research record."""

    def get(self, session: Session, research_id) -> ResearchAnalysis | None:
        return session.scalars(
            select(ResearchAnalysis).where(ResearchAnalysis.research_id == research_id)
        ).first()

    def start(self, session: Session, research_id) -> tuple[ResearchAnalysis, bool]:
        analysis = self.get(session, research_id)
        if analysis is not None:
            return claim_existing_run(session, ResearchAnalysis, analysis, research_id)

        analysis = ResearchAnalysis(research_id=research_id, status="processing")
        try:
            session.add(analysis)
            session.commit()
            session.refresh(analysis)
            return analysis, True
        except IntegrityError:
            # Another explicit request may have inserted the unique row concurrently.
            session.rollback()
            existing = self.get(session, research_id)
            if existing is not None:
                return existing, False
            raise
        except Exception:
            session.rollback()
            raise

    def complete(self, session: Session, analysis: ResearchAnalysis, content: dict) -> ResearchAnalysis:
        try:
            analysis.analysis_data = content
            analysis.status = "completed"
            analysis.error_code = None
            session.commit()
            session.refresh(analysis)
        except Exception:
            session.rollback()
            raise
        return analysis

    def fail(self, session: Session, analysis: ResearchAnalysis, error_code: str) -> ResearchAnalysis:
        try:
            analysis.status = "failed"
            analysis.error_code = error_code
            session.commit()
            session.refresh(analysis)
        except Exception:
            session.rollback()
            raise
        return analysis
