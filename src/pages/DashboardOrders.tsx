import { useEffect, useState, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api, fetchAuthorizedBlob } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatQuantity } from '../lib/countryCurrencyOptions';
import { getSellerPlanLimits, canUpgradePlan } from '../lib/sellerPlanLimits';
import PlanLimitBanner from '../components/plan/PlanLimitBanner';
import PlanUsageBar from '../components/plan/PlanUsageBar';
import { getProductImageDisplayUrl } from '../lib/productImageUrl';
import DashboardLayout from '../components/DashboardLayout';
import DashboardLoading, { AdminLoadingInline } from '../components/DashboardLoading';
import FieldHelpButton from '../components/FieldHelpButton';
import { FieldTitleWithHelp } from '../components/FieldLabelWithHelp';
import type { Order, OrderFulfillmentStatus, Product } from '../types';
import {
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Banknote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Calendar,
  Eye,
  ArrowDownAZ,
  RefreshCw,
  FileDown,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  CircleAlert,
  Inbox,
  Package,
  Truck,
  Ban,
  Plus,
} from 'lucide-react';
import { scrollOnPaginationChange } from '../lib/scrollDashboardMainToTop';
import { useCloseOnOutsideClick } from '../hooks/useCloseOnOutsideClick';
import DashboardSelect from '../components/DashboardSelect';
import {
  DASHBOARD_INPUT,
  DASHBOARD_TEXTAREA,
  DASHBOARD_NUMBER_INPUT,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_ICON_CLOSE_BTN,
  DASHBOARD_SEARCH_INPUT,
  DASHBOARD_FILTER_SELECT,
} from '../lib/dashboardFormClasses';

const ORDERS_PER_PAGE = 10;
const AUTO_REFRESH_MS = 5 * 60 * 1000;

const FULFILLMENT_STATUSES: OrderFulfillmentStatus[] = ['pending', 'shipped', 'delivered', 'cancelled'];

function normalizeOrderFulfillment(o: Pick<Order, 'fulfillmentStatus'>): OrderFulfillmentStatus {
  const s = o.fulfillmentStatus as OrderFulfillmentStatus | 'processing' | undefined;
  if (s === 'processing') return 'pending';
  return FULFILLMENT_STATUSES.includes(s as OrderFulfillmentStatus) ? (s as OrderFulfillmentStatus) : 'pending';
}

