import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import { STORE_HERO_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import type { ThemeHeroProps } from '../types';

export default function HeroFullBanner({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className={`${containerClass} pt-4 lg:pt-7`}>
      <div
        className="overflow-hidden rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)]"
        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
      >
        <div className="grid min-w-0 max-lg:grid-cols-1 lg:grid-cols-2 lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center p-4 max-lg:order-2 max-lg:pt-3 lg:order-none lg:px-7 lg:py-6">
            <h1
              className="text-xl leading-snug lg:text-[1.8125rem]"
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
              <p className="mt-2 max-w-lg text-sm leading-relaxed lg:mt-3 lg:text-base" style={{ color: 'var(--theme-text-secondary)' }}>
                {introText}
              </p>
            ) : null}
            <div className="mt-4 flex flex-col gap-2 max-lg:w-full lg:mt-6 lg:flex-row lg:flex-wrap lg:gap-2.5">
              <Link
                to={`/${username}/products`}
                className="inline-flex w-full items-center justify-center rounded-[var(--theme-radius-btn)] px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-[var(--theme-shadow-card)] transition-all lg:w-auto lg:px-5"
                style={{ background: 'var(--theme-primary)' }}
              >
                {t('heroBrowse')}
              </Link>
              <Link
                to={`/${username}/contact`}
                className="inline-flex w-full items-center justify-center rounded-[var(--theme-radius-btn)] border-2 px-4 py-2.5 text-sm font-semibold no-underline transition-colors lg:w-auto lg:px-5"
                style={{ borderColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)', background: 'var(--theme-surface)' }}
              >
                {t('heroContact')}
              </Link>
            </div>
          </div>
          <div
            className={`relative w-full min-w-0 overflow-hidden max-lg:order-1 ${STORE_HERO_ASPECT_CLASS}`}
            style={{ background: 'var(--theme-surface-secondary)' }}
          >
            {shop.homeHeroImage ? (
              <img
                src={shop.homeHeroImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover max-lg:object-cover lg:object-contain"
              />
            ) : shop.logo ? (
              <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-8">
                <img src={shop.logo} alt="" className="max-h-28 w-auto max-w-full object-contain lg:max-h-40" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--theme-primary-light)' }}>
                <ShoppingBag className="h-16 w-16 lg:h-24 lg:w-24" strokeWidth={1.25} aria-hidden />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
