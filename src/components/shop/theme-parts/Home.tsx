import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStorefrontTheme } from '../../../themes';
import { useShopLanguage } from '../../../context/ShopLanguageContext';
import { ShopCategoryCard } from '../ShopHomePage';
import Hero from './Hero';
import ProductCard from './ProductCard';
import type { Product, Shop } from '../../../types';

const HOME_CATEGORIES_LIMIT = 8;
const HOME_PRODUCTS_LIMIT = 8;

const GRID_COLUMN_CLASS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

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
  const { layout } = useStorefrontTheme();
  const { t } = useShopLanguage();

  const visibleCategories = (shop.categories ?? []).filter((c) => c.visible !== false);
  const showCategories = Boolean(layout.showCategoryPillsOnHome && shop.categoriesEnabled && visibleCategories.length > 0);
  const homeCategories = visibleCategories.slice(0, HOME_CATEGORIES_LIMIT);
  const homeProducts = layout.showFeaturedCollection ? products.slice(0, HOME_PRODUCTS_LIMIT) : products;
  const gridColsClass = GRID_COLUMN_CLASS[layout.productGridColumns];

  return (
    <>
      <Hero shop={shop} username={username} containerClass={containerClass} />

      {showCategories ? (
        <section className={`${containerClass} mt-6 lg:mt-10`}>
          <h2
            className="mb-4 text-base font-bold lg:mb-5 lg:text-xl"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
          >
            {t('homeCategoriesTitle')}
          </h2>
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
      ) : null}

      <main className={`${containerClass} ${showCategories ? 'mt-6 lg:mt-10' : 'pt-4 lg:pt-7'} pb-8 lg:pb-14`}>
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingBag className="h-8 w-8" style={{ color: 'var(--theme-text-muted)' }} strokeWidth={1} />
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
              {t('homeNoProducts')}
            </p>
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-4 lg:gap-6`}>
            {homeProducts.map((p) => (
              <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
            ))}
          </div>
        )}

        {layout.showFeaturedCollection && products.length > HOME_PRODUCTS_LIMIT ? (
          <div className="mt-8 text-center lg:mt-12">
            <Link
              to={`/${username}/products`}
              className="inline-flex items-center rounded-[var(--theme-radius-btn)] border-2 px-5 py-2.5 text-sm font-semibold no-underline"
              style={{ borderColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
            >
              {t('linkViewAll')}
            </Link>
          </div>
        ) : null}
      </main>
    </>
  );
}
