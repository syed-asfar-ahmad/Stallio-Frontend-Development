import { Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import AdminNotificationsBell from './AdminNotificationsBell';
import { adminTheme } from './adminTheme';

type Props = {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
};
export function AdminTopBarStrip() {
  return (
    <div className={`${adminTheme.shellHeader} justify-end gap-3 border-e-0 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:bg-zinc-900/90`}>
      <AdminNotificationsBell />
      <ThemeToggle />
    </div>
  );
}

export default function AdminTopBar({ title, subtitle, onOpenMobileMenu }: Props) {
  return (
    <header
      className={`sticky top-0 z-30 shrink-0 border-b border-stone-200/90 bg-white/90 backdrop-blur-md lg:hidden dark:border-zinc-800 dark:bg-zinc-900/90`}
    >
      <div className={`${adminTheme.shellHeader} mx-auto w-full max-w-[1920px] justify-between gap-3 border-b-0 px-4 sm:px-6`}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="shrink-0 rounded-xl p-2.5 text-stone-600 transition-colors hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-800 dark:text-zinc-100">{title}</p>
            {subtitle ? <p className="truncate text-xs text-stone-500 dark:text-zinc-400">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AdminNotificationsBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
