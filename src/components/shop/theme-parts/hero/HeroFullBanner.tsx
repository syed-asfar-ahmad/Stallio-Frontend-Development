import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroFullBanner({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const hasImage = Boolean(shop.homeHeroImage);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || hasImage));

  if (!showHero) return null;

  return (
    <section className={`${containerClass} py-4 lg:py-6`}>
      <div
        className="relative isolate flex min-h-[320px] items-center overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] lg:min-h-[460px]"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        {hasImage ? (
          <>
            <img
              src={shop.homeHeroImage!}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10"
              aria-hidden
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--theme-primary-light) 0%, var(--theme-surface) 68%)',
            }}
            aria-hidden
          />
        )}

        <div className="relative w-full max-w-3xl space-y-5 px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
          <h1
            className="text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl"
            style={{
              color: hasImage ? '#ffffff' : 'var(--theme-text-primary)',
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
              className="max-w-xl text-sm leading-relaxed sm:text-base lg:text-lg"
              style={{ color: hasImage ? 'rgba(255,255,255,0.86)' : 'var(--theme-text-secondary)' }}
            >
              {introText}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to={`/${username}/products`}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] bg-theme-primary px-6 py-3 text-sm font-semibold text-theme-primary-contrast no-underline shadow-sm transition-colors hover:bg-theme-primary-hover"
            >
              {t('heroBrowse')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
            <Link
              to={`/${username}/contact`}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] border px-6 py-3 text-sm font-semibold no-underline transition-colors"
              style={
                hasImage
                  ? { borderColor: 'rgba(255,255,255,0.65)', color: '#ffffff', background: 'rgba(0,0,0,0.15)' }
                  : { borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', background: 'transparent' }
              }
            >
              {t('heroContact')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
