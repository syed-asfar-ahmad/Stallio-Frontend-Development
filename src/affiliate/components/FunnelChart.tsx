// ============================================================================
// Stallio Affiliate Conversion Funnel Chart (FunnelChart.tsx)
// Visualizes step-by-step conversion from clicks to paid subscriptions
// ============================================================================

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Sparkles, ArrowDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { AffiliateStatsSummary } from '../types';

interface FunnelChartProps {
  summary: AffiliateStatsSummary;
  className?: string;
}

export default function FunnelChart({ summary, className = '' }: FunnelChartProps) {
  const { t } = useTranslation();
  const tx = (key: string) => t(`affiliate.${key}`);
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  const funnelData = useMemo(() => {
    const rawClicks = Math.max(summary.clicks, 1);
    const uniqueClicks = summary.uniqueClicks;
    const signups = summary.signups;
    const verified = summary.verified;
    const trials = summary.trials;
    const paid = summary.paid;

    return [
      {
        stage: tx('totalClicks'),
        value: summary.clicks,
        percentOfTop: 100,
        color: '#5b45e5', // Brand primary
      },
      {
        stage: tx('uniqueVisitors'),
        value: uniqueClicks,
        percentOfTop: Math.round((uniqueClicks / rawClicks) * 100),
        color: '#6d28d9',
      },
      {
        stage: tx('sellerSignups'),
        value: signups,
        percentOfTop: Math.round((signups / rawClicks) * 100),
        color: '#7c3aed',
      },
      {
        stage: tx('emailVerified'),
        value: verified,
        percentOfTop: Math.round((verified / rawClicks) * 100),
        color: '#8b5cf6',
      },
      {
        stage: tx('freeTrials'),
        value: trials,
        percentOfTop: Math.round((trials / rawClicks) * 100),
        color: '#a78bfa',
      },
      {
        stage: tx('paidPlansCommission'),
        value: paid,
        percentOfTop: Math.round((paid / rawClicks) * 100),
        color: '#10b981', // Emerald conversion
      },
    ];
  }, [summary, t]);

  const overallConversion = summary.clicks > 0
    ? ((summary.paid / summary.clicks) * 100).toFixed(1)
    : '0.0';

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

  return (
    <div
      className={`rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>{tx('conversionFunnel')}</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            {tx('funnelDescription')}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-bold dark:bg-brand-950/50 dark:border-brand-800/60 dark:text-brand-300">
          <span>{tx('overallConversion')}</span>
          <span className="text-sm text-brand-600 dark:text-brand-400">{overallConversion}%</span>
        </div>
      </div>

      {/* Horizontal Bar Visualizer */}
      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={funnelData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="stage"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fontWeight: 600,
                fill: isDark ? '#a1a1aa' : '#57534e',
              }}
              width={105}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(val: number | undefined, name: string | undefined, item: { payload?: { percentOfTop?: number } }) => [
                `${val ?? 0} (${item?.payload?.percentOfTop ?? 0}% of traffic)`,
                'Count',
              ]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Step Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-4 border-t border-stone-100 dark:border-zinc-800 text-center">
        {funnelData.map((item) => (
          <div
            key={item.stage}
            className="p-2.5 rounded-xl bg-stone-50/60 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-700/60"
          >
            <p className="text-[10px] font-semibold text-stone-500 dark:text-zinc-400 uppercase truncate">
              {item.stage}
            </p>
            <p className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-zinc-100">
              {item.value}
            </p>
            <p className="text-[10px] font-medium text-brand-600 dark:text-brand-400">
              {item.percentOfTop}% top
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
