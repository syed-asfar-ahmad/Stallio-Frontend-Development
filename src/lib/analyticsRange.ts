const DAY_MS = 24 * 60 * 60 * 1000;

export const ANALYTICS_EPOCH = new Date(2025, 0, 1);
export const ANALYTICS_EPOCH_YMD = '2025-01-01';

export type RangeKey = 'today' | '3d' | '7d' | '1m' | '1y' | 'all' | 'custom';

function getStartOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function getRangeBounds(
  range: RangeKey,
  customFrom?: string,
  customTo?: string,
): { start: number; end: number } {
  const now = new Date();
  const end = now.getTime();
  let start = 0;

  if (range === 'custom' && customFrom && customTo) {
    let from = new Date(customFrom);
    const to = new Date(customTo);
    if (from < ANALYTICS_EPOCH) from = new Date(ANALYTICS_EPOCH);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    if (from.getTime() > to.getTime()) {
      to.setTime(from.getTime());
      to.setHours(23, 59, 59, 999);
    }
    return { start: from.getTime(), end: to.getTime() };
  }

  switch (range) {
    case 'today':
      start = getStartOfDay(now);
      break;
    case '3d':
      start = end - 3 * DAY_MS;
      break;
    case '7d':
      start = end - 7 * DAY_MS;
      break;
    case '1m':
      start = end - 30 * DAY_MS;
      break;
    case '1y':
      start = end - 365 * DAY_MS;
      break;
    case 'all':
      start = getStartOfDay(ANALYTICS_EPOCH);
      break;
    default:
      start = getStartOfDay(ANALYTICS_EPOCH);
  }
  return { start, end };
}

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '3d', label: 'Last 3 Days' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '1m', label: 'Last 30 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Dates' },
];

export function getRangeLabel(range: RangeKey, customFrom?: string, customTo?: string): string {
  if (range === 'custom' && customFrom && customTo) {
    const f = new Date(customFrom).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const t = new Date(customTo).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${f} - ${t}`;
  }
  return RANGE_OPTIONS.find((o) => o.value === range)?.label ?? 'All Time';
}

export function statsQueryParams(range: RangeKey, customFrom?: string, customTo?: string): string {
  const params = new URLSearchParams({ range });
  if (range === 'custom' && customFrom && customTo) {
    params.set('from', customFrom);
    params.set('to', customTo);
  }
  return params.toString();
}
