import { useParams } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import ComponentShopCategoryPage from '../../components/shop/ShopCategoryPage';
import type { Product, Shop, ShopCategory } from '../../types';

const defaultContainerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

type Props = {
  shop?: Shop | null;
  category?: ShopCategory | null;
  categoryImage?: string | null;
  categoryProducts?: Product[];
  username?: string;
  containerClass?: string;
};

export default function ShopCategoryPage(props: Props) {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const shopContext = useShop();

  const shop = props.shop ?? shopContext.shop;
  const username = props.username ?? shopContext.username;
  const containerClass = props.containerClass ?? defaultContainerClass;

  const currentCategory =
    props.category !== undefined
      ? props.category
      : categorySlug
      ? shop?.categories?.find((c) => c.slug === categorySlug) ?? null
      : null;

  const categoryImage =
    props.categoryImage !== undefined
      ? props.categoryImage
      : currentCategory?.image ?? null;

  const categoryProducts =
    props.categoryProducts !== undefined
      ? props.categoryProducts
      : categorySlug
      ? shopContext.products.filter((p) => (p.category ?? '') === categorySlug)
      : [];

  if (!shop) return null;

  return (
    <ComponentShopCategoryPage
      shop={shop}
      category={currentCategory}
      categoryImage={categoryImage}
      categoryProducts={categoryProducts}
      username={username}
      containerClass={containerClass}
    />
  );
}
