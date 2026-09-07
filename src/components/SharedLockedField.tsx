import type { ReactNode } from 'react';
import { DASHBOARD_INPUT_LOCKED } from '../lib/dashboardFormClasses';

type Props = {
  locked?: boolean;
  children: ReactNode;
  className?: string;
};

export default function SharedLockedField({ children, className = '' }: Props) {
  if (!className) return <>{children}</>;
  return <div className={`min-w-0 ${className}`}>{children}</div>;
}

export function sharedLockedInputClass(locked: boolean, base: string): string {
  return locked ? `${base} ${DASHBOARD_INPUT_LOCKED}` : base;
}
