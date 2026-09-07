import { format } from 'date-fns';
import { CheckCircle2, Clock, Eye } from 'lucide-react';
import type { AdminSellerFull } from '../../types/admin';
import { formatPrice } from '../../lib/countryCurrencyOptions';
import AdminPagination from './AdminPagination';
import AdminOrderFulfillmentBadge, { normalizeOrderFulfillment } from './AdminOrderFulfillmentBadge';
import { adminTheme } from './adminTheme';

type AdminOrder = AdminSellerFull['orders'][0];

type Props = {
  orders: AdminOrder[];
  paginatedOrders: AdminOrder[];
  ordersPage: number;
  ordersPageLimit: number;
  currencyCode?: string | null;
  onOrdersPageChange: (page: number) => void;
  onViewOrder: (order: AdminOrder) => void;
};

export default function AdminSellerOrdersTab({
  orders,
  paginatedOrders,
  ordersPage,
  ordersPageLimit,
  currencyCode,
  onOrdersPageChange,
  onViewOrder,
}: Props) {
  if (orders.length === 0) {
    return <p className={adminTheme.muted}>No orders</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-zinc-600/80 dark:bg-zinc-900">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 dark:border-zinc-700 dark:bg-zinc-800/80">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Order</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Customer</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Items</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Total</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Payment</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Delivery</th>
                <th className="w-24 px-5 py-3.5" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {paginatedOrders.map((o) => {
                const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <tr key={o.id} className="bg-white transition-colors hover:bg-stone-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3">
                      <span className="font-mono font-semibold text-stone-900 dark:text-zinc-100">#{o.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-stone-600 dark:text-zinc-400">
                      {format(new Date(o.createdAt), 'MMM d, yyyy, HH:mm')}
                    </td>
                    <td className="px-5 py-3 font-medium text-stone-800 dark:text-zinc-200">{o.customerName}</td>
                    <td className="px-5 py-3 text-sm tabular-nums text-stone-600 dark:text-zinc-400">{itemCount}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-stone-900 dark:text-zinc-100">
                      {formatPrice(o.totalAmount, currencyCode)}
                    </td>
                    <td className="px-5 py-3">
                      {o.pendingPayment ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/45 dark:text-amber-200">
                          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden /> Awaiting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-950/45 dark:text-brand-200">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden /> Paid
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <AdminOrderFulfillmentBadge status={normalizeOrderFulfillment(o.fulfillmentStatus)} />
                    </td>
                    <td className="px-5 py-2">
                      <button
                        type="button"
                        onClick={() => onViewOrder(o)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-950/40"
                        title="View order details"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-zinc-800 lg:hidden">
          {paginatedOrders.map((o) => {
            const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <span className="font-mono font-semibold text-stone-900 dark:text-zinc-100">#{o.id.slice(-8).toUpperCase()}</span>
                  <p className="mt-0.5 text-sm text-stone-600 dark:text-zinc-400">{o.customerName}</p>
                  <p className="text-xs text-stone-500 dark:text-zinc-400">
                    {format(new Date(o.createdAt), 'MMM d, yyyy')}, {itemCount} items, {formatPrice(o.totalAmount, currencyCode)} ·{' '}
                    {o.pendingPayment ? 'Awaiting' : 'Paid'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewOrder(o)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                >
                  <Eye className="h-4 w-4" /> View
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <AdminPagination page={ordersPage} total={orders.length} limit={ordersPageLimit} onPage={onOrdersPageChange} />
    </div>
  );
}
