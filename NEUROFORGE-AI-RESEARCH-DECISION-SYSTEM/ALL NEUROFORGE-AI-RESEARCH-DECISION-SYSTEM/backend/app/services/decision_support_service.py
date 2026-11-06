from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import ResearchDecisionSupport
from app.services.agent_run_service import claim_existing_run


class DecisionSupportService:
    """Persist one explicit Decision Support Agent run per research record."""

    def get(self, session: Session, research_id) -> ResearchDecisionSupport | None:
        return session.scalars(
            select(ResearchDecisionSupport).where(ResearchDecisionSupport.research_id == research_id)
        ).first()

    def start(self, session: Session, research_id) -> tuple[ResearchDecisionSupport, bool]:
        decision = self.get(session, research_id)
        if decision is not None:
            return claim_existing_run(session, ResearchDecisionSupport, decision, research_id)

        decision = ResearchDecisionSupport(research_id=research_id, status="processing")
        try:
            session.add(decision)
            session.commit()
            session.refresh(decision)
            return decision, True
        except IntegrityError:
            session.rollback()
            existing = self.get(session, research_id)
            if existing is not None:
                return existing, False
            raise
        except Exception:
            session.rollback()
            raise

    def complete(self, session: Session, decision: ResearchDecisionSupport, content: dict) -> ResearchDecisionSupport:
        try:
            decision.decision_support_data = content
            decision.status = "completed"
            decision.error_code = None
            session.commit()
            session.refresh(decision)
        except Exception:
            session.rollback()
            raise
        return decision

    def fail(self, session: Session, decision: ResearchDecisionSupport, error_code: str) -> ResearchDecisionSupport:
        try:
            decision.status = "failed"
            decision.error_code = error_code
            session.commit()
            session.refresh(decision)
        except Exception:
            session.rollback()
            raise
        return decision
