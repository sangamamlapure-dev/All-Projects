import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, Brain, LoaderCircle, Play, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, DemoNotice, PageIntro } from '../components/ui/UI'
import { DecisionSupportCard } from '../components/DecisionSupportCard'
import {
  getAnalysis, getEvaluation, getResearch, startAnalysis, startEvaluation,
  type AnalysisRecord, type EvaluationContent, type EvaluationFinding, type EvaluationRecord, type ResearchRecord,
} from '../services/api'

const failureMessages: Record<string, string> = {
  retrieval_not_configured: 'Source search is not configured. Add TAVILY_API_KEY to backend/.env and restart FastAPI.',
  retrieval_authentication_error: 'The search provider rejected its API key. Check TAVILY_API_KEY in backend/.env.',
  retrieval_rate_limited: 'The search provider is rate-limiting requests. Please try again later.',
  retrieval_timeout: 'Source search timed out. The saved question can be retried later.',
  retrieval_connection_error: 'The search provider could not be reached.',
  retrieval_invalid_response: 'The search provider returned an invalid response.',
  retrieval_no_results: 'No usable sources were returned for this question.',
  retrieval_provider_error: 'The search provider could not complete the search.',
  llm_not_configured: 'AI is not configured. Add LLM_API_KEY to backend/.env and restart FastAPI.',
  llm_timeout: 'AI generation timed out. Retrieved sources remain saved.',
  llm_rate_limited: 'The AI provider is rate-limiting requests. Please try again later.',
  llm_authentication_error: 'The AI provider rejected its key. Check LLM_API_KEY in backend/.env.',
  llm_connection_error: 'The AI provider could not be reached.',
  llm_invalid_response: 'The AI provider returned an invalid answer.',
  llm_provider_error: 'The AI provider could not complete this request.',
  research_agent_error: 'The Research Agent could not complete this request.',
}

const analysisErrors: Record<string, string> = {
  analysis_llm_not_configured: 'AI analysis is not configured. Add LLM_API_KEY to backend/.env and restart FastAPI.',
  analysis_timeout: 'Analysis timed out. Your saved Research Agent answer and sources are unchanged; try again.',
  analysis_rate_limited: 'The AI provider is rate-limiting analysis requests. Please try again later.',
  analysis_authentication_error: 'The AI provider rejected its key. Check LLM_API_KEY in backend/.env.',
  analysis_connection_error: 'The AI provider could not be reached. Try again later.',
  analysis_provider_error: 'The AI provider could not complete the analysis. Try again later.',
  analysis_invalid_response: 'The AI provider returned an invalid analysis. Try again later.',
  analysis_unexpected_error: 'An unexpected error stopped analysis. The saved research remains available.',
}

const evaluationErrors: Record<string, string> = {
  evaluation_llm_not_configured: 'AI evaluation is not configured. Add LLM_API_KEY to backend/.env and restart FastAPI.',
  evaluation_timeout: 'Evaluation timed out. Your saved research and analysis remain unchanged; try again.',
  evaluation_rate_limited: 'The AI provider is rate-limiting evaluations. Please try again later.',
  evaluation_authentication_error: 'The AI provider rejected its key. Check LLM_API_KEY in backend/.env.',
  evaluation_connection_error: 'The AI provider could not be reached. Try again later.',
  evaluation_provider_error: 'The AI provider could not complete the evaluation. Try again later.',
  evaluation_invalid_response: 'The Evaluation Agent returned an invalid result or source reference. Try again later.',
  evaluation_research_unavailable: 'A completed saved Research Agent answer is required.',
  evaluation_unexpected_error: 'An unexpected error stopped evaluation. Your saved research and analysis remain available.',
}

