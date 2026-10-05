import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { ShopCategoryCard } from '../../ShopHomePage';
import type { Product, Shop } from '../../../../types';

const LIMIT = 8;

export default function CategoriesSection({
  shop,
  products,
  username,
  containerClass,
  gridColsClass,
}: {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
  gridColsClass: string;
}) {
  const { t } = useShopLanguage();
  const visible = (shop.categories ?? []).filter((c) => c.visible !== false).slice(0, LIMIT);
  if (!shop.categoriesEnabled || visible.length === 0) return null;

  return (
    <section className={`${containerClass} mt-6 lg:mt-10`}>
      <h2
        className="mb-4 text-base font-bold lg:mb-5 lg:text-xl"
        style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
      >
        {t('homeCategoriesTitle')}
      </h2>
      <div className={`grid ${gridColsClass} gap-3 lg:gap-4`}>
        {visible.map((c) => (
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
}