export const EMPTY_LABEL = 'N/A';

export const adminTheme = {
  pageTitle: 'text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100',
  pageSubtitle: 'mt-1 text-sm text-stone-500 dark:text-zinc-400',
  card: 'rounded-xl border border-stone-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none',
  cardHeader: 'border-b border-stone-100 px-5 py-4 dark:border-zinc-800',
  cardTitle: 'font-semibold text-stone-900 dark:text-zinc-100',
  divide: 'divide-stone-100 dark:divide-zinc-800',
  input:
    'w-full rounded-lg border border-stone-200 bg-white py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20',
  select:
    'rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 focus:border-brand-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100',
  btnPrimary:
    'dashboard-pressable rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-brand-950/30',
  btnSecondary:
    'dashboard-pressable rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800',
  btnFilterActive:
    'rounded-lg bg-brand-100 px-3 py-2 text-sm font-medium text-brand-800 dark:bg-brand-950/50 dark:text-brand-300',
  btnFilterWarnActive:
    'rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  chip: 'rounded-lg bg-stone-100 px-2 py-1 text-xs text-stone-700 dark:bg-zinc-800 dark:text-zinc-300',
  imagePlaceholder: 'flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800',
  btnFilter:
    'dashboard-pressable rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800',
  tableWrap: 'overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900',
  th: 'px-4 py-3 text-start text-sm font-medium text-stone-500 dark:text-zinc-400',
  td: 'px-4 py-3 text-sm text-stone-700 dark:text-zinc-300',
  theadRow: 'border-b border-stone-100 dark:border-zinc-800',
  tbodyDivide: 'divide-y divide-stone-100 dark:divide-zinc-800',
  rowHover: 'hover:bg-stone-50/80 dark:hover:bg-zinc-800/50',
  muted: 'text-stone-500 dark:text-zinc-500',
  link: 'font-medium text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300',
  badgeBase:
    'inline-flex items-center justify-center rounded-full px-2.5 min-h-[1.375rem] text-xs font-medium leading-none',
  badgeActive:
    'inline-flex items-center justify-center rounded-full px-2.5 min-h-[1.375rem] text-xs font-medium leading-none bg-brand-100 text-brand-800 dark:bg-brand-950/50 dark:text-brand-300',
  badgeSuspended:
    'inline-flex items-center justify-center rounded-full px-2.5 min-h-[1.375rem] text-xs font-medium leading-none bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  badgePending:
    'inline-flex items-center justify-center rounded-full px-2.5 min-h-[1.375rem] text-xs font-medium leading-none bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  badgeInfo:
    'inline-flex items-center justify-center rounded-full px-2.5 min-h-[1.375rem] text-xs font-medium leading-none bg-brand-100 text-brand-800 dark:bg-brand-950/50 dark:text-brand-300',
  shellHeader:
    'flex h-16 shrink-0 items-center border-b border-stone-200/90 dark:border-zinc-800',
  alertError:
    'rounded-xl border border-red-100 bg-red-50/95 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200',
  alertWarn:
    'flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200',
  modal: 'relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40',
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  modalBackdrop: 'absolute inset-0 bg-black/40 backdrop-blur-sm',
  statCard: 'rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-brand-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-500/30',
  statIcon: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm',
  revenue: 'text-sm font-semibold text-brand-700 dark:text-brand-400',
  statRevenueValue: 'text-2xl font-bold leading-tight text-brand-700 dark:text-brand-400',
  article: 'rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900',
} as const;

export function orEmpty(value: string | null | undefined): string {
  const v = value?.trim();
  return v ? v : '';
}
