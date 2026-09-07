import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, isValid, parse } from 'date-fns';
import { DayPicker, type DateRange } from 'react-day-picker';
import { ChevronDown } from 'lucide-react';
import 'react-day-picker/style.css';
import { useTheme } from '../../context/ThemeContext';
import { DayPickerThemedDropdown } from '../DayPickerThemedDropdown';
import {
  dayPickerAdminClassName,
  dayPickerAdminClassNames,
  dayPickerAdminFormatters,
  dayPickerCalendarShellClass,
  getDayPickerCssVars,
} from '../dayPickerAdminConfig';
import { adminTheme } from './adminTheme';
import {
  adminDropdownItemActiveClass,
  adminDropdownItemClass,
  adminDropdownItemIdleClass,
  adminDropdownPanelClass,
  adminFieldTriggerClass,
} from './adminFieldMenuStyles';
import { useAdminMenuPosition } from './useAdminMenuPosition';
import {
  ANALYTICS_EPOCH,
  RANGE_OPTIONS,
  getRangeLabel,
  type RangeKey,
} from '../../lib/analyticsRange';

type Props = {
  range: RangeKey;
  customFrom: string;
  customTo: string;
  onRangeChange: (range: RangeKey) => void;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
  onApplyCustom: () => void;
field?: boolean;
};

function ymdToDate(s: string): Date | undefined {
  if (!s) return undefined;
  const d = parse(s, 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : undefined;
}

function toYmd(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export default function AdminRangeFilter({
  range,
  customFrom,
  customTo,
  onRangeChange,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  field = false,
}: Props) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLDivElement>(null);
  const listPos = useAdminMenuPosition(field && showDropdown, triggerRef);
  const customPos = useAdminMenuPosition(field && showCustom, triggerRef, { maxHeight: 520 });

  const customCalendarRange = useMemo((): DateRange | undefined => {
    const from = ymdToDate(customFrom);
    const to = ymdToDate(customTo);
    if (!from && !to) return undefined;
    return { from, to };
  }, [customFrom, customTo]);

  const customCalendarDefaultMonth = useMemo(() => {
    const from = ymdToDate(customFrom);
    const to = ymdToDate(customTo);
    const candidate = from ?? to ?? new Date();
    return candidate < ANALYTICS_EPOCH ? ANALYTICS_EPOCH : candidate;
  }, [customFrom, customTo]);

  const dayPickerCssVars = useMemo(() => getDayPickerCssVars(isDark), [isDark]);

  const label = getRangeLabel(range, customFrom, customTo);

  const triggerClass = field
    ? adminFieldTriggerClass
    : 'inline-flex items-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40';

  const wrapperClass = field ? 'relative w-full min-w-0' : 'relative';

  useEffect(() => {
    if (!showDropdown && !showCustom) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current?.contains(t) ||
        listRef.current?.contains(t) ||
        customRef.current?.contains(t)
      ) {
        return;
      }
      setShowDropdown(false);
      setShowCustom(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [showDropdown, showCustom]);

  const listPanel = (
    <>
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="option"
          aria-selected={range === opt.value}
          onClick={() => {
            if (opt.value === 'custom') {
              setShowDropdown(false);
              setShowCustom(true);
            } else {
              onRangeChange(opt.value);
              setShowDropdown(false);
              setShowCustom(false);
            }
          }}
          className={`${adminDropdownItemClass} ${
            range === opt.value ? adminDropdownItemActiveClass : adminDropdownItemIdleClass
          }`}
        >
          {opt.label}
        </button>
      ))}
    </>
  );

  const customPanel = (
  <>
      <p className="mb-3 text-sm font-semibold text-stone-800 dark:text-zinc-200">Select date range</p>
      <div className={`${dayPickerCalendarShellClass} mb-3`}>
        <DayPicker
          components={{ Dropdown: DayPickerThemedDropdown }}
          formatters={dayPickerAdminFormatters}
          mode="range"
          selected={customCalendarRange}
          onSelect={(next) => {
            if (!next?.from) {
              onCustomFromChange('');
              onCustomToChange('');
              return;
            }
            const fromDate = next.from < ANALYTICS_EPOCH ? ANALYTICS_EPOCH : next.from;
            onCustomFromChange(toYmd(fromDate));
            onCustomToChange(next.to ? toYmd(next.to) : '');
          }}
          defaultMonth={customCalendarDefaultMonth}
          captionLayout="dropdown"
          navLayout="around"
          startMonth={ANALYTICS_EPOCH}
          endMonth={new Date(new Date().getFullYear(), 11, 31)}
          disabled={[{ before: ANALYTICS_EPOCH }, { after: new Date() }]}
          showOutsideDays
          style={dayPickerCssVars}
          className={dayPickerAdminClassName}
          classNames={dayPickerAdminClassNames}
        />
      </div>
      <div className="flex flex-col gap-2 max-lg:flex-col lg:flex-row lg:gap-2">
        <button
          type="button"
          onClick={() => {
            if (!customFrom || !customTo) return;
            onApplyCustom();
            setShowCustom(false);
          }}
          className={`w-full flex-1 ${adminTheme.btnPrimary}`}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={() => {
            setShowCustom(false);
            setShowDropdown(false);
          }}
          className={`w-full max-lg:w-full lg:w-auto ${adminTheme.btnSecondary}`}
        >
          Cancel
        </button>
      </div>
    </>
  );

  return (
    <div className={wrapperClass}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setShowDropdown(!showDropdown);
          setShowCustom(false);
        }}
        className={triggerClass}
        aria-expanded={showDropdown || showCustom}
        aria-haspopup="listbox"
      >
        <span className={field ? 'truncate' : undefined}>{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform dark:text-zinc-500 ${
            field ? 'absolute end-2.5 top-1/2 -translate-y-1/2' : ''
          } ${showDropdown ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {field ? (
        <>
          {showDropdown && listPos
            ? createPortal(
                <div ref={listRef} style={listPos} className={adminDropdownPanelClass} role="listbox">
                  {listPanel}
                </div>,
                document.body,
              )
            : null}
          {showCustom && customPos
            ? createPortal(
                <div
                  ref={customRef}
                  style={{
                    ...customPos,
                    width: Math.max(customPos.width ?? 0, 280),
                    maxWidth: 'min(28rem, calc(100vw - 1.5rem))',
                  }}
                  className={`${adminDropdownPanelClass} p-4`}
                >
                  {customPanel}
                </div>,
                document.body,
              )
            : null}
        </>
      ) : (
        <>
          {showDropdown && (
            <div className={`${adminDropdownPanelClass} absolute end-0 z-50 mt-1.5 w-56`} role="listbox">
              {listPanel}
            </div>
          )}
          {showCustom && (
            <div
              className={`${adminDropdownPanelClass} absolute end-0 z-50 mt-1.5 w-[min(28rem,calc(100vw-1.5rem))] p-4`}
            >
              {customPanel}
            </div>
          )}
        </>
      )}
    </div>
  );
}
