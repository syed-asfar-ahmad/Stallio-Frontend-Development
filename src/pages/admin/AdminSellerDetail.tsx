import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ExternalLink,
  Ban,
  CheckCircle,
  TrendingUp,
  CreditCard,
  Package,
  ShoppingCart,
  Mail,
} from 'lucide-react';
import SupportChatPanel from '../../components/SupportChatPanel';
import {
  SUBSCRIPTION_USD_MONTHLY,
  SUBSCRIPTION_USD_YEARLY,
  subscriptionPlanLabel,
  type SubscriptionPlan,
} from '../../lib/subscriptionPricing';
import { formatNextDueHint } from '../../lib/subscriptionSchedule';
import AdminSellerRestrictionBadge from '../../components/admin/AdminSellerRestrictionBadge';
import type { AdminSubscriptionPayment } from '../../types/admin';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading, { AdminLoadingInline } from '../../components/admin/AdminLoading';
import AdminChartPanel from '../../components/admin/AdminChartPanel';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminSellerProductsPanel from '../../components/admin/AdminSellerProductsPanel';
import AdminSellerSettingsForm from '../../components/admin/AdminSellerSettingsForm';
import { formatPrice, getCountryOptionByCode } from '../../lib/countryCurrencyOptions';
import AdminOrderViewDialog from '../../components/admin/AdminOrderViewDialog';
import AdminSellerOrdersTab from '../../components/admin/AdminSellerOrdersTab';
import AdminSellerMessagesTab from '../../components/admin/AdminSellerMessagesTab';
import AdminMessageViewDialog from '../../components/admin/AdminMessageViewDialog';
import { adminTheme } from '../../components/admin/adminTheme';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminSuspendSellerDialog, {
  type SuspendSellerOptions,
} from '../../components/admin/AdminSuspendSellerDialog';
import { api } from '../../lib/api';
import type { AdminSellerFull } from '../../types/admin';

type Tab = 'overview' | 'products' | 'orders' | 'messages' | 'support' | 'settings' | 'subscription';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'messages', label: 'Customer Messages' },
  { id: 'support', label: 'Support Chat' },
  { id: 'settings', label: 'Settings' },
  { id: 'subscription', label: 'Subscription' },
];

