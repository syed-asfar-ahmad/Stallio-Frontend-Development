import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { ChangeEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import type { DropdownProps } from 'react-day-picker';
import { UI } from 'react-day-picker';

const MENU_MAX_HEIGHT = 224;
const VIEWPORT_MARGIN = 12;
const MENU_GAP = 4;
const MENU_Z_INDEX = 300;

function shortDropdownLabel(label: string): string {
  const trimmed = label.trim();
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  return trimmed.slice(0, 3);
}

function computeMenuStyle(anchor: HTMLElement): CSSProperties {
  const r = anchor.getBoundingClientRect();
  const spaceAbove = r.top - VIEWPORT_MARGIN;
  const spaceBelow = window.innerHeight - r.bottom - VIEWPORT_MARGIN;
  const openUp = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;

  if (openUp) {
    return {
      position: 'fixed',
      left: r.left,
      bottom: window.innerHeight - r.top + MENU_GAP,
      width: r.width,
      maxHeight: Math.min(MENU_MAX_HEIGHT, spaceAbove),
      zIndex: MENU_Z_INDEX,
    };
  }

  return {
    position: 'fixed',
    left: r.left,
    top: r.bottom + MENU_GAP,
    width: r.width,
    maxHeight: Math.min(MENU_MAX_HEIGHT, spaceBelow),
    zIndex: MENU_Z_INDEX,
  };
}

export function DayPickerThemedDropdown(props: DropdownProps) {
  const {
    options,
    className,
    classNames,
    components: _c,
    value,
    onChange,
    disabled,
    style,
    id,
    name,
    'aria-label': ariaLabel,
  } = props;

  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const numericValue = typeof value === 'number' ? value : value === '' || value === undefined ? NaN : Number(value);
  const selected = options?.find((o) => o.value === numericValue);

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;
    setMenuStyle(computeMenuStyle(buttonRef.current));
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (buttonRef.current?.contains(t)) return;
      const list = document.getElementById(listId);
      if (list?.contains(t)) return;
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
  }, [open, listId]);

  const pick = (v: number) => {
    if (!onChange || disabled) return;
    const ev = {
      target: { value: String(v) },
      currentTarget: { value: String(v) },
    } as unknown as ChangeEvent<HTMLSelectElement>;
    onChange(ev);
    setOpen(false);
  };

  const menuList =
    open && options && options.length > 0 && menuStyle
      ? createPortal(
          <ul
            id={listId}
            role="listbox"
            style={menuStyle}
            className="scrollbar-none overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-black/40"
            data-day-picker-dropdown-menu=""
          >
            {options.map((opt) => {
              const isActive = opt.value === numericValue;
              return (
                <li key={opt.value} role="presentation" className="px-0.5">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    disabled={opt.disabled}
                    onClick={() => !opt.disabled && pick(opt.value)}
                    className={[
                      'flex w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
                      isActive
                        ? 'bg-brand-50 font-semibold text-brand-900 dark:bg-brand-950/40 dark:text-brand-100'
                        : 'text-stone-700 hover:bg-stone-50 dark:text-zinc-300 dark:hover:bg-zinc-800',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                    ].join(' ')}
                  >
                    {shortDropdownLabel(String(opt.label))}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <span
      ref={rootRef}
      data-disabled={disabled ? true : undefined}
      className={classNames[UI.DropdownRoot]}
    >
      <button
        ref={buttonRef}
        type="button"
        id={id}
        name={name}
        style={style}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        className={[
          'inline-flex min-h-7 max-w-full items-center gap-1 rounded-md border border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 text-xs font-semibold text-stone-800 dark:text-zinc-100 shadow-sm transition-colors',
          'hover:border-brand-300 hover:bg-brand-50/70 dark:hover:border-brand-600 dark:hover:bg-brand-950/35',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="truncate tabular-nums">
          {selected?.label != null ? shortDropdownLabel(String(selected.label)) : '\u00a0'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-brand-600 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {menuList}
    </span>
  );
}
