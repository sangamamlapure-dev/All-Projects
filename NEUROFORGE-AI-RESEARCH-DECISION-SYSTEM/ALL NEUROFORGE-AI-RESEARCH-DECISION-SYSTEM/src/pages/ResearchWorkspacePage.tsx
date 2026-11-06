import { useMemo, useState } from 'react'
import { AlertCircle, Check, CircleDot, Clock3, FileSearch, Play, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, DemoNotice, PageIntro } from '../components/ui/UI'
import { demoEvidence, demoFindings } from '../data/demoData'
import { createResearch, type ResearchRecord } from '../services/api'
import type { WorkflowStatus } from '../types'

const steps = ['Request saved', 'Real sources retrieved', 'Source-grounded answer saved']

function errorMessage(errorCode: string | null) {
  const messages: Record<string, string> = {
    retrieval_not_configured: 'Source search is not configured. Add TAVILY_API_KEY to backend/.env and restart FastAPI.',
    retrieval_authentication_error: 'The search provider rejected its API key. Check TAVILY_API_KEY in backend/.env.',
    retrieval_rate_limited: 'The search provider is rate-limiting requests. Please try again later.',
    retrieval_timeout: 'Source search timed out. The request is saved; please try again later.',
    retrieval_connection_error: 'The search provider could not be reached. Please try again later.',
    retrieval_invalid_response: 'The search provider returned an invalid response. Please try again later.',
    retrieval_no_results: 'No usable sources were returned. Try a more specific research question.',
    retrieval_provider_error: 'The search provider could not complete the search. Please try again later.',
    llm_not_configured: 'AI is not configured. Add LLM_API_KEY to backend/.env and restart FastAPI.',
    llm_timeout: 'AI generation timed out. Please try again later.',
    llm_rate_limited: 'The AI provider is rate-limiting requests. Please try again later.',
    llm_authentication_error: 'The AI provider rejected its API key. Check LLM_API_KEY in backend/.env.',
    llm_connection_error: 'The AI provider could not be reached. Please try again later.',
    llm_invalid_response: 'The AI provider returned an invalid answer. Please try again later.',
    llm_provider_error: 'The AI provider could not complete this request. Please try again later.',
    research_agent_error: 'The Research Agent could not complete this request. The saved record remains available.',
  }
  return messages[errorCode ?? ''] ?? 'Research failed. The request remains saved; check the backend setup and try again.'
}

