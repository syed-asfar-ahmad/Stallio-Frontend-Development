import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Plus, ShoppingBag } from 'lucide-react';
import { useStorefrontTheme } from '../../../themes';
import { useShopLanguage } from '../../../context/ShopLanguageContext';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/countryCurrencyOptions';
import { getLocalizedReviewName, getLocalizedReviewText, getLocalizedTrustLabel } from '../../../lib/shopContentLanguages';
import { getProductImageDisplayUrl } from '../../../lib/productImageUrl';
import ShopReviewsSection from '../ShopReviewsSection';
import Hero from './Hero';
import ProductCard from './ProductCard';
import { FRESH_BEIGE, FRESH_INK, FRESH_LIME, FreshButton, FreshHeading, shapeFor } from './fresh/FreshParts';
import { getLocalizedHomeHeroTitle } from '../../../lib/shopContentLanguages';
import type { Product, Shop, ShopCategory } from '../../../types';
import type { HomeSectionId } from '../../../themes/types';

const DEFAULT_SECTIONS: HomeSectionId[] = ['hero', 'categories', 'products', 'trust', 'collections', 'featured', 'reviews'];

/** Featured product card for the "Everyday" pair — beige tile, lime quick-add. */
function EverydayCard({ product, username, currency }: { product: Product; username: string; currency: string }) {
  const { t, productName } = useShopLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const detailTo = `/${username}/product/${product.id}`;
  const soldOut = product.inStock === false;
  const needsChoice = (product.options?.length ?? 0) > 0;

  function add() {
    if (soldOut) return;
    if (needsChoice) return navigate(detailTo);
    addToCart(product, 1, null, null);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="flex flex-col rounded-[var(--theme-radius-card)] p-5 sm:p-6" style={{ background: FRESH_BEIGE }}>
      <Link to={detailTo} className="relative block aspect-[4/5] overflow-hidden rounded-xl no-underline" style={{ background: 'var(--theme-surface-secondary)' }}>
        <span aria-hidden className="absolute inset-x-[14%] bottom-0 h-[66%] rounded-t-full" style={{ background: shapeFor(product.id, 2), opacity: 0.55 }} />
        {product.image ? (
          <img src={getProductImageDisplayUrl(product.image)} alt={productName(product)} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-[12%] drop-shadow-[0_14px_14px_rgb(30_22_17/0.14)]" />
        ) : (
          <ShoppingBag className="absolute inset-0 m-auto h-10 w-10 opacity-30" strokeWidth={1} />
        )}
      </Link>
      <div className="mt-4 flex items-end justify-between gap-3">
        <Link to={detailTo} className="min-w-0 no-underline">
          <p className="line-clamp-2 text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>{productName(product)}</p>
          <p className="mt-1 text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>{formatPrice(Number(product.price) || 0, currency)}</p>
        </Link>
        <button
          type="button"
          onClick={add}
          disabled={soldOut}
          aria-label={t('addToCart')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all hover:brightness-95 disabled:opacity-40"
          style={{ background: FRESH_LIME, color: FRESH_INK }}
        >
          {added ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export default function FreshHome({
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
  const { t, lang, categoryName } = useShopLanguage();

  const visible = useMemo(() => products.filter((p) => p.isVisible !== false), [products]);
  const categories = useMemo(() => (shop.categories ?? []).filter((c) => (c as ShopCategory).visible !== false), [shop.categories]);
  const showCategories = Boolean(shop.categoriesEnabled && categories.length > 0);
  const countOf = (slug: string) => visible.filter((p) => (p.category ?? '') === slug).length;

  const popular = useMemo(
    () => [...visible.filter((p) => p.isFeatured), ...visible.filter((p) => !p.isFeatured)].slice(0, 8),
    [visible],
  );
  const everyday = visible.find((p) => p.isFeatured && p.image) ?? visible.find((p) => p.image) ?? visible[0];

  const aboutImages = shop.aboutImages ?? [];
  const catImages = categories.map((c) => c.image).filter(Boolean) as string[];
  const bannerImage = aboutImages[1] ?? shop.homeHeroImage ?? catImages[0] ?? null;
  const howImage = aboutImages[0] ?? catImages[1] ?? shop.homeHeroImage ?? visible.find((p) => p.image)?.image ?? null;
  const pairImage = aboutImages[2] ?? catImages[2] ?? catImages[0] ?? visible.filter((p) => p.image)[1]?.image ?? null;

  const trust = shop.homeTrustEnabled && layout.showTrustBadges ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()).slice(0, 6) : [];
  const reviews = (shop.homeReviewsEnabled && layout.showReviewsSection
    ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
    : []
  ).map((r) => ({ ...r, name: getLocalizedReviewName(r, lang), text: getLocalizedReviewText(r, lang) }));

  const sections = layout.homeSections?.length ? layout.homeSections : DEFAULT_SECTIONS;
  const bannerTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;

  return (
    <div className="flex flex-col pb-14 lg:pb-20">
      {sections.map((id, idx) => {
        switch (id) {
          case 'hero':
            return <Hero key="hero" shop={shop} username={username} containerClass={containerClass} products={visible} />;

          case 'categories':
            if (!showCategories) return null;
            return (
              <section key="cats" className={`${containerClass} mt-14 lg:mt-20`} aria-label={t('freshBrowseTitle')}>
                <FreshHeading title={t('freshBrowseTitle')} />
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-6 lg:gap-x-6">
                  {categories.slice(0, 6).map((c, i) => (
                    <Link key={c.slug} to={`/${username}/category/${c.slug}`} className="group flex flex-col items-center gap-3 no-underline">
                      <span
                        className="relative flex aspect-square w-full max-w-[9.5rem] items-center justify-center overflow-hidden rounded-full transition-transform duration-500 group-hover:-translate-y-1"
                        style={{ background: shapeFor(c.slug, i) }}
                      >
                        {c.image ? (
                          <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <span className="text-3xl font-medium" style={{ fontFamily: 'var(--theme-font-heading)', color: FRESH_INK }}>
                            {categoryName(c).slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="text-center text-xs font-medium sm:text-[13px]" style={{ color: 'var(--theme-text-primary)' }}>
                        {categoryName(c)}
                        <span className="block text-[11px] font-normal" style={{ color: 'var(--theme-text-muted)' }}>{countOf(c.slug)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );

          case 'products':
            return (
              <section key="popular" className={`${containerClass} mt-14 lg:mt-24`}>
                <FreshHeading title={t('freshPopularTitle')} action={{ to: `/${username}/products`, label: t('viewAll') }} />
                {popular.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <ShoppingBag className="h-8 w-8" style={{ color: 'var(--theme-text-muted)' }} strokeWidth={1} />
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{t('homeNoProducts')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12">
                    {popular.map((p) => (
                      <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
                    ))}
                  </div>
                )}
              </section>
            );

          case 'trust':
            if (trust.length === 0) return null;
            return (
              <section key="why" className={`${containerClass} mt-16 lg:mt-28`} aria-label={t('freshWhyTitle')}>
                <div className={`grid items-center gap-8 lg:gap-14 ${howImage ? 'lg:grid-cols-2' : ''}`}>
                  {howImage ? (
                    <div className="overflow-hidden rounded-[var(--theme-radius-card)]" style={{ background: 'var(--theme-surface-secondary)' }}>
                      <img src={howImage} alt="" loading="lazy" className="aspect-[4/3.4] w-full object-cover" />
                    </div>
                  ) : null}
                  <div className={howImage ? '' : 'mx-auto w-full max-w-2xl'}>
                    <h2 className="text-[1.6rem] font-medium leading-tight sm:text-3xl" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.025em' }}>
                      {t('freshWhyTitle')}
                    </h2>
                    <ol className="mt-6">
                      {trust.map((b, i) => (
                        <li key={`${b.label}-${i}`} className="flex items-baseline gap-5 border-b py-4 first:pt-0" style={{ borderColor: 'var(--theme-border)' }}>
                          <span className="w-7 shrink-0 text-xs font-semibold tabular-nums" style={{ color: 'var(--theme-text-muted)' }}>{String(i + 1).padStart(2, '0')}.</span>
                          <span className="text-sm font-medium sm:text-[15px]" style={{ color: 'var(--theme-text-primary)' }}>{getLocalizedTrustLabel(b, lang)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            );

          case 'collections':
            if (!bannerImage) return null;
            return (
              <section key="banner" className="relative mt-16 isolate overflow-hidden lg:mt-28" aria-label={bannerTitle}>
                <div className="relative h-[24rem] sm:h-[30rem] lg:h-[36rem]" style={{ background: FRESH_INK }}>
                  <img src={bannerImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgb(10 8 6 / 0.7) 0%, rgb(10 8 6 / 0.1) 55%, rgb(10 8 6 / 0.25) 100%)' }} />
                  <div className={`${containerClass} relative flex h-full flex-col items-start justify-end pb-10 lg:pb-14`}>
                    <p className="max-w-lg text-3xl font-medium leading-tight text-white sm:text-5xl" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}>
                      {bannerTitle}
                    </p>
                    <div className="mt-5">
                      <FreshButton to={`/${username}/products`} arrow>{t('shopNow')}</FreshButton>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'featured':
            if (!everyday) return null;
            return (
              <section key="everyday" className={`${containerClass} mt-16 lg:mt-28`}>
                <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-[0.22em] lg:mb-10" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
                  {t('freshEverydayTitle')}
                </h2>
                <div className={`mx-auto grid max-w-5xl gap-4 lg:gap-6 ${pairImage ? 'md:grid-cols-[5fr_6fr]' : 'max-w-sm'}`}>
                  <EverydayCard product={everyday} username={username} currency={shop.currency} />
                  {pairImage ? (
                    <Link
                      to={`/${username}/products`}
                      className="group relative block min-h-[22rem] overflow-hidden rounded-[var(--theme-radius-card)] no-underline"
                      style={{ background: '#e5c196' }}
                    >
                      <img src={pairImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none" />
                    </Link>
                  ) : null}
                </div>
              </section>
            );

          case 'reviews':
            if (reviews.length === 0) return null;
            return (
              <div key={`reviews-${idx}`} className="mt-16 py-12 lg:mt-28 lg:py-16" style={{ background: 'var(--theme-surface-secondary)' }}>
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
