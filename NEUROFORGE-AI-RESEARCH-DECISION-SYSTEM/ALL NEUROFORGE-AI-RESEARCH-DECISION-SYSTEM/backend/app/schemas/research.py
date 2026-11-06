from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt, field_validator, model_validator


class ResearchType(str, Enum):
    MARKET_RESEARCH = "Market research"
    COMPARATIVE_ANALYSIS = "Comparative analysis"
    DATA_EXPLORATION = "Data exploration"
    POLICY_QUESTION = "Policy question"


class ResearchCreate(BaseModel):
    question: str = Field(min_length=1, max_length=500, description="The research question or business problem.")
    research_type: ResearchType
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Question must contain text.")
        if len(cleaned) < 5:
            raise ValueError("Question must be at least 5 characters long.")
        return cleaned

    @field_validator("description")
    @classmethod
    def empty_description_becomes_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class ResearchSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source_id: str
    source_number: int
    title: str
    url: str
    snippet: str | None = None
    published_date: str | None = None
    retrieved_at: datetime
    used_in_answer: bool


class ResearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    research_id: str
    question: str
    research_type: ResearchType
    description: str | None = None
    status: str
    ai_response: str | None = None
    error_code: str | None = None
    evidence_status: str | None = None
    sources: list[ResearchSourceResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class HealthResponse(BaseModel):
    status: str
    message: str
    database: str


class AnalysisPoint(BaseModel):
    text: str = Field(min_length=1, max_length=1200)
    source_numbers: list[StrictInt] = Field(default_factory=list)


class AnalysisImplication(BaseModel):
    text: str = Field(min_length=1, max_length=1200)
    basis: Literal["evidence_based", "interpretation"]
    source_numbers: list[StrictInt] = Field(default_factory=list)


class AnalysisContent(BaseModel):
    key_findings: list[AnalysisPoint] = Field(default_factory=list)
    patterns_or_comparisons: list[AnalysisPoint] = Field(default_factory=list)
    implications: list[AnalysisImplication] = Field(default_factory=list)
    conflicting_information: list[AnalysisPoint] = Field(default_factory=list)
    evidence_gaps_and_limitations: list[str] = Field(default_factory=list)
    insufficient_evidence: bool


class AnalysisResponse(BaseModel):
    research_id: str
    status: str
    analysis: AnalysisContent | None = None
    error_code: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class EvaluationFinding(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    text: str = Field(min_length=1, max_length=1200)
    source_numbers: list[StrictInt] = Field(default_factory=list)


class EvaluationContent(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    overall_assessment: str = Field(min_length=1, max_length=1600)
    evidence_support: Literal["supported", "partially_supported", "unsupported", "insufficient_evidence"]
    consistency_findings: list[EvaluationFinding] = Field(default_factory=list)
    unsupported_claims: list[str] = Field(default_factory=list)
    evidence_gaps: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    suggested_improvements: list[str] = Field(default_factory=list)


class EvaluationResponse(BaseModel):
    research_id: str
    status: Literal["not_started", "processing", "completed", "failed"]
    evaluation: EvaluationContent | None = None
    error_code: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DecisionSourceQuote(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    source_id: str = Field(min_length=1, max_length=80)
    excerpt: str = Field(min_length=1, max_length=500)


class DecisionEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    text: str = Field(min_length=1, max_length=1200)
    source_quotes: list[DecisionSourceQuote] = Field(min_length=1, max_length=10)


class DecisionOption(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=1200)
    potential_benefits: list[DecisionEvidence] = Field(default_factory=list, max_length=8)
    risks_or_tradeoffs: list[DecisionEvidence] = Field(default_factory=list, max_length=8)
    supporting_evidence: list[DecisionEvidence] = Field(default_factory=list, max_length=8)
    assumptions_or_unknowns: list[str] = Field(default_factory=list, max_length=8)


class DecisionSupportContent(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    decision_question: str = Field(min_length=1, max_length=500)
    decision_summary: str = Field(min_length=1, max_length=1600)
    evidence_condition: Literal["sufficient", "weak", "conflicting", "insufficient"]
    options: list[DecisionOption] = Field(default_factory=list, max_length=5)
    comparison: str = Field(min_length=1, max_length=1600)
    recommended_next_step: str | None = Field(default=None, max_length=1200)
    confidence_label: Literal["high", "moderate", "low", "insufficient_evidence"]
    confidence_basis: str = Field(min_length=1, max_length=1200)
    limitations: list[str] = Field(default_factory=list, max_length=10)
    questions_to_resolve: list[str] = Field(default_factory=list, max_length=10)

    @model_validator(mode="after")
    def check_evidence_consistency(self):
        if self.evidence_condition == "sufficient" and len(self.options) < 2:
            raise ValueError("At least two options are required when saved evidence is sufficient.")
        if self.evidence_condition in {"weak", "conflicting", "insufficient"}:
            if self.recommended_next_step is not None:
                raise ValueError("A recommendation is not allowed when evidence is weak, conflicting, or insufficient.")
            if self.confidence_label == "high":
                raise ValueError("High confidence is inconsistent with weak, conflicting, or insufficient evidence.")
        if self.evidence_condition == "insufficient":
            if self.confidence_label != "insufficient_evidence":
                raise ValueError("Insufficient evidence requires the matching confidence label.")
            if self.options:
                raise ValueError("Decision options cannot be presented when saved evidence is insufficient.")
        if self.evidence_condition == "sufficient" and self.confidence_label == "insufficient_evidence":
            raise ValueError("Sufficient evidence cannot use the insufficient-evidence confidence label.")
        return self


class DecisionSupportResponse(BaseModel):
    research_id: str
    status: Literal["not_started", "processing", "completed", "failed"]
    decision_support: DecisionSupportContent | None = None
    error_code: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
