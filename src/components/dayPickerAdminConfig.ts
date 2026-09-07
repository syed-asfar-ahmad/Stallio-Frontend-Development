import type { CSSProperties } from 'react';
import { format } from 'date-fns';
import type { ClassNames, Formatters } from 'react-day-picker';

export const DAY_PICKER_POPOVER_WIDTH_CLASS = 'w-fit max-w-[min(18rem,calc(100vw-1.5rem))]';

export function getDayPickerCssVars(isDark: boolean): CSSProperties {
  return {
    '--rdp-accent-color': '#5b45e5',
    '--rdp-accent-background-color': isDark ? 'rgba(91, 69, 229, 0.18)' : '#ebe8fc',
    '--rdp-today-color': '#5e2bec',
    '--rdp-day-height': '1.625rem',
    '--rdp-day-width': '1.625rem',
    '--rdp-day_button-height': '1.5rem',
    '--rdp-day_button-width': '1.5rem',
    '--rdp-nav-height': '1.875rem',
    '--rdp-nav_button-height': '1.5rem',
    '--rdp-nav_button-width': '1.5rem',
  } as CSSProperties;
}

export const dayPickerAdminFormatters: Partial<Formatters> = {
  formatMonthDropdown: (date) => format(date, 'MMM'),
};

export const dayPickerCalendarShellClass = 'flex justify-center';

export const dayPickerAdminClassName =
  'p-0 text-sm text-stone-800 dark:text-zinc-200';

export const dayPickerAdminClassNames: Partial<ClassNames> = {
  root: 'rdp-root w-fit',
  month: 'rdp-month w-fit',
  month_caption:
    'rdp-month_caption flex items-center justify-center gap-1 font-sans font-semibold text-xs text-stone-800 dark:text-zinc-200',
  dropdowns: 'rdp-dropdowns flex items-center justify-center gap-1',
  button_previous:
    'rdp-button_previous h-7 w-7 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:border-brand-200 dark:hover:border-brand-600/45 hover:text-brand-700 dark:hover:text-brand-400 [&_svg]:h-3.5 [&_svg]:w-3.5',
  button_next:
    'rdp-button_next z-10 h-7 w-7 shrink-0 rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:border-brand-200 dark:hover:border-brand-600/45 hover:text-brand-700 dark:hover:text-brand-400 [&_svg]:h-3.5 [&_svg]:w-3.5',
  weekday: 'rdp-weekday text-[0.625rem] font-semibold uppercase text-stone-500 dark:text-zinc-400',
  day: 'rdp-day text-xs',
  day_button: 'rdp-day_button text-xs',
};
