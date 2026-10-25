import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useStorefrontTheme } from '../../../themes';
import { useShopLanguage } from '../../../context/ShopLanguageContext';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../lib/trustBadgeIcons';
import { formatPrice } from '../../../lib/countryCurrencyOptions';
import { getProductImageDisplayUrl } from '../../../lib/productImageUrl';
import {
  getLocalizedReviewName,
  getLocalizedReviewText,
  getLocalizedTrustLabel,
} from '../../../lib/shopContentLanguages';
import ShopReviewsSection from '../ShopReviewsSection';
import Hero from './Hero';
import ProductCard from './ProductCard';
import { CocoaMosaic, CocoaOutlineLink } from './cocoa/CocoaParts';
import type { Product, Shop, ShopCategory } from '../../../types';
import type { HomeSectionId } from '../../../themes/types';

const HOME_PRODUCTS_LIMIT = 6;
const DEFAULT_SECTIONS: HomeSectionId[] = ['hero', 'featured', 'products', 'collections', 'trust', 'reviews'];

function productCreatedAt(p: Product): number {
  const raw = p.createdAt;
  if (raw == null) return 0;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const time = Date.parse(raw);
    return Number.isFinite(time) ? time : 0;
  }
  return 0;
}

function NoirHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-10 flex flex-col items-center text-center lg:mb-14">
      {eyebrow ? (
        <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em]" style={{ color: 'var(--theme-primary)' }}>
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-2xl uppercase tracking-[0.18em] lg:text-4xl" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
        {title}
      </h2>
      <span className="mt-5 block h-px w-16" style={{ background: 'var(--theme-primary)' }} />
    </div>
  );
}

export default function NoirHome({
  shop,
  products,
  username,
  containerClass,
}: {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
}) {
  const { layout } = useStorefrontTheme();
  const GRID =
    layout.productGridColumns === 4
      ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
      : layout.productGridColumns === 2
      ? 'grid-cols-2'
      : 'grid-cols-2 lg:grid-cols-3';
  const { t, lang, productName } = useShopLanguage();
  const visibleProducts = products.filter((p) => p.isVisible !== false);
  const categories = (shop.categories ?? []).filter((c) => (c as ShopCategory).visible !== false);
  const showCategories = Boolean(shop.categoriesEnabled && categories.length > 0);

  const featured = visibleProducts
    .filter((p) => p.isFeatured)
    .sort((a, b) => productCreatedAt(b) - productCreatedAt(a));
  const rest = visibleProducts.filter((p) => !p.isFeatured);
  const spotlight = featured[0] ?? null;
  const featuredRest = featured.slice(1, HOME_PRODUCTS_LIMIT);
  const gridProducts = (layout.showFeaturedCollection ? (rest.length > 0 ? rest : visibleProducts) : visibleProducts).slice(0, HOME_PRODUCTS_LIMIT);
  const mosaicCategories = categories.slice(0, 4);

  const trustBadges = shop.homeTrustEnabled && layout.showTrustBadges ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()) : [];
  const reviews = (shop.homeReviewsEnabled && layout.showReviewsSection
    ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
    : []
  ).map((r) => ({ ...r, name: getLocalizedReviewName(r, lang), text: getLocalizedReviewText(r, lang) }));

  const sections = layout.homeSections?.length ? layout.homeSections : DEFAULT_SECTIONS;

  return (
    <div className="flex flex-col pb-16 lg:pb-24">
      {sections.map((id, idx) => {
        switch (id) {
          case 'hero':
            return <Hero key="hero" shop={shop} username={username} containerClass={containerClass} products={visibleProducts} />;

          case 'featured':
            if (!spotlight) return null;
            return (
              <section key="featured" className={`${containerClass} mt-20 lg:mt-32`}>
                <NoirHeading eyebrow="✦" title={t('homeFeaturedTitle')} />
                <Link
                  to={`/${username}/product/${spotlight.id}`}
                  state={{ from: 'home' }}
                  className="group grid overflow-hidden border no-underline lg:grid-cols-2"
                  style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[34rem]">
                    {spotlight.image ? (
                      <img
                        src={getProductImageDisplayUrl(spotlight.image)}
                        alt={productName(spotlight)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: 'var(--theme-primary)' }}>
                      {spotlight.category || shop.shopName}
                    </span>
                    <h3
                      className="mt-5 text-3xl uppercase leading-[1.1] tracking-[0.1em] lg:text-5xl"
                      style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {productName(spotlight)}
                    </h3>
                    <span className="mt-6 block h-px w-16 transition-all duration-500 group-hover:w-32" style={{ background: 'var(--theme-primary)' }} />
                    <span className="mt-6 text-2xl" style={{ color: 'var(--theme-primary)' }}>
                      {formatPrice(Number(spotlight.price) || 0, shop.currency)}
                    </span>
                    <span
                      className="mt-10 inline-flex w-fit items-center gap-3 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em]"
                      style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
                    >
                      {t('buyNow')} <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
                {featuredRest.length > 0 ? (
                  <div className={`mt-10 grid ${GRID} gap-x-5 gap-y-10 lg:gap-x-8`}>
                    {featuredRest.map((p) => (
                      <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                    ))}
                  </div>
                ) : null}
              </section>
            );

          case 'products':
            return (
              <section key="products" className={`${containerClass} mt-20 lg:mt-32`}>
                <NoirHeading title={spotlight ? t('homeMoreTitle') : t('homeAllTitle')} />
                {gridProducts.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <ShoppingBag className="h-8 w-8" style={{ color: 'var(--theme-text-muted)' }} strokeWidth={1} />
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{t('homeNoProducts')}</p>
                  </div>
                ) : (
                  <>
                    <div className={`grid ${GRID} gap-x-5 gap-y-12 lg:gap-x-8 lg:gap-y-16`}>
                      {gridProducts.map((p) => (
                        <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                      ))}
                    </div>
                    <div className="mt-14 flex justify-center">
                      <CocoaOutlineLink to={`/${username}/products`}>{t('seeMoreProducts')}</CocoaOutlineLink>
                    </div>
                  </>
                )}
              </section>
            );

          case 'collections':
          case 'categories':
            if (!showCategories || mosaicCategories.length === 0) return null;
            return (
              <section key={`collections-${idx}`} className={`${containerClass} mt-24 lg:mt-36`}>
                <NoirHeading title={t('recommendedTitle')} />
                <CocoaMosaic categories={mosaicCategories} username={username} />
              </section>
            );

          case 'trust':
            if (trustBadges.length === 0) return null;
            return (
              <section key="trust" className={`${containerClass} mt-24 lg:mt-32`} aria-label={t('trustTitle')}>
                <ul className="grid grid-cols-1 border-y sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: 'var(--theme-border)' }}>
                  {trustBadges.map((badge, i) => (
                    <li key={`${badge.label}-${i}`} className="flex flex-col items-center gap-3 px-6 py-8 text-center">
                      <span style={{ color: 'var(--theme-primary)' }}>
                        <TrustBadgeTypeIcon type={resolveTrustBadgeType(badge.icon)} className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--theme-text-primary)' }}>
                        {getLocalizedTrustLabel(badge, lang)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );

          case 'reviews':
            if (reviews.length === 0) return null;
            return (
              <div key={`reviews-${idx}`} className="mt-24 lg:mt-32">
                <ShopReviewsSection reviews={reviews} containerClass={containerClass} />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}