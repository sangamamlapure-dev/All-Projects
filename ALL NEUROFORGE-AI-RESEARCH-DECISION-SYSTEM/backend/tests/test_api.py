import pytest
import httpx
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone
from threading import Barrier, local
from concurrent.futures import ThreadPoolExecutor
from uuid import UUID, uuid4
from sqlalchemy import create_engine, event
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.main import create_app
from app.models import Base, Research, ResearchAnalysis, ResearchDecisionSupport, ResearchEvaluation, ResearchSource
from app.routes.research import get_analysis_agent, get_decision_support_agent, get_evaluation_agent, get_research_agent
from app.schemas.research import AnalysisContent, AnalysisImplication, AnalysisPoint, DecisionEvidence, DecisionOption, DecisionSourceQuote, DecisionSupportContent, EvaluationContent, EvaluationFinding
from app.services.analysis_agent import AnalysisAgent, AnalysisAgentError
from app.services.analysis_service import AnalysisService
from app.services.agent_run_service import PROCESSING_STALE_AFTER
from app.services.decision_support_agent import DecisionSupportAgent, DecisionSupportAgentError, OpenAIDecisionSupportGenerator
from app.services.decision_support_service import DecisionSupportService
from app.services.evaluation_agent import EvaluationAgent, EvaluationAgentError, OpenAIEvaluationGenerator
from app.services.evaluation_service import EvaluationService
from app.services.llm_service import GeneratedResearchAnswer, LLMServiceError, OpenAIResearchGenerator
from app.services.research_agent import ResearchAgent
from app.services.research_service import ResearchService
from app.services.source_retriever import RetrievedSource, SourceRetrievalError, TavilySearchRetriever


DEFAULT_SOURCES = [
    RetrievedSource("Public transit study", "https://example.org/transit", "Transit access affects commute choices.", "2025-01-15"),
    RetrievedSource("City transport report", "https://city.example.gov/report", "A city report about transit planning.", None),
]


class StubRetriever:
    def __init__(self, sources=None, error=None):
        self.sources = list(sources if sources is not None else DEFAULT_SOURCES)
        self.error = error
        self.calls = 0

    def retrieve(self, question, description=None):
        self.calls += 1
        if self.error:
            raise self.error
        return self.sources


class StubGenerator:
    def __init__(self, result=None, error=None):
        self.result = result or GeneratedResearchAnswer(
            "Summary\nRetrieved evidence indicates transit access affects commuting. [1]\n\nKey points\n- The cited source discusses access. [1]",
            "sufficient",
            [1],
        )
        self.error = error
        self.calls = 0

    def generate(self, question, description, sources):
        self.calls += 1
        if self.error:
            raise self.error
        return self.result


class StubAnalysisGenerator:
    def __init__(self, result=None, error=None):
        self.result = result or AnalysisContent(
            key_findings=[AnalysisPoint(text="The saved evidence links transit access with commute choices.", source_numbers=[1])],
            patterns_or_comparisons=[AnalysisPoint(text="Both sources discuss urban transport, but at different levels.", source_numbers=[1, 2])],
            implications=[AnalysisImplication(text="Decision-makers may need to consider both traveler access and city planning.", basis="interpretation", source_numbers=[1, 2])],
            conflicting_information=[],
            evidence_gaps_and_limitations=["The saved snippets do not provide a city-by-city comparison."],
            insufficient_evidence=False,
        )
        self.error = error
        self.calls = 0

    def generate(self, research):
        self.calls += 1
        if self.error:
            raise self.error
        return self.result


class StubEvaluationGenerator:
    def __init__(self, result=None, error=None):
        self.result = result or EvaluationContent(
            overall_assessment="The answer is partially supported by the saved snippets; the analysis identifies one useful gap.",
            evidence_support="partially_supported",
            consistency_findings=[EvaluationFinding(text="The analysis notes a missing city-by-city comparison, consistent with the limited snippets.", source_numbers=[1, 2])],
            unsupported_claims=["The saved snippets do not support a city-wide ridership increase claim."],
            evidence_gaps=["The snippets do not provide comparable ridership measurements."],
            limitations=["This evaluation uses saved snippets only and does not verify the original sources."],
            suggested_improvements=["Collect comparable local ridership data before making a city-wide claim."],
        )
        self.error = error
        self.calls = 0

    def generate(self, research, analysis):
        self.calls += 1
        if self.error:
            raise self.error
        return self.result


class StubDecisionSupportGenerator:
    def __init__(self, result=None, error=None):
        self.result = result
        self.error = error
        self.calls = 0

    def generate(self, research, analysis, evaluation):
        self.calls += 1
        if self.error:
            raise self.error
        if self.result is not None:
            return self.result
        first_source = research.sources[0]
        second_source = research.sources[-1]
        first_quote = [DecisionSourceQuote(source_id=str(first_source.id), excerpt=first_source.snippet)]
        second_quote = [DecisionSourceQuote(source_id=str(second_source.id), excerpt=second_source.snippet)]
        return DecisionSupportContent(
            decision_question=research.question,
            decision_summary="The saved snippets support comparing a targeted service change with keeping current service while collecting more local data.",
            evidence_condition="sufficient",
            options=[
                DecisionOption(
                    name="Pilot a targeted service change",
                    description="Run a small, reviewable pilot before considering broader changes.",
                    potential_benefits=[DecisionEvidence(text="A pilot can test whether access-related changes matter in this setting.", source_quotes=first_quote)],
                    risks_or_tradeoffs=[DecisionEvidence(text="The saved records do not estimate operating costs; those remain uncertain.", source_quotes=second_quote)],
                    supporting_evidence=[DecisionEvidence(text="A saved snippet links transit access with commute choices.", source_quotes=first_quote)],
                    assumptions_or_unknowns=["Local implementation costs and likely uptake are not established by these snippets."],
                ),
                DecisionOption(
                    name="Maintain current service and collect comparable data",
                    description="Keep current arrangements while gathering local measures relevant to the question.",
                    potential_benefits=[DecisionEvidence(text="The saved analysis identifies a lack of city-by-city comparison.", source_quotes=second_quote)],
                    risks_or_tradeoffs=[],
                    supporting_evidence=[DecisionEvidence(text="The saved analysis records a gap in comparable local data.", source_quotes=second_quote)],
                    assumptions_or_unknowns=["The time and effort needed to gather comparable data are unknown."],
                ),
            ],
            comparison="The pilot may test a targeted change; data collection may reduce uncertainty before a service change.",
            recommended_next_step="Compare the pilot's cost and evaluation plan with the value of collecting local baseline data before selecting an option.",
            confidence_label="moderate",
            confidence_basis="The saved snippets inform the access question but do not quantify local effects or costs.",
            limitations=["This decision aid relies only on saved snippets and prior saved agent outputs; sources were not independently verified."],
            questions_to_resolve=["What local cost and ridership measures are available?", "What outcomes would define a useful pilot?"],
        )


