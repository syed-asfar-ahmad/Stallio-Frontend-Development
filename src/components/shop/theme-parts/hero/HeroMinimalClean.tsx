import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import { STORE_HERO_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import type { ThemeHeroProps } from '../types';

export default function HeroMinimalClean({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className="w-full">
      <div
        className={`relative w-full ${STORE_HERO_ASPECT_CLASS} overflow-hidden`}
        style={{ background: 'var(--theme-surface-secondary)' }}
      >
        {shop.homeHeroImage ? (
          <img src={shop.homeHeroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : null}
        <div className={`${containerClass} absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center`}>
          <h1
            className="max-w-2xl text-2xl lg:text-5xl"
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
            <p className="max-w-md text-sm leading-relaxed lg:text-base" style={{ color: 'var(--theme-text-secondary)' }}>
              {introText}
            </p>
          ) : null}
          <Link
            to={`/${username}/products`}
            className="mt-2 border-b pb-0.5 text-xs font-light uppercase tracking-[0.25em] no-underline"
            style={{ borderColor: 'var(--theme-text-primary)', color: 'var(--theme-text-primary)' }}
          >
            {t('heroBrowse')}
          </Link>
        </div>
      </div>
    </section>
  );
}
