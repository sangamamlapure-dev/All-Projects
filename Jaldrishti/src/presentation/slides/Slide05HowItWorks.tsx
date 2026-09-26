import { Eye, Cloud, Bell, RefreshCw } from 'lucide-react';
import { SlideShell, SlideBadge, SlideTitle, SlideSubtitle } from '../components/SlideShell';

const steps = [
  {
    num: '01',
    icon: Eye,
    title: 'DETECT',
    desc: 'Sensors on the autonomous boat measure pH, TDS, turbidity, temperature, and dissolved oxygen at multiple GPS-tagged locations.',
    color: 'from-cyan-400 to-blue-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
  },
  {
    num: '02',
    icon: Cloud,
    title: 'INFORM',
    desc: 'Data is sent to the cloud via Wi-Fi / GSM / LoRa and displayed on the citizen mobile app and officer web dashboard in real time.',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    num: '03',
    icon: Bell,
    title: 'ACT',
    desc: 'Pollution alerts trigger inspection and the system provides appropriate treatment / purification support recommendations.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    num: '04',
    icon: RefreshCw,
    title: 'VERIFY',
    desc: 'Water is re-tested after treatment to confirm quality improvement and verify that the intervention was effective.',
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
  },
];

export default function Slide05HowItWorks() {
  return (
    <SlideShell>
      <SlideBadge>How JalDrishti Works</SlideBadge>
      <SlideTitle>The Four-Step Cycle</SlideTitle>
      <SlideSubtitle>A continuous loop: Detect → Inform → Act → Verify</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 content-center">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="relative group">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all h-full">
                <div className={`absolute top-4 right-4 text-3xl font-extrabold ${step.bg} ${step.text} px-2 py-0.5 rounded-lg opacity-60`}>
                  {step.num}
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-wide">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-cyan-200 items-center justify-center shadow-sm">
                  <span className="text-cyan-500 text-sm font-bold">→</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${step.color} text-white text-sm font-bold shadow-md`}>
              {step.title}
            </div>
            {i < 3 && <span className="text-cyan-400 text-lg">→</span>}
          </div>
        ))}
      </div>
    </SlideShell>
  );
}
