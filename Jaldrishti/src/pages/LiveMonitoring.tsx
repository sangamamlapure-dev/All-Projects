import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Activity, Droplets, Gauge, Waves, Thermometer, Fish, Wifi, CheckCircle2,
  XCircle, Clock, TrendingUp, TrendingDown, RefreshCw, Cpu, Satellite, Radio,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui/Card';

export default function LiveMonitoring() {
  const { zones, boat, sensorStatuses, settings, lastUpdated, liveHistory } = useData();
  const [selectedSource, setSelectedSource] = useState<string>('boat');
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.max(0, Math.round((Date.now() - lastUpdated) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Determine current active reading based on selection
  const activeZone = zones.find(z => z.id === selectedSource) || zones[0];
  const reading = selectedSource === 'boat'
    ? (zones.find(z => z.name.includes(boat.currentZone))?.reading || zones[0].reading)
    : activeZone.reading;

  const sensorCards = [
    {
      label: 'pH Level',
      value: reading.ph,
      unit: '',
      icon: Droplets,
      color: 'cyan',
      status: reading.ph < settings.thresholds.phMinWarning || reading.ph > settings.thresholds.phMaxWarning
        ? (reading.ph < (settings.thresholds.phMinCritical || 5.5) || reading.ph > (settings.thresholds.phMaxCritical || 9.5) ? 'critical' : 'warning')
        : 'good',
      safe: `${settings.thresholds.phMinWarning} – ${settings.thresholds.phMaxWarning}`,
      trend: reading.ph > 7.0 ? 'up' : 'down',
      desc: 'Acidity / Alkalinity Balance',
    },
    {
      label: 'Total Dissolved Solids (TDS)',
      value: reading.tds,
      unit: 'ppm',
      icon: Gauge,
      color: 'blue',
      status: reading.tds >= (settings.thresholds.tdsCritical || 800)
        ? 'critical'
        : reading.tds >= (settings.thresholds.tdsWarning || 500)
        ? 'warning'
        : 'good',
      safe: `< ${settings.thresholds.tdsWarning || 500} ppm`,
      trend: reading.tds > 450 ? 'up' : 'down',
      desc: 'Mineral & inorganic salt concentration',
    },
    {
      label: 'Turbidity',
      value: reading.turbidity,
      unit: 'NTU',
      icon: Waves,
      color: 'amber',
      status: reading.turbidity >= (settings.thresholds.turbidityCritical || 20)
        ? 'critical'
        : reading.turbidity >= (settings.thresholds.turbidityWarning || 10)
        ? 'warning'
        : 'good',
      safe: `< ${settings.thresholds.turbidityWarning || 10} NTU`,
      trend: reading.turbidity > 5 ? 'up' : 'down',
      desc: 'Suspended particulate cloudiness',
    },
    {
      label: 'Temperature',
      value: reading.temperature,
      unit: '°C',
      icon: Thermometer,
      color: 'red',
      status: 'good',
      safe: '15 – 35 °C',
      trend: 'up',
      desc: 'Water thermal layer indicator',
    },
    {
      label: 'Dissolved Oxygen (DO)',
      value: reading.dissolvedOxygen,
      unit: 'mg/L',
      icon: Fish,
      color: 'green',
      status: reading.dissolvedOxygen <= (settings.thresholds.doMinCritical || 3.5)
        ? 'critical'
        : reading.dissolvedOxygen <= (settings.thresholds.doMinWarning || 5.0)
        ? 'warning'
        : 'good',
      safe: `> ${settings.thresholds.doMinWarning || 5.0} mg/L`,
      trend: reading.dissolvedOxygen < 5.5 ? 'down' : 'up',
      desc: 'Aquatic biological life support',
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; fill: string }> = {
    cyan: { bg: 'from-cyan-500 to-blue-500', text: 'text-cyan-600', border: 'border-cyan-200', fill: '#06b6d4' },
    blue: { bg: 'from-blue-500 to-indigo-500', text: 'text-blue-600', border: 'border-blue-200', fill: '#3b82f6' },
    amber: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600', border: 'border-amber-200', fill: '#f59e0b' },
    red: { bg: 'from-red-500 to-rose-500', text: 'text-red-600', border: 'border-red-200', fill: '#ef4444' },
    green: { bg: 'from-green-500 to-teal-500', text: 'text-green-600', border: 'border-green-200', fill: '#10b981' },
  };

  const sensorList = [
    { name: 'ESP32 Controller', key: 'ESP32', protocol: 'SPI / I2C Bus', icon: Cpu },
    { name: 'pH Sensor', key: 'pH', protocol: 'Analog (SEN0161)', icon: Droplets },
    { name: 'TDS Sensor', key: 'TDS', protocol: 'Analog (DFRobot)', icon: Gauge },
    { name: 'Turbidity Sensor', key: 'Turbidity', protocol: 'Optical Analog (TS-300)', icon: Waves },
    { name: 'Temperature Sensor', key: 'Temperature', protocol: '1-Wire Digital (DS18B20)', icon: Thermometer },
    { name: 'DO Sensor', key: 'DO', protocol: 'Galvanic Probe', icon: Fish },
    { name: 'GPS Module (NEO-6M)', key: 'GPS', protocol: 'UART NMEA @ 9600 baud', icon: Satellite },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Live Water Quality Monitoring"
          subtitle="Real-time synchronized telemetry streaming from JalDrishti autonomous boat & field probes"
        />

        {/* Source Selector Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 border border-slate-300/60 overflow-x-auto">
          <button
            onClick={() => setSelectedSource('boat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedSource === 'boat'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚤 Boat Live ({boat.currentZone})
          </button>
          {zones.map(z => (
            <button
              key={z.id}
              onClick={() => setSelectedSource(z.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSource === z.id
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {z.name.split(' — ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Top Banner: Animated Live Indicator & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50 via-blue-50 to-emerald-50 border border-cyan-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Telemetry Feed: ACTIVE</span>
              <span className="font-normal text-slate-500">|</span>
              <span className="text-[11px] text-cyan-700 font-semibold">
                Transmitting via {boat.communication}
              </span>
            </p>
            <p className="text-[10px] text-slate-500">
              Live IoT telemetry updating automatically every {settings.dataRefreshInterval}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Last transmission: <b className="text-slate-800 tabular-nums">{secondsAgo}s ago</b></span>
        </div>
      </div>

      {/* 5 Live Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sensorCards.map((card, i) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          const isWarning = card.status === 'warning';
          const isCritical = card.status === 'critical';

          return (
            <Card key={i} className="overflow-hidden flex flex-col justify-between">
              <div className={`h-1.5 bg-gradient-to-r ${c.bg}`} />
              <CardBody className="pt-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center shadow-xs`}>
                      <Icon className="w-[18px] h-[18px] text-white" />
                    </div>
                    <StatusBadge status={card.status as 'good' | 'warning' | 'critical'} />
                  </div>

                  <p className="text-xs text-slate-500 font-medium">{card.label}</p>

                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-3xl font-black tabular-nums tracking-tight ${
                      isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-800'
                    }`}>
                      {card.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{card.unit}</span>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{card.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Safe: <b className="text-slate-700">{card.safe}</b></span>
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    {card.trend === 'up' ? (
                      <span className="flex items-center text-blue-600 font-semibold">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> High
                      </span>
                    ) : (
                      <span className="flex items-center text-slate-500 font-semibold">
                        <TrendingDown className="w-3 h-3 mr-0.5" /> Norm
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Real-time Rolling Chart & Sensor Connection Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Dynamic Rolling Waveform Chart */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Real-Time Telemetry Stream"
            subtitle="Live buffer of incoming sensor packets — rolling sliding window"
            action={
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Streaming {settings.dataRefreshInterval}s</span>
              </div>
            }
          />
          <CardBody>
            <div className="h-[310px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liveHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="tds" name="TDS (ppm)" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="dissolvedOxygen" name="DO (mg/L)" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 px-1">
              <span>Sensor bus sampling: 1000 Hz averaged to {settings.dataRefreshInterval}s packet</span>
              <span className="font-mono text-cyan-600 font-semibold">ESP32 &rarr; MQTT Payload OK</span>
            </div>
          </CardBody>
        </Card>

        {/* Sensor Connection Status List */}
        <Card>
          <CardHeader
            title="Sensor Connection Status"
            subtitle="ESP32 hardware bus interface & probes"
            action={<Wifi className="w-4 h-4 text-emerald-500" />}
          />
          <CardBody>
            <div className="space-y-2">
              {sensorList.map(sensor => {
                const Icon = sensor.icon;
                const connected = sensorStatuses[sensor.key];
                return (
                  <div
                    key={sensor.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-200/70 flex items-center justify-center text-slate-600">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{sensor.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{sensor.protocol}</p>
                      </div>
                    </div>

                    {connected ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-[10px] font-bold text-red-600 border border-red-200">
                        <XCircle className="w-3 h-3 text-red-500" />
                        Offline
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Telemetry Stream Rate</span>
              <span className="font-semibold text-slate-700">{settings.dataRefreshInterval} seconds / packet</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
