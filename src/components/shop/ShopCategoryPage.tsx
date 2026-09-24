import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LayoutGrid, Package, ShoppingBag } from 'lucide-react';
import type { Product, Shop, ShopCategory } from '../../types';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { CATEGORY_CARD_ASPECT_CLASS } from '../../lib/imageCropViewports';
import { SHOP_LIST_PAGE_SIZE } from '../../lib/shopPagination';
import ProductCard from './theme-parts/ProductCard';
import ShopPagination from './ShopPagination';
import { ShopViewAllLink } from './ShopSectionHeading';

type Props = {
  shop: Shop;
  category: ShopCategory | null;
  categoryImage: string | null;
  categoryProducts: Product[];
  username: string;
  containerClass: string;
};

export default function ShopCategoryPage({
  shop,
  category,
  categoryImage,
  categoryProducts,
  username,
  containerClass,
}: Props) {
  const { t, categoryName } = useShopLanguage();
  const [page, setPage] = useState(1);
  const categoryDisplayName = category ? categoryName(category) : '';
  const visible = useMemo(
    () => categoryProducts.filter((p) => p.isVisible !== false),
    [categoryProducts],
  );
  const count = visible.length;
  const totalPages = Math.max(1, Math.ceil(count / SHOP_LIST_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const displayedProducts = visible.slice(
    (safePage - 1) * SHOP_LIST_PAGE_SIZE,
    safePage * SHOP_LIST_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [category?.slug]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const productCountLabel =
    count === 1 ? t('categoryCountOne', { count }) : t('categoryCountMany', { count });

  const categoryImageClass = `relative ${CATEGORY_CARD_ASPECT_CLASS} w-full max-w-[12.5rem] shrink-0 overflow-hidden rounded-theme-card bg-theme-surface ring-1 ring-theme-border`;

  const categoryPlaceholderClass = `flex w-full max-w-[12.5rem] shrink-0 items-center justify-center overflow-hidden rounded-theme-card bg-gradient-to-br from-theme-primary via-theme-primary to-theme-primary/80 ${CATEGORY_CARD_ASPECT_CLASS}`;

  return (
    <main className={`${containerClass} flex-1 pb-8 pt-4 max-lg:pb-8 max-lg:pt-4 lg:pb-14 lg:pt-8`}>
      <div className="mb-4 flex flex-col items-start gap-2.5 max-lg:mb-4 lg:mb-6 lg:gap-3">
        <Link
          to={`/${username}/categories`}
          className="inline-flex items-center gap-2 rounded-theme-btn border border-theme-border bg-theme-surface px-4 py-2.5 text-sm font-semibold text-theme-secondary no-underline shadow-theme-card transition-colors hover:border-theme-primary hover:text-theme-primary"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {t('categoryBack')}
        </Link>

        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-theme-muted lg:gap-x-1.5 lg:text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            to={`/${username}`}
            className="font-medium no-underline transition-colors hover:text-theme-primary"
          >
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60 rtl:rotate-180 lg:h-4 lg:w-4" aria-hidden />
          <Link
            to={`/${username}/categories`}
            className="font-medium no-underline transition-colors hover:text-theme-primary"
          >
            {t('breadcrumbCategories')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60 rtl:rotate-180 lg:h-4 lg:w-4" aria-hidden />
          <span className="font-semibold break-words text-theme-primary">{categoryDisplayName}</span>
        </nav>
      </div>

      <header
        className={`relative mb-5 block w-full overflow-hidden rounded-theme-card shadow-theme-card ring-1 ring-theme-border lg:hidden ${CATEGORY_CARD_ASPECT_CLASS}`}
      >
        <div className="absolute inset-0 bg-theme-surface">
          {categoryImage ? (
            <img
              src={categoryImage}
              alt=""
              className="h-full w-full object-cover object-center"
              loading="eager"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-theme-primary/10 via-theme-primary/5 to-theme-surface">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-theme-surface/90 text-theme-primary shadow-lg ring-1 ring-theme-border backdrop-blur-sm">
                <LayoutGrid className="h-8 w-8" aria-hidden />
              </span>
            </div>
          )}
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/5"
          aria-hidden
        />
        <span className="absolute start-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
          <Package className="h-3 w-3 shrink-0" aria-hidden />
          {t('categoryBadge')}
        </span>
        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <h1 className="text-xl font-bold leading-snug tracking-tight text-white drop-shadow-sm">
            {categoryDisplayName}
          </h1>
          <p className="mt-1 text-xs text-white/85">{productCountLabel}</p>
        </div>
      </header>

      <header className="mb-10 hidden items-center gap-6 rounded-theme-card border border-theme-border bg-theme-surface p-6 shadow-theme-card lg:flex">
        {categoryImage ? (
          <div className={categoryImageClass}>
            <img
              src={categoryImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="eager"
            />
          </div>
        ) : (
          <div className={categoryPlaceholderClass}>
            <LayoutGrid className="h-10 w-10 text-white/35" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1 text-start">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-theme-primary/20 bg-theme-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-theme-primary">
            <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('categoryBadge')}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-theme-primary xl:text-3xl">
            {categoryDisplayName}
          </h1>
          <p className="mt-2 text-sm text-theme-secondary">{productCountLabel}</p>
        </div>
      </header>

      {count === 0 ? (
        <div className="rounded-theme-card border border-dashed border-theme-border bg-theme-surface px-4 py-10 text-center shadow-theme-card max-lg:px-4 max-lg:py-10 lg:px-6 lg:py-14">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-theme-card bg-theme-primary/10 text-theme-primary ring-1 ring-theme-primary/20 lg:h-14 lg:w-14">
            <ShoppingBag className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-theme-primary lg:mt-4">{t('categoryEmpty')}</p>
          <p className="mt-1 text-xs text-theme-muted lg:text-sm">{t('categoryEmptyBody')}</p>
          <Link
            to={`/${username}/categories`}
            className="mt-5 inline-flex items-center gap-1.5 rounded-theme-btn border border-theme-border bg-theme-surface px-5 py-2.5 text-sm font-semibold text-theme-primary no-underline transition-colors hover:bg-theme-bg lg:mt-6"
          >
            {t('categoryAll')}
            <ChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      ) : (
        <section aria-labelledby="category-products-heading">
          <div className="mb-4 flex items-start justify-between gap-2 max-lg:mb-4 lg:mb-6 lg:items-end lg:gap-3">
            <div className="min-w-0 flex-1 pe-2">
              <h2
                id="category-products-heading"
                className="text-base font-bold text-theme-primary max-lg:leading-snug lg:text-xl"
              >
                {t('categoryProductsTitle')}
              </h2>
              <p className="mt-0.5 text-xs text-theme-muted lg:text-sm">
                {t('categoryProductsBody', { name: categoryDisplayName })}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              <ShopViewAllLink to={`/${username}/products`} />
            </div>
          </div>
          <div className="relative z-0 grid grid-cols-2 gap-2.5 max-lg:gap-2.5 lg:gap-5 xl:grid-cols-4">
            {displayedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                shopUsername={username}
                currency={shop.currency}
                linkState={category ? { from: 'category', categorySlug: category.slug } : { from: 'products' }}
              />
            ))}
          </div>
          <ShopPagination
            className="mt-6 max-lg:mt-6 lg:mt-10"
            page={safePage}
            total={count}
            pageSize={SHOP_LIST_PAGE_SIZE}
            onPage={setPage}
          />
        </section>
      )}
    </main>
  );
}
