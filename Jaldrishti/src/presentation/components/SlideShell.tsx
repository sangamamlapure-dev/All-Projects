import type { ReactNode } from 'react';
import { Droplets } from 'lucide-react';

export function SlideShell({ children, accent = 'cyan' }: { children: ReactNode; accent?: string }) {
  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 overflow-hidden">
      {/* Decorative water waves */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.04] pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,60 C150,100 350,20 600,60 C850,100 1050,20 1200,60 L1200,120 L0,120 Z" fill="currentColor" className={`text-${accent}-600`} />
          <path d="M0,80 C200,120 400,40 600,80 C800,120 1000,40 1200,80 L1200,120 L0,120 Z" fill="currentColor" className={`text-${accent}-500`} />
        </svg>
      </div>
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400`} />
      <div className="relative z-10 flex-1 flex flex-col p-8 lg:p-12">
        {children}
      </div>
    </div>
  );
}

export function SlideBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold mb-4">
      <Droplets className="w-3.5 h-3.5" />
      {children}
    </div>
  );
}

export function SlideTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl lg:text-4xl font-bold text-slate-800 tracking-tight mb-1">
      {children}
    </h2>
  );
}

export function SlideSubtitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm lg:text-base text-slate-500 mb-6 lg:mb-8">{children}</p>
  );
}

export function FlowArrow({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 text-cyan-400 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function FlowArrowDown({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 text-cyan-400 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="5 12 12 19 19 12" />
    </svg>
  );
}
