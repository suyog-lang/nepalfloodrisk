/**
 * Flood Risk Estimation Engine for Kathmandu Valley & Nepal River Basins
 * 
 * ARCHITECTURE NOTE FOR PRODUCTION DEPLOYMENT:
 * In a production deployment connected to real hydrological sensors:
 * 1. Replace the mock inputs with live REST / Webhook / MQTT feeds from:
 *    - Department of Hydrology and Meteorology (DHM) Nepal: https://hydrology.gov.np
 *    - Real-time telemetry endpoints: e.g., `/api/dhm/stations/{stationId}/realtime`
 *    - Open-Meteo or ECMWF high-resolution precipitation forecasts for Nepal coordinates
 * 2. The pure function `calculateFloodRisk()` below consumes standardized telemetry parameters
 *    and produces deterministic, explainable risk classifications and actionable early warnings.
 */

import {
  FloodDataInput,
  FloodRiskLevel,
  FloodRiskResult,
  HydrographPoint,
  LocationProfile,
  RiskCalculationWeights,
} from '../types';
import { LOCATIONS } from '../data/locations';

/**
 * Normalizes rainfall intensity (mm/hr) to a 0 - 100 risk factor score.
 * Hydrological benchmarks for Nepal topography:
 * - < 5 mm/hr: Light / Normal (0 - 20)
 * - 5 - 15 mm/hr: Moderate (20 - 50)
 * - 15 - 30 mm/hr: Heavy / High (50 - 80)
 * - 30 - 60+ mm/hr: Extreme / Cloudburst (80 - 100)
 */
export function normalizeRainfallIntensity(rainfallMmHr: number): number {
  if (rainfallMmHr <= 0) return 0;
  if (rainfallMmHr <= 5) return (rainfallMmHr / 5) * 20;
  if (rainfallMmHr <= 15) return 20 + ((rainfallMmHr - 5) / 10) * 30;
  if (rainfallMmHr <= 30) return 50 + ((rainfallMmHr - 15) / 15) * 30;
  if (rainfallMmHr <= 60) return 80 + ((rainfallMmHr - 30) / 30) * 20;
  return 100;
}

/**
 * Normalizes forecasted cumulative rainfall to a 0 - 100 score based on timeframe.
 */
export function normalizeForecastRainfall(
  forecastMm: number,
  timeframe: '6h' | '12h' | '24h'
): number {
  if (forecastMm <= 0) return 0;
  // Threshold limits depend on duration
  const severeThreshold = timeframe === '6h' ? 50 : timeframe === '12h' ? 90 : 150;
  const ratio = Math.min(forecastMm / severeThreshold, 1.25);
  return Math.min(Math.round(ratio * 100), 100);
}

/**
 * Normalizes River Water Level relative to Warning & Danger thresholds.
 * - Below warning: 0 to 60
 * - Between warning and danger: 60 to 90
 * - At or above danger level: 90 to 100 (critical inundation)
 */
export function normalizeRiverLevel(
  currentLevel: number,
  warningLevel: number,
  dangerLevel: number,
  normalLevel: number = 1.0
): number {
  if (currentLevel <= normalLevel) {
    return Math.max(0, (currentLevel / Math.max(normalLevel, 0.1)) * 25);
  }
  if (currentLevel < warningLevel) {
    const range = warningLevel - normalLevel;
    const progress = range > 0 ? (currentLevel - normalLevel) / range : 0.5;
    return 25 + progress * 35; // 25 to 60
  }
  if (currentLevel < dangerLevel) {
    const range = dangerLevel - warningLevel;
    const progress = range > 0 ? (currentLevel - warningLevel) / range : 0.5;
    return 60 + progress * 30; // 60 to 90
  }
  // Exceeded danger level: immediate critical scale
  const overage = currentLevel - dangerLevel;
  const criticalBonus = Math.min(overage * 20, 10);
  return Math.min(90 + criticalBonus, 100);
}

/**
 * Normalizes Rate of Water Level Rise (cm/hr).
 * Negative means water is receding.
 * Rapid rise (> 25 cm/hr) in steep Himalayan/Valley catchments causes flash floods.
 */
