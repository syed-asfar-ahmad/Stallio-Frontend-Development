import { useShop } from '../../context/ShopContext';
import ThemedHome from '../../components/shop/theme-parts/Home';

const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

export default function ShopHomePage() {
  const { shop, products, username } = useShop();

  if (!shop) return null;

  return (
    <ThemedHome
      shop={shop}
      products={products}
      username={username}
      containerClass={containerClass}
    />
  );
}
