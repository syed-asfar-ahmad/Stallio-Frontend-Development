import { useShop } from '../../context/ShopContext';
import ComponentShopCategoriesPage from '../../components/shop/ShopCategoriesPage';
import type { Product, Shop } from '../../types';

const defaultContainerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

type Props = {
  shop?: Shop | null;
  products?: Product[];
  username?: string;
  containerClass?: string;
};

export default function ShopCategoriesPage(props: Props) {
  const shopContext = useShop();

  const shop = props.shop ?? shopContext.shop;
  const products = props.products ?? shopContext.products;
  const username = props.username ?? shopContext.username;
  const containerClass = props.containerClass ?? defaultContainerClass;

  if (!shop) return null;

  return (
    <ComponentShopCategoriesPage
      shop={shop}
      products={products}
      username={username}
      containerClass={containerClass}
    />
  );
}
