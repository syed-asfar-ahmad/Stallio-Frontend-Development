import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { DayPicker, type DateRange } from 'react-day-picker';
import {
  format,
  isValid,
  parse,
  startOfDay,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
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
import 'react-day-picker/style.css';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../lib/countryCurrencyOptions';
import DashboardLayout from '../components/DashboardLayout';
import FieldHelpButton from '../components/FieldHelpButton';
import DashboardLoading from '../components/DashboardLoading';
import { DayPickerThemedDropdown } from '../components/DayPickerThemedDropdown';
import {
  dayPickerAdminClassName,
  dayPickerAdminClassNames,
  dayPickerAdminFormatters,
  dayPickerCalendarShellClass,
  getDayPickerCssVars,
} from '../components/dayPickerAdminConfig';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowRight,
  DollarSign,
  FileText,
  Sparkles,
  Filter,
  ChevronDown,
  Inbox,
  Settings,
  Copy,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import type { Product } from '../types';
import type { Order } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const ANALYTICS_EPOCH = new Date(2025, 0, 1);
const ANALYTICS_EPOCH_YMD = '2025-01-01';

type ContactSubmission = {
  id: string;
  customerName: string;
  customerEmail: string;
  message: string;
  responded?: boolean;
  createdAt: string;
};

function getStartOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function ymdToDate(s: string): Date | undefined {
  if (!s) return undefined;
  const d = parse(s, 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : undefined;
}

function toYmd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export type RangeKey = 'today' | '3d' | '7d' | '1m' | '1y' | 'all' | 'custom';

function getRangeBounds(
  range: RangeKey,
  customFrom?: string,
  customTo?: string
): { start: number; end: number } {
  const now = new Date();
  const end = now.getTime();
  let start = 0;

  if (range === 'custom' && customFrom && customTo) {
    let from = new Date(customFrom);
    const to = new Date(customTo);
    if (from < ANALYTICS_EPOCH) {
      from = new Date(ANALYTICS_EPOCH);
    }
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    if (from.getTime() > to.getTime()) {
      to.setTime(from.getTime());
      to.setHours(23, 59, 59, 999);
    }
    return { start: from.getTime(), end: to.getTime() };
  }

  switch (range) {
    case 'today':
      start = getStartOfDay(now);
      break;
    case '3d':
      start = end - 3 * DAY_MS;
      break;
    case '7d':
      start = end - 7 * DAY_MS;
      break;
    case '1m':
      start = end - 30 * DAY_MS;
      break;
    case '1y':
      start = end - 365 * DAY_MS;
      break;
    case 'all':
      start = getStartOfDay(ANALYTICS_EPOCH);
      break;
    default:
      start = end - 7 * DAY_MS;
  }
  return { start, end };
}

type OverviewChartRow = { label: string; orders: number; revenue: number };

function orderCountsAsPaid(o: Order) {
  return o.pendingPayment !== true;
}

function buildOverviewChartRows(ordersInRange: Order[], rangeStart: number, rangeEnd: number): OverviewChartRow[] {
  const spanDays = Math.max(1, Math.ceil((rangeEnd - rangeStart) / DAY_MS));
  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);
  let d0 = startOfDay(start);
  let d1 = startOfDay(end);
  if (d0 > d1) {
    [d0, d1] = [d1, d0];
  }

  if (spanDays <= 31) {
    const days = eachDayOfInterval({ start: d0, end: d1 });
    const byKey = new Map<string, { orders: number; revenue: number }>();
    for (const d of days) {
      byKey.set(format(d, 'yyyy-MM-dd'), { orders: 0, revenue: 0 });
    }
    for (const o of ordersInRange) {
      const k = format(new Date(o.createdAt), 'yyyy-MM-dd');
      const b = byKey.get(k);
      if (!b) continue;
      b.orders += 1;
      if (orderCountsAsPaid(o)) b.revenue += o.totalAmount;
    }
    return days.map((d) => {
      const k = format(d, 'yyyy-MM-dd');
      const v = byKey.get(k)!;
      return {
        label: spanDays > 10 ? format(d, 'MMM d') : format(d, 'EEE M/d'),
        orders: v.orders,
        revenue: v.revenue,
      };
    });
  }

  if (spanDays <= 180) {
    const weekStartsOn = 1 as const;
    const rangeWeekStart = startOfWeek(d0, { weekStartsOn });
    const weeks = eachWeekOfInterval({ start: rangeWeekStart, end: d1 }, { weekStartsOn });
    const byKey = new Map<string, { orders: number; revenue: number }>();
    for (const w of weeks) {
      byKey.set(format(w, 'yyyy-MM-dd'), { orders: 0, revenue: 0 });
    }
    for (const o of ordersInRange) {
      const ws = startOfWeek(new Date(o.createdAt), { weekStartsOn });
      const k = format(ws, 'yyyy-MM-dd');
      const b = byKey.get(k);
      if (!b) continue;
      b.orders += 1;
      if (orderCountsAsPaid(o)) b.revenue += o.totalAmount;
    }
    return weeks.map((w) => {
      const k = format(w, 'yyyy-MM-dd');
      const v = byKey.get(k)!;
      return {
        label: format(w, 'MMM d'),
        orders: v.orders,
        revenue: v.revenue,
      };
    });
  }

  const months = eachMonthOfInterval({ start: startOfMonth(d0), end: d1 });
  const byKey = new Map<string, { orders: number; revenue: number }>();
  for (const m of months) {
    byKey.set(format(m, 'yyyy-MM'), { orders: 0, revenue: 0 });
  }
  for (const o of ordersInRange) {
    const od = new Date(o.createdAt);
    const k = format(od, 'yyyy-MM');
    const b = byKey.get(k);
    if (!b) continue;
    b.orders += 1;
    if (orderCountsAsPaid(o)) b.revenue += o.totalAmount;
  }
  return months.map((m) => {
    const k = format(m, 'yyyy-MM');
    const v = byKey.get(k)!;
    return {
      label: format(m, 'MMM yyyy'),
      orders: v.orders,
      revenue: v.revenue,
    };
  });
}

function formatAxisMoney(value: number, currency?: string | null) {
  if (!Number.isFinite(value)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      notation: 'compact',
      maximumFractionDigits: 1,
      style: 'currency',
      currency: currency || 'USD',
    }).format(value);
  } catch {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));
  }
}

