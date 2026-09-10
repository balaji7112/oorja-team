import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ============================================================
// TYPES
// ============================================================
export type EnergyState = 'NORMAL' | 'SURPLUS' | 'BALANCED' | 'DEFICIT' | 'CRITICAL' | 'FAULT';
export type SystemMode = 'LIVE' | 'DEMO' | 'SCENARIO';
export type WeatherCondition = 'SUNNY' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'RAIN' | 'NIGHT';
export type BatteryAction = 'CHARGING' | 'DISCHARGING' | 'HOLD' | 'IDLE';
export type FaultType = 'CLOUD_COVER' | 'SOLAR_DUST' | 'BATTERY_HEATING' | 'LAB_LOAD_SPIKE' | 'SENSOR_DISCONNECT' | 'INCREASE_DEMAND' | 'RESET';

export interface HistPoint { t: number; v: number; }

export interface SolarData {
  currentPower: number;
  dailyGeneration: number;
  efficiency: number;
  temperature: number;
  voltage: number;
  current: number;
  irradiance: number;
  panelCount: number;
  capacity: number;
  healthScore: number;
}

export interface BatteryData {
  soc: number;
  soh: number;
  voltage: number;
  current: number;
  temperature: number;
  capacity: number;
  chargeRate: number;
  dischargeRate: number;
  cycleCount: number;
  projectedBackupHours: number;
  chargingAction: BatteryAction;
  healthScore: number;
  optimizationState: string;
}

export interface BuildingData {
  id: string;
  name: string;
  type: string;
  currentLoad: number;
  peakLoad: number;
  renewableShare: number;
  anomalyScore: number;
  status: 'NORMAL' | 'HIGH_LOAD' | 'PEAK' | 'ANOMALY' | 'OFFLINE';
  flexibleLoad: number;
  healthScore: number;
  scheduledLoad?: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  solarIrradiance: number;
  condition: WeatherCondition;
  rainProbability: number;
  uvIndex: number;
  solarImpact: number;
}

export interface ForecastPoint {
  timestamp: number;
  predicted: number;
  lower: number;
  upper: number;
  actual?: number;
}

export interface Recommendation {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  reason: string;
  inputs: string[];
  projectedImpact: string;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIMULATED';
  affectedAsset: string;
}

