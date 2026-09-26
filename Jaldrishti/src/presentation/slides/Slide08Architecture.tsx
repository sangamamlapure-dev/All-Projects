import {
  Droplets, Sailboat, Gauge, Cpu, Navigation, Radio, Cloud,
  BarChart3, Smartphone, Monitor, Bell, FlaskConical, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle, FlowArrowDown } from '../components/SlideShell';

const layers = [
  { icon: Droplets, label: 'Water Body', color: 'bg-cyan-500' },
  { icon: Sailboat, label: 'Monitoring Boat', color: 'bg-blue-500' },
  { icon: Gauge, label: 'Sensors (pH, TDS, Turbidity, Temp, DO)', color: 'bg-teal-500' },
  { icon: Cpu, label: 'ESP32 Controller', color: 'bg-indigo-500' },
  { icon: Navigation, label: 'GPS Tagging (NEO-6M)', color: 'bg-sky-500' },
  { icon: Radio, label: 'Wi-Fi / GSM / LoRa', color: 'bg-cyan-600' },
  { icon: Cloud, label: 'Cloud / Firebase', color: 'bg-blue-600' },
  { icon: BarChart3, label: 'Water Quality Analysis', color: 'bg-cyan-500' },
];

const bottomFlow = [
  { icon: Bell, label: 'Alerts', color: 'bg-amber-500' },
  { icon: FlaskConical, label: 'Treatment Support', color: 'bg-purple-500' },
  { icon: RefreshCw, label: 'Re-testing', color: 'bg-green-500' },
  { icon: CheckCircle2, label: 'Verification', color: 'bg-emerald-500' },
];

export default function Slide08Architecture() {
  return (
    <SlideShell>
      <SlideBadge>System Architecture</SlideBadge>
      <SlideTitle>End-to-End Architecture</SlideTitle>
      <SlideSubtitle>From water body to citizen app to verification — the complete data flow</SlideSubtitle>

      <div className="flex gap-6 flex-1 items-center">
        {/* Left: vertical flow */}
        <div className="flex-1 flex flex-col items-center gap-1">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <div key={i} className="flex flex-col items-center w-full max-w-md">
                <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className={`w-9 h-9 rounded-lg ${layer.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{layer.label}</p>
                </div>
                {i < layers.length - 1 && <FlowArrowDown className="my-0.5" />}
              </div>
            );
          })}
        </div>

        {/* Right: dual interface + action flow */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Dual interface */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50 border border-cyan-200">
            <p className="text-xs font-bold text-slate-500 mb-3 text-center">DUAL USER INTERFACE</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-700">Citizen Mobile App</p>
                <p className="text-[10px] text-slate-400">Simple water status</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-2">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-700">Officer Dashboard</p>
                <p className="text-[10px] text-slate-400">Detailed analytics</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center"><FlowArrowDown /></div>

          {/* Action flow */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <p className="text-xs font-bold text-slate-500 mb-3 text-center">ACTION &amp; VERIFICATION</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {bottomFlow.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-600">{step.label}</p>
                    </div>
                    {i < bottomFlow.length - 1 && <span className="text-cyan-400">→</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