@pytest.fixture
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)

    def override_get_db():
        with factory() as session:
            yield session

    app = create_app()
    retriever = StubRetriever()
    generator = StubGenerator()
    analysis_generator = StubAnalysisGenerator()
    evaluation_generator = StubEvaluationGenerator()
    decision_support_generator = StubDecisionSupportGenerator()
    app.state.test_retriever = retriever
    app.state.test_generator = generator
    app.state.test_analysis_generator = analysis_generator
    app.state.test_evaluation_generator = evaluation_generator
    app.state.test_decision_support_generator = decision_support_generator
    app.state.test_factory = factory
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_research_agent] = lambda: ResearchAgent(retriever, generator, ResearchService())
    app.dependency_overrides[get_analysis_agent] = lambda: AnalysisAgent(analysis_generator)
    app.dependency_overrides[get_evaluation_agent] = lambda: EvaluationAgent(evaluation_generator)
    app.dependency_overrides[get_decision_support_agent] = lambda: DecisionSupportAgent(decision_support_generator)
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


def replace_agent(client, retriever, generator):
    client.app.dependency_overrides[get_research_agent] = lambda: ResearchAgent(retriever, generator, ResearchService())


def replace_analysis_agent(client, generator):
    client.app.dependency_overrides[get_analysis_agent] = lambda: AnalysisAgent(generator)


def replace_evaluation_agent(client, generator):
    client.app.dependency_overrides[get_evaluation_agent] = lambda: EvaluationAgent(generator)


def replace_decision_support_agent(client, generator):
    client.app.dependency_overrides[get_decision_support_agent] = lambda: DecisionSupportAgent(generator)


def submit(client, question="How can cities improve access to public transit?"):
    return client.post("/api/research", json={"question": question, "research_type": "Policy question", "description": "Focus on urban commuters."})


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database"] in {"ok", "unavailable", "not_configured"}


def test_cors_allows_local_frontend_without_credentials_or_arbitrary_headers(client):
    allowed = client.options("/api/health", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type",
    })
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-credentials" not in allowed.headers
    assert "content-type" in allowed.headers["access-control-allow-headers"].lower()

    denied = client.options("/api/health", headers={
        "Origin": "https://untrusted.example",
        "Access-Control-Request-Method": "GET",
    })
    assert denied.status_code == 400
    assert "access-control-allow-origin" not in denied.headers


def test_invalid_database_url_returns_safe_configuration_status(client, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "mysql://private-user:private-password@db.invalid/private")
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["database"] == "unavailable"

    override = client.app.dependency_overrides.pop(get_db)
    try:
        response = client.get("/api/research")
    finally:
        client.app.dependency_overrides[get_db] = override
    assert response.status_code == 503
    assert "DATABASE_URL is invalid" in response.json()["detail"]
    assert "private-password" not in response.text


def test_unhandled_error_response_and_log_do_not_expose_private_exception(caplog):
    app = create_app()

    @app.get("/api/test-private-error")
    def raise_private_error():
        raise RuntimeError("private patient or customer details")

    with caplog.at_level("ERROR", logger="app.main"):
        with TestClient(app, raise_server_exceptions=False) as test_client:
            response = test_client.get("/api/test-private-error")
    assert response.status_code == 500
    assert "private patient or customer details" not in response.text
    assert "private patient or customer details" not in caplog.text


def test_sqlite_test_database_rejects_orphan_source_and_cascades_saved_results(client):
    with client.app.state.test_factory() as session:
        session.add(ResearchSource(
            research_id=uuid4(), source_number=1, title="Orphan", url="https://example.org/orphan", snippet="No parent."
        ))
        with pytest.raises(IntegrityError):
            session.commit()
        session.rollback()

    created = submit(client).json()
    research_id = UUID(created["research_id"])
    with client.app.state.test_factory() as session:
        session.add_all([
            ResearchAnalysis(research_id=research_id, status="failed", error_code="test"),
            ResearchEvaluation(research_id=research_id, status="failed", error_code="test"),
            ResearchDecisionSupport(research_id=research_id, status="failed", error_code="test"),
        ])
        session.commit()
        row = session.get(Research, research_id)
        session.delete(row)
        session.commit()
        assert session.query(ResearchSource).filter_by(research_id=research_id).count() == 0
        assert session.query(ResearchAnalysis).filter_by(research_id=research_id).count() == 0
        assert session.query(ResearchEvaluation).filter_by(research_id=research_id).count() == 0
        assert session.query(ResearchDecisionSupport).filter_by(research_id=research_id).count() == 0


def test_successful_submission_saves_answer_and_verified_source_metadata(client):
    response = submit(client)
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "completed"
    assert body["evidence_status"] == "sufficient"
    assert "[1]" in body["ai_response"]
    assert body["sources"] == [
        {"source_id": body["sources"][0]["source_id"], "source_number": 1, "title": "Public transit study", "url": "https://example.org/transit", "snippet": "Transit access affects commute choices.", "published_date": "2025-01-15", "retrieved_at": body["sources"][0]["retrieved_at"], "used_in_answer": True},
        {"source_id": body["sources"][1]["source_id"], "source_number": 2, "title": "City transport report", "url": "https://city.example.gov/report", "snippet": "A city report about transit planning.", "published_date": None, "retrieved_at": body["sources"][1]["retrieved_at"], "used_in_answer": False},
    ]
    assert client.app.state.test_retriever.calls == 1
    assert client.app.state.test_generator.calls == 1


def test_history_and_detail_return_saved_sources_without_new_external_calls(client):
    created = submit(client).json()
    calls_before = (client.app.state.test_retriever.calls, client.app.state.test_generator.calls)
    detail = client.get(f"/api/research/{created['research_id']}")
    history = client.get("/api/research")
    assert detail.status_code == 200
    assert detail.json()["sources"][0]["url"] == "https://example.org/transit"
    assert history.json()[0]["ai_response"] == created["ai_response"]
    assert (client.app.state.test_retriever.calls, client.app.state.test_generator.calls) == calls_before


def test_only_urls_returned_by_retriever_are_exposed(client):
    created = submit(client).json()
    returned_urls = {source["url"] for source in created["sources"]}
    assert returned_urls == {source.url for source in DEFAULT_SOURCES}
    assert "https://invented.example/" not in created["ai_response"]