export function normalizeRateOfRise(rateCmHr: number): number {
  if (rateCmHr <= 0) {
    // Receding or stationary: minimal rise penalty
    return Math.max(0, 10 + rateCmHr * 0.5);
  }
  if (rateCmHr <= 10) return (rateCmHr / 10) * 35; // 0 to 35
  if (rateCmHr <= 25) return 35 + ((rateCmHr - 10) / 15) * 35; // 35 to 70
  if (rateCmHr <= 50) return 70 + ((rateCmHr - 25) / 25) * 30; // 70 to 100
  return 100;
}

/**
 * Main Pure Risk Calculation Function
 */
export function calculateFloodRisk(
  input: FloodDataInput,
  weights: RiskCalculationWeights
): FloodRiskResult {
  const location = LOCATIONS.find((l) => l.id === input.locationId) || LOCATIONS[0];
  const warningLevel = input.warningRiverLevel || location.defaultWarningLevel;
  const dangerLevel = input.dangerRiverLevel || location.defaultDangerLevel;
  const normalLevel = location.normalDrySeasonLevel;

  // Selected forecast mm based on chosen timeframe
  const activeForecastMm =
    input.forecastTimeframe === '6h'
      ? input.rainForecast6h
      : input.forecastTimeframe === '12h'
      ? input.rainForecast12h
      : input.rainForecast24h;

  // Sub-scores (0 - 100)
  const rainfallScore = normalizeRainfallIntensity(input.rainfallIntensity);
  const forecastScore = normalizeForecastRainfall(activeForecastMm, input.forecastTimeframe);
  const riverLevelScore = normalizeRiverLevel(
    input.currentRiverLevel,
    warningLevel,
    dangerLevel,
    normalLevel
  );
  const rateOfRiseScore = normalizeRateOfRise(input.rateOfRise);
  const soilSaturationScore = Math.min(Math.max(input.soilSaturation, 0), 100);

  // Normalize user weights to sum to 1.0 (excluding optional soil saturation modifier)
  const baseWeightSum =
    weights.rainfallIntensity +
    weights.forecastedRainfall +
    weights.riverLevelDangerRatio +
    weights.rateOfRise;

  const normW1 = (weights.rainfallIntensity / baseWeightSum) || 0.25;
  const normW2 = (weights.forecastedRainfall / baseWeightSum) || 0.20;
  const normW3 = (weights.riverLevelDangerRatio / baseWeightSum) || 0.30;
  const normW4 = (weights.rateOfRise / baseWeightSum) || 0.25;

  let rawWeightedScore =
    rainfallScore * normW1 +
    forecastScore * normW2 +
    riverLevelScore * normW3 +
    rateOfRiseScore * normW4;

  // Soil saturation amplifier: high soil saturation prevents percolation and amplifies surface runoff
  if (soilSaturationScore > 75) {
    const saturationBoost = ((soilSaturationScore - 75) / 25) * (weights.soilSaturationBonus * 100);
    rawWeightedScore += saturationBoost;
  }

  // If river already exceeds danger level, force minimum floor of 75%
  if (input.currentRiverLevel >= dangerLevel) {
    rawWeightedScore = Math.max(rawWeightedScore, 82);
  } else if (input.currentRiverLevel >= warningLevel) {
    rawWeightedScore = Math.max(rawWeightedScore, 55);
  }

  const finalScore = Math.min(Math.max(Math.round(rawWeightedScore), 0), 100);

  // Risk Level Classification:
  // LOW (0–30%), MODERATE (31–60%), HIGH (61–85%), SEVERE (86–100%)
  let riskLevel: FloodRiskLevel = 'LOW';
  if (finalScore >= 86) {
    riskLevel = 'SEVERE';
  } else if (finalScore >= 61) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 31) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'LOW';
  }

  // Synthesize Explainable Reason
  const reason = generateRiskReason({
    rainfallMm: input.rainfallIntensity,
    rainfallScore,
    forecastMm: activeForecastMm,
    timeframe: input.forecastTimeframe,
    forecastScore,
    currentLevel: input.currentRiverLevel,
    dangerLevel,
    warningLevel,
    riverLevelScore,
    rateOfRise: input.rateOfRise,
    rateOfRiseScore,
    soilSaturation: input.soilSaturation,
    riskLevel,
  });

  const dangerThresholdExceeded = input.currentRiverLevel >= dangerLevel;
  const warningThresholdExceeded = input.currentRiverLevel >= warningLevel;
  const waterLevelMarginToDanger = Number((dangerLevel - input.currentRiverLevel).toFixed(2));

  // Estimate Time to Danger if rising and below danger
  let estimatedTimeToDangerHours: number | null = null;
  if (input.rateOfRise > 0 && input.currentRiverLevel < dangerLevel) {
    const deltaMeters = dangerLevel - input.currentRiverLevel;
    const rateMetersPerHour = input.rateOfRise / 100;
    if (rateMetersPerHour > 0.01) {
      estimatedTimeToDangerHours = Number((deltaMeters / rateMetersPerHour).toFixed(1));
    }
  }

  // Action Recommendations
  const recommendedActions = getRecommendedActions(riskLevel, dangerThresholdExceeded);

  // Nepali localized summary
  const nepaliSummary = getNepaliSummary(riskLevel, location.nameNepali, input);

  return {
    riskScore: finalScore,
    riskLevel,
    reason,
    factorBreakdown: {
      rainfallScore: Math.round(rainfallScore),
      forecastScore: Math.round(forecastScore),
      riverLevelScore: Math.round(riverLevelScore),
      rateOfRiseScore: Math.round(rateOfRiseScore),
      soilSaturationScore: Math.round(soilSaturationScore),
      rawWeightedScore,
      rainfallRateRawValue: input.rainfallIntensity,
      riverLevelRawValue: input.currentRiverLevel,
      rateOfRiseRawValue: input.rateOfRise,
      rainForecastRawValue: activeForecastMm,
      soilSaturationRawValue: input.soilSaturation,
    },
    dangerThresholdExceeded,
    warningThresholdExceeded,
    waterLevelMarginToDanger,
    estimatedTimeToDangerHours,
    recommendedActions,
    nepaliSummary,
  };
}

