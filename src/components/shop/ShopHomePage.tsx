import { Link } from 'react-router-dom';
import { LayoutGrid, Star, ShoppingBag } from 'lucide-react';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../lib/trustBadgeIcons';
import type { Product, Shop, ShopCategory } from '../../types';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import {
  getLocalizedHomeHeroTitle,
  getLocalizedHomeIntro,
  getLocalizedReviewName,
  getLocalizedReviewText,
  getLocalizedTrustLabel,
} from '../../lib/shopContentLanguages';
import ShopReviewsSection from './ShopReviewsSection';
import ShopSectionHeading, { ShopViewAllLink } from './ShopSectionHeading';
import { formatPrice } from '../../lib/countryCurrencyOptions';
import {
  CATEGORY_CARD_ASPECT_CLASS,
  PRODUCT_CARD_ASPECT_CLASS,
  STORE_HERO_ASPECT_CLASS,
} from '../../lib/imageCropViewports';
import ProductImage from '../ProductImage';
import type { ShopProductLinkState } from '../../lib/shopProductNav';

export const HOME_CATEGORIES_LIMIT = 8;
export const HOME_FEATURED_PRODUCTS_LIMIT = 8;
export const HOME_MORE_PRODUCTS_LIMIT = 8;

type ProductCardProps = {
  product: Product;
  shopUsername: string;
  currency?: string | null;
  linkState?: ShopProductLinkState;
};

function ProductPriceInline({
  p,
  currency,
  onDark = false,
}: {
  p: Product;
  currency?: string | null;
  onDark?: boolean;
}) {
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const saleClass = onDark
    ? 'font-extrabold text-white'
    : 'font-extrabold text-theme-primary';
  const compareClass = onDark ? 'text-xs text-white/50 line-through' : 'text-xs text-theme-muted line-through';
  if (compare) {
    return (
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={saleClass}>{formatPrice(sale, currency)}</span>
        <span className={compareClass}>{formatPrice(compare, currency)}</span>
      </div>
    );
  }
  return <p className={saleClass}>{formatPrice(sale, currency)}</p>;
}

type CategoryCardProps = {
  category: ShopCategory;
  shopUsername: string;
  productCount: number;
};

export function ShopCategoryCard({ category: c, shopUsername, productCount }: CategoryCardProps) {
  const { t, categoryName } = useShopLanguage();
  const displayName = categoryName(c);
  const productLabel = productCount === 1 ? t('categoryProduct') : t('categoryProducts');

  return (
    <Link
      to={`/${shopUsername}/category/${c.slug}`}
      className={`group relative block ${CATEGORY_CARD_ASPECT_CLASS} overflow-hidden rounded-theme-card no-underline shadow-theme-card ring-1 ring-theme-border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary`}
    >
      <div className="absolute inset-0 bg-theme-surface">
        {c.image ? (
          <img
            src={c.image}
            alt=""
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-theme-primary/10 via-theme-primary/5 to-theme-surface">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-theme-surface/90 text-theme-primary shadow-md ring-1 ring-theme-border backdrop-blur-sm">
              <LayoutGrid className="h-8 w-8" aria-hidden />
            </span>
          </div>
        )}
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/5 transition-opacity duration-300 group-hover:from-black/90"
        aria-hidden
      />

      <span className="absolute start-3 top-3 z-10 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md max-lg:normal-case max-lg:tracking-normal lg:start-4 lg:top-4 lg:px-3 lg:py-1 lg:text-xs">
        {productCount} {productLabel}
      </span>

      <div className="absolute inset-x-0 bottom-0 z-10 p-3 max-lg:p-3 lg:p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-tight tracking-tight text-white drop-shadow-sm max-lg:text-base lg:text-xl">
          {displayName}
        </h3>
      </div>
    </Link>
  );
}

