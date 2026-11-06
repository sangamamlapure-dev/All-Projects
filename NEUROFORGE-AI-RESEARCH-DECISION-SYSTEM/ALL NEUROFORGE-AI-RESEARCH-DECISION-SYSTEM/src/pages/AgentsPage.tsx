import { BarChart3, BadgeCheck, Bot, Search, TrendingUp, Workflow } from 'lucide-react'
import { Badge, Card, DemoNotice, PageIntro } from '../components/ui/UI'
import { agents } from '../data/demoData'

const iconMap = { search: Search, 'bar-chart': BarChart3, 'badge-check': BadgeCheck, 'trending-up': TrendingUp, workflow: Workflow }

export function AgentsPage() {
  return (
    <div>
      <PageIntro eyebrow="The research workflow" title="Separate stages, saved results." description="Research, Analysis, Evaluation, and Decision Support are available as explicit backend actions. Downstream stages use saved upstream results; no numeric prediction is produced in this release." />
      <DemoNotice>This page is a capability summary, not live provider-health monitoring. Live runs require the configured backend, database, and provider credentials; the Prediction Agent is not implemented.</DemoNotice>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent, index) => {
          const Icon = iconMap[agent.icon as keyof typeof iconMap] ?? Bot
          const available = agent.status.startsWith('Available via API')
          return (
            <Card key={agent.name} className="agent-card">
              <div className="flex items-start justify-between"><div className={`agent-icon agent-icon-${agent.accent}`}><Icon size={20} /></div><Badge tone={available ? 'green' : 'amber'}>{agent.status}</Badge></div>
              <div className="mt-7 text-xs font-semibold text-slate-400">0{index + 1} / capability</div>
              <h2 className="mt-2 font-display text-xl font-semibold text-navy">{agent.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{agent.purpose}</p>
              <div className="mt-6 border-t border-slate-100 pt-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Workflow size={14} className="text-signal" />{available ? 'Available as an explicit saved API action' : 'Not included in this release'}</div></div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