/**
 * Helper to construct human-readable explainable driver strings
 */
function generateRiskReason(ctx: {
  rainfallMm: number;
  rainfallScore: number;
  forecastMm: number;
  timeframe: string;
  forecastScore: number;
  currentLevel: number;
  dangerLevel: number;
  warningLevel: number;
  riverLevelScore: number;
  rateOfRise: number;
  rateOfRiseScore: number;
  soilSaturation: number;
  riskLevel: FloodRiskLevel;
}): string {
  const drivers: string[] = [];

  // Check river level status
  if (ctx.currentLevel >= ctx.dangerLevel) {
    drivers.push(`River level (${ctx.currentLevel.toFixed(1)}m) has breached danger threshold (${ctx.dangerLevel.toFixed(1)}m)`);
  } else if (ctx.currentLevel >= ctx.warningLevel) {
    drivers.push(`River water level (${ctx.currentLevel.toFixed(1)}m) is at warning mark`);
  }

  // Check rainfall intensity
  if (ctx.rainfallMm >= 35) {
    drivers.push(`Torrential downpour (${ctx.rainfallMm} mm/hr)`);
  } else if (ctx.rainfallMm >= 18) {
    drivers.push(`Heavy rainfall (${ctx.rainfallMm} mm/hr)`);
  } else if (ctx.rainfallMm >= 8) {
    drivers.push(`Moderate rainfall (${ctx.rainfallMm} mm/hr)`);
  }

  // Check rate of rise
  if (ctx.rateOfRise >= 30) {
    drivers.push(`rapidly rising water levels (+${ctx.rateOfRise} cm/hr)`);
  } else if (ctx.rateOfRise >= 12) {
    drivers.push(`steadily rising river (+${ctx.rateOfRise} cm/hr)`);
  } else if (ctx.rateOfRise < -5) {
    drivers.push(`receding river level (${ctx.rateOfRise} cm/hr)`);
  }

  // Check forecast
  if (ctx.forecastScore >= 70) {
    drivers.push(`severe ${ctx.timeframe} rain forecast (${ctx.forecastMm}mm)`);
  } else if (ctx.forecastScore >= 45) {
    drivers.push(`continued precipitation expected (${ctx.forecastMm}mm/${ctx.timeframe})`);
  }

  // Check saturated soil
  if (ctx.soilSaturation >= 85) {
    drivers.push(`near-saturated soil (${ctx.soilSaturation}%) accelerating surface runoff`);
  }

  if (drivers.length === 0) {
    return 'Low precipitation with river water levels well within normal safe operating margins.';
  }

  // Join top 2-3 most prominent drivers
  if (drivers.length === 1) {
    return drivers[0];
  }

  return drivers.slice(0, 3).join(' + ');
}

