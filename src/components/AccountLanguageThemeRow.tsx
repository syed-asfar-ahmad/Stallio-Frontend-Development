import { useTranslation } from 'react-i18next';
import { getFlagUrl } from '../lib/countryCurrencyOptions';

const LANGUAGES = [
  { code: 'en' as const, flagCc: 'us', labelKey: 'dashboard.settings.langEnglish' },
  { code: 'es' as const, flagCc: 'es', labelKey: 'dashboard.settings.langSpanish' },
  { code: 'ar' as const, flagCc: 'sa', labelKey: 'dashboard.settings.langArabic' },
];
const FLAG_SRC_WIDTH = 320;
const FLAG_SRC_HEIGHT = 213;

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 sm:h-4 sm:w-4 ${
        selected ? 'border-brand-500 dark:border-brand-400' : 'border-stone-300 dark:border-zinc-500'
      }`}
      aria-hidden
    >
      {selected ? (
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400 sm:h-2 sm:w-2" />
      ) : null}
    </span>
  );
}

export default function AccountLanguageThemeRow() {
  const { t, i18n } = useTranslation();
  const raw = (i18n.resolvedLanguage ?? i18n.language).split('-')[0];
  const currentLang = raw === 'es' ? 'es' : raw === 'ar' ? 'ar' : 'en';

  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">{t('dashboard.settings.languageTitle')}</h3>
      <p className="mt-0.5 text-xs text-stone-500 dark:text-zinc-400">{t('dashboard.settings.languageSubtitle')}</p>

      <div
        className="mt-3 grid min-w-0 grid-cols-3 gap-1.5 max-lg:gap-1.5 sm:gap-3"
        role="radiogroup"
        aria-label={t('layout.language.label')}
      >
        {LANGUAGES.map(({ code, flagCc, labelKey }) => {
          const selected = currentLang === code;
          const flag1x = getFlagUrl(flagCc, 160);
          const flag2x = getFlagUrl(flagCc, 320);
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => void i18n.changeLanguage(code)}
              className={`flex min-w-0 flex-col overflow-hidden rounded-lg border-2 bg-stone-100/80 text-start transition-colors dark:bg-zinc-800/40 sm:rounded-xl ${
                selected
                  ? 'border-brand-500 shadow-sm shadow-brand-500/15 ring-1 ring-brand-500/20 dark:border-brand-400'
                  : 'border-stone-200 dark:border-zinc-600 hover:border-stone-300 dark:hover:border-zinc-500'
              }`}
            >
              <div className="flex flex-1 items-center justify-center border-b border-stone-200/90 px-2 py-2 dark:border-zinc-600/90 sm:px-3 sm:py-3">
                <div className="aspect-[3/2] w-full max-w-[9.5rem] overflow-hidden rounded-lg bg-stone-200/40 shadow-sm ring-1 ring-stone-900/[0.06] dark:bg-zinc-950/65 dark:ring-white/[0.06] sm:max-w-[11rem]">
                  <img
                    src={flag2x}
                    srcSet={`${flag1x} 1x, ${flag2x} 2x`}
                    sizes="(max-width: 640px) 28vw, 11rem"
                    width={FLAG_SRC_WIDTH}
                    height={FLAG_SRC_HEIGHT}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    decoding="async"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-white/95 dark:bg-zinc-900/95">
                <RadioDot selected={selected} />
                <span className="min-w-0 truncate text-xs font-medium text-stone-900 dark:text-zinc-100 sm:text-sm">
                  {t(labelKey)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