export interface Anomaly {
  id: string;
  asset: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  detectedAt: number;
  possibleCause: string;
  recommendedAction: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface OorjaSyncScore {
  total: number;
  renewableUtilization: number;
  storageEfficiency: number;
  loadOptimization: number;
  gridReduction: number;
  assetHealth: number;
  forecastQuality: number;
  carbonPerformance: number;
}

export interface OptimizationDecision {
  action: 'CHARGE' | 'DISCHARGE' | 'HOLD' | 'GRID_CHARGE' | 'LOAD_SHIFT';
  reason: string;
  confidence: number;
  inputs: string[];
  expectedImpact: string;
  timestamp: number;
}

// ============================================================
// SEEDED PRNG (Mulberry32 — deterministic, reproducible)
// ============================================================
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ============================================================
// SOLAR POWER MODEL
// ============================================================
function calcSolarPower(hour: number, cloudCover: number, temperature: number, efficiencyMultiplier = 1): number {
  if (hour < 5.5 || hour > 18.5) return 0;
  const angle = Math.sin(Math.PI * (hour - 5.5) / 13);
  const irradiance = 950 * angle;
  const tempDerating = 1 - 0.004 * Math.max(0, temperature - 25);
  const cloudAttenuation = 1 - 0.82 * cloudCover;
  const power = (irradiance / 1000) * 50 * 0.18 * tempDerating * cloudAttenuation * efficiencyMultiplier;
  return Math.max(0, power);
}

// ============================================================
// DEMAND MODEL
// ============================================================
function calcDemand(hour: number, isWeekend: boolean, faultMultiplier = 1): {
  total: number; academic: number; lab: number; library: number; hostel: number; canteen: number; ev: number;
} {
  const academicFactor = isWeekend ? 0 : (hour >= 8 && hour < 20 ? 1 : 0.3);
  const labFactor = (isWeekend ? 0.5 : 1) * (hour >= 9 && hour < 21 ? 1 : 0.1);
  const libraryFactor = hour >= 8 && hour < 20 ? 1 : 0.1;
  const hostelFactor = hour >= 18 ? 1 : (hour >= 6 ? 0.3 : 0.5);
  const canteenFactor = [7,8,12,13,18,19].includes(hour) ? 1 : 0.15;
  const evLoad = hour >= 10 && hour < 14 ? 7 : 0;

  const academic = 4.0 * academicFactor;
  const lab = 6.0 * labFactor * faultMultiplier;
  const library = 2.0 * libraryFactor;
  const hostel = 3.0 * hostelFactor;
  const canteen = 2.0 * canteenFactor;

  return {
    academic, lab, library, hostel, canteen, ev: evLoad,
    total: Math.max(0, academic + lab + library + hostel + canteen + evLoad),
  };
}

// ============================================================
// OORJA SYNC SCORE
// ============================================================
function calcScore(
  renewableShare: number, soc: number, soh: number,
  gridDep: number, solar: SolarData, buildingHealth: number
): OorjaSyncScore {
  const renewableUtilization = Math.min(100, renewableShare);
  const storageEfficiency = Math.min(100, (soh * 0.6) + (soc > 40 && soc < 85 ? 40 : 20));
  const loadOptimization = Math.min(100, 70 + buildingHealth * 0.3);
  const gridReduction = Math.min(100, 100 - gridDep);
  const assetHealth = Math.min(100, (solar.healthScore * 0.5 + soh * 0.5));
  const forecastQuality = 88;
  const carbonPerformance = Math.min(100, renewableShare * 0.9 + 10);

  const total = Math.round(
    renewableUtilization * 0.30 +
    storageEfficiency * 0.20 +
    loadOptimization * 0.15 +
    gridReduction * 0.15 +
    assetHealth * 0.10 +
    forecastQuality * 0.05 +
    carbonPerformance * 0.05
  );

  return {
    total,
    renewableUtilization: Math.round(renewableUtilization),
    storageEfficiency: Math.round(storageEfficiency),
    loadOptimization: Math.round(loadOptimization),
    gridReduction: Math.round(gridReduction),
    assetHealth: Math.round(assetHealth),
    forecastQuality,
    carbonPerformance: Math.round(carbonPerformance),
  };
}

// ============================================================
// ENERGY STATE
// ============================================================
function calcEnergyState(solar: number, wind: number, load: number, soc: number): EnergyState {
  const renewable = solar + wind;
  if (renewable > load * 1.2) return 'SURPLUS';
  if (renewable >= load * 0.9) return 'BALANCED';
  if (soc > 30) return 'DEFICIT';
  if (soc > 20) return 'CRITICAL';
  return 'CRITICAL';
}

// ============================================================
// FORECAST GENERATION
// ============================================================
function generateSolarForecast(currentHour: number, cloudCover: number, temperature: number): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const now = Date.now();
  for (let i = -6; i < 24; i++) {
    const h = ((currentHour + i) % 24 + 24) % 24;
    const predicted = calcSolarPower(h, cloudCover, temperature);
    const uncertainty = Math.abs(i) * 0.3;
    points.push({
      timestamp: now + i * 3600000,
      predicted: Math.round(predicted * 10) / 10,
      lower: Math.max(0, Math.round((predicted - uncertainty) * 10) / 10),
      upper: Math.round((predicted + uncertainty) * 10) / 10,
      actual: i <= 0 ? Math.round(calcSolarPower(h, cloudCover, temperature) * 10) / 10 : undefined,
    });
  }
  return points;
}

function generateDemandForecast(currentHour: number, isWeekend: boolean): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const now = Date.now();
  for (let i = -6; i < 24; i++) {
    const h = ((currentHour + i) % 24 + 24) % 24;
    const demand = calcDemand(h, isWeekend);
    const uncertainty = Math.abs(i) * 0.15;
    points.push({
      timestamp: now + i * 3600000,
      predicted: Math.round(demand.total * 10) / 10,
      lower: Math.max(0, Math.round((demand.total - uncertainty) * 10) / 10),
      upper: Math.round((demand.total + uncertainty) * 10) / 10,
      actual: i <= 0 ? Math.round(demand.total * 10) / 10 : undefined,
    });
  }
  return points;
}

