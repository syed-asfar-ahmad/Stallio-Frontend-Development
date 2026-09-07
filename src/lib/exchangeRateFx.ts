import { getApiBase } from './api';

export type UsdFxQuote = {
rate: number;
date: string;
};

export async function fetchUsdTo(currency: string, signal?: AbortSignal): Promise<UsdFxQuote> {
  const c = currency.trim().toUpperCase();
  if (c === 'USD') {
    return { rate: 1, date: new Date().toISOString().slice(0, 10) };
  }
  const url = `${getApiBase()}/api/fx/latest?to=${encodeURIComponent(c)}`;
  const res = await fetch(url, { signal });
  if (res.status === 404) {
    throw new Error(`Currency not supported: ${c}`);
  }
  if (!res.ok) {
    throw new Error(`FX request failed (${res.status})`);
  }
  const data = (await res.json()) as { date: string; rate: number };
  if (typeof data.rate !== 'number' || !Number.isFinite(data.rate)) {
    throw new Error(`Missing FX rate for ${c}`);
  }
  return { rate: data.rate, date: data.date };
}
