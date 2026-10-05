import { ArrowRight, ShoppingBag, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroFullBanner({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className={`${containerClass} pt-4 lg:pt-6`}>
      <div
        className="relative overflow-hidden rounded-[var(--theme-radius-card)] border"
        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
      >
        {/* Decorative background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, var(--theme-primary-light) 0%, var(--theme-surface) 60%)',
          }}
          aria-hidden
        />

        <div className="relative grid min-w-0 grid-cols-1 lg:grid-cols-2 lg:items-stretch">
          {/* Left — Text Content */}
          <div className="flex min-w-0 flex-col justify-center gap-4 p-5 lg:px-10 lg:py-12">
            {/* Badge */}
            {shop.category && (
              <span
                className="inline-flex w-fit items-center gap-1.5 rounded-[var(--theme-radius-badge)] border px-3 py-1 text-xs font-semibold"
                style={{
                  borderColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary)',
                  background: 'var(--theme-primary-light)',
                }}
              >
                <Tag className="h-3 w-3" />
                {shop.category}
              </span>
            )}

            {/* Headline */}
            <h1
              className="text-2xl font-bold leading-tight sm:text-3xl lg:text-[2.25rem] xl:text-[2.75rem]"
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

            {/* Subtitle */}
            {introText && (
              <p
                className="max-w-md text-sm leading-relaxed lg:text-base"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {introText}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to={`/${username}/products`}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] px-6 py-3 text-sm font-semibold no-underline shadow-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
              >
                {t('heroBrowse')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={`/${username}/contact`}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] border-2 px-6 py-3 text-sm font-semibold no-underline transition-colors hover:bg-[var(--theme-primary-light)]"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', background: 'transparent' }}
              >
                {t('heroContact')}
              </Link>
            </div>

            {/* Trust micro-row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
              {['Free Shipping', 'Easy Returns', 'Secure Payment'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--theme-primary)' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Image */}
          <div
            className="relative flex min-h-[200px] min-w-0 items-center justify-center overflow-hidden lg:min-h-[360px]"
            style={{ background: 'var(--theme-surface-secondary)' }}
          >
            {shop.homeHeroImage ? (
              <img
                src={shop.homeHeroImage}
                alt=""
                className="h-full w-full object-cover object-center lg:object-contain"
                style={{ maxHeight: '420px' }}
              />
            ) : shop.logo ? (
              <div className="flex items-center justify-center p-8">
                <img src={shop.logo} alt="" className="max-h-32 w-auto max-w-full object-contain lg:max-h-48" />
              </div>
            ) : (
              <div
                className="flex h-full w-full items-center justify-center p-12"
                style={{ color: 'var(--theme-primary)' }}
              >
                <ShoppingBag className="h-20 w-20 lg:h-28 lg:w-28 opacity-20" strokeWidth={1} aria-hidden />
              </div>
            )}

            {/* Decorative floating price badge */}
            {shop.homeHeroImage && (
              <div
                className="absolute bottom-4 start-4 hidden rounded-[var(--theme-radius-card)] border p-3 shadow-[var(--theme-shadow-card)] backdrop-blur-sm lg:block"
                style={{ background: 'var(--theme-surface)/90', borderColor: 'var(--theme-border)' }}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--theme-text-muted)' }}>
                  Starting from
                </p>
                <p className="text-lg font-extrabold" style={{ color: 'var(--theme-primary)' }}>
                  {shop.currency ?? 'USD'} 99
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
