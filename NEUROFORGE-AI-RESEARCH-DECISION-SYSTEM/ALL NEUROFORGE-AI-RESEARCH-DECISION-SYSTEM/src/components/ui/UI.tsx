import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'violet' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Button({ children, variant = 'primary', loading = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{loading ? <LoaderCircle size={16} className="animate-spin" /> : children}</button>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="eyebrow mb-3 text-signal">{eyebrow}</div><h1 className="font-display text-3xl font-semibold tracking-tight text-navy md:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-500">{description}</p></div>{action}</div>
}

export function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-navy">{label}</span><input className="input" {...props} />{hint && <span className="mt-2 block text-xs text-slate-400">{hint}</span>}</label>
}

export function DemoNotice({ children = 'This is a frontend demonstration. No backend or AI service is connected yet.' }: { children?: ReactNode }) {
  return <div className="demo-notice"><Sparkles size={17} className="shrink-0 text-violet" /><span>{children}</span></div>
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Sparkles size={20} /></div><h3 className="font-display text-lg font-semibold text-navy">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{body}</p>{action && <div className="mt-5">{action}</div>}</div>
}
