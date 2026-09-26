import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, AlertCircle, Info, MapPin, Clock, CheckCircle2,
  Eye, Check, Bell, Filter, CheckCheck, RefreshCw
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, CardHeader, CardBody, PageHeader } from '@/components/ui/Card';
import type { AlertSeverity } from '@/types';

const severityConfig: Record<AlertSeverity, {
  bg: string; border: string; text: string; badge: string; icon: typeof AlertTriangle; label: string; ring: string;
}> = {
  CRITICAL: {
    bg: 'bg-red-50/80',
    border: 'border-l-red-500',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border border-red-200',
    icon: AlertCircle,
    label: 'CRITICAL',
    ring: 'ring-red-100',
  },
  WARNING: {
    bg: 'bg-amber-50/80',
    border: 'border-l-amber-500',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    icon: AlertTriangle,
    label: 'WARNING',
    ring: 'ring-amber-100',
  },
  INFO: {
    bg: 'bg-blue-50/80',
    border: 'border-l-blue-500',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: Info,
    label: 'INFO',
    ring: 'ring-blue-100',
  },
};

export default function Alerts() {
  const { alerts, acknowledgeAlert, resolveAlert, setSelectedZoneId, zones } = useData();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | AlertSeverity>('all');
  const navigate = useNavigate();

  const filtered = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'active') return !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return a.severity === filter;
  });

  const counts = {
    total: alerts.length,
    active: alerts.filter(a => !a.resolved).length,
    critical: alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length,
    warning: alerts.filter(a => a.severity === 'WARNING' && !a.resolved).length,
    info: alerts.filter(a => a.severity === 'INFO' && !a.resolved).length,
    resolved: alerts.filter(a => a.resolved).length,
  };

  const handleViewLocation = (alertZoneName: string, zoneId?: string) => {
    // Find matching zone
    const targetZone = zones.find(z => (zoneId && z.id === zoneId) || z.name.toLowerCase().includes(alertZoneName.toLowerCase().split(' — ')[0]));
    if (targetZone) {
      setSelectedZoneId(targetZone.id);
    }
    navigate('/map');
  };

  const handleAcknowledgeAll = () => {
    alerts.filter(a => !a.acknowledged && !a.resolved).forEach(a => acknowledgeAlert(a.id));
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Water Quality Alerts"
          subtitle="Real-time incident dispatch triggered automatically when simulated sensors breach configured thresholds"
        />

        {counts.active > 0 && (
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all border border-slate-200 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-slate-600" />
            <span>Acknowledge All Active ({counts.active})</span>
          </button>
        )}
      </div>

      {/* KPI Counters & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-red-800">{counts.critical} Critical</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">{counts.warning} Warning</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-800">{counts.info} Info</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">{counts.resolved} Resolved</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          {(['all', 'active', 'CRITICAL', 'WARNING', 'INFO', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'all' ? 'All Alerts' : f === 'active' ? 'Active' : f === 'resolved' ? 'Resolved' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(alert => {
          const config = severityConfig[alert.severity] || severityConfig.INFO;
          const Icon = config.icon;

          return (
            <Card
              key={alert.id}
              className={`border-l-4 ${config.border} transition-all ${alert.resolved ? 'opacity-65 bg-slate-50/50' : 'bg-white'}`}
            >
              <CardBody className="pt-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className={`w-5 h-5 ${config.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                          {config.label}
                        </span>

                        {alert.resolved ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> RESOLVED
                          </span>
                        ) : alert.acknowledged ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            ACKNOWLEDGED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 animate-pulse">
                            NEW / UNREAD
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{alert.title}</h3>

                    {/* Sensor Metric Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold truncate">{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Sensor: <b className="text-slate-800">{alert.sensor}</b></span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Breach Reading:</span>
                        <span className="font-mono font-bold text-slate-900">{alert.value}</span>
                      </div>
                    </div>

                    {/* Action Advisory */}
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
                      <span className="font-bold">Recommended Protocol: </span>
                      <span>{alert.action}</span>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      {!alert.resolved && !alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-slate-600" />
                          <span>Acknowledge</span>
                        </button>
                      )}

                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resolve Incident</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleViewLocation(alert.location, alert.zoneId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200 transition-all shadow-xs ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-700" />
                        <span>View on Map</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardBody className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Alerts in this View</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All monitored water quality parameters are currently within safe baseline ranges.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
