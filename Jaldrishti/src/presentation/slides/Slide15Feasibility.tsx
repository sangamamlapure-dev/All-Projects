import {
  Cpu, Radio, Sun, Fan, Smartphone, Code2, Cloud, Layers,
  CheckCircle2, ArrowRight, Map, Building2, Globe,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const hardware = [
  { icon: Cpu, label: 'ESP32', desc: 'Low-cost microcontroller' },
  { icon: Radio, label: 'Off-the-shelf sensors', desc: 'pH, TDS, Turbidity, Temp, DO' },
  { icon: Sun, label: 'Solar power', desc: 'Sustainable energy' },
  { icon: Fan, label: 'DC motors', desc: 'Affordable propulsion' },
];

const software = [
  { icon: Smartphone, label: 'Flutter', desc: 'Cross-platform citizen app' },
  { icon: Code2, label: 'React.js', desc: 'Officer web dashboard' },
  { icon: Cloud, label: 'Firebase', desc: 'Cloud database & auth' },
  { icon: Layers, label: 'Cloud APIs', desc: 'MQTT / HTTP integration' },
];

const scaleSteps = [
  { icon: Map, label: 'One Water Body', color: 'bg-cyan-100 text-cyan-600' },
  { icon: Building2, label: 'Multiple Villages', color: 'bg-blue-100 text-blue-600' },
  { icon: Layers, label: 'Multiple Districts', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Globe, label: 'Regional Network', color: 'bg-teal-100 text-teal-600' },
];

const tags = ['Low-Cost', 'Modular', 'Solar-Assisted', 'Maintainable', 'Scalable'];

export default function Slide15Feasibility() {
  return (
    <SlideShell>
      <SlideBadge>Feasibility &amp; Scalability</SlideBadge>
      <SlideTitle>Practical, Affordable, Scalable</SlideTitle>
      <SlideSubtitle>Built with accessible technology — designed to scale from one lake to an entire region</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Hardware + Software */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Hardware</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {hardware.map((h, i) => {
                const Icon = h.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{h.label}</p>
                      <p className="text-[10px] text-slate-400">{h.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Software</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {software.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{s.label}</p>
                      <p className="text-[10px] text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scalability */}
        <div className="flex flex-col justify-center">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Scalability Roadmap</h3>
            <div className="flex items-center justify-between gap-1 mb-6">
              {scaleSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-center gap-1 flex-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-600 text-center">{step.label}</p>
                    </div>
                    {i < scaleSteps.length - 1 && <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-cyan-200 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                  <span className="text-xs font-semibold text-slate-600">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
