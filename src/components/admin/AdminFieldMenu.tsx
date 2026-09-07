import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import {
  adminDropdownItemActiveClass,
  adminDropdownItemClass,
  adminDropdownItemIdleClass,
  adminDropdownPanelClass,
  adminFieldTriggerClass,
} from './adminFieldMenuStyles';
import { useAdminMenuPosition } from './useAdminMenuPosition';

export type AdminFieldMenuOption = { value: string; label: string; flagUrl?: string };

type Props = {
  label: string;
  value: string;
  options: AdminFieldMenuOption[];
  onChange: (value: string) => void;onPick?: (option: AdminFieldMenuOption) => boolean | void;
};

export default function AdminFieldMenu({ label, value, options, onChange, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuPos = useAdminMenuPosition(open, triggerRef);

  const selected = options.find((o) => o.value === value);
  const selectedLabel = selected?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative w-full min-w-0">
      <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={adminFieldTriggerClass}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected?.flagUrl ? (
            <img src={selected.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded object-cover" />
          ) : null}
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronDown
          className={`absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 transition-transform dark:text-zinc-500 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && menuPos
        ? createPortal(
            <div
              ref={panelRef}
              style={menuPos}
              className={adminDropdownPanelClass}
              role="listbox"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => {
                    if (onPick) {
                      const keepOpen = onPick(opt) === false;
                      if (keepOpen) return;
                    }
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`${adminDropdownItemClass} flex items-center gap-2 ${
                    opt.value === value ? adminDropdownItemActiveClass : adminDropdownItemIdleClass
                  }`}
                >
                  {opt.flagUrl ? (
                    <img src={opt.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded object-cover" />
                  ) : null}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
