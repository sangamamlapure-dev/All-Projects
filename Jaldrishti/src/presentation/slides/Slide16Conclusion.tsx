import {
  Eye, Cloud, Bell, RefreshCw, Droplets, Compass, BrainCircuit,
  Gauge, WifiOff, FlaskConical, Building2, Network, Satellite,
  Heart, Sparkles,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const futureScope = [
  { icon: Compass, label: 'Fully autonomous navigation', color: 'bg-cyan-100 text-cyan-600' },
  { icon: BrainCircuit, label: 'Advanced AI prediction', color: 'bg-violet-100 text-violet-600' },
  { icon: Gauge, label: 'More water-quality sensors', color: 'bg-teal-100 text-teal-600' },
  { icon: WifiOff, label: 'Offline-first rural app', color: 'bg-amber-100 text-amber-600' },
  { icon: FlaskConical, label: 'Automated treatment integration', color: 'bg-purple-100 text-purple-600' },
  { icon: Building2, label: 'Government monitoring integration', color: 'bg-blue-100 text-blue-600' },
  { icon: Network, label: 'Larger water-quality network', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Satellite, label: 'Drone / satellite data integration', color: 'bg-sky-100 text-sky-600' },
];

const cycle = [
  { icon: Eye, label: 'DETECT', color: 'from-cyan-400 to-blue-500' },
  { icon: Cloud, label: 'INFORM', color: 'from-blue-400 to-indigo-500' },
  { icon: Bell, label: 'ACT', color: 'from-amber-400 to-orange-500' },
  { icon: RefreshCw, label: 'VERIFY', color: 'from-green-400 to-emerald-500' },
];

export default function Slide16Conclusion() {
  return (
    <SlideShell>
      <SlideBadge>Future Scope &amp; Conclusion</SlideBadge>
      <SlideTitle>The Road Ahead</SlideTitle>
      <SlideSubtitle>JalDrishti transforms water monitoring from periodic manual testing into continuous, location-based, actionable water management</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Future scope */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" /> Future Scope
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {futureScope.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className={`w-7 h-7 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">{f.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conclusion */}
        <div className="flex flex-col justify-center">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-5 h-5 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-700">Conclusion</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              JalDrishti transforms water monitoring from <span className="font-bold text-slate-700">periodic manual testing</span> into
              <span className="font-bold text-cyan-700"> continuous, location-based and actionable water management</span> —
              detecting pollution early, informing communities, supporting treatment, and verifying improvement.
            </p>
          </div>

          {/* Final cycle */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {cycle.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-600">{step.label}</p>
                  </div>
                  {i < cycle.length - 1 && <span className="text-cyan-400 text-lg">→</span>}
                </div>
              );
            })}
          </div>

          {/* Thank you */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <p className="text-2xl font-bold text-slate-800">Thank You</p>
            </div>
            <p className="text-sm text-slate-500">JalDrishti — Smart Monitoring. Cleaner Water. Safer Communities.</p>
            <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-slate-100">
              <span className="text-[10px] font-semibold text-slate-500">JalDrishti · Clean &amp; Green Technology</span>
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