/**
 * Recommended Actions per Risk Level conforming to Nepal Disaster Management Protocols
 */
function getRecommendedActions(riskLevel: FloodRiskLevel, overDanger: boolean): string[] {
  switch (riskLevel) {
    case 'SEVERE':
      return [
        '🚨 IMMEDIATE EVACUATION: Move immediately to identified high-ground shelters or RCC multi-story buildings.',
        '📞 Call Nepal Emergency Numbers: 1155 (DHM Flood Toll-Free) or 100 (Police).',
        '⚡ Disconnect main electrical breakers and gas supplies before water enters premises.',
        '🎒 Carry waterproof Go-Bag: Essential documents, drinking water, dry food, flashlights, and prescription medications.',
        '🚫 Do NOT attempt to walk, swim, or drive through flowing floodwaters or submerged underpasses.',
      ];
    case 'HIGH':
      return [
        '⚠️ HIGH ALERT: Move livestock, vehicles, and ground-floor valuables to 2nd floor or elevated platforms.',
        '📻 Continuously monitor DHM SMS broadcasts and local siren announcements.',
        '🧒 Secure vulnerable family members (children, elderly, persons with disabilities) for early transit.',
        '🎒 Prepare emergency Go-Bag with waterproof pouch for citizen cards and phones.',
        '🚧 Avoid riverbank roads (e.g., Bagmati/Dhobi Khola corridors) prone to sudden bank erosion and wall collapse.',
      ];
    case 'MODERATE':
      return [
        '👀 MONITOR CONDITIONS: Check river gauges every 30 minutes if living in riparian floodplains.',
        '🧹 Clear nearby drainage channels, culverts, and rooftop outlets to prevent localized waterlogging.',
        '📱 Keep mobile phones fully charged and maintain emergency contact list (Ward disaster committee).',
        '🚗 Avoid parking vehicles in basement garages or low-lying river berms.',
      ];
    case 'LOW':
    default:
      return [
        '✅ CONDITIONS NORMAL: Safe hydrological status across catchment.',
        '📊 Routine monitoring active via automated telemetry stations.',
        '🌦️ Review seasonal monsoon weather advisories periodically.',
      ];
  }
}

/**
 * Localization helper for Nepali language summaries
 */
function getNepaliSummary(
  level: FloodRiskLevel,
  locationNepali: string,
  input: FloodDataInput
) {
  const levelLabels: Record<FloodRiskLevel, string> = {
    LOW: 'न्यून (सुरक्षित)',
    MODERATE: 'मध्यम (सतर्कता)',
    HIGH: 'उच्च (खतराको पूर्व चेतावनी)',
    SEVERE: 'अति उच्च (आपतकालीन बाढी विपद्)',
  };

  let reasonNepali = '';
  if (level === 'SEVERE') {
    reasonNepali = 'अति भारी वर्षा र नदीले खतराको तह पार गरेको कारण तटीय क्षेत्रमा तत्काल बाढीको जोखिम।';
  } else if (level === 'HIGH') {
    reasonNepali = 'भारी वर्षा र नदीको जलसतह तीव्र गतिमा वृद्धि भइरहेकोले सुरक्षित स्थानमा सर्नुहोस्।';
  } else if (level === 'MODERATE') {
    reasonNepali = 'लगातार वर्षा भइरहेकोले नदी किनारका बासिन्दालाई उच्च सतर्कता अपनाउन अनुरोध।';
  } else {
    reasonNepali = 'हाल जलसतह सामान्य सीमा भित्र रहेको र तत्काल बाढीको जोखिम न्यून छ।';
  }

  return {
    riskLevel: levelLabels[level],
    headline: `🚨 ${levelLabels[level]} बाढी जोखिम - ${locationNepali}`,
    reason: reasonNepali,
  };
}

/**
 * Generates realistic 18-hour hydrograph time-series data
 * (12 hours historical + current + 6 hours forward forecast)
 */