// ============================================================
// RULE-BASED RECOMMENDATIONS
// ============================================================
function generateRecommendations(
  soc: number, solarPower: number, totalLoad: number,
  cloudCover: number, temperature: number, currentHour: number
): Recommendation[] {
  const recs: Recommendation[] = [];
  const now = Date.now();

  // Rule 1: High cloud cover incoming
  if (cloudCover > 0.5 && soc < 80) {
    recs.push({
      id: 'rec-1',
      title: 'Reserve Battery Capacity',
      priority: 'HIGH',
      confidence: Math.round(88 - cloudCover * 10),
      reason: `Cloud cover at ${Math.round(cloudCover * 100)}% — solar output reduction expected. Pre-charge battery from current renewable surplus.`,
      inputs: [`Battery SOC: ${soc.toFixed(1)}%`, `Cloud Cover: ${Math.round(cloudCover * 100)}%`, `Solar: ${solarPower.toFixed(1)} kW`, `Load: ${totalLoad.toFixed(1)} kW`],
      projectedImpact: 'Reduce grid import by ~32% during low-solar window.',
      timestamp: now,
      status: 'PENDING',
      affectedAsset: 'BATTERY',
    });
  }

  // Rule 2: Surplus solar, battery has headroom
  if (solarPower > totalLoad * 1.2 && soc < 85) {
    recs.push({
      id: 'rec-2',
      title: 'Charge Battery from Solar Surplus',
      priority: 'MEDIUM',
      confidence: 92,
      reason: `Renewable surplus of ${(solarPower - totalLoad).toFixed(1)} kW available. Storing energy now avoids curtailment.`,
      inputs: [`Solar: ${solarPower.toFixed(1)} kW`, `Load: ${totalLoad.toFixed(1)} kW`, `Surplus: ${(solarPower - totalLoad).toFixed(1)} kW`, `SOC: ${soc.toFixed(1)}%`],
      projectedImpact: 'Store up to 8.4 kWh for later discharge, reducing evening grid cost.',
      timestamp: now - 120000,
      status: 'PENDING',
      affectedAsset: 'SOLAR_FARM',
    });
  }

  // Rule 3: Peak tariff, discharge battery
  if (currentHour >= 18 && currentHour < 22 && soc > 50) {
    recs.push({
      id: 'rec-3',
      title: 'Discharge Battery During Peak Tariff',
      priority: 'HIGH',
      confidence: 85,
      reason: `Peak tariff period (18:00–22:00). Battery SOC at ${soc.toFixed(1)}%. Discharging reduces grid import cost by ₹12/kWh.`,
      inputs: [`Time: ${currentHour}:00`, `SOC: ${soc.toFixed(1)}%`, `Tariff: PEAK ₹12/kWh`, `Load: ${totalLoad.toFixed(1)} kW`],
      projectedImpact: 'Projected cost saving: ₹148–₹212 for this period.',
      timestamp: now - 300000,
      status: 'PENDING',
      affectedAsset: 'BATTERY',
    });
  }

  // Rule 4: EV deferral to solar window
  if (currentHour < 10 || currentHour > 16) {
    recs.push({
      id: 'rec-4',
      title: 'Defer EV Charging to Solar Window',
      priority: 'MEDIUM',
      confidence: 79,
      reason: 'EV charging scheduled outside peak solar hours. Shifting to 10:00–14:00 window maximises renewable utilisation.',
      inputs: [`Current hour: ${currentHour}:00`, 'Solar peak: 10:00–14:00', 'EV load: 7 kW', 'Duration: 2h'],
      projectedImpact: 'Reduce grid charging by ~14 kWh, saving ₹98–₹168.',
      timestamp: now - 600000,
      status: 'PENDING',
      affectedAsset: 'EV_CHARGING',
    });
  }

  // Rule 5: Temperature protection
  if (temperature > 38) {
    recs.push({
      id: 'rec-5',
      title: 'Battery Temperature Alert — Hold Recommended',
      priority: 'HIGH',
      confidence: 95,
      reason: `Battery operating near thermal limit (${temperature.toFixed(1)}°C). Pausing charge/discharge cycles protects battery health.`,
      inputs: [`Temperature: ${temperature.toFixed(1)}°C`, 'Threshold: 40°C', `SOH: ${82}%`],
      projectedImpact: 'Prevents accelerated capacity degradation. Estimated SOH preservation: 2–3%.',
      timestamp: now - 60000,
      status: 'PENDING',
      affectedAsset: 'BATTERY',
    });
  }

  return recs.slice(0, 4); // Max 4 recommendations
}

