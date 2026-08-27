import React from 'react';
import { CloudLightning, CloudRain, SunMedium, Activity, Sparkles } from 'lucide-react';
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
        return <CloudLightning className="w-4 h-4 text-red-400" />;
      case 'CloudRain':
        return <CloudRain className="w-4 h-4 text-amber-400" />;
      case 'SunMedium':
        return <SunMedium className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div id="quick-scenarios-bar" className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          {language === 'NE' ? 'मौसम र बाढी स्थिति छान्नुहोस्' : 'Select Weather & Flood Mode'}:
        </span>
        <span className="text-[11px] text-slate-400">
          {language === 'NE' ? 'प्रत्यक्ष मौसम हेर्नुहोस् वा बाढी परीक्षण गर्नुहोस्' : 'View live weather or test flood scenarios'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              className={`p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer flex flex-col gap-1 ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-400/40 text-white'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 hover:border-slate-500 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(preset.iconName)}
                  <span className="text-xs font-bold truncate">
                    {language === 'NE' ? preset.nameNepali : preset.name}
                  </span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
