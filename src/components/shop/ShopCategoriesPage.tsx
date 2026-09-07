import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import type { Product, Shop } from '../../types';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { ShopCategoryCard } from './ShopHomePage';
import ShopPagination from './ShopPagination';
import { SHOP_LIST_PAGE_SIZE } from '../../lib/shopPagination';

type Props = {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
};

export default function ShopCategoriesPage({ shop, products, username, containerClass }: Props) {
  const { t } = useShopLanguage();
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

  return (
    <main className={`${containerClass} flex-1 pb-8 pt-4 max-lg:pb-8 max-lg:pt-4 lg:pb-14 lg:pt-8`}>
      <section className="relative mb-5 max-lg:mb-5 overflow-hidden rounded-2xl max-lg:rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white via-brand-50/40 to-brand-50/50 p-4 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-brand-950/35 dark:to-brand-950/25 max-lg:p-4 lg:mb-10 lg:rounded-3xl lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-500/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-brand-200/25 blur-3xl dark:bg-brand-500/10" aria-hidden />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800 dark:border-brand-700/50 dark:bg-brand-950/50 dark:text-brand-300 lg:px-3 lg:py-1 lg:text-xs">
            <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('categoriesBadge')}
          </p>
          <h1 className="mt-3 max-lg:mt-3 text-xl max-lg:leading-snug font-bold tracking-tight text-stone-900 dark:text-zinc-100 lg:mt-4 lg:text-3xl xl:text-4xl">
            {t('categoriesTitle')}
          </h1>
          <p className="mt-1.5 max-lg:mt-1.5 max-w-3xl text-pretty text-xs max-lg:text-xs leading-relaxed text-stone-600 dark:text-zinc-400 lg:mt-2 lg:text-base">
            {t('categoriesBody', { shopName: shop.shopName })}
          </p>
        </div>
      </section>

      {visibleCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:px-4 max-lg:py-10 lg:px-6 lg:py-14">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/50 dark:text-brand-400 dark:ring-brand-800/60 lg:h-14 lg:w-14">
            <LayoutGrid className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-stone-800 dark:text-zinc-100 lg:mt-4">{t('categoriesEmpty')}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400 lg:text-sm">{t('categoriesEmptyBody')}</p>
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