export default function DashboardOverview() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [compactCharts, setCompactCharts] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setCompactCharts(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const locale =
    i18n.language?.split('-')[0] === 'es' ? 'es' : i18n.language?.split('-')[0] === 'ar' ? 'ar' : 'en-US';

  function getRangeLabel(range: RangeKey, cf?: string, ct?: string): string {
    if (range === 'custom' && cf && ct) {
      const f = new Date(cf).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
      const te = new Date(ct).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${f} - ${te}`;
    }
    const keys: Record<RangeKey, string> = {
      today: t('dashboard.overview.rangeToday'),
      '3d': t('dashboard.overview.range3d'),
      '7d': t('dashboard.overview.range7d'),
      '1m': t('dashboard.overview.range1m'),
      '1y': t('dashboard.overview.range1y'),
      all: t('dashboard.overview.rangeAll'),
      custom: t('dashboard.overview.rangeCustom'),
    };
    return keys[range];
  }

  const rangeOptions = useMemo(
    (): { value: RangeKey; label: string }[] => [
      { value: 'today', label: t('dashboard.overview.rangeToday') },
      { value: '3d', label: t('dashboard.overview.range3d') },
      { value: '7d', label: t('dashboard.overview.range7d') },
      { value: '1m', label: t('dashboard.overview.range1m') },
      { value: '1y', label: t('dashboard.overview.range1y') },
      { value: 'all', label: t('dashboard.overview.rangeAll') },
      { value: 'custom', label: t('dashboard.overview.rangeCustomDates') },
    ],
    [t, i18n.language]
  );

  const customCalendarRange = useMemo((): DateRange | undefined => {
    const from = ymdToDate(customFrom);
    const to = ymdToDate(customTo);
    if (!from && !to) return undefined;
    return { from, to };
  }, [customFrom, customTo]);

  const customCalendarDefaultMonth = useMemo(() => {
    const from = ymdToDate(customFrom);
    const to = ymdToDate(customTo);
    const candidate = from ?? to ?? new Date();
    return candidate < ANALYTICS_EPOCH ? ANALYTICS_EPOCH : candidate;
  }, [customFrom, customTo]);

  useEffect(() => {
    Promise.all([
      api<Product[]>('/api/products').then((data) => (Array.isArray(data) ? data : [])).catch(() => []),
      api<Order[]>('/api/orders').then((data) => (Array.isArray(data) ? data : [])).catch(() => []),
      api<ContactSubmission[]>('/api/contact-submissions').then((data) => (Array.isArray(data) ? data : [])).catch(() => []),
    ]).then(([p, o, s]) => {
      setProducts(p);
      setOrders(o);
      setSubmissions(s);
    }).finally(() => setLoading(false));
  }, []);

  const { start: rangeStart, end: rangeEnd } = getRangeBounds(range, customFrom, customTo);
  const filteredOrders = orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= rangeStart && t <= rangeEnd;
  });
  const countsTowardRevenue = (o: Order) => o.pendingPayment !== true;
  const paidOrdersInRange = filteredOrders.filter(countsTowardRevenue);
  const filteredRevenue = paidOrdersInRange.reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrdersInRange = filteredOrders.filter((o) => o.pendingPayment === true);
  const pendingRevenueInRange = pendingOrdersInRange.reduce((s, o) => s + o.totalAmount, 0);
  const pendingMessages = submissions.filter((s) => !s.responded).length;

  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [orders, rangeStart, rangeEnd]);

  const overviewChartRows = useMemo(
    () => buildOverviewChartRows(filteredOrders, rangeStart, rangeEnd),
    [filteredOrders, rangeStart, rangeEnd]
  );

  const chartHasActivity = useMemo(
    () => overviewChartRows.some((r) => r.orders > 0 || r.revenue > 0),
    [overviewChartRows]
  );

  const chartTooltipStyle = useMemo(
    () =>
      ({
        borderRadius: 12,
        border: isDark ? '1px solid #3f3f46' : '1px solid #e7e5e4',
        boxShadow: isDark ? '0 10px 15px -3px rgb(0 0 0 / 0.45)' : '0 10px 15px -3px rgb(0 0 0 / 0.08)',
        background: isDark ? '#18181b' : '#fff',
        color: isDark ? '#fafafa' : '#1c1917',
      }) as const,
    [isDark],
  );

  const chartGridStroke = isDark ? '#3f3f46' : '#e7e5e4';
  const chartTickFill = isDark ? '#a1a1aa' : '#78716c';
  const chartAxisLine = isDark ? '#52525b' : '#e7e5e4';
  const chartTooltipLabelColor = isDark ? '#fafafa' : '#44403c';
  const chartAxisFontSize = compactCharts ? 10 : 11;
  const chartMargin = compactCharts
    ? ({ top: 8, right: 6, left: 0, bottom: 0 } as const)
    : ({ top: 8, right: 12, left: 4, bottom: 0 } as const);
  const revenueYAxisWidth = compactCharts ? 52 : 76;
  const ordersYAxisWidth = compactCharts ? 28 : 36;

  const dayPickerCssVars = useMemo(() => getDayPickerCssVars(isDark), [isDark]);

  const base = import.meta.env.VITE_BASE_URL || window.location.origin;
  const shopUrl = user ? `${base}/${user.username}` : '';
  const currency = user?.currency;

  function applyCustomRange() {
    if (!customFrom || !customTo) return;
    let fromYmd = customFrom < ANALYTICS_EPOCH_YMD ? ANALYTICS_EPOCH_YMD : customFrom;
    if (fromYmd > customTo) return;
    if (fromYmd !== customFrom) setCustomFrom(fromYmd);
    setRange('custom');
    setShowRangeDropdown(false);
    setShowCustomDates(false);
  }

  async function copyShopUrl() {
    if (!shopUrl) return;
    try {
      await navigator.clipboard.writeText(shopUrl);
      toast.success(t('dashboard.overview.toastCopied'));
    } catch {
      toast.error(t('dashboard.overview.toastCopyFailed'));
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-lg:gap-3 lg:gap-4 mb-5 max-lg:mb-5 lg:mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 mb-0.5 max-lg:mb-0.5 lg:mb-1">
            <Sparkles className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
            <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">{t('dashboard.overview.badge')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
            {t('dashboard.overview.welcomePrefix')}{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent break-words">
              {user?.shopName || t('dashboard.overview.sellerFallback')}
            </span>
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">{t('dashboard.overview.subtitle')}</p>
        </div>

        <div className="relative w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => { setShowRangeDropdown(!showRangeDropdown); setShowCustomDates(false); }}
            className="inline-flex w-full sm:w-auto max-lg:justify-center items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 px-3 max-lg:px-3 lg:px-4 py-2 max-lg:py-2 lg:py-2.5 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 text-sm max-lg:text-sm lg:text-base font-medium hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors shadow-sm min-w-0"
          >
            <Filter className="w-3.5 h-3.5 max-lg:w-3.5 max-lg:h-3.5 lg:w-4 lg:h-4 text-brand-500 shrink-0" />
            <span className="truncate min-w-0">{getRangeLabel(range, customFrom, customTo)}</span>
            <ChevronDown className={`w-3.5 h-3.5 max-lg:w-3.5 max-lg:h-3.5 lg:w-4 lg:h-4 shrink-0 transition-transform ${showRangeDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showRangeDropdown && (
            <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-56 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-20 py-1">
              {rangeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (opt.value === 'custom') {
                      setShowRangeDropdown(false);
                      setShowCustomDates(true);
                    } else {
                      setRange(opt.value);
                      setShowRangeDropdown(false);
                    }
                  }}
                  className={`w-full text-left px-3 max-lg:px-3 lg:px-4 py-2 max-lg:py-2 lg:py-2.5 text-sm max-lg:text-sm lg:text-sm font-medium transition-colors ${range === opt.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {showCustomDates && (
            <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 z-30 w-full sm:w-fit sm:max-w-[min(18rem,calc(100vw-1.5rem))] overflow-visible rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-2.5 max-lg:p-2.5 lg:p-3">
              <p className="text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-2 max-lg:mb-2 lg:mb-3">{t('dashboard.overview.selectDateRange')}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-800/80 px-3 py-2 min-w-0">
                  <div className="text-xs font-medium text-stone-500 dark:text-zinc-400 mb-0.5">{t('dashboard.overview.from')}</div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-zinc-100 tabular-nums truncate" title={customFrom ? format(ymdToDate(customFrom)!, 'MMMM d, yyyy') : undefined}>
                    {customFrom && ymdToDate(customFrom) ? format(ymdToDate(customFrom)!, 'MMM d, yyyy') : <span className="text-stone-400 dark:text-zinc-500 font-normal">{t('dashboard.overview.chooseBelow')}</span>}
                  </div>
                </div>
                <div className="rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-800/80 px-3 py-2 min-w-0">
                  <div className="text-xs font-medium text-stone-500 dark:text-zinc-400 mb-0.5">{t('dashboard.overview.to')}</div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-zinc-100 tabular-nums truncate" title={customTo ? format(ymdToDate(customTo)!, 'MMMM d, yyyy') : undefined}>
                    {customTo && ymdToDate(customTo) ? format(ymdToDate(customTo)!, 'MMM d, yyyy') : <span className="text-stone-400 dark:text-zinc-500 font-normal">{t('dashboard.overview.chooseBelow')}</span>}
                  </div>
                </div>
              </div>
              <div className={`${dayPickerCalendarShellClass} mb-3`}>
                <DayPicker
                  components={{ Dropdown: DayPickerThemedDropdown }}
                  formatters={dayPickerAdminFormatters}
                  mode="range"
                  selected={customCalendarRange}
                  onSelect={(next) => {
                    if (!next?.from) {
                      setCustomFrom('');
                      setCustomTo('');
                      return;
                    }
                    const fromDate = next.from < ANALYTICS_EPOCH ? ANALYTICS_EPOCH : next.from;
                    setCustomFrom(toYmd(fromDate));
                    setCustomTo(next.to ? toYmd(next.to) : '');
                  }}
                  defaultMonth={customCalendarDefaultMonth}
                  captionLayout="dropdown"
                  navLayout="around"
                  startMonth={ANALYTICS_EPOCH}
                  endMonth={new Date(new Date().getFullYear(), 11, 31)}
                  disabled={[{ before: ANALYTICS_EPOCH }, { after: new Date() }]}
                  showOutsideDays
                  style={dayPickerCssVars}
                  className={dayPickerAdminClassName}
                  classNames={dayPickerAdminClassNames}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyCustomRange}
                  className="flex-1 py-2 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-500"
                >
                  {t('dashboard.common.apply')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCustomDates(false); setShowRangeDropdown(false); }}
                  className="px-3 py-2 rounded-lg border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 text-sm hover:bg-red-100 dark:hover:bg-red-950/50"
                >
                  {t('dashboard.common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-lg:gap-3 lg:gap-5 mb-5 max-lg:mb-5 lg:mb-8">
        <div className="group relative rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 max-lg:gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 max-lg:mb-0.5 lg:mb-1">{t('dashboard.overview.totalRevenue')}</p>
              <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums break-all leading-tight" title={formatPrice(filteredRevenue, currency)}>{formatPrice(filteredRevenue, currency)}</p>
              <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{t('dashboard.overview.paidOrdersOnly', { period: getRangeLabel(range, customFrom, customTo) })}</p>
            </div>
            <DollarSign className="w-7 h-7 max-lg:w-7 max-lg:h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
          </div>
        </div>
        <div className="group relative rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 max-lg:gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 max-lg:mb-0.5 lg:mb-1">{t('dashboard.overview.totalOrders')}</p>
              <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">{filteredOrders.length}</p>
              <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{getRangeLabel(range, customFrom, customTo)}</p>
            </div>
            <ShoppingBag className="w-7 h-7 max-lg:w-7 max-lg:h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
          </div>
        </div>
        <div className="group relative rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 max-lg:gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 max-lg:mb-0.5 lg:mb-1">{t('dashboard.overview.totalProducts')}</p>
              <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">{products.length}</p>
              <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5">{t('dashboard.overview.inCatalog')}</p>
            </div>
            <Package className="w-7 h-7 max-lg:w-7 max-lg:h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
          </div>
        </div>
      </div>

      <div className="mb-5 max-lg:mb-5 lg:mb-8">
        <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 mb-2 max-lg:mb-2 lg:mb-3">
          <TrendingUp className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" strokeWidth={2} aria-hidden />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">{t('dashboard.overview.performance')}</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-4 max-lg:gap-4 lg:gap-6">
          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden">
            <h3 className="text-sm max-lg:text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 mb-0.5 max-lg:mb-0.5 lg:mb-1">{t('dashboard.overview.revenuePaidChart')}</h3>
            <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mb-3 max-lg:mb-3 lg:mb-4 line-clamp-2">{getRangeLabel(range, customFrom, customTo)}</p>
            <div className="h-[200px] max-lg:h-[200px] lg:h-[260px] w-full min-w-0 pl-0 max-lg:pl-0 lg:pl-2">
              {!chartHasActivity ? (
                <p className="text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400 flex items-center justify-center h-full px-3 text-center rounded-xl border border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50">
                  {t('dashboard.overview.noRevenueYet')}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overviewChartRows} margin={chartMargin}>
                    <defs>
                      <linearGradient id="overviewRevenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5b45e5" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#5b45e5" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: chartAxisFontSize, fill: chartTickFill }}
                      axisLine={{ stroke: chartAxisLine }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      width={revenueYAxisWidth}
                      tick={{ fontSize: chartAxisFontSize, fill: chartTickFill, dx: -2 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                      tickFormatter={(v) => formatAxisMoney(Number(v), currency)}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ fontWeight: 600, color: chartTooltipLabelColor }}
                      cursor={{ stroke: chartGridStroke, strokeWidth: 1, strokeDasharray: '4 4' }}
                      formatter={(value: number | undefined) =>
                        value != null ? [formatPrice(value, currency), t('dashboard.overview.revenueTooltip')] : ['', '']
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="revenue"
                      stroke="#5b45e5"
                      strokeWidth={2}
                      fill="url(#overviewRevenueFill)"
                      dot={{ fill: '#2f2184', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: '#5b45e5' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden">
            <h3 className="text-sm max-lg:text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 mb-0.5 max-lg:mb-0.5 lg:mb-1">{t('dashboard.overview.ordersChart')}</h3>
            <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mb-3 max-lg:mb-3 lg:mb-4 line-clamp-2">{getRangeLabel(range, customFrom, customTo)}</p>
            <div className="h-[200px] max-lg:h-[200px] lg:h-[260px] w-full min-w-0 pl-0 max-lg:pl-0 lg:pl-2">
              {!chartHasActivity ? (
                <p className="text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400 flex items-center justify-center h-full px-3 text-center rounded-xl border border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50">
                  {t('dashboard.overview.noOrdersYetChart')}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewChartRows} margin={chartMargin} barCategoryGap={compactCharts ? '12%' : '18%'}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: chartAxisFontSize, fill: chartTickFill }}
                      axisLine={{ stroke: chartAxisLine }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      width={ordersYAxisWidth}
                      allowDecimals={false}
                      tick={{ fontSize: chartAxisFontSize, fill: chartTickFill }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ fontWeight: 600, color: chartTooltipLabelColor }}
                      cursor={{ fill: isDark ? 'rgba(91, 69, 229, 0.18)' : 'rgba(63, 52, 186, 0.12)' }}
                      formatter={(value: number | undefined) =>
                        value != null ? [value, t('dashboard.overview.ordersTooltip')] : ['', '']
                      }
                    />
                    <Bar
                      dataKey="orders"
                      name="orders"
                      fill="#b8adf5"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={compactCharts ? 36 : 48}
                      activeBar={{ fill: '#2f2184', stroke: '#b8adf5', strokeWidth: 1 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 max-lg:gap-4 lg:gap-6 mb-5 max-lg:mb-5 lg:mb-8">
        <div className="lg:col-span-2 rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden">
          <h3 className="text-sm max-lg:text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 mb-3 max-lg:mb-3 lg:mb-4 flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2">
            <FileText className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 text-brand-600 shrink-0" />
            {t('dashboard.overview.summaryTitle')}
          </h3>
          <div className="overflow-x-auto rounded-lg max-lg:rounded-lg lg:rounded-xl border border-stone-100 dark:border-zinc-800 -mx-0.5 max-lg:-mx-0.5">
            <table className="w-full text-xs max-lg:text-xs lg:text-sm min-w-[16rem]">
              <thead>
                <tr className="bg-stone-50/80 dark:bg-zinc-800/80 text-left text-stone-500 dark:text-zinc-400 font-semibold">
                  <th className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 rounded-tl-xl">{t('dashboard.overview.metric')}</th>
                  <th className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 text-right rounded-tr-xl">{t('dashboard.overview.value')}</th>
                </tr>
              </thead>
              <tbody className="text-stone-700 dark:text-zinc-300 divide-y divide-stone-100 dark:divide-zinc-800">
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 align-top">{t('dashboard.overview.period')}</td>
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 text-right font-medium align-top break-words max-w-[10rem] sm:max-w-none">{getRangeLabel(range, customFrom, customTo)}</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4">{t('dashboard.overview.ordersAll')}</td>
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 text-right font-semibold tabular-nums">{filteredOrders.length}</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4">{t('dashboard.overview.paidOrders')}</td>
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 text-right font-semibold tabular-nums">{paidOrdersInRange.length}</td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 align-top">{t('dashboard.overview.awaitingPayment')}</td>
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 text-right font-semibold tabular-nums align-top">
                    {pendingOrdersInRange.length}
                    {pendingOrdersInRange.length > 0 ? (
                      <span className="block text-[10px] max-lg:text-[10px] lg:text-xs font-normal text-amber-700 dark:text-amber-400 mt-0.5 leading-snug">{t('dashboard.overview.notInRevenueYet', { amount: formatPrice(pendingRevenueInRange, currency) })}</span>
                    ) : null}
                  </td>
                </tr>
                <tr className="bg-brand-50 dark:bg-brand-950/30 hover:bg-brand-50 dark:hover:bg-brand-950/40 dark:bg-brand-950/40">
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 font-semibold text-stone-900 dark:text-zinc-100">{t('dashboard.overview.revenuePaidRow')}</td>
                  <td className="py-2.5 max-lg:py-2.5 lg:py-3.5 px-3 max-lg:px-3 lg:px-4 text-right font-bold text-brand-600 tabular-nums break-all">{formatPrice(filteredRevenue, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden">
          <h3 className="text-sm max-lg:text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 mb-3 max-lg:mb-3 lg:mb-4 flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2">
            <LayoutDashboard className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 text-brand-600 shrink-0" />
            {t('dashboard.overview.quickActions')}
          </h3>
          <div className="space-y-2 max-lg:space-y-2 lg:space-y-3">
            <Link
              to="/dashboard/products"
              className="flex items-center justify-between gap-2 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 max-lg:p-3 lg:p-4 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all no-underline text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 max-lg:gap-2.5 lg:gap-3 min-w-0">
                <Package className="w-5 h-5 max-lg:w-5 max-lg:h-5 lg:w-6 lg:h-6 text-brand-600 shrink-0" strokeWidth={2} aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">{t('dashboard.layout.addProducts')}</p>
                  <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400">{t('dashboard.overview.itemsCount', { count: products.length })}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
            <Link
              to="/dashboard/orders"
              className="flex items-center justify-between gap-2 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 max-lg:p-3 lg:p-4 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all no-underline text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 max-lg:gap-2.5 lg:gap-3 min-w-0">
                <ShoppingBag className="w-5 h-5 max-lg:w-5 max-lg:h-5 lg:w-6 lg:h-6 text-brand-600 shrink-0" strokeWidth={2} aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">{t('dashboard.layout.orders')}</p>
                  <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400">{t('dashboard.overview.ordersTotal', { count: orders.length })}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
            <Link
              to="/dashboard/messages"
              className="flex items-center justify-between gap-2 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 max-lg:p-3 lg:p-4 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all no-underline text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 max-lg:gap-2.5 lg:gap-3 min-w-0">
                <Inbox className="w-5 h-5 max-lg:w-5 max-lg:h-5 lg:w-6 lg:h-6 text-brand-600 shrink-0" strokeWidth={2} aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">{t('dashboard.layout.messages')}</p>
                  <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400">{pendingMessages > 0 ? t('dashboard.overview.messagesAwaiting', { count: pendingMessages }) : t('dashboard.overview.inbox')}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
            <Link
              to="/dashboard/settings"
              className="flex items-center justify-between gap-2 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 max-lg:p-3 lg:p-4 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all no-underline text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 max-lg:gap-2.5 lg:gap-3 min-w-0">
                <Settings className="w-5 h-5 max-lg:w-5 max-lg:h-5 lg:w-6 lg:h-6 text-brand-600 shrink-0" strokeWidth={2} aria-hidden />
                <div className="min-w-0 flex items-center gap-1.5">
                  <p className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">{t('dashboard.overview.settings')}</p>
                  <FieldHelpButton text={t('dashboard.overview.settingsHint')} />
                </div>
              </div>
              <ArrowRight className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-lg:gap-4 lg:gap-6 mb-5 max-lg:mb-5 lg:mb-8 min-w-0 w-full max-w-full">
        <div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-5 shadow-sm">
          <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2">{t('dashboard.overview.shopLinkTitle')}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 w-full">
            <code className="block w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-stone-50/30 dark:bg-zinc-950/60 px-2.5 max-lg:px-2.5 lg:px-3 py-1.5 max-lg:py-1.5 lg:py-2 text-xs max-lg:text-xs lg:text-sm text-stone-800 dark:text-zinc-200 border border-stone-200 dark:border-zinc-700">{shopUrl}</code>
            <button
              type="button"
              onClick={copyShopUrl}
              className="inline-flex items-center justify-center gap-1.5 max-lg:gap-1.5 lg:gap-2 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 max-lg:px-3 lg:px-4 py-1.5 max-lg:py-1.5 lg:py-2 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 shrink-0 w-full sm:w-auto"
            >
              <Copy className="w-3.5 h-3.5 max-lg:w-3.5 max-lg:h-3.5 lg:w-4 lg:h-4 text-brand-600" />
              {t('dashboard.common.copyLink')}
            </button>
          </div>
        </div>
        <div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-5 shadow-sm">
          <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2 max-lg:mb-2 lg:mb-3 flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 max-lg:w-3.5 max-lg:h-3.5 lg:w-4 lg:h-4 text-amber-600 shrink-0" />
            <span className="min-w-0">{t('dashboard.overview.needsAttention')}</span>
          </p>
          <ul className="min-w-0 w-full space-y-1.5 max-lg:space-y-1.5 lg:space-y-2 text-xs max-lg:text-xs lg:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed [overflow-wrap:anywhere]">
            {products.length === 0 ? (
              <li className="min-w-0 break-words">
                <Link to="/dashboard/products" className="text-brand-700 dark:text-brand-400 font-medium hover:underline">{t('dashboard.overview.addFirstProduct')}</Link>
                {' '}{t('dashboard.overview.soCustomersCanOrder')}
              </li>
            ) : null}
            {pendingOrdersInRange.length > 0 ? (
              <li className="min-w-0 break-words">
                <Link to="/dashboard/orders" className="text-brand-700 dark:text-brand-400 font-medium hover:underline">{t('dashboard.overview.ordersAwaitingPayment', { count: pendingOrdersInRange.length })}</Link>
                {' '}{t('dashboard.overview.stillAwaitingPayment')}
              </li>
            ) : null}
            {pendingMessages > 0 ? (
              <li className="min-w-0 break-words">
                <Link to="/dashboard/messages" className="text-brand-700 dark:text-brand-400 font-medium hover:underline">{t('dashboard.overview.messagesNotReplied', { count: pendingMessages })}</Link>
                {' '}{t('dashboard.overview.haveNotMarkedReplied')}
              </li>
            ) : null}
            {products.length > 0 && pendingOrdersInRange.length === 0 && pendingMessages === 0 ? (
              <li className="min-w-0 break-words text-stone-500 dark:text-zinc-400">{t('dashboard.overview.allCaughtUp')}</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden mb-5 max-lg:mb-5 lg:mb-8">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 max-lg:gap-2 lg:gap-3 mb-3 max-lg:mb-3 lg:mb-4">
          <h3 className="text-sm max-lg:text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-start gap-1.5 max-lg:gap-1.5 lg:gap-2 min-w-0 flex-1">
            <Clock className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 text-brand-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{t('dashboard.overview.recentOrders', { period: getRangeLabel(range, customFrom, customTo) })}</span>
          </h3>
          <Link to="/dashboard/orders" className="text-xs max-lg:text-xs lg:text-sm font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:text-brand-300 no-underline shrink-0">
            {t('dashboard.overview.viewAll')}
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400 py-3 max-lg:py-3 lg:py-4">{t('dashboard.overview.noOrdersPeriod')}</p>
        ) : (
          <>
            <ul className="lg:hidden space-y-2">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-stone-100 dark:border-zinc-800 p-3 bg-stone-50/40 dark:bg-zinc-800/20"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-stone-900 dark:text-zinc-100">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className="text-xs font-semibold tabular-nums text-stone-900 dark:text-zinc-100">{formatPrice(o.totalAmount, currency)}</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-zinc-300 truncate mb-0.5">{o.customerName}</p>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-zinc-400">
                    <span>
                      {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {o.pendingPayment === true ? (
                      <span className="font-semibold text-amber-700 dark:text-amber-400">{t('dashboard.common.awaiting')}</span>
                    ) : (
                      <span className="font-semibold text-brand-700 dark:text-brand-400">{t('dashboard.common.paid')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden lg:block overflow-x-auto rounded-xl border border-stone-100 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50/80 dark:bg-zinc-800/80 text-left text-stone-500 dark:text-zinc-400 font-semibold">
                    <th className="py-3 px-4">{t('dashboard.overview.colOrder')}</th>
                    <th className="py-3 px-4">{t('dashboard.overview.colCustomer')}</th>
                    <th className="py-3 px-4">{t('dashboard.overview.colDate')}</th>
                    <th className="py-3 px-4 text-right">{t('dashboard.overview.colTotal')}</th>
                    <th className="py-3 px-4">{t('dashboard.overview.colPayment')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 text-stone-800 dark:text-zinc-200">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-mono font-medium">#{o.id.slice(-8).toUpperCase()}</td>
                      <td className="py-3 px-4">{o.customerName}</td>
                      <td className="py-3 px-4 text-stone-600 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums">{formatPrice(o.totalAmount, currency)}</td>
                      <td className="py-3 px-4">
                        {o.pendingPayment === true ? (
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t('dashboard.common.awaiting')}</span>
                        ) : (
                          <span className="text-xs font-semibold text-brand-700">{t('dashboard.common.paid')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showRangeDropdown && (
        <button
          type="button"
          aria-label={t('dashboard.layout.closeMenu')}
          className="fixed inset-0 z-10"
          onClick={() => { setShowRangeDropdown(false); setShowCustomDates(false); }}
        />
      )}
    </DashboardLayout>
  );
}
