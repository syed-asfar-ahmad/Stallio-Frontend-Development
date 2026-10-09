import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import type { ThemeHeroProps } from '../types';

const CREAM = '#f7ead4';

type Slide = {
  key: string;
  title: string;
  body: string;
  image: string | null;
  cta: string;
  to: string;
};

/**
 * Cocoa Banner hero — full-bleed photograph, warm cocoa wash from the left, chunky soft-serif
 * headline and a cream call-to-action. Slides = the store hero + up to three categories with photos.
 */
export default function HeroCocoaBanner({ shop, username, containerClass }: ThemeHeroProps) {
  const { t, lang, categoryName } = useShopLanguage();
  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(
    shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage),
  );

  const slides = useMemo<Slide[]>(() => {
    const base: Slide = {
      key: 'hero',
      title: heroTitle,
      body: introText || '',
      image: shop.homeHeroImage ?? null,
      cta: t('heroBrowse'),
      to: `/${username}/products`,
    };
    const extra: Slide[] =
      shop.categoriesEnabled && base.image
        ? (shop.categories ?? [])
            .filter((c) => c.visible !== false && c.image)
            .slice(0, 3)
            .map((c) => ({
              key: `cat-${c.slug}`,
              title: categoryName(c),
              body: '',
              image: c.image ?? null,
              cta: t('shopCategoryCta', { name: categoryName(c) }),
              to: `/${username}/category/${c.slug}`,
            }))
        : [];
    return [base, ...extra];
  }, [shop, heroTitle, introText, t, categoryName, username]);

  const [index, setIndex] = useState(0);

  if (!showHero) return null;

  const active = slides[Math.min(index, slides.length - 1)];
  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={shop.shopName}
      className="relative isolate w-full overflow-hidden"
      style={{ background: 'color-mix(in srgb, var(--theme-primary) 42%, #1a0f07)' }}
    >
      <div className="relative min-h-[34rem] sm:min-h-[38rem] lg:min-h-[44rem]">
        {/* Photographs (cross-fade) */}
        {slides.map((s, i) => (
          <div
            key={s.key}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            {s.image ? (
              <img
                src={s.image}
                alt=""
                className="h-full w-full object-cover object-[72%_30%] sm:object-[68%_30%]"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ) : null}
          </div>
        ))}

        {/* Warm cocoa wash — heavier on the text side */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgb(74 48 27 / 0.92) 0%, rgb(86 57 33 / 0.72) 34%, rgb(96 66 40 / 0.25) 62%, rgb(96 66 40 / 0.08) 100%), linear-gradient(180deg, rgb(26 15 7 / 0.55) 0%, rgb(26 15 7 / 0) 28%, rgb(26 15 7 / 0) 70%, rgb(26 15 7 / 0.35) 100%)',
          }}
        />
        {/* Mobile: darken the whole frame so the headline always reads */}
        <div aria-hidden className="absolute inset-0 bg-[rgb(40_24_12/0.35)] sm:hidden" />

        <div className={`${containerClass} relative flex min-h-[34rem] items-center pb-24 pt-32 sm:min-h-[38rem] lg:min-h-[44rem] lg:pt-36`}>
          <div key={active.key} className="max-w-[40rem] animate-[cocoaRise_700ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
            <h1
              className="text-[2.6rem] font-semibold leading-[1.03] sm:text-6xl lg:text-[4.6rem]"
              style={{
                color: CREAM,
                fontFamily: 'var(--theme-font-heading)',
                letterSpacing: '-0.035em',
                textWrap: 'balance' as never,
              }}
            >
              {active.title}
            </h1>
            {active.body ? (
              <p className="mt-5 line-clamp-3 max-w-md text-[15px] leading-relaxed sm:text-base" style={{ color: 'rgb(247 234 212 / 0.86)' }}>
                {active.body}
              </p>
            ) : null}
            <Link
              to={active.to}
              className="mt-8 inline-flex items-center justify-center rounded-[var(--theme-radius-btn)] px-7 py-3.5 text-sm font-semibold no-underline shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7ead4]"
              style={{ background: CREAM, color: '#2b1b10' }}
            >
              {active.cta}
            </Link>
          </div>
        </div>

        {/* Slide controls */}
        {slides.length > 1 && (
          <div className={`${containerClass} pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-8 lg:bottom-10`}>
            <div className="pointer-events-auto ms-auto flex w-fit items-center gap-2.5">
              <div className="me-1 flex items-center gap-1.5" aria-hidden>
                {slides.map((s, i) => (
                  <span
                    key={s.key}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === index ? 22 : 6, background: i === index ? CREAM : 'rgb(247 234 212 / 0.45)' }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-[#2b1b10]"
                style={{ background: 'rgb(43 27 16 / 0.55)', borderColor: 'rgb(247 234 212 / 0.25)', color: CREAM }}
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-black"
                style={{ background: '#1d120a', borderColor: 'rgb(247 234 212 / 0.25)', color: CREAM }}
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
