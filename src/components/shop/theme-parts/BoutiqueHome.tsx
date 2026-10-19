import { ShoppingBag } from 'lucide-react';
import { useStorefrontTheme } from '../../../themes';
import { useShopLanguage } from '../../../context/ShopLanguageContext';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../lib/trustBadgeIcons';
import {
  getLocalizedReviewName,
  getLocalizedReviewText,
  getLocalizedTrustLabel,
} from '../../../lib/shopContentLanguages';
import ShopReviewsSection from '../ShopReviewsSection';
import Hero from './Hero';
import ProductCard from './ProductCard';
import { CocoaHeading, CocoaMosaic, CocoaOutlineLink, CocoaPromoCards, type CocoaPromoItem } from './cocoa/CocoaParts';
import type { Product, Shop, ShopCategory } from '../../../types';
import type { HomeSectionId } from '../../../themes/types';

const HOME_PRODUCTS_LIMIT = 6;
const DEFAULT_SECTIONS: HomeSectionId[] = ['hero', 'categories', 'featured', 'products', 'collections', 'trust', 'reviews'];

const GRID: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export default function BoutiqueHome({
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
  const { t, lang, categoryName, productName } = useShopLanguage();

  const visibleProducts = products.filter((p) => p.isVisible !== false);
  const categories = (shop.categories ?? []).filter((c) => (c as ShopCategory).visible !== false);
  const showCategories = Boolean(shop.categoriesEnabled && categories.length > 0);

  const featured = visibleProducts.filter((p) => p.isFeatured);
  const rest = visibleProducts.filter((p) => !p.isFeatured);
  const gridProducts = (layout.showFeaturedCollection ? (rest.length > 0 ? rest : visibleProducts) : visibleProducts).slice(
    0,
    HOME_PRODUCTS_LIMIT,
  );
  const featuredGrid = featured.slice(0, HOME_PRODUCTS_LIMIT);

  const trustBadges =
    shop.homeTrustEnabled && layout.showTrustBadges ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()) : [];
  const reviews = (shop.homeReviewsEnabled && layout.showReviewsSection
    ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
    : []
  ).map((r) => ({ ...r, name: getLocalizedReviewName(r, lang), text: getLocalizedReviewText(r, lang) }));

  // Promo cards: categories first (they carry photography); fall back to the best products.
  const promoItems: CocoaPromoItem[] = showCategories
    ? categories.slice(0, 3).map((c) => {
        const count = visibleProducts.filter((p) => (p.category ?? '') === c.slug).length;
        return {
          key: c.slug,
          title: categoryName(c),
          caption: `${count} ${count === 1 ? t('categoryProduct') : t('categoryProducts')}`,
          image: c.image,
          to: `/${username}/category/${c.slug}`,
          cta: t('shopCategoryCta', { name: categoryName(c) }),
        };
      })
    : visibleProducts
        .filter((p) => p.image)
        .slice(0, 3)
        .map((p) => ({
          key: p.id,
          title: productName(p),
          image: p.image,
          to: `/${username}/product/${p.id}`,
          cta: t('buyNow'),
        }));

  const mosaicCategories = categories.length > 3 ? categories.slice(3, 7) : categories.slice(0, 4);
  const gridCols = GRID[layout.productGridColumns] ?? GRID[3];
  const sections = layout.homeSections?.length ? layout.homeSections : DEFAULT_SECTIONS;
  const newlyDropped = (
    <CocoaHeading title={t('newlyDroppedTitle')} body={t('newlyDroppedBody', { shopName: shop.shopName })} />
  );
  const showFeaturedHeading = featuredGrid.length > 0;

  return (
    <div className="flex flex-col pb-12 lg:pb-16">
      {sections.map((id, idx) => {
        switch (id) {
          case 'hero':
            return <Hero key="hero" shop={shop} username={username} containerClass={containerClass} />;

          case 'categories':
            if (promoItems.length === 0) return null;
            return (
              <section key="promo" className={`${containerClass} mt-8 lg:mt-12`} aria-label={t('homeCategoriesTitle')}>
                <CocoaPromoCards items={promoItems} />
              </section>
            );

          case 'featured':
            if (!showFeaturedHeading) return null;
            return (
              <section key="featured" className={`${containerClass} mt-10 lg:mt-14`}>
                {newlyDropped}
                <div className={`grid ${gridCols} gap-x-3.5 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5 lg:gap-y-8`}>
                  {featuredGrid.map((p) => (
                    <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                  ))}
                </div>
              </section>
            );

          case 'products':
            return (
              <section key="products" className={`${containerClass} ${showFeaturedHeading ? 'mt-8 lg:mt-12' : 'mt-10 lg:mt-14'}`}>
                {!showFeaturedHeading && newlyDropped}
                {gridProducts.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <ShoppingBag className="h-8 w-8" style={{ color: 'var(--theme-text-muted)' }} strokeWidth={1} />
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {t('homeNoProducts')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={`grid ${gridCols} gap-x-3.5 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5 lg:gap-y-8`}>
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
            if (!showCategories || mosaicCategories.length === 0) return null;
            return (
              <section key="collections" className={`${containerClass} mt-12 lg:mt-16`}>
                <CocoaHeading title={t('recommendedTitle')} body={t('recommendedBody')} />
                <CocoaMosaic categories={mosaicCategories} username={username} />
              </section>
            );

          case 'trust':
            if (trustBadges.length === 0) return null;
            return (
              <section key="trust" className={`${containerClass} mt-10 lg:mt-14`} aria-label={t('trustTitle')}>
                <ul
                  className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--theme-radius-card)] sm:grid-cols-2 lg:grid-cols-4"
                  style={{ background: 'var(--theme-border)' }}
                >
                  {trustBadges.map((badge, i) => (
                    <li
                      key={`${badge.label}-${i}`}
                      className="flex items-center gap-3 px-5 py-3.5 sm:px-6 sm:py-4"
                      style={{ background: 'var(--theme-surface-secondary)' }}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
                      >
                        <TrustBadgeTypeIcon type={resolveTrustBadgeType(badge.icon)} className="h-4 w-4" />
                      </span>
                      <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
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
              <div key={`reviews-${idx}`} className="mt-16 lg:mt-24">
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
