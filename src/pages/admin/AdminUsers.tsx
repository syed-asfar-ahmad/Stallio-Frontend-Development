import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams, Link } from 'react-router-dom';

import { format } from 'date-fns';

import toast from 'react-hot-toast';

import { Search, RotateCcw, ChevronDown, SlidersHorizontal, Eye } from 'lucide-react';

import { subscriptionPlanLabel } from '../../lib/subscriptionPricing';

import { getCountryOptionByCode, getCountryOptionsList } from '../../lib/countryCurrencyOptions';

import AdminLayout from '../../components/admin/AdminLayout';

import AdminPagination from '../../components/admin/AdminPagination';

import AdminRangeFilter from '../../components/admin/AdminRangeFilter';

import AdminFieldMenu from '../../components/admin/AdminFieldMenu';

import { adminTheme, EMPTY_LABEL } from '../../components/admin/adminTheme';

import AdminLoading from '../../components/admin/AdminLoading';
import AdminSellerRestrictionBadge from '../../components/admin/AdminSellerRestrictionBadge';

import { ANALYTICS_EPOCH_YMD, type RangeKey } from '../../lib/analyticsRange';

import { api } from '../../lib/api';

import type { AdminSeller } from '../../types/admin';



const LIMIT = 20;



type StatusFilter =
  | 'all'
  | 'active'
  | 'suspended'
  | 'store_blocked'
  | 'dashboard_blocked'
  | 'fully_suspended';

type SubscriptionFilter = 'all' | 'paid' | 'unpaid';



function parseStatus(v: string | null): StatusFilter {
  const allowed: StatusFilter[] = [
    'active',
    'suspended',
    'store_blocked',
    'dashboard_blocked',
    'fully_suspended',
  ];
  if (v && allowed.includes(v as StatusFilter)) return v as StatusFilter;
  return 'all';
}



function parseSubscription(v: string | null): SubscriptionFilter {

  if (v === 'paid' || v === 'unpaid') return v;

  return 'all';

}



function parseJoinedRange(v: string | null): RangeKey {

  const keys: RangeKey[] = ['today', '3d', '7d', '1m', '1y', 'all', 'custom'];

  if (v && keys.includes(v as RangeKey)) return v as RangeKey;

  return 'all';

}



function parseCountry(v: string | null): string {

  const c = v?.trim().toUpperCase() ?? '';

  if (!c || c === 'ALL') return 'all';

  if (/^[A-Z]{2}$/.test(c)) return c;

  return 'all';

}



