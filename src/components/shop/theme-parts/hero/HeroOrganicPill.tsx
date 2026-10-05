import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, Leaf, ShieldCheck, Award } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroOrganicPill({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className="w-full py-4 sm:py-6 lg:py-10">
      <div className={containerClass}>
        <div
          className="relative overflow-hidden rounded-[var(--theme-radius-card)] border p-6 sm:p-10 lg:p-14 shadow-[var(--theme-shadow-card)] transition-all"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
          }}
        >
          {/* Subtle botanical glow orb */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{ background: 'var(--theme-primary)' }}
            aria-hidden
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Editorial Copy */}
            <div className="lg:col-span-7 space-y-5 lg:space-y-6">
              {/* Botanical badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
                  style={{
                    background: 'var(--theme-primary-light)',
                    color: 'var(--theme-primary)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{shop.category || 'Pure & Organic Living'}</span>
                </span>
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full"
                  style={{
                    color: 'var(--theme-text-muted)',
                    background: 'var(--theme-surface)',
                  }}
                >
                  <Award className="w-3.5 h-3.5" />
                  Verified Storefront
                </span>
              </div>

              {/* Serene Headline */}
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal leading-[1.15] tracking-tight"
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

              {introText && (
                <p
                  className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  {introText}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/${username}/products`}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 no-underline"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-primary-contrast)',
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t('heroBrowse')}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
                <Link
                  to={`/${username}/about`}
                  className="inline-flex items-center justify-center rounded-full border-2 px-6 py-3.5 text-sm font-semibold transition-colors no-underline hover:bg-[var(--theme-surface-secondary)]"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    background: 'var(--theme-surface)',
                  }}
                >
                  {t('navAbout')}
                </Link>
              </div>

              {/* Botanical Trust Pillars */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                    Clean Ingredients
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                    Cruelty-Free
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                    Sustainable
                  </span>
                </div>
              </div>
            </div>

            {/* Right Media Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="relative w-full max-w-md aspect-[4/5] rounded-[var(--theme-radius-card)] overflow-hidden border shadow-xl group"
                style={{
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-surface)',
                }}
              >
                {shop.homeHeroImage ? (
                  <>
                    <img
                      src={shop.homeHeroImage}
                      alt={shop.shopName}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-4 inset-x-4 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-center">
                      <span className="text-white text-xs font-semibold tracking-wide">
                        🌿 Artisanal Botanical Collection
                      </span>
                    </div>
                  </>
                ) : shop.logo ? (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                    <img src={shop.logo} alt={shop.shopName} className="max-h-36 max-w-full object-contain mb-4" />
                    <span
                      className="text-xl font-bold"
                      style={{
                        fontFamily: 'var(--theme-font-heading)',
                        color: 'var(--theme-text-primary)',
                      }}
                    >
                      {shop.shopName}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    <Leaf className="h-20 w-20 opacity-40 mb-4" strokeWidth={1.5} />
                    <span
                      className="text-lg font-bold"
                      style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {shop.shopName}
                    </span>
                    <span className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                      Organic Wellness Collection
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
