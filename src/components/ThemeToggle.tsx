import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const { resolved, toggleLightDark } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      onClick={toggleLightDark}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:border-brand-200 hover:bg-brand-50/50 hover:text-stone-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-brand-500/40 dark:hover:bg-zinc-700 dark:hover:text-white ${className}`}
      aria-label={isDark ? t('layout.theme.switchToLight') : t('layout.theme.switchToDark')}
      title={isDark ? t('layout.theme.lightMode') : t('layout.theme.darkMode')}
    >
      {isDark ? <Sun className="h-[1.125rem] w-[1.125rem]" aria-hidden /> : <Moon className="h-[1.125rem] w-[1.125rem]" aria-hidden />}
    </button>
  );
}
