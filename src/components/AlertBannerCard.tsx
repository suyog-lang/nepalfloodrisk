import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Flame,
  Clock,
  Droplets,
  CloudRain,
  Share2,
  Volume2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
} from 'lucide-react';
import { FloodRiskResult, LocationProfile } from '../types';
import { soundManager } from '../utils/audioAlert';

interface AlertBannerCardProps {
  result: FloodRiskResult;
  location: LocationProfile;
  language: 'EN' | 'NE';
  onOpenBroadcast: () => void;
  soundEnabled: boolean;
}

export const AlertBannerCard: React.FC<AlertBannerCardProps> = ({
  result,
  location,
  language,
  onOpenBroadcast,
  soundEnabled,
}) => {
  const { riskScore, riskLevel, reason, factorBreakdown, dangerThresholdExceeded, estimatedTimeToDangerHours } = result;

  const config = {
    LOW: {
      bg: 'from-emerald-950/60 to-slate-900',
      border: 'border-emerald-500/60',
      badgeBg: 'bg-emerald-600 text-white',
      textColor: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      gaugeStroke: '#10b981',
      icon: ShieldCheck,
      emoji: '🟢',
      titleEn: 'LOW FLOOD RISK - SAFE',
      titleNe: 'न्यून बाढी जोखिम - सुरक्षित',
      descEn: 'River flow is normal. No imminent flood threat detected.',
      descNe: 'नदीको बहाव सामान्य छ। बाढीको कुनै तत्काल खतरा छैन।',
    },
    MODERATE: {
      bg: 'from-amber-950/60 to-slate-900',
      border: 'border-amber-500/60',
      badgeBg: 'bg-amber-600 text-white',
      textColor: 'text-amber-400',
      barColor: 'bg-amber-500',
      gaugeStroke: '#f59e0b',
      icon: AlertTriangle,
      emoji: '🟡',
      titleEn: 'MODERATE RISK - WATCH & STAY ALERT',
      titleNe: 'मध्यम बाढी जोखिम - सतर्क रहनुहोस्',
      descEn: 'Rainfall is increasing. River level is rising slowly, keep an eye on water levels.',
      descNe: 'वर्षा बढिरहेको छ र नदीको बहाव विस्तारै बढ्दै छ। सतर्क रहनुहोस्।',
    },
    HIGH: {
      bg: 'from-orange-950/70 to-slate-900',
      border: 'border-orange-500/70',
      badgeBg: 'bg-orange-600 text-white',
      textColor: 'text-orange-400',
      barColor: 'bg-orange-500',
      gaugeStroke: '#ea580c',
      icon: AlertTriangle,
      emoji: '🟠',
      titleEn: 'HIGH FLOOD WARNING - PREPARE TO EVACUATE',
      titleNe: 'उच्च बाढी चेतावनी - पूर्व तयारी गर्नुहोस्',
      descEn: 'Heavy rainfall upstream! River approaching warning level. Move valuable goods to high ground.',
      descNe: 'माथिल्लो तटीय क्षेत्रमा भारी वर्षा! नदी चेतावनी तह नजिक पुगेको छ। सतर्क रहनुहोस्।',
    },
    SEVERE: {
      bg: 'from-red-950/80 to-slate-900',
      border: 'border-red-500',
      badgeBg: 'bg-red-600 text-white animate-pulse',
      textColor: 'text-red-400',
      barColor: 'bg-red-600',
      gaugeStroke: '#ef4444',
      icon: Flame,
      emoji: '🚨',
      titleEn: 'SEVERE FLOOD DANGER - IMMEDIATE EVACUATION',
      titleNe: 'अति उच्च बाढी खतरा - तुरुन्त सुरक्षित ठाउँ जानुहोस्',
      descEn: 'DANGER LEVEL BREACHED! Flash flood inundation imminent. Evacuate riverbanks immediately!',
      descNe: 'खतराको तह पार भयो! बस्तीहरूमा बाढी पस्ने सम्भावना। तुरुन्त सुरक्षित उच्च स्थानमा जानुहोस्!',
    },
  }[riskLevel];

  const IconComponent = config.icon;

  const currentLevel = factorBreakdown?.riverLevelRawValue ?? location?.normalDrySeasonLevel ?? 1.0;
  const dangerLevel = location?.defaultDangerLevel ?? 4.0;
  const warningLevel = location?.defaultWarningLevel ?? 3.0;
  const normalLevel = location?.normalDrySeasonLevel ?? 1.0;

  const rainfallRate = factorBreakdown?.rainfallRateRawValue ?? 0;
  const rateOfRise = factorBreakdown?.rateOfRiseRawValue ?? 0;
  const rainForecast = factorBreakdown?.rainForecastRawValue ?? 0;

  // Water level percentage for graphic bar
  const levelPercent = Math.min(100, Math.max(10, ((currentLevel - normalLevel) / Math.max(0.1, dangerLevel - normalLevel)) * 80 + 15));

  const handleTestSiren = () => {
    soundManager.playEmergencySiren(2.5);
    soundManager.triggerVibration([300, 100, 300, 100, 500]);
  };

  return (
    <section id="alert-banner-card" className="w-full">
      <div className={`bg-gradient-to-r ${config.bg} border-2 ${config.border} rounded-xl p-4 md:p-6 shadow-xl relative overflow-hidden transition-all duration-300`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Column: Risk Badge & Clear Plain-Language Message */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase shadow tracking-wider ${config.badgeBg}`}>
                <span>{config.emoji}</span>
                <span>{language === 'NE' ? config.titleNe : config.titleEn}</span>
              </span>

              {dangerThresholdExceeded && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse shadow">
                  ⚠️ {language === 'NE' ? 'खतराको रेखा पार' : 'DANGER MARK BREACHED'}
                </span>
              )}

              {estimatedTimeToDangerHours !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-amber-300 border border-slate-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{language === 'NE' ? `बाढीको उच्च बिन्दु: ~${estimatedTimeToDangerHours} घण्टामा` : `Est. Crest in ~${estimatedTimeToDangerHours} Hours`}</span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{location.name}</span>
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {language === 'NE' ? config.descNe : config.descEn}
              </p>
            </div>

            {/* River Water Level Visual Gauge Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1.5 max-w-xl">
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <Droplets className="w-4 h-4" />
                  {language === 'NE' ? 'हालको पानीको तह' : 'Current River Depth'}: <strong className="text-white text-sm ml-1">{(currentLevel ?? 0).toFixed(2)} m</strong>
                </span>
                <span className="text-slate-400 text-[11px]">
                  {language === 'NE' ? 'खतराको तह' : 'Danger Mark'}: <strong className="text-red-400 font-bold">{(dangerLevel ?? 0).toFixed(1)} m</strong>
                </span>
              </div>

              {/* Progress bar with warning & danger ticks */}
              <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-700 ${config.barColor}`}
                  style={{ width: `${levelPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Normal: {(normalLevel ?? 0).toFixed(1)}m</span>
                <span className="text-amber-400 font-semibold">Warning: {(warningLevel ?? 0).toFixed(1)}m</span>
                <span className="text-red-400 font-bold">Danger: {(dangerLevel ?? 0).toFixed(1)}m</span>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent Circular Risk Score & Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 shrink-0 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            {/* Visual Circular Meter */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeDasharray={`${riskScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke={config.gaugeStroke}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white">{riskScore}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {language === 'NE' ? 'जोखिम' : 'RISK'}
                  </span>
                </div>
              </div>

              <div className="text-left space-y-1">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'NE' ? 'स्थिति' : 'STATUS'}:
                </div>
                <div className={`text-base font-black ${config.textColor}`}>
                  {language === 'NE' ? config.titleNe.split('-')[1] || config.titleNe : riskLevel}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'NE' ? 'स्टेशन कोड' : 'Station'}: {location.monitoringStationCode}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={onOpenBroadcast}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'सूचना सेयर गर्नुहोस्' : 'Share Alert'}</span>
              </button>

              {soundEnabled && (
                <button
                  type="button"
                  onClick={handleTestSiren}
                  title="Test siren sound"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 4 Summary Snapshot Metric Cards (Clean and Easy to Understand) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              {language === 'NE' ? 'वर्षा दर' : 'Live Rainfall Rate'}
            </span>
            <span className="text-sm font-bold text-blue-300">
              {rainfallRate.toFixed(1)} mm/hr
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              {language === 'NE' ? 'पानीको तह' : 'River Water Level'}
            </span>
            <span className={`text-sm font-bold ${currentLevel >= dangerLevel ? 'text-red-400' : 'text-cyan-300'}`}>
              {(currentLevel ?? 0).toFixed(2)} meters
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              {language === 'NE' ? 'पानी बढ्ने गति' : 'River Rise Rate'}
            </span>
            <span className={`text-sm font-bold flex items-center gap-1 ${
              rateOfRise > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {rateOfRise > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {rateOfRise > 0 ? `+${rateOfRise.toFixed(1)}` : rateOfRise.toFixed(1)} cm/hr
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              {language === 'NE' ? '१२ घण्टे वर्षा पूर्वानुमान' : '12h Rain Forecast'}
            </span>
            <span className="text-sm font-bold text-indigo-300">
              {rainForecast.toFixed(1)} mm
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
