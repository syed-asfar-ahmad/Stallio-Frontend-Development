import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AuthFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AuthField({
  id,
  label,
  hint,
  error,
  success,
  required,
  trailing,
  children,
  className,
}: AuthFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-foreground text-sm font-medium">
          {label}
          {required ? (
            <span className="text-brand ml-0.5" aria-hidden>
              *
            </span>
          ) : null}
        </label>
        {trailing}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm leading-5">
          {error}
        </p>
      ) : success ? (
        <p
          id={`${id}-success`}
          className="text-sm leading-5 text-emerald-600 dark:text-emerald-400"
        >
          {success}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs leading-5">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
