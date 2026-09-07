import { adminTheme } from './adminTheme';

export const adminFieldTriggerClass = `relative flex w-full min-w-0 items-center justify-between gap-2 pe-9 text-start ${adminTheme.select} focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20`;

export const adminDropdownPanelClass =
  'overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-xl ring-1 ring-stone-900/5 dark:border-zinc-600 dark:bg-zinc-900 dark:ring-white/10';

export const adminDropdownItemClass = 'w-full px-3 py-2.5 text-start text-sm transition-colors';

export const adminDropdownItemActiveClass =
  'bg-brand-50 font-medium text-brand-800 dark:bg-brand-950/50 dark:text-brand-300';

export const adminDropdownItemIdleClass =
  'text-stone-800 hover:bg-stone-50 dark:text-zinc-200 dark:hover:bg-zinc-800';
