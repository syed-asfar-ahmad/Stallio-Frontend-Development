import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import { FRESH_PEACH, FreshButton, shapeFor } from '../fresh/FreshParts';
import type { ThemeHeroProps } from '../types';

type Tile = { key: string; to: string; image: string; name?: string };

/** Absolute placements for the floating tiles on large screens. */
const SLOTS = [
  'start-[3%] bottom-[9%] w-40 xl:w-48 -rotate-3',
  'end-[4%] top-[12%] w-36 xl:w-44 rotate-3',
  'end-[17%] bottom-[7%] w-28 xl:w-32 rotate-2',
  'start-[17%] top-[14%] w-24 xl:w-28 -rotate-2',
];

/**
 * Fresh hero — sage field, centered Didone headline, lime call-to-action and real store products
 * floating around it as soft tiles (a row beneath the copy on small screens).
 */
export default function HeroFreshBloom({ shop, username, containerClass, products }: ThemeHeroProps) {
  const { t, lang } = useShopLanguage();
  const title = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const intro = getLocalizedHomeIntro(shop, lang);
  const heroImage = shop.homeHeroImage ?? null;
  const show = Boolean(shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || intro || heroImage));
  if (!show) return null;

  const withImage = (products ?? []).filter((p) => p.isVisible !== false && p.image);
  const ordered = [...withImage.filter((p) => p.isFeatured), ...withImage.filter((p) => !p.isFeatured)];
  const tiles: Tile[] = ordered.slice(0, 4).map((p) => ({
    key: p.id,
    to: `/${username}/product/${p.id}`,
    image: getProductImageDisplayUrl(p.image as string),
  }));
  if (tiles.length === 0 && heroImage) {
    tiles.push({ key: 'hero-image', to: `/${username}/products`, image: heroImage });
  }

  const tileBox = (tile: Tile, i: number, extra = '') => (
    <Link
      key={tile.key}
      to={tile.to}
      aria-label={shop.shopName}
      className={`group block overflow-hidden rounded-2xl p-2.5 no-underline shadow-[var(--theme-shadow-card)] transition-transform duration-500 hover:-translate-y-1.5 hover:rotate-0 ${extra}`}
      style={{ background: FRESH_PEACH }}
    >
      <span className="relative block aspect-[3/4] overflow-hidden rounded-xl" style={{ background: shapeFor(tile.key, i) }}>
        <img src={tile.image} alt="" loading={i === 0 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
      </span>
    </Link>
  );

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--theme-surface-secondary)' }}>
      <div className={`${containerClass} relative`}>
        <div className="relative mx-auto flex min-h-[26rem] max-w-3xl flex-col items-center justify-center px-2 pb-10 pt-14 text-center sm:min-h-[30rem] lg:min-h-[36rem] lg:pb-24 lg:pt-20">
          <h1
            className="animate-[cocoaRise_700ms_cubic-bezier(0.22,1,0.36,1)_both] text-[2.9rem] font-medium leading-[1.02] sm:text-6xl lg:text-[5.25rem] motion-reduce:animate-none"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.035em', textWrap: 'balance' as never }}
          >
            {title}
          </h1>
          {intro ? (
            <p className="mt-5 line-clamp-3 max-w-md text-[15px] leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              {intro}
            </p>
          ) : null}
          <div className="mt-8">
            <FreshButton to={`/${username}/products`}>{t('shopNow')}</FreshButton>
          </div>
        </div>

        {/* Floating tiles — large screens */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden={false}>
          {tiles.map((tile, i) => tileBox(tile, i, `pointer-events-auto absolute ${SLOTS[i % SLOTS.length]}`))}
        </div>
      </div>

      {/* Tile row — small screens */}
      {tiles.length > 0 && (
        <div className={`${containerClass} pb-10 lg:hidden`}>
          <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
            {tiles.slice(0, 3).map((tile, i) => tileBox(tile, i, i === 1 ? '-translate-y-2' : ''))}
          </div>
        </div>
      )}
    </section>
  );
}
