from datetime import datetime, timedelta, timezone

from sqlalchemy import func, update
from sqlalchemy.orm import Session

PROCESSING_STALE_AFTER = timedelta(minutes=5)


def _is_stale(updated_at: datetime | None) -> bool:
    if updated_at is None:
        return False
    timestamp = updated_at if updated_at.tzinfo else updated_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - timestamp > PROCESSING_STALE_AFTER


def claim_existing_run(session: Session, model, record, research_id) -> tuple[object, bool]:
    """Atomically claim a failed run or a stale processing run for an explicit POST."""
    current_status = record.status
    if current_status == "completed":
        return record, False
    if current_status == "processing":
        if not _is_stale(record.updated_at):
            return record, False
    elif current_status != "failed":
        return record, False

    filters = [model.research_id == research_id, model.status == current_status]
    if current_status == "processing":
        filters.append(model.updated_at <= datetime.now(timezone.utc) - PROCESSING_STALE_AFTER)
    claim = update(model).where(*filters).values(
        status="processing",
        error_code=None,
        updated_at=func.now(),
    ).execution_options(synchronize_session=False)
    try:
        result = session.execute(claim)
        session.commit()
        session.refresh(record)
    except Exception:
        session.rollback()
        raise
    return record, result.rowcount == 1
