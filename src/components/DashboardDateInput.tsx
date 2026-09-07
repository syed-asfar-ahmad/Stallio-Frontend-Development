import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { format, isValid, parse } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar, ChevronDown } from 'lucide-react';
import 'react-day-picker/style.css';
import { useTheme } from '../context/ThemeContext';
import { DayPickerThemedDropdown } from './DayPickerThemedDropdown';
import {
  DAY_PICKER_POPOVER_WIDTH_CLASS,
  dayPickerAdminClassName,
  dayPickerAdminClassNames,
  dayPickerAdminFormatters,
  getDayPickerCssVars,
} from './dayPickerAdminConfig';

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  placeholder?: string;
  disablePast?: boolean;
  clearLabel?: string;
};

const VIEWPORT_MARGIN = 12;
const PANEL_GAP = 8;
const PANEL_HEIGHT_FALLBACK = 340;
const PANEL_WIDTH_FALLBACK = 288;

function ymdToDate(s: string): Date | undefined {
  if (!s) return undefined;
  const d = parse(s, 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : undefined;
}

function toYmd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function computePanelPosition(
  anchor: HTMLElement,
  panel: HTMLElement | null,
): CSSProperties {
  const r = anchor.getBoundingClientRect();
  const panelH = panel?.offsetHeight ?? PANEL_HEIGHT_FALLBACK;
  const panelW = panel?.offsetWidth ?? PANEL_WIDTH_FALLBACK;

  const spaceBelow = window.innerHeight - r.bottom - VIEWPORT_MARGIN - PANEL_GAP;
  const spaceAbove = r.top - VIEWPORT_MARGIN - PANEL_GAP;
  const fitsBelow = spaceBelow >= panelH;
  const fitsAbove = spaceAbove >= panelH;

  let top: number;
  if (fitsBelow && (!fitsAbove || spaceBelow >= spaceAbove)) {
    top = r.bottom + PANEL_GAP;
  } else if (fitsAbove) {
    top = r.top - panelH - PANEL_GAP;
  } else {
    top = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - panelH - VIEWPORT_MARGIN,
    );
    if (r.top > window.innerHeight * 0.45) {
      top = Math.min(top, r.top - panelH - PANEL_GAP);
    }
  }

  top = Math.max(
    VIEWPORT_MARGIN,
    Math.min(top, window.innerHeight - panelH - VIEWPORT_MARGIN),
  );

  const left = Math.min(
    Math.max(VIEWPORT_MARGIN, r.left),
    window.innerWidth - panelW - VIEWPORT_MARGIN,
  );

  return {
    position: 'fixed',
    left,
    top,
    zIndex: 250,
  };
}

export default function DashboardDateInput({
  value,
  onChange,
  className = '',
  id,
  placeholder,
  disablePast = false,
  clearLabel,
}: Props) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('dashboard.dateInput.placeholder');
  const resolvedClearLabel = clearLabel ?? t('dashboard.dateInput.clearLabel');
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<CSSProperties | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = ymdToDate(value);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayPickerCssVars = useMemo(() => getDayPickerCssVars(isDark), [isDark]);

  const displayLabel = selected ? format(selected, 'MMM d, yyyy') : resolvedPlaceholder;

  const updatePanelPosition = useCallback(() => {
    const anchor = triggerRef.current;
    if (!anchor || !open) return;
    setPanelPos(computePanelPosition(anchor, panelRef.current));
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPanelPos(null);
      return;
    }

    updatePanelPosition();
    const raf = requestAnimationFrame(() => {
      updatePanelPosition();
      requestAnimationFrame(updatePanelPosition);
    });

    const panel = panelRef.current;
    const ro = panel ? new ResizeObserver(updatePanelPosition) : null;
    if (panel && ro) ro.observe(panel);

    window.addEventListener('scroll', updatePanelPosition, true);
    window.addEventListener('resize', updatePanelPosition);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('scroll', updatePanelPosition, true);
      window.removeEventListener('resize', updatePanelPosition);
    };
  }, [open, updatePanelPosition, value]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      if ((t as Element).closest?.('[data-day-picker-dropdown-menu]')) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const calendarPanel =
    open &&
    panelPos &&
    createPortal(
      <div
        ref={panelRef}
        style={panelPos}
        className={`${DAY_PICKER_POPOVER_WIDTH_CLASS} overflow-visible rounded-xl border border-stone-200 bg-white p-2.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/50`}
      >
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(d) => {
            onChange(d ? toYmd(d) : '');
            setOpen(false);
          }}
          defaultMonth={selected ?? today}
          onMonthChange={() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(updatePanelPosition);
            });
          }}
          components={{ Dropdown: DayPickerThemedDropdown }}
          formatters={dayPickerAdminFormatters}
          captionLayout="dropdown"
          navLayout="around"
          startMonth={new Date(2020, 0, 1)}
          endMonth={new Date(new Date().getFullYear() + 5, 11, 31)}
          disabled={disablePast ? { before: today } : undefined}
          showOutsideDays
          style={dayPickerCssVars}
          className={dayPickerAdminClassName}
          classNames={dayPickerAdminClassNames}
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="mt-2 w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {resolvedClearLabel}
          </button>
        ) : null}
      </div>,
      document.body,
    );

  return (
    <div className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-stone-200 bg-stone-50/30 px-4 py-3 text-left text-sm font-medium text-stone-900 transition-colors hover:border-brand-200 hover:bg-brand-50/40 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40"
      >
        <span className={`flex min-w-0 flex-1 items-center gap-2.5 ${!selected ? 'text-stone-400 dark:text-zinc-500' : ''}`}>
          <Calendar className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
          <span className="truncate">{displayLabel}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-500 transition-transform dark:text-zinc-400 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {calendarPanel}
    </div>
  );
}
