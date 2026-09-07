import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Users, ShoppingBag, Inbox, UserPlus, CreditCard } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminChartPanel from '../../components/admin/AdminChartPanel';
import AdminRangeFilter from '../../components/admin/AdminRangeFilter';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminLoading from '../../components/admin/AdminLoading';
import { adminTheme, orEmpty } from '../../components/admin/adminTheme';
import {
  ANALYTICS_EPOCH_YMD,
  getRangeLabel,
  statsQueryParams,
  type RangeKey,
} from '../../lib/analyticsRange';
import { api } from '../../lib/api';
import type { AdminStats } from '../../types/admin';

const SIGNUPS_PAGE_LIMIT = 10;

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const inner = (
    <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
      <div className="flex items-start justify-between gap-3 max-lg:gap-3 lg:gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className={`text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>{label}</p>
          <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums break-all leading-tight">{value}</p>
          {sublabel ? <p className={`mt-0.5 text-[11px] max-lg:text-[11px] lg:text-xs line-clamp-2 ${adminTheme.muted}`}>{sublabel}</p> : null}
        </div>
        <div className={`${adminTheme.statIcon} h-9 w-9 max-lg:h-9 max-lg:w-9 lg:h-10 lg:w-10`}>
          <Icon className="h-4 w-4 max-lg:h-4 max-lg:w-4 lg:h-5 lg:w-5" />
        </div>
      </div>
    </div>
  );
  if (href) return <Link to={href} className="no-underline">{inner}</Link>;
  return inner;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<RangeKey>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [appliedRange, setAppliedRange] = useState<RangeKey>('all');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [signupsPage, setSignupsPage] = useState(1);
  const [compactFilter, setCompactFilter] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setCompactFilter(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const periodLabel = getRangeLabel(appliedRange, appliedFrom, appliedTo);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(statsQueryParams(appliedRange, appliedFrom, appliedTo));
      params.set('signupsPage', String(signupsPage));
      params.set('signupsLimit', String(SIGNUPS_PAGE_LIMIT));
      const data = await api<AdminStats>(`/api/admin/stats?${params}`);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [appliedRange, appliedFrom, appliedTo, signupsPage]);

  useEffect(() => {
    load();
  }, [load]);

  function applyCustomRange() {
    if (!customFrom || !customTo) return;
    let fromYmd = customFrom < ANALYTICS_EPOCH_YMD ? ANALYTICS_EPOCH_YMD : customFrom;
    if (fromYmd > customTo) return;
    setAppliedRange('custom');
    setAppliedFrom(fromYmd);
    setAppliedTo(customTo);
    setRange('custom');
    setSignupsPage(1);
  }

  function handleRangeChange(next: RangeKey) {
    setRange(next);
    if (next !== 'custom') {
      setAppliedRange(next);
      setAppliedFrom('');
      setAppliedTo('');
      setSignupsPage(1);
    }
  }

  const sellersLabel = appliedRange === 'all' ? 'Total Sellers' : 'New Sellers';
  const sellersValue = stats?.totalSellers ?? 0;

  return (
    <AdminLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-6 flex flex-col gap-3 max-lg:gap-3 lg:flex-row lg:items-start lg:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl max-lg:leading-snug lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            Platform Overview
          </h1>
          <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
            Monitor sellers, orders, and activity across Stallio
          </p>
        </div>
        <div className="w-full min-w-0 max-lg:w-full lg:w-auto lg:shrink-0">
          <AdminRangeFilter
            field={compactFilter}
            range={range}
            customFrom={customFrom}
            customTo={customTo}
            onRangeChange={handleRangeChange}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
            onApplyCustom={applyCustomRange}
          />
        </div>
      </div>

      {error && <div className={`mb-4 max-lg:mb-4 lg:mb-6 ${adminTheme.alertError}`}>{error}</div>}

      {loading && !stats ? (
        <AdminLoading />
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 gap-3 max-lg:gap-3 sm:max-lg:grid-cols-2 lg:grid-cols-2 lg:gap-4 xl:grid-cols-4 min-w-0">
            <StatCard
              label={sellersLabel}
              value={sellersValue}
              sublabel={periodLabel}
              icon={appliedRange === 'all' ? Users : UserPlus}
              href="/admin/users"
            />
            <StatCard label="Orders" value={stats.orders} sublabel={periodLabel} icon={ShoppingBag} />
            <StatCard label="Messages" value={stats.messages} sublabel={periodLabel} icon={Inbox} href="/admin/messages" />
            <StatCard
              label="Subscription Revenue"
              value={`$${stats.subscriptionRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              sublabel={`${stats.subscriptionPayments} Payment${stats.subscriptionPayments === 1 ? '' : 's'}, ${periodLabel}`}
              icon={CreditCard}
            />
          </div>

          <div className="mt-6 max-lg:mt-6 lg:mt-8 min-w-0">
            <AdminChartPanel
              compactBelowLg
              title="Subscription Revenue"
              subtitle={periodLabel}
              data={stats.charts.subscriptionByDay}
              type="area"
              valueLabel="USD"
              formatValue={(n) => `$${n.toLocaleString()}`}
              gradientId="admin-platform-subscription"
            />
          </div>

          <div className="mt-4 max-lg:mt-4 lg:mt-6 grid grid-cols-1 gap-4 max-lg:gap-4 lg:grid-cols-2 lg:gap-6 min-w-0">
            <AdminChartPanel
              compactBelowLg
              title="Orders"
              subtitle={periodLabel}
              data={stats.charts.ordersByDay}
              type="bar"
              valueLabel="Orders"
              gradientId="admin-platform-orders"
            />
            <AdminChartPanel
              compactBelowLg
              title="New Sellers"
              subtitle={periodLabel}
              data={stats.charts.signupsByDay}
              type="bar"
              valueLabel="Signups"
              gradientId="admin-platform-signups"
            />
          </div>

          <section className={`mt-6 max-lg:mt-6 lg:mt-8 ${adminTheme.card} min-w-0 overflow-hidden`}>
            <div className="border-b border-stone-100 px-4 max-lg:px-4 lg:px-5 py-3 max-lg:py-3 lg:py-4 dark:border-zinc-800">
              <h2 className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">New Sellers</h2>
              <p className={`mt-0.5 text-[11px] max-lg:text-[11px] lg:text-xs ${adminTheme.muted}`}>{periodLabel}</p>
            </div>
            <ul className={`divide-y ${adminTheme.divide}`}>
              {stats.recentSignups.length === 0 ? (
                <li className={`px-4 max-lg:px-4 lg:px-5 py-6 text-sm ${adminTheme.muted}`}>No new sellers</li>
              ) : (
                stats.recentSignups.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 max-lg:gap-2 sm:max-lg:flex-row sm:max-lg:items-center sm:max-lg:justify-between px-4 max-lg:px-4 lg:px-5 py-3 min-w-0"
                  >
                    <Link to={`/admin/users/${s.id}`} className="min-w-0 flex-1 no-underline">
                      <p className="truncate font-medium text-stone-800 hover:text-brand-700 dark:text-zinc-200 dark:hover:text-brand-400">
                        {s.shopName}
                      </p>
                      <p className={`truncate text-xs ${adminTheme.muted}`}>
                        @{s.username}
                        {orEmpty(s.email) ? `, ${s.email}` : ''}
                      </p>
                    </Link>
                    <div className="flex shrink-0 items-center justify-between gap-2 sm:max-lg:flex-col sm:max-lg:items-end sm:max-lg:justify-start lg:block lg:text-end">
                      {s.suspended && <span className={adminTheme.badgeSuspended}>Suspended</span>}
                      <p className={`text-xs ${adminTheme.muted}`}>{format(new Date(s.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <AdminPagination
              embedded
              className="mx-4 max-lg:mx-4 lg:mx-5 mb-4"
              page={signupsPage}
              total={stats.recentSignupsTotal}
              limit={stats.recentSignupsLimit || SIGNUPS_PAGE_LIMIT}
              onPage={setSignupsPage}
            />
          </section>
        </>
      ) : null}
    </AdminLayout>
  );
}
