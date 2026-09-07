import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

function WindowChromeDots() {
  return (
    <div className="flex gap-1" aria-hidden>
      <span className="h-2 w-2 rounded-full bg-red-400/90" />
      <span className="h-2 w-2 rounded-full bg-amber-400/90" />
      <span className="h-2 w-2 rounded-full bg-brand-400/90" />
    </div>
  );
}

function LightPreview() {
  return (
    <div className="flex h-full min-h-[4.5rem] flex-col rounded-lg border border-stone-200/90 bg-white p-2 shadow-inner sm:min-h-[5rem]">
      <div className="mb-2 flex items-center justify-between">
        <WindowChromeDots />
        <div className="h-1.5 w-8 rounded-full bg-stone-200" />
      </div>
      <div className="flex flex-1 gap-1.5">
        <div className="w-1/3 rounded bg-stone-100" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-2 rounded bg-stone-200" />
          <div className="h-2 w-4/5 rounded bg-stone-100" />
          <div className="mt-auto h-6 rounded-md bg-brand-100/80" />
        </div>
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div className="flex h-full min-h-[4.5rem] flex-col rounded-lg border border-zinc-600/80 bg-zinc-900 p-2 shadow-inner sm:min-h-[5rem]">
      <div className="mb-2 flex items-center justify-between">
        <WindowChromeDots />
        <div className="h-1.5 w-8 rounded-full bg-zinc-700" />
      </div>
      <div className="flex flex-1 gap-1.5">
        <div className="w-1/3 rounded bg-zinc-800" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-2 rounded bg-zinc-700" />
          <div className="h-2 w-4/5 rounded bg-zinc-800" />
          <div className="mt-auto h-6 rounded-md bg-brand-900/60" />
        </div>
      </div>
    </div>
  );
}

type Props = { className?: string };

export default function ThemeAppearancePicker({ className = '' }: Props) {
  const { t } = useTranslation();
  const { preference, resolved, setPreference } = useTheme();

  const lightSelected = preference === 'light' || (preference === 'system' && resolved === 'light');
  const darkSelected = preference === 'dark' || (preference === 'system' && resolved === 'dark');

  return (
    <div className={className}>
      <div className="mb-3">
        <p className="font-semibold text-stone-900 dark:text-zinc-100 text-sm">{t('dashboard.theme.title')}</p>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">{t('dashboard.theme.subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 max-lg:gap-2 sm:gap-3 w-full max-lg:max-w-full lg:max-w-md">
        <button
          type="button"
          onClick={() => setPreference('light')}
          className={`group flex flex-col overflow-hidden rounded-xl border-2 bg-stone-100/80 text-left transition-colors dark:bg-zinc-800/50 ${
            lightSelected
              ? 'border-brand-500 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500/20'
              : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600'
          }`}
        >
          <div className="bg-stone-200/40 p-2 dark:bg-zinc-900/40">
            <LightPreview />
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3 bg-white/90 dark:bg-zinc-900/90">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                lightSelected ? 'border-brand-500' : 'border-stone-300 dark:border-zinc-500'
              }`}
              aria-hidden
            >
              {lightSelected ? <span className="h-2 w-2 rounded-full bg-brand-500" /> : null}
            </span>
            <span className="text-sm font-medium text-stone-900 dark:text-zinc-100">{t('dashboard.theme.light')}</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setPreference('dark')}
          className={`group flex flex-col overflow-hidden rounded-xl border-2 bg-stone-100/80 text-left transition-colors dark:bg-zinc-800/50 ${
            darkSelected
              ? 'border-brand-500 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500/20'
              : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600'
          }`}
        >
          <div className="bg-zinc-950/80 p-2">
            <DarkPreview />
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3 bg-zinc-900/95">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                darkSelected ? 'border-brand-400' : 'border-zinc-500'
              }`}
              aria-hidden
            >
              {darkSelected ? <span className="h-2 w-2 rounded-full bg-brand-400" /> : null}
            </span>
            <span className="text-sm font-medium text-zinc-100">{t('dashboard.theme.dark')}</span>
          </div>
        </button>
      </div>
      {preference === 'system' && (
        <p className="text-[11px] text-stone-500 dark:text-zinc-500 mt-2">
          {t('dashboard.theme.systemNote')}
        </p>
      )}
    </div>
  );
}
