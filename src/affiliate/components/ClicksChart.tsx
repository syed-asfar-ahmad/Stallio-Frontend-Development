// ============================================================================
// Stallio Affiliate Time-Series Clicks Chart (ClicksChart.tsx)
// Visualizes link clicks, unique visitors, and conversion velocity over time
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { MousePointerClick, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { AffiliateDailyStat } from '../types';

interface ClicksChartProps {
  series: AffiliateDailyStat[];
  className?: string;
}

export default function ClicksChart({ series, className = '' }: ClicksChartProps) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const [mode, setMode] = useState<'daily' | 'cumulative'>('daily');

  const chartData = useMemo(() => {
    if (mode === 'daily') {
      return series;
    }

    let cumClicks = 0;
    let cumUnique = 0;
    let cumSignups = 0;

    return series.map((s) => {
      cumClicks += s.clicks;
      cumUnique += s.uniqueClicks;
      cumSignups += s.signups;
      return {
        ...s,
        clicks: cumClicks,
        uniqueClicks: cumUnique,
        signups: cumSignups,
      };
    });
  }, [series, mode]);

  const chartTooltipStyle = useMemo(
    () => ({
      borderRadius: '0.75rem',
      border: isDark ? '1px solid #3f3f46' : '1px solid #e7e5e4',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
      fontSize: '0.75rem',
      color: isDark ? '#fafafa' : '#1c1917',
    }),
    [isDark]
  );

  const chartGridStroke = isDark ? '#3f3f46' : '#e7e5e4';
  const chartTickFill = isDark ? '#a1a1aa' : '#78716c';
  const chartAxisLine = isDark ? '#52525b' : '#e7e5e4';

  return (
    <div
      className={`rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-brand-600" />
            <span>Referral Engagement & Traffic Timeline</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Compare total traffic against unique visitor engagement
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="inline-flex rounded-xl p-1 bg-stone-100 dark:bg-zinc-800 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('daily')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'daily'
                ? 'bg-white text-brand-700 shadow-xs dark:bg-zinc-700 dark:text-brand-300'
                : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Daily Velocity
          </button>
          <button
            type="button"
            onClick={() => setMode('cumulative')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'cumulative'
                ? 'bg-white text-brand-700 shadow-xs dark:bg-zinc-700 dark:text-brand-300'
                : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Cumulative Growth
          </button>
        </div>
      </div>

      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="affiliateTrafficFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b45e5" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#5b45e5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: chartTickFill }}
              axisLine={{ stroke: chartAxisLine }}
              tickLine={false}
              interval="preserveStartEnd"
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: chartTickFill }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              cursor={{ stroke: chartGridStroke, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              name="Total Clicks"
              stroke="#5b45e5"
              strokeWidth={2}
              fill="url(#affiliateTrafficFill)"
              dot={{ fill: '#2f2184', strokeWidth: 0, r: 2.5 }}
              activeDot={{ r: 5, fill: '#5b45e5' }}
            />
            <Area
              type="monotone"
              dataKey="uniqueClicks"
              name="Unique Visitors"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="transparent"
              dot={{ fill: '#6d28d9', strokeWidth: 0, r: 2 }}
              activeDot={{ r: 4, fill: '#8b5cf6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
