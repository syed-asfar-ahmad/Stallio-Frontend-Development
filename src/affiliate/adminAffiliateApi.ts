
import { api } from '../lib/api';
import { adminAffiliateDb } from './adminAffiliateMock';
import type { AffiliateProgramSettings, ReferralReviewAction } from './types';

const FORCE_MOCK = import.meta.env.VITE_AFFILIATE_MOCK !== 'false';

type Options = { method?: string; body?: object };

export async function adminAffiliateApi<T>(path: string, options: Options = {}): Promise<T> {
  const { method = 'GET', body } = options;
  if (FORCE_MOCK) return handleMock<T>(path, method, body);
  try {
    return await api<T>(path, { method, body });
  } catch (err) {
    const unavailable =
      err instanceof TypeError || (err instanceof Error && /not found|bad gateway|service unavailable/i.test(err.message));
    if (import.meta.env.DEV && unavailable) return handleMock<T>(path, method, body);
    throw err;
  }
}

async function handleMock<T>(path: string, method: string, body?: unknown): Promise<T> {
  await new Promise((r) => setTimeout(r, 160));
  const [cleanPath, qs = ''] = path.split('?');
  const q = new URLSearchParams(qs);
  const p = Math.max(1, parseInt(q.get('page') || '1', 10) || 1);
  const limit = Math.max(1, parseInt(q.get('limit') || '20', 10) || 20);
  const b = (body ?? {}) as Record<string, unknown>;
  let m: RegExpMatchArray | null;

  // ---- Affiliates ----
  if (cleanPath === '/api/admin/affiliates' && method === 'GET') {
    return adminAffiliateDb.listAffiliates(q.get('q') || '', q.get('status') || 'all', p, limit) as T;
  }
  if ((m = cleanPath.match(/^\/api\/admin\/affiliates\/([^/]+)\/status$/)) && method === 'POST') {
    return {
      affiliate: adminAffiliateDb.setAffiliateStatus(m[1], b.status as 'active' | 'suspended', b.reason as string | undefined),
    } as T;
  }
  if ((m = cleanPath.match(/^\/api\/admin\/affiliates\/([^/]+)$/)) && method === 'GET') {
    return adminAffiliateDb.getAffiliate(m[1]) as T;
  }

  // ---- Referrals ----
  if (cleanPath === '/api/admin/referrals' && method === 'GET') {
    return adminAffiliateDb.listReferrals(q.get('q') || '', q.get('view') || 'all', p, limit) as T;
  }
  if ((m = cleanPath.match(/^\/api\/admin\/referrals\/([^/]+)\/review$/)) && method === 'POST') {
    return adminAffiliateDb.reviewReferral(m[1], b.action as ReferralReviewAction, {
      note: b.note as string | undefined,
      affiliateId: b.affiliateId as string | undefined,
    }) as T;
  }

  // ---- Commissions ----
  if (cleanPath === '/api/admin/commissions' && method === 'GET') {
    return adminAffiliateDb.listCommissions(q.get('q') || '', q.get('status') || 'all', p, limit) as T;
  }
  if ((m = cleanPath.match(/^\/api\/admin\/commissions\/([^/]+)\/reverse$/)) && method === 'POST') {
    return adminAffiliateDb.reverseCommission(m[1], String(b.reason ?? '')) as T;
  }

  // ---- Payouts ----
  if (cleanPath === '/api/admin/payouts' && method === 'GET') {
    return adminAffiliateDb.getPayoutOverview() as T;
  }
  if (cleanPath === '/api/admin/payouts/batches' && method === 'POST') {
    return adminAffiliateDb.generateBatch() as T;
  }
  if ((m = cleanPath.match(/^\/api\/admin\/payouts\/batches\/([^/]+)\/paid$/)) && method === 'POST') {
    return adminAffiliateDb.markBatchPaid(decodeURIComponent(m[1]), String(b.reference ?? '')) as T;
  }

  // ---- Settings ----
  if (cleanPath === '/api/admin/affiliate-settings') {
    if (method === 'PUT') return adminAffiliateDb.updateSettings(b as unknown as AffiliateProgramSettings) as T;
    return adminAffiliateDb.getSettings() as T;
  }

  // ---- Subscription hooks ----
  if (cleanPath === '/api/admin/affiliate/attribution' && method === 'POST') {
    const sellers = (b.sellers as { id: string; username: string }[]) ?? [];
    return { attribution: adminAffiliateDb.resolveAttribution(sellers) } as T;
  }

  throw new Error('Not found');
}
