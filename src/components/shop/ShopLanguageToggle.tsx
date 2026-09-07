import { SHOP_CONTENT_LANGUAGES } from '../../lib/shopContentLanguages';
import { useShopLanguage } from '../../context/ShopLanguageContext';

export default function ShopLanguageToggle() {
  const { lang, setLang, t, enabledLangs } = useShopLanguage();
  const items = SHOP_CONTENT_LANGUAGES.filter((l) => enabledLangs.includes(l.id));

  if (items.length <= 1) return null;

  return (
    <div
      className="inline-flex items-center rounded-full border border-stone-200/90 bg-stone-50/90 p-0.5 dark:border-zinc-600 dark:bg-zinc-900/90"
      role="group"
      aria-label={t('storeLanguage')}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setLang(item.id)}
          className={`rounded-full px-1.5 py-1 text-[10px] font-bold transition-colors max-lg:px-1.5 max-lg:py-0.5 max-lg:text-[10px] lg:px-2.5 lg:py-1 lg:text-xs ${
            lang === item.id
              ? 'bg-white text-brand-800 shadow-sm ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-500/30'
              : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
          aria-pressed={lang === item.id}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}
