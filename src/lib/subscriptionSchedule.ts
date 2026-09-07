import type { SubscriptionPlan } from './subscriptionPricing';

export type SubscriptionBillingStatus =
  | 'never_paid'
  | 'paid_this_month'
  | 'overdue'
  | 'due'
  | 'upcoming';

export function subscriptionBillingStatusLabel(status: SubscriptionBillingStatus): string {
  switch (status) {
    case 'never_paid':
      return 'Never Paid';
    case 'paid_this_month':
      return 'Paid This Month';
    case 'overdue':
      return 'Overdue';
    case 'due':
      return 'Due';
    case 'upcoming':
      return 'Upcoming';
    default:
      return status;
  }
}

export function subscriptionBillingStatusClass(status: SubscriptionBillingStatus): string {
  switch (status) {
    case 'paid_this_month':
      return 'bg-brand-100 text-brand-800 dark:bg-brand-950/40 dark:text-brand-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300';
    case 'due':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200';
    case 'upcoming':
      return 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300';
    case 'never_paid':
    default:
      return 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400';
  }
}

export function formatNextDueHint(_plan: SubscriptionPlan | null, nextDueAt: string | null): string {
  if (!nextDueAt) return '-';
  const d = new Date(nextDueAt);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