function CountryCell({ code }: { code: string | null }) {

  const opt = getCountryOptionByCode(code);

  if (!opt) {

    return <span className={adminTheme.muted}>{EMPTY_LABEL}</span>;

  }

  return (

    <span className="inline-flex items-center gap-2">

      <img src={opt.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded object-cover" />

      <span>{opt.label}</span>

    </span>

  );

}



export default function AdminUsers() {

  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState<AdminSeller[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);



  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const query = searchParams.get('search')?.trim() ?? '';

  const status = parseStatus(searchParams.get('status'));

  const subscription = parseSubscription(searchParams.get('subscription'));

  const country = parseCountry(searchParams.get('country'));

  const appliedJoinedRange = parseJoinedRange(searchParams.get('joinedRange'));

  const appliedFrom = searchParams.get('from') ?? '';

  const appliedTo = searchParams.get('to') ?? '';



  const [search, setSearch] = useState(query);

  const [joinedRange, setJoinedRange] = useState<RangeKey>(appliedJoinedRange);

  const [customFrom, setCustomFrom] = useState(appliedFrom);

  const [customTo, setCustomTo] = useState(appliedTo);

  const [filtersOpen, setFiltersOpen] = useState(false);



  const countryFilterOptions = useMemo(

    () => [

      { value: 'all', label: 'All Countries' },

      ...getCountryOptionsList().map((c) => ({

        value: c.value,

        label: c.label,

        flagUrl: c.flagUrl,

      })),

    ],

    [],

  );



  useEffect(() => {

    setSearch(query);

    setJoinedRange(appliedJoinedRange);

    setCustomFrom(appliedFrom);

    setCustomTo(appliedTo);

  }, [query, appliedJoinedRange, appliedFrom, appliedTo]);



  const patchParams = useCallback(

    (patch: Record<string, string | null>, resetPage = true) => {

      setSearchParams((prev) => {

        const next = new URLSearchParams(prev);

        for (const [key, value] of Object.entries(patch)) {

          if (value === null || value === '') next.delete(key);

          else next.set(key, value);

        }

        if (resetPage) next.delete('page');

        return next;

      });

    },

    [setSearchParams],

  );



  const load = useCallback(async () => {

    setLoading(true);

    try {

      const params = new URLSearchParams({

        page: String(page),

        limit: String(LIMIT),

        status,

        subscription,

        joinedRange: appliedJoinedRange,

      });

      if (country !== 'all') params.set('country', country);

      if (query) params.set('search', query);

      if (appliedJoinedRange === 'custom' && appliedFrom && appliedTo) {

        params.set('from', appliedFrom);

        params.set('to', appliedTo);

      }

      const data = await api<{ users: AdminSeller[]; total: number }>(`/api/admin/users?${params}`);

      setUsers(data.users);

      setTotal(data.total);

    } catch (e) {

      toast.error(e instanceof Error ? e.message : 'Failed to load sellers');

    } finally {

      setLoading(false);

    }

  }, [page, query, status, subscription, country, appliedJoinedRange, appliedFrom, appliedTo]);



  useEffect(() => {

    load();

  }, [load]);



  function applyCustomJoinedRange() {

    if (!customFrom || !customTo) return;

    let fromYmd = customFrom < ANALYTICS_EPOCH_YMD ? ANALYTICS_EPOCH_YMD : customFrom;

    if (fromYmd > customTo) return;

    patchParams({

      joinedRange: 'custom',

      from: fromYmd,

      to: customTo,

    });

  }



  function handleJoinedRangeChange(next: RangeKey) {

    setJoinedRange(next);

    if (next !== 'custom') {

      patchParams({

        joinedRange: next === 'all' ? null : next,

        from: null,

        to: null,

      });

    }

  }



  function resetFilters() {

    setSearch('');

    setJoinedRange('all');

    setCustomFrom('');

    setCustomTo('');

    setSearchParams({});

  }



  const hasActiveFilters =

    query !== '' ||

    status !== 'all' ||

    subscription !== 'all' ||

    country !== 'all' ||

    appliedJoinedRange !== 'all';



  const colCount = 8;



  function renderSellerSubscriptionBadge(u: AdminSeller) {
    if (u.subscriptionPaid && u.subscriptionLastPaidAt) {
      return <span className={adminTheme.badgeActive}>Paid</span>;
    }
    return <span className={adminTheme.badgePending}>Unpaid</span>;
  }

  function renderSellerSubscription(u: AdminSeller) {
    if (u.subscriptionPaid && u.subscriptionLastPaidAt) {
      return (
        <div>
          {renderSellerSubscriptionBadge(u)}
          <p className={`mt-0.5 text-xs ${adminTheme.muted}`}>
            ${u.subscriptionLastAmount ?? ''}{' '}
            {u.subscriptionLastPlan ? subscriptionPlanLabel(u.subscriptionLastPlan) : ''} ·{' '}
            {format(new Date(u.subscriptionLastPaidAt), 'MMM d, yyyy')}
          </p>
        </div>
      );
    }
    return renderSellerSubscriptionBadge(u);
  }

  return (
    <AdminLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-6 min-w-0">
        <h1 className="text-xl max-lg:leading-snug lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          Sellers
        </h1>
        <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
          View and manage seller accounts on the platform.
        </p>
      </div>

      <section className={`${adminTheme.card} mb-4 max-lg:mb-4 lg:mb-6 min-w-0 overflow-visible`}>
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 max-lg:px-4 lg:px-5 py-3 max-lg:py-3 lg:py-4 text-start transition-colors hover:bg-stone-50/80 dark:hover:bg-zinc-800/40"
          aria-expanded={filtersOpen}
        >

          <span className="flex min-w-0 flex-wrap items-center gap-2">

            <SlidersHorizontal className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />

            <span className="text-sm font-semibold text-stone-900 dark:text-zinc-100">

              {filtersOpen ? 'Hide Filters' : 'Show Filters'}

            </span>

            {hasActiveFilters && !filtersOpen ? (

              <span className={adminTheme.badgeInfo}>Active</span>

            ) : null}

          </span>

          <ChevronDown

            className={`h-4 w-4 shrink-0 text-stone-400 transition-transform dark:text-zinc-500 ${filtersOpen ? 'rotate-180' : ''}`}

            aria-hidden

          />

        </button>



        {filtersOpen ? (
          <div className="overflow-visible border-t border-stone-100 px-4 max-lg:px-4 lg:px-5 pb-4 max-lg:pb-4 lg:pb-5 pt-3 max-lg:pt-3 lg:pt-4 dark:border-zinc-800">

            {hasActiveFilters ? (

              <div className="mb-4 flex justify-end">

                <button

                  type="button"

                  onClick={resetFilters}

                  className={`${adminTheme.btnFilter} inline-flex items-center gap-1.5`}

                >

                  <RotateCcw className="h-3.5 w-3.5" />

                  Reset All

                </button>

              </div>

            ) : null}



            <div className="grid grid-cols-1 gap-3 max-lg:gap-3 sm:max-lg:grid-cols-2 lg:grid-cols-4 overflow-visible">

              <AdminFieldMenu

                label="Status"

                value={status}

                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Any Suspended' },
                  { value: 'store_blocked', label: 'Store Blocked' },
                  { value: 'dashboard_blocked', label: 'Dashboard Blocked' },
                  { value: 'fully_suspended', label: 'Fully Suspended' },
                ]}

                onChange={(v) => patchParams({ status: v === 'all' ? null : v })}

              />



              <AdminFieldMenu

                label="Subscription"

                value={subscription}

                options={[

                  { value: 'all', label: 'All' },

                  { value: 'paid', label: 'Paid' },

                  { value: 'unpaid', label: 'Unpaid' },

                ]}

                onChange={(v) => patchParams({ subscription: v === 'all' ? null : v })}

              />



              <AdminFieldMenu

                label="Country"

                value={country}

                options={countryFilterOptions}

                onChange={(v) => patchParams({ country: v === 'all' ? null : v })}

              />



              <div className="min-w-0">

                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">

                  Joined

                </label>

                <AdminRangeFilter

                  field

                  range={joinedRange}

                  customFrom={customFrom}

                  customTo={customTo}

                  onRangeChange={handleJoinedRangeChange}

                  onCustomFromChange={setCustomFrom}

                  onCustomToChange={setCustomTo}

                  onApplyCustom={applyCustomJoinedRange}

                />

              </div>

            </div>



            <form
              className="mt-3 max-lg:mt-3 lg:mt-4 flex flex-col gap-2 max-lg:flex-col lg:flex-row lg:flex-wrap border-t border-stone-100 pt-3 max-lg:pt-3 lg:pt-4 dark:border-zinc-800"
              onSubmit={(e) => {
                e.preventDefault();
                patchParams({ search: search.trim() || null });
              }}
            >
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by shop, email, or username..."
                  className={`${adminTheme.input} pl-10`}
                />
              </div>
              <button type="submit" className={`${adminTheme.btnPrimary} w-full max-lg:w-full lg:w-auto shrink-0`}>
                Search
              </button>
            </form>

          </div>

        ) : null}

      </section>



      <div className={`${adminTheme.tableWrap} min-w-0`}>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className={adminTheme.theadRow}>
                <th className={adminTheme.th}>Shop</th>
                <th className={adminTheme.th}>Email</th>
                <th className={adminTheme.th}>Orders</th>
                <th className={adminTheme.th}>Status</th>
                <th className={adminTheme.th}>Subscription</th>
                <th className={adminTheme.th}>Joined</th>
                <th className={adminTheme.th}>Country</th>
                <th className={adminTheme.th}>Actions</th>
              </tr>
            </thead>
            <tbody className={adminTheme.tbodyDivide}>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-2">
                    <AdminLoading compact />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className={`px-4 py-8 text-center ${adminTheme.muted}`}>
                    No sellers match your filters
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={adminTheme.rowHover}>
                    <td className={adminTheme.td}>
                      <p className="font-medium text-stone-900 dark:text-zinc-100">{u.shopName}</p>
                      <p className={`text-xs ${adminTheme.muted}`}>@{u.username}</p>
                    </td>
                    <td className={adminTheme.td}>{u.email}</td>
                    <td className={adminTheme.td}>{u.orderCount}</td>
                    <td className={adminTheme.td}>
                      <AdminSellerRestrictionBadge
                        suspended={u.suspended}
                        dashboardSuspended={u.dashboardSuspended}
                      />
                    </td>
                    <td className={adminTheme.td}>{renderSellerSubscription(u)}</td>
                    <td className={`${adminTheme.td} ${adminTheme.muted}`}>
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className={adminTheme.td}>
                      <CountryCell code={u.country} />
                    </td>
                    <td className={adminTheme.td}>
                      <Link
                        to={`/admin/users/${u.id}`}
                        className={`${adminTheme.link} inline-flex items-center gap-1.5`}
                      >
                        <Eye className="h-4 w-4 shrink-0" aria-hidden />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden min-w-0">
          {loading ? (
            <div className="p-4">
              <AdminLoading compact />
            </div>
          ) : users.length === 0 ? (
            <p className={`px-4 py-8 text-center text-sm ${adminTheme.muted}`}>No sellers match your filters</p>
          ) : (
            <ul className={`divide-y ${adminTheme.divide}`}>
              {users.map((u) => (
                <li key={u.id} className="p-4 flex flex-col gap-3 min-w-0">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-stone-900 dark:text-zinc-100 truncate">{u.shopName}</p>
                      <p className={`text-xs ${adminTheme.muted}`}>@{u.username}</p>
                      <p className="text-xs text-stone-600 dark:text-zinc-400 mt-1 truncate">{u.email}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700 tabular-nums dark:bg-zinc-800 dark:text-zinc-300">
                      {u.orderCount} orders
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminSellerRestrictionBadge
                      suspended={u.suspended}
                      dashboardSuspended={u.dashboardSuspended}
                    />
                    {renderSellerSubscriptionBadge(u)}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className={adminTheme.muted}>{format(new Date(u.createdAt), 'MMM d, yyyy')}</span>
                    <CountryCell code={u.country} />
                  </div>
                  <Link
                    to={`/admin/users/${u.id}`}
                    className={`${adminTheme.btnPrimary} inline-flex w-full items-center justify-center gap-1.5 no-underline`}
                  >
                    <Eye className="h-4 w-4 shrink-0" aria-hidden />
                    View seller
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AdminPagination
          embedded
          className="mx-3 max-lg:mx-3 lg:mx-4 mb-4"
          page={page}
          total={total}
          limit={LIMIT}
          onPage={(p) => patchParams({ page: p <= 1 ? null : String(p) }, false)}
        />
      </div>
    </AdminLayout>
  );
}


