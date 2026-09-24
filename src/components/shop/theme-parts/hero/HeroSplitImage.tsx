import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroSplitImage({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className="w-full overflow-hidden py-4 sm:py-6 lg:py-8">
      <div className={containerClass}>
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center rounded-[var(--theme-radius-card)] border p-6 sm:p-8 lg:p-10"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
            boxShadow: 'var(--theme-shadow-card)',
          }}
        >
          {/* Left Column: Bold Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full w-fit"
              style={{
                background: 'var(--theme-badge-bg)',
                color: 'var(--theme-badge-text)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Store</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.15]"
              style={{
                color: 'var(--theme-text-primary)',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: 'var(--theme-heading-weight)' as unknown as number,
                letterSpacing: 'var(--theme-heading-spacing)',
                textTransform: 'var(--theme-heading-transform)' as unknown as CSSProperties['textTransform'],
              }}
            >
              {heroTitle}
            </h1>

            {introText ? (
              <p
                className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {introText}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/${username}/products`}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-95"
                style={{ background: 'var(--theme-primary)' }}
              >
                <ShoppingBag className="w-4 h-4" />
                {t('heroBrowse')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <Link
                to={`/${username}/contact`}
                className="inline-flex items-center justify-center rounded-[var(--theme-radius-btn)] border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-stone-50 dark:hover:bg-zinc-800"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                  background: 'var(--theme-surface)',
                }}
              >
                {t('heroContact')}
              </Link>
            </div>
          </div>

          {/* Right Column: Split Image Media Display */}
          <div className="lg:col-span-5 relative">
            <div
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-square overflow-hidden rounded-[var(--theme-radius-card)] border"
              style={{
                borderColor: 'var(--theme-border)',
                background: 'var(--theme-surface-secondary)',
              }}
            >
              {shop.homeHeroImage ? (
                <img
                  src={shop.homeHeroImage}
                  alt={shop.shopName}
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              ) : shop.logo ? (
                <div className="flex h-full w-full items-center justify-center p-8">
                  <img
                    src={shop.logo}
                    alt={shop.shopName}
                    className="max-h-36 sm:max-h-48 w-auto max-w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  <ShoppingBag className="h-20 w-20 lg:h-28 lg:w-28 opacity-60" strokeWidth={1.25} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
