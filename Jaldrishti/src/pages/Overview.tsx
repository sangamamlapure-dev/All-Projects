import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Droplets, MapPin, Bell, Sailboat, BatteryCharging, Clock,
  ShieldAlert, Lightbulb, TrendingUp, Activity, ArrowRight,
  Cpu, Radio, Cloud, Waves, CheckCircle2, AlertTriangle, ChevronRight,
  Eye, Filter, Sparkles
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui/Card';

export default function Overview() {
  const { zones, alerts, boat, aiInsight, lastUpdated, liveHistory, setSelectedZoneId } = useData();
  const navigate = useNavigate();

  const [activeMetric, setActiveMetric] = useState<'all' | 'ph' | 'tds' | 'turbidity' | 'temperature' | 'dissolvedOxygen'>('all');
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [selectedFlowStep, setSelectedFlowStep] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.max(0, Math.round((Date.now() - lastUpdated) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const overallStatus = zones.some(z => z.status === 'critical')
    ? 'critical' : zones.some(z => z.status === 'warning')
    ? 'warning' : 'good';

  const overallLabel = overallStatus === 'critical' ? 'CRITICAL' : overallStatus === 'warning' ? 'WARNING' : 'GOOD';
  const activeAlerts = alerts.filter(a => !a.resolved).length;

  const summaryCards = [
    {
      label: 'Overall Water Quality',
      value: overallLabel,
      sub: `${zones.filter(z => z.status === 'good').length}/${zones.length} Zones Safe`,
      icon: Droplets,
      color: overallStatus === 'critical' ? 'from-red-500 to-rose-600' : overallStatus === 'warning' ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600',
      status: overallStatus,
      link: '/live',
    },
    {
      label: 'Active Monitoring Zones',
      value: String(zones.length).padStart(2, '0'),
      sub: 'GPS geo-tagged points',
      icon: MapPin,
      color: 'from-teal-500 to-cyan-600',
      link: '/map',
    },
    {
      label: 'Active Alerts',
      value: String(activeAlerts).padStart(2, '0'),
      sub: `${alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length} Critical requiring action`,
      icon: Bell,
      color: activeAlerts > 0 ? 'from-amber-500 to-red-500' : 'from-slate-500 to-slate-600',
      link: '/alerts',
    },
    {
      label: 'Boat Status',
      value: boat.status,
      sub: `Mission: ${boat.mission} (${boat.speed} m/s)`,
      icon: Sailboat,
      color: 'from-blue-500 to-indigo-600',
      link: '/boat',
    },
    {
      label: 'Battery & Solar',
      value: `${boat.battery}%`,
      sub: boat.solarCharging ? 'Solar charging active' : 'Discharging',
      icon: BatteryCharging,
      color: boat.battery > 50 ? 'from-green-500 to-teal-600' : 'from-amber-500 to-orange-600',
      link: '/boat',
    },
    {
      label: 'Last Updated',
      value: `${secondsAgo}s ago`,
      sub: 'Simulated real-time IoT rate',
      icon: Clock,
      color: 'from-slate-600 to-slate-800',
      link: '/live',
    },
  ];

  const riskColor = aiInsight.riskLevel === 'CRITICAL'
    ? 'text-red-700 bg-red-50 border-red-200'
    : aiInsight.riskLevel === 'HIGH'
    ? 'text-orange-700 bg-orange-50 border-orange-200'
    : aiInsight.riskLevel === 'MEDIUM'
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const systemFlowSteps = [
    { title: 'Water Body', desc: 'Rural / Mining lake reservoir basin', icon: Waves },
    { title: 'JalDrishti Boat', desc: 'Solar autonomous patrol vessel', icon: Sailboat },
    { title: 'Sensor Array', desc: 'pH, TDS, Turbidity, Temp, DO', icon: Droplets },
    { title: 'ESP32 MCU', desc: 'On-board telemetry acquisition', icon: Cpu },
    { title: 'GPS NEO-6M', desc: 'Precise coordinates tagging', icon: MapPin },
    { title: 'Wi-Fi / GSM / LoRa', desc: 'Multi-bearer wireless link', icon: Radio },
    { title: 'Cloud / Firebase', desc: 'Real-time telemetry ingestion', icon: Cloud },
    { title: 'Risk Analysis', desc: 'Automated predictive evaluation', icon: Sparkles },
    { title: 'Map Dashboard', desc: 'Live hotspot visualization', icon: Activity },
    { title: 'Auto Alerts', desc: 'Threshold breach dispatch', icon: Bell },
    { title: 'Treatment Support', desc: 'Chemical & barrier advisories', icon: Filter },
    { title: 'Re-testing & Verification', desc: 'Post-treatment validation', icon: CheckCircle2 },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header with presentation callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Water Quality Overview"
          subtitle="Real-time monitoring of rural and mining-affected water bodies"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/presentation')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold text-xs shadow-md hover:from-cyan-900 hover:to-slate-900 border border-slate-700 transition-all"
          >
            <span>Project Presentation</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => navigate(card.link)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-[18px] h-[18px] text-white" />
                  </div>
                  {card.status && <StatusBadge status={card.status} />}
                </div>
                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5 tabular-nums">{card.value}</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-2 pt-2 border-t border-slate-100 truncate">
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts + AI Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Real-time Water Quality Trend */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Water Quality Trend"
            subtitle="Continuous real-time sensor readings stream — automatically updates"
            action={
              <div className="flex items-center gap-2">
                {/* Metric Selector Pills */}
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-slate-100 text-[11px] font-medium">
                  {(['all', 'ph', 'tds', 'turbidity', 'dissolvedOxygen'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-2 py-1 rounded-md transition-all ${
                        activeMetric === m ? 'bg-white text-slate-800 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {m === 'all' ? 'All' : m.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span>LIVE</span>
                </div>
              </div>
            }
          />
          <CardBody>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ovPh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ovTds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ovTurb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ovTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ovDo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                  {(activeMetric === 'all' || activeMetric === 'ph') && (
                    <Area type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" fillOpacity={1} fill="url(#ovPh)" strokeWidth={2} />
                  )}
                  {(activeMetric === 'all' || activeMetric === 'tds') && (
                    <Area type="monotone" dataKey="tds" name="TDS (ppm)" stroke="#3b82f6" fillOpacity={1} fill="url(#ovTds)" strokeWidth={2} />
                  )}
                  {(activeMetric === 'all' || activeMetric === 'turbidity') && (
                    <Area type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#f59e0b" fillOpacity={1} fill="url(#ovTurb)" strokeWidth={2} />
                  )}
                  {(activeMetric === 'all' || activeMetric === 'temperature') && (
                    <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" fillOpacity={1} fill="url(#ovTemp)" strokeWidth={2} />
                  )}
                  {(activeMetric === 'all' || activeMetric === 'dissolvedOxygen') && (
                    <Area type="monotone" dataKey="dissolvedOxygen" name="DO (mg/L)" stroke="#10b981" fillOpacity={1} fill="url(#ovDo)" strokeWidth={2} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Dynamic sliding stream: updates every {lastUpdated ? '3s' : '5s'}</span>
              <span>Values synchronized across all application views</span>
            </div>
          </CardBody>
        </Card>

        {/* AI Demo / Predictive Analytics Panel */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              title="AI Water Quality Risk Analysis"
              subtitle="Predictive Analytics & Environmental Health"
              action={
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  AI Demo / Predictive Analytics
                </span>
              }
            />
            <CardBody>
              {/* Dynamic Risk Score Header */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${riskColor} mb-4 shadow-xs`}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">Risk Classification</p>
                  <p className="text-2xl font-black">{aiInsight.riskLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">Risk Index</p>
                  <p className="text-2xl font-black">{aiInsight.riskScore}<span className="text-sm font-semibold opacity-70">/100</span></p>
                </div>
              </div>

              {/* Progress gauge */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                  <span>Safe (0)</span>
                  <span>Moderate (50)</span>
                  <span>Critical (100)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      aiInsight.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                      aiInsight.riskLevel === 'HIGH' ? 'bg-orange-500' :
                      aiInsight.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${aiInsight.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">AI Telemetry Insight</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{aiInsight.insight}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Pollution Trend & Hotspot</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Trend: <span className="font-semibold text-slate-800 capitalize">{aiInsight.pollutionTrend}</span> • Hotspot: <span className="font-semibold text-slate-800">{aiInsight.hotspotZone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <ArrowRight className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Recommended Action</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{aiInsight.recommendedAction}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </div>

          <div className="px-5 pb-5 pt-2">
            <button
              onClick={() => navigate('/treatment')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore Treatment Support Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      </div>

      {/* Monitoring Zones Live Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Monitoring Zones Telemetry</h2>
            <p className="text-xs text-slate-500">Live GPS-tagged sensors deployed across water body sectors</p>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
          >
            <span>Open Interactive Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {zones.map(zone => (
            <div
              key={zone.id}
              onClick={() => {
                setSelectedZoneId(zone.id);
                navigate('/map');
              }}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-cyan-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                  {zone.name.split(' — ')[0]}
                </span>
                <StatusBadge status={zone.status} />
              </div>
              <p className="text-[10px] text-slate-400 truncate mb-3">{zone.name.split(' — ')[1] || 'Sensor Sector'}</p>

              <div className="grid grid-cols-2 gap-2 text-center bg-slate-50/80 p-2 rounded-xl mb-2">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">pH</p>
                  <p className="text-xs font-bold text-slate-800">{zone.reading.ph}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">TDS</p>
                  <p className="text-xs font-bold text-slate-800">{zone.reading.tds} <span className="text-[8px] font-normal">ppm</span></p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Turbidity</p>
                  <p className="text-xs font-bold text-slate-800">{zone.reading.turbidity} <span className="text-[8px] font-normal">NTU</span></p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">DO</p>
                  <p className="text-xs font-bold text-slate-800">{zone.reading.dissolvedOxygen} <span className="text-[8px] font-normal">mg/L</span></p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="font-mono">{zone.lat.toFixed(3)}, {zone.lng.toFixed(3)}</span>
                <span className="text-cyan-600 font-semibold group-hover:underline flex items-center gap-0.5">
                  View <Eye className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual System Flow Architecture */}
      <Card>
        <CardHeader
          title="JalDrishti Integrated System Architecture Flow"
          subtitle="End-to-end data pipeline from physical water sampling to treatment verification"
          action={
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              12 Integrated Stages
            </span>
          }
        />
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {systemFlowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = selectedFlowStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFlowStep(isSelected ? null : idx)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-cyan-600 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-full">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">{step.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <b>Closed Sense-and-Verify Loop:</b> Continuous autonomous telemetry streams seamlessly to cloud, informing local authorities and directing point-of-use purification.
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-700 font-semibold whitespace-nowrap">
              ESP32 &rarr; MQTT/Firebase &rarr; React Dashboard
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
