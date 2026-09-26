import {
  Droplets, BarChart3, AlertTriangle, FlaskConical, CheckCircle2,
  RefreshCw, ShieldCheck, Layers, Filter, Sparkles, Sun, Info,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle, FlowArrowDown } from '../components/SlideShell';

const workflow = [
  { icon: Droplets, label: 'Contamination Detected', color: 'bg-red-100 text-red-600' },
  { icon: BarChart3, label: 'Water Quality Analysis', color: 'bg-blue-100 text-blue-600' },
  { icon: AlertTriangle, label: 'Contamination Assessment', color: 'bg-amber-100 text-amber-600' },
  { icon: FlaskConical, label: 'Appropriate Treatment', color: 'bg-purple-100 text-purple-600' },
  { icon: CheckCircle2, label: 'Treatment Completed', color: 'bg-teal-100 text-teal-600' },
  { icon: RefreshCw, label: 'Re-test', color: 'bg-cyan-100 text-cyan-600' },
  { icon: ShieldCheck, label: 'Improvement Verification', color: 'bg-green-100 text-green-600' },
];

const treatments = [
  { icon: Layers, title: 'High Turbidity', treatment: 'Sedimentation / Filtration', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { icon: Sparkles, title: 'Organic Contamination', treatment: 'Activated Carbon (where appropriate)', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { icon: Sun, title: 'Biological Contamination', treatment: 'Disinfection (UV / Chlorination)', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { icon: AlertTriangle, title: 'Mining / Heavy Metal', treatment: 'Specialized treatment + lab confirmation', color: 'bg-red-50 border-red-200 text-red-700' },
];

export default function Slide12Treatment() {
  return (
    <SlideShell>
      <SlideBadge>Treatment / Purification Support</SlideBadge>
      <SlideTitle>Treatment Support &amp; Verification</SlideTitle>
      <SlideSubtitle>The system recommends treatment — then re-tests to verify improvement</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Workflow */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-1">
          {workflow.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm w-full max-w-xs">
                  <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{step.label}</p>
                </div>
                {i < workflow.length - 1 && <FlowArrowDown className="my-0.5" />}
              </div>
            );
          })}
        </div>

        {/* Treatment types */}
        <div className="lg:col-span-3 flex flex-col justify-center gap-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Treatment Examples</p>
          {treatments.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className={`p-3.5 rounded-xl border ${t.color} flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">{t.title}</p>
                  <p className="text-xs text-slate-500">→ {t.treatment}</p>
                </div>
              </div>
            );
          })}

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <span className="font-bold">Important:</span> No single purification method removes every contaminant.
              For mining-related contamination, <span className="font-bold">specialized treatment and laboratory confirmation may be required.</span>
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
