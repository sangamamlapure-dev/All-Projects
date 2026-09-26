import { useState } from 'react';
import {
  Sliders, Bell, Sailboat, Radio, User, Mail, Save, RotateCcw,
  Gauge, Droplets, Waves, Thermometer, Fish, Wifi, CheckCircle2,
  AlertTriangle, Cpu, Satellite, Smartphone, ShieldCheck
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardBody, PageHeader } from '@/components/ui/Card';
import { DEFAULT_SETTINGS } from '@/data/simulation';

export default function Settings() {
  const { settings, updateSettings, userProfile, updateUserProfile } = useData();
  const [local, setLocal] = useState(settings);
  const [profile, setProfile] = useState(userProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(local);
    updateUserProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setLocal(DEFAULT_SETTINGS);
    updateSettings(DEFAULT_SETTINGS);
    if (DEFAULT_SETTINGS.userProfile) {
      setProfile(DEFAULT_SETTINGS.userProfile);
      updateUserProfile(DEFAULT_SETTINGS.userProfile);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateThreshold = (key: keyof typeof local.thresholds, value: number) => {
    setLocal(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value },
    }));
  };

  const toggleSetting = (key: keyof typeof local) => {
    setLocal(prev => ({ ...prev, [key]: !prev[key] } as typeof prev));
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="System Settings & Sensor Thresholds"
          subtitle="Configure real-time IoT calibration thresholds, autonomous boat telemetry limits, and notification triggers"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs border border-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold shadow-xs animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Configuration saved successfully! All real-time telemetry algorithms, alert rules, and zone evaluations have been synchronized.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Thresholds (Warning vs Critical) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Water Quality Alert Thresholds"
            subtitle="Editing these limits directly modifies real-time status calculation and automated alert generation"
            action={<Sliders className="w-4 h-4 text-cyan-600" />}
          />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Turbidity Thresholds */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Waves className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs">Turbidity (NTU)</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Warning (&gt; NTU):</span>
                    <b className="text-amber-700">{local.thresholds.turbidityWarning} NTU</b>
                  </div>
                  <input
                    type="range" min={3} max={25} step={1}
                    value={local.thresholds.turbidityWarning}
                    onChange={e => updateThreshold('turbidityWarning', parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Critical (&gt; NTU):</span>
                    <b className="text-red-700">{local.thresholds.turbidityCritical} NTU</b>
                  </div>
                  <input
                    type="range" min={15} max={50} step={1}
                    value={local.thresholds.turbidityCritical}
                    onChange={e => updateThreshold('turbidityCritical', parseFloat(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>

              {/* TDS Thresholds */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs">TDS (ppm)</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Warning (&gt; ppm):</span>
                    <b className="text-blue-700">{local.thresholds.tdsWarning} ppm</b>
                  </div>
                  <input
                    type="range" min={300} max={800} step={25}
                    value={local.thresholds.tdsWarning}
                    onChange={e => updateThreshold('tdsWarning', parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Critical (&gt; ppm):</span>
                    <b className="text-red-700">{local.thresholds.tdsCritical} ppm</b>
                  </div>
                  <input
                    type="range" min={600} max={1500} step={50}
                    value={local.thresholds.tdsCritical}
                    onChange={e => updateThreshold('tdsCritical', parseFloat(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>

              {/* pH Thresholds */}
              <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 space-y-3">
                <div className="flex items-center gap-2 text-cyan-800">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-xs">pH Safe Window</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Warning Band:</span>
                    <b className="text-cyan-700">{local.thresholds.phMinWarning} – {local.thresholds.phMaxWarning}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" step="0.1" value={local.thresholds.phMinWarning}
                      onChange={e => updateThreshold('phMinWarning', parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 text-slate-700"
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input
                      type="number" step="0.1" value={local.thresholds.phMaxWarning}
                      onChange={e => updateThreshold('phMaxWarning', parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Critical Acid/Base:</span>
                    <b className="text-red-700">&lt; {local.thresholds.phMinCritical} or &gt; {local.thresholds.phMaxCritical}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" step="0.1" value={local.thresholds.phMinCritical}
                      onChange={e => updateThreshold('phMinCritical', parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 text-slate-700"
                    />
                    <span className="text-slate-400 text-xs">or</span>
                    <input
                      type="number" step="0.1" value={local.thresholds.phMaxCritical}
                      onChange={e => updateThreshold('phMaxCritical', parseFloat(e.target.value))}
                      className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* DO Thresholds */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Fish className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs">Dissolved Oxygen (mg/L)</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Warning (&lt; mg/L):</span>
                    <b className="text-amber-700">{local.thresholds.doMinWarning} mg/L</b>
                  </div>
                  <input
                    type="range" min={4.0} max={7.0} step={0.5}
                    value={local.thresholds.doMinWarning}
                    onChange={e => updateThreshold('doMinWarning', parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Critical Hypoxia (&lt; mg/L):</span>
                    <b className="text-red-700">{local.thresholds.doMinCritical} mg/L</b>
                  </div>
                  <input
                    type="range" min={1.5} max={4.0} step={0.5}
                    value={local.thresholds.doMinCritical}
                    onChange={e => updateThreshold('doMinCritical', parseFloat(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Boat Navigation & Power Settings */}
        <Card>
          <CardHeader
            title="Boat Navigation & Power Settings"
            subtitle="Telemetry constraints and autonomous control limits"
            action={<Sailboat className="w-4 h-4 text-cyan-600" />}
          />
          <CardBody className="space-y-4">
            <ToggleRow
              label="Autonomous Mission Auto-Start"
              desc="Automatically launch monitoring patrol on scheduled timer"
              checked={local.autoMissionStart}
              onChange={() => toggleSetting('autoMissionStart')}
            />

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Cruising Speed Limit</span>
                <span className="font-bold text-cyan-700">{local.boatSpeedLimit} m/s</span>
              </div>
              <input
                type="range" min={0.8} max={3.5} step={0.1}
                value={local.boatSpeedLimit}
                onChange={e => setLocal(prev => ({ ...prev, boatSpeedLimit: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.8 m/s (Eco)</span>
                <span>2.0 m/s (Normal)</span>
                <span>3.5 m/s (Fast)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Low Battery Return-to-Base Alarm</span>
                <span className="font-bold text-red-600">{local.batteryLowAlert}%</span>
              </div>
              <input
                type="range" min={10} max={40} step={5}
                value={local.batteryLowAlert}
                onChange={e => setLocal(prev => ({ ...prev, batteryLowAlert: parseInt(e.target.value) }))}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10%</span>
                <span>Auto-dock threshold</span>
                <span>40%</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Communication & Ingestion Settings */}
        <Card>
          <CardHeader
            title="Communication & Ingestion Settings"
            subtitle="IoT telemetry refresh rate & bearer fallback"
            action={<Radio className="w-4 h-4 text-cyan-600" />}
          />
          <CardBody className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">Active Transmission Protocol</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Wi-Fi', 'GSM', 'LoRa'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLocal(prev => ({ ...prev, communicationMode: mode }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      local.communicationMode === mode
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Telemetry Ingestion Refresh Rate</span>
                <span className="font-bold text-cyan-700">{local.dataRefreshInterval} Seconds</span>
              </div>
              <input
                type="range" min={1} max={10} step={1}
                value={local.dataRefreshInterval}
                onChange={e => setLocal(prev => ({ ...prev, dataRefreshInterval: parseInt(e.target.value) }))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1s (Ultra Fast)</span>
                <span>3s (Standard Demo)</span>
                <span>10s (Eco)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
              <b>Cloud Link Architecture:</b> ESP32 broadcasts JSON MQTT payloads to broker / Firebase Firestore at the configured refresh interval.
            </div>
          </CardBody>
        </Card>

        {/* Notification Delivery Settings */}
        <Card>
          <CardHeader
            title="Notification Settings"
            subtitle="Emergency channels for critical pollution events"
            action={<Bell className="w-4 h-4 text-cyan-600" />}
          />
          <CardBody className="space-y-3">
            <ToggleRow
              label="Real-time Alert Dispatch"
              desc="Trigger automated dashboard alarms on threshold breaches"
              checked={local.alertNotificationsEnabled}
              onChange={() => toggleSetting('alertNotificationsEnabled')}
            />

            <ToggleRow
              label="Official Email Notifications"
              desc="Transmit daily digests to state pollution officer"
              checked={local.emailNotifications}
              onChange={() => toggleSetting('emailNotifications')}
              icon={Mail}
            />

            <ToggleRow
              label="GSM / SMS Emergency Dispatch"
              desc="Send direct SMS to local field team in offline rural areas"
              checked={local.smsNotifications}
              onChange={() => toggleSetting('smsNotifications')}
              icon={Smartphone}
            />
          </CardBody>
        </Card>

        {/* User Profile Settings */}
        <Card>
          <CardHeader
            title="User Profile Configuration"
            subtitle="Change display name, department, role, and credentials across the application"
            action={<User className="w-4 h-4 text-cyan-600" />}
          />
          <CardBody className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Enter any user name (e.g. your name, evaluator name, etc.)..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Official Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">System Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                placeholder="e.g. Senior Environmental Analyst, Project Lead..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange, icon: Icon }: {
  label: string; desc: string; checked: boolean; onChange: () => void; icon?: any;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <div>
          <p className="text-xs font-bold text-slate-800">{label}</p>
          <p className="text-[10px] text-slate-500">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-cyan-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}
