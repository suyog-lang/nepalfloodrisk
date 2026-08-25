export type FloodRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export interface FloodDataInput {
  locationId: string;
  rainfallIntensity: number; // mm/hr (current)
  rainForecast6h: number; // mm in next 6h
  rainForecast12h: number; // mm in next 12h
  rainForecast24h: number; // mm in next 24h
  forecastTimeframe: '6h' | '12h' | '24h';
  currentRiverLevel: number; // meters
  dangerRiverLevel: number; // meters
  warningRiverLevel: number; // meters
  rateOfRise: number; // cm/hr (positive for rising, negative for receding)
  soilSaturation: number; // percentage (0 - 100%)
  cumulativeRain48h: number; // mm in last 48h
}

export interface RiskCalculationWeights {
  rainfallIntensity: number; // default 0.25 (25%)
  forecastedRainfall: number; // default 0.20 (20%)
  riverLevelDangerRatio: number; // default 0.30 (30%)
  rateOfRise: number; // default 0.25 (25%)
  soilSaturationBonus: number; // default 0.05 modifier
}

export interface FactorScoreBreakdown {
  rainfallScore: number; // 0 - 100
  forecastScore: number; // 0 - 100
  riverLevelScore: number; // 0 - 100
  rateOfRiseScore: number; // 0 - 100
  soilSaturationScore: number; // 0 - 100
  rawWeightedScore: number;
}

export interface FloodRiskResult {
  riskScore: number; // 0 - 100 %
  riskLevel: FloodRiskLevel;
  reason: string;
  factorBreakdown: FactorScoreBreakdown;
  dangerThresholdExceeded: boolean;
  warningThresholdExceeded: boolean;
  waterLevelMarginToDanger: number; // meters (negative if already exceeded)
  estimatedTimeToDangerHours: number | null; // null if receding or already exceeded
  recommendedActions: string[];
  nepaliSummary: {
    riskLevel: string;
    headline: string;
    reason: string;
  };
}

export interface LocationProfile {
  id: string;
  name: string;
  nameNepali: string;
  riverName: string;
  region: 'Kathmandu Valley' | 'Terai Basin' | 'Hilly Basin';
  district: string;
  defaultDangerLevel: number; // meters
  defaultWarningLevel: number; // meters
  historicalMaxLevel: number; // meters
  normalDrySeasonLevel: number; // meters
  catchmentAreaSqKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  svgPosition: {
    x: number; // % in Kathmandu / Nepal map
    y: number;
  };
  monitoringStationCode: string;
  stationType: 'Automated Radar' | 'Acoustic Gauge' | 'Pressure Transducer';
  vulnerableCommunities: string[];
}

export interface HydrographPoint {
  time: string;
  hourOffset: number;
  rainfall: number; // mm/hr
  riverLevel: number; // meters
  warningThreshold: number;
  dangerThreshold: number;
  isForecast: boolean;
  projectedRange?: [number, number]; // [min, max] confidence interval
}

export interface LiveWeatherTelemetry {
  temperatureC: number;
  humidityPercent: number;
  weatherCode: number;
  weatherCondition: string;
  precipitationRateMmHr: number;
  forecast6hMm: number;
  forecast12hMm: number;
  forecast24hMm: number;
  past48hRainMm: number;
  soilMoisturePercent: number; // 0 - 100%
  windSpeedKmH: number;
  surfacePressureHpa: number;
  lastUpdated: string; // Formatted time string e.g. "09:12:45 AM"
  timestamp: number;
  source: 'LIVE_METEOROLOGY_API' | 'CALIBRATED_FALLBACK';
}

export interface ScenarioPreset {
  id: string;
  name: string;
  nameNepali: string;
  description: string;
  iconName: string;
  targetLocationId: string;
  data: Partial<FloodDataInput>;
}
