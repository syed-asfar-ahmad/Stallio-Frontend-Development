// ============================================================================
// Stallio Affiliate Mock Service & Data Engine
// ============================================================================

import type {
  Affiliate,
  AffiliateProgramSettings,
  ReferralItem,
  CommissionItem,
  PayoutItem,
  PayoutMethod,
  AffiliateStatsResponse,
} from './types';
import { generateAffiliateCode, isReservedSlug } from '../lib/reservedWords';

const MOCK_STORAGE_PREFIX = 'stallio_affiliate_mock_';

export const DEFAULT_PROGRAM_SETTINGS: AffiliateProgramSettings = {
  rateBps: 2000,              // 20%
  holdPeriodDays: 30,         // 30 days hold
  payDeadlineDays: 90,        // 90 days qualification deadline
  minimumPayoutCents: 5000,   // $50.00 minimum payout threshold
};

export const INITIAL_MOCK_AFFILIATE: Affiliate = {
  id: 'aff_sarah_01',
  name: 'Sarah Jenkins',
  email: 'sarah@example.com',
  status: 'active',
  primaryCode: 'sarah25',
  referralLink: 'https://stallio.shop/r/sarah25',
  aliasCodes: ['sarah-jenkins', 'sj-launch'],
  termsAcceptedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
};

export const INITIAL_MOCK_REFERRALS: ReferralItem[] = [
  {
    id: 'ref_01',
    affiliateId: 'aff_sarah_01',
    shopName: 'Artisan Bloom Studio',
    maskedEmail: 'a***@gmail.com',
    codeUsed: 'sarah25',
    status: 'paid',
    signedUpAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 39 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() + 50 * 86400000).toISOString(),
  },
  {
    id: 'ref_02',
    affiliateId: 'aff_sarah_01',
    shopName: 'Urban Coffee Roasters',
    maskedEmail: 'u***@outlook.com',
    codeUsed: 'sarah25',
    status: 'paid',
    signedUpAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() + 55 * 86400000).toISOString(),
  },
  {
    id: 'ref_03',
    affiliateId: 'aff_sarah_01',
    shopName: 'Nordic Minimal Living',
    maskedEmail: 'n***@gmail.com',
    codeUsed: 'sarah25',
    status: 'trial',
    signedUpAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() + 16 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() + 76 * 86400000).toISOString(),
  },
  {
    id: 'ref_04',
    affiliateId: 'aff_sarah_01',
    shopName: 'Velvet Moon Apothecary',
    maskedEmail: 'v***@yahoo.com',
    codeUsed: 'sarah25',
    status: 'trial',
    signedUpAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() + 22 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() + 82 * 86400000).toISOString(),
  },
  {
    id: 'ref_05',
    affiliateId: 'aff_sarah_01',
    shopName: 'Terra Ceramics',
    maskedEmail: 't***@gmail.com',
    codeUsed: 'sarah25',
    status: 'verified',
    signedUpAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() + 28 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() + 88 * 86400000).toISOString(),
  },
  {
    id: 'ref_06',
    affiliateId: 'aff_sarah_01',
    shopName: 'Coastal Crafted Jewels',
    maskedEmail: 'c***@icloud.com',
    codeUsed: 'sarah25',
    status: 'pending_verification',
    signedUpAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() + 29 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() + 89 * 86400000).toISOString(),
  },
  {
    id: 'ref_07',
    affiliateId: 'aff_sarah_01',
    shopName: 'Solstice Botanical Tea',
    maskedEmail: 's***@gmail.com',
    codeUsed: 'sarah25',
    status: 'churned',
    signedUpAt: new Date(Date.now() - 95 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 95 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() - 65 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'ref_08',
    affiliateId: 'aff_sarah_01',
    shopName: 'Apex Gaming Accessories',
    maskedEmail: 'a***@proton.me',
    codeUsed: 'sarah25',
    status: 'rejected',
    flagReason: 'Self-referral detected: common IP and payout device footprint.',
    signedUpAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    trialEndsAt: new Date(Date.now() + 10 * 86400000).toISOString(),
    payDeadlineAt: new Date(Date.now() + 70 * 86400000).toISOString(),
  },
];

