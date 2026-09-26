import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip as LeafletTooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  Play, Pause, Home, MapPin, Navigation, Radio, Sailboat,
  AlertTriangle, CheckCircle2, ShieldAlert, Battery, Sun, Waves,
  Maximize2, Eye, Compass
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardBody, StatusBadge, PageHeader } from '@/components/ui/Card';
import 'leaflet/dist/leaflet.css';
import type { Zone } from '@/types';

// Custom modern SVG-based DivIcons for Leaflet
const createZoneIcon = (status: 'good' | 'warning' | 'critical', name: string) => {
  const bg = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  const pulseClass = status === 'critical' ? 'animate-ping' : '';
  const label = name.split(' — ')[0].replace('Zone ', '');

  return L.divIcon({
    className: 'custom-zone-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${bg}; opacity: 0.35;" class="${pulseClass}"></span>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: ${bg}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; font-family: sans-serif;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createBoatIcon = (heading: number, mission: string) => {
  const isActive = mission === 'ACTIVE';
  return L.divIcon({
    className: 'custom-boat-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        ${isActive ? '<span style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #06b6d4; opacity: 0.4;" class="animate-ping"></span>' : ''}
        <div style="width: 34px; height: 34px; border-radius: 50%; background: #0f172a; border: 2.5px solid #06b6d4; box-shadow: 0 4px 12px rgba(6,182,212,0.5); display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.5s ease;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L19 21L12 17L5 21L12 2Z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

export default function WaterQualityMap() {
  const { zones, boat, controlBoat, selectedZoneId, setSelectedZoneId } = useData();
  const [activeZone, setActiveZone] = useState<Zone | null>(null);

  // Sync selectedZoneId from context
  useEffect(() => {
    if (selectedZoneId) {
      const target = zones.find(z => z.id === selectedZoneId);
      if (target) setActiveZone(target);
    } else {
      setActiveZone(zones[0]);
    }
  }, [selectedZoneId, zones]);

  const mapCenter: [number, number] = [21.2545, 81.6035];

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Water Quality Pollution Map"
          subtitle="Autonomous boat navigation and GPS-tagged pollution hotspot distribution"
        />

        {/* Mission Status Callout */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 text-white shadow-xs">
          <div className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Boat: {boat.currentZone} ({boat.lat.toFixed(4)}, {boat.lng.toFixed(4)})</span>
          </div>
          <span className="text-xs text-slate-300 pr-2">Speed: <b className="text-white">{boat.speed} m/s</b></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map Canvas */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden shadow-md">
            <div className="h-[560px] w-full relative">
              <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />

                {/* Breadcrumb Path History of Autonomous Boat */}
                {boat.pathHistory && boat.pathHistory.length > 1 && (
                  <Polyline
                    positions={boat.pathHistory}
                    pathOptions={{ color: '#06b6d4', weight: 3, dashArray: '6, 8', opacity: 0.75 }}
                  />
                )}

                {/* Zone Markers */}
                {zones.map(zone => (
                  <Marker
                    key={zone.id}
                    position={[zone.lat, zone.lng]}
                    icon={createZoneIcon(zone.status, zone.name)}
                    eventHandlers={{
                      click: () => {
                        setActiveZone(zone);
                        setSelectedZoneId(zone.id);
                      },
                    }}
                  >
                    <LeafletTooltip direction="top" offset={[0, -15]} opacity={0.95}>
                      <div className="text-xs font-bold text-slate-800">
                        {zone.name} — <span className="uppercase">{zone.status}</span>
                      </div>
                    </LeafletTooltip>

                    <Popup>
                      <div className="text-xs p-1 space-y-1.5 min-w-[210px]">
                        <div className="flex items-center justify-between border-b pb-1">
                          <p className="font-bold text-sm text-slate-800">{zone.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            zone.status === 'critical' ? 'bg-red-50 text-red-600' :
                            zone.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {zone.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 font-mono">
                          GPS: {zone.lat.toFixed(5)}, {zone.lng.toFixed(5)}
                        </p>

                        <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-lg text-slate-700">
                          <div>pH: <b className="text-slate-900">{zone.reading.ph}</b></div>
                          <div>TDS: <b className="text-slate-900">{zone.reading.tds} ppm</b></div>
                          <div>Turbidity: <b className="text-slate-900">{zone.reading.turbidity} NTU</b></div>
                          <div>DO: <b className="text-slate-900">{zone.reading.dissolvedOxygen} mg/L</b></div>
                          <div className="col-span-2">Temp: <b className="text-slate-900">{zone.reading.temperature} °C</b></div>
                        </div>

                        <p className="text-[10px] text-slate-400 pt-1">
                          Timestamp: {new Date(zone.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Moving Boat Marker */}
                <Marker
                  position={[boat.lat, boat.lng]}
                  icon={createBoatIcon(boat.heading, boat.mission)}
                >
                  <LeafletTooltip direction="top" offset={[0, -20]} permanent={false}>
                    <div className="text-xs font-bold text-slate-900">
                      🚤 JalDrishti Boat ({boat.speed} m/s) • {boat.currentZone}
                    </div>
                  </LeafletTooltip>

                  <Popup>
                    <div className="text-xs p-1 space-y-1.5 min-w-[200px]">
                      <div className="flex items-center gap-1.5 border-b pb-1 font-bold text-slate-900">
                        <Sailboat className="w-4 h-4 text-cyan-600" />
                        <span>JalDrishti Autonomous Vessel #1</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Autonomous Surface Vessel (ASV)</p>
                      <div className="space-y-1 text-slate-700">
                        <p>Status: <b className="text-emerald-600 font-bold">{boat.status} ({boat.mission})</b></p>
                        <p>Speed: <b>{boat.speed} m/s</b> • Heading: <b>{boat.heading}°</b></p>
                        <p>Current Sector: <b className="text-cyan-700">{boat.currentZone}</b></p>
                        <p>Battery: <b>{boat.battery}%</b> {boat.solarCharging ? '(Solar Active)' : ''}</p>
                        <p>Telemetry: <b>{boat.communication}</b></p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {boat.lat.toFixed(5)}, {boat.lng.toFixed(5)}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* Map Floating Control Overlay: Start / Pause / Return */}
              <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200">
                <button
                  onClick={() => controlBoat('start')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    boat.mission === 'ACTIVE'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Mission</span>
                </button>

                <button
                  onClick={() => controlBoat('pause')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    boat.mission === 'PAUSED'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>

                <button
                  onClick={() => controlBoat('return')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Return to Base</span>
                </button>
              </div>

              {/* Floating Map Legend */}
              <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-3.5 max-w-xs">
                <p className="text-xs font-bold text-slate-800 mb-2">Water Quality Legend</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                    <span className="text-slate-700 font-medium">GOOD — Potable / Baseline Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200 shrink-0" />
                    <span className="text-slate-700 font-medium">WARNING — Elevated Turbidity / TDS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200 shrink-0" />
                    <span className="text-slate-700 font-medium">CRITICAL — Mining Runoff / Action Required</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 shrink-0" />
                    <span className="text-slate-700 font-medium">JalDrishti Boat (Autonomous Path)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Zone Details & Selection Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Monitored Sectors"
              subtitle={`${zones.length} active GPS beacons`}
            />
            <CardBody>
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {zones.map(zone => {
                  const isSelected = (activeZone?.id === zone.id);
                  return (
                    <div
                      key={zone.id}
                      onClick={() => {
                        setActiveZone(zone);
                        setSelectedZoneId(zone.id);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-50/70 shadow-xs'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-800">{zone.name.split(' — ')[0]}</span>
                        </div>
                        <StatusBadge status={zone.status} />
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mb-2">{zone.name.split(' — ')[1]}</p>

                      <div className="grid grid-cols-2 gap-1 text-[11px] bg-white/80 p-1.5 rounded-lg border border-slate-100">
                        <span>pH: <b>{zone.reading.ph}</b></span>
                        <span>TDS: <b>{zone.reading.tds} ppm</b></span>
                        <span>Turb: <b>{zone.reading.turbidity} NTU</b></span>
                        <span>DO: <b>{zone.reading.dissolvedOxygen} mg/L</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Active Zone Detail Inspect Card */}
          {activeZone && (
            <Card>
              <CardHeader
                title="Sector Telemetry"
                subtitle={activeZone.name}
                action={<StatusBadge status={activeZone.status} />}
              />
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" /> GPS Tag
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {activeZone.lat.toFixed(5)}, {activeZone.lng.toFixed(5)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Water Quality Status:</span>
                    <b className="uppercase">{activeZone.status}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Temperature:</span>
                    <b>{activeZone.reading.temperature} °C</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Telemetry Time:</span>
                    <span>{new Date(activeZone.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {activeZone.status === 'critical' ? (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span><b>Critical Pollution Alert:</b> Immediate multi-stage treatment and certified lab validation advised.</span>
                  </div>
                ) : activeZone.status === 'warning' ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span><b>Elevated Turbidity / TDS:</b> Deploy boat transect scan and sedimentation barrier.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span><b>Clean Baseline:</b> Water parameter readings strictly adhere to potable thresholds.</span>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
