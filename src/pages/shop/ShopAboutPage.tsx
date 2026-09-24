import { useShop } from '../../context/ShopContext';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import {
  getLocalizedAboutContent,
  getLocalizedAboutTitle,
} from '../../lib/shopContentLanguages';
import { prepareShopAboutHtml, SHOP_RICH_TEXT_BODY_CLASS } from '../../lib/prepareShopAboutHtml';

const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';
const DEFAULT_ABOUT_TEXT_COLOR = '#ffffff';

function getSafeHexColor(value: string | null | undefined, fallback: string = DEFAULT_ABOUT_TEXT_COLOR): string {
  const trimmed = String(value ?? '').trim();
  return /^#([0-9A-Fa-f]{6})$/.test(trimmed) ? trimmed : fallback;
}

export default function ShopAboutPage() {
  const { shop } = useShop();
  const { t, lang } = useShopLanguage();

  if (!shop) return null;

  const aboutTitleText =
    getLocalizedAboutTitle(shop, lang) || t('aboutTitleFallback', { shopName: shop.shopName });
  const aboutContentHtml = getLocalizedAboutContent(shop, lang);
  const heroImage = shop.aboutImages?.[0];
  const aboutHeroTextColor = getSafeHexColor(shop.aboutTextColor);

  return (
    <main className="flex-1 pb-8 max-lg:pb-8 lg:pb-14">
      <section className={`${containerClass} pt-4 max-lg:pt-4 lg:pt-8`}>
        <header className="relative overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface shadow-theme-card">
          {heroImage ? (
            <div className="relative w-full aspect-[16/10] lg:aspect-[12/5]">
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-stone-900/45 to-transparent" />
              <div className="absolute inset-0 flex max-w-2xl flex-col justify-end p-4 max-lg:p-4 sm:p-8 lg:p-12">
                <p
                  className="mb-2 inline-flex w-fit items-center gap-2 rounded-theme-badge border border-white/30 bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm max-lg:mb-2 lg:mb-4 lg:px-3 lg:py-1 lg:text-xs"
                  style={{ color: aboutHeroTextColor }}
                >
                  {t('aboutBadge')}
                </p>
                <h1
                  className="text-xl max-lg:leading-snug font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
                  style={{ color: aboutHeroTextColor }}
                >
                  {aboutTitleText}
                </h1>
                <p
                  className="mt-2 max-lg:mt-2 max-w-xl text-xs max-lg:text-xs lg:mt-3 lg:text-base"
                  style={{ color: aboutHeroTextColor, opacity: 0.9 }}
                >
                  {t('aboutSubtitleImage', { shopName: shop.shopName })}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 max-lg:p-5 sm:p-10 lg:p-12">
              <p className="mb-3 inline-flex items-center gap-2 rounded-theme-badge border border-theme-border bg-theme-primary-light px-3 py-1 text-xs font-semibold text-theme-primary max-lg:mb-3 lg:mb-4">
                {t('aboutLabel')}
              </p>
              <h1 className="text-2xl max-lg:leading-snug font-bold leading-tight tracking-tight text-theme-text sm:text-4xl lg:text-5xl">
                {aboutTitleText}
              </h1>
              <p className="mt-2 max-lg:mt-2 max-w-2xl text-sm text-theme-text-muted lg:mt-3 lg:text-base">
                {t('aboutSubtitlePlain', { shopName: shop.shopName })}
              </p>
            </div>
          )}
        </header>
      </section>

      <section className={`${containerClass} pt-5 max-lg:pt-5 lg:pt-10`}>
        <article className="w-full rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:p-4 sm:p-8 lg:p-10">
          {aboutContentHtml ? (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`text-sm max-lg:text-sm text-theme-text-secondary lg:text-lg ${SHOP_RICH_TEXT_BODY_CLASS}`}
              dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
            />
          ) : (
            <p className="text-sm text-theme-text-muted lg:text-base">{t('aboutEmpty')}</p>
          )}
        </article>
      </section>
    </main>
  );
}
