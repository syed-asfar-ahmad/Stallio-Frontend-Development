import { Check } from 'lucide-react';

type Props = {
  checked: boolean;
  onChange: () => void;
  label: string;
  variant?: 'overlay' | 'inline';
  className?: string;
};

export default function BulkItemCheckbox({
  checked,
  onChange,
  label,
  variant = 'overlay',
  className = '',
}: Props) {
  const isInline = variant === 'inline';
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 shadow-md transition-colors ${
        isInline ? 'mt-5' : 'absolute top-3 left-3 z-10'
      } ${className} ${
        checked
          ? 'border-brand-500 bg-brand-500 text-stone-900 dark:border-brand-400 dark:bg-brand-400'
          : isInline
            ? 'border-stone-300 bg-white text-transparent hover:border-brand-400 dark:border-zinc-600 dark:bg-zinc-900'
            : 'border-white/90 bg-white/95 text-transparent hover:border-brand-400 dark:border-zinc-600 dark:bg-zinc-900/95'
      }`}
    >
      {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
    </button>
  );
}
