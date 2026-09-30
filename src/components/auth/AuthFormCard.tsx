import type { ReactNode } from 'react';

import { BezelShell } from '@/components/ui/bezel-shell';
import { cn } from '@/lib/utils';

type AuthFormCardProps = {
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export function AuthFormCard({
  children,
  className,
  compact = false,
}: AuthFormCardProps) {
  return (
    <BezelShell
      className={cn('rounded-[2rem]', className)}
      innerClassName={cn(
        'rounded-[calc(2rem-0.375rem)]',
        compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8 md:p-9',
      )}
    >
      {children}
    </BezelShell>
  );
}

export const authPrimaryBtnClass =
  'bg-brand text-brand-foreground hover:ring-brand inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-medium ring-offset-2 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-black';

export function AuthAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="bg-destructive/10 text-destructive ring-destructive/20 rounded-2xl px-4 py-3 text-sm leading-6 ring-1"
    >
      {children}
    </div>
  );
}
