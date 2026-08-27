import React, { useState } from 'react';
import {
  CloudRain,
  Droplets,
  ArrowUpRight,
  Sparkles,
  CloudSun,
  Layers,
  Activity,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Sliders,
  Radio,
} from 'lucide-react';
import { FloodDataInput, LiveWeatherTelemetry, LocationProfile } from '../types';

interface DataInputPanelProps {
  input: FloodDataInput;
  location: LocationProfile;
  onChangeInput: (updated: Partial<FloodDataInput>) => void;
  onSimulateReading: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  liveWeather: LiveWeatherTelemetry | null;
  isLoadingLiveWeather: boolean;
  onRefreshLiveWeather: () => void;
  onSyncLiveInputs: () => void;
  isLiveSynced: boolean;
  language: 'EN' | 'NE';
}

export const DataInputPanel: React.FC<DataInputPanelProps> = ({
  input,
  location,
  onChangeInput,
  onSimulateReading,
  isStreaming,
  onToggleStreaming,
  liveWeather,
  isLoadingLiveWeather,
  onRefreshLiveWeather,
  onSyncLiveInputs,
  isLiveSynced,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'SIMULATION'>('LIVE');

  const dangerLevel = input.dangerRiverLevel || location.defaultDangerLevel;
  const warningLevel = input.warningRiverLevel || location.defaultWarningLevel;
  const normalLevel = location.normalDrySeasonLevel;

  return (
    <section id="data-input-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('LIVE')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LIVE'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span>{language === 'NE' ? 'प्रत्यक्ष मौसम र राडार' : 'Live Weather & Telemetry'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SIMULATION')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SIMULATION'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{language === 'NE' ? 'बाढी परीक्षण स्लाइडर' : 'Custom Simulation Sliders'}</span>
          </button>
        </div>

        {/* Quick Sync & Refresh Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshLiveWeather}
            disabled={isLoadingLiveWeather}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoadingLiveWeather ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>{language === 'NE' ? 'लोड हुँदै...' : 'Syncing...'}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'NE' ? 'मौसम रिफ्रेस' : 'Refresh Live'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSyncLiveInputs}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLiveSynced
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isLiveSynced ? (language === 'NE' ? 'प्रत्यक्ष डाटा सक्रिय' : 'Live Synced') : (language === 'NE' ? 'प्रत्यक्ष डाटा लागू गर्नुहोस्' : 'Apply Live Readings')}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE WEATHER & SATELLITE RADAR */}
      {activeTab === 'LIVE' && (
        <div className="space-y-3">
          {liveWeather ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {language === 'NE' ? 'मौसम अवस्था' : 'Weather Condition'}
                </span>
                <span className="font-bold text-amber-300 text-sm block mt-0.5 truncate">
                  {liveWeather.weatherCondition}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {language === 'NE' ? 'तापक्रम' : 'Temperature'}
                </span>
                <span className="font-bold text-white text-sm block mt-0.5">
                  {liveWeather.temperatureC} °C
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {language === 'NE' ? 'हालको वर्षा' : 'Live Rain Rate'}
                </span>
                <span className={`font-bold text-sm block mt-0.5 ${liveWeather.precipitationRateMmHr > 0 ? 'text-cyan-300' : 'text-slate-300'}`}>
                  {liveWeather.precipitationRateMmHr} mm/h
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {language === 'NE' ? 'आर्द्रता र हावा' : 'Humidity & Wind'}
                </span>
                <span className="font-bold text-indigo-300 text-sm block mt-0.5">
                  {liveWeather.humidityPercent}% • {liveWeather.windSpeedKmH} km/h
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {language === 'NE' ? 'विगत ४८ घण्टाको वर्षा' : 'Past 48h Rain'}
                </span>
                <span className="font-bold text-blue-300 text-sm block mt-0.5">
                  {liveWeather.past48hRainMm} mm
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  {language === 'NE' ? '१२ घण्टे वर्षा अनुमान' : '12h NWP Forecast'}
                </span>
                <span className="font-bold text-emerald-300 text-sm block mt-0.5">
                  {liveWeather.forecast12hMm} mm
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Fetching live meteorological data for {location.name}...</span>
            </div>
          )}

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Radio className="w-4 h-4 text-cyan-400" />
              <strong>{location?.name}</strong> • Station: <span className="font-mono text-cyan-300">{location?.monitoringStationCode}</span>
            </span>
            <span>Coordinates: {(location?.coordinates?.lat ?? 27.7).toFixed(4)}°N, {(location?.coordinates?.lng ?? 85.3).toFixed(4)}°E</span>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM SIMULATION SLIDERS */}
      {activeTab === 'SIMULATION' && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Rainfall Slider */}
            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  {language === 'NE' ? 'वर्षा दर (मिमी/घण्टा)' : 'Rainfall Intensity (mm/hr)'}
                </label>
                <span className="text-sm font-bold text-blue-300">{(input.rainfallIntensity ?? 0).toFixed(1)} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={input.rainfallIntensity ?? 0}
                onChange={(e) => onChangeInput({ rainfallIntensity: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm (Dry)</span>
                <span>15 mm (Moderate)</span>
                <span>35 mm (Heavy)</span>
                <span>50+ mm (Torrential)</span>
              </div>
            </div>

            {/* 2. River Level Slider */}
            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  {language === 'NE' ? 'नदीको पानीको सतह (मिटर)' : 'River Water Level (meters)'}
                </label>
                <span className={`text-sm font-bold ${(input.currentRiverLevel ?? 0) >= dangerLevel ? 'text-red-400' : 'text-cyan-300'}`}>
                  {(input.currentRiverLevel ?? 0).toFixed(2)} m
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max={dangerLevel * 1.3}
                step="0.05"
                value={input.currentRiverLevel ?? 0}
                onChange={(e) => onChangeInput({ currentRiverLevel: parseFloat(e.target.value) || 0 })}
                className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer ${
                  (input.currentRiverLevel ?? 0) >= dangerLevel ? 'accent-red-500' : 'accent-cyan-500'
                }`}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Normal: {normalLevel}m</span>
                <span className="text-amber-400 font-semibold">Warning: {warningLevel}m</span>
                <span className="text-red-400 font-bold">Danger: {dangerLevel}m</span>
              </div>
            </div>

            {/* 3. Rate of Rise Slider */}
            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  {language === 'NE' ? 'पानी बढ्ने दर (सेमी/घण्टा)' : 'River Rate of Rise (cm/hr)'}
                </label>
                <span className={`text-sm font-bold ${(input.rateOfRise ?? 0) > 15 ? 'text-red-400' : 'text-amber-300'}`}>
                  {(input.rateOfRise ?? 0) > 0 ? `+${(input.rateOfRise ?? 0).toFixed(1)}` : (input.rateOfRise ?? 0).toFixed(1)} cm/h
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="50"
                step="1"
                value={input.rateOfRise ?? 0}
                onChange={(e) => onChangeInput({ rateOfRise: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-15 (Receding)</span>
                <span>0 (Steady)</span>
                <span>+25 (Fast Rise)</span>
                <span>+50 (Flash Flood)</span>
              </div>
            </div>

            {/* 4. Soil Saturation Slider */}
            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  {language === 'NE' ? 'माटोको चिस्यान (%)' : 'Catchment Soil Moisture (%)'}
                </label>
                <span className="text-sm font-bold text-emerald-400">{input.soilSaturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={input.soilSaturation}
                onChange={(e) => onChangeInput({ soilSaturation: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Dry Soil)</span>
                <span>50% (Normal Wet)</span>
                <span>85%+ (Saturated Runoff)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onSimulateReading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'NE' ? 'अनियमित डाटा सिमुलेट गर्नुहोस्' : 'Simulate Random Reading'}</span>
            </button>

            <button
              type="button"
              onClick={onSyncLiveInputs}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {language === 'NE' ? 'प्रत्यक्ष डाटामा फर्कनुहोस्' : 'Reset to Real Live Weather'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