const SUB_PAYMENTS_LIMIT = 10;
const ORDERS_PAGE_LIMIT = 10;
const MESSAGES_PAGE_LIMIT = 10;
export default function AdminSellerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminSellerFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [viewOrder, setViewOrder] = useState<AdminSellerFull['orders'][0] | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    shopName: '',
    email: '',
    username: '',
    country: '',
    currency: '',
    logo: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [recordingPlan, setRecordingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [viewMessage, setViewMessage] = useState<AdminSellerFull['messages'][0] | null>(null);
  const [messagesPage, setMessagesPage] = useState(1);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendInitial, setSuspendInitial] = useState<SuspendSellerOptions>({
    hideShop: true,
    blockDashboard: false,
  });
  const [savingSuspend, setSavingSuspend] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(false);

  function openSuspendDialog(mode: 'new' | 'edit') {
    if (!data?.seller) return;
    if (mode === 'new') {
      setSuspendInitial({ hideShop: true, blockDashboard: false });
    } else {
      setSuspendInitial({
        hideShop: data.seller.suspended,
        blockDashboard: data.seller.dashboardSuspended,
      });
    }
    setSuspendDialogOpen(true);
  }

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await api<AdminSellerFull>(`/api/admin/users/${id}/detail`);
      setData(d);
      setSettingsForm({
        shopName: d.seller.shopName,
        email: d.seller.email,
        username: d.seller.username,
        country: d.seller.country ?? '',
        currency: d.seller.currency ?? '',
        logo: d.seller.logo ?? '',
      });
      setPaymentsPage(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load seller');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  async function recordSubscription(plan: SubscriptionPlan) {
    if (!id) return;
    setRecordingPlan(plan);
    try {
      const res = await api<AdminSubscriptionPayment>(`/api/admin/users/${id}/subscription-payment`, {
        method: 'POST',
        body: { plan },
      });
      const next = res.subscriptionNextDueAt
        ? format(new Date(res.subscriptionNextDueAt), 'MMM d, yyyy')
        : null;
      toast.success(
        next
          ? `Payment recorded. Next due: ${next} (${subscriptionPlanLabel(plan)})`
          : `Subscription marked paid (${subscriptionPlanLabel(plan)})`,
      );
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to record payment');
    } finally {
      setRecordingPlan(null);
    }
  }

  async function confirmDeletePayment() {
    if (!deletePaymentId || deletingPayment) return;
    setDeletingPayment(true);
    try {
      await api(`/api/admin/subscription-payments/${deletePaymentId}`, { method: 'DELETE' });
      toast.success('Payment removed');
      setDeletePaymentId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingPayment(false);
    }
  }

  async function applySuspension(options: SuspendSellerOptions) {
    if (!id || !data) return;
    setSavingSuspend(true);
    try {
      await api(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: {
          suspended: options.hideShop,
          dashboardSuspended: options.blockDashboard,
        },
      });
      const fullyActive = !options.hideShop && !options.blockDashboard;
      if (fullyActive) {
        toast.success('Seller reactivated');
      } else if (options.hideShop && options.blockDashboard) {
        toast.success('Storefront hidden and dashboard blocked');
      } else if (options.hideShop) {
        toast.success('Public storefront hidden');
      } else {
        toast.success('Seller dashboard blocked');
      }
      setData({
        ...data,
        seller: {
          ...data.seller,
          suspended: options.hideShop,
          dashboardSuspended: options.blockDashboard,
        },
      });
      setSuspendDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setSavingSuspend(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSavingSettings(true);
    try {
      await api(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: {
          shopName: settingsForm.shopName.trim(),
          email: settingsForm.email.trim(),
          username: settingsForm.username.trim(),
          country: settingsForm.country.trim() || null,
          currency: settingsForm.currency.trim() || null,
          logo: settingsForm.logo.trim() || '',
        },
      });
      toast.success('Seller updated');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingSettings(false);
    }
  }

  async function confirmDeleteAccount() {
    if (!id || deletingAccount) return;
    setDeletingAccount(true);
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      toast.success('Seller deleted');
      navigate('/admin/users');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
      setDeletingAccount(false);
    }
  }

  const seller = data?.seller;
  const countryInfo = seller ? getCountryOptionByCode(seller.country) : null;
  const subscriptionPayments = data?.subscriptionPayments ?? [];
  const paginatedPayments = subscriptionPayments.slice(
    (paymentsPage - 1) * SUB_PAYMENTS_LIMIT,
    paymentsPage * SUB_PAYMENTS_LIMIT,
  );
  const paginatedOrders = (data?.orders ?? []).slice(
    (ordersPage - 1) * ORDERS_PAGE_LIMIT,
    ordersPage * ORDERS_PAGE_LIMIT,
  );
  const paginatedMessages = (data?.messages ?? []).slice(
    (messagesPage - 1) * MESSAGES_PAGE_LIMIT,
    messagesPage * MESSAGES_PAGE_LIMIT,
  );

  return (
    <AdminLayout>
      <Link
        to="/admin/users"
        className={`mb-3 max-lg:mb-3 lg:mb-4 inline-flex items-center gap-2 text-xs max-lg:text-xs lg:text-sm ${adminTheme.link}`}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back To Sellers
      </Link>

      {loading ? (
        <AdminLoading />
      ) : !data || !seller ? (
        <p className={adminTheme.muted}>Seller not found</p>
      ) : (
        <>
          <div className="mb-5 max-lg:mb-5 lg:mb-6 flex flex-col gap-3 max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 max-lg:gap-2 lg:gap-3">
                <h1 className="text-xl max-lg:leading-snug lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 truncate">
                  {seller.shopName}
                </h1>
                <AdminSellerRestrictionBadge
                  suspended={seller.suspended}
                  dashboardSuspended={seller.dashboardSuspended}
                />
              </div>
              <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400 flex flex-col gap-0.5 max-lg:gap-0.5 sm:max-lg:flex-row sm:max-lg:flex-wrap sm:max-lg:items-center sm:max-lg:gap-x-2 sm:max-lg:gap-y-1">
                <span>@{seller.username}</span>
                <span className="hidden sm:max-lg:inline text-stone-400 dark:text-zinc-500" aria-hidden>
                  |
                </span>
                <span className="truncate">{seller.email}</span>
                {countryInfo ? (
                  <>
                    <span className="hidden sm:max-lg:inline text-stone-400 dark:text-zinc-500" aria-hidden>
                      |
                    </span>
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <img
                        src={countryInfo.flagUrl}
                        alt=""
                        className="h-3.5 w-5 shrink-0 rounded-sm object-cover shadow-sm"
                      />
                      <span className="truncate">{countryInfo.label}</span>
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-lg:w-full sm:max-lg:flex-row lg:w-auto lg:flex-wrap shrink-0">
              <a
                href={`/${seller.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex w-full max-lg:w-full sm:max-lg:flex-1 lg:w-auto items-center justify-center gap-2 ${adminTheme.btnSecondary}`}
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                View Shop
              </a>
              {!seller.suspended && !seller.dashboardSuspended ? (
                <button
                  type="button"
                  onClick={() => openSuspendDialog('new')}
                  className={`inline-flex w-full max-lg:w-full sm:max-lg:flex-1 lg:w-auto items-center justify-center gap-2 ${adminTheme.btnSecondary} text-amber-700 dark:text-amber-400`}
                >
                  <Ban className="h-4 w-4 shrink-0" />
                  Suspend
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openSuspendDialog('edit')}
                    className={`inline-flex w-full max-lg:w-full sm:max-lg:flex-1 lg:w-auto items-center justify-center gap-2 ${adminTheme.btnSecondary} text-amber-800 dark:text-amber-300`}
                  >
                    <Ban className="h-4 w-4 shrink-0" />
                    Manage Suspension
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void applySuspension({ hideShop: false, blockDashboard: false })
                    }
                    disabled={savingSuspend}
                    className={`inline-flex w-full max-lg:w-full sm:max-lg:flex-1 lg:w-auto items-center justify-center gap-2 ${adminTheme.btnSecondary} text-brand-700 dark:text-brand-400`}
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Reactivate All
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mb-5 max-lg:mb-5 lg:mb-6 grid grid-cols-2 gap-3 max-lg:gap-3 lg:grid-cols-5 lg:gap-4 min-w-0">
            <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
              <p className={`flex items-center gap-1.5 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>
                <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Products</span>
              </p>
              <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                {data.stats.productCount}
              </p>
            </div>
            <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
              <p className={`flex items-center gap-1.5 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>
                <ShoppingCart className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Orders</span>
              </p>
              <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                {data.stats.orderCount}
              </p>
            </div>
            <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5`}>
              <p className={`flex items-center gap-1.5 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Messages</span>
              </p>
              <p className="mt-1 text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                {data.stats.messageCount}
              </p>
            </div>
            <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5 col-span-2 lg:col-span-1`}>
              <p className={`flex items-center gap-1.5 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>
                <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Shop Revenue</span>
              </p>
              <p className={`mt-1 text-lg max-lg:text-lg lg:text-2xl font-bold leading-tight ${adminTheme.statRevenueValue} break-all`}>
                {formatPrice(data.stats.revenue, seller.currency)}
              </p>
            </div>
            <div className={`${adminTheme.statCard} p-4 max-lg:p-4 lg:p-5 col-span-2 lg:col-span-1`}>
              <p className={`flex items-center gap-1.5 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>
                <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Subscription Revenue</span>
              </p>
              <p className={`mt-1 text-lg max-lg:text-lg lg:text-2xl font-bold leading-tight ${adminTheme.statRevenueValue} break-all`}>
                {formatPrice(data.stats.subscriptionRevenue, 'USD')}
              </p>
            </div>
          </div>

          <div className="mb-5 max-lg:mb-5 lg:mb-6 min-w-0">
            <div className="max-lg:overflow-x-auto max-lg:pb-1 lg:overflow-visible">
              <div className="inline-flex gap-1 rounded-xl border border-stone-200 bg-stone-50/80 p-1 dark:border-zinc-700 dark:bg-zinc-900/80 lg:flex lg:w-full lg:flex-wrap">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`shrink-0 rounded-lg px-3 max-lg:px-3 lg:px-4 py-2 text-xs max-lg:text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                      tab === t.id
                        ? 'bg-white text-brand-800 shadow-sm dark:bg-zinc-800 dark:text-brand-300'
                        : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {tab === 'overview' && (
            <div className="space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0">
              <div className="grid grid-cols-1 gap-4 max-lg:gap-4 lg:grid-cols-2 lg:gap-6">
              <AdminChartPanel
                compactBelowLg
                title="Revenue (30 days)"
                subtitle="Paid, Non-Cancelled Orders"
                data={data.charts.revenueByDay}
                type="area"
                valueLabel="Revenue"
                gradientId="seller-revenue"
              />
              <AdminChartPanel
                compactBelowLg
                title="Orders (30 days)"
                data={data.charts.ordersByDay}
                type="bar"
                valueLabel="Orders"
                gradientId="seller-orders"
              />
              </div>
            </div>
          )}

          {tab === 'products' && (
            <AdminSellerProductsPanel
              sellerId={seller.id}
              seller={seller}
              products={data.products}
              onReload={load}
            />
          )}


          {tab === 'orders' && (
            <AdminSellerOrdersTab
              orders={data.orders}
              paginatedOrders={paginatedOrders}
              ordersPage={ordersPage}
              ordersPageLimit={ORDERS_PAGE_LIMIT}
              currencyCode={seller.currency}
              onOrdersPageChange={(page) => {
                setOrdersPage(page);
                setViewOrder(null);
              }}
              onViewOrder={setViewOrder}
            />
          )}

          {tab === 'messages' && (
            <AdminSellerMessagesTab
              messages={data.messages}
              paginatedMessages={paginatedMessages}
              messagesPage={messagesPage}
              messagesPageLimit={MESSAGES_PAGE_LIMIT}
              onMessagesPageChange={(page) => {
                setMessagesPage(page);
                setViewMessage(null);
              }}
              onViewMessage={setViewMessage}
            />
          )}

          {tab === 'support' && (
            <div className="h-[min(70vh,520px)] min-h-[320px] max-lg:min-h-[320px] lg:min-h-[400px] min-w-0">
              <SupportChatPanel
                mode="admin"
                sellerId={seller.id}
                sellerLabel={`${seller.shopName} (@${seller.username})`}
                className="h-full"
              />
            </div>
          )}

          {tab === 'settings' && (
            <AdminSellerSettingsForm
              values={settingsForm}
              onChange={setSettingsForm}
              onSubmit={saveSettings}
              saving={savingSettings}
              onDeleteAccount={() => setDeleteAccount(true)}
            />
          )}


          {tab === 'subscription' && (
            <section className={`${adminTheme.card} min-w-0 overflow-hidden`}>
            <div className="border-b border-stone-100 px-4 max-lg:px-4 lg:px-5 py-3 max-lg:py-3 lg:py-4 dark:border-zinc-800">
              <h2 className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Stallio Subscription</h2>
              <p className={`mt-0.5 text-[11px] max-lg:text-[11px] lg:text-xs ${adminTheme.muted}`}>
                {`Record payment when this seller pays you ($${SUBSCRIPTION_USD_MONTHLY}/month or $${SUBSCRIPTION_USD_YEARLY}/year)`}
              </p>
            </div>
            <div className="space-y-4 p-4 max-lg:p-4 lg:p-5 min-w-0">
              {(seller.subscriptionNextDueAt || seller.subscriptionPlan) && (
                <p className="rounded-xl border border-brand-100 bg-brand-50/80 px-3 max-lg:px-3 lg:px-4 py-2.5 max-lg:py-2.5 lg:py-3 text-xs max-lg:text-xs lg:text-sm text-brand-900 dark:border-brand-800/40 dark:bg-brand-950/30 dark:text-brand-100">
                  <span className="font-semibold">Scheduled next due: </span>
                  {formatNextDueHint(seller.subscriptionPlan, seller.subscriptionNextDueAt)}
                </p>
              )}
              <div className="flex flex-col gap-2 max-lg:flex-col sm:max-lg:flex-row lg:flex-wrap">
                <button
                  type="button"
                  disabled={recordingPlan !== null}
                  onClick={() => recordSubscription('monthly')}
                  className={`inline-flex w-full max-lg:w-full sm:max-lg:flex-1 lg:w-auto items-center justify-center gap-2 ${adminTheme.btnPrimary}`}
                >
                  {recordingPlan === 'monthly' ? (
                    <AdminLoadingInline light dotsOnly />
                  ) : (
                    <CreditCard className="h-4 w-4 shrink-0" />
                  )}
                  <span className="text-sm">
                    {recordingPlan === 'monthly' ? 'Recording...' : `Mark Monthly Paid ($${SUBSCRIPTION_USD_MONTHLY})`}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={recordingPlan !== null}
                  onClick={() => recordSubscription('yearly')}
                  className={`inline-flex w-full max-lg:w-full sm:max-lg:flex-1 lg:w-auto items-center justify-center gap-2 ${adminTheme.btnSecondary}`}
                >
                  {recordingPlan === 'yearly' ? (
                    <AdminLoadingInline light dotsOnly />
                  ) : (
                    <CreditCard className="h-4 w-4 shrink-0" />
                  )}
                  <span className="text-sm">
                    {recordingPlan === 'yearly' ? 'Recording...' : `Mark Yearly Paid ($${SUBSCRIPTION_USD_YEARLY})`}
                  </span>
                </button>
              </div>
              <div className={`${adminTheme.tableWrap} min-w-0`}>
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead>
                          <tr className={adminTheme.theadRow}>
                            <th className={adminTheme.th}>Date</th>
                            <th className={adminTheme.th}>Plan</th>
                            <th className={adminTheme.th}>Amount</th>
                            <th className={adminTheme.th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className={adminTheme.tbodyDivide}>
                          {subscriptionPayments.length === 0 ? (
                            <tr>
                              <td colSpan={4} className={`px-4 py-8 text-center ${adminTheme.muted}`}>
                                No subscription payments recorded yet.
                              </td>
                            </tr>
                          ) : (
                          paginatedPayments.map((p) => (
                            <tr key={p.id} className={adminTheme.rowHover}>
                              <td className={`${adminTheme.td} ${adminTheme.muted}`}>
                                {format(new Date(p.paidAt), 'MMM d, yyyy HH:mm')}
                              </td>
                              <td className={adminTheme.td}>{subscriptionPlanLabel(p.plan)}</td>
                              <td className={adminTheme.td}>${p.amount}</td>
                              <td className={adminTheme.td}>
                                <button
                                  type="button"
                                  onClick={() => setDeletePaymentId(p.id)}
                                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="lg:hidden">
                      {subscriptionPayments.length === 0 ? (
                        <p className={`px-4 py-8 text-center text-sm ${adminTheme.muted}`}>
                          No subscription payments recorded yet.
                        </p>
                      ) : (
                        <ul className={`divide-y ${adminTheme.divide}`}>
                          {paginatedPayments.map((p) => (
                            <li key={p.id} className="flex items-center justify-between gap-3 p-4 min-w-0">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-stone-900 dark:text-zinc-100">
                                  {subscriptionPlanLabel(p.plan)}
                                </p>
                                <p className={`text-xs ${adminTheme.muted}`}>
                                  {format(new Date(p.paidAt), 'MMM d, yyyy HH:mm')}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-2">
                                <span className="text-sm font-semibold tabular-nums">${p.amount}</span>
                                <button
                                  type="button"
                                  onClick={() => setDeletePaymentId(p.id)}
                                  className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                {subscriptionPayments.length > 0 && (
                  <AdminPagination
                    embedded
                    className="mx-3 max-lg:mx-3 lg:mx-4 mb-4"
                    page={paymentsPage}
                    total={subscriptionPayments.length}
                    limit={SUB_PAYMENTS_LIMIT}
                    onPage={setPaymentsPage}
                  />
                )}
              </div>
            </div>
          </section>
          )}
        </>
      )}


      {viewOrder && seller && (
        <AdminOrderViewDialog
          order={viewOrder}
          currencyCode={seller.currency}
          onClose={() => setViewOrder(null)}
        />
      )}

      {viewMessage && (
        <AdminMessageViewDialog message={viewMessage} onClose={() => setViewMessage(null)} />
      )}


      <AdminSuspendSellerDialog
        open={suspendDialogOpen}
        initial={suspendInitial}
        saving={savingSuspend}
        onConfirm={(options) => void applySuspension(options)}
        onCancel={() => setSuspendDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteAccount}
        title="Delete seller?"
        message="This permanently deletes the seller account and all their products, orders, and messages."
        confirmLabel={deletingAccount ? 'Deleting...' : 'Delete Permanently'}
        cancelLabel="Cancel"
        danger
        loading={deletingAccount}
        adminBusy
        onConfirm={() => void confirmDeleteAccount()}
        onCancel={() => !deletingAccount && setDeleteAccount(false)}
      />
      <ConfirmDialog
        open={!!deletePaymentId}
        title="Remove subscription payment?"
        message="This removes the payment record from subscription revenue totals."
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
