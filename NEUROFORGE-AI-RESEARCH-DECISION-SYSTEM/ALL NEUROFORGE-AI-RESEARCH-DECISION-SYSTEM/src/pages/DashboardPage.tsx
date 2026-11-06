import { useEffect, useState } from 'react'
import { ArrowUpRight, FileText, Plus, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, DemoNotice, EmptyState, PageIntro } from '../components/ui/UI'
import { projects, reports, stats } from '../data/demoData'
import { listResearch, type ResearchRecord } from '../services/api'

export function DashboardPage() {
  const [history, setHistory] = useState<ResearchRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    let active = true
    listResearch().then((records) => {
      if (active) setHistory(records)
    }).catch((error) => {
      if (active) setHistoryError(error instanceof Error ? error.message : 'Research history is unavailable.')
    }).finally(() => {
      if (active) setHistoryLoading(false)
    })
    return () => { active = false }
  }, [])

  return <div>
    <PageIntro eyebrow="Workspace overview" title="Good morning, researcher." description="A calm place to frame questions, follow the reasoning trail, and review structured reports." action={<Link to="/research/new"><Button><Plus size={16} /> New research</Button></Link>} />
    <DemoNotice>{historyError ? 'FastAPI is currently unavailable. Start the backend to load saved history; sample reports remain clearly labelled.' : 'Backend research history is loaded from PostgreSQL. Reports and findings below remain clearly labelled sample content.'}</DemoNotice>
    <Card className="mt-6">
      <div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-semibold text-navy">Backend research history</h2><p className="mt-1 text-sm text-slate-400">Saved questions and AI responses</p></div><Badge tone={historyError ? 'amber' : 'blue'}>{historyLoading ? 'Loading' : historyError ? 'Unavailable' : `${history.length} request${history.length === 1 ? '' : 's'}`}</Badge></div>
      {historyLoading && <p className="mt-5 text-sm text-slate-400">Loading research history…</p>}
      {historyError && <div className="inline-notice inline-notice-error mt-5">{historyError}</div>}
      {!historyLoading && !historyError && history.length === 0 && <div className="mt-5"><EmptyState title="No saved requests yet" body="Submit a research brief to save the first database record." /></div>}
      {!historyLoading && !historyError && history.length > 0 && <div className="mt-5 space-y-2">{history.map((record) => <Link key={record.research_id} to={`/research/${record.research_id}`} className="project-row border border-slate-100 transition hover:border-blue-200"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-signal"><FileText size={17} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold text-navy">{record.question}</h3><ResearchStatus status={record.status} evidenceStatus={record.evidence_status} /></div><p className="mt-1 text-xs text-slate-400">{record.research_type} · {new Date(record.created_at).toLocaleString()}</p></div><ArrowUpRight size={16} className="text-slate-300" /></Link>)}</div>}
    </Card>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <Card key={stat.label} className="stat-card"><div className="flex items-start justify-between"><span className="text-sm text-slate-500">{stat.label}</span><Sparkles size={16} className="text-blue-300" /></div><div className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy">{stat.value}</div><div className="mt-2 text-xs font-medium text-slate-400">{stat.change}</div></Card>)}</div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-semibold text-navy">Recent sample projects</h2><p className="mt-1 text-sm text-slate-400">Clearly labelled sample/demo content</p></div><Link to="/research/new" className="text-sm font-semibold text-signal">New brief</Link></div><div className="mt-6 space-y-3">{projects.map((project) => <div key={project.title} className="project-row"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><FileText size={17} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold text-navy">{project.title}</h3><Badge tone="blue">{project.status}</Badge></div><p className="mt-1 text-xs text-slate-400">{project.type} · Updated {project.updated}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-signal" style={{ width: `${project.progress}%` }} /></div></div><ArrowUpRight size={16} className="text-slate-300" /></div>)}</div></Card>
      <Card><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-semibold text-navy">Recent sample reports</h2><p className="mt-1 text-sm text-slate-400">Clearly marked interface examples</p></div><Link to="/reports" className="text-sm font-semibold text-signal">All reports</Link></div><div className="mt-5 space-y-2">{reports.slice(0, 3).map((report) => <Link key={report.id} to={`/reports/${report.id}`} className="report-mini"><div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet"><FileText size={15} /></div><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-navy">{report.title}</h3><p className="mt-1 text-xs text-slate-400">{report.date}</p></div><ArrowUpRight size={15} className="ml-auto text-slate-300" /></Link>)}</div></Card>
    </div>
  </div>
}

function ResearchStatus({ status, evidenceStatus }: { status: string; evidenceStatus: ResearchRecord['evidence_status'] }) {
  if (status === 'completed' && evidenceStatus === 'insufficient') return <Badge tone="amber">Insufficient evidence</Badge>
  if (status === 'completed') return <Badge tone="green">Completed</Badge>
  if (status === 'failed') return <Badge tone="amber">Failed</Badge>
  if (status === 'processing' || status === 'pending') return <Badge tone="violet">{status}</Badge>
  return <Badge tone="blue">Saved · no AI run</Badge>
}
