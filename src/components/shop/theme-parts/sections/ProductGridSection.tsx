import { ShoppingBag } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ProductCard from '../ProductCard';
import type { Product, Shop } from '../../../../types';

const LIMIT = 8;

export default function ProductGridSection({
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
  const regular = products.filter((p) => !p.isFeatured);
  const list = (regular.length > 0 ? regular : products).slice(0, LIMIT);

  return (
    <section className={`${containerClass} mt-6 lg:mt-10`}>
      <h2
        className="mb-4 text-base font-bold lg:mb-5 lg:text-xl"
        style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
      >
        {t('homeAllTitle')}
      </h2>
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ShoppingBag className="h-8 w-8" style={{ color: 'var(--theme-text-muted)' }} strokeWidth={1} />
          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            {t('homeNoProducts')}
          </p>
        </div>
      ) : (
        <div className={`grid ${gridColsClass} gap-4 lg:gap-6`}>
          {list.map((p) => (
            <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'home' }} />
          ))}
        </div>
      )}
    </section>
  );
}