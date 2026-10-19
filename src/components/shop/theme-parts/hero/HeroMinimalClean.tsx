import ShopImage from '../../../ShopImage';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroMinimalClean({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className={`${containerClass} pt-4 lg:pt-6`}>
      <div className="relative overflow-hidden rounded-[var(--theme-radius-card)]" style={{ background: 'var(--theme-surface-secondary)' }}>
        {/* Background image with overlay */}
        {shop.homeHeroImage && (
          <>
            <ShopImage
              src={shop.homeHeroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)' }} />
          </>
        )}

        {/* Content — centered */}
        <div className={`relative flex min-h-[200px] flex-col items-center justify-center gap-3.5 px-5 py-8 text-center sm:min-h-[250px] lg:min-h-[290px] lg:py-12`}>
          {/* Decorative lines */}
          <div className="flex w-full max-w-xs items-center gap-3" aria-hidden>
            <div className="h-px flex-1 opacity-30" style={{ background: shop.homeHeroImage ? '#fff' : 'var(--theme-text-muted)' }} />
            <div
              className="h-1.5 w-1.5 rotate-45"
              style={{ background: shop.homeHeroImage ? 'rgba(255,255,255,0.5)' : 'var(--theme-primary)' }}
            />
            <div className="h-px flex-1 opacity-30" style={{ background: shop.homeHeroImage ? '#fff' : 'var(--theme-text-muted)' }} />
          </div>

          <h1
            className="max-w-xl text-xl leading-tight sm:text-2xl lg:text-3xl"
            style={{
              color: shop.homeHeroImage ? '#ffffff' : 'var(--theme-text-primary)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-heading-weight)' as unknown as number,
              letterSpacing: 'var(--theme-heading-spacing)',
              textTransform: 'var(--theme-heading-transform)' as unknown as CSSProperties['textTransform'],
            }}
          >
            {heroTitle}
          </h1>

          {introText && (
            <p
              className="max-w-md text-xs leading-relaxed sm:text-sm lg:text-sm"
              style={{ color: shop.homeHeroImage ? 'rgba(255,255,255,0.8)' : 'var(--theme-text-secondary)' }}
            >
              {introText}
            </p>
          )}

          <Link
            to={`/${username}/products`}
            className="inline-flex items-center gap-1.5 rounded-[var(--theme-radius-btn)] px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold no-underline transition-opacity hover:opacity-85"
            style={
              shop.homeHeroImage
                ? { background: '#ffffff', color: '#0a0a0a' }
                : { background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }
            }
          >
            {t('heroBrowse')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Decorative lines again */}
          <div className="flex w-full max-w-xs items-center gap-3" aria-hidden>
            <div className="h-px flex-1 opacity-30" style={{ background: shop.homeHeroImage ? '#fff' : 'var(--theme-text-muted)' }} />
            <div
              className="h-1.5 w-1.5 rotate-45"
              style={{ background: shop.homeHeroImage ? 'rgba(255,255,255,0.5)' : 'var(--theme-primary)' }}
            />
            <div className="h-px flex-1 opacity-30" style={{ background: shop.homeHeroImage ? '#fff' : 'var(--theme-text-muted)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
