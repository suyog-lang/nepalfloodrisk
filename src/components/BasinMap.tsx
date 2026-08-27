import React, { useState } from 'react';
import { MapPin, Compass, ShieldCheck, AlertTriangle, Flame, Layers } from 'lucide-react';
import { LocationProfile, FloodRiskLevel } from '../types';
import { LOCATIONS } from '../data/locations';
import { soundManager } from '../utils/audioAlert';

interface BasinMapProps {
  selectedLocation: LocationProfile;
  onSelectLocation: (loc: LocationProfile) => void;
  activeRiskLevel: FloodRiskLevel;
  activeRiskScore: number;
}

export const BasinMap: React.FC<BasinMapProps> = ({
  selectedLocation,
  onSelectLocation,
  activeRiskLevel,
  activeRiskScore,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  const filteredLocations =
    selectedRegion === 'ALL'
      ? LOCATIONS
      : selectedRegion === 'Kathmandu Valley'
      ? LOCATIONS.filter((l) => l.region === 'Kathmandu Valley')
      : selectedRegion === 'Koshi Basin'
      ? LOCATIONS.filter((l) => l.region === 'Koshi Basin')
      : selectedRegion === 'Gandaki Basin'
      ? LOCATIONS.filter((l) => l.region === 'Gandaki Basin')
      : selectedRegion === 'Karnali Basin'
      ? LOCATIONS.filter((l) => l.region === 'Karnali Basin' || l.region === 'Mahakali Basin')
      : LOCATIONS.filter((l) => l.region === 'Terai Basin');

  const regionTabs = [
    { id: 'ALL', label: 'All Nepal' },
    { id: 'Kathmandu Valley', label: 'Kathmandu' },
    { id: 'Koshi Basin', label: 'Koshi (East)' },
    { id: 'Gandaki Basin', label: 'Gandaki (Central)' },
    { id: 'Karnali Basin', label: 'Karnali & West' },
    { id: 'Terai Basin', label: 'Terai Basins' },
  ];

  return (
    <section id="basin-map-section" className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-lg space-y-3">
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            Nepal River Hydrological Network Map
          </h3>
          <p className="text-xs text-slate-400">
            Click any river gauge point across Nepal to view live telemetry
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {regionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRegion(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedRegion === tab.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Nepal Map Canvas */}
      <div className="relative w-full aspect-[16/9] max-h-[340px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
        {/* Technical grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Nepal River Map SVG */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Nepal Geography Outline */}
          <path
            d="M 5,42 Q 15,30 35,32 Q 52,38 72,35 Q 90,40 95,62 Q 88,75 72,72 Q 45,74 25,68 Q 10,65 5,42 Z"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="0.8"
          />

          {/* Major River Lines */}
          {/* Karnali & Mahakali Rivers */}
          <path d="M 6,36 Q 10,42 6,55" fill="none" stroke="#0ea5e9" strokeWidth="1.2" strokeOpacity="0.7" />
          <path d="M 16,32 Q 14,44 15,48 T 16,66" fill="none" stroke="#0284c7" strokeWidth="1.6" strokeOpacity="0.8" />
          <path d="M 22,35 Q 20,45 22,55" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.7" />

          {/* Gandaki & Narayani Rivers */}
          <path d="M 38,36 Q 36,46 38,54 T 44,62" fill="none" stroke="#0284c7" strokeWidth="1.6" strokeOpacity="0.8" />
          <path d="M 46,38 Q 45,46 44,62 T 48,72" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Bagmati Valley System */}
          <ellipse cx="50" cy="52" rx="6" ry="5" fill="none" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="1,1" />
          <path d="M 50,45 Q 49,52 48,58 T 54,72" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeOpacity="0.8" />

          {/* Koshi River System */}
          <path d="M 72,36 Q 74,48 76,58 T 78,65" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeOpacity="0.8" />
          <path d="M 82,42 Q 80,52 78,65" fill="none" stroke="#0ea5e9" strokeWidth="1.3" strokeOpacity="0.7" />
          <path d="M 88,48 Q 88,60 88,70" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.7" />
        </svg>

        {/* Interactive Clickable River Station Markers */}
        {filteredLocations.map((loc) => {
          const isSelected = loc.id === selectedLocation.id;
          const pinColor = isSelected
            ? activeRiskLevel === 'SEVERE' || activeRiskLevel === 'HIGH'
              ? 'bg-red-500 text-white ring-4 ring-red-500/40 animate-bounce'
              : activeRiskLevel === 'MODERATE'
              ? 'bg-amber-500 text-white ring-4 ring-amber-500/40'
              : 'bg-emerald-500 text-white ring-4 ring-emerald-500/40'
            : 'bg-slate-800 text-cyan-300 border border-slate-600 hover:bg-cyan-600 hover:text-white';

          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => {
                onSelectLocation(loc);
                soundManager.playChime();
              }}
              style={{
                left: `${loc.svgPosition.x}%`,
                top: `${loc.svgPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute p-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-lg group z-10 ${pinColor}`}
              title={`${loc.name} (${loc.district})`}
            >
              <MapPin className="w-3.5 h-3.5" />

              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] rounded border border-slate-700 whitespace-nowrap shadow-xl z-30 pointer-events-none">
                <p className="font-bold text-cyan-300">{loc.name}</p>
                <p className="text-slate-400">{loc.district} • Danger: {loc.defaultDangerLevel}m</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected River Station Quick Information Card */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Active Station Profile:</span>
          <span className="font-bold text-white text-sm">{selectedLocation.name}</span>
          <span className="text-slate-400 ml-2">({selectedLocation.nameNepali})</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px]">Warning Mark:</span>
            <span className="font-bold text-amber-400">{selectedLocation.defaultWarningLevel} m</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Danger Mark:</span>
            <span className="font-bold text-red-400">{selectedLocation.defaultDangerLevel} m</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Station Code:</span>
            <span className="font-mono text-cyan-300">{selectedLocation.monitoringStationCode}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
