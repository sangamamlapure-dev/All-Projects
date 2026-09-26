import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Calendar, TrendingUp, BarChart3, GitCompare, Download, Filter } from 'lucide-react';
import { Card, CardHeader, CardBody, PageHeader } from '@/components/ui/Card';
import { generateHistoricalData, generateMultiZoneHistoricalData } from '@/data/simulation';

type TimeRange = 'today' | '7days' | '30days' | 'custom';

export default function HistoricalData() {
  const [range, setRange] = useState<TimeRange>('7days');
  const [compareParam, setCompareParam] = useState<'ph' | 'tds' | 'turbidity' | 'temperature' | 'dissolvedOxygen'>('tds');
  const [customStart, setCustomStart] = useState('2026-09-01');
  const [customEnd, setCustomEnd] = useState('2026-09-26');

  const hours = range === 'today' ? 12 : range === '7days' ? 168 : range === '30days' ? 720 : 48;

  // Generate historical points based on selected range
  const chartData = useMemo(() => generateHistoricalData(hours), [hours]);

  // Combined dataset for Zone A vs Zone B vs Zone C comparison
  const multiZoneData = useMemo(() => generateMultiZoneHistoricalData(24), []);

  const charts = [
    { key: 'ph', name: 'pH Trends', color: '#06b6d4', unit: '', label: 'pH Level', safe: '6.5 – 8.5' },
    { key: 'tds', name: 'TDS (Total Dissolved Solids)', color: '#3b82f6', unit: ' ppm', label: 'TDS (ppm)', safe: '< 500 ppm' },
    { key: 'turbidity', name: 'Turbidity Trends', color: '#f59e0b', unit: ' NTU', label: 'Turbidity (NTU)', safe: '< 5 NTU' },
    { key: 'temperature', name: 'Water Temperature', color: '#ef4444', unit: ' °C', label: 'Temperature (°C)', safe: '15 – 35 °C' },
    { key: 'dissolvedOxygen', name: 'Dissolved Oxygen (DO)', color: '#10b981', unit: ' mg/L', label: 'DO (mg/L)', safe: '> 5.0 mg/L' },
  ];

  const rangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today (12h)' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Historical Water Quality"
          subtitle="Long-term telemetry trend analysis and multi-zone comparative benchmarks — Demo / Simulated Data"
        />

        {/* Time Range Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {rangeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === opt.value
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="px-2 py-1 text-slate-700 bg-transparent focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="px-2 py-1 text-slate-700 bg-transparent focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Zone Comparative Benchmark Card */}
      <Card className="shadow-xs">
        <CardHeader
          title="Cross-Zone Comparative Analysis"
          subtitle="Direct parameter comparison: Zone A (North Lake) vs Zone B (East Inlet) vs Zone C (Mining Runoff)"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Compare Parameter:</span>
              <select
                value={compareParam}
                onChange={e => setCompareParam(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-cyan-500"
              >
                <option value="tds">TDS (Total Dissolved Solids)</option>
                <option value="turbidity">Turbidity (NTU)</option>
                <option value="ph">pH Level</option>
                <option value="dissolvedOxygen">Dissolved Oxygen (DO)</option>
                <option value="temperature">Water Temperature</option>
              </select>
            </div>
          }
        />
        <CardBody>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={multiZoneData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                {compareParam === 'tds' && (
                  <>
                    <Line type="monotone" dataKey="zoneA_tds" name="Zone A (Clean Baseline)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneB_tds" name="Zone B (Warning Inlet)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneC_tds" name="Zone C (Mining Runoff)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  </>
                )}

                {compareParam === 'turbidity' && (
                  <>
                    <Line type="monotone" dataKey="zoneA_turbidity" name="Zone A (Clear)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneB_turbidity" name="Zone B (Moderate)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneC_turbidity" name="Zone C (Heavy Murk)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  </>
                )}

                {compareParam === 'ph' && (
                  <>
                    <Line type="monotone" dataKey="zoneA_ph" name="Zone A (pH Neutral)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneB_ph" name="Zone B (Slight Acid)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneC_ph" name="Zone C (Acidic Mine Drainage)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  </>
                )}

                {compareParam === 'dissolvedOxygen' && (
                  <>
                    <Line type="monotone" dataKey="zoneA_do" name="Zone A (DO Healthy)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneB_do" name="Zone B (DO Sub-optimal)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneC_do" name="Zone C (DO Hypoxic)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  </>
                )}

                {compareParam === 'temperature' && (
                  <>
                    <Line type="monotone" dataKey="zoneA_temperature" name="Zone A Temp (°C)" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneB_temperature" name="Zone B Temp (°C)" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="zoneC_temperature" name="Zone C Temp (°C)" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <span>
              <b>Comparative Takeaway:</b> Zone C consistently exhibits elevated mineral ions and depressed pH from upstream discharge, validating targeted localized purification.
            </span>
            <span className="text-[11px] font-mono text-cyan-700">Simulated 24h comparative matrix</span>
          </div>
        </CardBody>
      </Card>

      {/* Grid of Individual Parameter Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map(chart => (
          <Card key={chart.key}>
            <CardHeader
              title={chart.name}
              subtitle={`Safe Standard: ${chart.safe}`}
              action={
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {range.toUpperCase()}
                </span>
              }
            />
            <CardBody>
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={Math.floor(chartData.length / 5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                    />
                    <Line
                      type="monotone"
                      dataKey={chart.key}
                      stroke={chart.color}
                      strokeWidth={2.5}
                      dot={false}
                      name={chart.label}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
