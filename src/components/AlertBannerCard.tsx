import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Flame,
  Clock,
  ArrowUpRight,
  Droplets,
  CloudRain,
  Share2,
  Volume2,
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

  // Theme styling configuration based on risk level
  const themeConfig = {
    LOW: {
      cardBg: 'bg-emerald-950/30',
      borderLeft: 'border-l-8 border-emerald-500',
      badgeBg: 'bg-emerald-600 text-white',
      badgeBorder: 'border-emerald-500',
      textColor: 'text-emerald-400',
      watermarkColor: 'text-emerald-600',
      metricBg: 'bg-emerald-950/50 border border-emerald-800/60',
      subTextColor: 'text-emerald-300',
      progressColor: 'bg-emerald-500',
      icon: ShieldCheck,
      emoji: '🟢',
      labelEn: 'LOW FLOOD RISK',
      labelNe: 'न्यून बाढी जोखिम',
    },
    MODERATE: {
      cardBg: 'bg-amber-950/35',
      borderLeft: 'border-l-8 border-amber-500',
      badgeBg: 'bg-amber-600 text-white',
      badgeBorder: 'border-amber-500',
      textColor: 'text-amber-400',
      watermarkColor: 'text-amber-600',
      metricBg: 'bg-amber-950/50 border border-amber-800/60',
      subTextColor: 'text-amber-300',
      progressColor: 'bg-amber-500',
      icon: AlertTriangle,
      emoji: '🟡',
      labelEn: 'MODERATE FLOOD RISK',
      labelNe: 'मध्यम बाढी जोखिम (सतर्कता)',
    },
    HIGH: {
      cardBg: 'bg-red-950/40',
      borderLeft: 'border-l-8 border-red-600',
      badgeBg: 'bg-red-600 text-white',
      badgeBorder: 'border-red-500',
      textColor: 'text-red-500',
      watermarkColor: 'text-red-600',
      metricBg: 'bg-red-900/40 border border-red-800/60',
      subTextColor: 'text-red-300',
      progressColor: 'bg-red-500',
      icon: AlertTriangle,
      emoji: '🚨',
      labelEn: 'HIGH FLOOD RISK',
      labelNe: 'उच्च बाढी जोखिम (पूर्व चेतावनी)',
    },
    SEVERE: {
      cardBg: 'bg-red-950/60',
      borderLeft: 'border-l-8 border-red-600',
      badgeBg: 'bg-red-600 text-white',
      badgeBorder: 'border-red-500',
      textColor: 'text-red-400',
      watermarkColor: 'text-red-600',
      metricBg: 'bg-red-950/80 border border-red-600/80',
      subTextColor: 'text-red-300',
      progressColor: 'bg-red-600',
      icon: Flame,
      emoji: '🚨',
      labelEn: 'SEVERE FLOOD RISK',
      labelNe: 'अति उच्च बाढी जोखिम (आपतकालीन)',
    },
  }[riskLevel];

  const handleTestSiren = () => {
    soundManager.playEmergencySiren(3.0);
    soundManager.triggerVibration([300, 100, 300, 100, 600]);
  };

  return (
    <section id="alert-banner-card" className="w-full">
      <div
        className={`${themeConfig.cardBg} ${themeConfig.borderLeft} border-y border-r border-slate-700 p-5 md:p-6 rounded-r-lg shadow-xl relative overflow-hidden transition-all duration-300`}
      >
        {/* Large watermark text in background */}
        <div className={`absolute top-2 right-4 ${themeConfig.watermarkColor} opacity-15 text-6xl md:text-7xl font-black italic tracking-tighter pointer-events-none select-none uppercase`}>
          {riskLevel}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Required Alert Block */}
          <div className="flex-1 space-y-3">
            {/* Top Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                id="risk-level-badge"
                className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase shadow-sm ${themeConfig.badgeBg}`}
              >
                <span>{themeConfig.emoji}</span>
                ACTIVE ALERT • {themeConfig.labelEn}
              </span>

              {dangerThresholdExceeded && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse shadow">
                  ⚠️ DANGER THRESHOLD BREACHED
                </span>
              )}

              {estimatedTimeToDangerHours !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-amber-300 border border-slate-700">
                  <Clock className="w-3 h-3" />
                  EST. CREST: ~{estimatedTimeToDangerHours} HRS
                </span>
              )}
            </div>

            {/* Structured Alert Title & Risk Prediction */}
            <div>
              <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${themeConfig.textColor} mt-1`}>
                🚨 {riskLevel} FLOOD RISK
              </h2>
              <div className="text-xl md:text-2xl font-mono font-bold text-white mt-1">
                PREDICTED RISK: <span className={themeConfig.textColor}>{riskScore}%</span>
              </div>
            </div>

            {/* Reason & Location Strip */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
              <div className="text-xs font-mono">
                <span className="uppercase text-slate-400 font-bold tracking-wider">AREA: </span>
                <span className="text-white font-bold text-sm">{location.name.toUpperCase()}</span>
                {language === 'NE' && (
                  <span className="text-slate-300 ml-1">({location.nameNepali})</span>
                )}
                <span className="text-slate-500 ml-2">| STATION: {location.monitoringStationCode}</span>
              </div>

              <div className="text-xs">
                <span className={`uppercase ${themeConfig.subTextColor} font-mono font-bold tracking-wider mr-1`}>
                  REASON FOR ALERT:
                </span>
                <span className="text-slate-100 text-sm font-medium leading-relaxed">
                  {reason}
                </span>
              </div>
            </div>

            {language === 'NE' && (
              <div className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded border border-slate-800 font-sans">
                <span className="font-bold text-amber-300">नेपाली जानकारी: </span>
                {result.nepaliSummary.reason}
              </div>
            )}
          </div>

          {/* Right Visual Telemetry Metrics & Factor Scores */}
          <div className="lg:w-84 flex flex-col gap-3 bg-slate-900/70 p-4 rounded border border-slate-700">
            {/* Risk Index Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">HYDROLOGICAL RISK INDEX</span>
                <span className={`font-black ${themeConfig.textColor}`}>{riskScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded transition-all duration-700 ease-out ${themeConfig.progressColor}`}
                  style={{ width: `${Math.max(riskScore, 4)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono uppercase">
                <span>0% Safe</span>
                <span>30% Low</span>
                <span>60% Mod</span>
                <span>85% High</span>
                <span>100% Severe</span>
              </div>
            </div>

            {/* Contributing Factor Grid */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                MODEL COMPONENT SCORES
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 uppercase font-mono">RAIN INTENSITY</span>
                    <span className="font-mono font-bold text-cyan-300">{factorBreakdown.rainfallScore}%</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 uppercase font-mono">RIVER LEVEL</span>
                    <span className="font-mono font-bold text-blue-300">{factorBreakdown.riverLevelScore}%</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 uppercase font-mono">RATE OF RISE</span>
                    <span className="font-mono font-bold text-amber-300">{factorBreakdown.rateOfRiseScore}%</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 uppercase font-mono">NWP FORECAST</span>
                    <span className="font-mono font-bold text-indigo-300">{factorBreakdown.forecastScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Alert Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="share-alert-card-btn"
                type="button"
                onClick={onOpenBroadcast}
                className="flex-1 py-1.5 px-3 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>DISPATCH SMS</span>
              </button>

              <button
                id="test-alarm-btn"
                type="button"
                onClick={handleTestSiren}
                title="Test Audio Siren Alarm"
                className={`py-1.5 px-2.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  riskScore >= 61
                    ? 'bg-red-600 text-white border-red-500 hover:bg-red-500'
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>SIREN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
