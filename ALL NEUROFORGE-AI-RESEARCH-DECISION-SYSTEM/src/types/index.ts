export type Accent = 'blue' | 'violet' | 'emerald' | 'amber' | 'slate'

export interface Agent {
  name: string
  icon: string
  purpose: string
  status: string
  accent: Accent
}

export interface Report {
  id: string
  title: string
  type: string
  date: string
  status: string
  summary: string
  tags: string[]
}

export interface ResearchProject {
  title: string
  type: string
  updated: string
  status: string
  progress: number
}

export interface StatCard {
  label: string
  value: string
  change: string
}

export type WorkflowStatus = 'idle' | 'running' | 'complete' | 'error'