def test_retrieval_failure_has_no_fabricated_sources_or_answer(client):
    retriever = StubRetriever(error=SourceRetrievalError("retrieval_timeout", "Source search timed out. Please try again later."))
    generator = StubGenerator()
    replace_agent(client, retriever, generator)
    response = submit(client)
    body = response.json()
    assert response.status_code == 201
    assert body["status"] == "failed"
    assert body["error_code"] == "retrieval_timeout"
    assert body["sources"] == []
    assert body["ai_response"] is None
    assert generator.calls == 0


def test_missing_tavily_key_returns_clear_failure_without_search(monkeypatch, client):
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)
    replace_agent(client, TavilySearchRetriever(), StubGenerator())
    response = submit(client)
    assert response.json()["status"] == "failed"
    assert response.json()["error_code"] == "retrieval_not_configured"
    assert response.json()["sources"] == []


def test_missing_openai_key_keeps_real_sources_but_saves_failure(monkeypatch, client):
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    replace_agent(client, StubRetriever(), OpenAIResearchGenerator())
    response = submit(client)
    body = response.json()
    assert body["status"] == "failed"
    assert body["error_code"] == "llm_not_configured"
    assert len(body["sources"]) == 2
    assert all(source["used_in_answer"] is False for source in body["sources"])
    assert body["ai_response"] is None


def test_insufficient_evidence_is_saved_and_reported(client):
    generator = StubGenerator(GeneratedResearchAnswer(
        "Summary\nThe retrieved source evidence is insufficient to answer this confidently.\n\nEvidence status\nInsufficient evidence from the retrieved sources to answer confidently.",
        "insufficient",
        [],
    ))
    replace_agent(client, StubRetriever(), generator)
    body = submit(client).json()
    assert body["status"] == "completed"
    assert body["evidence_status"] == "insufficient"
    assert "insufficient" in body["ai_response"].lower()
    assert all(source["used_in_answer"] is False for source in body["sources"])


def test_no_source_snippets_produce_insufficient_evidence_without_llm_call(client):
    retriever = StubRetriever([RetrievedSource("Source without snippet", "https://example.org/no-text", None)])
    generator = StubGenerator()
    replace_agent(client, retriever, generator)
    body = submit(client).json()
    assert body["status"] == "completed"
    assert body["evidence_status"] == "insufficient"
    assert "no readable content snippets" in body["ai_response"]
    assert body["sources"][0]["used_in_answer"] is False
    assert generator.calls == 0


def test_model_source_number_validation_rejects_unreturned_references():
    assert OpenAIResearchGenerator._valid_source_numbers([1, 2, 99, 0, -1, True, "2"], 2) == [1, 2]


def test_llm_timeout_preserves_sources_and_does_not_claim_success(client):
    generator = StubGenerator(error=LLMServiceError("llm_timeout", "AI generation timed out. Please try again later."))
    replace_agent(client, StubRetriever(), generator)
    body = submit(client).json()
    assert body["status"] == "failed"
    assert body["error_code"] == "llm_timeout"
    assert body["ai_response"] is None
    assert len(body["sources"]) == 2


def test_tavily_client_maps_fields_and_deduplicates_returned_urls(monkeypatch):
    monkeypatch.setenv("TAVILY_API_KEY", "test-tavily-key")

    class FakeResponse:
        status_code = 200
        def raise_for_status(self):
            pass
        def json(self):
            return {"results": [
                {"title": "Title 1", "url": "https://example.org/a#fragment", "content": "Snippet 1", "published_date": "2025-03-01"},
                {"title": "Duplicate", "url": "https://example.org/a", "content": "Duplicate snippet"},
                {"title": "Invalid URL", "url": "javascript:alert(1)", "content": "ignore"},
            ]}

    class FakeClient:
        def __init__(self, timeout):
            assert timeout == 20.0
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def post(self, url, headers, json):
            assert url == "https://api.tavily.com/search"
            assert headers["Authorization"] == "Bearer test-tavily-key"
            assert json["max_results"] == 5 and json["include_answer"] is False
            return FakeResponse()

    monkeypatch.setattr("app.services.source_retriever.httpx.Client", FakeClient)
    sources = TavilySearchRetriever().retrieve("test question")
    assert len(sources) == 1
    assert sources[0].url == "https://example.org/a"
    assert sources[0].published_date == "2025-03-01"


def test_tavily_timeout_is_translated_without_raw_provider_error(monkeypatch):
    monkeypatch.setenv("TAVILY_API_KEY", "test-tavily-key")

    class TimeoutClient:
        def __init__(self, timeout):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def post(self, *args, **kwargs):
            raise httpx.ReadTimeout("private timeout details")

    monkeypatch.setattr("app.services.source_retriever.httpx.Client", TimeoutClient)
    with pytest.raises(SourceRetrievalError) as error:
        TavilySearchRetriever().retrieve("test question")
    assert error.value.error_code == "retrieval_timeout"
    assert "private timeout details" not in str(error.value)


def test_invalid_or_blank_question_is_rejected(client):
    for question in ["", "   ", "no"]:
        response = client.post("/api/research", json={"question": question, "research_type": "Market research"})
        assert response.status_code == 422


def test_unknown_record_returns_404_and_invalid_uuid_returns_400(client):
    assert client.get("/api/research/00000000-0000-0000-0000-000000000000").status_code == 404
    assert client.get("/api/research/not-a-uuid").status_code == 400


def test_history_pagination(client):
    submit(client, "What makes a good study space?")
    submit(client, "How do students commute?")
    result = client.get("/api/research?limit=1")
    assert result.status_code == 200
    assert len(result.json()) == 1


def test_database_errors_return_safe_service_unavailable(client, monkeypatch, caplog):
    from app.routes import research as route_module

    def fail(*args, **kwargs):
        raise OperationalError("INSERT", {}, Exception("private diagnostic detail"))

    monkeypatch.setattr(route_module.service, "create_research", fail)
    response = submit(client)
    assert response.status_code == 503
    assert "private diagnostic detail" not in response.text
    assert "private diagnostic detail" not in caplog.text


def test_analysis_requires_saved_research_answer_and_sources(client):
    created = submit(client).json()
    with client.app.state.test_factory() as session:
        row = session.get(Research, UUID(created["research_id"]))
        row.status = "failed"
        row.ai_response = None
        session.commit()
    response = client.post(f"/api/research/{created['research_id']}/analysis")
    assert response.status_code == 409
    assert "saved sources" in response.json()["detail"]
    assert client.app.state.test_analysis_generator.calls == 0


