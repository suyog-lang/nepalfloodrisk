import React from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Info } from 'lucide-react';
import { RiskCalculationWeights } from '../types';
import { DEFAULT_WEIGHTS } from '../data/locations';

interface WeightSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: RiskCalculationWeights;
  onUpdateWeights: (newWeights: RiskCalculationWeights) => void;
}

export const WeightSettingsModal: React.FC<WeightSettingsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onUpdateWeights,
}) => {
  if (!isOpen) return null;

  const applyPreset = (preset: 'DEFAULT' | 'FLASH_FLOOD' | 'RIVER_LEVEL_DOMINANT') => {
    switch (preset) {
      case 'FLASH_FLOOD':
        onUpdateWeights({
          rainfallIntensity: 0.35,
          forecastedRainfall: 0.15,
          riverLevelDangerRatio: 0.20,
          rateOfRise: 0.30,
          soilSaturationBonus: 0.08,
        });
        break;
      case 'RIVER_LEVEL_DOMINANT':
        onUpdateWeights({
          rainfallIntensity: 0.15,
          forecastedRainfall: 0.15,
          riverLevelDangerRatio: 0.45,
          rateOfRise: 0.25,
          soilSaturationBonus: 0.05,
        });
        break;
      case 'DEFAULT':
      default:
        onUpdateWeights(DEFAULT_WEIGHTS);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-200">
              HYDROLOGICAL MODEL WEIGHT CONFIGURATION (M1-NEPALHYDROL)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-start gap-2 text-xs text-slate-300 font-mono">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400">
              Tune mathematical weights assigned to hydrological telemetry factors. Total base weights automatically normalize to 100%.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              WEIGHT CALIBRATION PRESETS:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => applyPreset('DEFAULT')}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-[10px] uppercase font-bold text-center cursor-pointer transition-colors"
              >
                Standard DHM (25/20/30/25)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('FLASH_FLOOD')}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-[10px] uppercase font-bold text-center cursor-pointer transition-colors"
              >
                Flash Flood Focused
              </button>
              <button
                type="button"
                onClick={() => applyPreset('RIVER_LEVEL_DOMINANT')}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-[10px] uppercase font-bold text-center cursor-pointer transition-colors"
              >
                River Basin Heavy (45%)
              </button>
            </div>
          </div>

          {/* Sliders for each factor */}
          <div className="space-y-3 pt-2">
            {/* 1. Rainfall Intensity */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 text-[11px] uppercase">1. RAINFALL INTENSITY:</span>
                <span className="font-bold text-cyan-300">
                  {Math.round(weights.rainfallIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.rainfallIntensity}
                onChange={(e) =>
                  onUpdateWeights({ ...weights, rainfallIntensity: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* 2. Forecasted Rainfall */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 text-[11px] uppercase">2. NWP RAINFALL FORECAST:</span>
                <span className="font-bold text-indigo-300">
                  {Math.round(weights.forecastedRainfall * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.forecastedRainfall}
                onChange={(e) =>
                  onUpdateWeights({ ...weights, forecastedRainfall: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* 3. River Level Danger Ratio */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 text-[11px] uppercase">3. RIVER GAUGE VS DANGER RATIO:</span>
                <span className="font-bold text-blue-300">
                  {Math.round(weights.riverLevelDangerRatio * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={weights.riverLevelDangerRatio}
                onChange={(e) =>
                  onUpdateWeights({ ...weights, riverLevelDangerRatio: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* 4. Rate of River Level Rise */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 text-[11px] uppercase">4. RATE OF RISE (CM/HR):</span>
                <span className="font-bold text-amber-300">
                  {Math.round(weights.rateOfRise * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.rateOfRise}
                onChange={(e) =>
                  onUpdateWeights({ ...weights, rateOfRise: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* 5. Soil Saturation Bonus Modifier */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 text-[11px] uppercase">SOIL WETNESS SURCHARGE:</span>
                <span className="font-bold text-emerald-300">
                  +{Math.round(weights.soilSaturationBonus * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.15"
                step="0.01"
                value={weights.soilSaturationBonus}
                onChange={(e) =>
                  onUpdateWeights({ ...weights, soilSaturationBonus: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-700 flex items-center justify-between font-mono">
          <button
            type="button"
            onClick={() => applyPreset('DEFAULT')}
            className="px-3 py-1.5 rounded text-[10px] uppercase font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET DEFAULTS
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded text-[10px] uppercase font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            CONFIRM WEIGHTS
          </button>
        </div>
      </div>
    </div>
  );
};
