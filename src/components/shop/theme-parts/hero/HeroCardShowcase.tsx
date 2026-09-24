import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroCardShowcase({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className="w-full py-4 sm:py-6 lg:py-8">
      <div className={containerClass}>
        <div
          className="relative overflow-hidden rounded-[var(--theme-radius-card)] border p-6 sm:p-8 lg:p-12 shadow-[var(--theme-shadow-card)]"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Area */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wider inline-flex items-center gap-1.5"
                  style={{
                    background: 'var(--theme-primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--theme-radius-badge)',
                  }}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Premium Catalog
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                  Verified Seller
                </span>
              </div>

              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
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
                <p className="text-sm sm:text-base leading-relaxed max-w-xl" style={{ color: 'var(--theme-text-secondary)' }}>
                  {introText}
                </p>
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/${username}/products`}
                  className="inline-flex items-center gap-2 rounded-[var(--theme-radius-btn)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--theme-primary)' }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t('heroBrowse')}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
                <Link
                  to={`/${username}/contact`}
                  className="inline-flex items-center rounded-[var(--theme-radius-btn)] border px-5 py-3 text-sm font-semibold transition-colors"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    background: 'var(--theme-surface-secondary)',
                  }}
                >
                  {t('heroContact')}
                </Link>
              </div>

              {/* Trust Features Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                    100% Guaranteed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                    Fast Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card Showcase Area */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="relative w-full max-w-sm rounded-[var(--theme-radius-card)] border overflow-hidden shadow-xl"
                style={{
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-surface-secondary)',
                }}
              >
                {shop.homeHeroImage ? (
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                    <img
                      src={shop.homeHeroImage}
                      alt={shop.shopName}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-bold">Featured Spotlight</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
                    {shop.logo ? (
                      <img src={shop.logo} alt="" className="max-h-24 max-w-full object-contain mb-3" />
                    ) : (
                      <ShoppingBag className="w-16 h-16 opacity-40 mb-3" style={{ color: 'var(--theme-primary)' }} />
                    )}
                    <span className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                      {shop.shopName}
                    </span>
                    <span className="text-xs mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                      Explore all collections
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