def test_unknown_and_invalid_research_ids_for_analysis(client):
    assert client.post("/api/research/not-a-uuid/analysis").status_code == 400
    assert client.post("/api/research/00000000-0000-0000-0000-000000000000/analysis").status_code == 404
    assert client.get("/api/research/00000000-0000-0000-0000-000000000000/analysis").status_code == 404


def test_successful_analysis_is_saved_and_read_without_rerunning_any_agent(client):
    created = submit(client).json()
    counts_before_analysis = (client.app.state.test_retriever.calls, client.app.state.test_generator.calls)
    response = client.post(f"/api/research/{created['research_id']}/analysis")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["analysis"]["key_findings"][0]["source_numbers"] == [1]
    assert body["analysis"]["patterns_or_comparisons"][0]["source_numbers"] == [1, 2]
    assert body["analysis"]["implications"][0]["basis"] == "interpretation"
    assert client.app.state.test_analysis_generator.calls == 1

    counts_after_analysis = (client.app.state.test_retriever.calls, client.app.state.test_generator.calls)
    saved = client.get(f"/api/research/{created['research_id']}/analysis")
    research_detail = client.get(f"/api/research/{created['research_id']}")
    repeated = client.post(f"/api/research/{created['research_id']}/analysis")
    assert saved.status_code == 200 and saved.json()["analysis"] == body["analysis"]
    assert research_detail.json()["ai_response"] == created["ai_response"]
    assert repeated.json()["analysis"] == body["analysis"]
    assert client.app.state.test_analysis_generator.calls == 1
    assert counts_before_analysis == counts_after_analysis
    assert (client.app.state.test_retriever.calls, client.app.state.test_generator.calls) == counts_after_analysis


def test_analysis_without_supported_evidence_is_marked_insufficient(client):
    created = submit(client).json()
    result = AnalysisContent(
        key_findings=[], patterns_or_comparisons=[], implications=[], conflicting_information=[],
        evidence_gaps_and_limitations=["The saved snippets do not provide enough detail for comparison."],
        insufficient_evidence=True,
    )
    replace_analysis_agent(client, StubAnalysisGenerator(result=result))
    body = client.post(f"/api/research/{created['research_id']}/analysis").json()
    assert body["status"] == "completed"
    assert body["analysis"]["insufficient_evidence"] is True
    assert body["analysis"]["key_findings"] == []
    assert body["analysis"]["evidence_gaps_and_limitations"]


def test_analysis_drops_unreturned_citations_and_unlinked_claims(client):
    created = submit(client).json()
    result = AnalysisContent(
        key_findings=[AnalysisPoint(text="Invented finding [99] https://invented.example/path", source_numbers=[99])],
        patterns_or_comparisons=[], implications=[], conflicting_information=[],
        evidence_gaps_and_limitations=[], insufficient_evidence=False,
    )
    replace_analysis_agent(client, StubAnalysisGenerator(result=result))
    body = client.post(f"/api/research/{created['research_id']}/analysis").json()
    assert body["analysis"]["key_findings"] == []
    assert body["analysis"]["insufficient_evidence"] is True
    assert "invented.example" not in str(body["analysis"])
    assert "99" not in str(body["analysis"])


def test_analysis_model_timeout_saves_failure_without_erasing_research(client):
    created = submit(client).json()
    generator = StubAnalysisGenerator(error=AnalysisAgentError("analysis_timeout", "Analysis timed out."))
    replace_analysis_agent(client, generator)
    response = client.post(f"/api/research/{created['research_id']}/analysis")
    body = response.json()
    assert body["status"] == "failed"
    assert body["error_code"] == "analysis_timeout"
    assert body["analysis"] is None
    saved_research = client.get(f"/api/research/{created['research_id']}").json()
    assert saved_research["ai_response"] == created["ai_response"]
    assert saved_research["sources"] == created["sources"]


def test_analysis_get_before_explicit_start_is_read_only(client):
    created = submit(client).json()
    before = client.app.state.test_analysis_generator.calls
    status_response = client.get(f"/api/research/{created['research_id']}/analysis")
    assert status_response.json()["status"] == "not_started"
    assert status_response.json()["analysis"] is None
    assert client.app.state.test_analysis_generator.calls == before


@pytest.mark.parametrize("bad_data", [{"private": "invalid saved payload"}, None, {}])
def test_corrupt_saved_analysis_returns_safe_conflict_for_get_and_repeat_post(client, bad_data):
    created = submit(client).json()
    research_id = created["research_id"]
    client.post(f"/api/research/{research_id}/analysis")
    with client.app.state.test_factory() as session:
        row = session.query(ResearchAnalysis).filter_by(research_id=UUID(research_id)).first()
        row.analysis_data = bad_data
        session.commit()

    calls_before = client.app.state.test_analysis_generator.calls
    for response in (
        client.get(f"/api/research/{research_id}/analysis"),
        client.post(f"/api/research/{research_id}/analysis"),
    ):
        assert response.status_code == 409
        assert response.json()["detail"] == "The saved Analysis Agent result is invalid and cannot be returned."
        assert "invalid saved payload" not in response.text
    assert client.app.state.test_analysis_generator.calls == calls_before


# Stage 8: Evaluation Agent tests

def start_saved_analysis(client, research_id):
    response = client.post(f"/api/research/{research_id}/analysis")
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    return response.json()


def test_evaluation_requires_completed_saved_analysis(client):
    created = submit(client).json()
    missing_analysis = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert missing_analysis.status_code == 409
    assert "Analysis Agent" in missing_analysis.json()["detail"]
    assert client.app.state.test_evaluation_generator.calls == 0

    start_saved_analysis(client, created["research_id"])
    with client.app.state.test_factory() as session:
        row = session.get(Research, UUID(created["research_id"]))
        row.status = "failed"
        row.ai_response = None
        session.commit()
    missing_answer = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert missing_answer.status_code == 409
    assert "Research Agent" in missing_answer.json()["detail"]
    assert client.app.state.test_evaluation_generator.calls == 0


def test_unknown_or_invalid_research_ids_for_evaluation(client):
    assert client.post("/api/research/not-a-uuid/evaluation").status_code == 400
    assert client.get("/api/research/not-a-uuid/evaluation").status_code == 400
    assert client.post("/api/research/00000000-0000-0000-0000-000000000000/evaluation").status_code == 404
    assert client.get("/api/research/00000000-0000-0000-0000-000000000000/evaluation").status_code == 404


