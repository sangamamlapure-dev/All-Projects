import { FlaskConical, FlaskRound, Clock, FileText, AlertTriangle } from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle, FlowArrowDown } from '../components/SlideShell';

const steps = [
  { icon: FlaskConical, label: 'Manual Sampling', desc: 'Field visit to collect water samples' },
  { icon: FlaskRound, label: 'Laboratory Testing', desc: 'Samples sent to lab for analysis' },
  { icon: Clock, label: 'Delayed Results', desc: 'Results take days to weeks' },
  { icon: FileText, label: 'Manual Reporting', desc: 'Reports compiled manually' },
  { icon: AlertTriangle, label: 'Delayed Action', desc: 'Response comes after damage is done' },
];

const limitations = [
  'Periodic monitoring — not continuous',
  'Limited sampling locations',
  'Delayed detection of contamination',
  'High manual effort & operational cost',
  'Difficult to monitor large water bodies',
  'Limited citizen accessibility',
];

export default function Slide03Existing() {
  return (
    <SlideShell>
      <SlideBadge>Existing System &amp; Limitations</SlideBadge>
      <SlideTitle>Traditional Approach</SlideTitle>
      <SlideSubtitle>The current water-quality monitoring process is slow, manual, and location-limited</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Flow */}
        <div className="flex flex-col items-center justify-center gap-1">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-slate-200 shadow-sm w-full max-w-xs">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{step.label}</p>
                    <p className="text-xs text-slate-400">{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && <FlowArrowDown className="my-1" />}
              </div>
            );
          })}
        </div>

        {/* Limitations */}
        <div className="flex flex-col justify-center">
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
            <h3 className="text-base font-bold text-red-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Key Limitations
            </h3>
            <div className="space-y-3">
              {limitations.map((lim, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-red-600">✕</span>
                  </div>
                  <p className="text-sm text-slate-600">{lim}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
