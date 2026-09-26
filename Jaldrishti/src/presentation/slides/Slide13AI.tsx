import {
  BrainCircuit, TrendingUp, MapPin, Sparkles, BarChart3,
  FlaskConical, Lightbulb, ArrowRight, Info,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const features = [
  { icon: Sparkles, label: 'Risk Scoring', desc: '0–100 risk score per zone', color: 'bg-cyan-100 text-cyan-600' },
  { icon: TrendingUp, label: 'Pollution Trend Analysis', desc: 'Detect rising/falling trends', color: 'bg-blue-100 text-blue-600' },
  { icon: MapPin, label: 'Hotspot Detection', desc: 'Identify critical zones', color: 'bg-amber-100 text-amber-600' },
  { icon: BrainCircuit, label: 'Risk Prediction', desc: 'Forecast future risk levels', color: 'bg-violet-100 text-violet-600' },
  { icon: FlaskConical, label: 'Treatment Recommendation', desc: 'Suggest appropriate action', color: 'bg-purple-100 text-purple-600' },
  { icon: BarChart3, label: 'Historical Pattern Analysis', desc: 'Long-term trend patterns', color: 'bg-teal-100 text-teal-600' },
];

export default function Slide13AI() {
  return (
    <SlideShell>
      <SlideBadge>AI &amp; Smart Analytics</SlideBadge>
      <SlideTitle>AI Water Risk Analysis</SlideTitle>
      <SlideSubtitle>AI Demo / Predictive Analytics — using simulated historical sensor data</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Risk Score Card */}
        <div className="flex flex-col justify-center">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-700">Risk Score</p>
              </div>
              <span className="text-xs font-bold text-amber-600 px-2.5 py-1 rounded-full bg-amber-100">MEDIUM</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-5xl font-extrabold text-amber-600">68</span>
              <span className="text-xl text-slate-400 font-bold">/100</span>
            </div>
            {/* Risk bar */}
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-1">
              <div className="h-full rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500" style={{ width: '68%' }} />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>CRITICAL</span>
            </div>
          </div>

          {/* AI Insight */}
          <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-slate-700">AI Insight</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              "Water-quality deterioration is being observed in Zone B based on increasing turbidity and TDS trends."
            </p>
            <div className="flex items-start gap-2 mt-3 pt-2 border-t border-slate-100">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Recommended: </span>
                Perform detailed inspection and consider appropriate treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{f.label}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-violet-50 border border-violet-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700">
              <span className="font-bold">AI Demo / Predictive Analytics:</span> This prototype uses simulated historical
              sensor data to demonstrate risk analysis. It does not claim a real trained AI model. The analytics layer
              is designed to integrate with real sensor data in production.
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
