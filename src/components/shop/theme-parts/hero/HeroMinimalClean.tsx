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
    <section className={`${containerClass} pt-6 lg:pt-10`}>
      <div className="relative overflow-hidden rounded-[var(--theme-radius-card)]" style={{ background: 'var(--theme-surface-secondary)' }}>
        {/* Background image with overlay */}
        {shop.homeHeroImage && (
          <>
            <img
              src={shop.homeHeroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)' }} />
          </>
        )}

        {/* Content — centered */}
        <div className={`relative flex min-h-[260px] flex-col items-center justify-center gap-5 px-6 py-14 text-center lg:min-h-[380px] lg:py-20`}>
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
            className="max-w-2xl text-2xl leading-tight sm:text-3xl lg:text-5xl"
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
              className="max-w-lg text-sm leading-relaxed lg:text-base"
              style={{ color: shop.homeHeroImage ? 'rgba(255,255,255,0.8)' : 'var(--theme-text-secondary)' }}
            >
              {introText}
            </p>
          )}

          <Link
            to={`/${username}/products`}
            className="inline-flex items-center gap-2 rounded-[var(--theme-radius-btn)] px-7 py-3 text-sm font-semibold no-underline transition-opacity hover:opacity-85"
            style={
              shop.homeHeroImage
                ? { background: '#ffffff', color: '#0a0a0a' }
                : { background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }
            }
          >
            {t('heroBrowse')}
            <ArrowRight className="h-4 w-4" />
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
