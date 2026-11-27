/**
 * Approximate local units per 1 USD for pricing previews.
 * Same planning table as Stallio Website. Not a live market rate.
 */
const PER_USD_BY_COUNTRY: Record<string, number> = {
  US: 1,
  PK: 278,
  AE: 3.67,
  SA: 3.75,
  GB: 0.79,
  CA: 1.36,
  AU: 1.52,
  IN: 83,
  EG: 48,
  TR: 34,
  MY: 4.47,
  SG: 1.34,
  DE: 0.92,
  FR: 0.92,
  ES: 0.92,
  BR: 5.4,
  MX: 18.2,
  NG: 1550,
  KE: 129,
  ZA: 18.3,
};

/** Country codes with a planning estimate (ISO 3166-1 alpha-2). */
export const PRICING_RATE_COUNTRY_CODES = Object.keys(PER_USD_BY_COUNTRY);

/** Static USD→local multiplier for a country, or null if we have no estimate. */
export function getStaticPerUsd(countryCode: string): number | null {
  const rate = PER_USD_BY_COUNTRY[countryCode.toUpperCase()];
  return typeof rate === 'number' ? rate : null;
}
