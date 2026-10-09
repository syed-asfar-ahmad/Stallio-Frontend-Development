import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type ShopSelectOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: ShopSelectOption[];
  className?: string;
  id?: string;
  'aria-label'?: string;
  onOpenChange?: (open: boolean) => void;
};

export default function ShopSelect({
  value,
  onChange,
  options,
  className = '',
  id,
  'aria-label': ariaLabel,
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
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
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-theme-input border-2 border-theme-border bg-theme-surface px-3 py-2.5 text-start text-sm font-semibold text-theme-text shadow-theme-card transition-colors hover:border-theme-primary hover:bg-theme-primary-light max-lg:min-w-0 lg:min-w-[12.5rem] lg:px-4 lg:py-3"
      >
        <span className="truncate">{selected?.label ?? '\u00a0'}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-theme-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && options.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute end-0 top-full z-10 mt-1.5 min-w-full w-max max-h-[min(18rem,55vh)] overflow-y-auto rounded-theme-card border border-theme-border bg-theme-surface py-1 shadow-theme-dropdown"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full px-3.5 py-2.5 text-start text-sm font-medium transition-colors ${
                    active
                      ? 'bg-theme-primary-light text-theme-primary font-semibold'
                      : 'text-theme-text hover:bg-theme-surface-secondary'
                  }`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