def test_successful_evaluation_is_saved_and_read_without_rerunning_agents(client):
    created = submit(client).json()
    start_saved_analysis(client, created["research_id"])
    counts_before = (client.app.state.test_retriever.calls, client.app.state.test_generator.calls)

    response = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["evaluation"]["evidence_support"] == "partially_supported"
    assert body["evaluation"]["consistency_findings"][0]["source_numbers"] == [1, 2]
    assert client.app.state.test_evaluation_generator.calls == 1

    saved = client.get(f"/api/research/{created['research_id']}/evaluation")
    detail = client.get(f"/api/research/{created['research_id']}")
    repeated = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert saved.status_code == 200 and saved.json()["evaluation"] == body["evaluation"]
    assert repeated.json()["evaluation"] == body["evaluation"]
    assert detail.json()["ai_response"] == created["ai_response"]
    assert client.app.state.test_evaluation_generator.calls == 1
    assert (client.app.state.test_retriever.calls, client.app.state.test_generator.calls) == counts_before


@pytest.mark.parametrize("bad_data", [{"private": "invalid saved evaluation"}, None, {}])
def test_corrupt_saved_evaluation_returns_safe_conflict_for_get_and_repeat_post(client, bad_data):
    created = submit(client).json()
    research_id = created["research_id"]
    start_saved_analysis(client, research_id)
    client.post(f"/api/research/{research_id}/evaluation")
    with client.app.state.test_factory() as session:
        row = session.query(ResearchEvaluation).filter_by(research_id=UUID(research_id)).first()
        row.evaluation_data = bad_data
        session.commit()

    calls_before = client.app.state.test_evaluation_generator.calls
    for response in (
        client.get(f"/api/research/{research_id}/evaluation"),
        client.post(f"/api/research/{research_id}/evaluation"),
    ):
        assert response.status_code == 409
        assert response.json()["detail"] == "The saved Evaluation Agent result is invalid and cannot be returned."
        assert "invalid saved evaluation" not in response.text
    assert client.app.state.test_evaluation_generator.calls == calls_before


def test_evaluation_get_before_explicit_start_is_read_only(client):
    created = submit(client).json()
    start_saved_analysis(client, created["research_id"])
    before = client.app.state.test_evaluation_generator.calls
    response = client.get(f"/api/research/{created['research_id']}/evaluation")
    assert response.status_code == 200
    assert response.json()["status"] == "not_started"
    assert response.json()["evaluation"] is None
    assert client.app.state.test_evaluation_generator.calls == before


def test_insufficient_or_conflicting_evidence_is_reported_as_evaluation_not_fact(client):
    created = submit(client).json()
    start_saved_analysis(client, created["research_id"])
    result = EvaluationContent(
        overall_assessment="The saved evidence is insufficient to resolve the conflicting claims.",
        evidence_support="insufficient_evidence",
        consistency_findings=[EvaluationFinding(text="The saved snippets describe different aspects and do not resolve the apparent conflict.", source_numbers=[1, 2])],
        unsupported_claims=[],
        evidence_gaps=["Comparable measurements are missing."],
        limitations=["The source material is limited to saved snippets."],
        suggested_improvements=["Gather directly comparable measurements from primary records."],
    )
    replace_evaluation_agent(client, StubEvaluationGenerator(result=result))
    response = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert response.json()["status"] == "completed"
    assert response.json()["evaluation"]["evidence_support"] == "insufficient_evidence"
    assert response.json()["evaluation"]["consistency_findings"]


def test_no_readable_source_snippets_return_insufficient_evidence_without_openai(monkeypatch, client):
    created = submit(client).json()
    start_saved_analysis(client, created["research_id"])
    with client.app.state.test_factory() as session:
        row = session.get(Research, UUID(created["research_id"]))
        for source in row.sources:
            source.snippet = None
        session.commit()
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    replace_evaluation_agent(client, OpenAIEvaluationGenerator())

    response = client.post(f"/api/research/{created['research_id']}/evaluation")
    body = response.json()
    assert body["status"] == "completed"
    assert body["evaluation"]["evidence_support"] == "insufficient_evidence"
    assert "cannot be checked" in body["evaluation"]["overall_assessment"]


def test_invalid_source_references_fail_safely_without_fabricating_citations(client):
    created = submit(client).json()
    start_saved_analysis(client, created["research_id"])
    invalid = EvaluationContent(
        overall_assessment="The evidence is only partially supportive.",
        evidence_support="partially_supported",
        consistency_findings=[EvaluationFinding(text="A made-up conflict [99] https://fake.example/conflict", source_numbers=[99])],
        unsupported_claims=[], evidence_gaps=[], limitations=[], suggested_improvements=[],
    )
    replace_evaluation_agent(client, StubEvaluationGenerator(result=invalid))
    response = client.post(f"/api/research/{created['research_id']}/evaluation")
    body = response.json()
    assert response.status_code == 200
    assert body["status"] == "failed"
    assert body["error_code"] == "evaluation_invalid_response"
    assert body["evaluation"] is None
    assert "fake.example" not in response.text


def test_evaluation_strips_model_supplied_citation_markers_and_urls(client):
    created = submit(client).json()
    start_saved_analysis(client, created["research_id"])
    result = EvaluationContent(
        overall_assessment="The answer is partly supported [1] https://invented.example/path.",
        evidence_support="partially_supported",
        consistency_findings=[EvaluationFinding(text="A saved snippet supports this narrow point [1].", source_numbers=[1])],
        unsupported_claims=["An unsupported claim [99] https://invented.example/claim"],
        evidence_gaps=[], limitations=[], suggested_improvements=[],
    )
    replace_evaluation_agent(client, StubEvaluationGenerator(result=result))
    body = client.post(f"/api/research/{created['research_id']}/evaluation").json()
    assert body["status"] == "completed"
    evaluation = body["evaluation"]
    assert "[1]" not in evaluation["overall_assessment"]
    assert "[1]" not in evaluation["consistency_findings"][0]["text"]
    assert "[99]" not in evaluation["unsupported_claims"][0]
    assert evaluation["consistency_findings"][0]["source_numbers"] == [1]
    assert "invented.example" not in str(evaluation)


def test_evaluation_failure_preserves_research_and_analysis_and_requires_explicit_retry(client):
    created = submit(client).json()
    analysis_body = start_saved_analysis(client, created["research_id"])
    failing = StubEvaluationGenerator(error=EvaluationAgentError("evaluation_timeout", "Evaluation timed out."))
    replace_evaluation_agent(client, failing)
    response = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert response.json()["status"] == "failed"
    assert response.json()["error_code"] == "evaluation_timeout"

    saved_before_retry = client.get(f"/api/research/{created['research_id']}/evaluation")
    assert saved_before_retry.json()["status"] == "failed"
    assert failing.calls == 1
    assert client.get(f"/api/research/{created['research_id']}").json()["ai_response"] == created["ai_response"]
    assert client.get(f"/api/research/{created['research_id']}/analysis").json()["analysis"] == analysis_body["analysis"]

    succeeding = StubEvaluationGenerator()
    replace_evaluation_agent(client, succeeding)
    # Reads do not retry; only this explicit POST starts a second model attempt.
    assert client.get(f"/api/research/{created['research_id']}/evaluation").json()["status"] == "failed"
    assert succeeding.calls == 0
    retried = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert retried.json()["status"] == "completed"
    assert succeeding.calls == 1