export function ResearchWorkspacePage() {
  const [question, setQuestion] = useState('')
  const [type, setType] = useState('Market research')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<WorkflowStatus>('idle')
  const [notice, setNotice] = useState('')
  const [submittedResearch, setSubmittedResearch] = useState<ResearchRecord | null>(null)
  const progress = status === 'complete' ? 100 : status === 'running' ? 55 : status === 'error' ? 100 : 0
  const statusLabel = useMemo(() => ({ idle: 'Ready to submit a brief', running: 'Searching sources and generating answer', complete: 'Research Agent response saved', error: 'Research could not be completed' }[status]), [status])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) {
      setStatus('error')
      setNotice('Add a research question before submitting.')
      return
    }

    setStatus('running')
    setNotice('Saving the question, searching real sources, then asking the AI to summarize them…')
    setSubmittedResearch(null)
    try {
      const record = await createResearch({ question, research_type: type, description })
      setSubmittedResearch(record)
      if (record.status === 'completed' && record.ai_response) {
        setStatus('complete')
        setNotice(record.evidence_status === 'insufficient'
          ? 'The answer and retrieved sources are saved, but the available evidence is insufficient for a confident answer.'
          : 'The source-grounded answer and retrieved sources were saved. Review the linked sources below.')
      } else {
        setStatus('error')
        setNotice(errorMessage(record.error_code))
      }
    } catch (error) {
      setStatus('error')
      setNotice(error instanceof Error ? error.message : 'The backend could not accept the request.')
    }
  }

  return <div>
    <PageIntro eyebrow="Research workspace" title="Turn a question into a trail." description="The Research Agent searches real sources, then asks the existing AI model to summarize only the retrieved material. Source links are returned by the search provider; the result is not a peer-reviewed or independently verified report." action={<Badge tone="amber">Research Agent · source-linked</Badge>} />
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <div className="mb-6"><h2 className="font-display text-xl font-semibold text-navy">Research brief</h2><p className="mt-1 text-sm text-slate-400">The question is saved before retrieval or AI generation starts.</p></div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-navy">Research question</span><textarea className="textarea" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What would you like to understand?" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-navy">Research type</span><select className="input" value={type} onChange={(e) => setType(e.target.value)}><option>Market research</option><option>Comparative analysis</option><option>Data exploration</option><option>Policy question</option></select></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-navy">Optional context</span><textarea className="textarea min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add audience, time period, region, or constraints." /></label>
          {notice && <div className={`inline-notice ${status === 'error' ? 'inline-notice-error' : ''}`}><AlertCircle size={16} />{notice}</div>}
          {submittedResearch && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">Research ID: <span className="font-mono">{submittedResearch.research_id}</span><br />Saved with status: <strong>{submittedResearch.status}</strong><br /><Link className="font-semibold underline" to={`/research/${submittedResearch.research_id}`}>Open saved research record</Link></div>}
          <Button type="submit" loading={status === 'running'}><Play size={15} /> Submit research request</Button>
        </form>
      </Card>
      <div className="space-y-6">
        <Card>
          <div className="flex items-start justify-between gap-4"><div><div className="eyebrow text-signal">Research Agent workflow</div><h2 className="mt-2 font-display text-xl font-semibold text-navy">{statusLabel}</h2></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-signal"><FileSearch size={19} /></div></div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-signal to-violet transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          <div className="mt-6 space-y-2">{steps.map((step, index) => { const accepted = status === 'complete'; const sending = status === 'running' && index < 3; return <div key={step} className={`workflow-step ${accepted ? 'workflow-step-done' : ''}`}><div className="workflow-icon">{accepted ? <Check size={14} /> : sending ? <CircleDot size={14} className="animate-pulse" /> : <Clock3 size={14} />}</div><span>{step}</span><span className="ml-auto text-xs text-slate-400">{accepted ? 'Done' : sending ? 'Working' : 'Stage 7+'}</span></div>})}</div>
          <DemoNotice>{submittedResearch?.evidence_status === 'insufficient' ? 'The retrieved material was not enough for a confident answer. The agent reported the evidence gap rather than filling it with unsupported claims.' : 'Retrieved web snippets are untrusted input. The model is instructed to ignore source-page instructions and use snippets only as evidence.'}</DemoNotice>
          {submittedResearch?.ai_response && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge tone="blue">Research Agent answer</Badge><Badge tone={submittedResearch.evidence_status === 'insufficient' ? 'amber' : 'green'}>{submittedResearch.evidence_status === 'insufficient' ? 'Insufficient evidence' : 'Evidence found'}</Badge></div><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{submittedResearch.ai_response}</p><SourceList sources={submittedResearch.sources} /></div>}
        </Card>
        <ResultsDemo status={status} onReset={() => { setStatus('idle'); setNotice(''); setSubmittedResearch(null) }} />
      </div>
    </div>
  </div>
}

function SourceList({ sources }: { sources: ResearchRecord['sources'] }) {
  if (!sources.length) return null
  return <div className="mt-5 border-t border-blue-100 pt-4"><h3 className="text-sm font-semibold text-navy">Retrieved sources</h3><ul className="mt-3 space-y-3">{sources.map((source) => <li key={source.source_number} className="rounded-lg border border-slate-100 bg-white p-3"><a className="text-sm font-semibold text-signal underline" href={source.url} target="_blank" rel="noopener noreferrer">[{source.source_number}] {source.title}</a><p className="mt-1 break-all text-xs text-slate-400">{source.url}</p>{source.snippet && <p className="mt-2 text-sm leading-5 text-slate-600">{source.snippet}</p>}<p className="mt-2 text-xs text-slate-400">{source.published_date ? `Provider-estimated publication/update: ${source.published_date} · ` : ''}{source.used_in_answer ? 'Used by the answer' : 'Retrieved; not cited in the answer'}</p></li>)}</ul></div>
}

function ResultsDemo({ status, onReset }: { status: WorkflowStatus; onReset: () => void }) {
  return <Card><div className="flex items-center justify-between"><div><div className="eyebrow text-signal">Sample content</div><h2 className="mt-2 font-display text-xl font-semibold text-navy">Example result structure</h2></div>{status !== 'idle' && <Button variant="ghost" onClick={onReset}><RotateCcw size={15} /> Reset</Button>}</div><p className="mt-3 text-sm leading-6 text-slate-500">The following cards are interface samples, not output from the Research Agent.</p><div className="mt-6 grid gap-4">{demoFindings.map((finding) => <div key={finding.title} className="result-block"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-signal" /><h3 className="text-sm font-semibold text-navy">{finding.title}</h3></div><p className="mt-2 text-sm leading-6 text-slate-500">{finding.body}</p></div>)}{demoEvidence.map((item) => <div key={item.label} className="result-block bg-slate-50"><h3 className="text-sm font-semibold text-navy">{item.label}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.body}</p></div>)}</div></Card>
}
