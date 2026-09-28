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
        <header
          className="relative overflow-hidden border"
          style={{
            borderRadius: 'var(--theme-radius-card)',
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
            boxShadow: 'var(--theme-shadow-card)',
          }}
        >
          {heroImage ? (
            <div className="relative w-full aspect-[16/10] lg:aspect-[12/5]">
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
              <div className="absolute inset-0 flex max-w-2xl flex-col justify-end p-5 sm:p-8 lg:p-12">
                <p
                  className="mb-2 inline-flex w-fit items-center gap-2 border border-white/30 bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm lg:mb-4 lg:px-3 lg:py-1 lg:text-xs"
                  style={{
                    color: aboutHeroTextColor,
                    borderRadius: 'var(--theme-radius-badge)',
                  }}
                >
                  {t('aboutBadge')}
                </p>
                <h1
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                  style={{
                    color: aboutHeroTextColor,
                    fontFamily: 'var(--theme-font-heading)',
                    letterSpacing: 'var(--theme-heading-spacing)',
                    textTransform: 'var(--theme-heading-transform)' as any,
                  }}
                >
                  {aboutTitleText}
                </h1>
                <p
                  className="mt-2 max-w-xl text-xs sm:text-sm lg:text-base opacity-90"
                  style={{ color: aboutHeroTextColor }}
                >
                  {t('aboutSubtitleImage', { shopName: shop.shopName })}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-10 lg:p-12">
              <p
                className="mb-3 inline-flex items-center gap-2 border px-3 py-1 text-xs font-semibold"
                style={{
                  borderRadius: 'var(--theme-radius-badge)',
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary)',
                }}
              >
                {t('aboutLabel')}
              </p>
              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight"
                style={{
                  color: 'var(--theme-text-primary)',
                  fontFamily: 'var(--theme-font-heading)',
                  letterSpacing: 'var(--theme-heading-spacing)',
                  textTransform: 'var(--theme-heading-transform)' as any,
                }}
              >
                {aboutTitleText}
              </h1>
              <p
                className="mt-2 max-w-2xl text-sm lg:text-base leading-relaxed"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {t('aboutSubtitlePlain', { shopName: shop.shopName })}
              </p>
            </div>
          )}
        </header>
      </section>

      <section className={`${containerClass} pt-5 max-lg:pt-5 lg:pt-10`}>
        <article
          className="w-full border p-6 sm:p-8 lg:p-10"
          style={{
            borderRadius: 'var(--theme-radius-card)',
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
            boxShadow: 'var(--theme-shadow-card)',
          }}
        >
          {aboutContentHtml ? (
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className={`text-sm lg:text-lg leading-relaxed ${SHOP_RICH_TEXT_BODY_CLASS}`}
              style={{ color: 'var(--theme-text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
            />
          ) : (
            <p className="text-sm lg:text-base" style={{ color: 'var(--theme-text-muted)' }}>
              {t('aboutEmpty')}
            </p>
          )}
        </article>
      </section>
    </main>
  );
}
