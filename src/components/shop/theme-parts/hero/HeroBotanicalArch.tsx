import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, Leaf, ShieldCheck, Check, Droplets } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

export default function HeroBotanicalArch({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage));

  if (!showHero) return null;

  return (
    <section className="w-full py-4 sm:py-6 lg:py-10">
      <div className={containerClass}>
        <div
          className="relative overflow-hidden rounded-[2rem] border p-6 sm:p-10 lg:p-14 shadow-[var(--theme-shadow-card)] transition-all"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
          }}
        >
          {/* Subtle Ambient Botanical Orbs */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
            style={{ background: 'var(--theme-primary)' }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--theme-secondary)' }}
            aria-hidden
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Editorial Narrative */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-widest rounded-full shadow-sm"
                  style={{
                    background: 'var(--theme-primary-light)',
                    color: 'var(--theme-primary)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  <span>100% Certified Botanical Formula</span>
                </span>
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full"
                  style={{
                    color: 'var(--theme-text-muted)',
                    background: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Atelier
                </span>
              </div>

              {/* Serif Headline */}
              <h1
                className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] tracking-tight text-theme-text"
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  letterSpacing: 'var(--theme-heading-spacing)',
                  textTransform: 'var(--theme-heading-transform)' as unknown as CSSProperties['textTransform'],
                }}
              >
                {heroTitle}
              </h1>

              {introText ? (
                <p
                  className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  {introText}
                </p>
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
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
                  className="inline-flex items-center justify-center rounded-full border-2 px-6 py-3.5 text-sm font-semibold transition-all no-underline hover:bg-[var(--theme-surface-secondary)]"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    background: 'var(--theme-surface)',
                  }}
                >
                  {t('navAbout')}
                </Link>
              </div>

              {/* 3-Pillar Botanical Promise */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-6 border-t"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-theme-text">Cold-Formulated</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-theme-text">Cruelty-Free</span>
                </div>
                <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-theme-text">Recyclable Glass</span>
                </div>
              </div>
            </div>

            {/* Right Architectural Arch Showcase */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div
                className="relative w-full max-w-md aspect-[3/4] rounded-t-[10rem] rounded-b-[2rem] overflow-hidden border shadow-2xl group"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80" />

                    {/* Floating Ingredient Pills */}
                    <div className="absolute top-6 end-6 z-10 animate-bounce duration-1000">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold shadow-lg">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        <span>Wildcrafted Sea Kelp</span>
                      </div>
                    </div>

                    <div className="absolute bottom-6 inset-x-6 z-10 flex items-center justify-between text-white/95 text-xs backdrop-blur-md bg-black/40 p-3.5 rounded-full border border-white/20">
                      <span className="font-semibold">🌿 Small Batch No. 04</span>
                      <span className="text-emerald-300 font-bold">99.8% Active</span>
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
                      Botanical Sanctuary Collection
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
