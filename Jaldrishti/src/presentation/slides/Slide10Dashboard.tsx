import {
  Activity, Sailboat, Map, HeartPulse, Bell, BarChart3, Route,
  FileWarning, FlaskConical, FileText, BrainCircuit, Monitor, Smartphone,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const features = [
  { icon: Activity, label: 'Live Water-Quality Monitoring', color: 'bg-cyan-100 text-cyan-600' },
  { icon: Sailboat, label: 'Boat Monitoring', color: 'bg-blue-100 text-blue-600' },
  { icon: Map, label: 'GPS Pollution Map', color: 'bg-teal-100 text-teal-600' },
  { icon: HeartPulse, label: 'Sensor Health', color: 'bg-green-100 text-green-600' },
  { icon: Bell, label: 'Alerts Management', color: 'bg-amber-100 text-amber-600' },
  { icon: BarChart3, label: 'Historical Analytics', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Route, label: 'Mission Planning', color: 'bg-sky-100 text-sky-600' },
  { icon: FileWarning, label: 'Citizen Reports', color: 'bg-rose-100 text-rose-600' },
  { icon: FlaskConical, label: 'Treatment Tracking', color: 'bg-purple-100 text-purple-600' },
  { icon: FileText, label: 'Reports & Export', color: 'bg-slate-100 text-slate-600' },
  { icon: BrainCircuit, label: 'AI Insights', color: 'bg-violet-100 text-violet-600' },
];

export default function Slide10Dashboard() {
  return (
    <SlideShell>
      <SlideBadge>Officer Web Dashboard</SlideBadge>
      <SlideTitle>Authority Control Center</SlideTitle>
      <SlideSubtitle>Detailed monitoring interface for environmental officers and administrators</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Dashboard mockup */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden">
          {/* Window bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border-b border-slate-700">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="ml-3 text-[10px] text-slate-400 font-mono">jaldrishti.gov.in/dashboard</div>
          </div>
          {/* Dashboard content */}
          <div className="p-3 bg-slate-50">
            {/* Sidebar */}
            <div className="flex gap-3">
              <div className="w-28 bg-slate-900 rounded-lg p-2 space-y-1.5">
                <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-cyan-500/20">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[8px] text-cyan-300 font-semibold">Overview</span>
                </div>
                {['Live', 'Map', 'Boat', 'Alerts'].map(s => (
                  <div key={s} className="px-1.5 py-1 text-[8px] text-slate-400">{s}</div>
                ))}
              </div>
              {/* Main area */}
              <div className="flex-1 space-y-2">
                {/* Cards row */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { l: 'Quality', v: 'GOOD', c: 'bg-green-50 text-green-600' },
                    { l: 'Zones', v: '08', c: 'bg-cyan-50 text-cyan-600' },
                    { l: 'Alerts', v: '03', c: 'bg-amber-50 text-amber-600' },
                    { l: 'Boat', v: 'ONLINE', c: 'bg-blue-50 text-blue-600' },
                  ].map((c, i) => (
                    <div key={i} className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <p className="text-[7px] text-slate-400">{c.l}</p>
                      <p className={`text-[10px] font-bold ${c.c.split(' ')[1]}`}>{c.v}</p>
                    </div>
                  ))}
                </div>
                {/* Chart mock */}
                <div className="p-2 rounded-lg bg-white border border-slate-200 h-20 flex items-end gap-1">
                  {[40, 65, 45, 70, 55, 80, 50, 75, 60, 85, 45, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-cyan-400 to-blue-500" style={{ height: `${h}%` }} />
                  ))}
                </div>
                {/* Map mock */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 h-16 flex items-center justify-center relative">
                    <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-green-500" />
                    <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
                    <div className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-red-500" />
                    <Map className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 h-16 space-y-1">
                    <div className="h-1.5 rounded-full bg-red-200 w-full" />
                    <div className="h-1.5 rounded-full bg-amber-200 w-3/4" />
                    <div className="h-1.5 rounded-full bg-green-200 w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="flex flex-col justify-center">
          <div className="grid grid-cols-1 gap-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{f.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-cyan-50 border border-cyan-200">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-green-500" />
              <p className="text-xs font-bold text-slate-600">Mobile App</p>
              <span className="text-slate-300">=</span>
              <p className="text-xs text-slate-500">Simple Citizen Interface</p>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-bold text-slate-600">Web Dashboard</p>
              <span className="text-slate-300">=</span>
              <p className="text-xs text-slate-500">Detailed Authority Interface</p>
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
