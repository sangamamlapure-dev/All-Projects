export interface ResearchSourceRecord {
  source_id: string
  source_number: number
  title: string
  url: string
  snippet: string | null
  published_date: string | null
  retrieved_at: string
  used_in_answer: boolean
}

export interface ResearchRecord {
  research_id: string
  question: string
  research_type: string
  description: string | null
  status: string
  ai_response: string | null
  error_code: string | null
  evidence_status: 'sufficient' | 'insufficient' | null
  sources: ResearchSourceRecord[]
  created_at: string
  updated_at: string
}

export interface AnalysisPoint {
  text: string
  source_numbers: number[]
}

export interface AnalysisImplication extends AnalysisPoint {
  basis: 'evidence_based' | 'interpretation'
}

export interface AnalysisContent {
  key_findings: AnalysisPoint[]
  patterns_or_comparisons: AnalysisPoint[]
  implications: AnalysisImplication[]
  conflicting_information: AnalysisPoint[]
  evidence_gaps_and_limitations: string[]
  insufficient_evidence: boolean
}

export interface AnalysisRecord {
  research_id: string
  status: 'not_started' | 'processing' | 'completed' | 'failed'
  analysis: AnalysisContent | null
  error_code: string | null
  created_at: string | null
  updated_at: string | null
}

export interface EvaluationFinding {
  text: string
  source_numbers: number[]
}

export interface EvaluationContent {
  overall_assessment: string
  evidence_support: 'supported' | 'partially_supported' | 'unsupported' | 'insufficient_evidence'
  consistency_findings: EvaluationFinding[]
  unsupported_claims: string[]
  evidence_gaps: string[]
  limitations: string[]
  suggested_improvements: string[]
}

export interface EvaluationRecord {
  research_id: string
  status: 'not_started' | 'processing' | 'completed' | 'failed'
  evaluation: EvaluationContent | null
  error_code: string | null
  created_at: string | null
  updated_at: string | null
}

export interface DecisionSupportEvidence {
  text: string
  source_quotes: DecisionSourceQuote[]
}

export interface DecisionSourceQuote {
  source_id: string
  excerpt: string
}

export interface DecisionSupportOption {
  name: string
  description: string
  potential_benefits: DecisionSupportEvidence[]
  risks_or_tradeoffs: DecisionSupportEvidence[]
  supporting_evidence: DecisionSupportEvidence[]
  assumptions_or_unknowns: string[]
}

export interface DecisionSupportContent {
  decision_question: string
  decision_summary: string
  evidence_condition: 'sufficient' | 'weak' | 'conflicting' | 'insufficient'
  options: DecisionSupportOption[]
  comparison: string
  recommended_next_step: string | null
  confidence_label: 'high' | 'moderate' | 'low' | 'insufficient_evidence'
  confidence_basis: string
  limitations: string[]
  questions_to_resolve: string[]
}

export interface DecisionSupportRecord {
  research_id: string
  status: 'not_started' | 'processing' | 'completed' | 'failed'
  decision_support: DecisionSupportContent | null
  error_code: string | null
  created_at: string | null
  updated_at: string | null
}

interface ErrorPayload {
  detail?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
      ...options,
    })
  } catch {
    throw new Error('The backend is unavailable. Start FastAPI on port 8000 and try again.')
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`
    try {
      const payload = (await response.json()) as ErrorPayload
      if (payload.detail) detail = payload.detail
    } catch {
      if (response.status === 502 || response.status === 503) {
        detail = 'The backend is unavailable. Start FastAPI on port 8000 and try again.'
      }
    }
    throw new Error(detail)
  }

  return response.json() as Promise<T>
}

export function createResearch(payload: { question: string; research_type: string; description?: string }) {
  return request<ResearchRecord>('/research', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getResearch(researchId: string) {
  return request<ResearchRecord>(`/research/${encodeURIComponent(researchId)}`)
}

export function getAnalysis(researchId: string) {
  return request<AnalysisRecord>(`/research/${encodeURIComponent(researchId)}/analysis`)
}

export function startAnalysis(researchId: string) {
  return request<AnalysisRecord>(`/research/${encodeURIComponent(researchId)}/analysis`, { method: 'POST' })
}

export function getEvaluation(researchId: string) {
  return request<EvaluationRecord>(`/research/${encodeURIComponent(researchId)}/evaluation`)
}

export function startEvaluation(researchId: string) {
  return request<EvaluationRecord>(`/research/${encodeURIComponent(researchId)}/evaluation`, { method: 'POST' })
}

export function getDecisionSupport(researchId: string) {
  return request<DecisionSupportRecord>(`/research/${encodeURIComponent(researchId)}/decision-support`)
}

export function startDecisionSupport(researchId: string) {
  return request<DecisionSupportRecord>(`/research/${encodeURIComponent(researchId)}/decision-support`, { method: 'POST' })
}

export function listResearch() {
  return request<ResearchRecord[]>('/research')
}
