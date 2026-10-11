import type { Shop } from '../../../../types';
import {
  formatHoursRange,
  hasFooterAvailability,
  normalizeAvailabilityHours,
} from '../../../../lib/shopAvailability';

export type HourRow = { day: string; hours: string };

const DAY_NAMES: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export function readHours(shop: Shop): HourRow[] {
  if (!hasFooterAvailability(shop.availabilityEnabled, shop.availabilityHours)) return [];
  return normalizeAvailabilityHours(shop.availabilityHours).map((slot) => ({
    day: DAY_NAMES[slot.day] ?? slot.day,
    hours: slot.enabled
      ? shop.availability24Hours
        ? '24 Hours'
        : formatHoursRange(slot.openTime, slot.closeTime)
      : 'Closed',
  }));
}