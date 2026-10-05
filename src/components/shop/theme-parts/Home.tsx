import { ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStorefrontTheme } from '../../../themes';
import { useShopLanguage } from '../../../context/ShopLanguageContext';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../lib/trustBadgeIcons';
import {
  getLocalizedReviewName,
  getLocalizedReviewText,
  getLocalizedTrustLabel,
} from '../../../lib/shopContentLanguages';
import ShopReviewsSection from '../ShopReviewsSection';
import ShopSectionHeading, { ShopViewAllLink } from '../ShopSectionHeading';
import { ShopCategoryCard } from '../ShopHomePage';
import Hero from './Hero';
import ProductCard from './ProductCard';
import BoutiqueHome from './BoutiqueHome';
import type { Product, Shop, ShopCategory } from '../../../types';
import type { HomeSectionId } from '../../../themes/types';

const HOME_CATEGORIES_LIMIT = 8;
const HOME_PRODUCTS_LIMIT = 8;

const GRID_COLUMN_CLASS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
};

const DEFAULT_SECTIONS: HomeSectionId[] = ['hero', 'categories', 'featured', 'products', 'trust', 'reviews'];

// ─────────────────────────────────────────────────────────────────────────────
// Modern-Minimal (Shopcart-style) layout — distinct from classic-clean
// ─────────────────────────────────────────────────────────────────────────────
function MinimalHome({
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
  const { t, lang } = useShopLanguage();
  const { layout } = useStorefrontTheme();

  const visibleCategories = (shop.categories ?? []).filter(
    (c) => (c as ShopCategory).visible !== false,
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const featuredProducts = products.filter((p) => p.isFeatured && p.isVisible !== false);
  const allVisible = products.filter((p) => p.isVisible !== false);
  const filteredByCategory = activeCategory
    ? allVisible.filter((p) => p.category === activeCategory)
    : allVisible;

  // Featured first, then rest — up to limit
  const displayProducts = [
    ...filteredByCategory.filter((p) => p.isFeatured),
    ...filteredByCategory.filter((p) => !p.isFeatured),
  ].slice(0, HOME_PRODUCTS_LIMIT * 2);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <Hero shop={shop} username={username} containerClass={containerClass} />

      {/* ── Horizontal category filter chips ── */}
      {visibleCategories.length > 0 && (
        <div
          className="border-b border-t"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
        >
          <div className={`${containerClass} flex items-center justify-between gap-4 py-3`}>
            {/* Category pills — horizontal scroll */}
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all"
                style={
                  activeCategory === null
                    ? {
                        background: 'var(--theme-primary)',
                        color: 'var(--theme-primary-contrast)',
                        borderColor: 'var(--theme-primary)',
                      }
                    : {
                        background: 'var(--theme-surface)',
                        color: 'var(--theme-text-secondary)',
                        borderColor: 'var(--theme-border)',
                      }
                }
              >
                All
              </button>
              {visibleCategories.slice(0, HOME_CATEGORIES_LIMIT).map((c) => {
                const name = lang === 'ar' ? (c.nameAr ?? c.name) : lang === 'es' ? (c.nameEs ?? c.name) : c.name;
                const isActive = activeCategory === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setActiveCategory(isActive ? null : c.slug)}
                    className="inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-all"
                    style={
                      isActive
                        ? {
                            background: 'var(--theme-primary)',
                            color: 'var(--theme-primary-contrast)',
                            borderColor: 'var(--theme-primary)',
                          }
                        : {
                            background: 'var(--theme-surface)',
                            color: 'var(--theme-text-secondary)',
                            borderColor: 'var(--theme-border)',
                          }
                    }
                  >
                    {name}
                    {/* dropdown arrow */}
                    <svg className="ms-1 h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Sort by — right */}
            <Link
              to={`/${username}/products`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium no-underline transition-colors hover:bg-[var(--theme-surface-secondary)]"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              {t('productsSort')}
            </Link>
          </div>
        </div>
      )}

      {/* ── Product grid section ── */}
      <main className={`${containerClass} flex-1 pb-10 pt-6 lg:pb-16 lg:pt-8`}>
        {/* Section heading — Shopcart style: bold, no border-b */}
        <h2
          className="mb-5 text-xl font-bold lg:text-2xl"
          style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading, inherit)' }}
        >
          {activeCategory
            ? visibleCategories.find((c) => c.slug === activeCategory)?.name ?? activeCategory
            : featuredProducts.length > 0
            ? t('homeFeaturedTitle')
            : t('homeAllTitle')}
        </h2>

        {displayProducts.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 rounded-[var(--theme-radius-card)] border border-dashed px-6 py-16 text-center"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
          >
            <ShoppingBag className="h-10 w-10 opacity-20" style={{ color: 'var(--theme-primary)' }} strokeWidth={1} />
            <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
              {t('homeNoProducts')}
            </p>
          </div>
        ) : (
          <>
            <div className={`grid ${GRID_COLUMN_CLASS[layout.productGridColumns]} gap-3 lg:gap-5`}>
              {displayProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  shopUsername={username}
                  currency={shop.currency}
                  linkState={{ from: 'home' }}
                />
              ))}
            </div>

            {/* View all link */}
            {allVisible.length > displayProducts.length && (
              <div className="mt-8 flex justify-center">
                <Link
                  to={`/${username}/products`}
                  className="inline-flex items-center gap-2 rounded-[var(--theme-radius-btn)] border-2 px-7 py-3 text-sm font-semibold no-underline transition-colors hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primary-contrast)] hover:border-[var(--theme-primary)]"
                  style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
                >
                  {t('linkViewAll')}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pacific Fresh (Organic Botanical Wellness) layout — dedicated signature storefront
// ─────────────────────────────────────────────────────────────────────────────
function PacificHome({
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
  const { t, lang } = useShopLanguage();
  const { layout } = useStorefrontTheme();

  const visibleCategories = (shop.categories ?? []).filter(
    (c) => (c as ShopCategory).visible !== false,
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const featuredProducts = products.filter((p) => p.isFeatured && p.isVisible !== false);
  const allVisible = products.filter((p) => p.isVisible !== false);
  const filteredByCategory = activeCategory
    ? allVisible.filter((p) => p.category === activeCategory)
    : allVisible;

  const displayProducts = [
    ...filteredByCategory.filter((p) => p.isFeatured),
    ...filteredByCategory.filter((p) => !p.isFeatured),
  ].slice(0, HOME_PRODUCTS_LIMIT * 2);

  const trustBadges =
    shop.homeTrustEnabled && layout.showTrustBadges
      ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim())
      : [];

  const reviewsRaw =
    shop.homeReviewsEnabled && layout.showReviewsSection
      ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
      : [];
  const reviews = reviewsRaw.map((r) => ({
    ...r,
    name: getLocalizedReviewName(r, lang),
    text: getLocalizedReviewText(r, lang),
  }));

  return (
    <div className="flex flex-col space-y-8 sm:space-y-12 pb-12 lg:pb-20">
      {/* 1. Hero Section */}
      <Hero shop={shop} username={username} containerClass={containerClass} />

      {/* 2. Horizontal Organic Category Navigation Bar */}
      {visibleCategories.length > 0 && (
        <div className={containerClass}>
          <div
            className="flex items-center justify-between gap-3 p-2 sm:p-2.5 rounded-full border shadow-sm backdrop-blur-md overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200"
                style={
                  activeCategory === null
                    ? {
                        background: 'var(--theme-primary)',
                        color: 'var(--theme-primary-contrast)',
                        boxShadow: 'var(--theme-shadow-card)',
                      }
                    : {
                        background: 'var(--theme-surface-secondary)',
                        color: 'var(--theme-text-secondary)',
                      }
                }
              >
                🌿 {t('allCategories') || 'All Rituals'}
              </button>
              {visibleCategories.slice(0, HOME_CATEGORIES_LIMIT).map((c) => {
                const name = lang === 'ar' ? (c.nameAr ?? c.name) : lang === 'es' ? (c.nameEs ?? c.name) : c.name;
                const isActive = activeCategory === c.slug;
                const catCount = allVisible.filter((p) => (p.category ?? '') === c.slug).length;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setActiveCategory(isActive ? null : c.slug)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all duration-200"
                    style={
                      isActive
                        ? {
                            background: 'var(--theme-primary)',
                            color: 'var(--theme-primary-contrast)',
                            boxShadow: 'var(--theme-shadow-card)',
                          }
                        : {
                            background: 'var(--theme-surface-secondary)',
                            color: 'var(--theme-text-secondary)',
                          }
                    }
                  >
                    <span>{name}</span>
                    {catCount > 0 && (
                      <span
                        className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full opacity-80"
                        style={{
                          background: isActive
                            ? 'color-mix(in srgb, var(--theme-primary-contrast) 20%, transparent)'
                            : 'var(--theme-surface)',
                          color: isActive ? 'var(--theme-primary-contrast)' : 'var(--theme-text-muted)',
                        }}
                      >
                        {catCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Link
              to={`/${username}/products`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold no-underline transition-colors hover:opacity-90"
              style={{
                background: 'var(--theme-surface-secondary)',
                color: 'var(--theme-text-primary)',
              }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              <span>{t('productsSort')}</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Pacific Trust Badges Bar (Organic & Clean Guarantee) */}
      {trustBadges.length > 0 && (
        <section className={containerClass}>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-6 rounded-[var(--theme-radius-card)] border shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
              borderColor: 'var(--theme-border)',
            }}
          >
            {trustBadges.map((badge, i) => (
              <div
                key={`${badge.label}-${i}`}
                className="flex items-center gap-3 p-3 rounded-full border shadow-sm"
                style={{
                  background: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: 'var(--theme-primary-light)',
                    color: 'var(--theme-primary)',
                  }}
                >
                  <TrustBadgeTypeIcon
                    type={resolveTrustBadgeType(badge.icon)}
                    className="h-4 w-4"
                  />
                </div>
                <span
                  className="text-xs font-bold leading-tight"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {getLocalizedTrustLabel(badge, lang)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Curated Botanical Products Grid */}
      <main className={containerClass}>
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8 border-b pb-4" style={{ borderColor: 'var(--theme-border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                style={{
                  background: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary)',
                }}
              >
                🌿 Curated Botanical Goods
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight"
              style={{
                color: 'var(--theme-text-primary)',
                fontFamily: 'var(--theme-font-heading)',
              }}
            >
              {activeCategory
                ? visibleCategories.find((c) => c.slug === activeCategory)?.name ?? activeCategory
                : featuredProducts.length > 0
                ? t('homeFeaturedTitle')
                : t('homeAllTitle')}
            </h2>
          </div>

          <Link
            to={`/${username}/products`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold no-underline transition-all hover:scale-105"
            style={{
              background: 'var(--theme-surface-secondary)',
              color: 'var(--theme-text-primary)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <span>{t('linkViewAll')}</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 rounded-[var(--theme-radius-card)] border border-dashed px-6 py-16 text-center"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
          >
            <ShoppingBag className="h-12 w-12 opacity-30" style={{ color: 'var(--theme-primary)' }} strokeWidth={1} />
            <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
              {t('homeNoProducts')}
            </p>
          </div>
        ) : (
          <div className={`grid ${GRID_COLUMN_CLASS[layout.productGridColumns]} gap-4 sm:gap-6 lg:gap-8`}>
            {displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                shopUsername={username}
                currency={shop.currency}
                linkState={{ from: 'home' }}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Customer Stories / Reviews Section */}
      {reviews.length > 0 && (
        <section className={containerClass}>
          <div
            className="p-6 sm:p-10 rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)]"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <ShopReviewsSection reviews={reviews} containerClass="w-full" />
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Classic / default home layout (classic-clean, boutique-artisan, etc.)
// ─────────────────────────────────────────────────────────────────────────────
export default function Home({
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
  const { layout, themeId } = useStorefrontTheme();
  const { t, lang } = useShopLanguage();

  // Route pacific-fresh to its own distinctive botanical layout
  if (themeId === 'pacific-fresh') {
    return (
      <PacificHome
        shop={shop}
        products={products}
        username={username}
        containerClass={containerClass}
      />
    );
  }

  // Route boutique-artisan to its cocoa editorial layout
  if (themeId === 'boutique-artisan') {
    return (
      <BoutiqueHome
        shop={shop}
        products={products}
        username={username}
        containerClass={containerClass}
      />
    );
  }

  // Route modern-minimal to its own distinctive layout
  if (themeId === 'modern-minimal') {
    return (
      <MinimalHome
        shop={shop}
        products={products}
        username={username}
        containerClass={containerClass}
      />
    );
  }

  // ── Classic-clean / Boutique / Retail / Noir layout ──
  const visibleCategories = (shop.categories ?? []).filter(
    (c) => (c as ShopCategory).visible !== false,
  );
  const showCategories = Boolean(
    layout.showCategoryPillsOnHome && shop.categoriesEnabled && visibleCategories.length > 0,
  );
  const homeCategories = visibleCategories.slice(0, HOME_CATEGORIES_LIMIT);

  const featuredProducts = products.filter((p) => p.isFeatured);
  const homeFeatured = featuredProducts.slice(0, HOME_PRODUCTS_LIMIT);

  const regularProducts = products.filter((p) => !p.isFeatured);
  const morePool = regularProducts.length > 0 ? regularProducts : products;
  const homeProducts = layout.showFeaturedCollection
    ? morePool.slice(0, HOME_PRODUCTS_LIMIT)
    : products;

  const trustBadges =
    shop.homeTrustEnabled && layout.showTrustBadges
      ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim())
      : [];

  const reviewsRaw =
    shop.homeReviewsEnabled && layout.showReviewsSection
      ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
      : [];
  const reviews = reviewsRaw.map((r) => ({
    ...r,
    name: getLocalizedReviewName(r, lang),
    text: getLocalizedReviewText(r, lang),
  }));

  const gridColsClass = GRID_COLUMN_CLASS[layout.productGridColumns];
  const activeSections =
    layout.homeSections && layout.homeSections.length > 0
      ? layout.homeSections
      : DEFAULT_SECTIONS;

  return (
    <div className="space-y-theme-section">
      {activeSections.map((sectionId) => {
        switch (sectionId) {
          case 'hero':
            return (
              <Hero key="section-hero" shop={shop} username={username} containerClass={containerClass} />
            );

          case 'trust':
            if (trustBadges.length === 0) return null;
            return (
              <section key="section-trust" className={containerClass}>
                <ShopSectionHeading title={t('trustTitle')} description={t('trustBody')} />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
                  {trustBadges.map((badge, i) => (
                    <div
                      key={`${badge.label}-${i}`}
                      className="flex min-h-[3rem] items-center justify-center gap-2.5 rounded-[var(--theme-radius-card)] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-center shadow-[var(--theme-shadow-card)]"
                    >
                      <TrustBadgeTypeIcon
                        type={resolveTrustBadgeType(badge.icon)}
                        className="h-4 w-4 shrink-0 text-theme-primary lg:h-5 lg:w-5"
                      />
                      <span className="text-xs font-semibold text-theme-text lg:text-sm">
                        {getLocalizedTrustLabel(badge, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'categories':
            if (!showCategories || homeCategories.length === 0) return null;
            return (
              <section key="section-categories" className={containerClass} aria-label={t('homeCategoriesTitle')}>
                <ShopSectionHeading
                  title={t('homeCategoriesTitle')}
                  trailing={<ShopViewAllLink to={`/${username}/categories`} />}
                />
                <div className={`grid ${gridColsClass} gap-3 lg:gap-4`}>
                  {homeCategories.map((c) => (
                    <ShopCategoryCard
                      key={c.slug}
                      category={c}
                      shopUsername={username}
                      productCount={products.filter((p) => (p.category ?? '') === c.slug).length}
                    />
                  ))}
                </div>
              </section>
            );

          case 'featured':
            if (featuredProducts.length === 0) return null;
            return (
              <section key="section-featured" className={containerClass}>
                <ShopSectionHeading
                  title={t('homeFeaturedTitle')}
                  trailing={
                    featuredProducts.length > HOME_PRODUCTS_LIMIT ? (
                      <ShopViewAllLink to={`/${username}/products`} />
                    ) : null
                  }
                />
                <div className={`grid ${gridColsClass} gap-4 lg:gap-5`}>
                  {homeFeatured.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      shopUsername={username}
                      currency={shop.currency}
                      linkState={{ from: 'home' }}
                    />
                  ))}
                </div>
              </section>
            );

          case 'products':
            return (
              <main key="section-products" className={`${containerClass} pb-8 lg:pb-14`}>
                <ShopSectionHeading
                  title={featuredProducts.length > 0 ? t('homeMoreTitle') : t('homeAllTitle')}
                  trailing={
                    products.length > 0 ? (
                      <ShopViewAllLink to={`/${username}/products`} />
                    ) : null
                  }
                />
                {products.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <ShoppingBag
                      className="h-8 w-8"
                      style={{ color: 'var(--theme-text-muted)' }}
                      strokeWidth={1}
                    />
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      {t('homeNoProducts')}
                    </p>
                  </div>
                ) : (
                  <div className={`grid ${gridColsClass} gap-4 lg:gap-5`}>
                    {homeProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        shopUsername={username}
                        currency={shop.currency}
                        linkState={{ from: 'home' }}
                      />
                    ))}
                  </div>
                )}
              </main>
            );

          case 'reviews':
            if (reviews.length === 0) return null;
            return (
              <div key="section-reviews">
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
