import {
  Sailboat, BatteryCharging, Sun, Navigation, Gauge, Radio,
  MapPin, Wifi, Play, Pause, Home, CheckCircle2, Circle, Loader2,
  Activity, Cpu, Satellite, Zap, Compass, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui/Card';

export default function BoatMonitoring() {
  const { boat, sensorStatuses, controlBoat, settings } = useData();

  const statusCards = [
    {
      label: 'Boat Status',
      value: boat.status,
      icon: Sailboat,
      color: 'from-blue-500 to-indigo-600',
      badge: boat.status === 'ONLINE' ? 'online' : 'offline',
      sub: 'ESP32 Controller Active',
    },
    {
      label: 'Mission Status',
      value: boat.mission,
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      sub: boat.mission === 'ACTIVE' ? 'Autonomous scanning' : 'Vessel holding',
    },
    {
      label: 'Battery Level',
      value: `${boat.battery}%`,
      icon: BatteryCharging,
      color: 'from-emerald-500 to-teal-600',
      battery: boat.battery,
      sub: `${(11.8 + (boat.battery / 100) * 0.8).toFixed(1)}V LiFePO4 Cell`,
    },
    {
      label: 'Solar Photovoltaic',
      value: boat.solarCharging ? 'ACTIVE' : 'INACTIVE',
      icon: Sun,
      color: 'from-amber-500 to-orange-600',
      sub: boat.solarCharging ? '+18.4V Peak Solar Harvest' : 'No Solar Generation',
    },
    {
      label: 'GPS Receiver',
      value: boat.gps,
      icon: Navigation,
      color: 'from-teal-500 to-cyan-600',
      sub: `${boat.lat.toFixed(4)}, ${boat.lng.toFixed(4)}`,
    },
    {
      label: 'Cruising Speed',
      value: `${boat.speed} m/s`,
      icon: Gauge,
      color: 'from-slate-600 to-slate-800',
      sub: `Limit: ${settings.boatSpeedLimit} m/s • Heading: ${boat.heading}°`,
    },
    {
      label: 'Current Sector',
      value: boat.currentZone,
      icon: MapPin,
      color: 'from-purple-500 to-pink-600',
      sub: 'Active sampling coordinates',
    },
    {
      label: 'Communication Link',
      value: boat.communication,
      icon: Radio,
      color: 'from-blue-500 to-cyan-600',
      sub: 'Telemetry fallback ready',
    },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="JalDrishti Monitoring Boat"
          subtitle="Autonomous water-quality monitoring vessel — real-time hardware telemetry and mission management"
        />

        {/* Global Boat Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => controlBoat('start')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
              boat.mission === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-emerald-500/25 shadow-md'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Mission</span>
          </button>

          <button
            onClick={() => controlBoat('pause')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
              boat.mission === 'PAUSED'
                ? 'bg-amber-600 text-white shadow-amber-500/25 shadow-md'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause Mission</span>
          </button>

          <button
            onClick={() => controlBoat('return')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-sm transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Base</span>
          </button>
        </div>
      </div>

      {/* Telemetry Status Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statusCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="overflow-hidden">
              <CardBody className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-[18px] h-[18px] text-white" />
                  </div>
                  {card.badge && <StatusBadge status={card.badge as 'online' | 'offline'} />}
                </div>

                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                <p className="text-xl font-black text-slate-800 mt-0.5 tracking-tight tabular-nums">{card.value}</p>

                {card.battery !== undefined && (
                  <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        card.battery > 50 ? 'bg-emerald-500' : card.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${card.battery}%` }}
                    />
                  </div>
                )}

                <p className="text-[10px] text-slate-400 mt-2 font-mono truncate">{card.sub}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Mission Progress & Physical Hardware Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission Progress Stepper */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Autonomous Mission Execution Sequence"
            subtitle="GPS waypoint traversal & sampling sequence"
            action={
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 font-bold text-xs border border-cyan-200">
                <Compass className="w-3.5 h-3.5" />
                <span>Sector: {boat.currentZone}</span>
              </div>
            }
          />
          <CardBody>
            <div className="py-2 space-y-3">
              {boat.missionProgress.map((step, i) => {
                const isLast = i === boat.missionProgress.length - 1;
                return (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="flex flex-col items-center">
                      {step.status === 'done' ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                      ) : step.status === 'active' ? (
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center shadow-xs">
                          <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Circle className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      {!isLast && (
                        <div className={`w-0.5 h-10 ${step.status === 'done' ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                      )}
                    </div>

                    <div className="pt-1">
                      <p className={`text-sm font-bold ${
                        step.status === 'done' ? 'text-slate-600' :
                        step.status === 'active' ? 'text-cyan-700' : 'text-slate-400'
                      }`}>
                        {step.step}
                      </p>
                      {step.status === 'active' && (
                        <p className="text-xs text-cyan-600 font-medium mt-0.5">
                          Active vessel sampling scan in progress... Cruising at {boat.speed} m/s
                        </p>
                      )}
                      {step.status === 'done' && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          Transect completed & telemetry geo-tagged
                        </p>
                      )}
                      {step.status === 'pending' && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Queued in autonomous mission plan
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hardware Status Breakdown */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Motor Driver</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">L298N Dual H-Bridge</p>
                <p className="text-[9px] text-emerald-600 font-semibold mt-1">Normal (42°C)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Propulsion</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">Twin DC Thrusters</p>
                <p className="text-[9px] text-cyan-600 font-semibold mt-1">PWM 78% Thrust</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Solar Panel</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">30W Monocrystalline</p>
                <p className="text-[9px] text-amber-600 font-semibold mt-1">+1.8A Charge Current</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Communication</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">Wi-Fi + GSM Fallback</p>
                <p className="text-[9px] text-emerald-600 font-semibold mt-1">Signal RSSI -62 dBm</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* On-Board Sensor Hardware Status */}
        <Card>
          <CardHeader
            title="On-Board Sensor Array"
            subtitle="ESP32 hardware bus status"
            action={<Cpu className="w-4 h-4 text-cyan-600" />}
          />
          <CardBody>
            <div className="space-y-2.5">
              {[
                { name: 'ESP32 Controller', key: 'ESP32', icon: Cpu, desc: 'Dual-Core Xtensa 240MHz' },
                { name: 'pH Sensor', key: 'pH', icon: Activity, desc: 'Probe offset: 0.00 V' },
                { name: 'TDS Sensor', key: 'TDS', icon: Activity, desc: 'Temp compensated' },
                { name: 'Turbidity Sensor', key: 'Turbidity', icon: Activity, desc: 'Phototransistor optical' },
                { name: 'Temperature Sensor', key: 'Temperature', icon: Activity, desc: 'DS18B20 digital' },
                { name: 'DO Sensor', key: 'DO', icon: Activity, desc: 'Galvanic membrane' },
                { name: 'GPS (NEO-6M)', key: 'GPS', icon: Satellite, desc: '11 Satellites Locked' },
              ].map(sensor => {
                const Icon = sensor.icon;
                const connected = sensorStatuses[sensor.key];
                return (
                  <div
                    key={sensor.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 border border-slate-200/60">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{sensor.name}</p>
                        <p className="text-[10px] text-slate-400">{sensor.desc}</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {connected ? 'Active' : 'Offline'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Telemetry streaming via <b>{boat.communication}</b></span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
