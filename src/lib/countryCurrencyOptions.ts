import countries from 'world-countries';
import iso4217 from '@mreduar/iso-4217-currencies';
import { wrapLtrIsolate } from './ltrIsolate';

const FLAG_CDN = 'https://flagcdn.com';
export type FlagImageWidth = 40 | 80 | 160 | 320;
export function getFlagUrl(countryCode: string, width: FlagImageWidth = 40): string {
  if (!countryCode || countryCode.length !== 2) return '';
  return `${FLAG_CDN}/w${width}/${countryCode.toLowerCase()}.png`;
}

export type CountryOption = { value: string; label: string; flagUrl: string };
export type CurrencyOption = { value: string; label: string; flagUrl: string };
function buildCurrencyToCountry(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of countries as Array<{ cca2: string }>) {
    try {
      const curr = iso4217.codeForCountry(c.cca2);
      if (curr && !out[curr]) out[curr] = c.cca2;
    } catch {
    }
  }
  return out;
}

function getCountryOptions(): CountryOption[] {
  return (countries as Array<{ cca2: string; name: { common: string } }>)
    .map((c) => ({
      value: c.cca2,
      label: c.name.common,
      flagUrl: getFlagUrl(c.cca2),
    }))
    .filter((o) => o.value && o.label)
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getCurrencyOptions(): CurrencyOption[] {
  const currencyToCountry = buildCurrencyToCountry();
  const list: CurrencyOption[] = [];
  for (const code of iso4217.codes) {
    const meta = iso4217.map[code];
    if (!meta || !meta.name) continue;
    const sym = meta.symbol || meta.symbolNative || code;
    const countryCode = currencyToCountry[code];
    list.push({
      value: code,
      label: `${meta.name} (${sym})`,
      flagUrl: countryCode ? getFlagUrl(countryCode) : '',
    });
  }
  return list.sort((a, b) => a.label.localeCompare(b.label));
}

export function formatPrice(amount: number, currencyCode?: string | null): string {
  const code = (currencyCode && currencyCode.trim()) || 'USD';
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat('en', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(amount);
  } catch {
    formatted = `${code} ${amount.toFixed(2)}`;
  }
  return wrapLtrIsolate(formatted);
}
export function getCurrencySymbol(currencyCode?: string | null): string {
  const code = (currencyCode && currencyCode.trim()) || 'USD';
  try {
    const parts = new Intl.NumberFormat('en', { style: 'currency', currency: code }).formatToParts(1);
    const part = parts.find((p) => p.type === 'currency');
    return part?.value ?? code;
  } catch {
    return code;
  }
}
export function formatQuantity(q: number): string {
  if (!Number.isFinite(q)) return wrapLtrIsolate('0');
  const raw = Number.isInteger(q) ? String(q) : parseFloat(q.toFixed(2)).toString();
  return wrapLtrIsolate(raw);
}

let cachedCountryOptions: CountryOption[] | null = null;
let cachedCurrencyOptions: CurrencyOption[] | null = null;

export function getCountryOptionsList(): CountryOption[] {
  if (!cachedCountryOptions) cachedCountryOptions = getCountryOptions();
  return cachedCountryOptions;
}

export function getCountryOptionByCode(code: string | null | undefined): CountryOption | null {
  if (!code?.trim()) return null;
  const c = code.trim().toUpperCase();
  if (c.length !== 2) return null;
  return getCountryOptionsList().find((o) => o.value === c) ?? null;
}

export function getCurrencyOptionsList(): CurrencyOption[] {
  if (!cachedCurrencyOptions) cachedCurrencyOptions = getCurrencyOptions();
  return cachedCurrencyOptions;
}
export function getCurrencyForCountry(countryCode: string): string | null {
  const c = countryCode?.trim().toUpperCase();
  if (!c || c.length !== 2) return null;
  try {
    const code = iso4217.codeForCountry(c);
    return typeof code === 'string' && code.length === 3 ? code : null;
  } catch {
    return null;
  }
}
