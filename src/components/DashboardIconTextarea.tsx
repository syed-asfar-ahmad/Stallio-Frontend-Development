import type { LucideIcon } from 'lucide-react';
import type { TextareaHTMLAttributes } from 'react';
import { DASHBOARD_TEXTAREA } from '../lib/dashboardFormClasses';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  icon: LucideIcon;
};

export default function DashboardIconTextarea({ icon: Icon, className = '', ...rest }: Props) {
  return (
    <div className="relative min-w-0">
      <Icon
        className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-stone-400 dark:text-zinc-500"
        aria-hidden
      />
      <textarea
        {...rest}
        className={`${DASHBOARD_TEXTAREA} min-h-[5rem] w-full resize-y py-3 pe-4 ps-10 ${className}`}
      />
    </div>
  );
}
