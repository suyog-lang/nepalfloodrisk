import React from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  RefreshCw,
  PhoneCall,
  Activity,
  Globe,
  Radio,
  CloudSun,
  Loader2,
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
  onOpenSettings,
  onOpenBroadcast,
  onSimulateReading,
  language,
  onToggleLanguage,
  riskScore,
  liveWeather,
  isLoadingLiveWeather,
  onRefreshLiveWeather,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#1e293b] border-b border-slate-700 text-slate-200 shadow-md">
      {/* Telemetry Status & Emergency Strip */}
      <div id="hotline-strip" className="bg-[#0f172a] border-b border-slate-800 px-4 md:px-6 py-1.5 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2 uppercase tracking-wider">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE METEOROLOGICAL TELEMETRY: {isLoadingLiveWeather ? 'FETCHING...' : 'ONLINE (OPEN-METEO / DHM)'}
          </span>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Radio className="w-3 h-3 text-cyan-400" />
            STATION: <span className="font-bold text-cyan-300">{selectedLocation.monitoringStationCode}</span>
          </span>
          <span className="hidden lg:inline text-slate-700">|</span>
          <span className="hidden lg:inline text-slate-400">
            COORDS: {selectedLocation.coordinates.lat.toFixed(4)}°N, {selectedLocation.coordinates.lng.toFixed(4)}°E
          </span>
          {liveWeather && (
            <>
              <span className="hidden xl:inline text-slate-700">|</span>
              <span className="hidden xl:flex items-center gap-1.5 text-cyan-300 font-bold">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span>{liveWeather.weatherCondition} • {liveWeather.temperatureC}°C • RAIN: {liveWeather.precipitationRateMmHr} mm/h</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1 text-rose-400 font-bold">
            <PhoneCall className="w-3 h-3 text-rose-500" />
            <span className="hidden sm:inline">DHM FLOOD:</span>
            <a href="tel:1155" className="font-mono underline hover:text-white">1155</a>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="hidden sm:inline">POLICE:</span>
            <a href="tel:100" className="font-bold font-mono underline hover:text-white">100</a>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="hidden sm:inline">NEOC:</span>
            <a href="tel:1149" className="font-bold font-mono underline hover:text-white">1149</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm shadow ${
            riskScore >= 61 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
          }`}>
            {riskScore >= 61 ? '!' : '🌊'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-tight text-white uppercase">
                NEPAL FLOOD RISK <span className="text-slate-400 font-normal italic font-mono text-xs">v2.1</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-600 font-mono font-bold uppercase">
                REAL-TIME
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono hidden sm:block">
              DEPT OF HYDROLOGY & METEOROLOGY • LIVE RADAR & NWP PREDICTIONS
            </p>
          </div>
        </div>

        {/* Center / Location Selector */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative w-full flex items-center bg-slate-800/90 px-3 py-1.5 rounded border border-slate-600 focus-within:border-cyan-500 shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono italic mr-2 shrink-0">
              LOCATION:
            </span>
            <select
              id="location-select"
              value={selectedLocation.id}
              onChange={(e) => {
                const found = LOCATIONS.find((l) => l.id === e.target.value);
                if (found) {
                  onSelectLocation(found);
                  soundManager.playChime();
                }
              }}
              className="w-full bg-transparent text-xs md:text-sm font-semibold outline-none text-slate-100 cursor-pointer font-sans"
            >
              <optgroup label="Kathmandu Valley River Basins" className="bg-slate-900 text-slate-200">
                {LOCATIONS.filter((l) => l.region === 'Kathmandu Valley').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {language === 'NE' ? `(${loc.nameNepali})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Terai & Major River Basins" className="bg-slate-900 text-slate-200">
                {LOCATIONS.filter((l) => l.region !== 'Kathmandu Valley').map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {language === 'NE' ? `(${loc.nameNepali})` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Refresh Live Weather Button */}
          <button
            type="button"
            onClick={onRefreshLiveWeather}
            disabled={isLoadingLiveWeather}
            title="Fetch real-time weather & telemetry for selected location"
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 hover:border-cyan-500 transition-all cursor-pointer shrink-0 disabled:opacity-50"
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
          {/* Live Telemetry Stream Toggle */}
          <button
            id="stream-toggle-btn"
            type="button"
            onClick={onToggleStreaming}
            title={isStreaming ? 'Pause live auto-telemetry sync' : 'Start live auto-telemetry sync'}
            className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all border uppercase tracking-wider ${
              isStreaming
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80 shadow-sm shadow-emerald-950/40'
                : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span className="hidden sm:inline">{isStreaming ? 'LIVE AUTO-SYNC' : 'AUTO-SYNC: OFF'}</span>
          </button>

          {/* Broadcast Alert Export Button */}
          <button
            id="broadcast-btn"
            type="button"
            onClick={onOpenBroadcast}
            title="Generate Emergency SMS / Broadcast Alert"
            className={`p-1.5 rounded border transition-colors ${
              riskScore >= 61
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Sound / Siren Toggle */}
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute emergency siren & chimes' : 'Enable emergency siren & chimes'}
            className={`p-1.5 rounded border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-cyan-300 border-slate-600 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            type="button"
            onClick={onToggleLanguage}
            title="Switch Language (English / नेपाली)"
            className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold font-mono transition-colors flex items-center gap-1 uppercase"
          >
            <Globe className="w-3 h-3 text-slate-400" />
            {language}
          </button>

          {/* Model Weights Settings */}
          <button
            id="settings-btn"
            type="button"
            onClick={onOpenSettings}
            title="Configure Risk Scoring Weights"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
