import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAdminChartTheme } from './useAdminChartTheme';
import { adminTheme } from './adminTheme';
import type { ChartPoint } from '../../types/admin';

type Props = {
  title: string;
  subtitle?: string;
  data: ChartPoint[];
  type?: 'area' | 'bar';
  valueLabel?: string;
  formatValue?: (n: number) => string;
  emptyMessage?: string;
  gradientId: string;
  compactBelowLg?: boolean;
};

const CHART_MARGIN = { top: 8, right: 12, left: 4, bottom: 0 };

function formatYAxisTick(value: number, formatValue: (n: number) => string): string {
  if (!Number.isFinite(value)) return '';
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat(undefined, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return formatValue(value);
}

export default function AdminChartPanel({
  title,
  subtitle,
  data,
  type = 'area',
  valueLabel = 'Value',
  formatValue = (n) => n.toLocaleString(),
  emptyMessage = 'No data for this period',
  gradientId,
  compactBelowLg = false,
}: Props) {
  const chart = useAdminChartTheme();
  const hasData = data.some((d) => d.value > 0);

  const shellClass = compactBelowLg
    ? 'rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 bg-white p-4 max-lg:p-4 lg:p-6 shadow-sm dark:border-zinc-600/80 dark:bg-zinc-900'
    : 'rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-zinc-600/80 dark:bg-zinc-900 sm:p-6';

  const chartHeightClass = compactBelowLg
    ? 'h-[200px] max-lg:h-[200px] lg:h-[240px]'
    : 'h-[240px]';

  return (
    <div className={shellClass}>
      <h3 className={`mb-1 ${compactBelowLg ? 'text-sm max-lg:text-sm lg:text-base' : ''} ${adminTheme.cardTitle}`}>{title}</h3>
      {subtitle ? (
        <p
          className={`${compactBelowLg ? 'mb-3 max-lg:mb-3 lg:mb-4 text-[11px] max-lg:text-[11px] lg:text-xs line-clamp-2' : 'mb-4 text-xs'} ${adminTheme.muted}`}
        >
          {subtitle}
        </p>
      ) : (
        <div className={compactBelowLg ? 'mb-3 max-lg:mb-3 lg:mb-4' : 'mb-4'} />
      )}
      <div className={`${chartHeightClass} w-full min-w-0 ${compactBelowLg ? 'pl-0 max-lg:pl-0 lg:pl-2' : 'pl-1 sm:pl-2'}`}>
        {!hasData ? (
          <p
            className={`flex h-full items-center justify-center rounded-xl border border-dashed border-stone-200 text-sm dark:border-zinc-700 ${adminTheme.muted}`}
          >
            {emptyMessage}
          </p>
        ) : type === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b45e5" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5b45e5" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.tick }} axisLine={{ stroke: chart.axis }} tickLine={false} interval="preserveStartEnd" />
              <YAxis
                width={76}
                tick={{ fontSize: 11, fill: chart.tick, dx: -2 }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(v) => formatYAxisTick(Number(v), formatValue)}
              />
              <Tooltip
                contentStyle={chart.tooltip}
                labelStyle={{ fontWeight: 600, color: chart.tooltipLabel }}
                cursor={chart.areaCursor}
                formatter={(value: number | undefined) => [value != null ? formatValue(value) : '', valueLabel]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#5b45e5"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={{ fill: '#2f2184', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#5b45e5' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={CHART_MARGIN} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.tick }} axisLine={{ stroke: chart.axis }} tickLine={false} interval="preserveStartEnd" />
              <YAxis
                width={48}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: chart.tick }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(v) => formatYAxisTick(Number(v), formatValue)}
              />
              <Tooltip
                contentStyle={chart.tooltip}
                labelStyle={{ fontWeight: 600, color: chart.tooltipLabel }}
                cursor={chart.barCursor}
                formatter={(value: number | undefined) => [value != null ? String(value) : '', valueLabel]}
              />
              <Bar
                dataKey="value"
                fill={chart.barFill}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                activeBar={chart.activeBar}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
