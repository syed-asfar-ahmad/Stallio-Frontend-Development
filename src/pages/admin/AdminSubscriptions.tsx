import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CreditCard, Search, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminPagination from '../../components/admin/AdminPagination';
import { adminTheme } from '../../components/admin/adminTheme';
import ConfirmDialog from '../../components/ConfirmDialog';
import { api } from '../../lib/api';
import {
  SUBSCRIPTION_USD_MONTHLY,
  SUBSCRIPTION_USD_YEARLY,
  subscriptionPlanLabel,
  type SubscriptionPlan,
} from '../../lib/subscriptionPricing';
import {
  formatNextDueHint,
  subscriptionBillingStatusClass,
  subscriptionBillingStatusLabel,
  type SubscriptionBillingStatus,
} from '../../lib/subscriptionSchedule';
import type { AdminSubscriptionsPage } from '../../types/admin';

const SELLERS_LIMIT = 30;
const HISTORY_LIMIT = 15;

const STATUS_FILTERS: { value: SubscriptionBillingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Sellers' },
  { value: 'paid_this_month', label: 'Paid This Month' },
  { value: 'due', label: 'Due' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'never_paid', label: 'Never Paid' },
  { value: 'upcoming', label: 'Upcoming' },
];

export default function AdminSubscriptions() {
  const [data, setData] = useState<AdminSubscriptionsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellersPage, setSellersPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [status, setStatus] = useState<SubscriptionBillingStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [recording, setRecording] = useState<{ sellerId: string; plan: SubscriptionPlan } | null>(null);
  const [markPaidConfirm, setMarkPaidConfirm] = useState<{
    sellerId: string;
    shopName: string;
    plan: SubscriptionPlan;
  } | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sellersPage: String(sellersPage),
        sellersLimit: String(SELLERS_LIMIT),
        historyPage: String(historyPage),
        historyLimit: String(HISTORY_LIMIT),
        status,
      });
      if (query) params.set('search', query);
      const d = await api<AdminSubscriptionsPage>(`/api/admin/subscriptions?${params}`);
      setData(d);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [sellersPage, historyPage, status, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function markPaid(sellerId: string, plan: SubscriptionPlan) {
    setRecording({ sellerId, plan });
    try {
      const res = await api<{
        subscriptionNextDueAt: string | null;
        subscriptionPlan: SubscriptionPlan;
      }>(`/api/admin/users/${sellerId}/subscription-payment`, {
        method: 'POST',
        body: { plan },
      });
      const next = res.subscriptionNextDueAt
        ? format(new Date(res.subscriptionNextDueAt), 'MMM d, yyyy')
        : null;
      toast.success(
        next
          ? `Payment recorded. Next due: ${next} (${subscriptionPlanLabel(plan)})`
          : `Payment recorded (${subscriptionPlanLabel(plan)})`,
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to record payment');
    } finally {
      setRecording(null);
    }
  }

  async function confirmDeletePayment() {
    if (!deletePaymentId || deletingPayment) return;
    setDeletingPayment(true);
    try {
      await api(`/api/admin/subscription-payments/${deletePaymentId}`, { method: 'DELETE' });
      toast.success('Payment removed; next due date recalculated');
      setDeletePaymentId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingPayment(false);
    }
  }

  const summary = data?.summary;
  const sellers = data?.sellers ?? [];
  const history = data?.history ?? [];

  function renderMarkPaidButtons(s: (typeof sellers)[0]) {
    return (
      <div className="flex flex-col gap-2 max-lg:flex-col sm:flex-row sm:flex-wrap lg:flex-wrap lg:gap-1.5">
        <button
          type="button"
          disabled={recording !== null}
          onClick={() =>
            setMarkPaidConfirm({
              sellerId: s.id,
              shopName: s.shopName,
              plan: 'monthly',
            })
          }
          className={`inline-flex w-full max-lg:w-full sm:flex-1 lg:w-auto items-center justify-center gap-1 rounded-lg px-2.5 py-2 max-lg:py-2.5 text-xs font-semibold ${adminTheme.btnPrimary}`}
        >
          <CreditCard className="h-3.5 w-3.5 shrink-0" />
          {recording?.sellerId === s.id && recording.plan === 'monthly'
            ? '...'
            : `Monthly $${SUBSCRIPTION_USD_MONTHLY}`}
        </button>
        <button
          type="button"
          disabled={recording !== null}
          onClick={() =>
            setMarkPaidConfirm({
              sellerId: s.id,
              shopName: s.shopName,
              plan: 'yearly',
            })
          }
          className="inline-flex w-full max-lg:w-full sm:flex-1 lg:w-auto items-center justify-center gap-1 rounded-lg border border-stone-200 px-2.5 py-2 max-lg:py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <CreditCard className="h-3.5 w-3.5 shrink-0" />
          {recording?.sellerId === s.id && recording.plan === 'yearly'
            ? '...'
            : `Yearly $${SUBSCRIPTION_USD_YEARLY}`}
        </button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-6 min-w-0">
        <h1 className="text-xl max-lg:leading-snug lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          Subscriptions
        </h1>
        <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
          Track seller payments, who has paid for {summary?.monthLabel ?? 'this month'}, and automatic next due
          dates.
        </p>
      </div>

      {loading && !data ? (
        <AdminLoading />
      ) : (
        <>
          {summary ? (
            <div className="mb-4 max-lg:mb-4 lg:mb-6 grid grid-cols-2 gap-3 max-lg:gap-3 lg:grid-cols-5 lg:gap-4 min-w-0">
              <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
                <p className={`text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>Paid This Month</p>
                <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-brand-700 dark:text-brand-400 tabular-nums">
                  {summary.paidThisMonth}
                </p>
              </div>
              <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
                <p className={`text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>Due</p>
                <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                  {summary.dueCount}
                </p>
              </div>
              <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
                <p className={`text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>Overdue</p>
                <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-red-700 dark:text-red-400 tabular-nums">
                  {summary.overdueCount}
                </p>
              </div>
              <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
                <p className={`text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>Never Paid</p>
                <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-800 dark:text-zinc-100 tabular-nums">
                  {summary.neverPaid}
                </p>
              </div>
              <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5 col-span-2 lg:col-span-1`}>
                <p className={`text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>Total Revenue</p>
                <p className={`mt-1 text-lg max-lg:text-lg lg:text-2xl font-bold leading-tight ${adminTheme.statRevenueValue} break-all`}>
                  ${summary.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mb-4 max-lg:mb-4 lg:mb-4 min-w-0">
            <div className="max-lg:overflow-x-auto max-lg:pb-1 lg:overflow-visible">
              <div className="inline-flex gap-2 max-lg:gap-2 lg:flex lg:flex-wrap lg:w-full">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      setStatus(f.value);
                      setSellersPage(1);
                    }}
                    className={`shrink-0 rounded-lg px-3 max-lg:px-3 py-2 text-xs max-lg:text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                      status === f.value
                        ? adminTheme.btnFilterActive
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form
            className={`${adminTheme.card} mb-4 max-lg:mb-4 lg:mb-6 flex flex-col gap-2 max-lg:gap-2 lg:flex-row lg:flex-wrap lg:items-center p-4 max-lg:p-4 min-w-0`}
            onSubmit={(e) => {
              e.preventDefault();
              setSellersPage(1);
              setQuery(search.trim());
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shop, email, or username..."
                className={`${adminTheme.input} pl-10`}
              />
            </div>
            <button type="submit" className={`${adminTheme.btnPrimary} w-full max-lg:w-full lg:w-auto shrink-0`}>
              Search
            </button>
          </form>

          <section className={`${adminTheme.card} mb-6 max-lg:mb-6 lg:mb-8 overflow-hidden min-w-0`}>
            <div className={`${adminTheme.cardHeader} px-4 max-lg:px-4 lg:px-5 py-3 max-lg:py-3 lg:py-4`}>
              <h2 className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">
                Seller Billing
              </h2>
              <p className={`mt-0.5 text-[11px] max-lg:text-[11px] lg:text-xs ${adminTheme.muted}`}>
                Next due is scheduled automatically when you verify a payment (monthly +1 month, yearly +1 year).
              </p>
            </div>
            {loading ? (
              <div className="p-4 max-lg:p-4 lg:p-6">
                <AdminLoading compact />
              </div>
            ) : (
              <div className={`${adminTheme.tableWrap} min-w-0 border-0 shadow-none rounded-none`}>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead>
                      <tr className={adminTheme.theadRow}>
                        <th className={adminTheme.th}>Shop</th>
                        <th className={adminTheme.th}>Status</th>
                        <th className={adminTheme.th}>Plan</th>
                        <th className={adminTheme.th}>Last Paid</th>
                        <th className={adminTheme.th}>Next Due</th>
                        <th className={adminTheme.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={adminTheme.tbodyDivide}>
                      {sellers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className={`px-4 py-10 text-center ${adminTheme.muted}`}>
                            No sellers match this filter.
                          </td>
                        </tr>
                      ) : (
                        sellers.map((s) => (
                          <tr key={s.id} className={adminTheme.rowHover}>
                            <td className={adminTheme.td}>
                              <Link to={`/admin/users/${s.id}`} className={`font-medium ${adminTheme.link}`}>
                                {s.shopName}
                              </Link>
                              <p className={`text-xs ${adminTheme.muted}`}>@{s.username}</p>
                            </td>
                            <td className={adminTheme.td}>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${subscriptionBillingStatusClass(s.billingStatus)}`}
                              >
                                {subscriptionBillingStatusLabel(s.billingStatus)}
                              </span>
                            </td>
                            <td className={adminTheme.td}>
                              {s.subscriptionPlan ? subscriptionPlanLabel(s.subscriptionPlan) : '-'}
                            </td>
                            <td className={`${adminTheme.td} ${adminTheme.muted}`}>
                              {s.lastPaidAt ? (
                                <>
                                  {format(new Date(s.lastPaidAt), 'MMM d, yyyy')}
                                  {s.lastAmount != null ? (
                                    <span className="ms-1 text-stone-500 dark:text-zinc-500">
                                     , ${s.lastAmount}
                                    </span>
                                  ) : null}
                                </>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className={adminTheme.td}>
                              {formatNextDueHint(s.subscriptionPlan, s.subscriptionNextDueAt)}
                            </td>
                            <td className={adminTheme.td}>{renderMarkPaidButtons(s)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden min-w-0">
                  {sellers.length === 0 ? (
                    <p className={`px-4 py-10 text-center text-sm ${adminTheme.muted}`}>No sellers match this filter.</p>
                  ) : (
                    <ul className={`divide-y ${adminTheme.divide}`}>
                      {sellers.map((s) => (
                        <li key={s.id} className="flex flex-col gap-3 p-4 min-w-0">
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="min-w-0 flex-1">
                              <Link to={`/admin/users/${s.id}`} className={`font-semibold ${adminTheme.link} truncate block`}>
                                {s.shopName}
                              </Link>
                              <p className={`text-xs ${adminTheme.muted}`}>@{s.username}</p>
                            </div>
                            <span
                              className={`shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${subscriptionBillingStatusClass(s.billingStatus)}`}
                            >
                              {subscriptionBillingStatusLabel(s.billingStatus)}
                            </span>
                          </div>
                          <dl className="grid grid-cols-1 gap-1.5 text-xs">
                            <div className="flex justify-between gap-2">
                              <dt className={adminTheme.muted}>Plan</dt>
                              <dd className="font-medium text-stone-800 dark:text-zinc-200 text-end">
                                {s.subscriptionPlan ? subscriptionPlanLabel(s.subscriptionPlan) : '-'}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className={adminTheme.muted}>Last paid</dt>
                              <dd className="text-stone-700 dark:text-zinc-300 text-end tabular-nums">
                                {s.lastPaidAt ? (
                                  <>
                                    {format(new Date(s.lastPaidAt), 'MMM d, yyyy')}
                                    {s.lastAmount != null ? `, $${s.lastAmount}` : ''}
                                  </>
                                ) : (
                                  '-'
                                )}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                              <dt className={adminTheme.muted}>Next due</dt>
                              <dd className="text-stone-700 dark:text-zinc-300 text-end">
                                {formatNextDueHint(s.subscriptionPlan, s.subscriptionNextDueAt)}
                              </dd>
                            </div>
                          </dl>
                          {renderMarkPaidButtons(s)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {data && data.sellersTotal > 0 ? (
                  <AdminPagination
                    embedded
                    className="mx-3 max-lg:mx-3 lg:mx-4 mb-4"
                    page={data.sellersPage}
                    total={data.sellersTotal}
                    limit={data.sellersLimit}
                    onPage={setSellersPage}
                  />
                ) : null}
              </div>
            )}
          </section>

          <section className={`${adminTheme.card} overflow-hidden min-w-0`}>
            <div className={`${adminTheme.cardHeader} px-4 max-lg:px-4 lg:px-5 py-3 max-lg:py-3 lg:py-4`}>
              <h2 className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">
                Payment History
              </h2>
              <p className={`mt-0.5 text-[11px] max-lg:text-[11px] lg:text-xs ${adminTheme.muted}`}>
                All verified subscription payments
              </p>
            </div>
            <div className={`${adminTheme.tableWrap} min-w-0 border-0 shadow-none rounded-none`}>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className={adminTheme.theadRow}>
                      <th className={adminTheme.th}>Date</th>
                      <th className={adminTheme.th}>Seller</th>
                      <th className={adminTheme.th}>Plan</th>
                      <th className={adminTheme.th}>Amount</th>
                      <th className={adminTheme.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={adminTheme.tbodyDivide}>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`px-4 py-8 text-center ${adminTheme.muted}`}>
                          No payments recorded yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((p) => (
                        <tr key={p.id} className={adminTheme.rowHover}>
                          <td className={`${adminTheme.td} ${adminTheme.muted}`}>
                            {format(new Date(p.paidAt), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className={adminTheme.td}>
                            <Link to={`/admin/users/${p.userId}`} className={adminTheme.link}>
                              {p.shopName}
                            </Link>
                            <p className={`text-xs ${adminTheme.muted}`}>@{p.username}</p>
                          </td>
                          <td className={adminTheme.td}>{subscriptionPlanLabel(p.plan)}</td>
                          <td className={adminTheme.td}>${p.amount}</td>
                          <td className={adminTheme.td}>
                            <button
                              type="button"
                              onClick={() => setDeletePaymentId(p.id)}
                              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden min-w-0">
                {history.length === 0 ? (
                  <p className={`px-4 py-8 text-center text-sm ${adminTheme.muted}`}>No payments recorded yet.</p>
                ) : (
                  <ul className={`divide-y ${adminTheme.divide}`}>
                    {history.map((p) => (
                      <li key={p.id} className="flex flex-col gap-3 p-4 min-w-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-stone-500 dark:text-zinc-400 tabular-nums">
                            {format(new Date(p.paidAt), 'MMM d, yyyy, HH:mm')}
                          </p>
                          <Link to={`/admin/users/${p.userId}`} className={`mt-0.5 block font-semibold ${adminTheme.link} truncate`}>
                            {p.shopName}
                          </Link>
                          <p className={`text-xs ${adminTheme.muted}`}>@{p.username}</p>
                          <p className="mt-2 text-sm text-stone-700 dark:text-zinc-300">
                            <span className="font-medium">{subscriptionPlanLabel(p.plan)}</span>
                            <span className="mx-1.5 text-stone-400 dark:text-zinc-500">·</span>
                            <span className="font-semibold tabular-nums">${p.amount}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeletePaymentId(p.id)}
                          className="inline-flex w-full max-lg:w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {data && data.historyTotal > 0 ? (
                <AdminPagination
                  embedded
                  className="mx-3 max-lg:mx-3 lg:mx-4 mb-4"
                  page={data.historyPage}
                  total={data.historyTotal}
                  limit={data.historyLimit}
                  onPage={setHistoryPage}
                />
              ) : null}
            </div>
          </section>
        </>
      )}

      <ConfirmDialog
        open={markPaidConfirm !== null}
        title="Record Subscription Payment?"
        message={
          markPaidConfirm
            ? `Mark ${markPaidConfirm.shopName} as paid for the ${subscriptionPlanLabel(markPaidConfirm.plan)} plan ($${markPaidConfirm.plan === 'yearly' ? SUBSCRIPTION_USD_YEARLY : SUBSCRIPTION_USD_MONTHLY})? The next due date will be scheduled automatically.`
            : ''
        }
        confirmLabel={
          markPaidConfirm
            ? recording
              ? 'Recording...'
              : `Mark ${subscriptionPlanLabel(markPaidConfirm.plan)} Paid`
            : 'Confirm'
        }
        cancelLabel="Cancel"
        loading={recording !== null}
        adminBusy
        onConfirm={() => {
          if (!markPaidConfirm || recording) return;
          void markPaid(markPaidConfirm.sellerId, markPaidConfirm.plan).then(() => setMarkPaidConfirm(null));
        }}
        onCancel={() => !recording && setMarkPaidConfirm(null)}
      />

      <ConfirmDialog
        open={!!deletePaymentId}
        title="Remove Payment?"
        message="This removes the payment from history and recalculates the seller's next due date from their remaining payments."
        confirmLabel={deletingPayment ? 'Removing...' : 'Remove'}
        cancelLabel="Cancel"
        danger
        loading={deletingPayment}
        adminBusy
        onConfirm={() => void confirmDeletePayment()}
        onCancel={() => !deletingPayment && setDeletePaymentId(null)}
      />
    </AdminLayout>
  );
}
