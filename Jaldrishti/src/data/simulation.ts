import type {
  SensorReading,
  Zone,
  AlertItem,
  BoatData,
  BoatWaypoint,
  AIInsight,
  HistoricalPoint,
  ReportItem,
  Settings,
  RiskLevel,
} from '@/types';

export const BOAT_WAYPOINTS: BoatWaypoint[] = [
  { lat: 21.2578, lng: 81.6042, name: 'Base Station Dock' },
  { lat: 21.2570, lng: 81.6050, name: 'Zone A — North Lake' },
  { lat: 21.2550, lng: 81.6080, name: 'Zone B — East Inlet' },
  { lat: 21.2530, lng: 81.6020, name: 'Zone C — Mining Runoff' },
  { lat: 21.2510, lng: 81.6060, name: 'Zone D — South Shore' },
  { lat: 21.2540, lng: 81.5990, name: 'Zone E — West Bay' },
];

export const DEFAULT_SETTINGS: Settings = {
  thresholds: {
    phMin: 6.5,
    phMax: 8.5,
    tdsMax: 500,
    turbidityMax: 10,
    tempMin: 15,
    tempMax: 35,
    doMin: 5,

    turbidityWarning: 10,
    turbidityCritical: 20,
    tdsWarning: 500,
    tdsCritical: 800,
    phMinWarning: 6.5,
    phMaxWarning: 8.5,
    phMinCritical: 5.5,
    phMaxCritical: 9.5,
    doMinWarning: 5.0,
    doMinCritical: 3.5,
  },
  alertNotificationsEnabled: true,
  emailNotifications: true,
  smsNotifications: true,
  autoMissionStart: false,
  dataRefreshInterval: 3,
  communicationMode: 'Wi-Fi',
  boatSpeedLimit: 2.2,
  batteryLowAlert: 20,
  userProfile: {
    name: 'Dr. R. Sharma',
    role: 'Environmental Analyst',
    department: 'Dept. of Higher & Technical Education / CPCB',
    email: 'r.sharma@jaldrishti.gov.in',
  },
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function randomWalk(prev: number, volatility: number, min: number, max: number): number {
  const delta = (Math.random() - 0.5) * 2 * volatility;
  return clamp(prev + delta, min, max);
}

export function generateReading(prev: SensorReading): SensorReading {
  return {
    ph: parseFloat(randomWalk(prev.ph, 0.08, 4.5, 9.8).toFixed(2)),
    tds: Math.round(randomWalk(prev.tds, 15, 80, 1400)),
    turbidity: parseFloat(randomWalk(prev.turbidity, 0.6, 0.4, 45).toFixed(1)),
    temperature: parseFloat(randomWalk(prev.temperature, 0.2, 14, 38).toFixed(1)),
    dissolvedOxygen: parseFloat(randomWalk(prev.dissolvedOxygen, 0.15, 1.5, 12).toFixed(1)),
  };
}

export function statusFromReading(reading: SensorReading, thresholds: Settings['thresholds']): 'good' | 'warning' | 'critical' {
  const {
    turbidityCritical = 20,
    turbidityWarning = 10,
    tdsCritical = 800,
    tdsWarning = 500,
    phMinCritical = 5.5,
    phMaxCritical = 9.5,
    phMinWarning = 6.5,
    phMaxWarning = 8.5,
    doMinCritical = 3.5,
    doMinWarning = 5.0,
  } = thresholds;

  if (
    reading.turbidity >= turbidityCritical ||
    reading.tds >= tdsCritical ||
    reading.ph <= phMinCritical ||
    reading.ph >= phMaxCritical ||
    reading.dissolvedOxygen <= doMinCritical
  ) {
    return 'critical';
  }

  if (
    reading.turbidity >= turbidityWarning ||
    reading.tds >= tdsWarning ||
    reading.ph < phMinWarning ||
    reading.ph > phMaxWarning ||
    reading.dissolvedOxygen < doMinWarning
  ) {
    return 'warning';
  }

  return 'good';
}

export const INITIAL_ZONES: Zone[] = [
  {
    id: 'zone-a',
    name: 'Zone A — North Lake',
    lat: 21.2570,
    lng: 81.6050,
    status: 'good',
    reading: { ph: 7.18, tds: 280, turbidity: 2.1, temperature: 27.2, dissolvedOxygen: 7.2 },
    timestamp: new Date().toISOString(),
  },
  {
    id: 'zone-b',
    name: 'Zone B — East Inlet',
    lat: 21.2550,
    lng: 81.6080,
    status: 'warning',
    reading: { ph: 6.42, tds: 720, turbidity: 11.2, temperature: 28.1, dissolvedOxygen: 4.8 },
    timestamp: new Date().toISOString(),
  },
  {
    id: 'zone-c',
    name: 'Zone C — Mining Runoff',
    lat: 21.2530,
    lng: 81.6020,
    status: 'critical',
    reading: { ph: 5.48, tds: 1050, turbidity: 22.4, temperature: 29.5, dissolvedOxygen: 3.2 },
    timestamp: new Date().toISOString(),
  },
  {
    id: 'zone-d',
    name: 'Zone D — South Shore',
    lat: 21.2510,
    lng: 81.6060,
    status: 'good',
    reading: { ph: 7.34, tds: 310, turbidity: 1.8, temperature: 26.9, dissolvedOxygen: 7.5 },
    timestamp: new Date().toISOString(),
  },
  {
    id: 'zone-e',
    name: 'Zone E — West Bay',
    lat: 21.2540,
    lng: 81.5990,
    status: 'warning',
    reading: { ph: 6.65, tds: 540, turbidity: 10.4, temperature: 27.8, dissolvedOxygen: 4.9 },
    timestamp: new Date().toISOString(),
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    severity: 'CRITICAL',
    title: 'High turbidity & low pH detected',
    location: 'Zone C — Mining Runoff',
    sensor: 'Turbidity / pH',
    value: '22.4 NTU (pH 5.48)',
    timestamp: new Date(Date.now() - 95000).toISOString(),
    action: 'Inspect Zone C and perform treatment assessment. Possible heavy metal contamination — specialized treatment and laboratory confirmation required.',
    acknowledged: false,
    resolved: false,
    zoneId: 'zone-c',
  },
  {
    id: 'alert-2',
    severity: 'WARNING',
    title: 'TDS level increasing in East Inlet',
    location: 'Zone B — East Inlet',
    sensor: 'TDS',
    value: '720 ppm',
    timestamp: new Date(Date.now() - 250000).toISOString(),
    action: 'Monitor Zone B. Initiate sedimentation and activated carbon preparation.',
    acknowledged: false,
    resolved: false,
    zoneId: 'zone-b',
  },
  {
    id: 'alert-3',
    severity: 'INFO',
    title: 'Autonomous boat entered Zone B',
    location: 'Zone B — East Inlet',
    sensor: 'GPS',
    value: '21.2552, 81.6078',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    action: 'Live sampling scan actively underway for Zone B inlet transect.',
    acknowledged: true,
    resolved: false,
    zoneId: 'zone-b',
  },
  {
    id: 'alert-4',
    severity: 'WARNING',
    title: 'Low dissolved oxygen level',
    location: 'Zone C — Mining Runoff',
    sensor: 'Dissolved Oxygen',
    value: '3.2 mg/L',
    timestamp: new Date(Date.now() - 720000).toISOString(),
    action: 'Aerate water sample area and inspect organic & mineral discharge load.',
    acknowledged: true,
    resolved: false,
    zoneId: 'zone-c',
  },
  {
    id: 'alert-5',
    severity: 'INFO',
    title: 'Solar photovoltaic charging active',
    location: 'JalDrishti Boat #01',
    sensor: 'Power Telemetry',
    value: '82% (+14.8V solar input)',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    action: 'Optimal solar harvest on surface waters. Energy balance positive.',
    acknowledged: true,
    resolved: true,
  },
];

export const INITIAL_BOAT: BoatData = {
  status: 'ONLINE',
  mission: 'ACTIVE',
  battery: 82,
  solarCharging: true,
  gps: 'LOCKED',
  speed: 1.8,
  currentZone: 'Zone B',
  communication: 'Wi-Fi CONNECTED',
  lat: 21.2554,
  lng: 81.6076,
  heading: 142,
  targetWaypointIndex: 2,
  pathHistory: [
    [21.2578, 81.6042],
    [21.2570, 81.6050],
    [21.2562, 81.6063],
    [21.2554, 81.6076],
  ],
  missionProgress: [
    { step: 'Mission Started', status: 'done' },
    { step: 'Zone A Scanned', status: 'done' },
    { step: 'Zone B Scanning', status: 'active' },
    { step: 'Zone C Pending', status: 'pending' },
    { step: 'Mission Complete', status: 'pending' },
  ],
};

export function generateAIInsight(zones: Zone[]): AIInsight {
  const criticalZone = zones.find(z => z.status === 'critical');
  const warningZone = zones.find(z => z.status === 'warning');
  const targetZone = criticalZone || warningZone || zones[0];

  let riskScore = 32;
  let riskLevel: RiskLevel = 'LOW';
  let insight = 'All monitored zones show stable water quality parameters.';
  let action = 'Continue routine automated patrolling and environmental tracking.';

  if (criticalZone) {
    // Dynamic calculation: scale between 76 and 94
    const turbBonus = Math.min(10, Math.max(0, (criticalZone.reading.turbidity - 15) * 0.5));
    const tdsBonus = Math.min(8, Math.max(0, (criticalZone.reading.tds - 800) * 0.015));
    riskScore = Math.round(78 + turbBonus + tdsBonus);
    riskLevel = 'CRITICAL';
    insight = `Critical contamination detected in ${criticalZone.name}. Elevated turbidity (${criticalZone.reading.turbidity} NTU) and low pH (${criticalZone.reading.ph}) indicate active mining/acid runoff.`;
    action = 'Immediate on-site inspection required. Specialized chemical treatment and certified laboratory confirmation necessary.';
  } else if (warningZone) {
    riskScore = 68;
    riskLevel = 'MEDIUM';
    insight = `Water quality deterioration detected in ${warningZone.name} based on increasing turbidity (${warningZone.reading.turbidity} NTU) and elevated TDS (${warningZone.reading.tds} ppm).`;
    action = 'Perform detailed transect inspection and initiate multi-barrier treatment assessment.';
  }

  const trend: 'increasing' | 'stable' | 'decreasing' = criticalZone
    ? 'increasing'
    : warningZone
    ? 'increasing'
    : 'stable';

  return {
    riskScore,
    riskLevel,
    insight,
    recommendedAction: action,
    pollutionTrend: trend,
    hotspotZone: targetZone ? targetZone.name : 'Zone B — East Inlet',
    prediction: `Predicted risk for ${targetZone ? targetZone.name : 'monitored basin'}: ${riskLevel} over next 24 hours based on continuous telemetry regression.`,
    treatmentRecommendation: criticalZone
      ? 'Specialized heavy metal removal & neutralization + laboratory spectrometry confirmation.'
      : warningZone
      ? 'Coagulation-sedimentation followed by dual-media activated carbon filtration.'
      : 'Water meets standard potable baselines. Regular UV disinfection recommended prior to distribution.',
  };
}

export function generateHistoricalData(hours: number): HistoricalPoint[] {
  const points: HistoricalPoint[] = [];
  const now = Date.now();
  let reading: SensorReading = { ph: 7.15, tds: 420, turbidity: 3.8, temperature: 27.4, dissolvedOxygen: 6.8 };

  const count = Math.min(hours, 24);
  const stepMs = (hours * 3600000) / count;

  for (let i = count; i >= 0; i--) {
    reading = generateReading(reading);
    points.push({
      time: new Date(now - i * stepMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ph: reading.ph,
      tds: reading.tds,
      turbidity: reading.turbidity,
      temperature: reading.temperature,
      dissolvedOxygen: reading.dissolvedOxygen,
    });
  }
  return points;
}

export function generateMultiZoneHistoricalData(hours: number) {
  const points: Array<HistoricalPoint & {
    zoneA_ph: number; zoneA_tds: number; zoneA_turbidity: number; zoneA_temperature: number; zoneA_do: number;
    zoneB_ph: number; zoneB_tds: number; zoneB_turbidity: number; zoneB_temperature: number; zoneB_do: number;
    zoneC_ph: number; zoneC_tds: number; zoneC_turbidity: number; zoneC_temperature: number; zoneC_do: number;
  }> = [];

  const now = Date.now();
  let rA = { ph: 7.2, tds: 280, turbidity: 2.1, temperature: 27.2, dissolvedOxygen: 7.2 };
  let rB = { ph: 6.4, tds: 720, turbidity: 10.5, temperature: 28.1, dissolvedOxygen: 5.2 };
  let rC = { ph: 5.6, tds: 1050, turbidity: 21.0, temperature: 29.5, dissolvedOxygen: 3.6 };

  const count = Math.min(hours, 24);
  const stepMs = (hours * 3600000) / count;

  for (let i = count; i >= 0; i--) {
    rA = generateReading(rA);
    rB = generateReading(rB);
    rC = generateReading(rC);

    points.push({
      time: new Date(now - i * stepMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ph: rA.ph,
      tds: rA.tds,
      turbidity: rA.turbidity,
      temperature: rA.temperature,
      dissolvedOxygen: rA.dissolvedOxygen,
      zoneA_ph: rA.ph,
      zoneA_tds: rA.tds,
      zoneA_turbidity: rA.turbidity,
      zoneA_temperature: rA.temperature,
      zoneA_do: rA.dissolvedOxygen,
      zoneB_ph: rB.ph,
      zoneB_tds: rB.tds,
      zoneB_turbidity: rB.turbidity,
      zoneB_temperature: rB.temperature,
      zoneB_do: rB.dissolvedOxygen,
      zoneC_ph: rC.ph,
      zoneC_tds: rC.tds,
      zoneC_turbidity: rC.turbidity,
      zoneC_temperature: rC.temperature,
      zoneC_do: rC.dissolvedOxygen,
    });
  }
  return points;
}

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'RPT-2026-0911',
    date: '2026-09-11',
    waterBody: 'Lilagar Lake — Bhilai Basin',
    zones: 5,
    avgPh: 6.82,
    avgTds: 580,
    avgTurbidity: 8.8,
    avgDo: 6.0,
    alertsGenerated: 4,
    treatmentStatus: 'In Progress',
  },
  {
    id: 'RPT-2026-0910',
    date: '2026-09-10',
    waterBody: 'Lilagar Lake — Bhilai Basin',
    zones: 5,
    avgPh: 6.94,
    avgTds: 490,
    avgTurbidity: 6.2,
    avgDo: 6.4,
    alertsGenerated: 2,
    treatmentStatus: 'Completed',
  },
  {
    id: 'RPT-2026-0909',
    date: '2026-09-09',
    waterBody: 'Damoh Reservoir — Durg Sector',
    zones: 4,
    avgPh: 7.15,
    avgTds: 340,
    avgTurbidity: 3.4,
    avgDo: 7.1,
    alertsGenerated: 1,
    treatmentStatus: 'Not Required',
  },
  {
    id: 'RPT-2026-0908',
    date: '2026-09-08',
    waterBody: 'Korba Mining Discharge Canal',
    zones: 3,
    avgPh: 5.92,
    avgTds: 920,
    avgTurbidity: 16.4,
    avgDo: 4.1,
    alertsGenerated: 6,
    treatmentStatus: 'Specialized Lab Audit',
  },
  {
    id: 'RPT-2026-0907',
    date: '2026-09-07',
    waterBody: 'Damoh Reservoir — Durg Sector',
    zones: 4,
    avgPh: 7.22,
    avgTds: 310,
    avgTurbidity: 2.7,
    avgDo: 7.5,
    alertsGenerated: 0,
    treatmentStatus: 'Completed',
  },
];
