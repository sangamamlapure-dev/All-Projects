import { BrainCircuit } from 'lucide-react'

interface LogoProps { compact?: boolean }

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3" aria-label="NeuroForge AI">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-white shadow-sm shadow-blue-200">
        <BrainCircuit size={21} strokeWidth={1.8} />
      </div>
      {!compact && <div><div className="font-display text-[15px] font-bold tracking-tight text-navy">NeuroForge<span className="text-signal"> AI</span></div><div className="eyebrow mt-0.5">Research workspace</div></div>}
    </div>
  )
}
