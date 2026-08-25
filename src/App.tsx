/**
 * Flood Risk Predictor for Kathmandu Valley & Nepal Basins
 * Real-time Hydrological Early Warning System
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FloodDataInput,
  FloodRiskLevel,
  LiveWeatherTelemetry,
  LocationProfile,
  RiskCalculationWeights,
  ScenarioPreset,
} from './types';
import { LOCATIONS, DEFAULT_WEIGHTS, SCENARIO_PRESETS } from './data/locations';
import {
  calculateFloodRisk,
  generateHydrographData,
  simulateSensorReading,
} from './utils/floodRiskEngine';
import { fetchLiveLocationTelemetry } from './services/liveWeatherService';
import { soundManager } from './utils/audioAlert';
import { Header } from './components/Header';
import { AlertBannerCard } from './components/AlertBannerCard';
import { ScenarioPresets } from './components/ScenarioPresets';
import { DataInputPanel } from './components/DataInputPanel';
import { HydrographChart } from './components/HydrographChart';
import { BasinMap } from './components/BasinMap';
import { EmergencyActionGuide } from './components/EmergencyActionGuide';
import { WeightSettingsModal } from './components/WeightSettingsModal';
import { BroadcastModal } from './components/BroadcastModal';

export default function App() {
  // 1. Core State
  const [selectedLocation, setSelectedLocation] = useState<LocationProfile>(LOCATIONS[0]);
  const [weights, setWeights] = useState<RiskCalculationWeights>(DEFAULT_WEIGHTS);
  const [language, setLanguage] = useState<'EN' | 'NE'>('EN');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('live-telemetry');
  const [lastAlertLevel, setLastAlertLevel] = useState<FloodRiskLevel>('LOW');

  // Live Weather Telemetry State
  const [liveWeather, setLiveWeather] = useState<LiveWeatherTelemetry | null>(null);
  const [isLoadingLiveWeather, setIsLoadingLiveWeather] = useState<boolean>(true);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(true);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Active Tab for Mobile Layout
  const [mobileTab, setMobileTab] = useState<'OVERVIEW' | 'INPUTS' | 'HYDROGRAPH' | 'MAP' | 'ACTIONS'>('OVERVIEW');

  // Input Data state (initialized with safe baseline until live weather loads)
  const [inputData, setInputData] = useState<FloodDataInput>({
    locationId: LOCATIONS[0].id,
    rainfallIntensity: 0.0,
    rainForecast6h: 1.5,
    rainForecast12h: 3.5,
    rainForecast24h: 6.0,
    forecastTimeframe: '12h',
    currentRiverLevel: LOCATIONS[0].normalDrySeasonLevel,
    dangerRiverLevel: LOCATIONS[0].defaultDangerLevel,
    warningRiverLevel: LOCATIONS[0].defaultWarningLevel,
    rateOfRise: -1.5,
    soilSaturation: 35,
    cumulativeRain48h: 4.0,
  });

  // Function to load live weather & telemetry for a given location
  const loadLiveWeather = useCallback(async (location: LocationProfile, forceSyncInputs = true) => {
    setIsLoadingLiveWeather(true);
    try {
      const { weather, inputData: liveInput } = await fetchLiveLocationTelemetry(location);
      setLiveWeather(weather);
      if (forceSyncInputs) {
        setInputData(liveInput);
        setIsLiveSynced(true);
      }
    } catch (e) {
      console.error('Error fetching live weather:', e);
    } finally {
      setIsLoadingLiveWeather(false);
    }
  }, []);

  // Initial load of live weather on component mount
  useEffect(() => {
    loadLiveWeather(selectedLocation, true);
  }, [loadLiveWeather, selectedLocation]);

  // Calculate Risk Result
  const riskResult = useMemo(() => {
    return calculateFloodRisk(inputData, weights);
  }, [inputData, weights]);

  // Generate 18h Hydrograph Time-Series Data
  const hydrographData = useMemo(() => {
    return generateHydrographData(inputData, selectedLocation);
  }, [inputData, selectedLocation]);

  // Audio & Notification effect on risk level change
  useEffect(() => {
    if (riskResult.riskLevel !== lastAlertLevel) {
      if (riskResult.riskLevel === 'SEVERE' || riskResult.riskLevel === 'HIGH') {
        soundManager.playEmergencySiren(2.0);
        soundManager.triggerVibration([250, 100, 250, 100, 400]);
      } else {
        soundManager.playChime();
      }
      setLastAlertLevel(riskResult.riskLevel);
    }
  }, [riskResult.riskLevel, lastAlertLevel]);

  // Handle Location Switch (automatically queries live weather for the new coordinates)
  const handleSelectLocation = useCallback((location: LocationProfile) => {
    setSelectedLocation(location);
    setActivePresetId('live-telemetry');
    loadLiveWeather(location, true);
  }, [loadLiveWeather]);

  // Handle Partial Input Updates
  const handleUpdateInput = useCallback((updatedFields: Partial<FloodDataInput>) => {
    setActivePresetId(null);
    setIsLiveSynced(false);
    setInputData((prev) => ({ ...prev, ...updatedFields }));
  }, []);

  // Handle Preset Selection
  const handleApplyPreset = useCallback((preset: ScenarioPreset) => {
    setActivePresetId(preset.id);
    const targetLoc = LOCATIONS.find((l) => l.id === preset.targetLocationId) || LOCATIONS[0];
    setSelectedLocation(targetLoc);

    if (preset.id === 'live-telemetry') {
      loadLiveWeather(targetLoc, true);
    } else {
      setIsLiveSynced(false);
      setInputData((prev) => ({
        ...prev,
        locationId: targetLoc.id,
        dangerRiverLevel: targetLoc.defaultDangerLevel,
        warningRiverLevel: targetLoc.defaultWarningLevel,
        ...preset.data,
      }));
    }
  }, [loadLiveWeather]);

  // Simulate Single Telemetry Reading
  const handleSimulateReading = useCallback(() => {
    setIsLiveSynced(false);
    setActivePresetId(null);
    setInputData((prev) => simulateSensorReading(prev, 'random'));
    soundManager.playChime();
  }, []);

  // Sync back to live readings
  const handleSyncLiveInputs = useCallback(() => {
    setActivePresetId('live-telemetry');
    loadLiveWeather(selectedLocation, true);
    soundManager.playChime();
  }, [loadLiveWeather, selectedLocation]);

  // Live Auto-Stream Telemetry Loop (every 10 seconds syncs or simulates)
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      if (isLiveSynced) {
        loadLiveWeather(selectedLocation, true);
      } else {
        setInputData((prev) => simulateSensorReading(prev, 'random'));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isStreaming, isLiveSynced, loadLiveWeather, selectedLocation]);

  // Sound Toggle Handler
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundManager.setSoundEnabled(nextVal);
    if (nextVal) soundManager.playChime();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation & Status */}
      <Header
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
        onSimulateReading={handleSimulateReading}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'EN' ? 'NE' : 'EN')}
        riskScore={riskResult.riskScore}
        liveWeather={liveWeather}
        isLoadingLiveWeather={isLoadingLiveWeather}
        onRefreshLiveWeather={() => loadLiveWeather(selectedLocation, isLiveSynced)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Scenario Presets Bar */}
        <ScenarioPresets
          activePresetId={activePresetId}
          onApplyPreset={handleApplyPreset}
          language={language}
        />

        {/* 1. TOP AREA: Centerpiece Prominent Alert Card */}
        <AlertBannerCard
          result={riskResult}
          location={selectedLocation}
          language={language}
          onOpenBroadcast={() => setIsBroadcastOpen(true)}
          soundEnabled={soundEnabled}
        />

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden bg-slate-900 p-1 rounded border border-slate-700 text-xs overflow-x-auto font-mono">
          {[
            { id: 'OVERVIEW', label: 'ALL PANELS' },
            { id: 'INPUTS', label: 'TELEMETRY' },
            { id: 'HYDROGRAPH', label: 'HYDROGRAPH' },
            { id: 'MAP', label: 'BASIN MAP' },
            { id: 'ACTIONS', label: 'PROTOCOLS' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id as typeof mobileTab)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 rounded text-[10px] uppercase font-bold text-center transition-all cursor-pointer ${
                mobileTab === tab.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2. MIDDLE AREA: Interactive Inputs & Controls */}
        <div className={mobileTab !== 'OVERVIEW' && mobileTab !== 'INPUTS' ? 'hidden md:block' : 'block'}>
          <DataInputPanel
            input={inputData}
            location={selectedLocation}
            onChangeInput={handleUpdateInput}
            onSimulateReading={handleSimulateReading}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming(!isStreaming)}
            liveWeather={liveWeather}
            isLoadingLiveWeather={isLoadingLiveWeather}
            onRefreshLiveWeather={() => loadLiveWeather(selectedLocation, isLiveSynced)}
            onSyncLiveInputs={handleSyncLiveInputs}
            isLiveSynced={isLiveSynced}
          />
        </div>

        {/* 3. BOTTOM AREA: Charts, Basin Map & Emergency Action Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hydrograph Chart */}
          <div className={mobileTab !== 'OVERVIEW' && mobileTab !== 'HYDROGRAPH' ? 'hidden md:block' : 'block'}>
            <HydrographChart
              data={hydrographData}
              location={selectedLocation}
              currentRiverLevel={inputData.currentRiverLevel}
              dangerLevel={inputData.dangerRiverLevel || selectedLocation.defaultDangerLevel}
              warningLevel={inputData.warningRiverLevel || selectedLocation.defaultWarningLevel}
            />
          </div>

          {/* Basin Map */}
          <div className={mobileTab !== 'OVERVIEW' && mobileTab !== 'MAP' ? 'hidden md:block' : 'block'}>
            <BasinMap
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              activeRiskLevel={riskResult.riskLevel}
              activeRiskScore={riskResult.riskScore}
            />
          </div>
        </div>

        {/* 4. Action Guide & Emergency Protocols */}
        <div className={mobileTab !== 'OVERVIEW' && mobileTab !== 'ACTIONS' ? 'hidden md:block' : 'block'}>
          <EmergencyActionGuide
            result={riskResult}
            location={selectedLocation}
            language={language}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6 bg-slate-900 border-t border-slate-800 py-4 text-[10px] text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 uppercase tracking-widest">NEPAL-HYDROL EARLY WARNING SYSTEM</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">DHM & NEOC Telemetry Compliance v2.4</span>
          </div>

          <div className="flex items-center gap-3">
            <span>MODEL CALIBRATION: DHM STANDARD</span>
            <span className="text-slate-600">|</span>
            <span>EMERGENCY DISPATCH: <a href="tel:1155" className="text-cyan-400 font-bold hover:underline">1155 (TOLL FREE)</a></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WeightSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        weights={weights}
        onUpdateWeights={setWeights}
      />

      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        result={riskResult}
        location={selectedLocation}
      />
    </div>
  );
}