def test_evaluation_rejects_malformed_structured_output(client):
    created = submit(client).json()
    start_saved_analysis(client, created["research_id"])
    replace_evaluation_agent(client, StubEvaluationGenerator(result={"unexpected": "shape"}))
    response = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert response.json()["status"] == "failed"
    assert response.json()["error_code"] == "evaluation_invalid_response"
    assert response.json()["evaluation"] is None


# Stage 9: Decision Support Agent tests

def run_saved_prerequisites(client, research_id=None, evaluation_generator=None):
    created = submit(client).json() if research_id is None else None
    target_id = created["research_id"] if created else research_id
    analysis = client.post(f"/api/research/{target_id}/analysis")
    assert analysis.status_code == 200 and analysis.json()["status"] == "completed"
    if evaluation_generator is not None:
        replace_evaluation_agent(client, evaluation_generator)
    evaluation = client.post(f"/api/research/{target_id}/evaluation")
    assert evaluation.status_code == 200 and evaluation.json()["status"] == "completed"
    return created, target_id, analysis.json(), evaluation.json()


def test_decision_support_requires_completed_research_analysis_and_evaluation(client):
    created = submit(client).json()
    decision_url = f"/api/research/{created['research_id']}/decision-support"
    no_analysis = client.post(decision_url)
    assert no_analysis.status_code == 409
    assert "Analysis Agent" in no_analysis.json()["detail"]

    start_saved_analysis(client, created["research_id"])
    no_evaluation = client.post(decision_url)
    assert no_evaluation.status_code == 409
    assert "Evaluation Agent" in no_evaluation.json()["detail"]

    evaluation = client.post(f"/api/research/{created['research_id']}/evaluation")
    assert evaluation.json()["status"] == "completed"
    with client.app.state.test_factory() as session:
        row = session.get(Research, UUID(created["research_id"]))
        row.status = "failed"
        row.ai_response = None
        session.commit()
    no_research_answer = client.post(decision_url)
    assert no_research_answer.status_code == 409
    assert "Research Agent" in no_research_answer.json()["detail"]
    assert client.app.state.test_decision_support_generator.calls == 0


def test_unknown_or_invalid_research_ids_for_decision_support(client):
    assert client.post("/api/research/not-a-uuid/decision-support").status_code == 400
    assert client.get("/api/research/not-a-uuid/decision-support").status_code == 400
    unknown = "00000000-0000-0000-0000-000000000000"
    assert client.post(f"/api/research/{unknown}/decision-support").status_code == 404
    assert client.get(f"/api/research/{unknown}/decision-support").status_code == 404


def test_successful_decision_support_is_saved_and_read_without_rerunning_upstream_agents(client):
    created, research_id, analysis, evaluation = run_saved_prerequisites(client)
    counts_before = {
        "retriever": client.app.state.test_retriever.calls,
        "research": client.app.state.test_generator.calls,
        "analysis": client.app.state.test_analysis_generator.calls,
        "evaluation": client.app.state.test_evaluation_generator.calls,
    }
    response = client.post(f"/api/research/{research_id}/decision-support")
    assert response.status_code == 200
    body = response.json()
    result = body["decision_support"]
    assert body["status"] == "completed"
    assert len(result["options"]) >= 2
    assert result["decision_question"] == created["question"]
    assert result["recommended_next_step"]
    saved_source_ids = {source["source_id"] for source in created["sources"]}
    returned_source_ids = {
        source_id
        for option in result["options"]
        for group in (option["potential_benefits"], option["risks_or_tradeoffs"], option["supporting_evidence"])
        for evidence in group
        for quote in evidence["source_quotes"]
        for source_id in [quote["source_id"]]
    }
    assert returned_source_ids
    assert returned_source_ids <= saved_source_ids
    assert client.app.state.test_decision_support_generator.calls == 1

    saved = client.get(f"/api/research/{research_id}/decision-support")
    detail = client.get(f"/api/research/{research_id}")
    repeated = client.post(f"/api/research/{research_id}/decision-support")
    assert saved.status_code == 200 and saved.json()["decision_support"] == result
    assert repeated.json()["decision_support"] == result
    assert detail.json()["ai_response"] == created["ai_response"]
    assert client.get(f"/api/research/{research_id}/analysis").json()["analysis"] == analysis["analysis"]
    assert client.get(f"/api/research/{research_id}/evaluation").json()["evaluation"] == evaluation["evaluation"]
    assert client.app.state.test_decision_support_generator.calls == 1
    assert counts_before == {
        "retriever": client.app.state.test_retriever.calls,
        "research": client.app.state.test_generator.calls,
        "analysis": client.app.state.test_analysis_generator.calls,
        "evaluation": client.app.state.test_evaluation_generator.calls,
    }


def test_decision_support_get_before_explicit_start_is_read_only(client):
    _, research_id, _, _ = run_saved_prerequisites(client)
    before = client.app.state.test_decision_support_generator.calls
    response = client.get(f"/api/research/{research_id}/decision-support")
    assert response.status_code == 200
    assert response.json()["status"] == "not_started"
    assert response.json()["decision_support"] is None
    assert client.app.state.test_decision_support_generator.calls == before


def test_insufficient_saved_evidence_abstains_without_openai_call(monkeypatch, client):
    created, research_id, _, _ = run_saved_prerequisites(client)
    with client.app.state.test_factory() as session:
        row = session.get(Research, UUID(research_id))
        for source in row.sources:
            source.snippet = None
        session.commit()
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    replace_decision_support_agent(client, OpenAIDecisionSupportGenerator())

    response = client.post(f"/api/research/{research_id}/decision-support")
    body = response.json()
    assert body["status"] == "completed"
    assert body["decision_support"]["evidence_condition"] == "insufficient"
    assert body["decision_support"]["confidence_label"] == "insufficient_evidence"
    assert body["decision_support"]["options"] == []
    assert body["decision_support"]["recommended_next_step"] is None
    assert "not enough" in body["decision_support"]["comparison"].lower()


