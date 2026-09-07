export const DASHBOARD_INPUT =
  'w-full px-4 py-3 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/60 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all';

export const DASHBOARD_SEARCH_INPUT = `${DASHBOARD_INPUT} pl-10`;

export const DASHBOARD_FILTER_SELECT =
  'flex w-full items-center justify-between gap-3 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/70 px-4 py-3 text-stone-900 dark:text-zinc-100 font-medium hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors';

export const DASHBOARD_SELECT = `${DASHBOARD_INPUT} bg-white dark:bg-zinc-900`;

export const DASHBOARD_DATE = `${DASHBOARD_INPUT} [color-scheme:light] dark:[color-scheme:dark]`;

export const DASHBOARD_TEXTAREA = `${DASHBOARD_INPUT} min-h-[96px] resize-y`;

export const DASHBOARD_NUMBER_INPUT = `${DASHBOARD_INPUT} dashboard-no-spin`;

export const DASHBOARD_INPUT_LOCKED =
  'cursor-not-allowed bg-stone-100/80 dark:bg-zinc-800/80 text-stone-700 dark:text-zinc-300 focus:border-stone-200 dark:focus:border-zinc-700 focus:ring-0';

export const DASHBOARD_PRESSABLE = 'dashboard-pressable';

export const DASHBOARD_BTN_PRIMARY = `inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 disabled:opacity-60 ${DASHBOARD_PRESSABLE}`;

export const DASHBOARD_BTN_SECONDARY = `px-4 py-2.5 rounded-xl font-semibold border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 ${DASHBOARD_PRESSABLE}`;

export const DASHBOARD_BTN_OUTLINE = `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-60 ${DASHBOARD_PRESSABLE}`;

export const DASHBOARD_DESTRUCTIVE_BORDERED =
  'border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors';

export const DASHBOARD_ICON_CLOSE_BTN = `inline-flex shrink-0 items-center justify-center rounded-lg ${DASHBOARD_DESTRUCTIVE_BORDERED}`;

export const DASHBOARD_IMAGE_REMOVE_BTN =
  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white ring-2 ring-white/95 shadow-md shadow-black/25 hover:bg-red-600 hover:scale-105 active:scale-95 transition-[transform,background-color] dark:ring-zinc-900/90 dark:shadow-black/50';

export const DASHBOARD_ICON_REMOVE_INLINE_BTN = `inline-flex shrink-0 items-center justify-center rounded-lg ${DASHBOARD_DESTRUCTIVE_BORDERED}`;

export const DASHBOARD_ITEM_DELETE_BTN =
  'inline-flex shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50';

export const DASHBOARD_TOGGLE_ROW =
  'flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0';

export const DASHBOARD_TOGGLE_ROW_LABEL = 'min-w-0 flex-1';

export const DASHBOARD_TOGGLE_ROW_SWITCH = 'shrink-0';
