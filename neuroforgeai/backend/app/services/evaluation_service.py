from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import ResearchEvaluation
from app.services.agent_run_service import claim_existing_run


class EvaluationService:
    """Persist one explicit Evaluation Agent run per research record."""

    def get(self, session: Session, research_id) -> ResearchEvaluation | None:
        return session.scalars(
            select(ResearchEvaluation).where(ResearchEvaluation.research_id == research_id)
        ).first()

    def start(self, session: Session, research_id) -> tuple[ResearchEvaluation, bool]:
        evaluation = self.get(session, research_id)
        if evaluation is not None:
            return claim_existing_run(session, ResearchEvaluation, evaluation, research_id)

        evaluation = ResearchEvaluation(research_id=research_id, status="processing")
        try:
            session.add(evaluation)
            session.commit()
            session.refresh(evaluation)
            return evaluation, True
        except IntegrityError:
            session.rollback()
            existing = self.get(session, research_id)
            if existing is not None:
                return existing, False
            raise
        except Exception:
            session.rollback()
            raise

    def complete(self, session: Session, evaluation: ResearchEvaluation, content: dict) -> ResearchEvaluation:
        try:
            evaluation.evaluation_data = content
            evaluation.status = "completed"
            evaluation.error_code = None
            session.commit()
            session.refresh(evaluation)
        except Exception:
            session.rollback()
            raise
        return evaluation

    def fail(self, session: Session, evaluation: ResearchEvaluation, error_code: str) -> ResearchEvaluation:
        try:
            evaluation.status = "failed"
            evaluation.error_code = error_code
            session.commit()
            session.refresh(evaluation)
        except Exception:
            session.rollback()
            raise
        return evaluation
