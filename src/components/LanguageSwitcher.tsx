import { useTranslation } from 'react-i18next';

const OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'ar', label: 'AR' },
] as const;

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const raw = (i18n.resolvedLanguage ?? i18n.language).split('-')[0];
  const current = raw === 'es' ? 'es' : raw === 'ar' ? 'ar' : 'en';

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-xl border border-stone-200 bg-white p-0.5 dark:border-zinc-600 dark:bg-zinc-800 ${className}`}
      role="group"
      aria-label={t('layout.language.label')}
    >
      <span className="sr-only">{t('layout.language.label')}</span>
      {OPTIONS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => void i18n.changeLanguage(code)}
          className={`rounded-lg px-1.5 py-1.5 text-xs font-bold transition-colors sm:px-2 ${
            current === code
              ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white'
          }`}
          aria-pressed={current === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