function ProductCardShell({
  to,
  state,
  className = '',
  children,
}: {
  to: string;
  state?: ShopProductLinkState;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      state={state}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-theme-card bg-theme-surface no-underline shadow-theme-card ring-1 ring-theme-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-theme-primary/40 ${className}`}
    >
      {children}
    </Link>
  );
}

function ProductCardVisual({
  product: p,
  displayName,
  badges,
  trailingBadge,
  dimmed = false,
}: {
  product: Product;
  displayName: string;
  badges?: React.ReactNode;
  trailingBadge?: React.ReactNode;
  dimmed?: boolean;
}) {
  return (
    <div className="relative p-2 pb-0 max-lg:p-2 max-lg:pb-0 lg:p-3 lg:pb-0">
      <div
        className={`relative ${PRODUCT_CARD_ASPECT_CLASS} overflow-hidden rounded-theme-card bg-theme-bg ring-1 ring-theme-border transition-all duration-300 group-hover:ring-theme-primary/30 ${dimmed ? 'opacity-55 grayscale' : ''}`}
      >
        {p.image ? (
          <ProductImage
            src={p.image}
            alt={displayName}
            loading="lazy"
            className="!bg-transparent"
            imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-theme-muted">
            <ShoppingBag className="h-10 w-10" aria-hidden />
          </div>
        )}
        {badges || trailingBadge ? (
          <div className="absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">{badges}</div>
            {trailingBadge}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SaleBadge() {
  const { t } = useShopLanguage();
  return (
    <span className="rounded-full bg-theme-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-theme-primary-contrast shadow-sm">
      {t('badgeSale')}
    </span>
  );
}

function SoldOutBadge() {
  const { t } = useShopLanguage();
  return (
    <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
      {t('badgeSoldOut')}
    </span>
  );
}

export function ShopProductCard({ product: p, shopUsername, currency, linkState }: ProductCardProps) {
  const { t, productName, productDescription } = useShopLanguage();
  const localizedName = productName(p);
  const localizedDescription = productDescription(p);
  const sale = Number(p.price) || 0;
  const onSale = p.compareAtPrice != null && p.compareAtPrice > sale;
  const outOfStock = p.inStock === false;
  const isFeatured = Boolean(p.isFeatured);
  const productUrl = `/${shopUsername}/product/${p.id}`;

  return (
    <ProductCardShell
      to={productUrl}
      state={linkState}
      className={isFeatured ? 'ring-theme-primary/30 hover:ring-theme-primary/60' : ''}
    >
      <ProductCardVisual
        product={p}
        displayName={localizedName}
        dimmed={outOfStock}
        badges={
          <>
            {onSale ? <SaleBadge /> : null}
            {outOfStock ? <SoldOutBadge /> : null}
          </>
        }
        trailingBadge={
          isFeatured ? (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-theme-surface shadow-sm ring-1 ring-amber-400/40"
              title={t('badgeFeatured')}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            </span>
          ) : undefined
        }
      />
      <div className="flex min-w-0 flex-1 flex-col p-2.5 pt-1.5 max-lg:p-2.5 max-lg:pt-1.5 lg:p-4 lg:pt-2.5">
        <h3 className="line-clamp-2 text-xs max-lg:text-xs font-bold leading-snug text-theme-primary lg:text-sm">
          {localizedName}
        </h3>
        <p
          className="mt-1 min-h-[1rem] min-w-0 truncate text-xs leading-4 text-theme-muted"
          title={localizedDescription.trim() || undefined}
        >
          {localizedDescription.trim() || '\u00a0'}
        </p>
        <div className="mt-auto pt-2">
          <ProductPriceInline p={p} currency={currency} />
        </div>
      </div>
    </ProductCardShell>
  );
}

type Props = {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
};

export default function ShopHomePage({ shop, products, username, containerClass }: Props) {
  const { t, lang } = useShopLanguage();
  const visibleCategories = (shop.categories ?? []).filter((c) => (c as ShopCategory).visible !== false);
  const showCategories = Boolean(shop.categoriesEnabled && visibleCategories.length > 0);
  const featuredProducts = products.filter((p) => p.isFeatured);
  const regularProducts = products.filter((p) => !p.isFeatured);
  const homeCategories = visibleCategories.slice(0, HOME_CATEGORIES_LIMIT);
  const homeFeatured = featuredProducts.slice(0, HOME_FEATURED_PRODUCTS_LIMIT);
  const morePool = regularProducts.length > 0 ? regularProducts : products;
  const homeMoreProducts = morePool.slice(0, HOME_MORE_PRODUCTS_LIMIT);
  const introText = getLocalizedHomeIntro(shop, lang);
  const showHero = Boolean(
    shop.homeHeroEnabled && (getLocalizedHomeHeroTitle(shop, lang) || introText || shop.homeHeroImage),
  );
  const trustBadges = shop.homeTrustEnabled
    ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim())
    : [];
  const showTrust = trustBadges.length > 0;
  const reviewsRaw = shop.homeReviewsEnabled
    ? (shop.homeReviews ?? []).filter((r) => r.name?.trim() && r.text?.trim())
    : [];
  const reviews = reviewsRaw.map((r) => ({
    ...r,
    name: getLocalizedReviewName(r, lang),
    text: getLocalizedReviewText(r, lang),
  }));
  const showReviews = reviews.length > 0;

  const heroTitle = getLocalizedHomeHeroTitle(shop, lang) || shop.shopName;
  const hasContentAboveProducts =
    showHero || showTrust || showCategories || featuredProducts.length > 0;

  return (
    <>
      {showHero ? (
        <section className={`${containerClass} pt-4 max-lg:pt-4 lg:pt-7`}>
          <div className="overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface shadow-theme-card ring-1 ring-theme-border">
            <div className="grid min-w-0 max-lg:grid-cols-1 lg:grid-cols-2 lg:items-stretch">
              <div className="flex min-w-0 flex-col justify-center p-4 max-lg:order-2 max-lg:p-4 max-lg:pt-3 lg:order-none lg:px-7 lg:py-6">
                <h1 className="text-xl max-lg:leading-snug font-bold tracking-tight text-theme-primary lg:text-[1.8125rem]">
                  {heroTitle}
                </h1>
                {introText ? (
                  <p className="mt-2 max-lg:mt-2 max-w-lg text-sm max-lg:text-sm leading-relaxed text-theme-secondary lg:mt-3 lg:text-base">
                    {introText}
                  </p>
                ) : null}
                <div className="mt-4 max-lg:mt-4 flex flex-col gap-2 max-lg:w-full max-lg:gap-2 lg:mt-6 lg:flex-row lg:flex-wrap lg:gap-2.5">
                  <Link
                    to={`/${username}/products`}
                    className="inline-flex w-full max-lg:w-full items-center justify-center rounded-theme-btn bg-theme-primary px-4 py-2.5 max-lg:px-4 max-lg:py-2.5 text-sm font-semibold text-theme-primary-contrast no-underline shadow-md shadow-theme-primary/20 transition-all hover:opacity-90 lg:w-auto lg:px-5"
                  >
                    {t('heroBrowse')}
                  </Link>
                  <Link
                    to={`/${username}/contact`}
                    className="inline-flex w-full max-lg:w-full items-center justify-center rounded-theme-btn border border-theme-border bg-theme-surface px-4 py-2.5 max-lg:px-4 max-lg:py-2.5 text-sm font-semibold text-theme-primary no-underline transition-colors hover:bg-theme-bg lg:w-auto lg:px-5"
                  >
                    {t('heroContact')}
                  </Link>
                </div>
              </div>
              <div
                className={`relative w-full min-w-0 overflow-hidden bg-theme-bg max-lg:order-1 ${STORE_HERO_ASPECT_CLASS}`}
              >
                {shop.homeHeroImage ? (
                  <img
                    src={shop.homeHeroImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center max-lg:object-cover lg:object-contain"
                  />
                ) : shop.logo ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6 max-lg:p-6 lg:p-8">
                    <img
                      src={shop.logo}
                      alt=""
                      className="max-h-28 max-lg:max-h-28 w-auto max-w-full object-contain drop-shadow-sm lg:max-h-40"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-theme-muted">
                    <ShoppingBag className="h-16 w-16 max-lg:h-16 max-lg:w-16 lg:h-24 lg:w-24" strokeWidth={1.25} aria-hidden />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {showTrust && (
        <section
          className={`${containerClass} ${showHero ? 'mt-6 max-lg:mt-6 lg:mt-10' : 'pt-4 max-lg:pt-4 lg:pt-6'}`}
        >
          <ShopSectionHeading title={t('trustTitle')} description={t('trustBody')} />
          <div className="grid grid-cols-1 gap-2 max-lg:gap-2 sm:max-lg:grid-cols-2 lg:grid-cols-4 lg:gap-2.5">
            {trustBadges.map((badge, i) => (
              <div
                key={`${badge.label}-${i}`}
                className="flex min-h-[2.75rem] max-lg:min-h-[2.75rem] items-center justify-center gap-2 rounded-theme-card border border-theme-border bg-theme-surface px-3 py-2.5 max-lg:px-3 max-lg:py-2.5 text-center shadow-theme-card ring-1 ring-theme-border lg:min-h-[3.25rem] lg:gap-2.5 lg:px-4 lg:py-3"
              >
                <TrustBadgeTypeIcon
                  type={resolveTrustBadgeType(badge.icon)}
                  className="h-4 w-4 max-lg:h-4 max-lg:w-4 shrink-0 text-theme-primary lg:h-5 lg:w-5"
                />
                <span className="text-xs max-lg:text-xs font-semibold text-theme-primary lg:text-sm">
                  {getLocalizedTrustLabel(badge, lang)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showCategories && (
        <section className={`${containerClass} mt-6 max-lg:mt-6 lg:mt-10`} aria-label={t('homeCategoriesTitle')}>
          <ShopSectionHeading
            title={t('homeCategoriesTitle')}
            description={t('homeCategoriesBody')}
            trailing={<ShopViewAllLink to={`/${username}/categories`} />}
          />
          <div className="grid grid-cols-2 gap-2.5 max-lg:gap-2.5 lg:grid-cols-4 lg:gap-5">
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
      )}

      {featuredProducts.length > 0 && (
        <section className={`${containerClass} mt-6 max-lg:mt-6 lg:mt-10`}>
          <ShopSectionHeading
            title={t('homeFeaturedTitle')}
            description={t('homeFeaturedBody')}
            trailing={
              featuredProducts.length > HOME_FEATURED_PRODUCTS_LIMIT ? (
                <ShopViewAllLink to={`/${username}/products`} />
              ) : null
            }
          />
          <div className="grid grid-cols-2 gap-2.5 max-lg:gap-2.5 lg:grid-cols-4 lg:gap-4">
            {homeFeatured.map((p) => (
              <ShopProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
            ))}
          </div>
        </section>
      )}

      <main
        id="shop-products"
        className={`${containerClass} pb-8 max-lg:pb-8 lg:pb-12 ${
          hasContentAboveProducts ? 'mt-6 max-lg:mt-6 lg:mt-10' : 'pt-4 max-lg:pt-4 lg:pt-7'
        }`}
      >
        <div id="shop-all-products" className="scroll-mt-24">
          <ShopSectionHeading
            title={featuredProducts.length > 0 ? t('homeMoreTitle') : t('homeAllTitle')}
            description={featuredProducts.length > 0 ? t('homeMoreBody') : t('homeAllBody')}
            trailing={products.length > 0 ? <ShopViewAllLink to={`/${username}/products`} /> : null}
          />
        </div>

        {products.length === 0 ? (
          <div className="rounded-theme-card border border-dashed border-theme-border bg-theme-surface px-4 py-10 max-lg:px-4 max-lg:py-10 text-center shadow-theme-card lg:px-6 lg:py-14">
            <span className="mx-auto flex h-12 w-12 max-lg:h-12 max-lg:w-12 items-center justify-center rounded-theme-card bg-theme-primary/10 text-theme-primary ring-1 ring-theme-primary/20 lg:h-14 lg:w-14">
              <ShoppingBag className="h-6 w-6 max-lg:h-6 max-lg:w-6 lg:h-7 lg:w-7" aria-hidden />
            </span>
            <p className="mt-3 max-lg:mt-3 text-sm max-lg:text-sm font-semibold text-theme-primary lg:mt-4">{t('homeNoProducts')}</p>
            <p className="mt-1 text-xs max-lg:text-xs text-theme-muted lg:text-sm">{t('homeNoProductsBody')}</p>
          </div>
        ) : regularProducts.length === 0 && featuredProducts.length > 0 ? (
          <p className="rounded-theme-card border border-theme-border bg-theme-surface px-3 py-5 max-lg:px-3 max-lg:py-5 text-center text-xs max-lg:text-xs text-theme-muted lg:px-4 lg:py-6 lg:text-sm">
            {t('homeAllFeatured')}{' '}
            <ShopViewAllLink to={`/${username}/products`} />
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 max-lg:gap-2.5 lg:grid-cols-4 lg:gap-4">
            {homeMoreProducts.map((p) => (
              <ShopProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
            ))}
          </div>
        )}
      </main>

      {showReviews && <ShopReviewsSection reviews={reviews} containerClass={containerClass} />}
    </>
  );
}