def test_saved_analysis_conflict_abstains_without_openai_call(monkeypatch, client):
    _, research_id, _, _ = run_saved_prerequisites(client)
    with client.app.state.test_factory() as session:
        row = session.query(ResearchAnalysis).filter(ResearchAnalysis.research_id == UUID(research_id)).first()
        saved = dict(row.analysis_data)
        saved["conflicting_information"] = [AnalysisPoint(text="Saved sources report incompatible outcomes.", source_numbers=[1, 2]).model_dump()]
        row.analysis_data = saved
        session.commit()
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    replace_decision_support_agent(client, OpenAIDecisionSupportGenerator())

    body = client.post(f"/api/research/{research_id}/decision-support").json()
    result = body["decision_support"]
    assert body["status"] == "completed"
    assert result["evidence_condition"] == "conflicting"
    assert result["options"] == []
    assert result["recommended_next_step"] is None
    assert result["confidence_label"] == "low"
    assert "conflicting signals" in result["decision_summary"]


def test_conflicting_evidence_produces_no_confident_recommendation(client):
    created, research_id, _, _ = run_saved_prerequisites(client)
    source_id = created["sources"][0]["source_id"]
    conflicting = DecisionSupportContent(
        decision_question=created["question"],
        decision_summary="The saved evidence does not resolve competing considerations.",
        evidence_condition="conflicting",
        options=[DecisionOption(name="Option A", description="A cautious alternative.", potential_benefits=[], risks_or_tradeoffs=[], supporting_evidence=[DecisionEvidence(text="One saved snippet describes access considerations.", source_quotes=[DecisionSourceQuote(source_id=source_id, excerpt=created["sources"][0]["snippet"])])], assumptions_or_unknowns=["Local effects remain unknown."])],
        comparison="The snippets do not allow a reliable comparison.",
        recommended_next_step=None,
        confidence_label="low",
        confidence_basis="The saved evaluation identifies unresolved evidence limits.",
        limitations=["The snippets do not directly compare the alternatives."],
        questions_to_resolve=["What local outcomes matter most?"]
    )
    replace_decision_support_agent(client, StubDecisionSupportGenerator(result=conflicting))
    result = client.post(f"/api/research/{research_id}/decision-support").json()["decision_support"]
    assert result["evidence_condition"] == "conflicting"
    assert result["recommended_next_step"] is None
    assert result["confidence_label"] == "low"


def test_malformed_decision_output_fails_without_presenting_success(client):
    _, research_id, _, _ = run_saved_prerequisites(client)
    replace_decision_support_agent(client, StubDecisionSupportGenerator(result={"unexpected": "shape"}))
    response = client.post(f"/api/research/{research_id}/decision-support")
    body = response.json()
    assert body["status"] == "failed"
    assert body["error_code"] == "decision_support_invalid_response"
    assert body["decision_support"] is None


def test_decision_support_rejects_unknown_source_ids(client):
    created, research_id, _, _ = run_saved_prerequisites(client)
    invalid = DecisionSupportContent(
        decision_question=created["question"], decision_summary="A comparison is possible.", evidence_condition="sufficient",
        options=[
            DecisionOption(name="Option A", description="First option.", supporting_evidence=[DecisionEvidence(text="This evidence is not saved.", source_quotes=[DecisionSourceQuote(source_id="00000000-0000-0000-0000-000000000001", excerpt="This evidence is not saved.")])]),
            DecisionOption(name="Option B", description="Second option.", supporting_evidence=[DecisionEvidence(text="This evidence is not saved.", source_quotes=[DecisionSourceQuote(source_id="00000000-0000-0000-0000-000000000001", excerpt="This evidence is not saved.")])]),
        ],
        comparison="Compare only saved material.", recommended_next_step="Review the saved source material.", confidence_label="moderate",
        confidence_basis="A source reference was required.", limitations=[], questions_to_resolve=[]
    )
    replace_decision_support_agent(client, StubDecisionSupportGenerator(result=invalid))
    response = client.post(f"/api/research/{research_id}/decision-support")
    assert response.json()["status"] == "failed"
    assert response.json()["error_code"] == "decision_support_invalid_response"
    assert "00000000-0000-0000-0000-000000000001" not in response.text


def test_decision_support_rejects_fabricated_quote_for_a_real_source_id(client):
    created, research_id, _, _ = run_saved_prerequisites(client)
    source_id = created["sources"][0]["source_id"]
    fabricated = DecisionSupportContent(
        decision_question=created["question"], decision_summary="A comparison is possible.", evidence_condition="sufficient",
        options=[
            DecisionOption(name="Option A", description="First option.", supporting_evidence=[DecisionEvidence(text="This claim is unsupported.", source_quotes=[DecisionSourceQuote(source_id=source_id, excerpt="This fabricated excerpt does not appear in the saved snippet.")])]),
            DecisionOption(name="Option B", description="Second option.", supporting_evidence=[DecisionEvidence(text="This other claim is unsupported.", source_quotes=[DecisionSourceQuote(source_id=source_id, excerpt="This fabricated excerpt does not appear in the saved snippet.")])]),
        ],
        comparison="Only verified saved evidence should be compared.", recommended_next_step="Review the saved material.", confidence_label="moderate",
        confidence_basis="A valid source ID is not enough without a matching excerpt.", limitations=[], questions_to_resolve=[]
    )
    replace_decision_support_agent(client, StubDecisionSupportGenerator(result=fabricated))
    response = client.post(f"/api/research/{research_id}/decision-support")
    assert response.json()["status"] == "failed"
    assert response.json()["error_code"] == "decision_support_invalid_response"
    assert "This fabricated excerpt" not in response.text


def test_decision_support_strips_model_supplied_urls_and_free_text_citations(client):
    created, research_id, _, _ = run_saved_prerequisites(client)
    source_id = created["sources"][0]["source_id"]
    result = DecisionSupportContent(
        decision_question=created["question"], decision_summary="Compare choices [1] https://fake.example/path.", evidence_condition="sufficient",
        options=[
            DecisionOption(name="Option A", description="First option.", supporting_evidence=[DecisionEvidence(text="A saved snippet supports this point [1] https://fake.example/a", source_quotes=[DecisionSourceQuote(source_id=source_id, excerpt=created["sources"][0]["snippet"])])]),
            DecisionOption(name="Option B", description="Second option.", supporting_evidence=[DecisionEvidence(text="Another saved point.", source_quotes=[DecisionSourceQuote(source_id=source_id, excerpt=created["sources"][0]["snippet"])])]),
        ],
        comparison="Two routes are available [1] from 00000000-0000-0000-0000-000000000002.", recommended_next_step="Review local data first.", confidence_label="moderate",
        confidence_basis="The evidence is limited [1].", limitations=[], questions_to_resolve=[]
    )
    replace_decision_support_agent(client, StubDecisionSupportGenerator(result=result))
    body = client.post(f"/api/research/{research_id}/decision-support").json()
    output = body["decision_support"]
    assert body["status"] == "completed"
    assert "[1]" not in output["decision_summary"]
    assert "[1]" not in output["options"][0]["supporting_evidence"][0]["text"]
    assert "fake.example" not in str(output)
    assert "00000000-0000-0000-0000-000000000002" not in str(output)
    assert output["options"][0]["supporting_evidence"][0]["source_quotes"][0]["source_id"] == source_id


