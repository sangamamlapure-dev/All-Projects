export type SensorStatus = 'good' | 'warning' | 'critical';

export type ZoneStatus = 'good' | 'warning' | 'critical';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface SensorReading {
  ph: number;
  tds: number;
  turbidity: number;
  temperature: number;
  dissolvedOxygen: number;
}

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: ZoneStatus;
  reading: SensorReading;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  location: string;
  sensor: string;
  value: string;
  timestamp: string;
  action: string;
  acknowledged: boolean;
  resolved: boolean;
  zoneId?: string;
}

export interface BoatWaypoint {
  lat: number;
  lng: number;
  name: string;
}

export interface BoatData {
  status: 'ONLINE' | 'OFFLINE';
  mission: 'ACTIVE' | 'PAUSED' | 'IDLE' | 'COMPLETE';
  battery: number;
  solarCharging: boolean;
  gps: 'LOCKED' | 'SEARCHING' | 'LOST';
  speed: number;
  currentZone: string;
  communication: 'Wi-Fi CONNECTED' | 'GSM CONNECTED' | 'LoRa CONNECTED' | 'DISCONNECTED';
  missionProgress: { step: string; status: 'done' | 'active' | 'pending' }[];
  lat: number;
  lng: number;
  heading: number;
  targetWaypointIndex: number;
  pathHistory: [number, number][];
}

export interface AIInsight {
  riskScore: number;
  riskLevel: RiskLevel;
  insight: string;
  recommendedAction: string;
  pollutionTrend: 'increasing' | 'stable' | 'decreasing';
  hotspotZone: string;
  prediction: string;
  treatmentRecommendation: string;
}

export interface HistoricalPoint {
  time: string;
  ph: number;
  tds: number;
  turbidity: number;
  temperature: number;
  dissolvedOxygen: number;
}

export interface ReportItem {
  id: string;
  date: string;
  waterBody: string;
  zones: number;
  avgPh: number;
  avgTds: number;
  avgTurbidity: number;
  avgDo: number;
  alertsGenerated: number;
  treatmentStatus: string;
}

export interface Thresholds {
  // Legacy compatibility fields
  phMin: number;
  phMax: number;
  tdsMax: number;
  turbidityMax: number;
  tempMin: number;
  tempMax: number;
  doMin: number;

  // Granular Warning & Critical levels
  turbidityWarning: number;
  turbidityCritical: number;
  tdsWarning: number;
  tdsCritical: number;
  phMinWarning: number;
  phMaxWarning: number;
  phMinCritical: number;
  phMaxCritical: number;
  doMinWarning: number;
  doMinCritical: number;
}

export interface UserProfile {
  name: string;
  role: string;
  department: string;
  email: string;
}

export interface Settings {
  thresholds: Thresholds;
  alertNotificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoMissionStart: boolean;
  dataRefreshInterval: number;
  communicationMode: 'Wi-Fi' | 'GSM' | 'LoRa';
  boatSpeedLimit: number;
  batteryLowAlert: number;
  userProfile?: UserProfile;
}
