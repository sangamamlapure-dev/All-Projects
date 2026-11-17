import { useEffect, useState } from 'react'
import { AlertCircle, Compass, LoaderCircle, Play } from 'lucide-react'
import { Badge, Button, Card, DemoNotice } from './ui/UI'
import {
  getDecisionSupport,
  startDecisionSupport,
  type AnalysisRecord,
  type DecisionSupportContent,
  type DecisionSupportEvidence,
  type DecisionSupportRecord,
  type DecisionSourceQuote,
  type EvaluationRecord,
  type ResearchRecord,
  type ResearchSourceRecord,
} from '../services/api'

const failureMessages: Record<string, string> = {
  decision_support_llm_not_configured: 'AI decision support is not configured. Add LLM_API_KEY to backend/.env and restart FastAPI.',
  decision_support_timeout: 'Decision support timed out. Your saved research, analysis, and evaluation remain unchanged; try again.',
  decision_support_rate_limited: 'The AI provider is rate-limiting decision-support requests. Please try again later.',
  decision_support_authentication_error: 'The AI provider rejected its key. Check LLM_API_KEY in backend/.env.',
  decision_support_connection_error: 'The AI provider could not be reached. Try again later.',
  decision_support_provider_error: 'The AI provider could not complete decision support. Try again later.',
  decision_support_invalid_response: 'The Decision Support Agent returned an invalid result or source reference. Try again later.',
  decision_support_unexpected_error: 'An unexpected error stopped decision support. Earlier saved results remain available.',
}

