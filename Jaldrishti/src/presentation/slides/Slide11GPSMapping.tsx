import { MapPin, Navigation, Info } from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const zones = [
  { id: 'A', name: 'Zone A', lat: '21.2570', lng: '81.6050', status: 'good', ph: 7.1, tds: 280, color: 'bg-green-500', ring: 'ring-green-300', bg: 'bg-green-50', text: 'text-green-700', label: 'GOOD' },
  { id: 'B', name: 'Zone B', lat: '21.2550', lng: '81.6080', status: 'warning', ph: 6.4, tds: 720, color: 'bg-amber-500', ring: 'ring-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', label: 'WARNING' },
  { id: 'C', name: 'Zone C', lat: '21.2530', lng: '81.6020', status: 'critical', ph: 5.8, tds: 1050, color: 'bg-red-500', ring: 'ring-red-300', bg: 'bg-red-50', text: 'text-red-700', label: 'CRITICAL' },
  { id: 'D', name: 'Zone D', lat: '21.2510', lng: '81.6060', status: 'good', ph: 7.3, tds: 310, color: 'bg-green-500', ring: 'ring-green-300', bg: 'bg-green-50', text: 'text-green-700', label: 'GOOD' },
];

export default function Slide11GPSMapping() {
  return (
    <SlideShell>
      <SlideBadge>GPS Pollution Mapping</SlideBadge>
      <SlideTitle>Location-Based Monitoring</SlideTitle>
      <SlideSubtitle>A large lake can have different water quality at different locations — JalDrishti maps it all</SlideSubtitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Map visual */}
        <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 border border-cyan-200 overflow-hidden shadow-inner">
          {/* Water body shape */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
            <path d="M50,80 Q80,40 150,50 Q250,30 320,80 Q360,140 340,200 Q300,260 200,250 Q100,260 60,200 Q30,140 50,80 Z"
              fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
          </svg>
          {/* Zone markers */}
          <div className="absolute top-[20%] left-[25%] flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-green-500 ring-4 ring-green-300/50 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">A</div>
          </div>
          <div className="absolute top-[35%] left-[55%] flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-amber-500 ring-4 ring-amber-300/50 flex items-center justify-center text-white text-[10px] font-bold shadow-lg animate-pulse">B</div>
          </div>
          <div className="absolute top-[55%] left-[30%] flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-red-500 ring-4 ring-red-300/50 flex items-center justify-center text-white text-[10px] font-bold shadow-lg animate-pulse">C</div>
          </div>
          <div className="absolute top-[65%] left-[65%] flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-green-500 ring-4 ring-green-300/50 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">D</div>
          </div>
          {/* Boat icon */}
          <div className="absolute top-[40%] left-[40%]">
            <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
              <Navigation className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[10px] text-slate-600 font-medium">Good</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-[10px] text-slate-600 font-medium">Warning</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[10px] text-slate-600 font-medium">Critical</span></div>
            </div>
          </div>
        </div>

        {/* Zone details */}
        <div className="flex flex-col gap-3 justify-center">
          {zones.map((z, i) => (
            <div key={i} className={`p-3.5 rounded-xl ${z.bg} border border-slate-200 flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl ${z.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {z.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">{z.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${z.bg} ${z.text}`}>{z.label}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>pH: <b className="text-slate-700">{z.ph}</b></span>
                  <span>TDS: <b className="text-slate-700">{z.tds} ppm</b></span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                  <MapPin className="w-2.5 h-2.5" /> {z.lat}, {z.lng}
                </div>
              </div>
            </div>
          ))}

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              JalDrishti provides <span className="font-bold">location-based monitoring</span> instead of relying on one sample —
              identifying pollution hotspots across the entire water body.
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
