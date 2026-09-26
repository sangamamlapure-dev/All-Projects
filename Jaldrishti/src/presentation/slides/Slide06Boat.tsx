import {
  Cpu, Droplets, Gauge, Waves, Thermometer, Fish, Navigation,
  Radio, Sun, BatteryCharging, Fan, Sailboat, Info,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const components = [
  { icon: Cpu, label: 'ESP32', desc: 'Main controller', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Droplets, label: 'pH Sensor', desc: 'Acidity level', color: 'bg-cyan-100 text-cyan-600' },
  { icon: Gauge, label: 'TDS Sensor', desc: 'Dissolved solids', color: 'bg-blue-100 text-blue-600' },
  { icon: Waves, label: 'Turbidity Sensor', desc: 'Water clarity', color: 'bg-amber-100 text-amber-600' },
  { icon: Thermometer, label: 'Temperature', desc: 'Water temp', color: 'bg-red-100 text-red-600' },
  { icon: Fish, label: 'DO Sensor', desc: 'Oxygen level', color: 'bg-green-100 text-green-600' },
  { icon: Navigation, label: 'NEO-6M GPS', desc: 'Location tagging', color: 'bg-teal-100 text-teal-600' },
  { icon: Radio, label: 'Comm Module', desc: 'Wi-Fi / GSM / LoRa', color: 'bg-sky-100 text-sky-600' },
  { icon: Sun, label: 'Solar Panel', desc: 'Renewable power', color: 'bg-yellow-100 text-yellow-600' },
  { icon: BatteryCharging, label: 'Battery', desc: 'Power storage', color: 'bg-lime-100 text-lime-600' },
  { icon: Fan, label: 'Motor + Propeller', desc: 'Autonomous movement', color: 'bg-slate-100 text-slate-600' },
];

export default function Slide06Boat() {
  return (
    <SlideShell>
      <SlideBadge>Smart Monitoring Boat</SlideBadge>
      <SlideTitle>JalDrishti Monitoring Boat</SlideTitle>
      <SlideSubtitle>An autonomous vessel that monitors, maps, and collects data — not a water purifier</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Boat visual */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            {/* Boat body */}
            <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl border-2 border-slate-300 shadow-xl p-6">
              {/* Solar panel on top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 rounded-lg bg-gradient-to-r from-blue-800 to-indigo-900 border border-slate-400 shadow-md flex items-center justify-center">
                <Sun className="w-4 h-4 text-yellow-400" />
              </div>
              {/* Boat deck with components */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {components.slice(0, 9).map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white border border-slate-200">
                      <div className={`w-7 h-7 rounded-lg ${c.color} flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[8px] font-semibold text-slate-500 text-center">{c.label}</span>
                    </div>
                  );
                })}
              </div>
              {/* Hull */}
              <div className="mt-3 h-8 rounded-b-3xl bg-gradient-to-b from-slate-300 to-slate-400 border-2 border-slate-400 border-t-0 flex items-center justify-center">
                <Sailboat className="w-5 h-5 text-slate-500" />
              </div>
            </div>
            {/* Water line */}
            <div className="mt-1 h-2 rounded-full bg-gradient-to-r from-cyan-200 via-blue-300 to-cyan-200 opacity-60" />
            <div className="mt-0.5 h-1 rounded-full bg-gradient-to-r from-cyan-100 via-blue-200 to-cyan-100 opacity-40" />
          </div>
        </div>

        {/* Component list */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {components.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700">{c.label}</p>
                    <p className="text-[10px] text-slate-400">{c.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <span className="font-bold">Important:</span> The boat is for monitoring, mapping, and data collection.
              It does <span className="font-bold">not</span> physically purify the entire lake.
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
