import { useStorefrontTheme } from '../../../themes';
import Hero from './Hero';
import { HOME_SECTION_REGISTRY } from './sections/registry';
import type { Product, Shop } from '../../../types';

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
  const gridColsClass = GRID_COLUMN_CLASS[layout.productGridColumns];
  const sections = layout.homeSections ?? [];

  return (
    <>
      {sections.includes('hero') && (
        <Hero shop={shop} username={username} containerClass={containerClass} />
      )}

      {sections
        .filter((id) => id !== 'hero')
        .map((id) => {
          const Section = HOME_SECTION_REGISTRY[id];
          if (!Section) return null;
          return (
            <Section
              key={id}
              shop={shop}
              products={products}
              username={username}
              containerClass={containerClass}
              gridColsClass={gridColsClass}
            />
          );
        })}
    </>
  );
}