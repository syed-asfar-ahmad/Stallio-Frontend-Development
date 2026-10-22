// ============================================================================
// Stallio Affiliate & Username Reserved Slugs Engine
// ============================================================================

/**
 * Slugs reserved for system routes, affiliate aliases, and seller usernames.
 * Both affiliate codes and seller usernames share this reservation list
 * to prevent routing ambiguity (/r/CODE vs /:username).
 */
export const RESERVED_SLUGS = new Set<string>([
  'admin',
  'affiliate',
  'affiliates',
  'api',
  'r',
  'ref',
  'login',
  'signup',
  'dashboard',
  'verify-email',
  'forgot-password',
  'reset-password',
  'pricing',
  'features',
  'how-it-works',
  'about',
  'contact',
  'careers',
  'privacy',
  'terms',
  'refund-policy',
  'shop',
  'stallio',
  'support',
  'help',
  'www',
  'test',
  'null',
  'undefined',
  'root',
  'auth',
  'app',
  'billing',
  'settings',
  'user',
  'users',
  'account',
  'accounts',
  'webhook',
  'webhooks',
  'static',
  'assets',
  'public',
  'orders',
  'products',
  'categories',
  'store',
  'stores',
  'checkout',
  'cart',
]);

/**
 * Normalizes a slug to lowercase, trimmed, with illegal characters stripped.
 */
export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Checks whether a code is in the reserved words denylist.
 */
export function isReservedSlug(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  return RESERVED_SLUGS.has(normalized) || customReservedSlugs.has(normalized);
}

/** Admin-managed additions (Admin → Affiliate Settings). Merged with the built-in list at check time. */
const customReservedSlugs = new Set<string>();

export function setCustomReservedSlugs(words: string[]): void {
  customReservedSlugs.clear();
  words.forEach((w) => {
    const n = normalizeSlug(w);
    if (n) customReservedSlugs.add(n);
  });
}

export function getBuiltInReservedSlugs(): string[] {
  return Array.from(RESERVED_SLUGS).sort();
}

/**
 * Validates an affiliate custom referral code or seller username slug.
 * Rules:
 *  - 4 to 20 characters
 *  - lowercase a-z, digits 0-9, hyphen -
 *  - No leading or trailing hyphen
 *  - No consecutive hyphens (--)
 *  - Not in reserved slugs
 */
export function validateSlug(rawSlug: string): { valid: boolean; reason?: string } {
  const slug = normalizeSlug(rawSlug);

  if (!slug) {
    return { valid: false, reason: 'Code cannot be empty.' };
  }

  if (slug.length < 4) {
    return { valid: false, reason: 'Must be at least 4 characters long.' };
  }

  if (slug.length > 20) {
    return { valid: false, reason: 'Cannot exceed 20 characters.' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, reason: 'Only lowercase letters, numbers, and hyphens are allowed.' };
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, reason: 'Cannot begin or end with a hyphen.' };
  }

  if (slug.includes('--')) {
    return { valid: false, reason: 'Consecutive hyphens are not allowed.' };
  }

  if (isReservedSlug(slug)) {
    return { valid: false, reason: 'This code is reserved by the platform.' };
  }

  return { valid: true };
}

/**
 * Alias for validateSlug tailored for affiliate codes
 */
export const validateAffiliateCode = validateSlug;

/**
 * Generates an 8-character random referral code default.
 * Excludes ambiguous glyphs (0, o, 1, l, i) for high readability in print and screens.
 */
const SAFE_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';

export function generateAffiliateCode(length = 8): string {
  let result = '';
  const cryptoObj = typeof window !== 'undefined' && window.crypto ? window.crypto : null;

  if (cryptoObj && cryptoObj.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += SAFE_ALPHABET[bytes[i] % SAFE_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * SAFE_ALPHABET.length);
      result += SAFE_ALPHABET[idx];
    }
  }

  // Ensure generated code isn't reserved
  if (isReservedSlug(result)) {
    return generateAffiliateCode(length);
  }

  return result;
}