function FulfillmentBadge({ status }: { status: OrderFulfillmentStatus }) {
  const { t } = useTranslation();
  const label =
    status === 'pending'
      ? t('dashboard.orders.fulfillmentPending')
      : status === 'shipped'
        ? t('dashboard.orders.fulfillmentShipped')
        : status === 'delivered'
          ? t('dashboard.orders.fulfillmentDelivered')
          : t('dashboard.orders.fulfillmentCancelled');
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap';
  switch (status) {
    case 'pending':
      return (
        <span className={`${base} bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300`}>
          <Package className="w-3.5 h-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    case 'shipped':
      return (
        <span className={`${base} bg-indigo-100 dark:bg-indigo-950/45 text-indigo-900 dark:text-indigo-200`}>
          <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    case 'delivered':
      return (
        <span className={`${base} bg-brand-100 dark:bg-brand-950/45 text-brand-800 dark:text-brand-200`}>
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    case 'cancelled':
      return (
        <span className={`${base} bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200`}>
          <Ban className="w-3.5 h-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    default:
      return null;
  }
}

type PaymentFilter = 'all' | 'pending' | 'paid';

type SortOption = 'newest' | 'oldest' | 'totalDesc' | 'totalAsc' | 'customerAsc' | 'customerDesc';

type FulfillmentFilter = 'all' | OrderFulfillmentStatus;

function sortOrders(list: Order[], sortBy: SortOption): Order[] {
  const arr = [...list];
  switch (sortBy) {
    case 'newest':
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'totalDesc':
      arr.sort((a, b) => b.totalAmount - a.totalAmount);
      break;
    case 'totalAsc':
      arr.sort((a, b) => a.totalAmount - b.totalAmount);
      break;
    case 'customerAsc':
      arr.sort((a, b) => a.customerName.localeCompare(b.customerName));
      break;
    case 'customerDesc':
      arr.sort((a, b) => b.customerName.localeCompare(a.customerName));
      break;
  }
  return arr;
}

export default function DashboardOrders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const planLimits = getSellerPlanLimits(user?.plan);
  const orderLimitReached = planLimits.maxOrders !== null && orders.length >= planLimits.maxOrders;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOrder, setDialogOrder] = useState<Order | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>('all');
  const [fulfillmentMenuOpen, setFulfillmentMenuOpen] = useState(false);
  const paymentFilterRef = useRef<HTMLDivElement>(null);
  const fulfillmentFilterRef = useRef<HTMLDivElement>(null);
  const sortFilterRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(paymentMenuOpen, () => setPaymentMenuOpen(false), paymentFilterRef);
  useCloseOnOutsideClick(fulfillmentMenuOpen, () => setFulfillmentMenuOpen(false), fulfillmentFilterRef);
  useCloseOnOutsideClick(showSortDropdown, () => setShowSortDropdown(false), sortFilterRef);
  const [productImageById, setProductImageById] = useState<Record<string, string>>({});
  const [productImageByName, setProductImageByName] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualProducts, setManualProducts] = useState<Product[]>([]);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualItems, setManualItems] = useState<{ productId: string; quantity: string }[]>([{ productId: '', quantity: '1' }]);
  const [manualErrors, setManualErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    items?: string;
    rows?: Record<number, { productId?: string; quantity?: string }>;
  }>({});

  const paymentFilterOptions = useMemo(
    () =>
      (
        [
          ['all', 'dashboard.orders.paymentAll'],
          ['pending', 'dashboard.orders.paymentPending'],
          ['paid', 'dashboard.orders.paymentPaid'],
        ] as const
      ).map(([value, key]) => ({ value: value as PaymentFilter, label: t(key) })),
    [t]
  );

  const SORT_OPTIONS = useMemo(
    () =>
      (
        [
          ['newest', 'dashboard.orders.sortNewest'],
          ['oldest', 'dashboard.orders.sortOldest'],
          ['totalDesc', 'dashboard.orders.sortTotalDesc'],
          ['totalAsc', 'dashboard.orders.sortTotalAsc'],
          ['customerAsc', 'dashboard.orders.sortCustomerAsc'],
          ['customerDesc', 'dashboard.orders.sortCustomerDesc'],
        ] as const
      ).map(([value, key]) => ({ value: value as SortOption, label: t(key) })),
    [t]
  );

  const fulfillmentStatusLabel = useCallback(
    (s: OrderFulfillmentStatus) =>
      s === 'pending'
        ? t('dashboard.orders.fulfillmentPending')
        : s === 'shipped'
          ? t('dashboard.orders.fulfillmentShipped')
          : s === 'delivered'
            ? t('dashboard.orders.fulfillmentDelivered')
            : t('dashboard.orders.fulfillmentCancelled'),
    [t]
  );

  const fulfillmentFilterMeta = useMemo(
    () => [
      { value: 'all' as const, label: t('dashboard.orders.fulfillmentAll') },
      ...FULFILLMENT_STATUSES.map((value) => ({ value, label: fulfillmentStatusLabel(value) })),
    ],
    [t, fulfillmentStatusLabel]
  );

  async function exportCsv() {
    setExporting(true);
    try {
      const blob = await fetchAuthorizedBlob('/api/orders/export');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  async function openManualOrder() {
    if (orderLimitReached) {
      toast.error(t('dashboard.orders.planLimitBody', { max: planLimits.maxOrders }));
      return;
    }
    setManualOpen(true);
    setManualErrors({});
    setManualName('');
    setManualPhone('');
    setManualAddress('');
    setManualEmail('');
    setManualItems([{ productId: '', quantity: '1' }]);
    try {
      const products = await api<Product[]>('/api/products');
      setManualProducts(Array.isArray(products) ? products : []);
    } catch {
      setManualProducts([]);
    }
  }

  function validateManualOrder(): boolean {
    const errors: NonNullable<typeof manualErrors> = { rows: {} };
    if (!manualName.trim()) errors.name = t('dashboard.orders.manualErrName');
    if (!manualPhone.trim()) errors.phone = t('dashboard.orders.manualErrPhone');
    if (!manualAddress.trim()) errors.address = t('dashboard.orders.manualErrAddress');

    let validItemCount = 0;
    manualItems.forEach((row, idx) => {
      const qty = parseFloat(row.quantity);
      const rowErr: { productId?: string; quantity?: string } = {};
      if (!row.productId) rowErr.productId = t('dashboard.orders.manualErrProduct');
      if (!Number.isFinite(qty) || qty <= 0) rowErr.quantity = t('dashboard.orders.manualErrQuantity');
      if (Object.keys(rowErr).length > 0) {
        errors.rows![idx] = rowErr;
      } else if (row.productId) {
        validItemCount += 1;
      }
    });
    if (validItemCount === 0) errors.items = t('dashboard.orders.manualErrItems');

    const hasErrors =
      Boolean(errors.name || errors.phone || errors.address || errors.items) ||
      Object.keys(errors.rows ?? {}).length > 0;
    setManualErrors(errors);
    if (hasErrors) {
      toast.error(t('dashboard.orders.manualErrSummary'));
      return false;
    }
    return true;
  }

  async function submitManualOrder() {
    if (!validateManualOrder()) return;
    const items = manualItems
      .map((i) => ({ productId: i.productId, quantity: parseFloat(i.quantity) }))
      .filter((i) => i.productId && Number.isFinite(i.quantity) && i.quantity > 0);
    setManualSaving(true);
    try {
      await api('/api/orders/manual', {
        method: 'POST',
        body: {
          customerName: manualName.trim(),
          customerPhone: manualPhone.trim(),
          customerAddress: manualAddress.trim(),
          customerEmail: manualEmail.trim() || undefined,
          items,
          pendingPayment: true,
        },
      });
      toast.success(t('dashboard.orders.manualSuccess'));
      setManualOpen(false);
      await loadOrders(true);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setManualSaving(false);
    }
  }

  async function loadOrders(isManualRefresh: boolean = false) {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [ordersData, productsData] = await Promise.all([
        api<Order[]>('/api/orders'),
        api<Product[]>('/api/products').catch(() => []),
      ]);
      const list = Array.isArray(ordersData) ? ordersData : [];
      const products = Array.isArray(productsData) ? productsData : [];
      const imageMapById: Record<string, string> = {};
      const imageMapByName: Record<string, string> = {};
      products.forEach((p) => {
        const first = (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image) ?? null;
        if (p.id && first) imageMapById[p.id] = first;
        if (p.name && first) imageMapByName[p.name.trim().toLowerCase()] = first;
      });
      setProductImageById(imageMapById);
      setProductImageByName(imageMapByName);
      setOrders(list);
      if (list.some((o) => !o.isRead)) {
        api('/api/orders/mark-read', { method: 'PATCH' }).catch(() => {});
        setOrders((prev) => prev.map((o) => ({ ...o, isRead: true })));
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadOrders(true);
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const awaiting = orders.filter((o) => o.pendingPayment === true).length;
    const paid = orders.filter((o) => o.pendingPayment !== true).length;
    return { total, awaiting, paid };
  }, [orders]);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.pendingPayment !== true).reduce((s, o) => s + o.totalAmount, 0),
    [orders]
  );

  const filteredByPayment = useMemo(() => {
    if (paymentFilter === 'pending') return orders.filter((o) => o.pendingPayment === true);
    if (paymentFilter === 'paid') return orders.filter((o) => o.pendingPayment !== true);
    return orders;
  }, [orders, paymentFilter]);

  const filteredByFulfillment = useMemo(() => {
    if (fulfillmentFilter === 'all') return filteredByPayment;
    return filteredByPayment.filter((o) => normalizeOrderFulfillment(o) === fulfillmentFilter);
  }, [filteredByPayment, fulfillmentFilter]);

  const fulfillmentCounts = useMemo(() => {
    const c: Record<OrderFulfillmentStatus, number> = {
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      c[normalizeOrderFulfillment(o)]++;
    });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^#/, '');
    if (!q) return filteredByFulfillment;
    return filteredByFulfillment.filter((o) => {
      const nameMatch = (o.customerName ?? '').toLowerCase().includes(q);
      const shortId = o.id.slice(-8).toUpperCase().toLowerCase();
      const idMatch =
        shortId.includes(q) ||
        (o.id ?? '').toLowerCase().includes(q) ||
        shortId.includes(q.replace(/\s/g, ''));
      return nameMatch || idMatch;
    });
  }, [filteredByFulfillment, searchQuery]);

  const sortedOrders = useMemo(() => sortOrders(filteredOrders, sortBy), [filteredOrders, sortBy]);
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return sortedOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [sortedOrders, page]);

  const rangeStart = sortedOrders.length === 0 ? 0 : (page - 1) * ORDERS_PER_PAGE + 1;
  const rangeEnd = sortedOrders.length === 0 ? 0 : Math.min(page * ORDERS_PER_PAGE, sortedOrders.length);

  useEffect(() => {
    setPage(1);
  }, [sortBy, searchQuery, paymentFilter, fulfillmentFilter]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
              <Sparkles className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
              <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
                {t('dashboard.orders.section')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
              {t('dashboard.orders.title')}
            </h1>
            <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">{t('dashboard.orders.subtitle')}</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-lg:w-full lg:flex-row lg:items-center lg:w-auto lg:shrink-0">
            <button
              type="button"
              onClick={exportCsv}
              disabled={exporting}
              className={`${DASHBOARD_BTN_OUTLINE} w-full justify-center whitespace-nowrap max-lg:py-2.5 max-lg:text-sm lg:w-auto lg:shrink-0`}
            >
              <FileDown className="w-4 h-4 shrink-0" />
              {exporting ? t('dashboard.orders.exporting') : t('dashboard.orders.exportCsv')}
            </button>
            <button
              type="button"
              onClick={openManualOrder}
              disabled={orderLimitReached}
              className={`${DASHBOARD_BTN_PRIMARY} w-full justify-center whitespace-nowrap max-lg:py-2.5 max-lg:text-sm lg:w-auto lg:shrink-0 disabled:opacity-50`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {t('dashboard.orders.manualOrder')}
            </button>
            {planLimits.maxOrders !== null && (
              <div className="min-w-[130px] w-full lg:w-auto">
                <PlanUsageBar
                  count={orders.length}
                  max={planLimits.maxOrders}
                  label={t('dashboard.orders.planLimitUsage', { count: orders.length, max: planLimits.maxOrders })}
                  limitReached={orderLimitReached}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <PlanLimitBanner show={orderLimitReached && canUpgradePlan(user?.plan)} />

      {orders.length === 0 ? (
        <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 p-8 max-lg:p-8 sm:p-12 lg:p-16 text-center shadow-sm overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-500/5 pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 max-lg:w-16 max-lg:h-16 lg:w-20 lg:h-20 rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-4 max-lg:mb-4 lg:mb-6 shadow-lg shadow-brand-500/25">
              <ShoppingBag className="w-8 h-8 max-lg:w-8 max-lg:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <h2 className="text-lg max-lg:text-lg lg:text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2">{t('dashboard.orders.emptyTitle')}</h2>
            <p className="text-sm max-lg:text-sm lg:text-base text-stone-600 dark:text-zinc-400 max-w-sm mx-auto">
              {t('dashboard.orders.emptyBody')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 max-lg:gap-3 lg:gap-4 mb-5 max-lg:mb-5 lg:mb-6 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.28fr)] min-w-0">
            <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/90 dark:border-zinc-600/90 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-5 shadow-sm ring-1 ring-stone-100/80 dark:ring-zinc-800/80 flex items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
              <span className="flex h-11 w-11 max-lg:h-11 max-lg:w-11 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
                <Inbox className="w-6 h-6 max-lg:w-6 max-lg:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums leading-tight">{orderStats.total}</p>
                <p className="text-xs max-lg:text-xs lg:text-sm font-medium text-stone-500 dark:text-zinc-400">{t('dashboard.orders.statTotal')}</p>
              </div>
            </div>
            <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-amber-200/90 dark:border-amber-800/40 bg-gradient-to-br from-white to-amber-50/40 dark:from-zinc-900 dark:to-amber-950/25 p-4 max-lg:p-4 lg:p-5 shadow-sm dark:shadow-black/20 flex items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
              <span className="flex h-11 w-11 max-lg:h-11 max-lg:w-11 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 ring-1 ring-amber-200/70 dark:ring-amber-700/50">
                <CircleAlert className="w-6 h-6 max-lg:w-6 max-lg:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-amber-950 dark:text-amber-100 tabular-nums leading-tight">{orderStats.awaiting}</p>
                <p className="text-xs max-lg:text-xs lg:text-sm font-medium text-amber-900/90 dark:text-amber-300/90">{t('dashboard.orders.statAwaiting')}</p>
              </div>
            </div>
            <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-brand-200/80 dark:border-brand-800/40 bg-gradient-to-br from-white to-brand-50/50 dark:from-zinc-900 dark:to-brand-950/25 p-4 max-lg:p-4 lg:p-5 shadow-sm dark:shadow-black/20 flex items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
              <span className="flex h-11 w-11 max-lg:h-11 max-lg:w-11 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-brand-100 dark:bg-brand-950/45 text-brand-700 dark:text-brand-200 ring-1 ring-brand-200/60 dark:ring-brand-700/45">
                <CheckCircle2 className="w-6 h-6 max-lg:w-6 max-lg:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-brand-800 dark:text-brand-100 tabular-nums leading-tight">{orderStats.paid}</p>
                <p className="text-xs max-lg:text-xs lg:text-sm font-medium text-brand-700/90 dark:text-brand-300/90">{t('dashboard.orders.statPaid')}</p>
              </div>
            </div>
            <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-5 shadow-sm flex items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0 sm:col-span-2 xl:col-span-1">
              <span className="flex h-11 w-11 max-lg:h-11 max-lg:w-11 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-brand-100 dark:bg-brand-950/45 text-brand-600 dark:text-brand-300">
                <Banknote className="w-6 h-6 max-lg:w-6 max-lg:h-6 lg:w-7 lg:h-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-lg max-lg:text-lg sm:text-xl xl:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums tracking-tight break-all sm:whitespace-nowrap"
                  title={formatPrice(totalRevenue, user?.currency)}
                >
                  {formatPrice(totalRevenue, user?.currency)}
                </p>
                <p className="text-xs max-lg:text-xs lg:text-sm font-medium text-stone-500 dark:text-zinc-400">{t('dashboard.orders.statRevenue')}</p>
              </div>
            </div>
          </div>

          <div className="mb-5 max-lg:mb-5 lg:mb-6 space-y-3 max-lg:space-y-3 lg:space-y-4 min-w-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500 pointer-events-none" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('dashboard.orders.searchPlaceholder')}
                autoComplete="off"
                className={`${DASHBOARD_SEARCH_INPUT} max-lg:py-2.5`}
              />
            </div>

            <div className="sticky top-0 z-20 -mx-4 px-4 py-3 max-lg:-mx-4 max-lg:px-4 sm:max-lg:-mx-6 sm:max-lg:px-6 max-lg:bg-stone-50/95 max-lg:dark:bg-zinc-950/95 max-lg:backdrop-blur-md max-lg:border-b max-lg:border-stone-200/70 max-lg:dark:border-zinc-800/70 lg:static lg:mx-0 lg:px-0 lg:py-0 lg:border-0 lg:bg-transparent">
              <div
                className="mb-2.5 max-lg:mb-2.5 lg:mb-0 inline-flex w-full max-lg:justify-center lg:w-auto items-center gap-2 rounded-full border border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/35 px-3 max-lg:px-3 lg:px-3.5 py-1.5 max-lg:py-1.5 lg:py-2 text-[11px] max-lg:text-[11px] lg:text-xs font-semibold text-brand-900 dark:text-brand-100 shadow-sm"
                title={t('dashboard.orders.autoRefreshTitle')}
              >
                <Clock className="h-3.5 w-3.5 max-lg:h-3.5 lg:h-4 lg:w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
                <span>{t('dashboard.orders.autoRefresh')}</span>
              </div>
              <div className="grid max-lg:grid-cols-2 max-lg:gap-2 lg:flex lg:flex-wrap lg:items-center lg:gap-2 lg:ml-auto lg:justify-end min-w-0">
                <div ref={paymentFilterRef} className={`relative min-w-0 max-lg:z-[100] ${paymentMenuOpen ? 'z-[100]' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setPaymentMenuOpen((o) => !o)}
                    className={`${DASHBOARD_FILTER_SELECT} w-full text-sm max-lg:min-h-[2.75rem] max-lg:py-2.5 lg:w-auto lg:inline-flex`}
                  >
                    <Filter className="w-4 h-4 shrink-0 text-brand-500" />
                    <span className="truncate text-left flex-1 max-lg:max-w-none lg:max-w-[10rem] xl:max-w-none">
                      {paymentFilterOptions.find((o) => o.value === paymentFilter)?.label ?? t('dashboard.orders.paymentAll')}
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${paymentMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {paymentMenuOpen ? (
                    <div className="absolute left-0 right-0 max-lg:left-0 max-lg:right-0 lg:left-auto lg:right-0 top-full mt-1 w-full lg:w-52 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-[200] py-1">
                      {paymentFilterOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setPaymentFilter(opt.value);
                            setPaymentMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            paymentFilter === opt.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div ref={fulfillmentFilterRef} className={`relative min-w-0 max-lg:z-[100] ${fulfillmentMenuOpen ? 'z-[100]' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setFulfillmentMenuOpen((o) => !o)}
                    className={`${DASHBOARD_FILTER_SELECT} w-full text-sm max-lg:min-h-[2.75rem] max-lg:py-2.5 lg:w-auto lg:inline-flex`}
                  >
                    <Package className="w-4 h-4 text-brand-500 shrink-0" />
                    <span className="truncate text-left flex-1 max-lg:max-w-none lg:max-w-[10rem] xl:max-w-none">
                      {fulfillmentFilterMeta.find((x) => x.value === fulfillmentFilter)?.label ?? t('dashboard.orders.fulfillmentAll')}
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${fulfillmentMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {fulfillmentMenuOpen ? (
                    <div className="absolute left-0 right-0 lg:left-auto lg:right-0 top-full mt-1 w-full lg:w-56 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-[200] py-1">
                      {fulfillmentFilterMeta.map((opt) => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => {
                            setFulfillmentFilter(opt.value);
                            setFulfillmentMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            fulfillmentFilter === opt.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {opt.label}
                          {opt.value !== 'all' ? (
                            <span className="text-stone-400 dark:text-zinc-500 font-normal tabular-nums"> ({fulfillmentCounts[opt.value]})</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div ref={sortFilterRef} className={`relative min-w-0 max-lg:z-[100] ${showSortDropdown ? 'z-[100]' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className={`${DASHBOARD_FILTER_SELECT} w-full text-sm max-lg:min-h-[2.75rem] max-lg:py-2.5 lg:w-auto lg:inline-flex`}
                  >
                    <ArrowDownAZ className="w-4 h-4 shrink-0 text-brand-500" />
                    <span className="truncate text-left flex-1 max-lg:max-w-none lg:max-w-[9rem] xl:max-w-none">
                      {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? t('dashboard.orders.sortLabel')}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showSortDropdown ? (
                    <div className="absolute left-0 right-0 lg:left-auto lg:right-0 top-full mt-1 w-full lg:w-56 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-[200] py-1">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            sortBy === opt.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => loadOrders(true)}
                  disabled={refreshing}
                  className={`${DASHBOARD_BTN_OUTLINE} w-full max-lg:min-h-[2.75rem] max-lg:justify-center max-lg:py-2.5 max-lg:text-sm lg:w-auto`}
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? t('dashboard.common.refreshing') : t('dashboard.common.refresh')}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden min-w-0">
            {sortedOrders.length === 0 ? (
              <div className="p-8 max-lg:p-8 lg:p-12 text-center text-stone-600 dark:text-zinc-400">
                <p className="font-medium text-sm max-lg:text-sm lg:text-base text-stone-800 dark:text-zinc-200 mb-1">{t('dashboard.orders.noMatchTitle')}</p>
                <p className="text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
                  {t('dashboard.orders.noMatchBody')}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-800/80">
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.colOrder')}</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.colDate')}</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.colCustomer')}</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.colItems')}</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 text-right">{t('dashboard.orders.colTotal')}</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.colPayment')}</th>
                        <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.colDelivery')}</th>
                        <th className="px-5 py-3.5 w-20" aria-label={t('dashboard.orders.colActions')} />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                      {paginatedOrders.map((o) => {
                        const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
                        return (
                          <tr key={o.id} className="bg-white dark:bg-zinc-900 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-5 py-3">
                              <span className="font-mono font-semibold text-stone-900 dark:text-zinc-100">#{o.id.slice(-8).toUpperCase()}</span>
                            </td>
                            <td className="px-5 py-3 text-sm text-stone-600 dark:text-zinc-400">
                              {new Date(o.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-5 py-3 font-medium text-stone-800 dark:text-zinc-200">{o.customerName}</td>
                            <td className="px-5 py-3 text-sm text-stone-600 dark:text-zinc-400 tabular-nums">{itemCount}</td>
                            <td className="px-5 py-3 text-right font-semibold text-stone-900 dark:text-zinc-100 tabular-nums">
                              {formatPrice(o.totalAmount, user?.currency)}
                            </td>
                            <td className="px-5 py-3">
                              {o.pendingPayment === true ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/45 text-amber-800 dark:text-amber-200 px-2.5 py-1 text-xs font-semibold">
                                  <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden /> {t('dashboard.common.awaiting')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-950/45 text-brand-800 dark:text-brand-200 px-2.5 py-1 text-xs font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden /> {t('dashboard.common.paid')}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <FulfillmentBadge status={normalizeOrderFulfillment(o)} />
                            </td>
                            <td className="px-5 py-2">
                              <button
                                type="button"
                                onClick={() => setDialogOrder(o)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                                title={t('dashboard.orders.viewDetails')}
                              >
                                <Eye className="w-4 h-4" /> {t('dashboard.common.view')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden divide-y divide-stone-100 dark:divide-zinc-800">
                  {paginatedOrders.map((o) => {
                    const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <div key={o.id} className="p-4 max-lg:p-4 flex flex-col gap-3 min-w-0">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <span className="font-mono font-semibold text-sm max-lg:text-sm text-stone-900 dark:text-zinc-100">
                              #{o.id.slice(-8).toUpperCase()}
                            </span>
                            <p className="text-sm font-medium text-stone-800 dark:text-zinc-200 mt-0.5 truncate">{o.customerName}</p>
                            <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                              {new Date(o.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              {', '}
                              {t('dashboard.orders.colItems')}: {itemCount}
                            </p>
                          </div>
                          <p className="font-bold text-brand-700 dark:text-brand-400 text-sm tabular-nums shrink-0">
                            {formatPrice(o.totalAmount, user?.currency)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {o.pendingPayment === true ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/45 text-amber-800 dark:text-amber-200 px-2 py-0.5 text-[10px] font-semibold">
                              <Clock className="w-3 h-3 shrink-0" aria-hidden /> {t('dashboard.common.awaiting')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-950/45 text-brand-800 dark:text-brand-200 px-2 py-0.5 text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden /> {t('dashboard.common.paid')}
                            </span>
                          )}
                          <FulfillmentBadge status={normalizeOrderFulfillment(o)} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setDialogOrder(o)}
                          className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs max-lg:text-xs font-semibold text-brand-600 border border-brand-200 dark:border-brand-800/50 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                          title={t('dashboard.orders.viewDetails')}
                        >
                          <Eye className="w-4 h-4 shrink-0" /> {t('dashboard.common.view')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {sortedOrders.length > 0 && (
            <div className="mt-5 max-lg:mt-5 lg:mt-6 flex flex-col gap-3 max-lg:gap-3 lg:gap-4 rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 px-3 max-lg:px-3 lg:px-4 py-3 max-lg:py-3 lg:py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between min-w-0">
              <p className="text-xs max-lg:text-xs lg:text-sm text-stone-600 dark:text-zinc-400 tabular-nums text-center sm:text-left">
                {t('dashboard.common.showingRange', { start: rangeStart, end: rangeEnd, total: sortedOrders.length })}
              </p>
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      scrollOnPaginationChange();
                    }}
                    disabled={page <= 1}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    {t('dashboard.common.previous')}
                  </button>
                  <span className="px-1 text-xs max-lg:text-xs lg:text-sm font-medium text-stone-500 dark:text-zinc-400 tabular-nums shrink-0">
                    {t('dashboard.common.pageOf', { current: page, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      scrollOnPaginationChange();
                    }}
                    disabled={page >= totalPages}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-40"
                  >
                    {t('dashboard.common.next')}
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {manualOpen && (
        <div
          className="fixed inset-0 z-[200] flex max-lg:items-end max-lg:justify-center max-lg:p-0 lg:items-center lg:justify-center lg:p-4 bg-black/55 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setManualOpen(false)}
        >
          <div
            className="w-full max-w-lg flex flex-col min-h-0 h-[min(92vh,100dvh)] max-h-[min(92vh,100dvh)] lg:h-auto lg:max-h-[90vh] overflow-hidden rounded-t-2xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-4 py-3 max-lg:px-4 lg:px-6 lg:py-4 border-b border-stone-100 dark:border-zinc-800 shrink-0">
              <FieldTitleWithHelp
                title={t('dashboard.orders.manualTitle')}
                help={t('dashboard.orders.manualHint')}
                titleClassName="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100"
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9 shrink-0`}
                aria-label={t('dashboard.common.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 max-lg:p-4 lg:p-6 space-y-4 min-w-0">
              <div className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/40 dark:bg-zinc-950/40 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  {t('dashboard.orders.manualItems')} <span className="text-red-500">*</span>
                </p>
                {manualErrors.items ? (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
                    {manualErrors.items}
                  </p>
                ) : null}
                {manualItems.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_5.5rem] gap-3 items-end">
                    <div className="min-w-0">
                      <label className="block text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-1.5">
                        {t('dashboard.orders.selectProduct')} <span className="text-red-500">*</span>
                      </label>
                      <DashboardSelect
                        portalMenu
                        value={row.productId}
                        onChange={(v) => {
                          setManualItems((prev) => prev.map((r, i) => (i === idx ? { ...r, productId: v } : r)));
                          setManualErrors((prev) => {
                            const rows = { ...prev.rows };
                            if (rows[idx]) {
                              const next = { ...rows[idx] };
                              delete next.productId;
                              if (Object.keys(next).length === 0) delete rows[idx];
                              else rows[idx] = next;
                            }
                            return { ...prev, items: undefined, rows };
                          });
                        }}
                        options={[
                          { value: '', label: t('dashboard.orders.selectProduct') },
                          ...manualProducts.map((p) => ({ value: p.id, label: p.name })),
                        ]}
                      />
                      {manualErrors.rows?.[idx]?.productId ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{manualErrors.rows[idx].productId}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-1.5">
                        {t('dashboard.orders.quantityLabel')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder={t('dashboard.orders.quantityPh')}
                        value={row.quantity}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9.]/g, '');
                          setManualItems((prev) => prev.map((r, i) => (i === idx ? { ...r, quantity: v } : r)));
                          setManualErrors((prev) => {
                            const rows = { ...prev.rows };
                            if (rows[idx]) {
                              const next = { ...rows[idx] };
                              delete next.quantity;
                              if (Object.keys(next).length === 0) delete rows[idx];
                              else rows[idx] = next;
                            }
                            return { ...prev, rows };
                          });
                        }}
                        aria-invalid={Boolean(manualErrors.rows?.[idx]?.quantity)}
                        className={`${DASHBOARD_NUMBER_INPUT}${manualErrors.rows?.[idx]?.quantity ? ' border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                      />
                      {manualErrors.rows?.[idx]?.quantity ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{manualErrors.rows[idx].quantity}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setManualItems((prev) => [...prev, { productId: '', quantity: '1' }])}
                  className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {t('dashboard.orders.addItem')}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                    {t('dashboard.orders.customer')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={manualName}
                    placeholder={t('dashboard.orders.customerPh')}
                    onChange={(e) => {
                      setManualName(e.target.value);
                      if (manualErrors.name) setManualErrors((p) => ({ ...p, name: undefined }));
                    }}
                    aria-invalid={Boolean(manualErrors.name)}
                    className={`${DASHBOARD_INPUT}${manualErrors.name ? ' border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                  />
                  {manualErrors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{manualErrors.name}</p> : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                    {t('dashboard.orders.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={manualPhone}
                    placeholder={t('dashboard.orders.phonePh')}
                    onChange={(e) => {
                      setManualPhone(e.target.value);
                      if (manualErrors.phone) setManualErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    aria-invalid={Boolean(manualErrors.phone)}
                    className={`${DASHBOARD_INPUT}${manualErrors.phone ? ' border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                  />
                  {manualErrors.phone ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{manualErrors.phone}</p> : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                    {t('dashboard.orders.email')}
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    placeholder={t('dashboard.orders.emailPh')}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className={DASHBOARD_INPUT}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                    {t('dashboard.orders.address')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={manualAddress}
                    placeholder={t('dashboard.orders.addressPh')}
                    onChange={(e) => {
                      setManualAddress(e.target.value);
                      if (manualErrors.address) setManualErrors((p) => ({ ...p, address: undefined }));
                    }}
                    rows={3}
                    aria-invalid={Boolean(manualErrors.address)}
                    className={`${DASHBOARD_TEXTAREA}${manualErrors.address ? ' border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                  />
                  {manualErrors.address ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{manualErrors.address}</p> : null}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 max-lg:px-4 lg:px-6 lg:py-4 border-t border-stone-100 dark:border-zinc-800 flex flex-col-reverse gap-2 max-lg:flex-col-reverse lg:flex-row lg:justify-end shrink-0 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="w-full lg:w-auto lg:min-w-[7rem] py-2.5 rounded-xl text-sm font-semibold border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
              >
                {t('dashboard.common.cancel')}
              </button>
              <button type="button" onClick={() => void submitManualOrder()} disabled={manualSaving} className={`${DASHBOARD_BTN_PRIMARY} w-full lg:w-auto lg:min-w-[9rem] !py-2.5`}>
                {manualSaving ? t('dashboard.common.saving') : t('dashboard.orders.manualSave')}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogOrder && (
        <OrderDetailDialog
          order={dialogOrder}
          userCurrency={user?.currency}
          productImageById={productImageById}
          productImageByName={productImageByName}
          onClose={() => setDialogOrder(null)}
          onPatched={(updated) => {
            setOrders((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setDialogOrder(updated);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function OrderDetailDialog({
  order: o,
  userCurrency,
  productImageById,
  productImageByName,
  onClose,
  onPatched,
}: {
  order: Order;
  userCurrency?: string | null;
  productImageById: Record<string, string>;
  productImageByName: Record<string, string>;
  onClose: () => void;
  onPatched: (order: Order) => void;
}) {
  const { t } = useTranslation();
  const fulfillmentLabel = useCallback(
    (s: OrderFulfillmentStatus) =>
      s === 'pending'
        ? t('dashboard.orders.fulfillmentPending')
        : s === 'shipped'
          ? t('dashboard.orders.fulfillmentShipped')
          : s === 'delivered'
            ? t('dashboard.orders.fulfillmentDelivered')
            : t('dashboard.orders.fulfillmentCancelled'),
    [t]
  );
  const [paymentDraft, setPaymentDraft] = useState(o.sellerPaymentDetails ?? '');
  const [actionError, setActionError] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fulfillmentUpdating, setFulfillmentUpdating] = useState(false);
  const [fulfillmentMenuOpen, setFulfillmentMenuOpen] = useState(false);
  const fulfillmentBtnRef = useRef<HTMLButtonElement>(null);
  const fulfillmentPortalRef = useRef<HTMLUListElement>(null);
  const [fulfillmentMenuBox, setFulfillmentMenuBox] = useState<{ top: number; left: number; width: number } | null>(null);
  const [trackingDraft, setTrackingDraft] = useState(o.trackingNumber ?? '');
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingSaved, setTrackingSaved] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);

  useEffect(() => {
    setPaymentDraft(o.sellerPaymentDetails ?? '');
    setTrackingDraft(o.trackingNumber ?? '');
    setTrackingSaved(false);
    setPaymentSaved(false);
  }, [o.id, o.sellerPaymentDetails, o.trackingNumber]);

  useEffect(() => {
    setFulfillmentMenuOpen(false);
  }, [o.id]);

  const measureFulfillmentMenu = useCallback(() => {
    const btn = fulfillmentBtnRef.current;
    if (!btn || !fulfillmentMenuOpen) {
      setFulfillmentMenuBox(null);
      return;
    }
    const r = btn.getBoundingClientRect();
    const margin = 6;
    const width = Math.min(r.width, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setFulfillmentMenuBox({
      top: r.bottom + margin,
      left,
      width,
    });
  }, [fulfillmentMenuOpen]);

  useLayoutEffect(() => {
    measureFulfillmentMenu();
  }, [measureFulfillmentMenu, fulfillmentMenuOpen, o.id]);

  useEffect(() => {
    if (!fulfillmentMenuOpen) return;
    window.addEventListener('resize', measureFulfillmentMenu);
    window.addEventListener('scroll', measureFulfillmentMenu, true);
    return () => {
      window.removeEventListener('resize', measureFulfillmentMenu);
      window.removeEventListener('scroll', measureFulfillmentMenu, true);
    };
  }, [fulfillmentMenuOpen, measureFulfillmentMenu]);

  useEffect(() => {
    if (!fulfillmentMenuOpen) return;
    function onDocMouseDown(ev: MouseEvent) {
      const t = ev.target as Node;
      if (fulfillmentBtnRef.current?.contains(t)) return;
      if (fulfillmentPortalRef.current?.contains(t)) return;
      setFulfillmentMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [fulfillmentMenuOpen]);

  async function updateFulfillment(next: OrderFulfillmentStatus) {
    if (next === normalizeOrderFulfillment(o)) return;
    setActionError('');
    setFulfillmentUpdating(true);
    try {
      const updated = await api<Order>(`/api/orders/${encodeURIComponent(o.id)}/fulfillment`, {
        method: 'PATCH',
        body: { fulfillmentStatus: next },
      });
      onPatched(updated);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setFulfillmentUpdating(false);
    }
  }

  const downloadPdf = useCallback(async () => {
    setActionError('');
    setPdfLoading(true);
    try {
      const blob = await fetchAuthorizedBlob(`/api/orders/${encodeURIComponent(o.id)}/invoice`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${o.id.slice(-8).toUpperCase()}.pdf`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setPdfLoading(false);
    }
  }, [o.id]);

  async function savePaymentDetails() {
    setActionError('');
    setSavingPayment(true);
    try {
      const updated = await api<Order>(`/api/orders/${encodeURIComponent(o.id)}/payment-details`, {
        method: 'PATCH',
        body: { sellerPaymentDetails: paymentDraft },
      });
      onPatched(updated);
      toast.success(t('dashboard.orders.savedSuccess'));
      setPaymentSaved(true);
      window.setTimeout(() => setPaymentSaved(false), 2500);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setSavingPayment(false);
    }
  }

  async function saveTracking() {
    setActionError('');
    setSavingTracking(true);
    try {
      const updated = await api<Order>(`/api/orders/${encodeURIComponent(o.id)}/tracking`, {
        method: 'PATCH',
        body: { trackingNumber: trackingDraft },
      });
      onPatched(updated);
      toast.success(t('dashboard.orders.savedSuccess'));
      setTrackingSaved(true);
      window.setTimeout(() => setTrackingSaved(false), 2500);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setSavingTracking(false);
    }
  }

  async function markPaid() {
    setActionError('');
    setMarkingPaid(true);
    try {
      const updated = await api<Order>(`/api/orders/${encodeURIComponent(o.id)}/mark-paid`, { method: 'PATCH' });
      onPatched(updated);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setMarkingPaid(false);
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (fulfillmentMenuOpen) {
        setFulfillmentMenuOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, fulfillmentMenuOpen]);

  const awaiting = o.pendingPayment === true;

  return (
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end max-lg:justify-center max-lg:p-0 lg:items-center lg:justify-center lg:p-4 bg-black/55 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[min(92vh,100%)] lg:max-h-[92vh] overflow-hidden rounded-t-2xl lg:rounded-3xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 max-lg:px-4 sm:px-8 sm:py-5 border-b border-stone-200 dark:border-zinc-700 bg-gradient-to-r from-brand-50/80 via-white to-brand-50/60 dark:from-brand-950/30 dark:via-zinc-900 dark:to-brand-950/25 shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-stone-900 dark:text-zinc-100 text-base max-lg:text-base sm:text-xl break-all">
              {t('dashboard.orders.dialogOrder', { id: o.id.slice(-8).toUpperCase() })}
            </h3>
            <p className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
              <Calendar className="w-4 h-4 text-stone-400 dark:text-zinc-500" />
              {new Date(o.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9 sm:h-10 sm:w-10`}
            aria-label={t('dashboard.common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 max-lg:px-4 sm:px-8 sm:py-6 space-y-4 max-lg:space-y-4 sm:space-y-6 bg-stone-50/40 dark:bg-zinc-900/40 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 shadow-sm">
              <span className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-zinc-800 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0 ring-1 ring-brand-200/80 dark:ring-brand-700/40">
                <User className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.customer')}</p>
                <p className="font-medium text-stone-900 dark:text-zinc-100 break-words">{o.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 shadow-sm">
              <span className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-zinc-800 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0 ring-1 ring-brand-200/80 dark:ring-brand-700/40">
                <Phone className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.phone')}</p>
                <p className="font-medium text-stone-900 dark:text-zinc-100 break-all">{o.customerPhone}</p>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-brand-100 dark:border-brand-900/40 shadow-sm">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.total')}</p>
                <p className="font-bold text-brand-700 dark:text-brand-400 text-lg sm:text-xl tabular-nums break-words">
                  {formatPrice(o.totalAmount, userCurrency)}
                </p>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                  {t('dashboard.orders.subtotalDelivery', {
                    sub: formatPrice(o.subtotalAmount ?? Math.max(0, o.totalAmount - (o.deliveryAmount ?? 0)), userCurrency),
                    del: formatPrice(o.deliveryAmount ?? 0, userCurrency),
                  })}
                </p>
              </div>
              <span className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-zinc-800 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0 ring-1 ring-brand-200/80 dark:ring-brand-700/40">
                <Banknote className="w-5 h-5" />
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 shadow-sm">
            <span className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-zinc-800 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0 ring-1 ring-brand-200/80 dark:ring-brand-700/40">
              <MapPin className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-1">{t('dashboard.orders.address')}</p>
              <p className="text-sm text-stone-800 dark:text-zinc-200">{o.customerAddress}</p>
              {o.customerEmail && (
                <p className="text-sm text-brand-700 dark:text-brand-400 mt-1 break-all">{o.customerEmail}</p>
              )}
              {o.isManual && (
                <span className="inline-block mt-2 text-xs font-semibold text-amber-800 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-200 px-2 py-0.5 rounded-full">
                  {t('dashboard.orders.manualBadge')}
                </span>
              )}
            </div>
          </div>
          {(o.discountAmount ?? 0) > 0 && (
            <p className="text-sm text-brand-700 dark:text-brand-400 font-medium">
              {t('dashboard.orders.discountLine', {
                amount: formatPrice(o.discountAmount ?? 0, userCurrency),
                code: o.couponCode ? ` (${o.couponCode})` : '',
              })}
            </p>
          )}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.trackingNumber')}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={trackingDraft}
                onChange={(e) => setTrackingDraft(e.target.value)}
                placeholder={t('dashboard.orders.trackingPh')}
                className={`${DASHBOARD_INPUT} flex-1 text-sm`}
              />
              <button
                type="button"
                onClick={saveTracking}
                disabled={savingTracking}
                className={`inline-flex items-center justify-center gap-2 shrink-0 !px-4 !py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  trackingSaved
                    ? 'bg-brand-600 text-white scale-[0.98] shadow-inner'
                    : `${DASHBOARD_BTN_PRIMARY} disabled:opacity-60`
                }`}
              >
                {savingTracking ? (
                  <AdminLoadingInline light dotsOnly />
                ) : trackingSaved ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : null}
                {savingTracking
                  ? t('dashboard.common.saving')
                  : trackingSaved
                    ? t('dashboard.orders.saved')
                    : t('dashboard.common.save')}
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
            <FieldTitleWithHelp
              title={t('dashboard.orders.deliveryStatus')}
              help={t('dashboard.orders.deliveryHint')}
              titleClassName="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400"
              className="mb-2"
            />
            <div className="relative">
              <button
                ref={fulfillmentBtnRef}
                type="button"
                disabled={fulfillmentUpdating}
                aria-expanded={fulfillmentMenuOpen}
                aria-haspopup="listbox"
                aria-label={t('dashboard.orders.deliveryStatusAria')}
                onClick={() => setFulfillmentMenuOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-left text-sm font-semibold text-stone-800 dark:text-zinc-200 shadow-sm transition-colors hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-55 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 focus-visible:border-brand-400"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Package className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  <span className="truncate">{fulfillmentLabel(normalizeOrderFulfillment(o))}</span>
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-stone-500 dark:text-zinc-400 transition-transform ${fulfillmentMenuOpen ? 'rotate-180' : ''}`} aria-hidden />
              </button>
            </div>
            {typeof document !== 'undefined' &&
              fulfillmentMenuOpen &&
              fulfillmentMenuBox &&
              createPortal(
                <ul
                  ref={fulfillmentPortalRef}
                  role="listbox"
                  style={{
                    position: 'fixed',
                    top: fulfillmentMenuBox.top,
                    left: fulfillmentMenuBox.left,
                    width: fulfillmentMenuBox.width,
                    maxHeight: 'min(14rem, calc(100vh - 1rem))',
                  }}
                  className="z-[260] overflow-auto rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-xl"
                >
                  {FULFILLMENT_STATUSES.map((s) => {
                    const active = normalizeOrderFulfillment(o) === s;
                    return (
                      <li key={s} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          disabled={fulfillmentUpdating}
                          onClick={() => {
                            void updateFulfillment(s);
                            setFulfillmentMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                            active ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-800 dark:text-brand-300' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {fulfillmentLabel(s)}
                        </button>
                      </li>
                    );
                  })}
                </ul>,
                document.body
              )}
          </div>
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="bg-stone-50 dark:bg-zinc-950 px-5 py-3 border-b border-stone-200 dark:border-zinc-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.orderItems')}</p>
            </div>
            <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
              {o.items.map((item, i) => {
                const itemImage =
                  item.productImage ??
                  productImageById[String(item.productId)] ??
                  productImageByName[String(item.productName ?? '').trim().toLowerCase()] ??
                  null;
                return (
                <li key={i} className="px-5 py-4">
                  <div className="relative overflow-hidden rounded-xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="p-3.5">
                      <div className="flex items-start gap-3">
                        {itemImage ? (
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                            <img
                              src={getProductImageDisplayUrl(itemImage)}
                              alt={item.productName}
                              className="absolute inset-0 h-full w-full object-contain"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <p className="text-base sm:text-sm font-semibold text-stone-900 dark:text-zinc-100 break-words min-w-0 flex-1">
                              {item.productName}
                            </p>
                            <div className="flex items-center justify-between gap-3 sm:justify-end sm:shrink-0">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-zinc-800/90 text-stone-600 dark:text-zinc-400">x {formatQuantity(item.quantity)}</span>
                              <span className="font-semibold text-stone-800 dark:text-zinc-200 tabular-nums">{formatPrice(item.price * item.quantity, userCurrency)}</span>
                            </div>
                          </div>
                          {(item.selectedOptions && Object.keys(item.selectedOptions).length > 0) || item.customerMessage ? (
                            <div className="mt-2 text-xs text-stone-600 dark:text-zinc-400">
                              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                <span>{Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>
                              )}
                              {item.customerMessage && <span className="block mt-0.5 break-words">{item.customerMessage}</span>}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="bg-stone-50 dark:bg-zinc-950 px-5 py-3 border-b border-stone-200 dark:border-zinc-700 rounded-t-2xl">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">{t('dashboard.orders.paymentInvoice')}</p>
                <FieldHelpButton text={t('dashboard.orders.paymentInvoiceHelp')} align="end" />
              </div>
            </div>
            <div className="p-5 space-y-4 rounded-b-2xl bg-white dark:bg-zinc-900">
              {!awaiting && (
                <p className="text-sm text-stone-600 dark:text-zinc-400">
                  {o.paidAt
                    ? t('dashboard.orders.markedPaidOn', {
                        date: new Date(o.paidAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
                      })
                    : t('dashboard.orders.legacyPaid')}
                </p>
              )}
              <div>
                <label htmlFor="order-payment-details" className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2">
                  {t('dashboard.orders.paymentInstructions')}
                </label>
                <textarea
                  id="order-payment-details"
                  value={paymentDraft}
                  onChange={(e) => setPaymentDraft(e.target.value)}
                  rows={5}
                  placeholder={t('dashboard.orders.bankDetailsPh')}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 outline-none resize-y min-h-[120px]"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={savePaymentDetails}
                  disabled={savingPayment}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-60 ${
                    paymentSaved
                      ? 'bg-brand-600 text-white scale-[0.98] shadow-inner'
                      : 'text-white bg-brand-600 hover:bg-brand-500'
                  }`}
                >
                  {savingPayment ? <AdminLoadingInline light dotsOnly /> : paymentSaved ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : null}
                  {savingPayment
                    ? t('dashboard.common.saving')
                    : paymentSaved
                      ? t('dashboard.orders.saved')
                      : t('dashboard.orders.savePaymentDetails')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-4 border-t border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0 space-y-3">
          {actionError ? <p className="text-sm text-red-600 dark:text-red-400 text-center">{actionError}</p> : null}
          <div className={`grid gap-2 ${awaiting ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <button
              type="button"
              onClick={() => void downloadPdf()}
              disabled={pdfLoading}
              className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 rounded-xl font-semibold border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-60 text-xs sm:text-sm min-w-0"
            >
              {pdfLoading ? <AdminLoadingInline dotsOnly /> : <FileDown className="w-4 h-4 shrink-0" />}
              <span className="truncate">{pdfLoading ? t('dashboard.orders.preparingPdf') : t('dashboard.orders.downloadPdf')}</span>
            </button>
            {awaiting ? (
              <button
                type="button"
                onClick={markPaid}
                disabled={markingPaid}
                className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-xs sm:text-sm min-w-0"
              >
                {markingPaid ? <AdminLoadingInline light dotsOnly /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span className="truncate">{markingPaid ? t('dashboard.orders.updating') : t('dashboard.orders.paymentReceived')}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 rounded-xl font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/35 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs sm:text-sm min-w-0"
            >
              {t('dashboard.common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
