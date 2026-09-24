export type SellerPlanTier = 'basic' | 'business';

export type SellerPlanLimits = {
  maxImagesPerProduct: number;
  maxProducts: number;
  maxCategories: number;
  maxOrders: number | null;
  maxThemes: number;
};

export const SELLER_PLAN_LIMITS: Record<SellerPlanTier, SellerPlanLimits> = {
  basic: {
    maxImagesPerProduct: 2,
    maxProducts: 25,
    maxCategories: 5,
    maxOrders: 70,
    maxThemes: 2,
  },
  business: {
    maxImagesPerProduct: 5,
    maxProducts: 70,
    maxCategories: 20,
    maxOrders: null,
    maxThemes: 5,
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

/**
 * Returns true if the seller is on the Basic plan and can upgrade to Business.
 * Use this to gate upgrade banners / CTAs — Business plan sellers never see upgrade prompts.
 */
export function canUpgradePlan(plan?: string | null): boolean {
  return getSellerPlanTier(plan) === 'basic';
}

/**
 * Returns a 0–1 fraction of the limit used. Returns null when max is null (unlimited).
 */
export function limitFraction(count: number, max: number | null): number | null {
  if (max === null || max === 0) return null;
  return Math.min(1, count / max);
}

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
