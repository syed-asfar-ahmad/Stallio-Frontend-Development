import { useId } from 'react';
import { Check } from 'lucide-react';

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  id?: string;
  className?: string;
  disabled?: boolean;
};

export default function DashboardCheckbox({ checked, onChange, label, id, className = '', disabled }: Props) {
  const autoId = useId();
  const labelId = id ?? autoId;

  const box = (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
        checked
          ? 'border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-400'
          : 'border-stone-300 bg-white dark:border-zinc-500 dark:bg-zinc-800'
      }`}
      aria-hidden
    >
      {checked ? <Check className="h-3.5 w-3.5 text-stone-900" strokeWidth={3} /> : null}
    </span>
  );

  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      aria-labelledby={label != null ? labelId : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2.5 text-left select-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${className}`}
    >
      {box}
      {label != null ? (
        <span id={labelId} className="text-sm font-medium text-stone-700 dark:text-zinc-300">
          {label}
        </span>
      ) : null}
    </button>
  );
}
