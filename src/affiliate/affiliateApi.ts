// ============================================================================
// Stallio Affiliate API Client
// ============================================================================

import { mockAffiliateDb } from './affiliateMock';

export const AFFILIATE_TOKEN_KEY = 'stallio_affiliate_token';
const API_BASE = import.meta.env.VITE_API_URL ?? '';
// Default to mock engine unless explicitly disabled with VITE_AFFILIATE_MOCK=false
const FORCE_MOCK = import.meta.env.VITE_AFFILIATE_MOCK !== 'false';

export function getStoredAffiliateToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AFFILIATE_TOKEN_KEY);
}

export function setStoredAffiliateToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AFFILIATE_TOKEN_KEY, token);
}

export function clearStoredAffiliateToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AFFILIATE_TOKEN_KEY);
}

type ApiOptions = Omit<RequestInit, 'body'> & { body?: object | string };

/**
 * Isolated fetch client: attaches ONLY the affiliate Bearer token.
 * Never touches the seller's stallio_token.
 */
export async function affiliateApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, ...rest } = options;
  const token = getStoredAffiliateToken();

  // Route to mock engine when in mock mode or backend is not available
  if (FORCE_MOCK) {
    return handleMockRequest<T>(path, method, body);
  }

  const headers: Record<string, string> = {
    ...((rest.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      ...rest,
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // In development, if endpoint does not exist yet (404), fall back to mock
      if (res.status === 404) {
        return handleMockRequest<T>(path, method, body);
      }
      throw new Error(data.error || res.statusText || 'Request failed');
    }

    return data as T;
  } catch (err) {
    // If connection refused or endpoint unavailable in development, fallback to mock
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return handleMockRequest<T>(path, method, body);
    }
    throw err;
  }
}

/**
 * Simulated backend endpoints for zero-friction frontend testing.
 */
async function handleMockRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  // Simulate tiny network delay for authentic UI micro-states
  await new Promise((r) => setTimeout(r, 150));

  const cleanPath = path.split('?')[0];
  const query = new URLSearchParams(path.includes('?') ? path.split('?')[1] : '');

  // 1. GET /api/affiliate/me
  if (cleanPath === '/api/affiliate/me') {
    return mockAffiliateDb.getAffiliate() as T;
  }

  // 2. GET /api/affiliate/stats
  if (cleanPath === '/api/affiliate/stats') {
    const range = query.get('range') || '30d';
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    return mockAffiliateDb.getStats(days) as T;
  }

  // 3. GET /api/affiliate/referrals
  if (cleanPath === '/api/affiliate/referrals') {
    let list = mockAffiliateDb.getReferrals();
    const status = query.get('status');
    const q = (query.get('q') || '').toLowerCase().trim();

    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }
    if (q) {
      list = list.filter((r) => r.shopName.toLowerCase().includes(q) || r.maskedEmail.toLowerCase().includes(q));
    }
    return { referrals: list, total: list.length } as T;
  }

  // 4. GET /api/affiliate/earnings
  if (cleanPath === '/api/affiliate/earnings') {
    let list = mockAffiliateDb.getCommissions();
    const status = query.get('status');
    if (status && status !== 'all') {
      list = list.filter((c) => c.status === status);
    }
    return { commissions: list, total: list.length } as T;
  }

  // 5. GET /api/affiliate/payouts
  if (cleanPath === '/api/affiliate/payouts') {
    const payouts = mockAffiliateDb.getPayouts();
    const stats = mockAffiliateDb.getStats();
    return {
      payouts,
      balanceCents: stats.summary.balanceCents,
      minimumPayoutCents: stats.settings.minimumPayoutCents,
      payoutMethod: mockAffiliateDb.getPayoutMethod(),
    } as T;
  }

  // 6. GET /api/affiliate/payout-method
  if (cleanPath === '/api/affiliate/payout-method') {
    return mockAffiliateDb.getPayoutMethod() as T;
  }

  // 7. PUT /api/affiliate/payout-method
  if (cleanPath === '/api/affiliate/payout-method' && method === 'PUT') {
    const payload = body as { type: 'bank_transfer' | 'paypal' | 'wise'; details: string; password?: string };
    const last4 = payload.details.slice(-4) || '9999';
    const summary = `${payload.type.replace('_', ' ').toUpperCase()} (${last4})`;
    const updated = mockAffiliateDb.updatePayoutMethod(payload.type, last4, summary);
    return { success: true, payoutMethod: updated } as T;
  }

  // 8. GET /api/affiliate/code/check
  if (cleanPath === '/api/affiliate/code/check') {
    const code = (query.get('code') || '').toLowerCase().trim();
    if (code === 'taken' || code === 'stallio') {
      return { available: false, reason: 'This code is already taken.' } as T;
    }
    return { available: true } as T;
  }

  // 9. PUT /api/affiliate/code
  if (cleanPath === '/api/affiliate/code' && method === 'PUT') {
    const payload = body as { code: string };
    const updated = mockAffiliateDb.updateAffiliate({
      primaryCode: payload.code.toLowerCase(),
      referralLink: `https://stallio.shop/r/${payload.code.toLowerCase()}`,
    });
    return { success: true, affiliate: updated } as T;
  }

  return {} as T;
}
