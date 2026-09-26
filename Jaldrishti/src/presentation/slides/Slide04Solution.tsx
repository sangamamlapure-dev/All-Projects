import {
  Droplets, Sailboat, Gauge, Cpu, Cloud, BarChart3, Bell,
  FlaskConical, RefreshCw, CheckCircle2, Sparkles,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle, FlowArrowDown } from '../components/SlideShell';

const flow = [
  { icon: Droplets, label: 'Water Body', color: 'bg-cyan-100 text-cyan-600' },
  { icon: Sailboat, label: 'Smart Monitoring Boat', color: 'bg-blue-100 text-blue-600' },
  { icon: Gauge, label: 'Multiple Sensors', color: 'bg-teal-100 text-teal-600' },
  { icon: Cpu, label: 'ESP32 + GPS', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Cloud, label: 'Cloud / Firebase', color: 'bg-sky-100 text-sky-600' },
  { icon: BarChart3, label: 'Water Quality Analysis', color: 'bg-cyan-100 text-cyan-600' },
  { icon: Bell, label: 'Pollution Alert', color: 'bg-amber-100 text-amber-600' },
  { icon: FlaskConical, label: 'Treatment Support', color: 'bg-purple-100 text-purple-600' },
  { icon: RefreshCw, label: 'Re-test', color: 'bg-green-100 text-green-600' },
  { icon: CheckCircle2, label: 'Improvement Verification', color: 'bg-emerald-100 text-emerald-600' },
];

export default function Slide04Solution() {
  return (
    <SlideShell>
      <SlideBadge>Proposed Solution</SlideBadge>
      <SlideTitle>
        <span className="inline-flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-cyan-500" />
          JalDrishti
        </span>
      </SlideTitle>
      <SlideSubtitle>One integrated system: monitoring + detection + treatment support + re-testing</SlideSubtitle>

      <div className="flex flex-col items-center gap-1 flex-1 justify-center py-2">
        {/* Top row */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl">
          {flow.slice(0, 5).map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-600 text-center max-w-[80px]">{step.label}</p>
                </div>
                {i < 4 && <span className="text-cyan-400 text-lg">→</span>}
              </div>
            );
          })}
        </div>
        <FlowArrowDown className="my-1" />
        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl">
          {flow.slice(5).map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-600 text-center max-w-[80px]">{step.label}</p>
                </div>
                {i < flow.slice(5).length - 1 && <span className="text-cyan-400 text-lg">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        {['Continuous', 'Location-Based', 'Actionable Monitoring'].map((tag, i) => (
          <div key={i} className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-md">
            {tag}
          </div>
        ))}
      </div>
    </SlideShell>
  );
}
