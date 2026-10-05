import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ProductCard from '../ProductCard';
import type { Product, Shop } from '../../../../types';

const LIMIT = 8;

export default function FeaturedProductsSection({
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
  const featured = products.filter((p) => p.isFeatured).slice(0, LIMIT);
  if (featured.length === 0) return null;

  return (
    <section className={`${containerClass} mt-6 lg:mt-10`}>
      <h2
        className="mb-4 text-base font-bold lg:mb-5 lg:text-xl"
        style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
      >
        {t('homeFeaturedTitle')}
      </h2>
      <div className={`grid ${gridColsClass} gap-4 lg:gap-6`}>
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
        ))}
      </div>
    </section>
  );
}