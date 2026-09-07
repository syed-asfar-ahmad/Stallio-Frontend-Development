export type SubscriptionPlan = 'monthly' | 'yearly';

export const SUBSCRIPTION_USD_MONTHLY = 5;
export const SUBSCRIPTION_USD_YEARLY = 50;

export function subscriptionAmountForPlan(plan: SubscriptionPlan): number {
  return plan === 'yearly' ? SUBSCRIPTION_USD_YEARLY : SUBSCRIPTION_USD_MONTHLY;
}

export function subscriptionPlanLabel(plan: SubscriptionPlan): string {
  return plan === 'yearly' ? 'Yearly' : 'Monthly';
}
