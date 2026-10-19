import ShopImage from '../../../ShopImage';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star, Leaf, Award } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroApothecaryDuo({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className="w-full py-3 sm:py-4 lg:py-6">
      <div className={containerClass}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Main Hero Card */}
          <div
            className="lg:col-span-8 p-5 sm:p-7 lg:p-9 rounded-[1.75rem] border shadow-[var(--theme-shadow-card)] flex flex-col justify-between relative overflow-hidden"
            style={{
              borderColor: 'var(--theme-border)',
              background: 'var(--theme-surface)',
            }}
          >
            <div className="space-y-3.5 max-w-lg">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full"
                  style={{
                    background: 'var(--theme-primary-light)',
                    color: 'var(--theme-primary)',
                  }}
                >
                  <Leaf className="w-3 h-3" />
                  <span>Apothecary Release</span>
                </span>
                <span className="text-[11px] text-theme-text-muted">Direct Sourcing</span>
              </div>

              <h1
                className="text-xl sm:text-3xl lg:text-4xl font-normal leading-[1.15] text-theme-text tracking-tight"
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  letterSpacing: 'var(--theme-heading-spacing)',
                  textTransform: 'var(--theme-heading-transform)' as unknown as CSSProperties['textTransform'],
                }}
              >
                {heroTitle}
              </h1>

              {introText ? (
                <p className="text-xs sm:text-xs lg:text-sm leading-relaxed text-theme-text-secondary">
                  {introText}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6">
              <Link
                to={`/${username}/products`}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold shadow-md transition-all hover:scale-[1.02] no-underline"
                style={{
                  background: 'var(--theme-primary)',
                  color: 'var(--theme-primary-contrast)',
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                {t('heroBrowse')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          {/* Secondary Live Counter / Ritual Card */}
          <div
            className="lg:col-span-4 p-6 rounded-[2rem] border shadow-[var(--theme-shadow-card)] flex flex-col justify-between overflow-hidden relative"
            style={{
              borderColor: 'var(--theme-border)',
              background: 'var(--theme-surface-secondary)',
            }}
          >
            {shop.homeHeroImage ? (
              <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 border border-theme-border shadow-sm">
                <ShopImage src={shop.homeHeroImage} alt="" className="h-full w-full object-cover" />
                <div className="absolute top-2.5 start-2.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold">
                  ★ Spotlight
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="ms-1.5 text-xs font-bold text-theme-text">5.0 / 5.0</span>
              </div>
              <h3
                className="text-base font-bold text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Pure Coastal Formulas
              </h3>
              <p className="text-xs text-theme-text-muted leading-relaxed">
                Hand-poured in micro-batches to ensure peak bioavailability and sensory serenity.
              </p>
            </div>

            <div className="pt-4 border-t border-theme-border flex items-center justify-between text-xs font-semibold text-theme-primary">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Certified Clean
              </span>
              <span>100% Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