export function generateHydrographData(
  input: FloodDataInput,
  location: LocationProfile
): HydrographPoint[] {
  const points: HydrographPoint[] = [];
  const now = new Date();
  const warning = input.warningRiverLevel || location.defaultWarningLevel;
  const danger = input.dangerRiverLevel || location.defaultDangerLevel;
  const currentLevel = input.currentRiverLevel;
  const currentRain = input.rainfallIntensity;
  const rateRise = input.rateOfRise / 100; // meters per hour

  // 12 hours historical
  for (let i = 12; i >= 1; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Smooth historical curve leading to current level
    const progress = (12 - i) / 12;
    const histRain = Math.max(0, currentRain * progress + Math.sin(i * 0.7) * 4);
    const histLevel = Math.max(
      location.normalDrySeasonLevel,
      currentLevel - (i * rateRise * 0.6) - Math.cos(i * 0.5) * 0.15
    );

    points.push({
      time: timeStr,
      hourOffset: -i,
      rainfall: Number(histRain.toFixed(1)),
      riverLevel: Number(histLevel.toFixed(2)),
      warningThreshold: warning,
      dangerThreshold: danger,
      isForecast: false,
    });
  }

  // Current reading (offset 0)
  const currentStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  points.push({
    time: currentStr,
    hourOffset: 0,
    rainfall: Number(currentRain.toFixed(1)),
    riverLevel: Number(currentLevel.toFixed(2)),
    warningThreshold: warning,
    dangerThreshold: danger,
    isForecast: false,
  });

  // 6 hours forecast
  for (let f = 1; f <= 6; f++) {
    const time = new Date(now.getTime() + f * 3600 * 1000);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Forecast rainfall decay or sustain based on forecast6h
    const avgForecastRain = input.rainForecast6h / 6;
    const fRain = Math.max(0, avgForecastRain + Math.sin(f * 0.9) * 3);
    
    // Future river level calculation
    const deltaLevel = rateRise * f * 0.85; // slight dampening over time
    const projectedLevel = Math.max(
      location.normalDrySeasonLevel,
      currentLevel + deltaLevel
    );

    points.push({
      time: timeStr,
      hourOffset: f,
      rainfall: Number(fRain.toFixed(1)),
      riverLevel: Number(projectedLevel.toFixed(2)),
      warningThreshold: warning,
      dangerThreshold: danger,
      isForecast: true,
      projectedRange: [
        Number(Math.max(0.5, projectedLevel - 0.25 * f).toFixed(2)),
        Number((projectedLevel + 0.35 * f).toFixed(2)),
      ],
    });
  }

  return points;
}

/**
 * Live Telemetry Simulation Helper:
 * Produces smooth stochastic fluctuations to mimic real sensor reads.
 */
export function simulateSensorReading(
  current: FloodDataInput,
  trendType: 'random' | 'increasing' | 'decreasing' = 'random'
): FloodDataInput {
  const rainDelta =
    trendType === 'increasing'
      ? Math.random() * 4 + 1
      : trendType === 'decreasing'
      ? -(Math.random() * 4 + 1)
      : (Math.random() - 0.48) * 3;

  const riseDelta =
    trendType === 'increasing'
      ? Math.random() * 5 + 1
      : trendType === 'decreasing'
      ? -(Math.random() * 5 + 1)
      : (Math.random() - 0.48) * 4;

  const newRainfall = Math.max(0, Number((current.rainfallIntensity + rainDelta).toFixed(1)));
  const newRateOfRise = Math.max(-30, Math.min(80, Number((current.rateOfRise + riseDelta).toFixed(1))));
  
  // Water level updates incrementally based on rate of rise
  const levelDelta = (newRateOfRise / 100) * 0.08; // small 5-min step simulation
  const newLevel = Math.max(0.5, Number((current.currentRiverLevel + levelDelta).toFixed(2)));

  const newSoil = Math.min(
    100,
    Math.max(10, Number((current.soilSaturation + (newRainfall > 15 ? 1.5 : -0.5)).toFixed(1)))
  );

  return {
    ...current,
    rainfallIntensity: newRainfall,
    rateOfRise: newRateOfRise,
    currentRiverLevel: newLevel,
    soilSaturation: newSoil,
  };
}
