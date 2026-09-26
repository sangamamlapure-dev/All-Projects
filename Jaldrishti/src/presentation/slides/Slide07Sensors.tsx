import {
  Droplets, Gauge, Waves, Thermometer, Fish, Cpu, Navigation, Radio, Cloud,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const sensors = [
  { icon: Droplets, name: 'pH Sensor', param: 'pH', range: '6.5 – 8.5', unit: '', color: 'from-cyan-400 to-blue-500', safe: 'Safe range' },
  { icon: Gauge, name: 'TDS Sensor', param: 'TDS', range: '< 500', unit: 'ppm', color: 'from-blue-400 to-indigo-500', safe: 'Safe limit' },
  { icon: Waves, name: 'Turbidity Sensor', param: 'Turbidity', range: '< 5', unit: 'NTU', color: 'from-amber-400 to-orange-500', safe: 'Safe limit' },
  { icon: Thermometer, name: 'Temperature Sensor', param: 'Temp', range: '15 – 35', unit: '°C', color: 'from-red-400 to-rose-500', safe: 'Safe range' },
  { icon: Fish, name: 'Dissolved Oxygen', param: 'DO', range: '> 5', unit: 'mg/L', color: 'from-green-400 to-emerald-500', safe: 'Safe limit' },
];

const techStack = [
  { icon: Cpu, label: 'Controller', value: 'ESP32', desc: 'Low-power microcontroller', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Navigation, label: 'GPS', value: 'NEO-6M', desc: 'Location tagging', color: 'bg-teal-100 text-teal-600' },
  { icon: Radio, label: 'Communication', value: 'Wi-Fi / GSM / LoRa', desc: 'Flexible connectivity', color: 'bg-sky-100 text-sky-600' },
  { icon: Cloud, label: 'Cloud', value: 'Firebase / MQTT', desc: 'Real-time data sync', color: 'bg-blue-100 text-blue-600' },
];

export default function Slide07Sensors() {
  return (
    <SlideShell>
      <SlideBadge>Sensors &amp; Technology</SlideBadge>
      <SlideTitle>Sensor Array &amp; Tech Stack</SlideTitle>
      <SlideSubtitle>Off-the-shelf sensors + ESP32 + GPS + cloud — affordable and modular</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 content-center">
        {/* Sensor cards */}
        {sensors.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">{s.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-slate-700">{s.range}</span>
                <span className="text-xs text-slate-400">{s.unit}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{s.safe}</p>
            </div>
          );
        })}
      </div>

      {/* Tech stack */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {techStack.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">{t.label}</p>
                <p className="text-sm font-bold text-slate-700">{t.value}</p>
                <p className="text-[10px] text-slate-400">{t.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </SlideShell>
  );
}
