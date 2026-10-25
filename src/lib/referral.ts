// ============================================================================
// Stallio Referral Tracking & Attribution Engine
// ============================================================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { normalizeSlug, validateSlug } from './reservedWords';

export const REFERRAL_STORAGE_KEY = 'stallio_referral_attribution';
export const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface StoredReferral {
  code: string;
  ts: number;
  source?: 'link' | 'qr';
}

export interface ReferralValidationResult {
  valid: boolean;
  affiliateName?: string;
  reason?: string;
}

/**
 * Persists an affiliate referral code to localStorage with a 30-day timestamp.
 */
export function saveReferralCode(rawCode: string, source: 'link' | 'qr' = 'link'): void {
  if (typeof window === 'undefined' || !rawCode) return;
  const code = normalizeSlug(rawCode);

  // Validate format and ensure it's not a reserved word
  const validation = validateSlug(code);
  if (!validation.valid) return;

  const payload: StoredReferral = {
    code,
    ts: Date.now(),
    source,
  };

  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[Stallio Referral] Failed to save referral to localStorage:', err);
  }
}

/**
 * Retrieves the stored referral object if present and within the 30-day window.
 * Prunes expired referrals automatically.
 */
export function getStoredReferral(): StoredReferral | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return null;

    const data: StoredReferral = JSON.parse(raw);
    if (!data || !data.code || !data.ts) {
      clearStoredReferral();
      return null;
    }

    // Check 30-day expiry window
    const age = Date.now() - data.ts;
    if (age > REFERRAL_TTL_MS) {
      clearStoredReferral();
      return null;
    }

    return data;
  } catch {
    clearStoredReferral();
    return null;
  }
}

/**
 * Gets just the clean referral code string, or null if expired/unset.
 */
export function getStoredReferralCode(): string | null {
  const stored = getStoredReferral();
  return stored ? stored.code : null;
}

/**
 * Clears stored referral attribution (e.g. after successful seller signup).
 */
export function clearStoredReferral(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch (err) {
    console.warn('[Stallio Referral] Failed to clear referral storage:', err);
  }
}

/**
 * Fires a non-blocking click tracking event to the API.
 * Deduplicated on backend per IP and day.
 */
export async function recordReferralClick(
  rawCode: string,
  source: 'link' | 'qr' = 'link'
): Promise<void> {
  const code = normalizeSlug(rawCode);
  const validation = validateSlug(code);
  if (!validation.valid) return;

  const referrer = typeof document !== 'undefined' ? document.referrer : '';

  try {
    const url = `${API_BASE}/api/referral/click`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, source, referrer }),
    }).catch(() => {
      // Fire-and-forget: network errors silently handled
    });
  } catch {
    // Suppress
  }
}

/**
 * Validates a referral code against the platform API.
 * Performs client-side structural validation first, then queries the API.
 * Includes graceful mock-support if backend is offline or not yet deployed.
 */
export async function validateReferralCodeOnline(
  rawCode: string
): Promise<ReferralValidationResult> {
  const code = normalizeSlug(rawCode);
  if (!code) {
    return { valid: false, reason: 'Please enter a referral code.' };
  }

  // 1. Client-side slug validation
  const validation = validateSlug(code);
  if (!validation.valid) {
    return { valid: false, reason: validation.reason || 'Invalid code format.' };
  }

  // 2. Query backend API
  try {
    const url = `${API_BASE}/api/referral/validate?code=${encodeURIComponent(code)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return {
        valid: Boolean(data.valid),
        affiliateName: data.affiliateName || 'Affiliate Partner',
        reason: data.reason,
      };
    }

    if (res.status === 404) {
      // Endpoint or code not found
      return { valid: false, reason: 'Referral code not found or expired.' };
    }
  } catch {
    // If backend is unreachable or not yet created, allow development mock preview
  }

  // 3. Fallback demo support for known sample codes if server is offline
  const sampleAffiliates: Record<string, string> = {
    sarah25: 'Sarah Jenkins',
    partner: 'Stallio Growth Partner',
    welcome: 'Stallio Welcome Team',
    vip: 'VIP Merchant Network',
  };

  if (sampleAffiliates[code]) {
    return {
      valid: true,
      affiliateName: sampleAffiliates[code],
    };
  }

  // If code format is valid but unknown
  return { valid: false, reason: 'Referral code not found or suspended.' };
}

/**
 * Universal React hook: captures referral parameters (?ref= or ?r=) across any page.
 * Place inside root routing components so organic marketing landings capture attribution.
 */
export function useReferralCapture(): void {
  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const codeFromQuery = params.get('ref') || params.get('r');

      if (codeFromQuery) {
        const source = params.get('s') === 'qr' ? 'qr' : 'link';
        saveReferralCode(codeFromQuery, source);
        // Also fire click record
        recordReferralClick(codeFromQuery, source);
      }
    } catch {
      // Ignore
    }
  }, [location.search]);
}
