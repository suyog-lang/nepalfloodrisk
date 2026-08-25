import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';
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
  const [mapView, setMapView] = useState<'KATHMANDU' | 'NEPAL_COUNTRY'>('KATHMANDU');

  const filteredLocations =
    mapView === 'KATHMANDU'
      ? LOCATIONS.filter((l) => l.region === 'Kathmandu Valley')
      : LOCATIONS;

  const getPinColor = (locId: string) => {
    if (locId === selectedLocation.id) {
      if (activeRiskLevel === 'SEVERE') return 'text-red-500 fill-red-500 ring-red-500';
      if (activeRiskLevel === 'HIGH') return 'text-red-500 fill-red-500 ring-red-500';
      if (activeRiskLevel === 'MODERATE') return 'text-amber-500 fill-amber-500 ring-amber-500';
      return 'text-emerald-400 fill-emerald-400 ring-emerald-400';
    }
    return 'text-cyan-400 fill-slate-900 ring-cyan-500';
  };

  return (
    <section id="basin-map-section" className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 md:p-5 shadow-xl">
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold font-mono">
              RIVER BASIN HYDRO-STATION MAP & CATCHMENT NETWORK
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Automated sensor gauges across Kathmandu Valley & major flood basins in Nepal
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-950 p-0.5 rounded border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setMapView('KATHMANDU')}
            className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
              mapView === 'KATHMANDU'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kathmandu Valley
          </button>
          <button
            type="button"
            onClick={() => setMapView('NEPAL_COUNTRY')}
            className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
              mapView === 'NEPAL_COUNTRY'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nepal Basins (Terai)
          </button>
        </div>
      </div>

      {/* Map Canvas / SVG Visualizer */}
      <div className="relative w-full aspect-[16/9] max-h-[340px] bg-slate-950 rounded overflow-hidden border border-slate-700/80 my-3 shadow-inner">
        {/* Technical grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        {/* Dynamic SVG River Network */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {mapView === 'KATHMANDU' ? (
            /* Kathmandu Valley River Network */
            <g className="opacity-75">
              {/* Valley Ring Ridge */}
              <ellipse cx="50" cy="50" rx="42" ry="38" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" />
              
              {/* Main Bagmati River Line */}
              <path
                d="M 52,10 Q 56,25 50,38 T 48,52 T 44,70 Q 40,88 35,95"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Bishnumati Confluence */}
              <path
                d="M 38,15 Q 40,28 42,44 T 48,54"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              {/* Dhobi Khola Confluence */}
              <path
                d="M 60,18 Q 58,32 53,48 T 49,60"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Hanumante River (Bhaktapur tributary) */}
              <path
                d="M 85,45 Q 74,50 62,55 T 48,58"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          ) : (
            /* Nepal Country River System */
            <g className="opacity-75">
              {/* Nepal Boundary Silhouette */}
              <path
                d="M 8,42 Q 18,30 35,32 Q 52,38 70,35 Q 88,40 92,60 Q 85,75 70,72 Q 45,74 25,68 Q 12,65 8,42 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="0.8"
              />
              {/* Karnali Basin */}
              <path d="M 16,32 Q 14,42 12,48 T 15,68" fill="none" stroke="#0284c7" strokeWidth="1.6" />
              {/* West Rapti */}
              <path d="M 24,40 Q 22,50 20,58 T 22,66" fill="none" stroke="#0ea5e9" strokeWidth="1.3" />
              {/* Narayani (Gandaki) */}
              <path d="M 42,33 Q 40,48 38,62 T 40,72" fill="none" stroke="#0284c7" strokeWidth="1.8" />
              {/* Bagmati */}
              <path d="M 52,42 Q 50,52 48,65" fill="none" stroke="#38bdf8" strokeWidth="1.3" />
              {/* Sapta Koshi */}
              <path d="M 78,35 Q 79,50 80,68 T 78,74" fill="none" stroke="#0284c7" strokeWidth="2.0" />
            </g>
          )}
        </svg>

        {/* Station Markers overlay */}
        {filteredLocations.map((loc) => {
          const isSelected = loc.id === selectedLocation.id;
          const pos =
            mapView === 'KATHMANDU'
              ? loc.svgPosition
              : loc.region === 'Kathmandu Valley'
              ? { x: 50, y: 52 }
              : loc.svgPosition;

          return (
            <div
              key={loc.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(loc);
                  soundManager.playChime();
                }}
                className={`relative group p-0.5 rounded-full transition-transform transform hover:scale-125 focus:outline-none cursor-pointer ${
                  isSelected ? 'scale-125 z-30' : 'scale-100'
                }`}
              >
                {isSelected && (
                  <span
                    className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                      activeRiskLevel === 'SEVERE' || activeRiskLevel === 'HIGH'
                        ? 'bg-red-500'
                        : activeRiskLevel === 'MODERATE'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                )}

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-slate-900 ${
                    isSelected
                      ? activeRiskLevel === 'SEVERE' || activeRiskLevel === 'HIGH'
                        ? 'bg-red-600 text-white ring-2 ring-red-400'
                        : activeRiskLevel === 'MODERATE'
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-bold'
                        : 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 font-bold'
                      : 'bg-slate-800 text-cyan-400 ring-1 ring-cyan-500/50 hover:bg-cyan-900'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                </div>

                {/* Hover / Active Badge */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-7 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-lg pointer-events-none transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-cyan-300 border border-cyan-500/80'
                      : 'bg-slate-950 text-slate-300 border border-slate-700 group-hover:block hidden'
                  }`}
                >
                  {loc.name.split(' at ')[0]}
                </div>
              </button>
            </div>
          );
        })}

        {/* Legend in corner */}
        <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md p-2 rounded border border-slate-700 text-[9px] font-mono space-y-1 z-20">
          <div className="font-bold text-slate-300 flex items-center gap-1 uppercase">
            <Layers className="w-3 h-3 text-cyan-400" />
            STATION STATUS
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Low (0-30%)
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Mod (31-60%)
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High/Severe (61-100%)
          </div>
        </div>
      </div>

      {/* Selected Location Information Card */}
      <div className="bg-slate-900/80 p-3.5 rounded border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold">
              {selectedLocation.monitoringStationCode}
            </span>
            <h4 className="text-xs font-bold text-white uppercase">
              {selectedLocation.name}
            </h4>
          </div>
          <p className="text-[10px] text-slate-400">
            CATCHMENT: <span className="text-slate-300 font-bold">{selectedLocation.catchmentAreaSqKm} KM²</span> | GAUGE: <span className="text-slate-300">{selectedLocation.stationType}</span> | DISTRICT: <span className="text-slate-300">{selectedLocation.district}</span>
          </p>
        </div>

        {/* Vulnerable settlement tags */}
        <div className="flex flex-col md:items-end gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            RIPARIAN SETTLEMENTS:
          </span>
          <div className="flex flex-wrap gap-1 md:justify-end">
            {selectedLocation.vulnerableCommunities.slice(0, 3).map((comm, idx) => (
              <span
                key={idx}
                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 font-mono"
              >
                {comm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
