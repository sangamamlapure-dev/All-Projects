import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Download, FileText, Search } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, DemoNotice, EmptyState, PageIntro } from '../components/ui/UI'
import { reports } from '../data/demoData'

export function ReportsPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All types')
  const filtered = useMemo(() => reports
    .filter((report) => `${report.title} ${report.summary} ${report.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    .filter((report) => filter === 'All types' || report.type === filter), [query, filter])

  return (
    <div>
      <PageIntro eyebrow="Report library" title="Keep the reasoning trail close." description="This library currently shows local sample report shells. It is not populated from the available saved research and agent APIs." action={<Button variant="secondary" onClick={() => window.alert('Export is a frontend demonstration. No file was created.')}><Download size={16} /> Export demo</Button>} />
      <DemoNotice>Sample reports only. The content below is not live research evidence or saved agent output.</DemoNotice>
      <Card className="mt-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input className="input pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports" aria-label="Search reports" /></label>
          <select className="input md:w-56" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter reports"><option>All types</option><option>Market research</option><option>Comparative analysis</option><option>Data exploration</option></select>
        </div>
      </Card>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {filtered.map((report) => <Link to={`/reports/${report.id}`} key={report.id} className="report-card"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet"><FileText size={19} /></div><Badge tone="violet">{report.status}</Badge></div><h2 className="mt-7 font-display text-xl font-semibold text-navy">{report.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{report.summary}</p><div className="mt-5 flex flex-wrap gap-2">{report.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}</div><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400"><span>{report.type} · {report.date}</span><ArrowUpRight size={16} /></div></Link>)}
        {filtered.length === 0 && <div className="lg:col-span-2"><EmptyState title="No matching reports" body="Try a different search or return to all report types." /></div>}
      </div>
    </div>
  )
}

export function ReportDetailPage() {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const report = reports.find((item) => item.id === reportId)
  if (!report) return <EmptyState title="Report not found" body="This demo report does not exist in the sample library." action={<Button onClick={() => navigate('/reports')}>Back to reports</Button>} />

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reports')}><ArrowLeft size={15} /> Back to reports</button>
      <div className="mt-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><div className="eyebrow text-signal">Sample report · {report.date}</div><h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-navy md:text-5xl">{report.title}</h1><p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-500">{report.summary}</p></div>
        <Button variant="secondary" onClick={() => window.alert('Export is a frontend demonstration. No file was created.')}><Download size={16} /> Export demo</Button>
      </div>
      <DemoNotice>Demo report only. No live sources, citations, or model output are being presented.</DemoNotice>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="eyebrow text-signal">Executive summary</div>
          <h2 className="mt-2 font-display text-xl font-semibold text-navy">A transparent report structure</h2>
          <p className="mt-4 leading-7 text-slate-500">This sample illustrates a report structure; it is not a live summary or a saved agent result.</p>
          <div className="mt-8 space-y-5">
            <section className="report-section"><h3>Findings</h3><p>No live findings appear in this sample. Saved agent outputs are shown on their research detail pages.</p></section>
            <section className="report-section"><h3>Evidence</h3><p>No live evidence is attached to this demo report. The saved research detail page shows retrieved source metadata and snippets.</p></section>
            <section className="report-section"><h3>Limitations</h3><p>A complete report should identify missing data, uncertain assumptions, conflicting sources, and questions that need expert review.</p></section>
          </div>
        </Card>
        <Card>
          <div className="eyebrow text-signal">Report metadata</div>
          <div className="mt-5 space-y-4 text-sm"><Meta label="Type" value={report.type} /><Meta label="Status" value="Sample only" /><Meta label="Sources" value="No live sources" /><Meta label="Prediction" value="Not available" /></div>
          <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">This sample report library uses local fixtures and is separate from the saved research and agent workflow.</div>
        </Card>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-slate-400">{label}</span><span className="font-semibold text-navy">{value}</span></div>
}
