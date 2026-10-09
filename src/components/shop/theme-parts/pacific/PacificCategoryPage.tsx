import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, LayoutGrid, ShoppingBag, Sprout, ArrowRight } from 'lucide-react';
import type { Product, Shop, ShopCategory } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { SHOP_LIST_PAGE_SIZE } from '../../../../lib/shopPagination';
import ProductCard from '../ProductCard';
import ShopPagination from '../../ShopPagination';
import { PacificPillTag } from './PacificParts';

type Props = {
  shop: Shop;
  category: ShopCategory | null;
  categoryImage: string | null;
  categoryProducts: Product[];
  username: string;
  containerClass: string;
};

export default function PacificCategoryPage({
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

  return (
    <main className={`${containerClass} flex-1 pb-16 pt-5 lg:pb-28 lg:pt-8`}>
      {/* Breadcrumb & Back action */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-theme-text-muted"
          aria-label="Breadcrumb"
        >
          <Link
            to={`/${username}`}
            className="font-medium no-underline transition-colors hover:text-theme-primary"
          >
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
          <Link
            to={`/${username}/categories`}
            className="font-medium no-underline transition-colors hover:text-theme-primary"
          >
            {t('breadcrumbCategories')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
          <span className="font-semibold text-theme-text">{categoryDisplayName}</span>
        </nav>

        <Link
          to={`/${username}/categories`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-theme-border bg-theme-surface text-theme-text no-underline hover:bg-theme-surface-secondary shadow-sm transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <span>{t('categoryBack')}</span>
        </Link>
      </div>

      {/* Cinematic Category Banner */}
      <header
        className="relative isolate flex min-h-[16rem] sm:min-h-[20rem] lg:min-h-[26rem] items-end overflow-hidden rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)] mb-10 lg:mb-14"
        style={{
          borderColor: 'var(--theme-border)',
          background: 'linear-gradient(135deg, var(--theme-primary) 0%, #062b1a 100%)',
        }}
      >
        {categoryImage ? (
          <img
            src={categoryImage}
            alt={categoryDisplayName}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <Sprout className="w-32 h-32 text-white" />
          </div>
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(6, 43, 26, 0.92) 0%, rgba(6, 43, 26, 0.55) 50%, rgba(6, 43, 26, 0.15) 100%), linear-gradient(0deg, rgba(6, 43, 26, 0.8) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl text-white space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md bg-white/20 border border-white/25">
            <Sprout className="w-3 h-3" />
            <span>{productCountLabel}</span>
          </span>
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-tight"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              textWrap: 'balance' as never,
            }}
          >
            {categoryDisplayName}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-md">
            Hand-harvested small-batch provisions curated for biological purity and peak nutritional vitality.
          </p>
        </div>
      </header>

      {/* Product List or Empty State */}
      {count === 0 ? (
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[var(--theme-radius-card)] border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
          >
            <ShoppingBag className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-base font-semibold text-theme-text">{t('categoryEmpty')}</p>
          <p className="text-sm text-theme-text-muted">{t('categoryEmptyBody')}</p>
          <Link
            to={`/${username}/categories`}
            className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline shadow-sm"
            style={{ background: 'var(--theme-primary)' }}
          >
            {t('categoryAll')}
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        <section aria-label={t('categoryProductsTitle')}>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
            className="mt-14 lg:mt-20"
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
