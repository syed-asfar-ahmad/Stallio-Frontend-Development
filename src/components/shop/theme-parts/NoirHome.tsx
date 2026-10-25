import ShopImage from '../../ShopImage';
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
    <div className="mb-5 flex flex-col items-center text-center lg:mb-8">
      {eyebrow ? (
        <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em]" style={{ color: 'var(--theme-primary)' }}>
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-lg uppercase tracking-[0.16em] sm:text-xl lg:text-2xl" style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}>
        {title}
      </h2>
      <span className="mt-3 block h-px w-10" style={{ background: 'var(--theme-primary)' }} />
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
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : layout.productGridColumns === 2
      ? 'grid-cols-2 sm:grid-cols-3'
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
    <div className="flex flex-col pb-10 lg:pb-14">
      {sections.map((id, idx) => {
        switch (id) {
          case 'hero':
            return <Hero key="hero" shop={shop} username={username} containerClass={containerClass} products={visibleProducts} />;

          case 'featured':
            if (!spotlight) return null;
            return (
              <section key="featured" className={`${containerClass} mt-10 lg:mt-14`}>
                <NoirHeading eyebrow="✦" title={t('homeFeaturedTitle')} />
                <Link
                  to={`/${username}/product/${spotlight.id}`}
                  state={{ from: 'home' }}
                  className="group grid overflow-hidden border no-underline lg:grid-cols-2"
                  style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
                    {spotlight.image ? (
                      <ShopImage
                        src={getProductImageDisplayUrl(spotlight.image)}
                        alt={productName(spotlight)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-10">
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.35em]" style={{ color: 'var(--theme-primary)' }}>
                      {spotlight.category || shop.shopName}
                    </span>
                    <h3
                      className="mt-3 text-xl uppercase leading-[1.1] tracking-[0.08em] sm:text-2xl lg:text-3xl"
                      style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {productName(spotlight)}
                    </h3>
                    <span className="mt-3.5 block h-px w-10 transition-all duration-500 group-hover:w-20" style={{ background: 'var(--theme-primary)' }} />
                    <span className="mt-3.5 text-lg sm:text-xl font-semibold" style={{ color: 'var(--theme-primary)' }}>
                      {formatPrice(Number(spotlight.price) || 0, shop.currency)}
                    </span>
                    <span
                      className="mt-6 inline-flex w-fit items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em]"
                      style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
                    >
                      {t('buyNow')} <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
                {featuredRest.length > 0 ? (
                  <div className={`mt-6 grid ${GRID} gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 lg:gap-x-5`}>
                    {featuredRest.map((p) => (
                      <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                    ))}
                  </div>
                ) : null}
              </section>
            );

          case 'products':
            return (
              <section key="products" className={`${containerClass} mt-10 lg:mt-14`}>
                <NoirHeading title={spotlight ? t('homeMoreTitle') : t('homeAllTitle')} />
                {gridProducts.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <ShoppingBag className="h-7 w-7" style={{ color: 'var(--theme-text-muted)' }} strokeWidth={1} />
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{t('homeNoProducts')}</p>
                  </div>
                ) : (
                  <>
                    <div className={`grid ${GRID} gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5 lg:gap-y-10`}>
                      {gridProducts.map((p) => (
                        <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center">
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
              <section key={`collections-${idx}`} className={`${containerClass} mt-10 lg:mt-14`}>
                <NoirHeading title={t('recommendedTitle')} />
                <CocoaMosaic categories={mosaicCategories} username={username} />
              </section>
            );

          case 'trust':
            if (trustBadges.length === 0) return null;
            return (
              <section key="trust" className={`${containerClass} mt-10 lg:mt-14`} aria-label={t('trustTitle')}>
                <ul className="grid grid-cols-1 border-y sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: 'var(--theme-border)' }}>
                  {trustBadges.map((badge, i) => (
                    <li key={`${badge.label}-${i}`} className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                      <span style={{ color: 'var(--theme-primary)' }}>
                        <TrustBadgeTypeIcon type={resolveTrustBadgeType(badge.icon)} className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--theme-text-primary)' }}>
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
              <div key={`reviews-${idx}`} className="mt-10 lg:mt-14">
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