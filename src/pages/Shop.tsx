import type { ReactNode } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { ShopDataProvider, useShop } from '../context/ShopContext';
import { CartProvider } from '../context/CartContext';
import { ShopLanguageProvider } from '../context/ShopLanguageContext';
import ShopLayout from './shop/ShopLayout';
import ShopHomePage from './shop/ShopHomePage';
import ShopProductDetailPage from './shop/ShopProductDetailPage';
import ShopAboutPage from './shop/ShopAboutPage';
import ShopContactPage from './shop/ShopContactPage';
import ShopRefundPage from './shop/ShopRefundPage';
import ShopProductsPage from './shop/ShopProductsPage';
import ShopCategoriesPage from './shop/ShopCategoriesPage';
import ShopCategoryPage from './shop/ShopCategoryPage';
import ShopNotFoundPage from './shop/ShopNotFoundPage';
import DashboardLoading from '../components/DashboardLoading';

function ShopLangGate({ children }: { children: ReactNode }) {
  const { username, shop } = useShop();
  return (
    <ShopLanguageProvider
      username={username}
      shopLangEsEnabled={shop?.shopLangEsEnabled}
      shopLangArEnabled={shop?.shopLangArEnabled}
    >
      {children}
    </ShopLanguageProvider>
  );
}

function ShopRouteSwitch() {
  const { shop, username } = useShop();
  const { productId, categorySlug } = useParams<{ productId?: string; categorySlug?: string }>();
  const location = useLocation();

  const path = location.pathname;

  if (productId) return <ShopProductDetailPage />;
  if (path.endsWith('/about')) return <ShopAboutPage />;
  if (path.endsWith('/contact')) return <ShopContactPage />;
  if (path.endsWith('/refund')) {
    return shop?.refundEnabled ? <ShopRefundPage /> : <Navigate to={`/${username}`} replace />;
  }
  if (path.endsWith('/products')) return <ShopProductsPage />;
  if (path.endsWith('/categories')) return <ShopCategoriesPage />;
  if (categorySlug) return <ShopCategoryPage />;

  return <ShopHomePage />;
}

function ShopShell() {
  const { shop, loading } = useShop();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-zinc-950">
        <DashboardLoading />
      </div>
    );
  }

  if (!shop) {
    return <ShopNotFoundPage />;
  }

  return (
    <ShopLayout>
      <ShopRouteSwitch />
    </ShopLayout>
  );
}

export default function Shop() {
  return (
    <ShopDataProvider>
      <CartProvider>
        <ShopLangGate>
          <ShopShell />
        </ShopLangGate>
      </CartProvider>
    </ShopDataProvider>
  );
}
