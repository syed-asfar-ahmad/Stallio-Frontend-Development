import { Ban, CheckCircle2, Package, Truck } from 'lucide-react';
import type { OrderFulfillmentStatus } from '../../types';

const FULFILLMENT_STATUSES: OrderFulfillmentStatus[] = ['pending', 'shipped', 'delivered', 'cancelled'];

const LABELS: Record<OrderFulfillmentStatus, string> = {
  pending: 'Pending',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function normalizeOrderFulfillment(status: string | undefined): OrderFulfillmentStatus {
  const s = status as OrderFulfillmentStatus | 'processing' | undefined;
  if (s === 'processing') return 'pending';
  return FULFILLMENT_STATUSES.includes(s as OrderFulfillmentStatus) ? (s as OrderFulfillmentStatus) : 'pending';
}

export default function AdminOrderFulfillmentBadge({ status }: { status: OrderFulfillmentStatus }) {
  const label = LABELS[status];
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap';
  switch (status) {
    case 'pending':
      return (
        <span className={`${base} bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300`}>
          <Package className="h-3.5 w-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    case 'shipped':
      return (
        <span className={`${base} bg-indigo-100 dark:bg-indigo-950/45 text-indigo-900 dark:text-indigo-200`}>
          <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    case 'delivered':
      return (
        <span className={`${base} bg-brand-100 dark:bg-brand-950/45 text-brand-800 dark:text-brand-200`}>
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    case 'cancelled':
      return (
        <span className={`${base} bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200`}>
          <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden /> {label}
        </span>
      );
    default:
      return null;
  }
}
