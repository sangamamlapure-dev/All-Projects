import { Bot, FileText, LayoutDashboard, Menu, Plus, Search, Settings2, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '../components/brand/Logo'

const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/research/new', label: 'New research', icon: Plus },
  { to: '/agents', label: 'AI agents', icon: Bot },
  { to: '/reports', label: 'Reports', icon: FileText },
]

export function AppShell() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const current = links.find((link) => location.pathname.startsWith(link.to))?.label ?? 'Overview'

  return (
    <div className="min-h-screen bg-canvas">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="flex items-center justify-between">
          <Logo />
          <button className="icon-button lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="mt-10">
          <div className="eyebrow mb-3 px-3">Workspace</div>
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><Icon size={17} />{label}</NavLink>)}
          </nav>
        </div>
        <div className="mt-auto hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block">
          <div className="mb-3 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-400" /><span className="text-xs font-semibold text-navy">Saved research workflow</span></div>
          <p className="text-xs leading-5 text-slate-500">Live Research requires Tavily and OpenAI credentials; downstream agents require OpenAI. Saved records use the configured DATABASE_URL.</p>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
          <div className="flex items-center gap-2 text-sm text-slate-400"><Search size={16} /><span className="hidden sm:inline">{current}</span></div>
          <div className="ml-auto flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 sm:flex"><Settings2 size={14} /> Tavily + OpenAI</div><div className="avatar">NF</div></div>
        </header>
        <main className="page-container"><Outlet /></main>
      </div>
      {open && <button className="fixed inset-0 z-30 bg-navy/20 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
    </div>
  )
}
