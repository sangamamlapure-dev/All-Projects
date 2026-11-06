import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_database_url, get_db, is_supported_database_url, make_engine
from app.schemas.research import AnalysisContent, AnalysisResponse, DecisionSupportContent, DecisionSupportResponse, EvaluationContent, EvaluationResponse, HealthResponse, ResearchCreate, ResearchResponse, ResearchSourceResponse
from app.services.analysis_agent import AnalysisAgent, AnalysisAgentError
from app.services.analysis_service import AnalysisService
from app.services.decision_support_agent import DecisionSupportAgent, DecisionSupportAgentError
from app.services.decision_support_service import DecisionSupportService
from app.services.evaluation_agent import EvaluationAgent, EvaluationAgentError
from app.services.evaluation_service import EvaluationService
from app.services.research_agent import ResearchAgent, ResearchAgentError
from app.services.research_service import ResearchNotFoundError, ResearchService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")
service = ResearchService()
analysis_service = AnalysisService()
evaluation_service = EvaluationService()
decision_support_service = DecisionSupportService()


def get_research_agent() -> ResearchAgent:
    return ResearchAgent()


def get_analysis_agent() -> AnalysisAgent:
    return AnalysisAgent()


def get_evaluation_agent() -> EvaluationAgent:
    return EvaluationAgent()


def get_decision_support_agent() -> DecisionSupportAgent:
    return DecisionSupportAgent()


def to_response(record) -> ResearchResponse:
    return ResearchResponse(
        research_id=str(record.id),
        question=record.question,
        research_type=record.research_type,
        description=record.description,
        status=record.status,
        ai_response=record.ai_response,
        error_code=record.error_code,
        evidence_status=record.evidence_status,
        created_at=record.created_at,
        updated_at=record.updated_at,
        sources=[
            ResearchSourceResponse(
                source_id=str(source.id),
                source_number=source.source_number,
                title=source.title,
                url=source.url,
                snippet=source.snippet,
                published_date=source.published_date,
                retrieved_at=source.retrieved_at,
                used_in_answer=source.used_in_answer,
            )
            for source in record.sources
        ],
    )


def to_analysis_response(research_id: str, analysis_record=None) -> AnalysisResponse:
    if analysis_record is None:
        return AnalysisResponse(research_id=research_id, status="not_started")
    content = AnalysisContent.model_validate(analysis_record.analysis_data) if analysis_record.status == "completed" else None
    return AnalysisResponse(
        research_id=research_id,
        status=analysis_record.status,
        analysis=content,
        error_code=analysis_record.error_code,
        created_at=analysis_record.created_at,
        updated_at=analysis_record.updated_at,
    )


def to_evaluation_response(research_id: str, evaluation_record=None) -> EvaluationResponse:
    if evaluation_record is None:
        return EvaluationResponse(research_id=research_id, status="not_started")
    content = EvaluationContent.model_validate(evaluation_record.evaluation_data) if evaluation_record.status == "completed" else None
    return EvaluationResponse(
        research_id=research_id,
        status=evaluation_record.status,
        evaluation=content,
        error_code=evaluation_record.error_code,
        created_at=evaluation_record.created_at,
        updated_at=evaluation_record.updated_at,
    )


def to_decision_support_response(research_id: str, decision_record=None) -> DecisionSupportResponse:
    if decision_record is None:
        return DecisionSupportResponse(research_id=research_id, status="not_started")
    content = DecisionSupportContent.model_validate(decision_record.decision_support_data) if decision_record.status == "completed" else None
    return DecisionSupportResponse(
        research_id=research_id,
        status=decision_record.status,
        decision_support=content,
        error_code=decision_record.error_code,
        created_at=decision_record.created_at,
        updated_at=decision_record.updated_at,
    )


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    url = get_database_url()
    if not url:
        return HealthResponse(status="ok", message="NeuroForge AI backend is running.", database="not_configured")
    if not is_supported_database_url(url):
        return HealthResponse(status="ok", message="NeuroForge AI backend is running.", database="unavailable")
    engine = None
    try:
        engine = make_engine(url)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return HealthResponse(status="ok", message="NeuroForge AI backend is running.", database="ok")
    except (SQLAlchemyError, ModuleNotFoundError):
        logger.warning("Database health check failed")
        return HealthResponse(status="ok", message="NeuroForge AI backend is running.", database="unavailable")
    finally:
        if engine is not None:
            engine.dispose()


