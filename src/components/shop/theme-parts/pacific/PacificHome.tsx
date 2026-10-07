import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sprout, Leaf, Droplets, Sun, Sparkles, SlidersHorizontal, Check, ShieldCheck, Heart } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { useStorefrontTheme } from '../../../../themes';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../../lib/trustBadgeIcons';
import {
  getLocalizedReviewName,
  getLocalizedReviewText,
  getLocalizedTrustLabel,
} from '../../../../lib/shopContentLanguages';
import ShopReviewsSection from '../../ShopReviewsSection';
import Hero from '../Hero';
import ProductCard from '../ProductCard';
import type { Product, Shop, ShopCategory } from '../../../../types';
import {
  PacificPillTag,
  PacificEditorialHeader,
  PacificSourcingPillars,
  PacificCategoryMosaic,
} from './PacificParts';

const HOME_PRODUCTS_LIMIT = 8;
const HOME_CATEGORIES_LIMIT = 8;

type Props = {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
};

export default function PacificHome({ shop, products, username, containerClass }: Props) {
  const { t, lang, categoryName } = useShopLanguage();
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

  const categoryCounts = visibleCategories.reduce<Record<string, number>>((acc, c) => {
    acc[c.slug] = allVisible.filter((p) => (p.category ?? '') === c.slug).length;
    return acc;
  }, {});

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

  // Seasonal spotlight product (first featured or top product)
  const seasonalItem = featuredProducts[0] || allVisible[0];

  return (
    <div className="flex flex-col space-y-12 sm:space-y-16 lg:space-y-24 pb-16 lg:pb-28">
      {/* 1. High-Impact Hero */}
      <Hero shop={shop} username={username} containerClass={containerClass} />

      {/* 2. Editorial Philosophy & Manifesto Banner */}
      <section className={containerClass}>
        <div
          className="relative overflow-hidden rounded-[var(--theme-radius-card)] border p-8 sm:p-12 lg:p-16 text-center shadow-[var(--theme-shadow-card)]"
          style={{
            background: 'linear-gradient(180deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
            borderColor: 'var(--theme-border)',
          }}
        >
          {/* Subtle botanical glow background */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-full max-w-2xl rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--theme-primary)' }}
            aria-hidden
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <PacificPillTag icon={Sprout}>The Living Earth Standard</PacificPillTag>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-theme-text leading-[1.18]"
              style={{
                fontFamily: 'var(--theme-font-heading)',
                letterSpacing: 'var(--theme-heading-spacing)',
                textWrap: 'balance' as never,
              }}
            >
              Artisanal Purity Cultivated in Harmony with Natural Seasons
            </h2>
            <p className="text-sm sm:text-base text-theme-text-muted leading-relaxed max-w-2xl mx-auto">
              We source directly from certified biodynamic growers, independent orchards, and small-batch artisans who prioritize living soil, heirloom genetics, and zero chemical compromise.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Category Storytelling / Provision Rituals */}
      {visibleCategories.length > 0 && (
        <section className={containerClass}>
          <PacificEditorialHeader
            tag="Curated Collections"
            tagIcon={Leaf}
            title="Explore Artisanal Provisions"
            body="Handpicked selections harvested at peak vitality from our network of heritage growers."
            actionTo={`/${username}/categories`}
            actionLabel={t('categoryAll') || 'View All Collections'}
            align="left"
          />

          {/* Category Chips Bar */}
          <div
            className="flex items-center justify-between gap-3 p-2 sm:p-2.5 mb-8 rounded-full border shadow-sm backdrop-blur-md overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                <Sprout className="w-3.5 h-3.5" />
                <span>{t('allCategories') || 'All Harvests'}</span>
                <span className="text-[10px] opacity-80">({allVisible.length})</span>
              </button>

              {visibleCategories.slice(0, HOME_CATEGORIES_LIMIT).map((c) => {
                const name = lang === 'ar' ? (c.nameAr ?? c.name) : lang === 'es' ? (c.nameEs ?? c.name) : c.name;
                const isActive = activeCategory === c.slug;
                const count = categoryCounts[c.slug] || 0;

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
                    {count > 0 && (
                      <span
                        className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full opacity-80"
                        style={{
                          background: isActive
                            ? 'color-mix(in srgb, var(--theme-primary-contrast) 20%, transparent)'
                            : 'var(--theme-surface)',
                          color: isActive ? 'var(--theme-primary-contrast)' : 'var(--theme-text-muted)',
                        }}
                      >
                        {count}
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

          {/* Asymmetrical Category Mosaic Showcase (when on "All" view) */}
          {activeCategory === null && visibleCategories.length >= 3 && (
            <div className="mb-12">
              <PacificCategoryMosaic
                categories={visibleCategories}
                username={username}
                counts={categoryCounts}
              />
            </div>
          )}
        </section>
      )}

      {/* 4. Curated Product Grid */}
      <main className={containerClass}>
        <PacificEditorialHeader
          tag="Artisan Marketplace"
          tagIcon={Sparkles}
          title={
            activeCategory
              ? visibleCategories.find((c) => c.slug === activeCategory)?.name ?? activeCategory
              : featuredProducts.length > 0
              ? t('homeFeaturedTitle') || 'Featured Signature Goods'
              : t('homeAllTitle') || 'Pure Provisions Collection'
          }
          body="Crafted in limited seasonal batches, untouched by artificial preservatives."
          actionTo={`/${username}/products`}
          actionLabel={t('linkViewAll')}
          align="left"
        />

        {displayProducts.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 rounded-[var(--theme-radius-card)] border border-dashed px-6 py-16 text-center"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
          >
            <ShoppingBag className="h-12 w-12 opacity-30 text-theme-primary" strokeWidth={1} />
            <p className="text-sm font-medium text-theme-text-muted">
              {t('homeNoProducts')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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

      {/* 5. Pacific Fresh Brand Story & Sourcing Philosophy */}
      <section className={containerClass}>
        <div
          className="relative overflow-hidden rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)]"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Story Column */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
              <PacificPillTag icon={Sun}>Origin & Sourcing</PacificPillTag>
              <h2
                className="text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-theme-text leading-tight"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                From Coastal Mist to Table in Less than 24 Hours
              </h2>
              <p className="text-sm sm:text-base text-theme-text-secondary leading-relaxed">
                Every jar, bottle, and crate in the Pacific Fresh collection begins on small, generational farms that cultivate with uncompromised dedication to biological health. We eliminate long storage chains so you receive fresh, vibrant nutrition at its absolute botanical apex.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  '100% Raw, Unpasteurized & Cold-Pressed Botanicals',
                  'Regenerative organic certifications and pesticide-free testing',
                  'Zero synthetic binders, fillers, dyes, or artificial stabilizers',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-theme-text">{point}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to={`/${username}/about`}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider no-underline transition-all hover:scale-105 shadow-sm"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-primary-contrast)',
                  }}
                >
                  <span>{t('navAbout') || 'Read Our Full Story'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>

            {/* Right Photo Column */}
            <div className="lg:col-span-5 relative min-h-[18rem] sm:min-h-[24rem] lg:min-h-full h-full">
              {shop.aboutImages?.[0] || shop.homeHeroImage ? (
                <img
                  src={shop.aboutImages?.[0] || shop.homeHeroImage || ''}
                  alt={shop.shopName}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'var(--theme-surface-secondary)' }}
                >
                  <Sprout className="w-20 h-20 text-theme-primary opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quality & Sourcing 4 Pillars */}
      <div className={containerClass}>
        <PacificSourcingPillars />
      </div>

      {/* 7. Seasonal Harvest Spotlight (if product available) */}
      {seasonalItem && (
        <section className={containerClass}>
          <div
            className="relative overflow-hidden rounded-[var(--theme-radius-card)] border p-6 sm:p-10 lg:p-12 shadow-[var(--theme-shadow-card)]"
            style={{
              background: 'linear-gradient(135deg, var(--theme-surface-secondary) 0%, var(--theme-surface) 100%)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 relative aspect-square rounded-[calc(var(--theme-radius-card)*0.75)] overflow-hidden border shadow-md">
                {seasonalItem.image ? (
                  <img
                    src={seasonalItem.image}
                    alt={seasonalItem.name}
                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-theme-surface">
                    <ShoppingBag className="w-12 h-12 text-theme-primary opacity-30" />
                  </div>
                )}
                <span className="absolute top-3 start-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-emerald-700 shadow-sm">
                  Limited Harvest
                </span>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <PacificPillTag icon={Sparkles}>Seasonal Spotlight</PacificPillTag>
                <h3
                  className="text-2xl sm:text-3xl lg:text-4xl font-normal text-theme-text tracking-tight"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {seasonalItem.name}
                </h3>
                <p className="text-sm text-theme-text-muted leading-relaxed line-clamp-3">
                  {seasonalItem.description || 'Sourced at peak seasonality for rich aromatic depth, pristine freshness, and unmatched natural potency.'}
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <Link
                    to={`/${username}/product/${seasonalItem.id}`}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider no-underline transition-all hover:scale-105 shadow-sm"
                    style={{
                      background: 'var(--theme-primary)',
                      color: 'var(--theme-primary-contrast)',
                    }}
                  >
                    <span>View Product Details</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. Trust Badges Matrix */}
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
                className="flex items-center gap-3 p-3.5 rounded-full border shadow-sm"
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

      {/* 9. Customer Stories & Reviews Section */}
      {reviews.length > 0 && (
        <section className={containerClass}>
          <div
            className="p-6 sm:p-10 rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)]"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <PacificEditorialHeader
              tag="Community Voices"
              tagIcon={Heart}
              title="Stories from Our Patrons"
              body="How pure artisanal provisions transform everyday culinary rituals."
            />
            <ShopReviewsSection reviews={reviews} containerClass="w-full" />
          </div>
        </section>
      )}

      {/* 10. Editorial Closing Call-to-Action */}
      <section className={containerClass}>
        <div
          className="relative overflow-hidden rounded-[var(--theme-radius-card)] p-8 sm:p-12 lg:p-16 text-center border shadow-[var(--theme-shadow-card)]"
          style={{
            background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-hover) 100%)',
            color: 'var(--theme-primary-contrast)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white/90 bg-white/15 border border-white/20">
              <Sprout className="w-3.5 h-3.5" />
              Direct From The Source
            </span>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              Taste the Vitality of Pure Living Harvests
            </h2>
            <p className="text-sm sm:text-base text-white/85 max-w-lg mx-auto">
              Discover small-batch pantry provisions and fresh organic produce, delivered straight to your door with unbroken freshness.
            </p>
            <div className="pt-3">
              <Link
                to={`/${username}/products`}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider bg-white text-emerald-950 no-underline shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <span>{t('heroBrowse') || 'Explore Full Harvest'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
