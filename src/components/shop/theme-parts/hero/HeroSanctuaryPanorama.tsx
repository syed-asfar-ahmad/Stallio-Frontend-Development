import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, Leaf } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroSanctuaryPanorama({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className="w-full py-4 sm:py-6 lg:py-8">
      <div className={containerClass}>
        <div
          className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[580px] rounded-[2.5rem] overflow-hidden border p-8 sm:p-14 lg:p-20 flex flex-col justify-end shadow-2xl"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
          }}
        >
          {/* Background Image Layer with Atmospheric Mist Gradient */}
          {shop.homeHeroImage ? (
            <>
              <img
                src={shop.homeHeroImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(4, 13, 8, 0.25) 0%, rgba(4, 13, 8, 0.75) 60%, rgba(4, 13, 8, 0.95) 100%)',
                }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: 'radial-gradient(circle at top right, var(--theme-primary) 0%, transparent 60%)',
              }}
            />
          )}

          {/* Centered / Wide Editorial Copy */}
          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sanctuary Collection</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-white drop-shadow-md"
              style={{
                fontFamily: 'var(--theme-font-heading)',
                letterSpacing: 'var(--theme-heading-spacing)',
                textTransform: 'var(--theme-heading-transform)' as unknown as CSSProperties['textTransform'],
              }}
            >
              {heroTitle}
            </h1>

            {introText ? (
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-white/85 max-w-2xl">
                {introText}
              </p>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to={`/${username}/products`}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-xl transition-all hover:scale-[1.03] active:scale-95 no-underline"
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
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all no-underline hover:bg-white/20"
              >
                {t('navAbout')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
