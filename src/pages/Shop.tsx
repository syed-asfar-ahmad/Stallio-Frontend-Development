import { useEffect, type ReactNode } from 'react';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
import ErrorBoundary from '../components/ErrorBoundary';
import StandalonePreviewBadge from '../components/shop/StandalonePreviewBadge';
import { isThemePreviewFrame, PREVIEW_MSG, THEME_PREVIEW_USERNAME } from '../lib/themePreviewBridge';

/** Inside the dashboard preview iframe: follow navigate commands and report the current path. */
function ThemePreviewBridge() {
  const { username } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  // Only the dashboard's iframe talks to a parent window; a standalone tab has none.
  const active = username === THEME_PREVIEW_USERNAME && isThemePreviewFrame();
  const prefix = `/${THEME_PREVIEW_USERNAME}`;

  useEffect(() => {
    if (!active) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const data = e.data as { type?: string; path?: string } | null;
      if (data?.type === PREVIEW_MSG.navigate && typeof data.path === 'string') {
        navigate(data.path === '/' ? prefix : `${prefix}${data.path}`);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [active, navigate, prefix]);

  useEffect(() => {
    if (!active) return;
    const path = location.pathname.slice(prefix.length) || '/';
    window.parent.postMessage({ type: PREVIEW_MSG.path, path }, window.location.origin);
  }, [active, location.pathname, prefix]);

  return null;
}

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

function ShopCrashFallback({ error }: { error: Error | null }) {
  const isPreview = typeof window !== 'undefined' && window.location.pathname.startsWith(`/${THEME_PREVIEW_USERNAME}`);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-6 text-center dark:bg-zinc-950">
      <p className="text-base font-semibold text-stone-800 dark:text-zinc-100">
        {isPreview ? 'This theme preview could not be rendered.' : 'This page could not be displayed.'}
      </p>
      {isPreview && error && (
        <pre className="max-w-xl overflow-auto rounded-lg bg-stone-200/70 p-3 text-left text-xs text-stone-700 dark:bg-zinc-800 dark:text-zinc-300">
          {error.message}
        </pre>
      )}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        style={{ color: '#fff' }}
      >
        Reload
      </button>
    </div>
  );
}

export default function Shop() {
  return (
    <ErrorBoundary fallback={(error) => <ShopCrashFallback error={error} />}>
      <ShopDataProvider>
        <CartProvider>
          <ThemePreviewBridge />
          <ShopLangGate>
            <ShopShell />
          </ShopLangGate>
          <StandalonePreviewBadge />
        </CartProvider>
      </ShopDataProvider>
    </ErrorBoundary>
  );
}
