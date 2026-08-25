import React from 'react';
import { CloudLightning, AlertTriangle, CloudRain, Waves, SunMedium, Zap, Activity } from 'lucide-react';
import { ScenarioPreset } from '../types';
import { SCENARIO_PRESETS } from '../data/locations';
import { soundManager } from '../utils/audioAlert';

interface ScenarioPresetsProps {
  activePresetId: string | null;
  onApplyPreset: (preset: ScenarioPreset) => void;
  language: 'EN' | 'NE';
}

export const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({
  activePresetId,
  onApplyPreset,
  language,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />;
      case 'CloudLightning':
        return <CloudLightning className="w-4 h-4 text-purple-400" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'CloudRain':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'Waves':
        return <Waves className="w-4 h-4 text-blue-400" />;
      case 'SunMedium':
      default:
        return <SunMedium className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div id="scenario-presets-bar" className="w-full">
      <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">
            HYDROLOGICAL SCENARIO SIMULATIONS
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline uppercase">
          MODEL: M1-NEPALHYDROL • SELECT REAL-TIME LIVE OR SIMULATION SCENARIOS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SCENARIO_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onApplyPreset(preset);
                soundManager.playChime();
              }}
              className={`p-2.5 rounded border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/60'
                  : 'bg-slate-900/80 hover:bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="p-1 rounded bg-slate-950 border border-slate-700">
                  {getIcon(preset.iconName)}
                </span>
                {isActive ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    SIM
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {language === 'NE' ? preset.nameNepali : preset.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight font-sans">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
