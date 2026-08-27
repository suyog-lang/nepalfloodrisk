import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Clock, AlertTriangle, Droplets, CloudRain } from 'lucide-react';
import { HydrographPoint, LocationProfile } from '../types';

interface HydrographChartProps {
  data: HydrographPoint[];
  location: LocationProfile;
  currentRiverLevel: number;
  dangerLevel: number;
  warningLevel: number;
}

export const HydrographChart: React.FC<HydrographChartProps> = ({
  data,
  location,
  currentRiverLevel,
  dangerLevel,
  warningLevel,
}) => {
  // Find peak projected level in forecast
  const forecastPoints = (data || []).filter((d) => d.isForecast);
  const riverLevels = forecastPoints.map((d) => d.riverLevel).filter((v) => typeof v === 'number' && !isNaN(v));
  const maxProjected = riverLevels.length > 0 
    ? Math.max(...riverLevels, currentRiverLevel || 0)
    : (currentRiverLevel || location.normalDrySeasonLevel || 1.0);
  const willBreachDanger = maxProjected >= dangerLevel;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const point = data.find((d) => d.time === label);
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-md">
          <div className="font-bold text-white flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
            <span>Time: {label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
              point?.isForecast ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'bg-slate-800 text-slate-300'
            }`}>
              {point?.isForecast ? 'Forecast' : 'Past Recorded'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-blue-300">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" /> River Depth:
            </span>
            <span className="font-bold">{payload.find((p) => p.name === 'River Level')?.value} m</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-indigo-300">
            <span className="flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5" /> Rain Rate:
            </span>
            <span className="font-bold">{payload.find((p) => p.name === 'Rainfall')?.value} mm/h</span>
          </div>

          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>Danger Line: <strong className="text-red-400">{dangerLevel}m</strong></span>
            <span>Warning Line: <strong className="text-amber-400">{warningLevel}m</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="hydrograph-section" className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-lg space-y-3">
      {/* Hydrograph Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            24-Hour River Level Forecast Hydrograph
          </h3>
          <p className="text-xs text-slate-400">
            Past 12 hours telemetry and forward 6-12 hours projected water level for {location.name}
          </p>
        </div>

        <div>
          {willBreachDanger ? (
            <span className="px-2.5 py-1 rounded-full bg-red-950/90 border border-red-600 text-red-300 text-xs font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              Peak: {maxProjected.toFixed(2)}m (Danger Breach)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-700 text-emerald-300 text-xs font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Peak: {maxProjected.toFixed(2)}m (Within Safe Limits)
            </span>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-64 md:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="riverGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#475569' }} />
            <YAxis
              yAxisId="left"
              stroke="#38bdf8"
              fontSize={11}
              domain={[0, Math.ceil(dangerLevel * 1.25)]}
              unit="m"
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#818cf8"
              fontSize={11}
              domain={[0, 60]}
              unit="mm"
              tickLine={false}
              axisLine={false}
              hide
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={28}
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />

            {/* Warning Level Horizontal Line */}
            <ReferenceLine
              yAxisId="left"
              y={warningLevel}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `Warning: ${warningLevel}m`, fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }}
            />

            {/* Danger Level Horizontal Line */}
            <ReferenceLine
              yAxisId="left"
              y={dangerLevel}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ value: `Danger: ${dangerLevel}m`, fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
            />

            {/* Bars: Rain Forecast */}
            <Bar
              yAxisId="right"
              dataKey="rainfallMm"
              name="Rainfall"
              fill="url(#rainGradient)"
              barSize={8}
              radius={[3, 3, 0, 0]}
            />

            {/* Area & Line: Water Level */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="riverLevel"
              name="River Level"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#riverGradient)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