export function ResearchDetailPage() {
  const { researchId = '' } = useParams()
  const [record, setRecord] = useState<ResearchRecord | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingAnalysis, setStartingAnalysis] = useState(false)
  const [startingEvaluation, setStartingEvaluation] = useState(false)
  const [error, setError] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const [evaluationError, setEvaluationError] = useState('')

  const loadSavedRecord = useCallback(async () => {
    const [savedResearch, savedAnalysis, savedEvaluation] = await Promise.all([
      getResearch(researchId), getAnalysis(researchId), getEvaluation(researchId),
    ])
    setRecord(savedResearch)
    setAnalysis(savedAnalysis)
    setEvaluation(savedEvaluation)
  }, [researchId])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([getResearch(researchId), getAnalysis(researchId), getEvaluation(researchId)])
      .then(([savedResearch, savedAnalysis, savedEvaluation]) => {
        if (active) {
          setRecord(savedResearch)
          setAnalysis(savedAnalysis)
          setEvaluation(savedEvaluation)
        }
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'This saved research record is unavailable.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [researchId])

  async function analyze() {
    setStartingAnalysis(true)
    setAnalysisError('')
    try { setAnalysis(await startAnalysis(researchId)) }
    catch (reason) { setAnalysisError(reason instanceof Error ? reason.message : 'The Analysis Agent could not be started.') }
    finally { setStartingAnalysis(false) }
  }

  async function evaluate() {
    setStartingEvaluation(true)
    setEvaluationError('')
    try { setEvaluation(await startEvaluation(researchId)) }
    catch (reason) { setEvaluationError(reason instanceof Error ? reason.message : 'The Evaluation Agent could not be started.') }
    finally { setStartingEvaluation(false) }
  }

  const statusTone = record?.status === 'completed' && record.evidence_status === 'sufficient' ? 'green' : record?.status === 'failed' || record?.evidence_status === 'insufficient' ? 'amber' : 'violet'
  const canAnalyze = record?.status === 'completed' && Boolean(record.ai_response) && record.sources.length > 0
  const canEvaluate = record?.status === 'completed' && Boolean(record.ai_response) && analysis?.status === 'completed' && Boolean(analysis.analysis)

  return <div>
    <PageIntro eyebrow="Saved research record" title={record?.question ?? 'Research details'} description="This page reads saved records only. Opening or refreshing it does not trigger a search or run an agent." action={<Link to="/dashboard"><Button variant="secondary"><ArrowLeft size={15} /> Back to dashboard</Button></Link>} />
    {loading && <Card><p className="text-sm text-slate-500">Loading saved record…</p></Card>}
    {!loading && error && <Card><div className="inline-notice inline-notice-error"><AlertCircle size={16} />{error}</div></Card>}
    {!loading && record && <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-2"><Badge tone={statusTone}>{record.status}</Badge>{record.evidence_status && <Badge tone={record.evidence_status === 'insufficient' ? 'amber' : 'green'}>{record.evidence_status} evidence</Badge>}<Badge tone="blue">{record.research_type}</Badge><span className="text-xs text-slate-400">Saved {new Date(record.created_at).toLocaleString()}</span></div>
        <div className="mt-5"><h2 className="font-display text-lg font-semibold text-navy">Research question</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{record.question}</p>{record.description && <><h3 className="mt-5 text-sm font-semibold text-navy">Optional context</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-500">{record.description}</p></>}</div>
        <p className="mt-5 text-xs text-slate-400">Record ID: <span className="font-mono">{record.research_id}</span></p>
      </Card>
      {record.ai_response && <Card><div className="flex flex-wrap items-center gap-2"><Sparkles size={17} className="text-violet" /><h2 className="font-display text-xl font-semibold text-navy">Research Agent answer</h2><Badge tone={record.evidence_status === 'insufficient' ? 'amber' : 'blue'}>{record.evidence_status === 'insufficient' ? 'Evidence insufficient' : 'Research Agent output'}</Badge></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{record.ai_response}</p><DemoNotice>Answer based only on search snippets returned for this request. Sources are not independently verified and may be incomplete.</DemoNotice></Card>}
      {record.status === 'failed' && <Card><div className="inline-notice inline-notice-error"><AlertCircle size={16} />{failureMessages[record.error_code ?? ''] ?? 'Research failed. The original question and any retrieved sources remain saved.'}</div></Card>}
      {record.sources.length > 0 && <Card><h2 className="font-display text-xl font-semibold text-navy">Retrieved sources</h2><p className="mt-1 text-sm text-slate-400">Each link below was returned by the configured search provider.</p><ul className="mt-5 space-y-3">{record.sources.map((source) => <li key={source.source_number} className="rounded-xl border border-slate-100 bg-white p-4"><div className="flex flex-wrap items-center gap-2"><a className="text-sm font-semibold text-signal underline" href={source.url} target="_blank" rel="noopener noreferrer">[{source.source_number}] {source.title}</a><Badge tone={source.used_in_answer ? 'green' : 'neutral'}>{source.used_in_answer ? 'Used in answer' : 'Retrieved, not cited'}</Badge></div><p className="mt-1 break-all text-xs text-slate-400">{source.url}</p>{source.snippet && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{source.snippet}</p>}<p className="mt-3 text-xs text-slate-400">{source.published_date ? `Provider-estimated publication/update: ${source.published_date} · ` : ''}Retrieved {new Date(source.retrieved_at).toLocaleString()}</p></li>)}</ul></Card>}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow text-signal">Separate from the Research Agent</div><h2 className="mt-2 flex items-center gap-2 font-display text-xl font-semibold text-navy"><Brain size={20} className="text-violet" />Analysis Agent</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Analyzes only the saved answer and source snippets. It does not search the web again and does not independently verify sources.</p></div><AnalysisStatus status={analysis?.status ?? 'not_started'} insufficient={analysis?.analysis?.insufficient_evidence ?? false} />{canAnalyze && analysis?.status !== 'completed' && <Button onClick={analyze} disabled={startingAnalysis || analysis?.status === 'processing'}>{startingAnalysis || analysis?.status === 'processing' ? <LoaderCircle size={15} className="animate-spin" /> : <Play size={15} />}{analysis?.status === 'failed' ? 'Retry analysis' : 'Run Analysis Agent'}</Button>}</div>
        {analysisError && <div className="inline-notice inline-notice-error mt-4"><AlertCircle size={16} />{analysisError}</div>}
        {!canAnalyze && <p className="mt-5 text-sm text-slate-500">A completed Research Agent answer with saved sources is required before analysis.</p>}
        {analysis?.status === 'not_started' && canAnalyze && <p className="mt-5 text-sm text-slate-500">Analysis has not been run. Use the button to start it; page refreshes only read saved status.</p>}
        {analysis?.status === 'processing' && <p className="mt-5 text-sm text-slate-500">Analysis is processing. Refresh later to read saved status; refresh will not start another model call.</p>}
        {analysis?.status === 'failed' && <div className="inline-notice inline-notice-error mt-4"><AlertCircle size={16} />{analysisErrors[analysis.error_code ?? ''] ?? 'Analysis failed. Your Research Agent answer and sources remain unchanged.'}</div>}
        {analysis?.status === 'completed' && analysis.analysis && <AnalysisDisplay analysis={analysis.analysis} sources={record.sources} />}
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow text-signal">Stage 8 · evidence review</div><h2 className="mt-2 flex items-center gap-2 font-display text-xl font-semibold text-navy"><ShieldCheck size={20} className="text-violet" />Evaluation Agent</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Evaluates the saved Research Agent answer and Analysis Agent output against saved source evidence only. It does not search the web or independently verify sources.</p></div><EvaluationStatus status={evaluation?.status ?? 'not_started'} evidenceSupport={evaluation?.evaluation?.evidence_support ?? null} />{canEvaluate && evaluation?.status !== 'completed' && <Button onClick={evaluate} disabled={startingEvaluation || evaluation?.status === 'processing'}>{startingEvaluation || evaluation?.status === 'processing' ? <LoaderCircle size={15} className="animate-spin" /> : <Play size={15} />}{evaluation?.status === 'failed' ? 'Retry evaluation' : 'Run Evaluation Agent'}</Button>}</div>
        {evaluationError && <div className="inline-notice inline-notice-error mt-4"><AlertCircle size={16} />{evaluationError}</div>}
        {!canEvaluate && <p className="mt-5 text-sm text-slate-500">A completed Research Agent answer and saved Analysis Agent result are required before evaluation.</p>}
        {evaluation?.status === 'not_started' && canEvaluate && <p className="mt-5 text-sm text-slate-500">Evaluation has not been run. Use the button to start it; refreshing this page only reads saved status.</p>}
        {evaluation?.status === 'processing' && <p className="mt-5 text-sm text-slate-500">Evaluation is processing. Refresh later to read the saved status; refresh will not start another model call.</p>}
        {evaluation?.status === 'failed' && <div className="inline-notice inline-notice-error mt-4"><AlertCircle size={16} />{evaluationErrors[evaluation.error_code ?? ''] ?? 'Evaluation failed. Your saved research and analysis remain unchanged.'}</div>}
        {evaluation?.status === 'completed' && evaluation.evaluation && <EvaluationDisplay evaluation={evaluation.evaluation} sources={record.sources} />}
      </Card>

      <DecisionSupportCard researchId={researchId} research={record} analysis={analysis} evaluation={evaluation} />
    </div>}
  </div>
}

function AnalysisStatus({ status, insufficient }: { status: string; insufficient: boolean }) {
  if (status === 'completed' && insufficient) return <Badge tone="amber">Completed · insufficient evidence</Badge>
  if (status === 'completed') return <Badge tone="green">Completed</Badge>
  if (status === 'failed') return <Badge tone="amber">Failed</Badge>
  if (status === 'processing') return <Badge tone="violet">Processing</Badge>
  return <Badge tone="blue">Not started</Badge>
}

function EvaluationStatus({ status, evidenceSupport }: { status: string; evidenceSupport: string | null }) {
  if (status === 'completed' && evidenceSupport === 'insufficient_evidence') return <Badge tone="amber">Completed · insufficient evidence</Badge>
  if (status === 'completed') return <Badge tone="green">Completed</Badge>
  if (status === 'failed') return <Badge tone="amber">Failed</Badge>
  if (status === 'processing') return <Badge tone="violet">Processing</Badge>
  return <Badge tone="blue">Not started</Badge>
}

function AnalysisDisplay({ analysis, sources }: { analysis: NonNullable<AnalysisRecord['analysis']>; sources: ResearchRecord['sources'] }) {
  const sourceLabel = (numbers: number[]) => numbers.map((number) => sources.find((source) => source.source_number === number)).filter(Boolean).map((source) => <a key={source!.source_number} className="ml-1 text-signal underline" href={source!.url} target="_blank" rel="noopener noreferrer">[{source!.source_number}]</a>)
  return <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
    {analysis.insufficient_evidence && <div className="inline-notice"><AlertCircle size={16} />Available saved evidence is insufficient for a confident analysis.</div>}
    <AnalysisSection title="Key findings" items={analysis.key_findings} render={(item) => <>{item.text} {sourceLabel(item.source_numbers)}</>} />
    <AnalysisSection title="Patterns or comparisons" items={analysis.patterns_or_comparisons} render={(item) => <>{item.text} {sourceLabel(item.source_numbers)}</>} />
    <AnalysisSection title="Implications" items={analysis.implications} render={(item) => <><Badge tone={item.basis === 'interpretation' ? 'violet' : 'green'}>{item.basis === 'interpretation' ? 'Interpretation' : 'Evidence-based'}</Badge> <span className="ml-2">{item.text}</span> {sourceLabel(item.source_numbers)}</>} />
    <AnalysisSection title="Conflicting information" items={analysis.conflicting_information} render={(item) => <>{item.text} {sourceLabel(item.source_numbers)}</>} />
    <section><h3 className="text-sm font-semibold text-navy">Evidence gaps and limitations</h3>{analysis.evidence_gaps_and_limitations.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">{analysis.evidence_gaps_and_limitations.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No additional gaps were returned.</p>}</section>
    <DemoNotice>Analysis is derived from saved material only. Interpretations are labeled; this agent does not independently verify sources.</DemoNotice>
  </div>
}

function EvaluationDisplay({ evaluation, sources }: { evaluation: EvaluationContent; sources: ResearchRecord['sources'] }) {
  const supportLabel: Record<EvaluationContent['evidence_support'], string> = {
    supported: 'Supported by saved evidence',
    partially_supported: 'Partially supported',
    unsupported: 'Unsupported by saved evidence',
    insufficient_evidence: 'Insufficient evidence',
  }
  const sourceLinks = (numbers: number[]) => numbers.map((number) => sources.find((source) => source.source_number === number)).filter(Boolean).map((source) => <a key={source!.source_number} className="ml-1 text-signal underline" href={source!.url} target="_blank" rel="noopener noreferrer">[{source!.source_number}]</a>)
  return <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overall assessment · evaluation judgment</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{evaluation.overall_assessment}</p><p className="mt-3 text-xs font-medium text-slate-500">Evidence support: {supportLabel[evaluation.evidence_support]}</p></div>
    <EvaluationFindingSection title="Consistency findings" items={evaluation.consistency_findings} render={(item) => <>{item.text} {sourceLinks(item.source_numbers)}</>} />
    <EvaluationListSection title="Unsupported claims" items={evaluation.unsupported_claims} empty="No unsupported claims were returned for this evaluation." />
    <EvaluationListSection title="Evidence gaps" items={evaluation.evidence_gaps} empty="No additional evidence gaps were returned." />
    <EvaluationListSection title="Limitations" items={evaluation.limitations} empty="No additional limitations were returned." />
    <EvaluationListSection title="Suggested improvements" items={evaluation.suggested_improvements} empty="No suggested improvements were returned." />
    <DemoNotice>This is an evidence-based evaluation of saved material, not independent source verification or a guarantee of accuracy. Review important conclusions with a qualified human.</DemoNotice>
  </div>
}

function EvaluationListSection({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <section><h3 className="text-sm font-semibold text-navy">{title}</h3>{items.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">{empty}</p>}</section>
}

function EvaluationFindingSection({ title, items, render }: { title: string; items: EvaluationFinding[]; render: (item: EvaluationFinding) => React.ReactNode }) {
  return <section><h3 className="text-sm font-semibold text-navy">{title}</h3>{items.length ? <ul className="mt-2 space-y-2">{items.map((item, index) => <li key={index} className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{render(item)}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No consistency findings were returned.</p>}</section>
}

function AnalysisSection<T extends { text: string }>({ title, items, render }: { title: string; items: T[]; render: (item: T) => React.ReactNode }) {
  return <section><h3 className="text-sm font-semibold text-navy">{title}</h3>{items.length ? <ul className="mt-2 space-y-2">{items.map((item, index) => <li key={index} className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{render(item)}</li>)}</ul> : <p className="mt-2 text-sm text-slate-400">No supported items available.</p>}</section>
}
