import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
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
  const forecastPoints = data.filter((d) => d.isForecast);
  const maxProjected = Math.max(...forecastPoints.map((d) => d.riverLevel), currentRiverLevel);
  const willBreachDanger = maxProjected >= dangerLevel;

  // Custom tooltip with technical styling
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const point = data.find((d) => d.time === label);
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-md">
          <div className="font-bold text-white flex items-center justify-between gap-4 border-b border-slate-800 pb-1 text-[11px]">
            <span>T: {label}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono ${
              point?.isForecast ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'bg-slate-800 text-slate-300'
            }`}>
              {point?.isForecast ? 'NWP FORECAST' : 'TELEMETRY'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-cyan-300 text-[11px]">
            <span className="flex items-center gap-1">
              <CloudRain className="w-3 h-3" /> RAIN INTENSITY:
            </span>
            <span className="font-mono font-bold">{payload.find((p) => p.name === 'Rainfall')?.value} mm/h</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-blue-300 text-[11px]">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" /> RIVER LEVEL:
            </span>
            <span className="font-mono font-bold text-xs">
              {payload.find((p) => p.name === 'River Level')?.value} m
            </span>
          </div>

          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>WARNING THRESHOLD:</span>
              <span className="text-amber-400 font-mono">{warningLevel} m</span>
            </div>
            <div className="flex justify-between">
              <span>DANGER THRESHOLD:</span>
              <span className="text-red-400 font-mono font-bold">{dangerLevel} m</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="hydrograph-section" className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 md:p-5 shadow-xl">
      {/* Hydrograph Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold font-mono">
              HYDROGRAPH & STAGE-DISCHARGE PROJECTION (6H - 24H)
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            12-Hour Sensor History + 6-Hour Forward Forecast • {location.riverName.toUpperCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {willBreachDanger ? (
            <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-700 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              PEAK: {maxProjected.toFixed(2)}m (DANGER BREACH)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              PEAK: {maxProjected.toFixed(2)}m (SAFE MARGIN)
            </span>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 md:h-80 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="riverGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />

            {/* X-Axis */}
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            />

            {/* Left Y-Axis: River Water Level (meters) */}
            <YAxis
              yAxisId="left"
              domain={[0, Math.ceil(Math.max(dangerLevel * 1.25, maxProjected + 0.5))]}
              stroke="#38bdf8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#0284c7' }}
              tickFormatter={(v) => `${v}m`}
            />

            {/* Right Y-Axis: Rainfall Intensity (mm/hr) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 80]}
              stroke="#818cf8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#6366f1' }}
              tickFormatter={(v) => `${v}mm`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={32}
              wrapperStyle={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}
            />

            {/* Danger Reference Line */}
            <ReferenceLine
              yAxisId="left"
              y={dangerLevel}
              label={{
                value: `Danger: ${dangerLevel}m`,
                fill: '#ef4444',
                fontSize: 9,
                position: 'insideTopRight',
              }}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Warning Reference Line */}
            <ReferenceLine
              yAxisId="left"
              y={warningLevel}
              label={{
                value: `Warning: ${warningLevel}m`,
                fill: '#f59e0b',
                fontSize: 9,
                position: 'insideTopRight',
              }}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />

            {/* Rainfall Bar */}
            <Bar
              yAxisId="right"
              dataKey="rainfall"
              name="Rainfall (mm/h)"
              fill="url(#rainGradient)"
              barSize={12}
              radius={[2, 2, 0, 0]}
            />

            {/* River Level Filled Area & Line */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="riverLevel"
              name="River Level (m)"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="url(#riverGradient)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500 inline-block border-t border-dashed" />
            <span className="text-red-400 font-bold">DANGER THRESHOLD: {dangerLevel}m</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dashed" />
            <span className="text-amber-400 font-bold">WARNING THRESHOLD: {warningLevel}m</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-500 uppercase">
          Source: DHM Automated Hydrometric Telemetry • Refresh: 10s
        </div>
      </div>
    </section>
  );
};