// ============================================================
// ANOMALY DETECTION (rule-based + z-score)
// ============================================================
function detectAnomalies(
  solarPower: number, totalLoad: number, batteryTemp: number,
  currentHour: number, cloudCover: number, faultType: FaultType | null
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const now = Date.now();

  if (faultType === 'LAB_LOAD_SPIKE') {
    anomalies.push({
      id: 'anom-lab-1',
      asset: 'Computer Lab',
      type: 'LOAD_SPIKE',
      severity: 'HIGH',
      score: 0.87,
      detectedAt: now,
      possibleCause: 'Sudden load increase detected in Computer Lab. Possible: batch computation workload, HVAC fault, or data centre cooling failure.',
      recommendedAction: 'Verify lab occupancy and active workloads. Consider deferring non-critical batch jobs to off-peak hours.',
      status: 'ACTIVE',
    });
  }

  if (faultType === 'BATTERY_HEATING') {
    anomalies.push({
      id: 'anom-bat-1',
      asset: 'Battery Storage',
      type: 'THERMAL_ANOMALY',
      severity: 'CRITICAL',
      score: 0.93,
      detectedAt: now,
      possibleCause: 'Battery temperature exceeding operational threshold. Potential causes: ambient heat, charge rate too high, or cooling system malfunction.',
      recommendedAction: 'Immediately pause charging. Activate cooling system. Inspect thermal management unit.',
      status: 'ACTIVE',
    });
  }

  if (faultType === 'SOLAR_DUST') {
    anomalies.push({
      id: 'anom-sol-1',
      asset: 'Solar Farm',
      type: 'PERFORMANCE_DEVIATION',
      severity: 'MEDIUM',
      score: 0.71,
      detectedAt: now,
      possibleCause: 'Solar generation 35–40% below expected for current irradiance. Possible panel soiling, shading, or inverter degradation.',
      recommendedAction: 'Schedule panel cleaning inspection. Check inverter logs for fault codes.',
      status: 'ACTIVE',
    });
  }

  if (faultType === 'SENSOR_DISCONNECT') {
    anomalies.push({
      id: 'anom-sen-1',
      asset: 'Lab Meter',
      type: 'SENSOR_OFFLINE',
      severity: 'MEDIUM',
      score: 0.65,
      detectedAt: now,
      possibleCause: 'No telemetry received from Lab Meter for >2 minutes. Possible network fault, power loss, or hardware failure.',
      recommendedAction: 'Check device connectivity. Restart meter if accessible. Use neighbouring meter estimates.',
      status: 'ACTIVE',
    });
  }

  // Rule: Overnight consumption
  if ((currentHour < 5 || currentHour > 22) && totalLoad > 6) {
    anomalies.push({
      id: 'anom-night-1',
      asset: 'Campus',
      type: 'OVERNIGHT_CONSUMPTION',
      severity: 'MEDIUM',
      score: 0.68,
      detectedAt: now - 600000,
      possibleCause: 'Higher-than-expected overnight load detected. Possible: equipment left on, HVAC fault, or unexpected occupancy.',
      recommendedAction: 'Review overnight load profile. Identify and switch off non-essential equipment.',
      status: 'ACTIVE',
    });
  }

  return anomalies;
}

// ============================================================
// OPTIMIZATION DECISION
// ============================================================
function makeOptimizationDecision(
  soc: number, solarPower: number, totalLoad: number,
  cloudCover: number, batteryTemp: number, hour: number
): OptimizationDecision {
  const now = Date.now();
  const surplus = solarPower - totalLoad;
  const isPeakHour = hour >= 18 && hour < 22;

  if (batteryTemp > 39) {
    return {
      action: 'HOLD',
      reason: `Battery temperature at ${batteryTemp.toFixed(1)}°C — thermal protection active. Pausing charge/discharge cycles.`,
      confidence: 97,
      inputs: [`Temperature: ${batteryTemp.toFixed(1)}°C`, 'Threshold: 40°C', `SOC: ${soc.toFixed(1)}%`],
      expectedImpact: 'Prevents accelerated cell degradation. Resume when temperature normalises.',
      timestamp: now,
    };
  }

  if (cloudCover > 0.6) {
    return {
      action: 'HOLD',
      reason: `High cloud cover (${Math.round(cloudCover * 100)}%) — preserving battery headroom for predicted solar reduction.`,
      confidence: 88,
      inputs: [`Cloud Cover: ${Math.round(cloudCover * 100)}%`, `SOC: ${soc.toFixed(1)}%`, `Solar: ${solarPower.toFixed(1)} kW`],
      expectedImpact: 'Available storage will cover predicted deficit of ~4.2 kWh during low-solar window.',
      timestamp: now,
    };
  }

  if (surplus > 3 && soc < 85) {
    return {
      action: 'CHARGE',
      reason: `Renewable surplus of ${surplus.toFixed(1)} kW available. Charging battery to store excess solar energy.`,
      confidence: 93,
      inputs: [`Solar surplus: ${surplus.toFixed(1)} kW`, `SOC: ${soc.toFixed(1)}%`, `Max SOC: 90%`],
      expectedImpact: 'Stores up to 8.4 kWh. Estimated grid import reduction: 28% for next 3 hours.',
      timestamp: now,
    };
  }

  if (surplus < -2 && soc > 25 && !isPeakHour) {
    return {
      action: 'DISCHARGE',
      reason: `Deficit of ${Math.abs(surplus).toFixed(1)} kW — battery supporting campus load to reduce grid import.`,
      confidence: 86,
      inputs: [`Deficit: ${Math.abs(surplus).toFixed(1)} kW`, `SOC: ${soc.toFixed(1)}%`, `Min SOC: 20%`],
      expectedImpact: 'Reduces grid import by ~${Math.abs(surplus).toFixed(1)} kW. Grid dependency decreases by ~${Math.round(Math.abs(surplus)/totalLoad*100)}%.',
      timestamp: now,
    };
  }

  if (isPeakHour && soc > 50) {
    return {
      action: 'DISCHARGE',
      reason: `Peak tariff period (18:00–22:00). Discharging battery to avoid high-cost grid import at ₹12/kWh.`,
      confidence: 82,
      inputs: [`Hour: ${hour}:00`, 'Tariff: PEAK ₹12/kWh', `SOC: ${soc.toFixed(1)}%`],
      expectedImpact: 'Projected cost saving: ₹148–₹212 for peak period.',
      timestamp: now,
    };
  }

  return {
    action: 'HOLD',
    reason: 'System in balanced state. Maintaining current SOC for optimal flexibility.',
    confidence: 78,
    inputs: [`SOC: ${soc.toFixed(1)}%`, `Solar: ${solarPower.toFixed(1)} kW`, `Load: ${totalLoad.toFixed(1)} kW`],
    expectedImpact: 'Maintains system balance. No immediate action required.',
    timestamp: now,
  };
}

