import React from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  PhoneCall,
  Globe,
  Radio,
  CloudSun,
  Loader2,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { LiveWeatherTelemetry, LocationProfile } from '../types';
import { LOCATIONS } from '../data/locations';
import { soundManager } from '../utils/audioAlert';

interface HeaderProps {
  selectedLocation: LocationProfile;
  onSelectLocation: (loc: LocationProfile) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenBroadcast: () => void;
  onSimulateReading: () => void;
  language: 'EN' | 'NE';
  onToggleLanguage: () => void;
  riskScore: number;
  liveWeather: LiveWeatherTelemetry | null;
  isLoadingLiveWeather: boolean;
  onRefreshLiveWeather: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLocation,
  onSelectLocation,
  isStreaming,
  onToggleStreaming,
  soundEnabled,
  onToggleSound,
  onOpenBroadcast,
  language,
  onToggleLanguage,
  riskScore,
  liveWeather,
  isLoadingLiveWeather,
  onRefreshLiveWeather,
}) => {
  // Group locations by region
  const regions = [
    { label: '🏔️ Kathmandu Valley Rivers', value: 'Kathmandu Valley' },
    { label: '🌊 Koshi Basin (Eastern Nepal)', value: 'Koshi Basin' },
    { label: '🏞️ Gandaki & Narayani Basin (Central Nepal)', value: 'Gandaki Basin' },
    { label: '🏔️ Karnali & Mahakali Basin (Western Nepal)', value: 'Karnali Basin' },
    { label: '🌾 Terai Flash Flood Basins (Southern Nepal)', value: 'Terai Basin' },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700/80 text-slate-100 shadow-lg">
      {/* Top Emergency Hotlines Strip */}
      <div id="hotline-strip" className="bg-slate-950 px-3 md:px-6 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE WEATHER FEED: {isLoadingLiveWeather ? 'UPDATING...' : 'REAL-TIME METEOROLOGY ACTIVE'}
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Covering {LOCATIONS.length} Main Rivers across Nepal
          </span>
        </div>

        {/* Emergency Call Quick Links */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400 font-medium hidden sm:inline">Emergency Hotlines:</span>
          <a
            href="tel:1155"
            className="flex items-center gap-1 text-cyan-300 font-bold bg-slate-800 hover:bg-cyan-900/60 px-2 py-0.5 rounded transition-colors"
            title="DHM Flood Early Warning Toll-Free"
          >
            <PhoneCall className="w-3 h-3 text-cyan-400" />
            <span>1155 (DHM Flood)</span>
          </a>
          <a
            href="tel:100"
            className="flex items-center gap-1 text-rose-300 font-bold bg-slate-800 hover:bg-rose-900/60 px-2 py-0.5 rounded transition-colors"
            title="Nepal Police"
          >
            <PhoneCall className="w-3 h-3 text-rose-400" />
            <span>100 (Police)</span>
          </a>
          <a
            href="tel:1149"
            className="flex items-center gap-1 text-amber-300 font-bold bg-slate-800 hover:bg-amber-900/60 px-2 py-0.5 rounded transition-colors"
            title="NEOC Disaster Response"
          >
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>1149 (NEOC)</span>
          </a>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-3 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold shadow ${
              riskScore >= 61 ? 'bg-red-600 animate-pulse text-white' : 'bg-blue-600 text-white'
            }`}
          >
            🌊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
                {language === 'NE' ? 'नेपाल बाढी पूर्व-चेतावनी प्रणाली' : 'Nepal Flood Early Warning'}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {language === 'NE'
                ? 'काठमाडौं उपत्यका र नेपालका सबै मुख्य नदीहरूको प्रत्यक्ष बाढी जोखिम'
                : 'Real-time flood risk predictor for all main river basins of Nepal'}
            </p>
          </div>
        </div>

        {/* River & Station Selector (Large, Friendly Dropdown) */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-lg">
          <div className="relative w-full flex items-center bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 focus-within:border-cyan-400 shadow-inner">
            <MapPin className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">
                {language === 'NE' ? 'नदी र स्थान छान्नुहोस्' : 'Select River & Location'}:
              </span>
              <select
                id="river-location-selector"
                value={selectedLocation.id}
                onChange={(e) => {
                  const found = LOCATIONS.find((l) => l.id === e.target.value);
                  if (found) {
                    onSelectLocation(found);
                    soundManager.playChime();
                  }
                }}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none cursor-pointer"
              >
                {regions.map((reg) => (
                  <optgroup key={reg.value} label={reg.label} className="bg-slate-900 text-slate-200">
                    {LOCATIONS.filter((l) => l.region === reg.value || (reg.value === 'Karnali Basin' && l.region === 'Mahakali Basin')).map((loc) => (
                      <option key={loc.id} value={loc.id} className="py-1">
                        {loc.name} {language === 'NE' ? `(${loc.nameNepali})` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Refresh Live Button */}
          <button
            type="button"
            onClick={onRefreshLiveWeather}
            disabled={isLoadingLiveWeather}
            title="Refresh real-time weather & telemetry"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 hover:border-cyan-400 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isLoadingLiveWeather ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Emergency Alert Broadcast Button */}
          <button
            type="button"
            onClick={onOpenBroadcast}
            title="Share Alert Message"
            className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
              riskScore >= 61
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'NE' ? 'सूचना पठाउनुहोस्' : 'Broadcast Alert'}</span>
          </button>

          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute emergency siren' : 'Enable emergency siren'}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-cyan-300 border-slate-600 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={onToggleLanguage}
            title="Switch Language / भाषा बदल्नुहोस्"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'EN' ? 'नेपाली' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
