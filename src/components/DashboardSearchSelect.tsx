import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type DashboardSearchSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: DashboardSearchSelectOption[];
  placeholder: string;
  noResultsLabel?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
  disabled?: boolean;
};

export default function DashboardSearchSelect({
  value,
  onChange,
  options,
  placeholder,
  noResultsLabel = 'No results',
  className = '',
  id,
  'aria-label': ariaLabel,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function closeMenu() {
    setOpen(false);
    setQuery(selected?.label ?? '');
  }

  useEffect(() => {
    if (disabled && open) closeMenu();
  }, [disabled, open, selected?.label]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, selected?.label]);

  function openMenu() {
    if (disabled) return;
    setOpen(true);
    setQuery('');
  }

  function handleSelect(option: DashboardSearchSelectOption) {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative flex w-full items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          readOnly={disabled}
          value={open ? query : (selected?.label ?? '')}
          placeholder={placeholder}
          onFocus={openMenu}
          onChange={(e) => {
            if (disabled) return;
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange('');
          }}
          className={`w-full rounded-xl border-2 border-stone-200 bg-stone-50/30 py-3 pl-4 pr-10 text-sm font-medium text-stone-900 placeholder-stone-400 transition-colors dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder-zinc-500 ${
            disabled
              ? 'cursor-not-allowed opacity-60'
              : 'hover:border-brand-200 hover:bg-brand-50/40 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            if (open) closeMenu();
            else {
              inputRef.current?.focus();
              openMenu();
            }
          }}
          className="absolute right-3 flex h-6 w-6 items-center justify-center text-stone-500 dark:text-zinc-400 disabled:opacity-60"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1.5 max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-stone-500 dark:text-zinc-400">{noResultsLabel}</li>
          ) : (
            filtered.map((opt) => {
              const isActive = opt.value === value;
              return (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                    className={`flex w-full min-w-0 items-center px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200'
                        : 'text-stone-700 hover:bg-stone-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="truncate" title={opt.label}>
                      {opt.label}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