// ============================================================
// STORE INTERFACE
// ============================================================
interface EnergyStoreState {
  // System
  mode: SystemMode;
  energyState: EnergyState;
  systemOnline: boolean;
  lastUpdated: number;
  activeFault: FaultType | null;
  tickCount: number;

  // Solar
  solar: SolarData;

  // Battery
  battery: BatteryData;

  // Buildings
  buildings: BuildingData[];

  // Grid
  gridImport: number;
  gridExport: number;
  gridDependency: number;

  // Totals
  totalLoad: number;
  renewableShare: number;
  windPower: number;

  // Weather
  weather: WeatherData;

  // Score
  oorjaSyncScore: OorjaSyncScore;

  // Carbon & Cost
  co2Avoided: number;
  dailyCo2Avoided: number;
  estimatedCostSaving: number;

  // Forecasts
  solarForecast: ForecastPoint[];
  demandForecast: ForecastPoint[];

  // Intelligence
  recommendations: Recommendation[];
  anomalies: Anomaly[];
  optimizationDecision: OptimizationDecision | null;

  // History (last 60 points)
  solarHistory: HistPoint[];
  loadHistory: HistPoint[];
  batteryHistory: HistPoint[];
  gridHistory: HistPoint[];
  windHistory: HistPoint[];

  // Actions
  setMode: (mode: SystemMode) => void;
  injectFault: (type: FaultType) => void;
  approveRecommendation: (id: string) => void;
  rejectRecommendation: (id: string) => void;
  tick: () => void;
}

// ============================================================
// INITIAL STATE
// ============================================================
const INITIAL_HOUR = new Date().getHours();
const IS_WEEKEND = [0, 6].includes(new Date().getDay());

const INITIAL_SOLAR_POWER = 18.6;
const INITIAL_LOAD = 13.2;
const INITIAL_SOC = 76;
const INITIAL_CLOUD = 0.18;

function buildInitialBuildings(): BuildingData[] {
  const now = Date.now();
  return [
    { id: 'ACADEMIC', name: 'Academic Block', type: 'ACADEMIC', currentLoad: 3.8, peakLoad: 5.0, renewableShare: 84, anomalyScore: 0.05, status: 'NORMAL', flexibleLoad: 0.5, healthScore: 95 },
    { id: 'COMPUTER_LAB', name: 'Computer Lab', type: 'LAB', currentLoad: 4.8, peakLoad: 7.0, renewableShare: 81, anomalyScore: 0.08, status: 'NORMAL', flexibleLoad: 1.5, healthScore: 88 },
    { id: 'LIBRARY', name: 'Library', type: 'LIBRARY', currentLoad: 1.8, peakLoad: 2.5, renewableShare: 88, anomalyScore: 0.03, status: 'NORMAL', flexibleLoad: 0.3, healthScore: 97 },
    { id: 'HOSTEL', name: 'Hostel Block', type: 'HOSTEL', currentLoad: 1.8, peakLoad: 3.5, renewableShare: 79, anomalyScore: 0.04, status: 'NORMAL', flexibleLoad: 0.8, healthScore: 92 },
    { id: 'CANTEEN', name: 'Canteen', type: 'CANTEEN', currentLoad: 1.0, peakLoad: 2.0, renewableShare: 85, anomalyScore: 0.02, status: 'NORMAL', flexibleLoad: 0.2, healthScore: 96 },
    { id: 'EV_CHARGING', name: 'EV Charging Zone', type: 'EV_ZONE', currentLoad: 0, peakLoad: 7.0, renewableShare: 90, anomalyScore: 0.01, status: 'NORMAL', flexibleLoad: 7.0, healthScore: 99, scheduledLoad: 12 },
  ];
}

