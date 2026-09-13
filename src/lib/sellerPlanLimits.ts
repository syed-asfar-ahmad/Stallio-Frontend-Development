export type SellerPlanTier = 'basic' | 'business';

export type SellerPlanLimits = {
  maxImagesPerProduct: number;
  maxProducts: number;
  maxCategories: number;
  maxOrders: number | null;
};

export const SELLER_PLAN_LIMITS: Record<SellerPlanTier, SellerPlanLimits> = {
  basic: {
    maxImagesPerProduct: 2,
    maxProducts: 25,
    maxCategories: 5,
    maxOrders: 70,
  },
  business: {
    maxImagesPerProduct: 5,
    maxProducts: 70,
    maxCategories: 20,
    maxOrders: null,
  },
};

export function getSellerPlanTier(plan?: string | null): SellerPlanTier {
  return plan === 'business' ? 'business' : 'basic';
}

export function getSellerPlanLimits(plan?: string | null): SellerPlanLimits {
  return SELLER_PLAN_LIMITS[getSellerPlanTier(plan)];
}

export function isAtOrOverLimit(count: number, max: number | null): boolean {
  if (max === null) return false;
  return count >= max;
}

export function remainingForLimit(count: number, max: number | null): number | null {
  if (max === null) return null;
  return Math.max(0, max - count);
}