@router.post("/research", response_model=ResearchResponse, status_code=status.HTTP_201_CREATED)
def submit_research(
    payload: ResearchCreate,
    session: Session = Depends(get_db),
    agent: ResearchAgent = Depends(get_research_agent),
) -> ResearchResponse:
    try:
        # Commit the user's request before any paid or external service calls.
        record = service.create_research(session, payload)
        record = service.set_processing(session, record)
    except SQLAlchemyError as exc:
        logger.error("Unable to save research request or status")
        raise HTTPException(status_code=503, detail="Research storage is unavailable. Check the database connection and migrations.") from exc

    try:
        record = agent.run(session, record)
    except ResearchAgentError as exc:
        logger.warning("Research Agent stopped with safe error code %s", exc.error_code)
        try:
            record = service.get_research(session, str(record.id))
        except SQLAlchemyError as db_exc:
            logger.error("Unable to reload saved Research Agent failure")
            raise HTTPException(status_code=503, detail="The request was saved, but its final status could not be loaded.") from db_exc
        return to_response(record)
    except SQLAlchemyError as exc:
        logger.error("Research Agent could not persist its result")
        raise HTTPException(status_code=503, detail="The request was saved, but its sources or result could not be persisted.") from exc
    except Exception as exc:
        logger.error("Unexpected Research Agent failure: %s", type(exc).__name__)
        try:
            record = service.set_failed(session, record, "research_agent_error")
        except SQLAlchemyError as db_exc:
            logger.error("Unable to persist Research Agent failure status")
            raise HTTPException(status_code=503, detail="The request was saved, but its final status could not be recorded.") from db_exc
        return to_response(record)

    logger.info("Research Agent completed request %s", record.id)
    return to_response(record)


@router.get("/research", response_model=list[ResearchResponse])
def research_history(limit: int = Query(default=100, ge=1, le=500), session: Session = Depends(get_db)) -> list[ResearchResponse]:
    try:
        return [to_response(record) for record in service.list_research(session, limit=limit)]
    except SQLAlchemyError as exc:
        logger.error("Unable to load research history")
        raise HTTPException(status_code=503, detail="Research storage is unavailable. Check the database connection and migrations.") from exc


