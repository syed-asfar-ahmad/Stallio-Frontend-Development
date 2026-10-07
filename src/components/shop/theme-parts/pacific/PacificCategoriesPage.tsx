import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Sprout, Leaf } from 'lucide-react';
import type { Product, Shop } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopPagination from '../../ShopPagination';
import { SHOP_LIST_PAGE_SIZE } from '../../../../lib/shopPagination';
import {
  PacificPillTag,
  PacificEditorialHeader,
  PacificCategoryMosaic,
  PacificCategoryCard,
} from './PacificParts';

type Props = {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
};

export default function PacificCategoriesPage({ shop, products, username, containerClass }: Props) {
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

  const counts = useMemo(() => {
    return visibleCategories.reduce<Record<string, number>>((acc, c) => {
      acc[c.slug] = products.filter((p) => (p.category ?? '') === c.slug && p.isVisible !== false).length;
      return acc;
    }, {});
  }, [visibleCategories, products]);

  const featuredMosaic = safePage === 1 ? displayed.slice(0, 3) : [];
  const standardList = safePage === 1 ? displayed.slice(3) : displayed;

  return (
    <main className={`${containerClass} flex-1 pb-16 pt-6 lg:pb-28 lg:pt-12`}>
      {/* Editorial Header */}
      <PacificEditorialHeader
        tag="Curated Directory"
        tagIcon={Leaf}
        title={t('categoriesTitle') || 'Artisanal Harvest Collections'}
        body={t('categoriesBody', { shopName: shop.shopName }) || 'Browse our seasonal selections curated by harvest type and botanical origin.'}
      />

      {visibleCategories.length === 0 ? (
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[var(--theme-radius-card)] border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
          >
            <LayoutGrid className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-base font-semibold text-theme-text">{t('categoriesEmpty')}</p>
          <p className="text-sm text-theme-text-muted">{t('categoriesEmptyBody')}</p>
        </div>
      ) : (
        <div className="space-y-8 lg:space-y-12">
          {/* Mosaic for first 3 categories on page 1 */}
          {featuredMosaic.length > 0 && (
            <PacificCategoryMosaic
              categories={featuredMosaic}
              username={username}
              counts={counts}
            />
          )}

          {/* Grid for remainder */}
          {standardList.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {standardList.map((c) => (
                <PacificCategoryCard
                  key={c.slug}
                  category={c}
                  shopUsername={username}
                  productCount={counts[c.slug] || 0}
                />
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
        </div>
      )}
    </main>
  );
}
