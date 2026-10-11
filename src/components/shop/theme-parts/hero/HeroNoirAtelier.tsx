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
        <div className="grid items-center gap-14 py-16 lg:min-h-[40rem] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
          { }
          <div className="order-2 text-center lg:order-1 lg:text-start">
            <div className="mb-7 flex items-center justify-center gap-4 lg:justify-start">
              <span className="h-px w-10" style={{ background: 'var(--theme-primary)' }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.45em]"
                style={{ color: 'var(--theme-primary)' }}
              >
                {shop.shopName}
              </span>
            </div>
            <h1
              className="animate-[cocoaRise_700ms_cubic-bezier(0.22,1,0.36,1)_both] text-[2.6rem] uppercase leading-[1.05] tracking-[0.1em] sm:text-6xl lg:text-[4.5rem] motion-reduce:animate-none"
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
                className="mx-auto mt-7 line-clamp-3 max-w-md text-[15px] leading-relaxed lg:mx-0"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {intro}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                to={`/${username}/products`}
                className="group inline-flex items-center gap-3 px-9 py-4 text-xs font-semibold uppercase tracking-[0.25em] no-underline transition-all hover:gap-4 hover:opacity-90"
                style={{
                  background: 'var(--theme-primary)',
                  color: 'var(--theme-primary-contrast)',
                  boxShadow: '0 0 40px color-mix(in srgb, var(--theme-primary) 35%, transparent)',
                }}
              >
                {t('shopNow')}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to={`/${username}/about`}
                className="inline-flex items-center border px-9 py-4 text-xs font-semibold uppercase tracking-[0.25em] no-underline transition-colors hover:bg-[var(--theme-surface-secondary)]"
                style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
              >
                {t('navAbout')}
              </Link>
            </div>
          </div>

          { }
          <div className="order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-md">
            <div className="relative">
              { }
              <span
                aria-hidden
                className="absolute -end-5 top-5 h-full w-full rounded-t-[999px] border"
                style={{ borderColor: 'var(--theme-primary)' }}
              />
              <div
                className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px]"
                style={{
                  background: 'var(--theme-surface-secondary)',
                  boxShadow: '0 30px 80px -20px color-mix(in srgb, var(--theme-primary) 30%, transparent)',
                }}
              >
                {mainImage ? (
                  <img src={mainImage} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
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
                className="absolute -start-6 top-10 h-24 w-24 sm:-start-10 sm:h-28 sm:w-28"
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
                  className="absolute inset-[34%] flex items-center justify-center rounded-full text-lg"
                  style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
                >
                  ✦
                </span>
              </div>

              {      }
              {floating && floatingImage ? (
                <Link
                  to={`/${username}/product/${floating.id}`}
                  className="absolute -bottom-6 -start-4 flex items-center gap-3 border p-2.5 pe-5 no-underline backdrop-blur-md transition-transform hover:-translate-y-1 sm:-start-10"
                  style={{
                    background: 'color-mix(in srgb, var(--theme-surface) 88%, transparent)',
                    borderColor: 'var(--theme-primary)',
                  }}
                >
                  <img src={floatingImage} alt="" className="h-14 w-14 object-cover" />
                  <span className="flex flex-col">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.3em]"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {t('homeFeaturedTitle')}
                    </span>
                    <span className="line-clamp-1 max-w-[9rem] text-xs" style={{ color: 'var(--theme-text-primary)' }}>
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
        className="overflow-hidden whitespace-nowrap border-y py-3.5"
        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
        aria-hidden
      >
        <div className="flex justify-center gap-10 text-[11px] font-semibold uppercase tracking-[0.4em]" style={{ color: 'var(--theme-primary)' }}>
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