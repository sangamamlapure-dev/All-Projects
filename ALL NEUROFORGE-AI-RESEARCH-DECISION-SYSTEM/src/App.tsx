import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { ResearchWorkspacePage } from './pages/ResearchWorkspacePage'
import { ResearchDetailPage } from './pages/ResearchDetailPage'
import { AgentsPage } from './pages/AgentsPage'
import { ReportsPage, ReportDetailPage } from './pages/ReportsPage'

export function App() {
  return <BrowserRouter><Routes><Route path="/" element={<LandingPage />} /><Route element={<AppShell />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/research/new" element={<ResearchWorkspacePage />} /><Route path="/research/:researchId" element={<ResearchDetailPage />} /><Route path="/agents" element={<AgentsPage />} /><Route path="/reports" element={<ReportsPage />} /><Route path="/reports/:reportId" element={<ReportDetailPage />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter>
}
