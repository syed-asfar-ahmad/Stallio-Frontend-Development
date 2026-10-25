// ============================================================================
// Stallio Affiliate Domain Models & API Types
// ============================================================================

export type AffiliateStatus = 'active' | 'suspended';

export type ReferralStatus =
  | 'pending_verification'
  | 'verified'
  | 'trial'
  | 'paid'
  | 'churned'
  | 'rejected';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'reversed';

export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'failed';

export type PayoutMethodType = 'bank_transfer' | 'paypal' | 'wise';

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  status: AffiliateStatus;
  primaryCode: string;
  referralLink: string;
  termsAcceptedAt: string;
  createdAt: string;
  aliasCodes?: string[];
}

export interface AffiliateProgramSettings {
  rateBps: number;              // 2000 = 20%
  holdPeriodDays: number;       // 30
  payDeadlineDays: number;      // 90
  minimumPayoutCents: number;   // 5000 = $50.00
  customReservedWords?: string[]; // admin-managed additions to the reserved slug list
}

export interface ReferralItem {
  id: string;
  affiliateId: string;
  shopName: string;
  maskedEmail: string;          // e.g. "a***@gmail.com"
  codeUsed: string;
  status: ReferralStatus;
  flagReason?: string | null;
  signedUpAt: string;
  verifiedAt?: string | null;
  trialEndsAt: string;
  paidAt?: string | null;
  payDeadlineAt: string;
}

export interface CommissionItem {
  id: string;
  referralId: string;
  affiliateId: string;
  shopName: string;
  planName: string;             // "Basic Monthly" | "Business Yearly"
  baseAmountCents: number;      // e.g. 500 ($5.00)
  rateBps: number;              // e.g. 2000 (20%)
  amountCents: number;          // e.g. 100 ($1.00)
  status: CommissionStatus;
  holdUntil: string;
  approvedAt?: string | null;
  payoutId?: string | null;
  reversedAt?: string | null;
  reversalReason?: string | null;
  createdAt: string;
}

export interface PayoutItem {
  id: string;
  affiliateId: string;
  amountCents: number;
  method: PayoutMethodType;
  last4: string;
  status: PayoutStatus;
  batchId?: string | null;
  paidAt?: string | null;
  reference?: string | null;
  createdAt: string;
}

export interface PayoutMethod {
  id: string;
  type: PayoutMethodType;
  last4: string;
  detailsSummary?: string;
  updatedAt: string;
}

export interface AffiliateDailyStat {
  day: string;
  clicks: number;
  uniqueClicks: number;
  signups: number;
  verified: number;
  paid: number;
}

export interface AffiliateStatsSummary {
  clicks: number;
  uniqueClicks: number;
  signups: number;
  verified: number;
  trials: number;
  paid: number;
  pendingEarningsCents: number;
  approvedEarningsCents: number;
  paidEarningsCents: number;
  balanceCents: number;
}

export interface AffiliateStatsResponse {
  summary: AffiliateStatsSummary;
  series: AffiliateDailyStat[];
  settings: AffiliateProgramSettings;
}

// ============================================================================
// Admin Governance (Phase 4)
// ============================================================================

export type ReferralReviewAction = 'approve' | 'reject' | 'reassign';

export type PayoutBatchStatus = 'processing' | 'paid';

export interface AdminPayoutDestination {
  type: PayoutMethodType;
  last4: string;
  /** Full destination (IBAN / PayPal email / Wise email). Admin-only; used in the CSV export. */
  destination: string;
}

export interface AdminAffiliateMetrics {
  clicks: number;
  referrals: number;
  trials: number;
  paid: number;
  flagged: number;
  pendingCents: number;
  approvedCents: number;
  paidCents: number;
  reversedCents: number;
}

export interface AdminAffiliate extends Affiliate {
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  payoutMethod: AdminPayoutDestination | null;
  metrics: AdminAffiliateMetrics;
}

export interface AdminReferral extends ReferralItem {
  affiliateName: string;
  affiliateHandle: string;
  sellerEmail: string;
  sellerUsername: string;
  paidPlan?: 'monthly' | 'yearly' | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  commission?: { id: string; amountCents: number; status: CommissionStatus } | null;
}

export interface AdminCommission extends CommissionItem {
  affiliateName: string;
  affiliateHandle: string;
  payoutBatchId?: string | null;
}

export interface PayoutBatchItem {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  method: PayoutMethodType;
  destination: string;
  last4: string;
  amountCents: number;
  commissionIds: string[];
}

export interface PayoutBatch {
  id: string;
  label: string;
  status: PayoutBatchStatus;
  createdAt: string;
  paidAt?: string | null;
  reference?: string | null;
  totalCents: number;
  items: PayoutBatchItem[];
}

export interface PayoutCandidate {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  affiliateHandle: string;
  method: PayoutMethodType | null;
  last4: string | null;
  approvedCents: number;
  commissionCount: number;
  /** meets threshold AND has a payout method AND is active */
  eligible: boolean;
  blockedReason?: 'below_threshold' | 'no_payout_method' | 'suspended' | null;
}

/** Attribution resolved for a seller (used by the AdminSubscriptions hooks). */
export interface SubscriptionReferralAttribution {
  referralId: string;
  affiliateId: string;
  handle: string;
  name: string;
  rateBps: number;
  affiliateActive: boolean;
  payDeadlineAt: string;
  /** a commission has already been issued for this referral */
  commissionIssued: boolean;
}
