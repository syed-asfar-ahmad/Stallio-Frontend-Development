import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { DASHBOARD_INPUT_LOCKED } from '../lib/dashboardFormClasses';

export type DashboardSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: DashboardSelectOption[];
  className?: string;
  id?: string;
  'aria-label'?: string;
  truncateSelected?: boolean;
  menuMinWidth?: boolean;
  portalMenu?: boolean;
  disabled?: boolean;
};

const VIEWPORT_MARGIN = 8;
const MENU_GAP = 4;
const MENU_MAX_HEIGHT = 240;

function computePortalMenuStyle(
  anchor: HTMLElement,
  menu: HTMLElement | null,
  menuMinWidth: boolean,
): CSSProperties {
  const r = anchor.getBoundingClientRect();
  const menuH = Math.min(menu?.offsetHeight ?? MENU_MAX_HEIGHT, MENU_MAX_HEIGHT);
  const spaceBelow = window.innerHeight - r.bottom - VIEWPORT_MARGIN - MENU_GAP;
  const spaceAbove = r.top - VIEWPORT_MARGIN - MENU_GAP;
  const openAbove = spaceBelow < Math.min(menuH, MENU_MAX_HEIGHT) && spaceAbove > spaceBelow;
  const available = Math.max(120, Math.min(MENU_MAX_HEIGHT, openAbove ? spaceAbove : spaceBelow));

  let top = openAbove ? r.top - available - MENU_GAP : r.bottom + MENU_GAP;
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, window.innerHeight - available - VIEWPORT_MARGIN));

  const width = Math.min(r.width, window.innerWidth - VIEWPORT_MARGIN * 2);
  let left = r.left;
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - width - VIEWPORT_MARGIN));

  return {
    position: 'fixed',
    top,
    left,
    width,
    maxWidth: width,
    zIndex: 260,
    maxHeight: available,
  };
}

export default function DashboardSelect({
  value,
  onChange,
  options,
  className = '',
  id,
  'aria-label': ariaLabel,
  truncateSelected = true,
  menuMinWidth = false,
  portalMenu = true,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  const updatePortalPosition = useCallback(() => {
    const anchor = triggerRef.current;
    if (!anchor || !open || !portalMenu) {
      setPortalStyle(null);
      return;
    }
    setPortalStyle(computePortalMenuStyle(anchor, menuRef.current, menuMinWidth));
  }, [open, portalMenu, menuMinWidth]);

  useLayoutEffect(() => {
    if (!open || !portalMenu) {
      setPortalStyle(null);
      return;
    }
    updatePortalPosition();
    const raf = requestAnimationFrame(() => {
      updatePortalPosition();
      requestAnimationFrame(updatePortalPosition);
    });
    const menu = menuRef.current;
    const ro = menu ? new ResizeObserver(updatePortalPosition) : null;
    if (menu && ro) ro.observe(menu);
    window.addEventListener('scroll', updatePortalPosition, true);
    window.addEventListener('resize', updatePortalPosition);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('scroll', updatePortalPosition, true);
      window.removeEventListener('resize', updatePortalPosition);
    };
  }, [open, portalMenu, updatePortalPosition, options.length]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
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

  useEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    const stopScrollBubble = (e: Event) => e.stopPropagation();
    menu.addEventListener('wheel', stopScrollBubble, { passive: true });
    menu.addEventListener('touchmove', stopScrollBubble, { passive: true });
    return () => {
      menu.removeEventListener('wheel', stopScrollBubble);
      menu.removeEventListener('touchmove', stopScrollBubble);
    };
  }, [open]);

  const menuClassName = `box-border overflow-y-auto overscroll-y-contain overflow-x-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40 ${
    menuMinWidth ? 'min-w-full w-max max-h-60' : portalMenu ? 'w-full' : 'max-h-60'
  }`;

  const menuList = open && options.length > 0 && (
    <ul
      ref={menuRef}
      id={listId}
      role="listbox"
      style={portalMenu ? portalStyle ?? { visibility: 'hidden', position: 'fixed' } : undefined}
      className={
        portalMenu
          ? menuClassName
          : `absolute left-0 top-full z-[200] mt-1 ${menuClassName} ${menuMinWidth ? 'min-w-full w-max' : 'right-0'}`
      }
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <li key={opt.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isActive}
              disabled={opt.disabled}
              onClick={() => {
                if (!opt.disabled) {
                  onChange(opt.value);
                  setOpen(false);
                }
              }}
              className={`flex w-full min-w-0 items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                menuMinWidth ? 'whitespace-nowrap' : ''
              } ${
                isActive
                  ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200'
                  : 'text-stone-700 hover:bg-stone-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {opt.icon ? <span className="shrink-0">{opt.icon}</span> : null}
              <span className={menuMinWidth ? undefined : 'min-w-0 truncate'} title={opt.label}>
                {opt.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 border-stone-200 bg-stone-50/30 px-4 py-3 text-left text-sm font-medium text-stone-900 transition-colors dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 ${
          disabled
            ? `cursor-not-allowed ${DASHBOARD_INPUT_LOCKED} hover:border-stone-200 hover:bg-stone-100/80 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80`
            : 'hover:border-brand-200 hover:bg-brand-50/40 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40'
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {selected?.icon ? <span className="shrink-0">{selected.icon}</span> : null}
          <span className={truncateSelected ? 'truncate' : 'whitespace-nowrap'}>{selected?.label ?? '\u00a0'}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-500 transition-transform dark:text-zinc-400 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {portalMenu && menuList ? createPortal(menuList, document.body) : !portalMenu ? menuList : null}
    </div>
  );
}
