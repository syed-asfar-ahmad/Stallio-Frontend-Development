import ShopImage from '../../../ShopImage';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import type { ThemeHeroProps } from '../types';

export default function HeroNoirAtelier({ shop, username, containerClass, products }: ThemeHeroProps) {
  const { t, lang, productName } = useShopLanguage();
  const title = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const intro = getLocalizedHomeIntro(shop, lang);
  const heroImage = shop.homeHeroImage ?? null;
  const show = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || intro || heroImage));
  if (!show) return null;

  const withImage = (products ?? []).filter((p) => p.isVisible !== false && p.image);
  const ordered = [...withImage.filter((p) => p.isFeatured), ...withImage.filter((p) => !p.isFeatured)];
  const mainImage = heroImage ?? (ordered[0]?.image ? getProductImageDisplayUrl(ordered[0].image as string) : null);
  const floating = ordered[heroImage ? 0 : 1];
  const floatingImage = floating?.image ? getProductImageDisplayUrl(floating.image as string) : null;
  const badgeName = shop.shopName.slice(0, 12).toUpperCase();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(60% 55% at 78% 30%, color-mix(in srgb, var(--theme-primary) 22%, transparent) 0%, transparent 70%), var(--theme-background)',
      }}
    >
      <div className={`${containerClass} relative`}>
        <div className="grid items-center gap-6 py-7 sm:py-10 lg:min-h-[24rem] lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-12">
          { }
          <div className="order-2 text-center lg:order-1 lg:text-start">
            <div className="mb-3.5 flex items-center justify-center gap-3 lg:justify-start">
              <span className="h-px w-6" style={{ background: 'var(--theme-primary)' }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.35em]"
                style={{ color: 'var(--theme-primary)' }}
              >
                {shop.shopName}
              </span>
            </div>
            <h1
              className="animate-[cocoaRise_700ms_cubic-bezier(0.22,1,0.36,1)_both] text-[1.7rem] uppercase leading-[1.08] tracking-[0.08em] sm:text-3xl lg:text-[2.6rem] motion-reduce:animate-none"
              style={{
                color: 'var(--theme-text-primary)',
                fontFamily: 'var(--theme-font-heading)',
                textWrap: 'balance' as never,
              }}
            >
              {title}
            </h1>
            {intro ? (
              <p
                className="mx-auto mt-3.5 line-clamp-2 max-w-md text-xs leading-relaxed sm:text-sm lg:mx-0"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {intro}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-center gap-2.5 lg:justify-start">
              <Link
                to={`/${username}/products`}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] no-underline transition-all hover:gap-3 hover:opacity-90"
                style={{
                  background: 'var(--theme-primary)',
                  color: 'var(--theme-primary-contrast)',
                  boxShadow: '0 0 24px color-mix(in srgb, var(--theme-primary) 28%, transparent)',
                }}
              >
                {t('shopNow')}
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </Link>
              <Link
                to={`/${username}/about`}
                className="inline-flex items-center border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] no-underline transition-colors hover:bg-[var(--theme-surface-secondary)]"
                style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
              >
                {t('navAbout')}
              </Link>
            </div>
          </div>

          { }
          <div className="order-1 mx-auto w-full max-w-[17rem] lg:order-2 lg:max-w-[20rem]">
            <div className="relative">
              { }
              <span
                aria-hidden
                className="absolute -end-4 top-4 h-full w-full rounded-t-[999px] border"
                style={{ borderColor: 'var(--theme-primary)' }}
              />
              <div
                className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px]"
                style={{
                  background: 'var(--theme-surface-secondary)',
                  boxShadow: '0 24px 60px -16px color-mix(in srgb, var(--theme-primary) 28%, transparent)',
                }}
              >
                {mainImage ? (
                  <ShopImage src={mainImage} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
                ) : null}
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent 45%)' }}
                />
              </div>

              {     }
              <div
                aria-hidden
                className="absolute -start-5 top-8 h-20 w-20 sm:-start-8 sm:h-24 sm:w-24"
                style={{ color: 'var(--theme-primary)' }}
              >
                <svg viewBox="0 0 120 120" className="h-full w-full animate-[spin_24s_linear_infinite] motion-reduce:animate-none">
                  <defs>
                    <path id="noir-badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                  </defs>
                  <text fill="currentColor" fontSize="10" fontWeight="600">
                    <textPath href="#noir-badge-circle" textLength="285" lengthAdjust="spacing">
                      {`${badgeName} ✦ ${badgeName} ✦ `}
                    </textPath>
                  </text>
                </svg>
                <span
                  className="absolute inset-[34%] flex items-center justify-center rounded-full text-base"
                  style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
                >
                  ✦
                </span>
              </div>

              {      }
              {floating && floatingImage ? (
                <Link
                  to={`/${username}/product/${floating.id}`}
                  className="absolute -bottom-5 -start-3 flex items-center gap-2.5 border p-2 pe-4 no-underline backdrop-blur-md transition-transform hover:-translate-y-1 sm:-start-8"
                  style={{
                    background: 'color-mix(in srgb, var(--theme-surface) 88%, transparent)',
                    borderColor: 'var(--theme-primary)',
                  }}
                >
                  <ShopImage src={floatingImage} alt="" className="h-12 w-12 object-cover" />
                  <span className="flex flex-col">
                    <span
                      className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {t('homeFeaturedTitle')}
                    </span>
                    <span className="line-clamp-1 max-w-[8rem] text-[11px]" style={{ color: 'var(--theme-text-primary)' }}>
                      {productName(floating)}
                    </span>
                  </span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      { }
      <div
        className="overflow-hidden whitespace-nowrap border-y py-2.5"
        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
        aria-hidden
      >
        <div className="flex justify-center gap-9 text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: 'var(--theme-primary)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="shrink-0">
              {shop.shopName} ✦
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}