@router.post("/research/{research_id}/analysis", response_model=AnalysisResponse)
def start_analysis(
    research_id: str,
    session: Session = Depends(get_db),
    agent: AnalysisAgent = Depends(get_analysis_agent),
) -> AnalysisResponse:
    try:
        parsed_id = UUID(research_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Research ID must be a valid UUID.") from exc
    try:
        research = service.get_research(session, research_id)
    except ResearchNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Research request was not found.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to load research for analysis")
        raise HTTPException(status_code=503, detail="Research storage is unavailable.") from exc
    if research.status != "completed" or not research.ai_response or not research.sources:
        raise HTTPException(status_code=409, detail="A completed Research Agent answer and saved sources are required before analysis.")

    try:
        analysis_record, should_run = analysis_service.start(session, parsed_id)
    except SQLAlchemyError as exc:
        logger.error("Unable to start analysis record")
        raise HTTPException(status_code=503, detail="Analysis status could not be saved. Check database availability.") from exc
    if not should_run:
        try:
            return to_analysis_response(research_id, analysis_record)
        except ValidationError as exc:
            raise HTTPException(status_code=409, detail="The saved Analysis Agent result is invalid and cannot be returned.") from exc

    try:
        content = agent.analyze(research)
        analysis_record = analysis_service.complete(session, analysis_record, content.model_dump())
    except AnalysisAgentError as exc:
        logger.warning("Analysis Agent stopped with safe error code %s", exc.error_code)
        try:
            analysis_record = analysis_service.fail(session, analysis_record, exc.error_code)
        except SQLAlchemyError as db_exc:
            logger.error("Unable to persist failed analysis status")
            raise HTTPException(status_code=503, detail="Analysis failed and its final status could not be saved.") from db_exc
    except SQLAlchemyError as exc:
        logger.error("Unable to persist analysis output")
        raise HTTPException(status_code=503, detail="Analysis output could not be saved. Check database availability.") from exc
    except Exception as exc:
        logger.error("Unexpected Analysis Agent failure: %s", type(exc).__name__)
        try:
            analysis_record = analysis_service.fail(session, analysis_record, "analysis_unexpected_error")
        except SQLAlchemyError as db_exc:
            logger.error("Unable to persist unexpected analysis failure")
            raise HTTPException(status_code=503, detail="Analysis failed and its final status could not be saved.") from db_exc
    return to_analysis_response(research_id, analysis_record)


@router.get("/research/{research_id}/analysis", response_model=AnalysisResponse)
def get_saved_analysis(research_id: str, session: Session = Depends(get_db)) -> AnalysisResponse:
    try:
        parsed_id = UUID(research_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Research ID must be a valid UUID.") from exc
    try:
        service.get_research(session, research_id)
    except ResearchNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Research request was not found.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to load research before analysis retrieval")
        raise HTTPException(status_code=503, detail="Research storage is unavailable.") from exc
    try:
        analysis_record = analysis_service.get(session, parsed_id)
    except SQLAlchemyError as exc:
        logger.error("Unable to retrieve saved analysis")
        raise HTTPException(status_code=503, detail="Analysis storage is unavailable.") from exc
    try:
        return to_analysis_response(research_id, analysis_record)
    except ValidationError as exc:
        raise HTTPException(status_code=409, detail="The saved Analysis Agent result is invalid and cannot be returned.") from exc


@router.post("/research/{research_id}/evaluation", response_model=EvaluationResponse)
def start_evaluation(
    research_id: str,
    session: Session = Depends(get_db),
    agent: EvaluationAgent = Depends(get_evaluation_agent),
) -> EvaluationResponse:
    try:
        parsed_id = UUID(research_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Research ID must be a valid UUID.") from exc
    try:
        research = service.get_research(session, research_id)
    except ResearchNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Research request was not found.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to load research for evaluation")
        raise HTTPException(status_code=503, detail="Research storage is unavailable.") from exc
    if research.status != "completed" or not research.ai_response:
        raise HTTPException(status_code=409, detail="A completed Research Agent answer is required before evaluation.")

    try:
        analysis_record = analysis_service.get(session, parsed_id)
    except SQLAlchemyError as exc:
        logger.error("Unable to load saved analysis for evaluation")
        raise HTTPException(status_code=503, detail="Analysis storage is unavailable.") from exc
    if analysis_record is None or analysis_record.status != "completed" or not analysis_record.analysis_data:
        raise HTTPException(status_code=409, detail="A completed, saved Analysis Agent result is required before evaluation.")
    try:
        analysis = AnalysisContent.model_validate(analysis_record.analysis_data)
    except (ValidationError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=409, detail="The saved Analysis Agent result is invalid and cannot be evaluated.") from exc

    try:
        evaluation_record, should_run = evaluation_service.start(session, parsed_id)
    except SQLAlchemyError as exc:
        logger.error("Unable to start evaluation record")
        raise HTTPException(status_code=503, detail="Evaluation status could not be saved. Check database availability.") from exc
    if not should_run:
        try:
            return to_evaluation_response(research_id, evaluation_record)
        except ValidationError as exc:
            raise HTTPException(status_code=409, detail="The saved Evaluation Agent result is invalid and cannot be returned.") from exc

    try:
        content = agent.evaluate(research, analysis)
        evaluation_record = evaluation_service.complete(session, evaluation_record, content.model_dump())
    except EvaluationAgentError as exc:
        logger.warning("Evaluation Agent stopped with safe error code %s", exc.error_code)
        try:
            evaluation_record = evaluation_service.fail(session, evaluation_record, exc.error_code)
        except SQLAlchemyError as db_exc:
            logger.error("Unable to persist failed evaluation status")
            raise HTTPException(status_code=503, detail="Evaluation failed and its final status could not be saved.") from db_exc
    except SQLAlchemyError as exc:
        logger.error("Unable to persist evaluation output")
        raise HTTPException(status_code=503, detail="Evaluation output could not be saved. Check database availability.") from exc
    except Exception as exc:
        logger.error("Unexpected Evaluation Agent failure: %s", type(exc).__name__)
        try:
            evaluation_record = evaluation_service.fail(session, evaluation_record, "evaluation_unexpected_error")
        except SQLAlchemyError as db_exc:
            logger.error("Unable to persist unexpected evaluation failure")
            raise HTTPException(status_code=503, detail="Evaluation failed and its final status could not be saved.") from db_exc
    return to_evaluation_response(research_id, evaluation_record)


@router.get("/research/{research_id}/evaluation", response_model=EvaluationResponse)
def get_saved_evaluation(research_id: str, session: Session = Depends(get_db)) -> EvaluationResponse:
    try:
        parsed_id = UUID(research_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Research ID must be a valid UUID.") from exc
    try:
        service.get_research(session, research_id)
    except ResearchNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Research request was not found.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to load research before evaluation retrieval")
        raise HTTPException(status_code=503, detail="Research storage is unavailable.") from exc
    try:
        evaluation_record = evaluation_service.get(session, parsed_id)
    except SQLAlchemyError as exc:
        logger.error("Unable to retrieve saved evaluation")
        raise HTTPException(status_code=503, detail="Evaluation storage is unavailable.") from exc
    try:
        return to_evaluation_response(research_id, evaluation_record)
    except ValidationError as exc:
        raise HTTPException(status_code=409, detail="The saved Evaluation Agent result is invalid and cannot be returned.") from exc


@router.post("/research/{research_id}/decision-support", response_model=DecisionSupportResponse)
def start_decision_support(
    research_id: str,
    session: Session = Depends(get_db),
    agent: DecisionSupportAgent = Depends(get_decision_support_agent),
) -> DecisionSupportResponse:
    try:
        parsed_id = UUID(research_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Research ID must be a valid UUID.") from exc
    try:
        research = service.get_research(session, research_id)
    except ResearchNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Research request was not found.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to load research for decision support")
        raise HTTPException(status_code=503, detail="Research storage is unavailable.") from exc
    if research.status != "completed" or not research.ai_response:
        raise HTTPException(status_code=409, detail="A completed Research Agent answer is required before decision support.")

    try:
        analysis_record = analysis_service.get(session, parsed_id)
        evaluation_record = evaluation_service.get(session, parsed_id)
    except SQLAlchemyError as exc:
        logger.error("Unable to load saved analysis or evaluation for decision support")
        raise HTTPException(status_code=503, detail="Saved analysis/evaluation storage is unavailable.") from exc
    if analysis_record is None or analysis_record.status != "completed" or not analysis_record.analysis_data:
        raise HTTPException(status_code=409, detail="A completed, saved Analysis Agent result is required before decision support.")
    if evaluation_record is None or evaluation_record.status != "completed" or not evaluation_record.evaluation_data:
        raise HTTPException(status_code=409, detail="A completed, saved Evaluation Agent result is required before decision support.")
    try:
        analysis = AnalysisContent.model_validate(analysis_record.analysis_data)
        evaluation = EvaluationContent.model_validate(evaluation_record.evaluation_data)
    except (ValidationError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=409, detail="A saved Analysis Agent or Evaluation Agent result is invalid and cannot be used for decision support.") from exc

    try:
        decision_record, should_run = decision_support_service.start(session, parsed_id)
    except SQLAlchemyError as exc:
        logger.error("Unable to start decision-support record")
        raise HTTPException(status_code=503, detail="Decision-support status could not be saved. Check database availability.") from exc
    if not should_run:
        try:
            return to_decision_support_response(research_id, decision_record)
        except ValidationError as exc:
            raise HTTPException(status_code=409, detail="The saved decision-support result is invalid and cannot be returned.") from exc

    try:
        content = agent.generate(research, analysis, evaluation)
        decision_record = decision_support_service.complete(session, decision_record, content.model_dump())
    except DecisionSupportAgentError as exc:
        logger.warning("Decision Support Agent stopped with safe error code %s", exc.error_code)
        try:
            decision_record = decision_support_service.fail(session, decision_record, exc.error_code)
        except SQLAlchemyError as db_exc:
            logger.error("Unable to persist failed decision-support status")
            raise HTTPException(status_code=503, detail="Decision support failed and its final status could not be saved.") from db_exc
    except SQLAlchemyError as exc:
        logger.error("Unable to persist decision-support output")
        raise HTTPException(status_code=503, detail="Decision-support output could not be saved. Check database availability.") from exc
    except Exception as exc:
        logger.error("Unexpected Decision Support Agent failure: %s", type(exc).__name__)
        try:
            decision_record = decision_support_service.fail(session, decision_record, "decision_support_unexpected_error")
        except SQLAlchemyError as db_exc:
            logger.error("Unable to persist unexpected decision-support failure")
            raise HTTPException(status_code=503, detail="Decision support failed and its final status could not be saved.") from db_exc
    return to_decision_support_response(research_id, decision_record)


@router.get("/research/{research_id}/decision-support", response_model=DecisionSupportResponse)
def get_saved_decision_support(research_id: str, session: Session = Depends(get_db)) -> DecisionSupportResponse:
    try:
        parsed_id = UUID(research_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Research ID must be a valid UUID.") from exc
    try:
        service.get_research(session, research_id)
    except ResearchNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Research request was not found.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to load research before decision-support retrieval")
        raise HTTPException(status_code=503, detail="Research storage is unavailable.") from exc
    try:
        decision_record = decision_support_service.get(session, parsed_id)
        return to_decision_support_response(research_id, decision_record)
    except ValidationError as exc:
        raise HTTPException(status_code=409, detail="The saved decision-support result is invalid and cannot be returned.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to retrieve saved decision support")
        raise HTTPException(status_code=503, detail="Decision-support storage is unavailable.") from exc


@router.get("/research/{research_id}", response_model=ResearchResponse)
def research_status(research_id: str, session: Session = Depends(get_db)) -> ResearchResponse:
    try:
        UUID(research_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Research ID must be a valid UUID.") from exc
    try:
        record = service.get_research(session, research_id)
    except ResearchNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Research request was not found.") from exc
    except SQLAlchemyError as exc:
        logger.error("Unable to load research record")
        raise HTTPException(status_code=503, detail="Research storage is unavailable. Check the database connection and migrations.") from exc
    return to_response(record)
