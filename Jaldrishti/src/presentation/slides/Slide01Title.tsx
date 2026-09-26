import { Droplets, Waves, ShieldCheck, Users, TrendingUp } from 'lucide-react';

export default function Slide01Title() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-cyan-100/30 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-teal-100/20 blur-2xl" />

      <div className="relative z-10 max-w-4xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-cyan-200 shadow-sm mb-8">
          <span className="text-xs font-bold text-cyan-700 tracking-wide">SMART WATER INNOVATION</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold text-teal-600">Clean &amp; Green Technology</span>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <Droplets className="w-11 h-11 text-white" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-500 opacity-20 blur-xl" />
          </div>
          <h1 className="text-6xl lg:text-7xl font-extrabold text-slate-800 tracking-tight">
            JalDrishti
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-700 mb-2 leading-snug">
          Smart Water Purification &amp; Quality Monitoring System
        </h2>
        <p className="text-lg lg:text-xl text-slate-500 mb-8">
          for Rural and Mining-Affected Areas
        </p>

        {/* Tagline */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-12">
          <span className="text-lg font-bold text-white tracking-wide">Detect</span>
          <span className="text-white/50">→</span>
          <span className="text-lg font-bold text-white tracking-wide">Inform</span>
          <span className="text-white/50">→</span>
          <span className="text-lg font-bold text-white tracking-wide">Act</span>
          <span className="text-white/50">→</span>
          <span className="text-lg font-bold text-white tracking-wide">Verify</span>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Waves, label: 'Real-Time Monitoring' },
            { icon: TrendingUp, label: 'AI Risk Analysis' },
            { icon: ShieldCheck, label: 'Treatment Support' },
            { icon: Users, label: 'Citizen App' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200 shadow-sm">
                <Icon className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium text-slate-600">{f.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
