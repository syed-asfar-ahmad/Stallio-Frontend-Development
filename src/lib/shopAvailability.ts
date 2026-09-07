import { wrapLtrIsolate } from './ltrIsolate';

export const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export type ShopAvailabilitySlot = {
  day: WeekdayKey;
  enabled: boolean;
  openTime: string;
  closeTime: string;
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function defaultAvailabilityHours(): ShopAvailabilitySlot[] {
  return WEEKDAY_KEYS.map((day) => ({
    day,
    enabled: day !== 'sun',
    openTime: '09:00',
    closeTime: '18:00',
  }));
}

export function normalizeAvailabilityHours(raw?: ShopAvailabilitySlot[] | null): ShopAvailabilitySlot[] {
  const map = new Map<WeekdayKey, ShopAvailabilitySlot>();
  for (const slot of raw ?? []) {
    if (slot?.day && WEEKDAY_KEYS.includes(slot.day as WeekdayKey)) {
      map.set(slot.day as WeekdayKey, {
        day: slot.day as WeekdayKey,
        enabled: Boolean(slot.enabled),
        openTime: TIME_RE.test(slot.openTime) ? slot.openTime : '09:00',
        closeTime: TIME_RE.test(slot.closeTime) ? slot.closeTime : '18:00',
      });
    }
  }
  return WEEKDAY_KEYS.map((day) => map.get(day) ?? defaultAvailabilityHours().find((s) => s.day === day)!);
}

export function hasFooterAvailability(enabled?: boolean, hours?: ShopAvailabilitySlot[] | null): boolean {
  if (!enabled) return false;
  return normalizeAvailabilityHours(hours).some((s) => s.enabled);
}

export function formatTime12(hhmm: string): string {
  const m = TIME_RE.exec(hhmm);
  if (!m) return hhmm;
  let h = Number(m[1]);
  const min = m[2];
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${ap}`;
}

export function formatHoursRange(openTime: string, closeTime: string): string {
  return wrapLtrIsolate(`${formatTime12(openTime)} - ${formatTime12(closeTime)}`);
}

export function normalizeTimeInput(raw: string, fallback = '09:00'): string {
  const trimmed = raw.trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!m) return TIME_RE.test(fallback) ? fallback : '09:00';
  const h = Math.min(23, Math.max(0, Number.parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, Number.parseInt(m[2], 10)));
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}