export const INITIAL_MOCK_COMMISSIONS: CommissionItem[] = [
  {
    id: 'comm_01',
    referralId: 'ref_01',
    affiliateId: 'aff_sarah_01',
    shopName: 'Artisan Bloom Studio',
    planName: 'Basic Monthly ($5/mo)',
    baseAmountCents: 500,
    rateBps: 2000,
    amountCents: 100, // 20% of $5 = $1
    status: 'paid',
    holdUntil: new Date(Date.now() - 15 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    payoutId: 'payout_01',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'comm_02',
    referralId: 'ref_02',
    affiliateId: 'aff_sarah_01',
    shopName: 'Urban Coffee Roasters',
    planName: 'Business Yearly ($50/yr)',
    baseAmountCents: 5000,
    rateBps: 2000,
    amountCents: 1000, // 20% of $50 = $10
    status: 'approved',
    holdUntil: new Date(Date.now() - 2 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 32 * 86400000).toISOString(),
  },
  {
    id: 'comm_03',
    referralId: 'ref_extra_01',
    affiliateId: 'aff_sarah_01',
    shopName: 'Komorebi Paper Goods',
    planName: 'Business Yearly ($50/yr)',
    baseAmountCents: 5000,
    rateBps: 2000,
    amountCents: 1000,
    status: 'pending',
    holdUntil: new Date(Date.now() + 18 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'comm_04',
    referralId: 'ref_extra_02',
    affiliateId: 'aff_sarah_01',
    shopName: 'Saffron Silk Boutique',
    planName: 'Basic Monthly ($5/mo)',
    baseAmountCents: 500,
    rateBps: 2000,
    amountCents: 100,
    status: 'reversed',
    holdUntil: new Date(Date.now() + 5 * 86400000).toISOString(),
    reversedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reversalReason: 'Payment refunded by administrative approval.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

export const INITIAL_MOCK_PAYOUTS: PayoutItem[] = [
  {
    id: 'payout_01',
    affiliateId: 'aff_sarah_01',
    amountCents: 4500, // $45.00
    method: 'bank_transfer',
    last4: '4892',
    status: 'paid',
    batchId: 'BATCH_2026_09',
    paidAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    reference: 'ACH_STL_9823412',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
];

export const INITIAL_MOCK_PAYOUT_METHOD: PayoutMethod = {
  id: 'pm_01',
  type: 'bank_transfer',
  last4: '4892',
  detailsSummary: 'Chase Bank Checking (Ending in 4892)',
  updatedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
};

class AffiliateMockDatabase {
  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(MOCK_STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MOCK_STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  }

  getAffiliate(): Affiliate {
    return this.get<Affiliate>('affiliate', INITIAL_MOCK_AFFILIATE);
  }

  updateAffiliate(patch: Partial<Affiliate>): Affiliate {
    const current = this.getAffiliate();
    let aliasCodes = [...(current.aliasCodes || [])];
    if (patch.primaryCode && patch.primaryCode !== current.primaryCode) {
      if (!aliasCodes.includes(current.primaryCode)) {
        aliasCodes = [current.primaryCode, ...aliasCodes];
      }
    }
    const updated = { ...current, ...patch, aliasCodes };
    this.set('affiliate', updated);
    return updated;
  }

  getReferrals(): ReferralItem[] {
    return this.get<ReferralItem[]>('referrals', INITIAL_MOCK_REFERRALS);
  }

  getCommissions(): CommissionItem[] {
    return this.get<CommissionItem[]>('commissions', INITIAL_MOCK_COMMISSIONS);
  }

  getPayouts(): PayoutItem[] {
    return this.get<PayoutItem[]>('payouts', INITIAL_MOCK_PAYOUTS);
  }

  getPayoutMethod(): PayoutMethod {
    return this.get<PayoutMethod>('payout_method', INITIAL_MOCK_PAYOUT_METHOD);
  }

  updatePayoutMethod(type: PayoutMethod['type'], last4: string, summary: string): PayoutMethod {
    const updated: PayoutMethod = {
      id: 'pm_' + Date.now(),
      type,
      last4,
      detailsSummary: summary,
      updatedAt: new Date().toISOString(),
    };
    this.set('payout_method', updated);
    return updated;
  }

  getStats(rangeDays = 30): AffiliateStatsResponse {
    const affiliate = this.getAffiliate();
    const referrals = this.getReferrals();
    const commissions = this.getCommissions();

    const pendingEarningsCents = commissions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.amountCents, 0);

    const approvedEarningsCents = commissions
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + c.amountCents, 0);

    const paidEarningsCents = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.amountCents, 0);

    // Generate daily time series for the specified range
    const series = [];
    const now = Date.now();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dayStr = d.toISOString().slice(0, 10);
      const seed = (d.getDate() * 7 + i * 3) % 19;
      series.push({
        day: dayStr,
        clicks: 12 + seed,
        uniqueClicks: 8 + (seed % 7),
        signups: seed % 4 === 0 ? 1 : seed % 7 === 0 ? 2 : 0,
        verified: seed % 5 === 0 ? 1 : 0,
        paid: seed === 11 ? 1 : 0,
      });
    }

    const totalClicks = series.reduce((sum, s) => sum + s.clicks, 0);
    const totalUniqueClicks = series.reduce((sum, s) => sum + s.uniqueClicks, 0);
    const totalSignups = referrals.length;
    const totalTrials = referrals.filter((r) => r.status === 'trial').length;
    const totalPaid = referrals.filter((r) => r.status === 'paid').length;

    return {
      summary: {
        clicks: totalClicks,
        uniqueClicks: totalUniqueClicks,
        signups: totalSignups,
        verified: referrals.filter((r) => r.status === 'verified').length,
        trials: totalTrials,
        paid: totalPaid,
        pendingEarningsCents,
        approvedEarningsCents,
        paidEarningsCents,
        balanceCents: approvedEarningsCents,
      },
      series,
      settings: DEFAULT_PROGRAM_SETTINGS,
    };
  }
}

export const mockAffiliateDb = new AffiliateMockDatabase();
