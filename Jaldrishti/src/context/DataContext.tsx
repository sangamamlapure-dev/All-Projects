import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import type {
  SensorReading,
  Zone,
  AlertItem,
  BoatData,
  AIInsight,
  HistoricalPoint,
  Settings,
  ReportItem,
  UserProfile,
} from '@/types';
import {
  DEFAULT_SETTINGS,
  INITIAL_ZONES,
  INITIAL_ALERTS,
  INITIAL_BOAT,
  INITIAL_REPORTS,
  BOAT_WAYPOINTS,
  generateReading,
  generateAIInsight,
  statusFromReading,
  generateHistoricalData,
} from '@/data/simulation';

interface DataContextType {
  zones: Zone[];
  alerts: AlertItem[];
  boat: BoatData;
  aiInsight: AIInsight;
  settings: Settings;
  lastUpdated: number;
  globalReading: SensorReading;
  sensorStatuses: Record<string, boolean>;
  liveHistory: HistoricalPoint[];
  reports: ReportItem[];
  selectedZoneId: string | null;
  userProfile: UserProfile;
  setSelectedZoneId: (id: string | null) => void;
  updateSettings: (s: Settings) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  addAlert: (a: AlertItem) => void;
  controlBoat: (action: 'start' | 'pause' | 'return') => void;
  addNewReport: (r: ReportItem) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [boat, setBoat] = useState<BoatData>(INITIAL_BOAT);
  const [aiInsight, setAiInsight] = useState<AIInsight>(() => generateAIInsight(INITIAL_ZONES));
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [liveHistory, setLiveHistory] = useState<HistoricalPoint[]>(() => generateHistoricalData(12));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('jaldrishti_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return DEFAULT_SETTINGS.userProfile || {
      name: 'Dr. R. Sharma',
      role: 'Environmental Analyst',
      department: 'Dept. of Higher & Technical Education / CPCB',
      email: 'r.sharma@jaldrishti.gov.in',
    };
  });

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('jaldrishti_user_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const [sensorStatuses, setSensorStatuses] = useState<Record<string, boolean>>({
    ESP32: true,
    pH: true,
    TDS: true,
    Turbidity: true,
    Temperature: true,
    DO: true,
    GPS: true,
  });

  const tickRef = useRef(0);

  // Update zones with gradual random-walk
  const updateZones = useCallback(() => {
    setZones(prevZones => {
      const updated = prevZones.map(zone => {
        const newReading = generateReading(zone.reading);
        const newStatus = statusFromReading(newReading, settings.thresholds);
        return {
          ...zone,
          reading: newReading,
          status: newStatus,
          timestamp: new Date().toISOString(),
        };
      });

      // Recalculate AI insight based on synchronized zone states
      setAiInsight(generateAIInsight(updated));

      // Threshold check: generate dynamic alert if safe levels are breached
      if (settings.alertNotificationsEnabled) {
        updated.forEach(zone => {
          const { reading, status, name, id } = zone;
          if (status === 'critical' || status === 'warning') {
            // Check if active alert already exists for this zone
            setAlerts(prevAlerts => {
              const hasActiveAlert = prevAlerts.some(
                a => a.location === name && !a.resolved && a.severity === (status === 'critical' ? 'CRITICAL' : 'WARNING')
              );

              if (hasActiveAlert) return prevAlerts;

              let triggeredSensor = 'Turbidity';
              let triggeredVal = `${reading.turbidity} NTU`;
              let actionMsg = 'Inspect zone and perform treatment assessment.';

              if (reading.turbidity >= (settings.thresholds.turbidityCritical || 20)) {
                triggeredSensor = 'Turbidity';
                triggeredVal = `${reading.turbidity} NTU`;
                actionMsg = 'Severe suspended solids detected. Deploy sedimentation barrier.';
              } else if (reading.tds >= (settings.thresholds.tdsCritical || 800)) {
                triggeredSensor = 'TDS';
                triggeredVal = `${reading.tds} ppm`;
                actionMsg = 'High dissolved solids. Perform laboratory heavy-metal assay.';
              } else if (reading.ph <= (settings.thresholds.phMinCritical || 5.5) || reading.ph >= (settings.thresholds.phMaxCritical || 9.5)) {
                triggeredSensor = 'pH';
                triggeredVal = `${reading.ph}`;
                actionMsg = 'Extreme pH deviation detected. Chemical neutralization assessment needed.';
              } else if (reading.dissolvedOxygen <= (settings.thresholds.doMinCritical || 3.5)) {
                triggeredSensor = 'Dissolved Oxygen';
                triggeredVal = `${reading.dissolvedOxygen} mg/L`;
                actionMsg = 'Hypoxic condition. Mechanical surface aeration recommended.';
              }

              const newAlert: AlertItem = {
                id: `alert-dyn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                severity: status === 'critical' ? 'CRITICAL' : 'WARNING',
                title: `${triggeredSensor} ${status === 'critical' ? 'critical threshold exceeded' : 'warning level observed'}`,
                location: name,
                sensor: triggeredSensor,
                value: triggeredVal,
                timestamp: new Date().toISOString(),
                action: actionMsg,
                acknowledged: false,
                resolved: false,
                zoneId: id,
              };

              return [newAlert, ...prevAlerts].slice(0, 30);
            });
          }
        });
      }

      return updated;
    });
  }, [settings.thresholds, settings.alertNotificationsEnabled]);

  // Update boat telemetry and waypoint progression
  const updateBoat = useCallback(() => {
    setBoat(prev => {
      let battery = prev.battery;
      let speed = prev.speed;
      let lat = prev.lat;
      let lng = prev.lng;
      let heading = prev.heading;
      let targetIdx = prev.targetWaypointIndex;
      let currentZone = prev.currentZone;
      let missionProgress = [...prev.missionProgress];
      let pathHistory = [...prev.pathHistory];

      if (prev.mission === 'ACTIVE') {
        speed = parseFloat((1.5 + Math.random() * 0.7).toFixed(1));

        // Battery logic
        if (prev.solarCharging) {
          battery = Math.min(100, parseFloat((battery + 0.1).toFixed(1)));
        } else {
          battery = Math.max(5, parseFloat((battery - 0.15).toFixed(1)));
        }

        // Navigate toward target waypoint
        const target = BOAT_WAYPOINTS[targetIdx] || BOAT_WAYPOINTS[0];
        const dLat = target.lat - lat;
        const dLng = target.lng - lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        // Compute angle for boat heading
        const angleRad = Math.atan2(dLng, dLat);
        const targetHeading = Math.round((angleRad * 180) / Math.PI + 360) % 360;
        heading = targetHeading;

        if (dist > 0.0003) {
          // Move toward target
          const stepSize = 0.00028;
          lat = parseFloat((lat + (dLat / dist) * stepSize).toFixed(5));
          lng = parseFloat((lng + (dLng / dist) * stepSize).toFixed(5));
        } else {
          // Waypoint reached, advance to next waypoint
          targetIdx = (targetIdx + 1) % BOAT_WAYPOINTS.length;
          currentZone = target.name.split(' — ')[0];

          // Update mission progress stepper
          if (targetIdx === 2) {
            missionProgress = [
              { step: 'Mission Started', status: 'done' },
              { step: 'Zone A Scanned', status: 'done' },
              { step: 'Zone B Scanning', status: 'active' },
              { step: 'Zone C Pending', status: 'pending' },
              { step: 'Mission Complete', status: 'pending' },
            ];
          } else if (targetIdx === 3) {
            missionProgress = [
              { step: 'Mission Started', status: 'done' },
              { step: 'Zone A Scanned', status: 'done' },
              { step: 'Zone B Scanned', status: 'done' },
              { step: 'Zone C Scanning', status: 'active' },
              { step: 'Mission Complete', status: 'pending' },
            ];
          } else if (targetIdx === 4 || targetIdx === 5) {
            missionProgress = [
              { step: 'Mission Started', status: 'done' },
              { step: 'Zone A Scanned', status: 'done' },
              { step: 'Zone B Scanned', status: 'done' },
              { step: 'Zone C Scanned', status: 'done' },
              { step: 'Mission Complete', status: 'active' },
            ];
          } else if (targetIdx === 0) {
            missionProgress = [
              { step: 'Mission Started', status: 'done' },
              { step: 'Zone A Scanned', status: 'done' },
              { step: 'Zone B Scanned', status: 'done' },
              { step: 'Zone C Scanned', status: 'done' },
              { step: 'Mission Complete', status: 'done' },
            ];
          }
        }

        // Add to path history trail (keep last 30 points)
        pathHistory = [...pathHistory, [lat, lng] as [number, number]].slice(-30);
      } else {
        speed = 0;
      }

      return {
        ...prev,
        battery: Math.round(battery),
        speed,
        lat,
        lng,
        heading,
        targetWaypointIndex: targetIdx,
        currentZone,
        missionProgress,
        pathHistory,
      };
    });
  }, []);

  // Update real-time rolling history buffer
  const updateLiveHistory = useCallback((reading: SensorReading) => {
    setLiveHistory(prev => {
      const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newPoint: HistoricalPoint = {
        time: nowStr,
        ph: reading.ph,
        tds: reading.tds,
        turbidity: reading.turbidity,
        temperature: reading.temperature,
        dissolvedOxygen: reading.dissolvedOxygen,
      };
      return [...prev.slice(1), newPoint];
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      updateZones();
      updateBoat();
      setLastUpdated(Date.now());

      // Append latest reading from active boat zone into rolling history
      setZones(cur => {
        const primaryZone = cur.find(z => z.id === 'zone-a') || cur[0];
        if (primaryZone) {
          updateLiveHistory(primaryZone.reading);
        }
        return cur;
      });

      // Maintain high sensor connectivity fidelity
      if (tickRef.current % 30 === 0) {
        setSensorStatuses(prev => ({
          ...prev,
          ESP32: true,
          GPS: true,
        }));
      }
    }, settings.dataRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [settings.dataRefreshInterval, updateZones, updateBoat, updateLiveHistory]);

  // Global reading represents active real-time vessel sensor data
  const globalReading: SensorReading = zones[0]?.reading || INITIAL_ZONES[0].reading;

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
  }, []);

  const addAlert = useCallback((a: AlertItem) => {
    setAlerts(prev => [a, ...prev].slice(0, 30));
  }, []);

  const controlBoat = useCallback((action: 'start' | 'pause' | 'return') => {
    setBoat(prev => {
      if (action === 'start') {
        return {
          ...prev,
          mission: 'ACTIVE',
          status: 'ONLINE',
          speed: 1.8,
          missionProgress: prev.missionProgress.map((step, i) => {
            if (step.status === 'pending' && i === prev.missionProgress.findIndex(s => s.status === 'pending')) {
              return { ...step, status: 'active' as const };
            }
            return step;
          }),
        };
      }
      if (action === 'pause') {
        return {
          ...prev,
          mission: 'PAUSED',
          speed: 0,
        };
      }
      if (action === 'return') {
        return {
          ...prev,
          mission: 'ACTIVE',
          targetWaypointIndex: 0, // Head to Base Station
          speed: 2.0,
        };
      }
      return prev;
    });
  }, []);

  const addNewReport = useCallback((r: ReportItem) => {
    setReports(prev => [r, ...prev]);
  }, []);

  const handleUpdateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    // Immediately re-evaluate zone statuses under updated thresholds
    setZones(prev => prev.map(zone => ({
      ...zone,
      status: statusFromReading(zone.reading, newSettings.thresholds),
    })));
  }, []);

  const value: DataContextType = {
    zones,
    alerts,
    boat,
    aiInsight,
    settings,
    lastUpdated,
    globalReading,
    sensorStatuses,
    liveHistory,
    reports,
    selectedZoneId,
    userProfile,
    setSelectedZoneId,
    updateSettings: handleUpdateSettings,
    updateUserProfile,
    acknowledgeAlert,
    resolveAlert,
    addAlert,
    controlBoat,
    addNewReport,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
