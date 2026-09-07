import type { ButtonHTMLAttributes } from 'react';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;activeClassName?: string;
};export default function DashboardSwitch({
  checked,
  onCheckedChange,
  activeClassName = 'border-brand-500 bg-brand-500',
  className = '',
  ...rest
}: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${
        rest.disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${
        checked
          ? activeClassName
          : 'border-stone-300 bg-stone-200 dark:border-zinc-600 dark:bg-zinc-600'
      } ${className}`}
      {...rest}
    >
      <span
        className={`absolute top-1/2 block h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-[inset-inline-start] duration-200 ease-out dark:bg-zinc-900 ${
          checked ? 'start-[calc(100%-25px)]' : 'start-[3px]'
        }`}
      />
    </button>
  );
}
