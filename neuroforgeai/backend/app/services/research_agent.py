from sqlalchemy.orm import Session

from app.models import Research
from app.services.llm_service import GeneratedResearchAnswer, LLMServiceError, OpenAIResearchGenerator
from app.services.research_service import ResearchService
from app.services.source_retriever import RetrievedSource, SourceRetrievalError, TavilySearchRetriever


class ResearchAgentError(Exception):
    def __init__(self, error_code: str, user_message: str):
        super().__init__(user_message)
        self.error_code = error_code
        self.user_message = user_message


class ResearchAgent:
    """Retrieve real sources and produce a source-grounded answer for one saved request."""

    def __init__(self, retriever=None, generator=None, persistence: ResearchService | None = None):
        self.retriever = retriever or TavilySearchRetriever()
        self.generator = generator or OpenAIResearchGenerator()
        self.persistence = persistence or ResearchService()

    def run(self, session: Session, record: Research) -> Research:
        try:
            sources: list[RetrievedSource] = self.retriever.retrieve(record.question, record.description)
            if not sources:
                raise SourceRetrievalError("retrieval_no_results", "No usable sources were returned for this question. Try a more specific query.")
        except SourceRetrievalError as exc:
            self.persistence.set_failed(session, record, exc.error_code)
            raise ResearchAgentError(exc.error_code, exc.user_message) from exc

        # Commit provider-returned metadata before requesting the model so it remains saved
        # even if the model is unavailable or rejects the request.
        record = self.persistence.save_sources(session, record, sources)
        if not any(source.snippet and source.snippet.strip() for source in sources):
            result = GeneratedResearchAnswer(
                "Insufficient evidence: the search provider returned source links but no readable content snippets, so the question cannot be answered from retrieved material.",
                "insufficient",
                [],
            )
            return self.persistence.set_completed(
                session,
                record,
                result.answer,
                result.evidence_status,
                result.used_source_numbers,
            )
        try:
            result: GeneratedResearchAnswer = self.generator.generate(record.question, record.description, sources)
        except LLMServiceError as exc:
            self.persistence.set_failed(session, record, exc.error_code)
            raise ResearchAgentError(exc.error_code, exc.user_message) from exc

        return self.persistence.set_completed(
            session,
            record,
            result.answer,
            result.evidence_status,
            result.used_source_numbers,
        )
