import { ChevronDown } from 'lucide-react';
import { adminTheme } from './adminTheme';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export default function AdminSelect({ label, className = '', id, children, ...rest }: Props) {
  const selectId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <div className="min-w-0">
      {label ? (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          className={`admin-themed-select w-full appearance-none pe-9 ${adminTheme.select} focus:ring-2 focus:ring-brand-500/20 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 ${className}`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
          aria-hidden
        />
      </div>
    </div>
  );
}
