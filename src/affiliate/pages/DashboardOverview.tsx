// ============================================================================
// Stallio Affiliate Dashboard Overview - Replicating Stallio Design System
// ============================================================================

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
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
import {
  MousePointerClick,
  Users,
  Store,
  CheckCircle2,
  Wallet,
  Clock,
  Sparkles,
  ArrowRight,
  QrCode,
  Copy,
  AlertCircle,
  TrendingUp,
  Filter,
  ChevronDown,
  FileText,
  LayoutDashboard,
  CreditCard,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAffiliateAuth } from '../AffiliateAuthContext';
import { affiliateApi } from '../affiliateApi';
import { useTheme } from '../../context/ThemeContext';
import type { AffiliateStatsResponse } from '../types';
import { formatCents, formatBps } from '../../lib/formatCurrency';
import AdminLoading from '../../components/admin/AdminLoading';
import ClicksChart from '../components/ClicksChart';

type RangeOption = '7d' | '30d' | '90d';

export default function AffiliateDashboardOverview() {
  const { affiliate } = useAffiliateAuth();
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  const [range, setRange] = useState<RangeOption>('30d');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [data, setData] = useState<AffiliateStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function loadStats() {
      setLoading(true);
      try {
        const res = await affiliateApi<AffiliateStatsResponse>(
          `/api/affiliate/stats?range=${range}`
        );
        if (alive) setData(res);
      } catch {
        // Mock fallback handles errors gracefully
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadStats();
    return () => {
      alive = false;
    };
  }, [range]);

  const rangeLabels: Record<RangeOption, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  };

  // Recharts themes matching Stallio's DashboardOverview.tsx
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
  const chartTooltipLabelColor = isDark ? '#fafafa' : '#44403c';

  const primaryCode = affiliate?.primaryCode || 'partner';
  const referralUrl =
    affiliate?.referralLink ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/r/${primaryCode}`
      : `https://stallio.shop/r/${primaryCode}`);

  async function copyReferralUrl() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success('Referral link copied to clipboard!');
    } catch {
      toast.error('Failed to copy referral link');
    }
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <AdminLoading message="Loading partner analytics..." />
      </div>
    );
  }

  const s = data?.summary;
  const settings = data?.settings;
  const series = data?.series || [];

  return (
    <div className="space-y-6">
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 lg:mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 lg:gap-2 text-brand-600 mb-0.5 lg:mb-1">
            <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[11px] lg:text-sm font-semibold uppercase tracking-wide lg:tracking-widest">
              AFFILIATE PARTNER PORTAL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent break-words">
              {affiliate?.name || 'Partner'}
            </span>
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs lg:text-sm">
            Track referral clicks, active trials, 30-day commission hold progress, and payout balances.
          </p>
        </div>

        {/* Range Selector */}
        <div className="relative w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowRangeDropdown(!showRangeDropdown)}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 text-sm font-medium hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors shadow-sm min-w-0"
          >
            <Filter className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-brand-500 shrink-0" />
            <span className="truncate min-w-0">{rangeLabels[range]}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 transition-transform ${
                showRangeDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showRangeDropdown && (
            <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-48 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-20 py-1">
              {(['7d', '30d', '90d'] as RangeOption[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setRange(opt);
                    setShowRangeDropdown(false);
                  }}
                  className={`w-full text-left px-3 lg:px-4 py-2 lg:py-2.5 text-sm font-medium transition-colors ${
                    range === opt
                      ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400'
                      : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {rangeLabels[opt]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Referral Share & Program Rules (Replicating Stallio's store link card) */}
      <div className="grid md:grid-cols-2 gap-4 lg:gap-6 min-w-0 w-full max-w-full">
        {/* Referral Link & Quick Copy Card */}
        <div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              YOUR PRIMARY REFERRAL LINK
            </p>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
              Code: {primaryCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 w-full">
            <code className="block w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-stone-50/50 dark:bg-zinc-950/60 px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-stone-800 dark:text-zinc-200 border border-stone-200 dark:border-zinc-700 font-mono">
              {referralUrl}
            </code>
            <button
              type="button"
              onClick={copyReferralUrl}
              className="inline-flex items-center justify-center gap-1.5 lg:gap-2 rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 shrink-0 w-full sm:w-auto transition-colors"
            >
              <Copy className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-brand-600" />
              <span>Copy Link</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 pt-3 border-t border-stone-100 dark:border-zinc-800">
            <span>Prefills referral code & tracks clicks for 30 days.</span>
            <Link
              to="/affiliate/dashboard/link"
              className="font-semibold text-brand-600 hover:underline dark:text-brand-400 inline-flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Get QR Code</span>
            </Link>
          </div>
        </div>

        {/* Program Terms & Agreement Summary */}
        <div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 lg:p-5 shadow-sm">
          <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5 lg:gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-brand-600 shrink-0" />
            <span className="min-w-0">PARTNER COMMISSION POLICY</span>
          </p>
          <ul className="min-w-0 w-full space-y-1.5 text-xs lg:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <span>
                <strong>20% One-Time Commission</strong> on the seller&apos;s first recorded paid payment (Basic at $5 pays $1.00; Business yearly at $50 pays $10.00).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <span>
                <strong>90-Day Pay Deadline:</strong> Seller must pay within 90 days of signup.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <span>
                <strong>30-Day Hold Period:</strong> Held for 30 days matching refund dispute policy, then approved for monthly payout batches.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 6 Stat Cards (Replicating Stallio's Stat Card Classes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
        {/* 1. Available Payout Balance */}
        <div className="group relative rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 lg:mb-1">
                AVAILABLE BALANCE
              </p>
              <p className="text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums break-all leading-tight">
                {formatCents(s?.balanceCents ?? 0)}
              </p>
              <p className="text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                Min. payout: {formatCents(settings?.minimumPayoutCents ?? 5000)} (disbursed monthly)
              </p>
            </div>
            <Wallet className="w-7 h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} />
          </div>
        </div>

        {/* 2. In 30-Day Escrow Hold */}
        <div className="group relative rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 lg:mb-1">
                30-DAY REFUND HOLD
              </p>
              <p className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums break-all leading-tight">
                {formatCents(s?.pendingEarningsCents ?? 0)}
              </p>
              <p className="text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                Held 30 days from recorded payment
              </p>
            </div>
            <Clock className="w-7 h-7 lg:w-9 lg:h-9 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
          </div>
        </div>

        {/* 3. Paid Merchant Plans */}
        <div className="group relative rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 lg:mb-1">
                PAID CONVERSIONS
              </p>
              <p className="text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                {s?.paid ?? 0}
              </p>
              <p className="text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                Qualified first paid subscriptions
              </p>
            </div>
            <CheckCircle2 className="w-7 h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} />
          </div>
        </div>

        {/* 4. Active Sellers in Free Trial */}
        <div className="group relative rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 lg:mb-1">
                SELLERS IN TRIAL
              </p>
              <p className="text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                {s?.trials ?? 0}
              </p>
              <p className="text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                Running 1-month free trial
              </p>
            </div>
            <Store className="w-7 h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} />
          </div>
        </div>

        {/* 5. Total Verified Signups */}
        <div className="group relative rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 lg:mb-1">
                TOTAL SIGNUPS
              </p>
              <p className="text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                {s?.signups ?? 0}
              </p>
              <p className="text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                Referred seller accounts
              </p>
            </div>
            <Users className="w-7 h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} />
          </div>
        </div>

        {/* 6. Unique Clicks */}
        <div className="group relative rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden hover:shadow-xl hover:border-brand-200/60 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-0.5 lg:mb-1">
                UNIQUE CLICKS
              </p>
              <p className="text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                {s?.uniqueClicks ?? 0}
              </p>
              <p className="text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                {s?.clicks ?? 0} total link & QR scans
              </p>
            </div>
            <MousePointerClick className="w-7 h-7 lg:w-9 lg:h-9 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Performance Visualizations Section */}
      <div className="mb-5 lg:mb-8">
        <div className="flex items-center gap-1.5 lg:gap-2 text-brand-600 mb-2 lg:mb-3">
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2} />
          <span className="text-[11px] lg:text-sm font-semibold uppercase tracking-wide lg:tracking-widest">
            PERFORMANCE METRICS
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Chart 1: Traffic & Unique Clicks with Daily/Cumulative Mode */}
          <ClicksChart series={series} />

          {/* Chart 2: Signups & Conversions */}
          <div className="rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden">
            <h3 className="text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 mb-0.5 lg:mb-1">
              Signups & Paid Conversions
            </h3>
            <p className="text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mb-3 lg:mb-4">
              Registered sellers and qualifying paid subscriptions ({rangeLabels[range]})
            </p>
            <div className="h-[220px] lg:h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 8, right: 12, left: -20, bottom: 0 }} barCategoryGap="20%">
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
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: chartTickFill }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ fontWeight: 600, color: chartTooltipLabelColor }}
                    cursor={{ fill: isDark ? 'rgba(91, 69, 229, 0.18)' : 'rgba(63, 52, 186, 0.12)' }}
                  />
                  <Bar
                    dataKey="signups"
                    name="Signups"
                    fill="#b8adf5"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="paid"
                    name="Paid Plan"
                    fill="#5b45e5"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table & Quick Partner Actions */}
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 mb-5 lg:mb-8">
        {/* Left 2 Cols: Summary Table */}
        <div className="lg:col-span-2 rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden">
          <h3 className="text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 mb-3 lg:mb-4 flex items-center gap-1.5 lg:gap-2">
            <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-brand-600 shrink-0" />
            <span>Partner Economics & Summary</span>
          </h3>

          <div className="overflow-x-auto rounded-lg lg:rounded-xl border border-stone-100 dark:border-zinc-800">
            <table className="w-full text-xs lg:text-sm min-w-[16rem]">
              <thead>
                <tr className="bg-stone-50/80 dark:bg-zinc-800/80 text-left text-stone-500 dark:text-zinc-400 font-semibold">
                  <th className="py-2.5 lg:py-3.5 px-3 lg:px-4">Metric / Rule</th>
                  <th className="py-2.5 lg:py-3.5 px-3 lg:px-4 text-right">Value / Status</th>
                </tr>
              </thead>
              <tbody className="text-stone-700 dark:text-zinc-300 divide-y divide-stone-100 dark:divide-zinc-800">
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4">Commission Rate</td>
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4 text-right font-semibold text-brand-600 dark:text-brand-400">
                    {formatBps(settings?.rateBps ?? 2000)} (One-Time on 1st Payment)
                  </td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4">Payment Qualifying Window</td>
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4 text-right font-medium">
                    {settings?.payDeadlineDays ?? 90} Days from Signup
                  </td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4">Refund Dispute Escrow Hold</td>
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4 text-right font-medium">
                    {settings?.holdPeriodDays ?? 30} Days Post Payment
                  </td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4">Total Pending Commissions (Hold)</td>
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4 text-right font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatCents(s?.pendingEarningsCents ?? 0)}
                  </td>
                </tr>
                <tr className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4">Lifetime Paid Out</td>
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4 text-right font-semibold tabular-nums">
                    {formatCents(s?.paidEarningsCents ?? 0)}
                  </td>
                </tr>
                <tr className="bg-brand-50/70 dark:bg-brand-950/30">
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4 font-semibold text-stone-900 dark:text-zinc-100">
                    Ready Available Balance
                  </td>
                  <td className="py-2.5 lg:py-3 px-3 lg:px-4 text-right font-bold text-brand-600 dark:text-brand-300 tabular-nums">
                    {formatCents(s?.balanceCents ?? 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions */}
        <div className="rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-6 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-600/80 overflow-hidden">
          <h3 className="text-sm lg:text-base font-bold text-stone-900 dark:text-zinc-100 mb-3 lg:mb-4 flex items-center gap-1.5 lg:gap-2">
            <LayoutDashboard className="w-4 h-4 lg:w-5 lg:h-5 text-brand-600 shrink-0" />
            <span>Quick Actions</span>
          </h3>

          <div className="space-y-2 lg:space-y-3">
            <Link
              to="/affiliate/dashboard/link"
              className="flex items-center justify-between gap-2 rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 lg:p-3.5 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                <QrCode className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Link & QR Generator</p>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">Download high-res QR for print</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            <Link
              to="/affiliate/dashboard/referrals"
              className="flex items-center justify-between gap-2 rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 lg:p-3.5 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                <Users className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Referred Merchants</p>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">{s?.signups ?? 0} total referred sellers</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            <Link
              to="/affiliate/dashboard/payouts"
              className="flex items-center justify-between gap-2 rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 lg:p-3.5 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                <CreditCard className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Payouts & Banking</p>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">Manage bank & Wise details</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            <Link
              to="/affiliate/dashboard/settings"
              className="flex items-center justify-between gap-2 rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 p-3 lg:p-3.5 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-all text-stone-900 dark:text-zinc-100 group"
            >
              <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                <Settings className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Account Settings</p>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">Custom alias codes & security</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
