import { ArrowRight, BarChart3, BookOpenCheck, ChevronRight, CircleCheck, GitBranch, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/brand/Logo'
import { Button, DemoNotice } from '../components/ui/UI'
import { agents } from '../data/demoData'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="landing-nav">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 md:flex">
          <a href="#how-it-works">How it works</a>
          <a href="#agents">AI agents</a>
          <a href="#principles">Principles</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="hidden text-sm font-semibold text-navy sm:block">Open dashboard</Link>
          <Link to="/research/new"><Button>Start a research brief <ArrowRight size={16} /></Button></Link>
        </div>
      </header>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow mb-5 text-signal"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />Transparent research, step by step</div>
            <h1 className="font-display text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-navy md:text-7xl">Make complex questions <span className="text-gradient">easier to reason about.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">NeuroForge AI is a structured research workspace for turning questions into evidence-aware decisions — with every assumption and limitation kept in view.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/research/new"><Button>Explore the workspace <ArrowRight size={16} /></Button></Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold text-navy">See how it works <ChevronRight size={16} className="text-signal" /></a>
            </div>
            <div className="mt-10 flex flex-wrap gap-5 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-2"><CircleCheck size={15} className="text-emerald-500" /> Evidence-aware by design</span>
              <span className="flex items-center gap-2"><CircleCheck size={15} className="text-emerald-500" /> Clear limitations</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-glow" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div><div className="eyebrow text-slate-400">New research brief</div><h2 className="mt-2 font-display text-xl font-semibold text-navy">What should we investigate?</h2></div>
                <div className="signal-mark"><Sparkles size={18} /></div>
              </div>
              <textarea className="textarea mt-6" defaultValue="How might cities improve public transport adoption?" aria-label="Research question demo" />
              <div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-400">Demo input only</span><Link to="/research/new"><Button>Open workspace <ArrowRight size={15} /></Button></Link></div>
              <DemoNotice>This landing-page preview is sample content only. Start a research brief in the workspace to use the configured backend workflow.</DemoNotice>
            </div>
          </div>
        </section>
        <section id="principles" className="section-wrap">
          <div className="section-heading">
            <div className="eyebrow text-signal">A clearer starting point</div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">Built for careful thinking, not black-box answers.</h2>
            <p className="mt-4 max-w-xl text-slate-500">The saved workflow keeps the path from question to evidence to decision visible. Later stages run only when explicitly requested and use saved upstream results.</p>
          </div>
          <div className="feature-grid">
            <Feature icon={<BookOpenCheck />} title="Research trails" body="Keep the path from question to source to conclusion visible and reviewable." />
            <Feature icon={<ShieldCheck />} title="Honest uncertainty" body="Make assumptions, conflicts, and missing data part of the review — not an afterthought." />
            <Feature icon={<BarChart3 />} title="Decision context" body="Decision Support compares choices using saved evidence; predictive forecasts are not part of this release." />
          </div>
        </section>
        <section id="how-it-works" className="section-wrap border-t border-slate-200">
          <div className="eyebrow text-signal">How it works</div>
          <div className="mt-8 grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-navy">One question. A visible workflow.</h2>
              <p className="mt-4 leading-7 text-slate-500">Submit a brief to save a Research Agent answer and its retrieved sources. On the saved record, explicitly run Analysis, Evaluation, and Decision Support in order; each stage uses persisted prior results. Opening or refreshing a record only reads saved output.</p>
            </div>
            <div className="space-y-3">
              {['Frame the question and scope', 'Retrieve sources and save the answer', 'Run Analysis and Evaluation on saved evidence', 'Compare decision options and review limitations'].map((step, index) => <div key={step} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-bold text-signal">0{index + 1}</div><span className="font-semibold text-navy">{step}</span><ChevronRight size={16} className="ml-auto text-slate-300" /></div>)}
            </div>
          </div>
        </section>
        <section id="agents" className="section-wrap">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><div className="eyebrow text-signal">The research crew</div><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy">Specialists with one job each.</h2></div>
            <Link to="/agents" className="text-sm font-semibold text-signal">Meet the agents <ArrowRight size={15} className="ml-1 inline" /></Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {agents.map((agent) => <div key={agent.name} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-8 grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><GitBranch size={18} /></div><h3 className="font-semibold text-navy">{agent.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{agent.purpose}</p></div>)}
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-slate-400 sm:flex-row"><span>© 2026 NeuroForge AI</span><span>Backend workflow included · live runs require a configured database and provider credentials</span></div>
      </footer>
    </div>
  )
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-signal">{icon}</div><h3 className="font-display text-lg font-semibold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p></div>
}
