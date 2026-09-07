import { useTranslation } from 'react-i18next';
import { SHOP_CONTENT_LANGUAGES, type ShopContentLang } from '../lib/shopContentLanguages';

type Props = {
  value: ShopContentLang;
  onChange: (lang: ShopContentLang) => void;
  filled?: Partial<Record<ShopContentLang, boolean>>;
  languages?: ShopContentLang[];
  className?: string;
};

export default function ContentLanguageTabs({ value, onChange, filled = {}, languages, className = '' }: Props) {
  const { t } = useTranslation();
  const langs = languages ?? SHOP_CONTENT_LANGUAGES.map((l) => l.id);
  const items = SHOP_CONTENT_LANGUAGES.filter((l) => langs.includes(l.id));

  if (items.length <= 1) return null;

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-stone-50/80 p-1 dark:border-zinc-700 dark:bg-zinc-950/60 ${className}`}
      role="tablist"
      aria-label={t('dashboard.common.contentLanguage')}
    >
      {items.map((lang) => {
        const active = value === lang.id;
        const hasContent = filled[lang.id];
        return (
          <button
            key={lang.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(lang.id)}
            className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? 'bg-white text-brand-800 shadow-sm ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-500/30'
                : 'text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100'
            }`}
          >
            <span>{lang.short}</span>
            <span className="hidden sm:inline">{lang.label}</span>
            {hasContent ? (
              <span
                className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-brand-500' : 'bg-brand-500'}`}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
