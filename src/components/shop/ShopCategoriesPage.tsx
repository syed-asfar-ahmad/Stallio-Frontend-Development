import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product, Shop } from '../../types';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { ShopCategoryCard } from './ShopHomePage';
import ShopPagination from './ShopPagination';
import { SHOP_LIST_PAGE_SIZE } from '../../lib/shopPagination';
import { useStorefrontTheme } from '../../themes';
import { CocoaCategoryTile, CocoaHeading, CocoaMosaic } from './theme-parts/cocoa/CocoaParts';
import { MartCategoryTile, MartSectionHeader } from './theme-parts/mart/MartParts';
import { FreshHeading, shapeFor } from './theme-parts/fresh/FreshParts';

type Props = {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
};

export default function ShopCategoriesPage({ shop, products, username, containerClass }: Props) {
  const { t, categoryName } = useShopLanguage();
  const { layout } = useStorefrontTheme();
  const [page, setPage] = useState(1);
  const visibleCategories = useMemo(
    () => (shop.categories ?? []).filter((c) => c.visible !== false),
    [shop.categories],
  );
  const totalPages = Math.max(1, Math.ceil(visibleCategories.length / SHOP_LIST_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const displayed = visibleCategories.slice(
    (safePage - 1) * SHOP_LIST_PAGE_SIZE,
    safePage * SHOP_LIST_PAGE_SIZE,
  );

  if (layout.categoryVariant === 'fresh-collections') {
    const countOfF = (slug: string) => products.filter((p) => (p.category ?? '') === slug && p.isVisible !== false).length;
    return (
      <main className={`${containerClass} flex-1 pb-16 pt-10 lg:pb-28 lg:pt-16`}>
        <FreshHeading as="h1" center title={t('categoriesTitle')} body={t('categoriesBody', { shopName: shop.shopName })} />
        {visibleCategories.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-text-primary)' }}>
              <LayoutGrid className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('categoriesEmpty')}</p>
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('categoriesEmptyBody')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
              {displayed.map((c, i) => (
                <Link key={c.slug} to={`/${username}/category/${c.slug}`} className="group flex flex-col items-center gap-4 no-underline">
                  <span
                    className="relative flex aspect-square w-full max-w-[13rem] items-center justify-center overflow-hidden rounded-full transition-transform duration-500 group-hover:-translate-y-1.5"
                    style={{ background: shapeFor(c.slug, i) }}
                  >
                    {c.image ? (
                      <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl font-medium" style={{ fontFamily: 'var(--theme-font-heading)', color: '#1e1611' }}>{categoryName(c).slice(0, 1).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="text-center">
                    <span className="block text-base font-medium" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>{categoryName(c)}</span>
                    <span className="mt-0.5 block text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                      {countOfF(c.slug)} {countOfF(c.slug) === 1 ? t('categoryProduct') : t('categoryProducts')}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <ShopPagination className="mt-14 lg:mt-20" page={safePage} total={visibleCategories.length} pageSize={SHOP_LIST_PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </main>
    );
  }

  if (layout.categoryVariant === 'mart-collections') {
    const countOfV = (slug: string) => products.filter((p) => (p.category ?? '') === slug && p.isVisible !== false).length;
    return (
      <main className={`${containerClass} flex-1 pb-16 pt-6 lg:pb-28 lg:pt-10`}>
        <MartSectionHeader as="h1" eyebrow={t('shopByCategory')} title={t('categoriesTitle')} />
        {visibleCategories.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}>
              <LayoutGrid className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('categoriesEmpty')}</p>
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('categoriesEmptyBody')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {displayed.map((c, i) => {
                const big = safePage === 1 && i === 0 && displayed.length > 2;
                return (
                  <MartCategoryTile
                    key={c.slug}
                    category={c}
                    username={username}
                    count={countOfV(c.slug)}
                    large={big}
                    className={big ? 'col-span-2 min-h-[18rem] lg:row-span-2 lg:min-h-[28rem]' : 'min-h-[13rem] lg:min-h-[13.5rem]'}
                  />
                );
              })}
            </div>
            <ShopPagination className="mt-12 lg:mt-16" page={safePage} total={visibleCategories.length} pageSize={SHOP_LIST_PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </main>
    );
  }

  if (layout.categoryVariant === 'cocoa-collections') {
    const countOf = (slug: string) =>
      products.filter((p) => (p.category ?? '') === slug && p.isVisible !== false).length;
    const featuredSet = safePage === 1 ? displayed.slice(0, 4) : [];
    const restSet = safePage === 1 ? displayed.slice(4) : displayed;

    return (
      <main className={`${containerClass} flex-1 pb-16 pt-10 lg:pb-28 lg:pt-16`}>
        <CocoaHeading as="h1" title={t('categoriesTitle')} body={t('categoriesBody', { shopName: shop.shopName })} />

        {visibleCategories.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
            >
              <LayoutGrid className="h-6 w-6" aria-hidden />
            </span>
            <p className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('categoriesEmpty')}</p>
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('categoriesEmptyBody')}</p>
          </div>
        ) : (
          <>
            {featuredSet.length > 0 && <CocoaMosaic categories={featuredSet} username={username} />}
            {restSet.length > 0 && (
              <div className={`grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 ${featuredSet.length > 0 ? 'mt-4 lg:mt-5' : ''}`}>
                {restSet.map((c) => (
                  <CocoaCategoryTile key={c.slug} category={c} username={username} count={countOf(c.slug)} />
                ))}
              </div>
            )}
            <ShopPagination
              className="mt-12 lg:mt-16"
              page={safePage}
              total={visibleCategories.length}
              pageSize={SHOP_LIST_PAGE_SIZE}
              onPage={setPage}
            />
          </>
        )}
      </main>
    );
  }

  return (
    <main className={`${containerClass} flex-1 pb-8 pt-4 max-lg:pb-8 max-lg:pt-4 lg:pb-14 lg:pt-8`}>
      <section className="relative mb-5 max-lg:mb-5 overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:p-4 lg:mb-10 lg:p-10">
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-theme-badge border border-theme-border bg-theme-primary-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-theme-primary lg:px-3 lg:py-1 lg:text-xs">
            <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('categoriesBadge')}
          </p>
          <h1
            style={{ fontFamily: 'var(--theme-font-heading, inherit)' }}
            className="mt-3 max-lg:mt-3 text-xl max-lg:leading-snug font-bold tracking-tight text-theme-text lg:mt-4 lg:text-3xl xl:text-4xl"
          >
            {t('categoriesTitle')}
          </h1>
          <p className="mt-1.5 max-lg:mt-1.5 max-w-3xl text-pretty text-xs max-lg:text-xs leading-relaxed text-theme-text-muted lg:mt-2 lg:text-base">
            {t('categoriesBody', { shopName: shop.shopName })}
          </p>
        </div>
      </section>

      {visibleCategories.length === 0 ? (
        <div className="rounded-theme-card border border-dashed border-theme-border bg-theme-surface px-4 py-10 text-center shadow-theme-card max-lg:px-4 max-lg:py-10 lg:px-6 lg:py-14">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-theme-card bg-theme-primary-light text-theme-primary lg:h-14 lg:w-14">
            <LayoutGrid className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-theme-text lg:mt-4">{t('categoriesEmpty')}</p>
          <p className="mt-1 text-xs text-theme-text-muted lg:text-sm">{t('categoriesEmptyBody')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 max-lg:gap-2.5 sm:gap-6 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {displayed.map((c) => (
              <ShopCategoryCard
                key={c.slug}
                category={c}
                shopUsername={username}
                productCount={products.filter((p) => (p.category ?? '') === c.slug && p.isVisible !== false).length}
              />
            ))}
          </div>
          <ShopPagination
            className="mt-6 max-lg:mt-6 lg:mt-10"
            page={safePage}
            total={visibleCategories.length}
            pageSize={SHOP_LIST_PAGE_SIZE}
            onPage={setPage}
          />
        </>
      )}
    </main>
  );
}