export function DecisionSupportCard({
  researchId,
  research,
  analysis,
  evaluation,
}: {
  researchId: string
  research: ResearchRecord
  analysis: AnalysisRecord | null
  evaluation: EvaluationRecord | null
}) {
  const [saved, setSaved] = useState<DecisionSupportRecord | null>(null)
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoadingSaved(true)
    setError('')
    setSaved(null)
    getDecisionSupport(researchId)
      .then((result) => { if (active) setSaved(result) })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Saved decision-support status could not be loaded.') })
      .finally(() => { if (active) setLoadingSaved(false) })
    return () => { active = false }
  }, [researchId])

  const canRun = research.status === 'completed' && Boolean(research.ai_response)
    && analysis?.status === 'completed' && Boolean(analysis.analysis)
    && evaluation?.status === 'completed' && Boolean(evaluation.evaluation)

  async function run() {
    setRunning(true)
    setError('')
    try { setSaved(await startDecisionSupport(researchId)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Decision support could not be started.') }
    finally { setRunning(false) }
  }

  const status = saved?.status ?? 'not_started'
  const content = saved?.decision_support ?? null
  return <Card>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="eyebrow text-signal">Stage 9 · decision aid</div>
        <h2 className="mt-2 flex items-center gap-2 font-display text-xl font-semibold text-navy"><Compass size={20} className="text-violet" />Decision Support Agent</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Frames possible choices from the saved research, source evidence, analysis, and evaluation only. It does not search again or independently verify sources.</p>
      </div>
      <DecisionSupportStatus status={status} content={content} />
      {canRun && status !== 'completed' && <Button onClick={run} disabled={running || loadingSaved || status === 'processing'}>{running || status === 'processing' ? <LoaderCircle size={15} className="animate-spin" /> : <Play size={15} />}{status === 'failed' ? 'Retry Decision Support' : 'Run Decision Support Agent'}</Button>}
    </div>

    {error && <div className="inline-notice inline-notice-error mt-4"><AlertCircle size={16} />{error}</div>}
    {loadingSaved && <p className="mt-5 text-sm text-slate-500">Loading saved decision-support status…</p>}
    {!loadingSaved && !canRun && <p className="mt-5 text-sm text-slate-500">A completed Research Agent answer, Analysis Agent result, and Evaluation Agent result are required before decision support.</p>}
    {!loadingSaved && canRun && status === 'not_started' && <p className="mt-5 text-sm text-slate-500">Decision support has not been run. Use the button to start it; refreshing this page only reads the saved status.</p>}
    {status === 'processing' && <p className="mt-5 text-sm text-slate-500">Decision support is processing. Refresh later to read the saved result; refresh will not start another model call.</p>}
    {status === 'failed' && <div className="inline-notice inline-notice-error mt-4"><AlertCircle size={16} />{failureMessages[saved?.error_code ?? ''] ?? 'Decision support failed. Your saved research, analysis, and evaluation remain unchanged.'}</div>}
    {status === 'completed' && content && <DecisionSupportDisplay content={content} sources={research.sources} />}
  </Card>
}

function DecisionSupportStatus({ status, content }: { status: string; content: DecisionSupportContent | null }) {
  if (status === 'completed' && content?.evidence_condition === 'sufficient') return <Badge tone="green">Completed · evidence supports comparison</Badge>
  if (status === 'completed' && content?.evidence_condition === 'conflicting') return <Badge tone="amber">Completed · conflicting evidence</Badge>
  if (status === 'completed' && content?.evidence_condition === 'weak') return <Badge tone="amber">Completed · weak evidence</Badge>
  if (status === 'completed') return <Badge tone="amber">Completed · insufficient evidence</Badge>
  if (status === 'failed') return <Badge tone="amber">Failed</Badge>
  if (status === 'processing') return <Badge tone="violet">Processing</Badge>
  return <Badge tone="blue">Not started</Badge>
}

function DecisionSupportDisplay({ content, sources }: { content: DecisionSupportContent; sources: ResearchSourceRecord[] }) {
  const sourceLinks = (quotes: DecisionSourceQuote[]) => quotes.map((quote, index) => {
    const source = sources.find((item) => item.source_id === quote.source_id)
    return <div key={`${quote.source_id}-${index}`} className="mt-1 rounded-md border-l-2 border-slate-300 pl-2 text-xs text-slate-500">
      <span>“{quote.excerpt}”</span>{source && <a className="ml-2 text-signal underline" href={source.url} target="_blank" rel="noopener noreferrer">[Source {source.source_number}]</a>}
    </div>
  })
  const evidenceConditionLabel: Record<DecisionSupportContent['evidence_condition'], string> = {
    sufficient: 'Evidence supports comparing options',
    weak: 'Weak saved evidence',
    conflicting: 'Conflicting saved evidence',
    insufficient: 'Insufficient saved evidence',
  }

  return <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
    {content.evidence_condition !== 'sufficient' && <div className="inline-notice"><AlertCircle size={16} />{evidenceConditionLabel[content.evidence_condition]}. No confident recommendation is provided.</div>}
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision question</div>
      <p className="mt-1 text-sm font-semibold text-navy">{content.decision_question}</p>
      <h3 className="mt-4 text-sm font-semibold text-navy">Decision summary</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{content.decision_summary}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">Evidence condition: {evidenceConditionLabel[content.evidence_condition]}</p>
    </div>

    <section>
      <h3 className="text-sm font-semibold text-navy">Decision options</h3>
      {content.options.length ? <div className="mt-3 grid gap-3 lg:grid-cols-2">{content.options.map((option, index) => <article key={`${option.name}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="font-semibold text-navy">{option.name}</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
        <EvidenceList title="Potential benefits" items={option.potential_benefits} sourceLinks={sourceLinks} />
        <EvidenceList title="Risks or trade-offs" items={option.risks_or_tradeoffs} sourceLinks={sourceLinks} />
        <EvidenceList title="Evidence supporting this option" items={option.supporting_evidence} sourceLinks={sourceLinks} />
        <StringList title="Assumptions or unknowns" items={option.assumptions_or_unknowns} />
      </article>)}</div> : <p className="mt-2 text-sm text-slate-500">No decision options are presented because the saved evidence is not sufficient for a grounded comparison.</p>}
    </section>

    <section><h3 className="text-sm font-semibold text-navy">Option comparison</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{content.comparison}</p></section>
    <section><h3 className="text-sm font-semibold text-navy">Recommended next step</h3>{content.recommended_next_step ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{content.recommended_next_step}</p> : <p className="mt-2 text-sm leading-6 text-slate-600">No recommendation can be made from the saved evidence.</p>}</section>
    <section><h3 className="text-sm font-semibold text-navy">Qualitative confidence and basis</h3><p className="mt-2 text-sm leading-6 text-slate-600"><Badge tone={content.confidence_label === 'high' || content.confidence_label === 'moderate' ? 'green' : 'amber'}>{content.confidence_label.replaceAll('_', ' ')}</Badge><span className="ml-2">{content.confidence_basis}</span></p></section>
    <StringList title="Limitations" items={content.limitations} />
    <StringList title="Questions to resolve" items={content.questions_to_resolve} />
    <DemoNotice>This is a decision aid based on saved material, not a guaranteed outcome, professional advice, or independent source verification. Treat recommendations as tentative and review important decisions with a qualified person.</DemoNotice>
  </div>
}

function EvidenceList({ title, items, sourceLinks }: { title: string; items: DecisionSupportEvidence[]; sourceLinks: (quotes: DecisionSourceQuote[]) => React.ReactNode }) {
  return <section className="mt-4"><h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h5>{items.length ? <ul className="mt-2 space-y-2">{items.map((item, index) => <li key={index} className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{item.text}<div className="mt-1 text-xs">Saved evidence excerpts:{sourceLinks(item.source_quotes)}</div></li>)}</ul> : <p className="mt-1 text-sm text-slate-400">No supported items returned.</p>}</section>
}

function StringList({ title, items }: { title: string; items: string[] }) {
  return <section className="mt-4"><h5 className="text-sm font-semibold text-navy">{title}</h5>{items.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-1 text-sm text-slate-400">None returned.</p>}</section>
}
