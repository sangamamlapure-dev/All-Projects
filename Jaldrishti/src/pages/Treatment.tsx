import { useState } from 'react';
import {
  FlaskConical, ArrowRight, Filter, Sun, Droplets, ShieldCheck,
  AlertTriangle, RefreshCw, CheckCircle2, Beaker, Layers, Sparkles,
  Award, ShieldAlert, FileCheck, ArrowDown
} from 'lucide-react';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui/Card';

const workflowSteps = [
  { label: 'Contaminated Water', desc: 'Raw intake sampled by boat', icon: Droplets, color: 'text-red-600 bg-red-50 border-red-200' },
  { label: 'Quality Analysis', desc: 'Real-time multi-sensor telemetry', icon: Beaker, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { label: 'Contamination ID', desc: 'Mining/organic profiling', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: 'Treatment Advisory', desc: 'Automated dosage/method logic', icon: FlaskConical, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { label: 'Purification Unit', desc: 'Point-of-use physical treatment', icon: Filter, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { label: 'Re-test Water', desc: 'Post-treatment sensor probe', icon: RefreshCw, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { label: 'Verification Audit', desc: 'Certified potability benchmark', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
];

const treatmentTypes = [
  {
    name: 'Sedimentation & Coagulation',
    desc: 'Alum / poly-aluminum chloride dosing to aggregate colloidal particles and settle silt.',
    icon: Layers,
    applicable: 'High Turbidity (> 10 NTU)',
    efficacy: '85-95% Turbidity Removal',
  },
  {
    name: 'Multi-Media Filtration',
    desc: 'Graded silica sand and gravel bed to trap suspended solids and particulate floc.',
    icon: Filter,
    applicable: 'Suspended Solids & Flakes',
    efficacy: 'Removes particles down to 10µm',
  },
  {
    name: 'Granular Activated Carbon (GAC)',
    desc: 'Highly porous microporous carbon to absorb pesticides, VOCs, chlorine, and organic odor.',
    icon: Sparkles,
    applicable: 'Organic Leachate & Chemical Runoff',
    efficacy: '90%+ Organic Compound Adsorption',
  },
  {
    name: 'Ultraviolet (UV) Disinfection',
    desc: '254nm germicidal UV radiation disrupting DNA/RNA of bacteria, coliforms, and viruses.',
    icon: Sun,
    applicable: 'Biological & Pathogenic Contaminants',
    efficacy: '99.99% Pathogen Inactivation',
  },
  {
    name: 'Specialized Chemical Treatment',
    desc: 'Chemical precipitation, pH neutralization (lime), and ion-exchange resin for heavy metals.',
    icon: ShieldCheck,
    applicable: 'Mining Acid Runoff & Toxic Heavy Metals',
    efficacy: 'Requires Certified Lab Spectrometry Confirmation',
  },
];

export default function Treatment() {
  const [retesting, setRetesting] = useState(false);
  const [retestProgress, setRetestProgress] = useState(0);
  const [retestDone, setRetestDone] = useState(false);
  const [afterData, setAfterData] = useState({
    ph: 7.02,
    tds: 428,
    turbidity: 3.8,
    do: 6.9,
    timestamp: new Date().toLocaleTimeString(),
  });

  const handleRetest = () => {
    setRetesting(true);
    setRetestDone(false);
    setRetestProgress(10);

    const step1 = setTimeout(() => setRetestProgress(40), 600);
    const step2 = setTimeout(() => setRetestProgress(75), 1300);
    const step3 = setTimeout(() => {
      setRetestProgress(100);
      setRetesting(false);
      setRetestDone(true);
      // Realistic slight variation on re-test
      setAfterData({
        ph: parseFloat((6.95 + Math.random() * 0.15).toFixed(2)),
        tds: Math.round(410 + Math.random() * 25),
        turbidity: parseFloat((3.4 + Math.random() * 0.8).toFixed(1)),
        do: parseFloat((6.8 + Math.random() * 0.4).toFixed(1)),
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 2000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Water Treatment & Purification Support"
        subtitle="Telemetry-guided treatment decision support and post-purification re-testing verification"
      />

      {/* Mandatory Scope & Limitation Disclosure */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/90 shadow-xs flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-900">
            Official System Statement — Treatment Support Scope
          </p>
          <p className="text-xs text-blue-800 leading-relaxed">
            The JalDrishti autonomous boat detects and maps contamination. It does not physically purify an entire lake.
            The system provides treatment and purification support recommendations based on monitored water-quality conditions.
            Post-treatment re-testing verifies that point-of-use and community purification modules satisfy safe potable standards.
          </p>
        </div>
      </div>

      {/* Complete Workflow Pipeline */}
      <Card>
        <CardHeader
          title="Sense & Purify Closed-Loop Workflow"
          subtitle="From autonomous hotspot detection to certified improvement verification"
        />
        <CardBody>
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 overflow-x-auto pb-2">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 lg:flex-col lg:flex-1 min-w-[130px]">
                  <div className="flex flex-col items-center gap-2 text-center p-3 rounded-2xl border bg-white flex-1 w-full shadow-xs">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{step.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{step.desc}</p>
                    </div>
                  </div>

                  {i < workflowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-300 lg:hidden shrink-0 mx-auto" />
                  )}
                  {i < workflowSteps.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center my-auto">
                      <ArrowRight className="w-4 h-4 text-cyan-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Treatment Methods & Mining Contamination Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Treatment Modalities */}
        <Card>
          <CardHeader
            title="Purification & Treatment Modalities"
            subtitle="Matched dynamically against detected contaminant signatures"
          />
          <CardBody>
            <div className="space-y-3">
              {treatmentTypes.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-800">{t.name}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                          {t.applicable}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">Efficacy: {t.efficacy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Mining Contamination Advisory */}
        <div className="space-y-4">
          <Card className="border-l-4 border-l-red-500 overflow-hidden">
            <CardHeader
              title="Mining-Affected Water Notice — Zone C"
              subtitle="Specialized Chemical Treatment Advisory"
              action={<span className="text-[10px] px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold">CRITICAL WARNING</span>}
            />
            <CardBody className="space-y-3">
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-900">Possible Heavy Metal Contamination</p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Extremely elevated TDS (&gt; 1000 ppm) and acidic pH (&lt; 5.8) detected in mining runoff sectors.
                    These parameters strongly indicate dissolved heavy metal ions (Lead, Arsenic, Cadmium, Iron).
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 mb-1">Crucial Scientific Constraint:</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Specialized treatment and laboratory confirmation required. Normal sand or carbon filtration
                  <b> CANNOT</b> remove dissolved heavy metal ions or neutralize strong acid mine drainage.
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Step 1: Collect sealed grab samples for Atomic Absorption Spectroscopy (AAS).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Step 2: Dosing with hydrated lime (Ca(OH)₂) for hydroxide precipitation.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Step 3: Ion-exchange resins or Reverse Osmosis (RO) under controlled pressure.</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Point of Use Hardware Specification */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-bold text-cyan-300">Point-of-Use Community Module (Proposed Extension)</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When JalDrishti identifies non-toxic, turbid/bacterial water, it routes water through an on-board or dockside 3-stage modular unit:
              <b> 5µ Sediment Filter &rarr; Granular Activated Carbon &rarr; 16W UV Disinfection Tube.</b>
            </p>
          </div>
        </div>
      </div>

      {/* BEFORE and AFTER Cards with Real-time Re-test */}
      <Card>
        <CardHeader
          title="Before vs After Treatment Verification"
          subtitle="Demonstration: Point-of-use purification response on Zone B East Inlet sample"
          action={
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Demo / Simulated Data
            </span>
          }
        />
        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BEFORE Card */}
            <div className="p-5 rounded-2xl bg-red-50/80 border border-red-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-900">BEFORE Treatment</p>
                    <p className="text-[10px] text-red-600">Raw Contaminated Intake (Zone B)</p>
                  </div>
                </div>
                <StatusBadge status="critical" />
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'pH Level', value: '6.30', status: 'Slightly Acidic (Safe 6.5–8.5)', alert: true },
                  { label: 'TDS (Total Dissolved Solids)', value: '850 ppm', status: 'High Mineralization (> 500)', alert: true },
                  { label: 'Turbidity', value: '24.0 NTU', status: 'Heavily Murky (> 5 NTU)', alert: true },
                  { label: 'Dissolved Oxygen', value: '4.1 mg/L', status: 'Sub-optimal (< 5.0 mg/L)', alert: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-red-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                      <p className="text-[10px] text-red-600 font-medium">{item.status}</p>
                    </div>
                    <span className="text-lg font-black text-red-600 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AFTER Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">AFTER Treatment</p>
                    <p className="text-[10px] text-emerald-600">Post-Purification Re-Tested Telemetry</p>
                  </div>
                </div>
                <StatusBadge status="good" />
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'pH Level', value: afterData.ph, change: '+11% Neutralized', status: 'Potable Standard', good: true },
                  { label: 'TDS (Total Dissolved Solids)', value: `${afterData.tds} ppm`, change: '-49% Reduction', status: 'Within WHO Potable Limit', good: true },
                  { label: 'Turbidity', value: `${afterData.turbidity} NTU`, change: '-84% Clarity Gain', status: 'Crystal Clear (< 5 NTU)', good: true },
                  { label: 'Dissolved Oxygen', value: `${afterData.do} mg/L`, change: '+68% Oxygenated', status: 'Healthy Aerobic Balance', good: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-700">
                          {item.change}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-medium">{item.status}</p>
                    </div>
                    <span className="text-lg font-black text-emerald-700 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Re-test Action Button & Progress */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-800">Quality Re-Testing Control</p>
              <p className="text-[10px] text-slate-500">
                Trigger real-time multi-probe re-test to verify point-of-use filtration efficiency
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleRetest}
                disabled={retesting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${retesting ? 'animate-spin' : ''}`} />
                <span>{retesting ? 'Sampling & Re-Testing...' : 'Re-test Water Quality'}</span>
              </button>
            </div>
          </div>

          {/* Retesting Animated Progress Bar */}
          {retesting && (
            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-cyan-800">
                <span>Sampling post-treatment basin & recalculating parameters...</span>
                <span>{retestProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-cyan-100 overflow-hidden">
                <div
                  className="h-full bg-cyan-600 rounded-full transition-all duration-300"
                  style={{ width: `${retestProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Verification Badge */}
          {retestDone && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3.5 shadow-xs">
              <FileCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Improvement Verification Confirmed (Quality Audit Complete)
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Re-test timestamp: <b>{afterData.timestamp}</b>. All 4 target parameters (pH, TDS, Turbidity, DO)
                  successfully met potable thresholds specified under Bureau of Indian Standards (IS 10500: 2012).
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
