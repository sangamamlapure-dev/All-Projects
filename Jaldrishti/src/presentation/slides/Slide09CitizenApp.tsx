import {
  Smartphone, Languages, Droplets, MapPin, Bell, Mic, FileWarning,
  HelpCircle, WifiOff, Settings2, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const features = [
  { icon: Smartphone, label: 'No mandatory login', desc: 'Open and use instantly' },
  { icon: Languages, label: 'Marathi / Hindi / English', desc: 'Local language support' },
  { icon: MapPin, label: 'Nearby water sources', desc: 'GPS-based location' },
  { icon: Bell, label: 'Simple alerts', desc: 'No technical jargon' },
  { icon: Mic, label: 'Voice assistance', desc: 'For low-literacy users' },
  { icon: FileWarning, label: 'Report water problem', desc: 'Citizen reporting' },
  { icon: HelpCircle, label: 'Help section', desc: 'Built-in guidance' },
  { icon: WifiOff, label: 'Low-internet support', desc: 'Works on weak networks' },
  { icon: Settings2, label: 'Technical details optional', desc: 'Available on demand' },
];

const statusExamples = [
  { icon: CheckCircle2, label: 'Good', desc: 'Water is safe for use', color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  { icon: AlertTriangle, label: 'Check Required', desc: 'Monitoring advised', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  { icon: XCircle, label: 'Pollution Alert', desc: 'Avoid using water', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
];

export default function Slide09CitizenApp() {
  return (
    <SlideShell>
      <SlideBadge>Citizen / Farmer Mobile App</SlideBadge>
      <SlideTitle>Designed for Everyone</SlideTitle>
      <SlideSubtitle>A farmer does not need to understand pH, TDS, NTU or DO to use the app</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Phone mockup */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-96 rounded-[2.5rem] bg-slate-800 border-4 border-slate-700 shadow-2xl p-2">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-2xl bg-slate-800 z-10" />
            {/* Screen */}
            <div className="w-full h-full rounded-[2rem] bg-gradient-to-b from-cyan-50 to-white overflow-hidden flex flex-col">
              <div className="pt-8 px-3 pb-2 bg-gradient-to-r from-cyan-500 to-blue-600">
                <p className="text-white text-xs font-bold">JalDrishti</p>
                <p className="text-cyan-100 text-[9px]">Pani Tumcha Sathi</p>
              </div>
              <div className="flex-1 p-3 space-y-2">
                <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-bold text-green-700">Good</span>
                  </div>
                  <p className="text-[8px] text-slate-500 mt-1">Lilagar Lake — North</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-700">Check Required</span>
                  </div>
                  <p className="text-[8px] text-slate-500 mt-1">Lilagar Lake — East</p>
                </div>
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-bold text-red-700">Pollution Alert</span>
                  </div>
                  <p className="text-[8px] text-slate-500 mt-1">Mining Runoff Zone</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 flex items-center gap-1.5">
                  <Mic className="w-3 h-3 text-blue-500" />
                  <span className="text-[8px] text-blue-600 font-medium">Voice Help</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status examples */}
        <div className="flex flex-col gap-3 justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Simple Status</p>
          {statusExamples.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`p-4 rounded-xl ${s.bg} border border-slate-200 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${s.text}`}>{s.label}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="flex flex-col gap-2 justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">App Features</p>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{f.label}</p>
                  <p className="text-[10px] text-slate-400">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SlideShell>
  );
}
