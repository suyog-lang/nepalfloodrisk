import React from 'react';
import {
  CloudRain,
  Droplets,
  ArrowUpRight,
  Sparkles,
  Layers,
  CalendarDays,
  Activity,
  CloudSun,
  Wind,
  Compass,
  Gauge,
  RefreshCw,
  Loader2,
  CheckCircle2,
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
}) => {
  const dangerLevel = input.dangerRiverLevel || location.defaultDangerLevel;
  const warningLevel = input.warningRiverLevel || location.defaultWarningLevel;
  const normalLevel = location.normalDrySeasonLevel;

  // Rainfall qualitative tag
  const getRainTag = (mm: number) => {
    if (mm <= 0.1) return { label: 'TRACE / DRY', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    if (mm <= 5) return { label: 'LIGHT RAIN', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-700' };
    if (mm <= 15) return { label: 'MODERATE RAIN', color: 'text-blue-300 bg-blue-950/60 border-blue-700' };
    if (mm <= 30) return { label: 'HEAVY RAIN', color: 'text-amber-300 bg-amber-950/60 border-amber-700' };
    return { label: 'TORRENTIAL / CLOUDBURST', color: 'text-red-300 bg-red-950/80 border-red-600 font-bold' };
  };

  // Water level status tag
  const getRiverStatus = (level: number) => {
    if (level >= dangerLevel) {
      return {
        label: `🚨 DANGER BREACH (+${(level - dangerLevel).toFixed(2)}m)`,
        color: 'text-red-300 bg-red-950/80 border-red-600 font-bold',
      };
    }
    if (level >= warningLevel) {
      return {
        label: `⚠️ WARNING LEVEL (${(dangerLevel - level).toFixed(2)}m margin)`,
        color: 'text-amber-300 bg-amber-950/80 border-amber-600 font-bold',
      };
    }
    return {
      label: `SAFE NORMAL (${(dangerLevel - level).toFixed(2)}m margin)`,
      color: 'text-emerald-300 bg-emerald-950/60 border-emerald-700',
    };
  };

  const rainTag = getRainTag(input.rainfallIntensity);
  const riverTag = getRiverStatus(input.currentRiverLevel);

  return (
    <section id="data-input-panel" className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 md:p-5 shadow-xl space-y-4">
      {/* 1. Real-Time Live Weather Telemetry Header Card */}
      <div className="bg-slate-900 border border-slate-700 rounded p-3.5 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-400" />
              LIVE WEATHER & SATELLITE RADAR TELEMETRY
            </h4>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 uppercase font-bold">
              {liveWeather?.source === 'LIVE_METEOROLOGY_API' ? 'OPEN-METEO LIVE' : 'CALIBRATED FEED'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {liveWeather && (
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                LAST SYNC: <strong className="text-slate-200">{liveWeather.lastUpdated}</strong>
              </span>
            )}

            <button
              type="button"
              onClick={onRefreshLiveWeather}
              disabled={isLoadingLiveWeather}
              className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 uppercase"
            >
              {isLoadingLiveWeather ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                  <span>SYNCING...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>REFRESH LIVE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSyncLiveInputs}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-colors cursor-pointer uppercase ${
                isLiveSynced
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{isLiveSynced ? 'LIVE SYNCED' : 'APPLY LIVE READINGS'}</span>
            </button>
          </div>
        </div>

        {/* Live Weather Metrics Bar */}
        {liveWeather ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 text-xs font-mono">
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">WEATHER CONDITION</span>
              <span className="font-bold text-amber-300 text-[11px] block truncate">{liveWeather.weatherCondition}</span>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">TEMPERATURE</span>
              <span className="font-bold text-white text-xs">{liveWeather.temperatureC} °C</span>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">LIVE RAIN RATE</span>
              <span className={`font-bold text-xs ${liveWeather.precipitationRateMmHr > 0 ? 'text-cyan-300' : 'text-slate-300'}`}>
                {liveWeather.precipitationRateMmHr} mm/h
              </span>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">HUMIDITY / WIND</span>
              <span className="font-bold text-indigo-300 text-[11px]">{liveWeather.humidityPercent}% • {liveWeather.windSpeedKmH} km/h</span>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">48H ACCUMULATION</span>
              <span className="font-bold text-blue-300 text-xs">{liveWeather.past48hRainMm} mm</span>
            </div>

            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">12H NWP FORECAST</span>
              <span className="font-bold text-emerald-300 text-xs">{liveWeather.forecast12hMm} mm</span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Connecting to real-time meteorological radar for {location.name}...</span>
          </div>
        )}
      </div>

      {/* 2. Manual & Automated Telemetry Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-slate-700 pb-2.5">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold font-mono flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            TELEMETRY PARAMETER SLIDERS & SENSORS
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Adjust inputs below to simulate flash flooding or test risk scenarios.
          </p>
        </div>

        {/* Quick Simulation Trigger Actions */}
        <div className="flex items-center gap-2">
          <button
            id="panel-simulate-btn"
            type="button"
            onClick={onSimulateReading}
            className="px-2.5 py-1.5 rounded text-[10px] font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-3 h-3" />
            Simulate Reading
          </button>
          
          <button
            id="panel-stream-btn"
            type="button"
            onClick={onToggleStreaming}
            className={`px-2.5 py-1.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-all uppercase tracking-wider ${
              isStreaming
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
            }`}
          >
            <Activity className={`w-3 h-3 ${isStreaming ? 'text-emerald-400 animate-spin' : ''}`} />
            {isStreaming ? 'STREAM: ON' : 'STREAM: OFF'}
          </button>
        </div>
      </div>

      {/* Grid of Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Rainfall Intensity Input */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded border border-slate-700/80">
          <div className="flex justify-between items-end">
            <label htmlFor="rainfall-slider" className="text-xs text-slate-300 font-semibold uppercase italic flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Rainfall Intensity (mm/hr)
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${rainTag.color}`}>
                {rainTag.label}
              </span>
              <span className="text-sm font-mono font-bold text-blue-400">{input.rainfallIntensity.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="rainfall-slider"
              type="range"
              min="0"
              max="70"
              step="0.5"
              value={input.rainfallIntensity}
              onChange={(e) => onChangeInput({ rainfallIntensity: parseFloat(e.target.value) || 0 })}
              className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex items-center gap-1 min-w-[70px] bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <input
                id="rainfall-number-input"
                type="number"
                min="0"
                max="120"
                step="0.1"
                value={input.rainfallIntensity}
                onChange={(e) => onChangeInput({ rainfallIntensity: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-10 bg-transparent font-mono text-xs font-bold text-blue-300 text-right focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">mm</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 (Dry)</span>
            <span>15 (Mod)</span>
            <span>35 (Heavy)</span>
            <span>60+ (Cloudburst)</span>
          </div>
        </div>

        {/* 2. River Water Level vs Danger Level */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded border border-slate-700/80">
          <div className="flex justify-between items-end">
            <label htmlFor="river-level-slider" className="text-xs text-slate-300 font-semibold uppercase italic flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              River Water Level (meters)
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${riverTag.color}`}>
                {riverTag.label}
              </span>
              <span className={`text-sm font-mono font-bold ${
                input.currentRiverLevel >= dangerLevel ? 'text-red-400' : 'text-cyan-300'
              }`}>
                {input.currentRiverLevel.toFixed(2)}m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="river-level-slider"
              type="range"
              min="0.5"
              max={dangerLevel * 1.35}
              step="0.05"
              value={input.currentRiverLevel}
              onChange={(e) => onChangeInput({ currentRiverLevel: parseFloat(e.target.value) || 0 })}
              className={`w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer ${
                input.currentRiverLevel >= dangerLevel ? 'accent-red-500' : 'accent-cyan-500'
              }`}
            />
            <div className="flex items-center gap-1 min-w-[70px] bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <input
                id="river-level-number-input"
                type="number"
                min="0"
                max="25"
                step="0.05"
                value={input.currentRiverLevel}
                onChange={(e) => onChangeInput({ currentRiverLevel: Math.max(0, parseFloat(e.target.value) || 0) })}
                className={`w-10 bg-transparent font-mono text-xs font-bold text-right focus:outline-none ${
                  input.currentRiverLevel >= dangerLevel ? 'text-red-400' : 'text-cyan-300'
                }`}
              />
              <span className="text-[10px] text-slate-400 font-mono">m</span>
            </div>
          </div>

          {/* Threshold markers */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Normal: {normalLevel}m</span>
            <span className="text-amber-400 font-semibold">Warning: {warningLevel}m</span>
            <span className="text-red-400 font-bold">Danger: {dangerLevel}m</span>
          </div>
        </div>

        {/* 3. Rate of River Level Rise */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded border border-slate-700/80">
          <div className="flex justify-between items-end">
            <label htmlFor="rate-of-rise-slider" className="text-xs text-slate-300 font-semibold uppercase italic flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              River Rate of Rise (cm/hr)
            </label>
            <span className={`text-sm font-mono font-bold ${
              input.rateOfRise > 20 ? 'text-red-400' : input.rateOfRise > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {input.rateOfRise > 0 ? `+${input.rateOfRise.toFixed(1)}` : input.rateOfRise.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="rate-of-rise-slider"
              type="range"
              min="-20"
              max="60"
              step="1"
              value={input.rateOfRise}
              onChange={(e) => onChangeInput({ rateOfRise: parseFloat(e.target.value) || 0 })}
              className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex items-center gap-1 min-w-[70px] bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <input
                id="rate-of-rise-number-input"
                type="number"
                min="-50"
                max="100"
                step="1"
                value={input.rateOfRise}
                onChange={(e) => onChangeInput({ rateOfRise: parseFloat(e.target.value) || 0 })}
                className="w-10 bg-transparent font-mono text-xs font-bold text-amber-300 text-right focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">cm/h</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-20 (Receding)</span>
            <span>0 (Steady)</span>
            <span>+25 (Mod Rise)</span>
            <span>+50+ (Flash Surge)</span>
          </div>
        </div>

        {/* 4. Rain Forecast (Next 6h / 12h / 24h) */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded border border-slate-700/80">
          <div className="flex justify-between items-end">
            <label className="text-xs text-slate-300 font-semibold uppercase italic flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              Precipitation Forecast
            </label>
            {/* Timeframe selector */}
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-700 text-[10px]">
              {(['6h', '12h', '24h'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onChangeInput({ forecastTimeframe: tf })}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition-all cursor-pointer ${
                    input.forecastTimeframe === tf
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Active forecast slider */}
          {input.forecastTimeframe === '6h' && (
            <div className="flex items-center gap-3">
              <input
                id="forecast-6h-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={input.rainForecast6h}
                onChange={(e) => onChangeInput({ rainForecast6h: parseFloat(e.target.value) || 0 })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex items-center gap-1 min-w-[70px] bg-slate-950 px-2 py-1 rounded border border-slate-700">
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={input.rainForecast6h}
                  onChange={(e) => onChangeInput({ rainForecast6h: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-10 bg-transparent font-mono text-xs font-bold text-indigo-300 text-right focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">mm</span>
              </div>
            </div>
          )}

          {input.forecastTimeframe === '12h' && (
            <div className="flex items-center gap-3">
              <input
                id="forecast-12h-slider"
                type="range"
                min="0"
                max="160"
                step="2"
                value={input.rainForecast12h}
                onChange={(e) => onChangeInput({ rainForecast12h: parseFloat(e.target.value) || 0 })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex items-center gap-1 min-w-[70px] bg-slate-950 px-2 py-1 rounded border border-slate-700">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={input.rainForecast12h}
                  onChange={(e) => onChangeInput({ rainForecast12h: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-10 bg-transparent font-mono text-xs font-bold text-indigo-300 text-right focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">mm</span>
              </div>
            </div>
          )}

          {input.forecastTimeframe === '24h' && (
            <div className="flex items-center gap-3">
              <input
                id="forecast-24h-slider"
                type="range"
                min="0"
                max="250"
                step="5"
                value={input.rainForecast24h}
                onChange={(e) => onChangeInput({ rainForecast24h: parseFloat(e.target.value) || 0 })}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex items-center gap-1 min-w-[70px] bg-slate-950 px-2 py-1 rounded border border-slate-700">
                <input
                  type="number"
                  min="0"
                  max="450"
                  value={input.rainForecast24h}
                  onChange={(e) => onChangeInput({ rainForecast24h: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-10 bg-transparent font-mono text-xs font-bold text-indigo-300 text-right focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">mm</span>
              </div>
            </div>
          )}

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Forecast Window: {input.forecastTimeframe}</span>
            <span className="text-indigo-400">NWP Model Runoff</span>
          </div>
        </div>

        {/* 5. Soil Saturation Index */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded border border-slate-700/80 md:col-span-2">
          <div className="flex justify-between items-end">
            <label htmlFor="soil-saturation-slider" className="text-xs text-slate-300 font-semibold uppercase italic flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Soil Saturation Index (Antecedent Catchment Wetness)
            </label>
            <span className="text-sm font-mono font-bold text-emerald-400">{input.soilSaturation}%</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="soil-saturation-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={input.soilSaturation}
              onChange={(e) => onChangeInput({ soilSaturation: parseFloat(e.target.value) || 0 })}
              className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex items-center gap-1 min-w-[70px] bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <input
                id="soil-saturation-number-input"
                type="number"
                min="0"
                max="100"
                value={input.soilSaturation}
                onChange={(e) => onChangeInput({ soilSaturation: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                className="w-10 bg-transparent font-mono text-xs font-bold text-emerald-300 text-right focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-mono">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>0% Dry Soil Infiltration</span>
            <span>50% Moderate Field Capacity</span>
            <span>85%+ Saturated Runoff Surge</span>
          </div>
        </div>
      </div>

      {/* Model Weight Configuration Chip Bar */}
      <div className="pt-2 border-t border-slate-700">
        <p className="text-[10px] text-slate-400 uppercase italic mb-2 font-mono">
          WEIGHT CONFIGURATION (CURRENT MODEL: M1-NEPALHYDROL)
        </p>
        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
          <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
            Rain: <strong className="text-cyan-300">25%</strong>
          </span>
          <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
            Forecast: <strong className="text-indigo-300">20%</strong>
          </span>
          <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
            River: <strong className="text-blue-300">30%</strong>
          </span>
          <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
            Rise: <strong className="text-amber-300">25%</strong>
          </span>
          <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
            Soil: <strong className="text-emerald-300">+5%</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
