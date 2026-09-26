import {
  Users, ShieldCheck, Leaf, Mountain, CheckCircle2,
} from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const groups = [
  {
    icon: Users,
    title: 'For Citizens',
    color: 'from-green-400 to-teal-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    items: [
      'Simple water information in local language',
      'Faster alerts about water quality',
      'Nearby water-source status',
      'No technical knowledge needed',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'For Authorities',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    items: [
      'Real-time monitoring dashboard',
      'Pollution hotspot mapping',
      'Faster data-driven decisions',
      'Historical data & reports',
    ],
  },
  {
    icon: Leaf,
    title: 'For Environment',
    color: 'from-teal-400 to-cyan-500',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    items: [
      'Early pollution detection',
      'Reduced manual sampling effort',
      'Continuous monitoring coverage',
      'Better water-resource management',
    ],
  },
  {
    icon: Mountain,
    title: 'For Rural & Mining Areas',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    items: [
      'Affordable monitoring solution',
      'Reduced human exposure to contamination',
      'Data-driven intervention',
      'Solar-powered & sustainable',
    ],
  },
];

export default function Slide14Impact() {
  return (
    <SlideShell>
      <SlideBadge>Impact &amp; Benefits</SlideBadge>
      <SlideTitle>Benefits for Every Stakeholder</SlideTitle>
      <SlideSubtitle>From individual citizens to environmental authorities — JalDrishti serves all</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-center">
        {groups.map((g, i) => {
          const Icon = g.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl ${g.bg} border ${g.border} shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-800">{g.title}</h3>
              </div>
              <div className="space-y-2">
                {g.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SlideShell>
  );
}