// ============================================================
// ZUSTAND STORE
// ============================================================
export const useEnergyStore = create<EnergyStoreState>()(
  subscribeWithSelector((set, get) => ({
    // System
    mode: 'DEMO',
    energyState: 'BALANCED',
    systemOnline: true,
    lastUpdated: Date.now(),
    activeFault: null,
    tickCount: 0,

    // Solar
    solar: {
      currentPower: INITIAL_SOLAR_POWER,
      dailyGeneration: 72.4,
      efficiency: 18.2,
      temperature: 42,
      voltage: 380,
      current: 48.9,
      irradiance: 780,
      panelCount: 48,
      capacity: 50,
      healthScore: 92,
    },

    // Battery
    battery: {
      soc: INITIAL_SOC,
      soh: 84,
      voltage: 48.4,
      current: 12.3,
      temperature: 28,
      capacity: 40,
      chargeRate: 3.2,
      dischargeRate: 0,
      cycleCount: 142,
      projectedBackupHours: 4.6,
      chargingAction: 'CHARGING',
      healthScore: 84,
      optimizationState: 'CHARGING',
    },

    // Buildings
    buildings: buildInitialBuildings(),

    // Grid
    gridImport: 2.4,
    gridExport: 0,
    gridDependency: 18,

    // Totals
    totalLoad: INITIAL_LOAD,
    renewableShare: 82,
    windPower: 1.8,

    // Weather
    weather: {
      temperature: 32,
      humidity: 65,
      windSpeed: 3.2,
      cloudCover: INITIAL_CLOUD,
      solarIrradiance: 780,
      condition: 'PARTLY_CLOUDY',
      rainProbability: 12,
      uvIndex: 7,
      solarImpact: -5,
    },

    // Score
    oorjaSyncScore: {
      total: 82,
      renewableUtilization: 86,
      storageEfficiency: 78,
      loadOptimization: 82,
      gridReduction: 82,
      assetHealth: 88,
      forecastQuality: 88,
      carbonPerformance: 84,
    },

    // Carbon & Cost
    co2Avoided: 18.4,
    dailyCo2Avoided: 52.3,
    estimatedCostSaving: 847,

    // Forecasts
    solarForecast: generateSolarForecast(INITIAL_HOUR, INITIAL_CLOUD, 32),
    demandForecast: generateDemandForecast(INITIAL_HOUR, IS_WEEKEND),

    // Intelligence
    recommendations: generateRecommendations(INITIAL_SOC, INITIAL_SOLAR_POWER, INITIAL_LOAD, INITIAL_CLOUD, 32, INITIAL_HOUR),
    anomalies: [],
    optimizationDecision: makeOptimizationDecision(INITIAL_SOC, INITIAL_SOLAR_POWER, INITIAL_LOAD, INITIAL_CLOUD, 28, INITIAL_HOUR),

    // History — pre-fill with last 30 points
    solarHistory: Array.from({ length: 30 }, (_, i) => ({
      t: Date.now() - (29 - i) * 10000,
      v: Math.max(0, calcSolarPower(INITIAL_HOUR, 0.15 + Math.sin(i * 0.3) * 0.05, 32)),
    })),
    loadHistory: Array.from({ length: 30 }, (_, i) => ({
      t: Date.now() - (29 - i) * 10000,
      v: Math.max(0, 12.5 + Math.sin(i * 0.4) * 1.2),
    })),
    batteryHistory: Array.from({ length: 30 }, (_, i) => ({
      t: Date.now() - (29 - i) * 10000,
      v: Math.max(20, Math.min(90, INITIAL_SOC - 2 + i * 0.12)),
    })),
    gridHistory: Array.from({ length: 30 }, (_, i) => ({
      t: Date.now() - (29 - i) * 10000,
      v: Math.max(0, 2.4 + Math.sin(i * 0.5) * 0.5),
    })),
    windHistory: Array.from({ length: 30 }, (_, i) => ({
      t: Date.now() - (29 - i) * 10000,
      v: Math.max(0, 1.8 + Math.sin(i * 0.6) * 0.3),
    })),

    // =============================================
    // ACTIONS
    // =============================================
    setMode: (mode) => set({ mode }),

    injectFault: (faultType) => {
      const state = get();
      if (faultType === 'RESET') {
        set({
          activeFault: null,
          weather: { ...state.weather, cloudCover: 0.18, condition: 'PARTLY_CLOUDY', solarImpact: -5 },
          buildings: buildInitialBuildings(),
          anomalies: [],
        });
        return;
      }
      set({ activeFault: faultType });

      // Recalculate anomalies
      const anomalies = detectAnomalies(
        state.solar.currentPower, state.totalLoad,
        state.battery.temperature, new Date().getHours(),
        state.weather.cloudCover, faultType
      );
      set({ anomalies });
    },

    approveRecommendation: (id) => {
      set(state => ({
        recommendations: state.recommendations.map(r =>
          r.id === id ? { ...r, status: 'APPROVED' as const } : r
        ),
      }));
    },

    rejectRecommendation: (id) => {
      set(state => ({
        recommendations: state.recommendations.map(r =>
          r.id === id ? { ...r, status: 'REJECTED' as const } : r
        ),
      }));
    },

    // =============================================
    // TICK — called every 3 seconds by simulator
    // =============================================
    tick: () => {
      const state = get();
      const now = Date.now();
      const date = new Date();
      const hour = date.getHours() + date.getMinutes() / 60;
      const isWeekend = [0, 6].includes(date.getDay());
      const tick = state.tickCount + 1;

      // Seeded noise for this tick
      const rng = mulberry32(tick * 1234567);
      const noise = () => (rng() - 0.5) * 2; // -1 to 1

      // Fault modifiers
      const fault = state.activeFault;
      let cloudCoverMod = state.weather.cloudCover;
      let efficiencyMod = 1;
      let demandMod = 1;
      let batteryTempMod = state.battery.temperature;

      if (fault === 'CLOUD_COVER') {
        cloudCoverMod = Math.min(0.85, cloudCoverMod + 0.02 * (rng() + 0.5));
      } else if (fault === 'SOLAR_DUST') {
        efficiencyMod = 0.62;
      } else if (fault === 'BATTERY_HEATING') {
        batteryTempMod = Math.min(44, batteryTempMod + 0.3);
      } else if (fault === 'LAB_LOAD_SPIKE') {
        demandMod = 1.8;
      } else if (fault === 'INCREASE_DEMAND') {
        demandMod = 1.4;
      }

      // Solar
      const baseSolar = calcSolarPower(hour, cloudCoverMod, state.weather.temperature, efficiencyMod);
      const solarPower = Math.max(0, baseSolar * (1 + noise() * 0.02));
      const irradiance = (solarPower / 50 / 0.18) * 1000;

      // Wind (mild variation)
      const windSpeed = Math.max(0, state.weather.windSpeed + noise() * 0.2);
      const windPower = Math.max(0, Math.min(5, 0.5 * Math.pow(windSpeed, 1.5)));

      // Demand
      const demand = calcDemand(Math.floor(hour), isWeekend, demandMod);
      const totalLoad = Math.max(0, demand.total * (1 + noise() * 0.015));

      // Battery dynamics
      const net = solarPower + windPower - totalLoad;
      let soc = state.battery.soc;
      let chargingAction: BatteryAction = 'IDLE';

      if (batteryTempMod > 39) {
        chargingAction = 'HOLD';
      } else if (net > 0.5 && soc < 90) {
        const chargeKw = Math.min(net * 0.95, 10);
        soc = Math.min(90, soc + (chargeKw / 40 / 12) * 100); // per tick (1/12 hour)
        chargingAction = 'CHARGING';
      } else if (net < -0.5 && soc > 20) {
        const dischargeKw = Math.min(Math.abs(net) / 0.95, 10);
        soc = Math.max(20, soc - (dischargeKw / 40 / 12) * 100);
        chargingAction = 'DISCHARGING';
      } else {
        chargingAction = 'HOLD';
      }

      // Grid
      const renewableTotal = solarPower + windPower;
      const batterySupport = chargingAction === 'DISCHARGING' ? Math.abs(net) : 0;
      const gridImport = Math.max(0, totalLoad - renewableTotal - batterySupport);
      const gridExport = Math.max(0, renewableTotal - totalLoad - (chargingAction === 'CHARGING' ? 3 : 0));
      const gridDependency = totalLoad > 0 ? (gridImport / totalLoad) * 100 : 0;
      const renewableShare = 100 - gridDependency;

      // CO2
      const co2PerHour = (renewableTotal / 12) * 0.82; // per tick = 1/12 hour
      const dailyCo2 = state.dailyCo2Avoided + co2PerHour;

      // Weather condition
      let condition: WeatherCondition = 'SUNNY';
      if (hour < 6 || hour > 19) condition = 'NIGHT';
      else if (cloudCoverMod > 0.7) condition = 'CLOUDY';
      else if (cloudCoverMod > 0.35) condition = 'PARTLY_CLOUDY';
      const solarImpact = Math.round(-cloudCoverMod * 82 * 10) / 10;

      // Update buildings
      const buildings = state.buildings.map(b => {
        const loadMap: Record<string, number> = {
          ACADEMIC: demand.academic, COMPUTER_LAB: demand.lab,
          LIBRARY: demand.library, HOSTEL: demand.hostel,
          CANTEEN: demand.canteen, EV_CHARGING: demand.ev,
        };
        const load = Math.max(0, (loadMap[b.id] || b.currentLoad) * (1 + noise() * 0.03));
        const renewShr = Math.min(100, Math.max(0, renewableShare + noise() * 5));
        const anomScore = (fault === 'LAB_LOAD_SPIKE' && b.id === 'COMPUTER_LAB') ? 0.87 : b.anomalyScore;
        const status: BuildingData['status'] =
          anomScore > 0.7 ? 'ANOMALY' :
          load > b.peakLoad * 0.85 ? 'PEAK' :
          load > b.peakLoad * 0.7 ? 'HIGH_LOAD' : 'NORMAL';
        return { ...b, currentLoad: Math.round(load * 10) / 10, renewableShare: Math.round(renewShr), anomalyScore: anomScore, status };
      });

      // Score
      const score = calcScore(renewableShare, soc, state.battery.soh, gridDependency, state.solar, 90);

      // Energy state
      const energyState = calcEnergyState(solarPower, windPower, totalLoad, soc);

      // Update histories
      const addPoint = (hist: HistPoint[], val: number): HistPoint[] => {
        const updated = [...hist, { t: now, v: Math.round(val * 10) / 10 }];
        return updated.length > 60 ? updated.slice(-60) : updated;
      };

      // Optimization decision
      const optimizationDecision = makeOptimizationDecision(soc, solarPower, totalLoad, cloudCoverMod, batteryTempMod, Math.floor(hour));

      // Anomalies
      const anomalies = detectAnomalies(solarPower, totalLoad, batteryTempMod, Math.floor(hour), cloudCoverMod, fault);

      // Recommendations (update every 10 ticks)
      const recommendations = tick % 10 === 0
        ? generateRecommendations(soc, solarPower, totalLoad, cloudCoverMod, state.weather.temperature, Math.floor(hour))
        : state.recommendations;

      set({
        tickCount: tick,
        lastUpdated: now,
        energyState,
        solar: {
          ...state.solar,
          currentPower: Math.round(solarPower * 10) / 10,
          dailyGeneration: Math.round((state.solar.dailyGeneration + solarPower / 12) * 10) / 10,
          irradiance: Math.round(irradiance),
          efficiency: Math.round((solarPower / 50) * 100 * efficiencyMod * 10) / 10,
        },
        windPower: Math.round(windPower * 10) / 10,
        totalLoad: Math.round(totalLoad * 10) / 10,
        battery: {
          ...state.battery,
          soc: Math.round(soc * 10) / 10,
          temperature: Math.round(batteryTempMod * 10) / 10,
          chargingAction,
          projectedBackupHours: Math.round((soc / 100 * 40 / Math.max(1, totalLoad - renewableTotal)) * 10) / 10,
        },
        weather: {
          ...state.weather,
          cloudCover: Math.round(cloudCoverMod * 1000) / 1000,
          condition,
          solarIrradiance: Math.round(irradiance),
          windSpeed: Math.round(windSpeed * 10) / 10,
          solarImpact,
        },
        buildings,
        gridImport: Math.round(gridImport * 10) / 10,
        gridExport: Math.round(gridExport * 10) / 10,
        gridDependency: Math.round(gridDependency * 10) / 10,
        renewableShare: Math.round(renewableShare * 10) / 10,
        co2Avoided: Math.round(co2PerHour * 100) / 100,
        dailyCo2Avoided: Math.round(dailyCo2 * 10) / 10,
        oorjaSyncScore: score,
        solarForecast: tick % 20 === 0 ? generateSolarForecast(Math.floor(hour), cloudCoverMod, state.weather.temperature) : state.solarForecast,
        demandForecast: tick % 20 === 0 ? generateDemandForecast(Math.floor(hour), isWeekend) : state.demandForecast,
        recommendations,
        anomalies,
        optimizationDecision,
        solarHistory: addPoint(state.solarHistory, solarPower),
        loadHistory: addPoint(state.loadHistory, totalLoad),
        batteryHistory: addPoint(state.batteryHistory, soc),
        gridHistory: addPoint(state.gridHistory, gridImport),
        windHistory: addPoint(state.windHistory, windPower),
      });
    },
  }))
);