def test_decision_support_timeout_preserves_prior_results_and_retries_only_explicitly(client):
    created, research_id, analysis, evaluation = run_saved_prerequisites(client)
    failing = StubDecisionSupportGenerator(error=DecisionSupportAgentError("decision_support_timeout", "Private provider timeout details"))
    replace_decision_support_agent(client, failing)
    response = client.post(f"/api/research/{research_id}/decision-support")
    assert response.json()["status"] == "failed"
    assert response.json()["error_code"] == "decision_support_timeout"
    assert "Private provider timeout details" not in response.text

    before = client.get(f"/api/research/{research_id}/decision-support")
    assert before.json()["status"] == "failed" and failing.calls == 1
    assert client.get(f"/api/research/{research_id}").json()["ai_response"] == created["ai_response"]
    assert client.get(f"/api/research/{research_id}/analysis").json()["analysis"] == analysis["analysis"]
    assert client.get(f"/api/research/{research_id}/evaluation").json()["evaluation"] == evaluation["evaluation"]

    succeeding = StubDecisionSupportGenerator()
    replace_decision_support_agent(client, succeeding)
    assert client.get(f"/api/research/{research_id}/decision-support").json()["status"] == "failed"
    assert succeeding.calls == 0
    retried = client.post(f"/api/research/{research_id}/decision-support")
    assert retried.json()["status"] == "completed"
    assert succeeding.calls == 1


@pytest.mark.parametrize("record_model,service_type", [
    (ResearchAnalysis, AnalysisService),
    (ResearchEvaluation, EvaluationService),
    (ResearchDecisionSupport, DecisionSupportService),
])
def test_concurrent_failed_agent_retries_are_claimed_by_only_one_request(tmp_path, record_model, service_type):
    engine = create_engine(f"sqlite:///{tmp_path / (record_model.__name__ + '.db')}", connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    research_id = uuid4()
    with factory() as session:
        session.add(Research(
            id=research_id, question="A saved research question", research_type="Policy question",
            status="completed", ai_response="Saved answer", evidence_status="sufficient",
        ))
        session.add(record_model(research_id=research_id, status="failed", error_code="test_failure"))
        session.commit()

    service = service_type()
    barrier = Barrier(2)
    thread_state = local()
    original_get = service.get

    def synchronized_get(session, record_id):
        record = original_get(session, record_id)
        if not getattr(thread_state, "waited", False):
            thread_state.waited = True
            barrier.wait(timeout=5)
        return record

    service.get = synchronized_get

    def retry():
        with factory() as session:
            _, should_run = service.start(session, research_id)
            return should_run

    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(lambda _index: retry(), range(2)))
    assert sum(results) == 1
    with factory() as session:
        record = session.query(record_model).filter_by(research_id=research_id).one()
        assert record.status == "processing"
    engine.dispose()


def test_stale_processing_run_is_recovered_only_by_explicit_post(client):
    _, research_id, _, _ = run_saved_prerequisites(client)
    stale_at = datetime.now(timezone.utc) - PROCESSING_STALE_AFTER - timedelta(seconds=1)
    with client.app.state.test_factory() as session:
        session.add(ResearchDecisionSupport(
            research_id=UUID(research_id), status="processing", updated_at=stale_at,
        ))
        session.commit()

    generator = client.app.state.test_decision_support_generator
    assert client.get(f"/api/research/{research_id}/decision-support").json()["status"] == "processing"
    assert generator.calls == 0
    response = client.post(f"/api/research/{research_id}/decision-support")
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert generator.calls == 1


def test_full_research_to_decision_support_workflow_survives_read_only_refresh(client):
    research = submit(client).json()
    research_id = research["research_id"]
    analysis = client.post(f"/api/research/{research_id}/analysis").json()
    evaluation = client.post(f"/api/research/{research_id}/evaluation").json()
    decision = client.post(f"/api/research/{research_id}/decision-support").json()
    assert research["status"] == analysis["status"] == evaluation["status"] == decision["status"] == "completed"

    calls_before_reads = (
        client.app.state.test_retriever.calls,
        client.app.state.test_generator.calls,
        client.app.state.test_analysis_generator.calls,
        client.app.state.test_evaluation_generator.calls,
        client.app.state.test_decision_support_generator.calls,
    )
    saved_research = client.get(f"/api/research/{research_id}").json()
    saved_analysis = client.get(f"/api/research/{research_id}/analysis").json()
    saved_evaluation = client.get(f"/api/research/{research_id}/evaluation").json()
    saved_decision = client.get(f"/api/research/{research_id}/decision-support").json()
    assert saved_research["ai_response"] == research["ai_response"]
    assert saved_analysis["analysis"] == analysis["analysis"]
    assert saved_evaluation["evaluation"] == evaluation["evaluation"]
    assert saved_decision["decision_support"] == decision["decision_support"]
    assert calls_before_reads == (
        client.app.state.test_retriever.calls,
        client.app.state.test_generator.calls,
        client.app.state.test_analysis_generator.calls,
        client.app.state.test_evaluation_generator.calls,
        client.app.state.test_decision_support_generator.calls,
    )


@pytest.mark.parametrize("bad_data", [{"private": "invalid saved decision"}, None, {}])
def test_corrupt_saved_decision_support_returns_safe_conflict(client, bad_data):
    _, research_id, _, _ = run_saved_prerequisites(client)
    client.post(f"/api/research/{research_id}/decision-support")
    with client.app.state.test_factory() as session:
        row = session.query(ResearchDecisionSupport).filter_by(research_id=UUID(research_id)).first()
        row.decision_support_data = bad_data
        session.commit()

    calls_before = client.app.state.test_decision_support_generator.calls
    for response in (
        client.get(f"/api/research/{research_id}/decision-support"),
        client.post(f"/api/research/{research_id}/decision-support"),
    ):
        assert response.status_code == 409
        assert response.json()["detail"] == "The saved decision-support result is invalid and cannot be returned."
        assert "invalid saved decision" not in response.text
    assert client.app.state.test_decision_support_generator.calls == calls_before
