import { useEffect } from 'react';
import { format } from 'date-fns';
import { Banknote, Calendar, CheckCircle2, Clock, MapPin, Phone, User, X } from 'lucide-react';
import { adminTheme } from './adminTheme';
import type { AdminSellerFull } from '../../types/admin';
import { formatPrice } from '../../lib/countryCurrencyOptions';
import AdminOrderFulfillmentBadge, { normalizeOrderFulfillment } from './AdminOrderFulfillmentBadge';
import { DASHBOARD_ICON_CLOSE_BTN } from '../../lib/dashboardFormClasses';

type AdminOrder = AdminSellerFull['orders'][0];

type Props = {
  order: AdminOrder;
  currencyCode?: string | null;
  onClose: () => void;
};

export default function AdminOrderViewDialog({ order: o, currencyCode, onClose }: Props) {
  const fulfillment = normalizeOrderFulfillment(o.fulfillmentStatus);
  const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end lg:items-center justify-center bg-black/55 p-0 max-lg:p-0 lg:p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl max-lg:max-w-none max-lg:max-h-[min(92vh,100dvh)] flex-col overflow-hidden max-lg:rounded-t-2xl max-lg:rounded-b-none lg:rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 max-lg:gap-3 lg:gap-4 border-b border-stone-200 bg-gradient-to-r from-brand-50/80 via-white to-brand-50/60 px-4 py-4 max-lg:px-4 max-lg:py-4 lg:px-6 lg:py-5 dark:border-zinc-700 dark:from-brand-950/30 dark:via-zinc-900 dark:to-brand-950/25 lg:px-8">
          <div className="min-w-0">
            <h3 className="break-all text-lg max-lg:text-lg lg:text-xl font-bold text-stone-900 dark:text-zinc-100">
              Order #{o.id.slice(-8).toUpperCase()}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500 dark:text-zinc-400">
              <Calendar className="h-4 w-4 text-stone-400 dark:text-zinc-500" />
              {format(new Date(o.createdAt), 'MMM d, yyyy, h:mm a')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-10 w-10`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 max-lg:space-y-4 lg:space-y-6 overflow-y-auto bg-stone-50/40 px-4 py-4 max-lg:px-4 max-lg:py-4 lg:px-6 lg:py-6 dark:bg-zinc-900/40 lg:px-8">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-700/40">
                <User className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Customer</p>
                <p className="break-words font-medium text-stone-900 dark:text-zinc-100">{o.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-700/40">
                <Phone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Phone</p>
                <p className="break-all font-medium text-stone-900 dark:text-zinc-100">{o.customerPhone}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-3.5 shadow-sm dark:border-brand-900/40 dark:bg-zinc-900 lg:col-span-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Total</p>
                <p className="break-words text-lg font-bold tabular-nums text-brand-700 dark:text-brand-400 sm:text-xl">
                  {formatPrice(o.totalAmount, currencyCode)}
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-700/40">
                <Banknote className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-700/40">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Address</p>
              <p className="text-sm text-stone-800 dark:text-zinc-200">{o.customerAddress}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {o.pendingPayment ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/45 dark:text-amber-200">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden /> Awaiting payment
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-950/45 dark:text-brand-200">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden /> Paid
              </span>
            )}
            <AdminOrderFulfillmentBadge status={fulfillment} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="border-b border-stone-200 bg-stone-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Order items ({itemCount})
              </p>
            </div>
            <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
              {o.items.map((item, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm">
                  <span className="font-medium text-stone-900 dark:text-zinc-100">{item.productName}</span>
                  <span className="tabular-nums text-stone-600 dark:text-zinc-400">
                    × {item.quantity}, {formatPrice(item.price * item.quantity, currencyCode)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 border-t border-stone-200 bg-stone-50/30 px-4 py-3 max-lg:px-4 max-lg:py-3 lg:justify-end lg:px-6 lg:py-4 dark:border-zinc-800 dark:bg-zinc-950/90 lg:px-8">
          <button type="button" onClick={onClose} className={`w-full max-lg:w-full lg:w-auto ${adminTheme.btnSecondary}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
