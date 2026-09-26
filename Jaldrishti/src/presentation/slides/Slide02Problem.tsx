import {
  MapPinned, Clock, FlaskConical, Mountain, EyeOff, Languages, MapPin,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const problems = [
  { icon: EyeOff, title: 'No Continuous Monitoring', desc: 'Rural communities lack real-time water-quality tracking systems.', color: 'from-red-400 to-rose-500' },
  { icon: Clock, title: 'Slow Manual Testing', desc: 'Periodic sampling is time-consuming and delays detection.', color: 'from-amber-400 to-orange-500' },
  { icon: MapPinned, title: 'Location Blind Spots', desc: 'Large water bodies have varying quality at different locations.', color: 'from-blue-400 to-cyan-500' },
  { icon: Mountain, title: 'Complex Mining Contamination', desc: 'Mining-affected areas face heavy-metal and chemical risks.', color: 'from-purple-400 to-indigo-500' },
  { icon: FlaskConical, title: 'Late Pollution Detection', desc: 'Contamination often goes unnoticed until it becomes severe.', color: 'from-teal-400 to-green-500' },
  { icon: Languages, title: 'Technical Barrier for Citizens', desc: 'Ordinary people cannot interpret pH, TDS, or turbidity values.', color: 'from-pink-400 to-rose-500' },
];

export default function Slide02Problem() {
  return (
    <SlideShell>
      <SlideBadge>Problem Statement</SlideBadge>
      <SlideTitle>The Water Monitoring Gap</SlideTitle>
      <SlideSubtitle>Rural and mining-affected areas face critical challenges in water-quality management</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 content-center">
        {problems.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-cyan-200 transition-all">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
        <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-700 font-medium">
          Authorities need location-based, real-time data for faster action — not periodic lab reports.
        </p>
      </div>
    </SlideShell>
  );
}
