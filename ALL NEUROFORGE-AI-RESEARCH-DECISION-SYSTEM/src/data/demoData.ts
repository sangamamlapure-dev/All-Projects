import type { Agent, ResearchProject, Report, StatCard } from '../types'

export const agents: Agent[] = [
  { name: 'Research Agent', icon: 'search', purpose: 'Searches Tavily for relevant sources and summarizes returned snippets with source-linked evidence.', status: 'Available via API · configuration required', accent: 'blue' },
  { name: 'Analysis Agent', icon: 'bar-chart', purpose: 'Analyzes only the saved Research Agent answer and source snippets.', status: 'Available via API · explicit run', accent: 'violet' },
  { name: 'Evaluation Agent', icon: 'badge-check', purpose: 'Evaluates the saved answer and analysis against saved source evidence.', status: 'Available via API · explicit run', accent: 'emerald' },
  { name: 'Decision Support Agent', icon: 'workflow', purpose: 'Compares options using saved research, analysis, evaluation, and source evidence.', status: 'Available via API · explicit run', accent: 'slate' },
  { name: 'Prediction Agent', icon: 'trending-up', purpose: 'Predictive modeling is not implemented in this release; no forecast is generated.', status: 'Not implemented', accent: 'amber' },
]

export const reports: Report[] = [
  { id: 'r-001', title: 'Urban mobility adoption signals', type: 'Market research', date: 'Oct 28, 2026', status: 'Demo report', summary: 'A demonstration report showing how evidence, assumptions, and limitations can sit together.', tags: ['mobility', 'evidence'] },
  { id: 'r-002', title: 'Student productivity tools', type: 'Comparative analysis', date: 'Oct 19, 2026', status: 'Demo report', summary: 'A sample comparison structure for evaluating product choices without presenting live findings.', tags: ['education', 'comparison'] },
  { id: 'r-003', title: 'Renewable energy baseline', type: 'Data exploration', date: 'Oct 11, 2026', status: 'Demo report', summary: 'An example report shell with a clearly separated future prediction section.', tags: ['energy', 'data'] },
]

export const projects: ResearchProject[] = [
  { title: 'Urban mobility adoption signals', type: 'Market research', updated: '2 days ago', status: 'Demo complete', progress: 100 },
  { title: 'Student productivity tools', type: 'Comparative analysis', updated: '1 week ago', status: 'Demo complete', progress: 100 },
  { title: 'Renewable energy baseline', type: 'Data exploration', updated: '3 weeks ago', status: 'Demo draft', progress: 62 },
]

export const stats: StatCard[] = [
  { label: 'Research projects', value: '03', change: 'Demo workspace' },
  { label: 'Reports generated', value: '03', change: 'Sample reports' },
  { label: 'Evidence items', value: '18', change: 'Illustrative only' },
  { label: 'Sample model runs', value: '—', change: 'Live count not tracked' },
]

export const demoFindings = [
  { title: 'The question needs a defined scope', body: 'A responsible workflow would first identify geography, time period, audience, and what counts as evidence.' },
  { title: 'Evidence should remain traceable', body: 'Each claim should link back to a permitted source record before it appears in a final report.' },
  { title: 'Predictions need real data', body: 'The platform should not produce a prediction until a valid dataset and evaluation plan are available.' },
]

export const demoEvidence = [
  { label: 'Evidence record example', body: 'Source title, URL or identifier, publication date, relevance note, and confidence explanation would appear here.' },
  { label: 'Conflict check example', body: 'The Analysis Agent can record conflicting information supported by the saved source snippets.' },
]
