import { SHOP_CONTENT_LANGUAGES } from '../../lib/shopContentLanguages';
import { useShopLanguage } from '../../context/ShopLanguageContext';

export default function ShopLanguageToggle() {
  const { lang, setLang, t, enabledLangs } = useShopLanguage();
  const items = SHOP_CONTENT_LANGUAGES.filter((l) => enabledLangs.includes(l.id));

  if (items.length <= 1) return null;

  return (
    <div
      className="inline-flex items-center rounded-full border border-theme-border bg-theme-surface p-0.5"
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
              ? 'bg-theme-primary text-theme-primary-contrast shadow-sm'
              : 'text-theme-muted hover:text-theme-primary'
          }`}
          aria-pressed={lang === item.id}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}
