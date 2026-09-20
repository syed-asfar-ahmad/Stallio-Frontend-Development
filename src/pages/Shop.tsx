import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, ArrowLeft, MessageCircle, LayoutGrid, Mail, Menu, X, FileText, ChevronDown, Phone, MapPin, Send, House, Package, Loader2, Check } from 'lucide-react';
import {
  formatHoursRange,
  hasFooterAvailability,
  normalizeAvailabilityHours,
} from '../lib/shopAvailability';
import type { Shop, Product } from '../types';
import { formatPrice, formatQuantity } from '../lib/countryCurrencyOptions';
import { getSocialBrandColor, SocialIcon } from '../components/SocialIcons';
import Header from '../components/shop/theme-parts/Header';
import Footer from '../components/shop/theme-parts/Footer';
import ThemedHome from '../components/shop/theme-parts/Home';
import ShopProductsPage from '../components/shop/ShopProductsPage';
import ShopCategoriesPage from '../components/shop/ShopCategoriesPage';
import ShopCategoryPage from '../components/shop/ShopCategoryPage';
import CheckoutModal, { type ShopCartItem } from '../components/shop/CheckoutModal';
import ThemeToggle from '../components/ThemeToggle';
import ShopLanguageToggle from '../components/shop/ShopLanguageToggle';
import { ShopLanguageProvider, useShopLanguage } from '../context/ShopLanguageContext';
import { useShopNavLinks } from '../hooks/useShopNavLinks';
import { shopWeekdayKey } from '../lib/shopUiTranslations';
import ShopDirRoot from '../components/shop/ShopDirRoot';
import DashboardLoading from '../components/DashboardLoading';
import { PRODUCT_CARD_ASPECT_CLASS, PRODUCT_IMAGE_CLASS, PRODUCT_IMAGE_FRAME_CLASS } from '../lib/imageCropViewports';
import ProductImage from '../components/ProductImage';
import { getProductImageDisplayUrl } from '../lib/productImageUrl';
import { prepareShopAboutHtml, SHOP_RICH_TEXT_BODY_CLASS } from '../lib/prepareShopAboutHtml';
import {
  getLocalizedAboutContent,
  getLocalizedAboutTitle,
  getLocalizedRefundContent,
  getLocalizedProductName,
  getLocalizedCustomerMessageLabel,
  getShopDisplayProductOptions,
  getLocalizedAnnouncementLines,
  getLocalizedFooterDescription,
  getLocalizedFooterAddress,
  shopLangStorageKey,
  type ShopContentLang,
} from '../lib/shopContentLanguages';
import ContactLtrText from '../components/ContactLtrText';
import { getShopCustomerLanguages } from '../lib/shopLocaleConfig';
import type { ShopProductLinkState } from '../lib/shopProductNav';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';
const shopPageClass = 'shop-storefront min-h-screen flex flex-col transition-colors duration-200';
const DEFAULT_ABOUT_TEXT_COLOR = '#ffffff';
const ADD_TO_CART_ANIM_MS = 750;
const ADD_TO_CART_SUCCESS_MS = 400;

function getSafeHexColor(value: string | null | undefined, fallback: string = DEFAULT_ABOUT_TEXT_COLOR): string {
  const trimmed = String(value ?? '').trim();
  return /^#([0-9A-Fa-f]{6})$/.test(trimmed) ? trimmed : fallback;
}

function ProductPrice({
  p,
  currency,
  className = '',
  priceOverride,
}: {
  p: Product;
  currency?: string | null;
  className?: string;
  priceOverride?: number;
}) {
  const sale = priceOverride != null ? priceOverride : Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  if (compare) {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span className="font-extrabold text-brand-700 text-base sm:text-lg">{formatPrice(sale, currency)}</span>
        <span className="text-sm text-stone-400 line-through">{formatPrice(compare, currency)}</span>
      </div>
    );
  }
  return <p className={`font-extrabold text-brand-700 text-base sm:text-lg ${className}`}>{formatPrice(sale, currency)}</p>;
}

function getEffectivePrice(p: Product, selectedOptions?: Record<string, string> | null): number {
  let price = Number(p.price) || 0;
  if (!selectedOptions || !p.options?.length) return price;
  for (const opt of p.options) {
    const choice = selectedOptions[opt.name];
    if (!choice) continue;
    const idx = (opt.choices || []).indexOf(choice);
    const mods = Array.isArray(opt.choicePriceModifiers) ? opt.choicePriceModifiers : [];
    if (idx >= 0 && idx < mods.length) price += Number(mods[idx]) || 0;
  }
  return Math.round(price * 100) / 100;
}

function cartStorageKey(shopUsername: string) {
  return `stallio-shop-cart:${shopUsername}`;
}

function loadCartFromStorage(shopUsername: string): ShopCartItem[] {
  try {
    const raw = localStorage.getItem(cartStorageKey(shopUsername));
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item): item is ShopCartItem =>
        item != null &&
        typeof item === 'object' &&
        typeof item.productId === 'string' &&
        typeof item.productName === 'string' &&
        typeof item.price === 'number' &&
        Number.isFinite(item.price) &&
        typeof item.quantity === 'number' &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

function saveCartToStorage(shopUsername: string, items: ShopCartItem[]) {
  const key = cartStorageKey(shopUsername);
  if (items.length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(items));
  }
}

function getCurrentShopLang(username: string, shop: Shop | null): ShopContentLang {
  if (typeof window === 'undefined') return 'en';
  const enabled = getShopCustomerLanguages({
    shopLangEsEnabled: shop?.shopLangEsEnabled,
    shopLangArEnabled: shop?.shopLangArEnabled,
  });
  const stored = localStorage.getItem(shopLangStorageKey(username));
  if (stored === 'es' && enabled.includes('es')) return 'es';
  if (stored === 'ar' && enabled.includes('ar')) return 'ar';
  return 'en';
}

function ShopLang({ username, shop, children }: { username: string; shop: Shop | null; children: ReactNode }) {
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

export default function Shop() {
  const { username, productId, categorySlug } = useParams<{ username: string; productId?: string; categorySlug?: string }>();
  const location = useLocation();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<ShopCartItem[]>(() => (username ? loadCartFromStorage(username) : []));
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [addToCartProduct, setAddToCartProduct] = useState<Product | null>(null);
  const [addToCartOptions, setAddToCartOptions] = useState<Record<string, string>>({});
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [detailQty, setDetailQty] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compactAnnouncement, setCompactAnnouncement] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  );
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');
  const [activeDetailImageIndex, setActiveDetailImageIndex] = useState(0);
  const [detailOptionDropdownOpen, setDetailOptionDropdownOpen] = useState<string | null>(null);
  const [detailOptionError, setDetailOptionError] = useState('');
  const [addToCartAnim, setAddToCartAnim] = useState<'idle' | 'adding' | 'success'>('idle');
  const addToCartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!username) {
      setCart([]);
      return;
    }
    setCart(loadCartFromStorage(username));
  }, [username]);

  useEffect(() => {
    if (!username) return;
    saveCartToStorage(username, cart);
  }, [cart, username]);

  useEffect(() => {
    if (!username) return;
    fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.shop) {
          const localThemeId = localStorage.getItem(`stallio_theme_${username}`);
          const localThemeConfig = localStorage.getItem(`stallio_theme_config_${username}`);
          let parsedConfig = undefined;
          if (localThemeConfig) {
            try {
              parsedConfig = JSON.parse(localThemeConfig);
            } catch {}
          }
          const effectiveShop = {
            ...data.shop,
            themeConfig: data.shop.themeConfig || parsedConfig || (localThemeId ? { version: 1, themeId: localThemeId } : undefined),
          };
          setShop(effectiveShop);
          setProducts(data.products || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);


  useEffect(() => {
    document.title = shop?.shopName ?? 'Stallio';
    return () => { document.title = 'Stallio'; };
  }, [shop?.shopName]);

  useEffect(() => {
    setActiveDetailImageIndex(0);
    setDetailOptionDropdownOpen(null);
    setDetailOptionError('');
    setAddToCartAnim('idle');
    if (addToCartTimerRef.current) {
      clearTimeout(addToCartTimerRef.current);
      addToCartTimerRef.current = null;
    }
  }, [productId]);

  useEffect(() => {
    return () => {
      if (addToCartTimerRef.current) clearTimeout(addToCartTimerRef.current);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const product = productId ? products.find((p) => p.id === productId) ?? null : null;
  const isAbout = location.pathname.endsWith('/about');
  const isRefund = location.pathname.endsWith('/refund');
  const isContact = location.pathname.endsWith('/contact');
  const isProducts = location.pathname.endsWith('/products');
  const isCategories = location.pathname.endsWith('/categories');
  const isCategory = categorySlug != null;
  const currentCategory = isCategory && categorySlug ? shop?.categories?.find((c) => c.slug === categorySlug) : null;
  const categoryProducts = isCategory && categorySlug ? products.filter((p) => (p.category ?? '') === categorySlug) : [];
  const categoryImage = currentCategory?.image ?? null;

  const isNavActive = (to: string) => {
    if (to.endsWith('/categories')) return isCategories || isCategory;
    if (to.endsWith('/products')) return isProducts;
    if (to.endsWith('/about')) return isAbout;
    if (to.endsWith('/refund')) return isRefund;
    if (to.endsWith('/contact')) return isContact;
    return location.pathname === to;
  };
  const shopContentLang = username && shop ? getCurrentShopLang(username, shop) : 'en';
  const announcements = shop ? getLocalizedAnnouncementLines(shop, shopContentLang) : [];
  const showAnnouncementBar = Boolean(shop?.announcementEnabled && announcements.length > 0);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setCompactAnnouncement(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  function addToCart(p: Product, qty: number = 1, selectedOptions?: Record<string, string> | null, customerMessage?: string | null) {
    if (p.inStock === false) return;
    if (!Number.isFinite(qty) || qty < 0.001) return;
    const opts = selectedOptions && Object.keys(selectedOptions).length > 0 ? selectedOptions : null;
    const msg = customerMessage?.trim() || null;
    const effectivePrice = getEffectivePrice(p, opts);
    setCart((prev) => {
      const optsKey = JSON.stringify(opts ?? {});
      const existing = prev.find((c) => c.productId === p.id && JSON.stringify(c.selectedOptions ?? {}) === optsKey);
      if (existing) return prev.map((c) => (c.productId === p.id && JSON.stringify(c.selectedOptions ?? {}) === optsKey ? { ...c, quantity: c.quantity + qty, customerMessage: msg ?? c.customerMessage } : c));
      return [...prev, { productId: p.id, productName: getLocalizedProductName(p, getCurrentShopLang(username!, shop)), price: effectivePrice, quantity: qty, selectedOptions: opts ?? null, customerMessage: msg ?? null }];
    });
    setAddToCartProduct(null);
    setAddToCartOptions({});
    setAddToCartMessage('');
    setDetailQty(1);
    setDetailOptionError('');
  }

  function addToCartFromDetail() {
    if (!product || addToCartAnim !== 'idle') return;
    const opts: Record<string, string> = {};
    product.options?.forEach((o) => {
      const v = addToCartOptions[o.name];
      if (v) opts[o.name] = v;
    });
    setDetailOptionError('');
    setDetailOptionDropdownOpen(null);

    if (addToCartTimerRef.current) clearTimeout(addToCartTimerRef.current);

    setAddToCartAnim('adding');
    addToCartTimerRef.current = setTimeout(() => {
      addToCart(product, detailQty, Object.keys(opts).length > 0 ? opts : null, addToCartMessage.trim() || null);
      setAddToCartAnim('success');
      addToCartTimerRef.current = setTimeout(() => {
        setShowCheckout(true);
        setAddToCartAnim('idle');
        addToCartTimerRef.current = null;
      }, ADD_TO_CART_SUCCESS_MS);
    }, ADD_TO_CART_ANIM_MS);
  }

  function updateQty(productId: string, delta: number, selectedOptions?: Record<string, string> | null) {
    const optsKey = JSON.stringify(selectedOptions ?? {});
    setCart((prev) => {
      const item = prev.find((c) => c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((c) => !(c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey));
      return prev.map((c) => (c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey ? { ...c, quantity: newQty } : c));
    });
  }

  function removeFromCart(productId: string, selectedOptions?: Record<string, string> | null) {
    const optsKey = JSON.stringify(selectedOptions ?? {});
    setCart((prev) => prev.filter((c) => !(c.productId === productId && JSON.stringify(c.selectedOptions ?? {}) === optsKey)));
  }

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const checkoutModalEl =
    showCheckout && username && shop ? (
      <CheckoutModal
        username={username}
        shop={shop}
        cart={cart}
        onClose={() => setShowCheckout(false)}
        onOrderSuccess={() => {
          setCart([]);
          setShowCheckout(false);
          setOrderDone(true);
        }}
        onUpdateQty={updateQty}
        onRemoveFromCart={removeFromCart}
      />
    ) : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-zinc-950">
        <DashboardLoading />
      </div>
    );
  }
  if (!shop) {
    return (
      <ShopLang username={username!} shop={shop}>
        <NotFoundView />
      </ShopLang>
    );
  }
  if (orderDone) {
    return (
      <ShopLang username={username!} shop={shop}>
        <OrderSuccessView onContinue={() => setOrderDone(false)} />
      </ShopLang>
    );
  }

  const isDetailView = Boolean(productId && product);

  function NotFoundView() {
    const { t } = useShopLanguage();
    return (
      <ShopDirRoot className={`${shopPageClass} items-center justify-center px-4`}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">{t('notFoundTitle')}</h1>
          <p className="text-stone-600 mb-6">{t('notFoundBody')}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 no-underline">
            {t('notFoundBack')}
          </Link>
        </div>
      </ShopDirRoot>
    );
  }

  function OrderSuccessView({ onContinue }: { onContinue: () => void }) {
    const { t } = useShopLanguage();
    return (
      <ShopDirRoot className={`${shopPageClass} items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center max-w-md border border-stone-200 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6 text-brand-600">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">{t('orderSuccessTitle')}</h2>
          <p className="text-stone-600 mb-8">{t('orderSuccessBody')}</p>
          <button type="button" onClick={onContinue} className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500">
            {t('continueShopping')}
          </button>
        </div>
      </ShopDirRoot>
    );
  }

  function Navbar() {
    const navLinks = useShopNavLinks(username!, shop!);
    return (
      <Header
        shop={shop!}
        username={username!}
        navLinks={navLinks}
        isNavActive={isNavActive}
        cartCount={cartCount}
        onOpenCheckout={() => setShowCheckout(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        announcements={announcements}
        showAnnouncementBar={showAnnouncementBar}
        compactAnnouncement={compactAnnouncement}
        containerClass={containerClass}
      />
    );
  }


  function ProductDetailView({ product: detailProduct }: { product: Product }) {
    const location = useLocation();
    const navState = location.state as ShopProductLinkState | null | undefined;
    const navFrom = navState?.from;
    const navCategorySlug = navState?.from === 'category' ? navState.categorySlug : null;
    const categoryFromNav = navCategorySlug
      ? shop?.categories?.find((c) => c.slug === navCategorySlug)
      : null;
    const { t, categoryName, productName, productDescription, lang } = useShopLanguage();
    const displayName = productName(detailProduct);
    const displayDescription = productDescription(detailProduct);
    const detailDisplayOptions = getShopDisplayProductOptions(detailProduct, lang);
    const hasOptions = detailDisplayOptions.length > 0;
    const hasMessage = Boolean(detailProduct.allowCustomerMessage);
    const detailImages = (detailProduct.images && detailProduct.images.length > 0 ? detailProduct.images : (detailProduct.image ? [detailProduct.image] : [])).filter(Boolean) as string[];
    const safeImageIndex = Math.min(activeDetailImageIndex, Math.max(0, detailImages.length - 1));
    const activeImage = detailImages[safeImageIndex] ?? null;

    let productBackTo = `/${username}`;
    let backLabel = t('backToStore');
    if (navFrom === 'category' && navCategorySlug) {
      productBackTo = `/${username}/category/${navCategorySlug}`;
      backLabel = categoryFromNav
        ? t('backToCategory', { name: categoryName(categoryFromNav) })
        : t('backToProducts');
    } else if (navFrom === 'products') {
      productBackTo = `/${username}/products`;
      backLabel = t('backToProducts');
    }

    useEffect(() => {
      if (!detailOptionDropdownOpen) return;
      const onPointerDown = (e: PointerEvent) => {
        const target = e.target as Element;
        if (!target.closest('[data-shop-product-option]')) {
          setDetailOptionDropdownOpen(null);
        }
      };
      document.addEventListener('pointerdown', onPointerDown);
      return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [detailOptionDropdownOpen]);

    function handleAddToCartFromDetail() {
      if (addToCartAnim !== 'idle') return;
      if (detailProduct.inStock === false) {
        setDetailOptionError(t('errorOutOfStock'));
        return;
      }
      const missingRequired = detailDisplayOptions.find(
        (o) => Boolean(o.required) && !addToCartOptions[o.canonicalName],
      );
      if (missingRequired) {
        setDetailOptionError(t('errorSelectOption', { name: missingRequired.name }));
        return;
      }
      addToCartFromDetail();
    }

    return (
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <main className={`${containerClass} pt-4 max-lg:pt-4 pb-8 max-lg:pb-8 lg:pt-6 lg:pb-12`}>
          <div className="mb-4 max-lg:mb-4 flex flex-col items-start gap-2.5 max-lg:gap-2.5 lg:mb-6 lg:gap-3">
            <Link
              to={productBackTo}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 no-underline shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-brand-600/50 dark:hover:bg-brand-950/40"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {backLabel}
            </Link>
            <nav
              className="flex flex-wrap items-center gap-x-1 gap-y-0.5 max-lg:gap-x-1 text-xs max-lg:text-xs text-stone-500 dark:text-zinc-400 lg:gap-x-1.5 lg:text-sm"
              aria-label="Breadcrumb"
            >
              <Link
                to={`/${username}`}
                className="font-medium no-underline transition-colors hover:text-brand-700 dark:hover:text-brand-400"
              >
                {t('breadcrumbHome')}
              </Link>
              {navFrom === 'category' && navCategorySlug ? (
                <>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
                  <Link
                    to={`/${username}/categories`}
                    className="font-medium no-underline transition-colors hover:text-brand-700 dark:hover:text-brand-400"
                  >
                    {t('breadcrumbCategories')}
                  </Link>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
                  <Link
                    to={`/${username}/category/${navCategorySlug}`}
                    className="font-medium break-words no-underline transition-colors hover:text-brand-700 dark:hover:text-brand-400"
                  >
                    {categoryFromNav ? categoryName(categoryFromNav) : navCategorySlug}
                  </Link>
                </>
              ) : null}
              {navFrom === 'products' ? (
                <>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
                  <Link
                    to={`/${username}/products`}
                    className="font-medium no-underline transition-colors hover:text-brand-700 dark:hover:text-brand-400"
                  >
                    {t('breadcrumbProducts')}
                  </Link>
                </>
              ) : null}
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
              <span className="font-semibold break-words text-stone-800 dark:text-zinc-200">{displayName}</span>
            </nav>
          </div>

          <div className="grid gap-4 max-lg:gap-4 lg:grid-cols-[480px_1fr] lg:gap-8 xl:grid-cols-[560px_1fr] lg:items-start">
            <div className="relative z-0 mx-auto w-full max-w-[480px] lg:mx-0 lg:max-w-none lg:w-full overflow-hidden rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 lg:rounded-3xl">
              {activeImage ? (
                <ProductImage src={activeImage} alt={displayName} />
              ) : (
                <div className={`${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} flex items-center justify-center text-stone-400 dark:text-zinc-500`}>
                  <ShoppingBag className="w-16 h-16" />
                </div>
              )}
              {detailImages.length > 1 && (
                <div className="border-t border-stone-200 bg-stone-50/70 p-3 max-lg:p-3 dark:border-zinc-700 dark:bg-zinc-800/90 lg:p-4">
                  <div className="flex items-center gap-2 max-lg:gap-2 overflow-x-auto pb-1 lg:gap-3">
                    {detailImages.map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => setActiveDetailImageIndex(idx)}
                        className={`relative h-16 w-16 max-lg:h-16 max-lg:w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-stone-100 transition-all dark:bg-zinc-800 lg:h-20 lg:w-20 lg:rounded-xl ${
                          idx === safeImageIndex
                            ? 'border-brand-500 ring-2 ring-brand-100 dark:ring-brand-900/50'
                            : 'border-stone-200 hover:border-brand-300 dark:border-zinc-600 dark:hover:border-brand-500/50'
                        }`}
                        aria-label={t('viewImage', { n: idx + 1 })}
                      >
                        <img src={getProductImageDisplayUrl(img)} alt="" className={PRODUCT_IMAGE_CLASS} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`min-w-0 rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:p-4 lg:sticky lg:top-24 lg:rounded-3xl lg:p-7 ${
                detailOptionDropdownOpen ? 'relative z-40 isolate' : 'relative z-0'
              }`}
            >
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 max-lg:mb-1.5 lg:mb-2">{t('productDetails')}</p>
              <h1 className="text-xl max-lg:leading-snug font-bold leading-tight text-stone-900 dark:text-zinc-100 lg:text-3xl">{displayName}</h1>
              <div className="mt-2">
                <ProductPrice
                  p={detailProduct}
                  currency={shop!.currency}
                  priceOverride={
                    detailDisplayOptions.length > 0
                      ? getEffectivePrice(
                          detailProduct,
                          Object.keys(addToCartOptions).length ? addToCartOptions : null,
                        )
                      : undefined
                  }
                />
              </div>
              {detailProduct.inStock === false && (
                <p className="mt-2 text-sm font-semibold text-red-600">{t('outOfStock')}</p>
              )}
              {displayDescription && (
                <p className="mt-3 max-lg:mt-3 text-sm max-lg:text-sm leading-relaxed text-stone-600 dark:text-zinc-400 lg:mt-4 lg:text-base">{displayDescription}</p>
              )}

              {(hasOptions || hasMessage) && (
                <div className="mt-5 max-lg:mt-5 space-y-4 max-lg:space-y-4 border-t border-stone-200 pt-5 max-lg:pt-5 dark:border-zinc-700 lg:mt-6 lg:space-y-5 lg:pt-6">
                  {detailDisplayOptions.map((opt) => {
                    const selectedCanonical = addToCartOptions[opt.canonicalName];
                    const selectedIdx =
                      selectedCanonical != null ? opt.canonicalChoices.indexOf(selectedCanonical) : -1;
                    const selectedLabel =
                      selectedIdx >= 0 ? opt.choices[selectedIdx] : selectedCanonical;
                    return (
                    <div key={opt.canonicalName}>
                      <label className="mb-1.5 block text-sm font-medium text-stone-800 dark:text-zinc-200 max-lg:mb-1.5 lg:mb-2">
                        {opt.name}
                        {opt.required ? <span className="ms-1 text-red-500">*</span> : <span className="ms-1 text-sm text-stone-400 dark:text-zinc-500">{t('optional')}</span>}
                      </label>
                      <div
                        data-shop-product-option
                        className={`relative ${detailOptionDropdownOpen === opt.canonicalName ? 'z-40' : 'z-0'}`}
                      >
                        <button
                          type="button"
                          aria-expanded={detailOptionDropdownOpen === opt.canonicalName}
                          aria-haspopup="listbox"
                          onClick={() =>
                            setDetailOptionDropdownOpen(
                              detailOptionDropdownOpen === opt.canonicalName ? null : opt.canonicalName,
                            )
                          }
                          className="inline-flex w-full items-center justify-between gap-3 rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:border-brand-200 hover:bg-brand-50/40 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 max-lg:py-2.5 lg:px-4 lg:py-3"
                        >
                          <span className="truncate text-start">
                            {selectedLabel
                              ? selectedLabel
                              : t('selectOption', { name: opt.name })}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${detailOptionDropdownOpen === opt.canonicalName ? 'rotate-180' : ''}`} />
                        </button>
                        {detailOptionDropdownOpen === opt.canonicalName && (
                          <ul
                            role="listbox"
                            className="absolute start-0 top-full z-50 mt-1 max-h-[min(18rem,55vh)] w-full touch-pan-y overflow-y-auto overscroll-y-contain rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40"
                          >
                            <li role="option" aria-selected={!selectedCanonical}>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddToCartOptions((prev) => ({ ...prev, [opt.canonicalName]: '' }));
                                  setDetailOptionError('');
                                  setDetailOptionDropdownOpen(null);
                                }}
                                className="w-full text-start px-4 py-2.5 text-sm font-medium text-stone-500 hover:bg-stone-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                              >
                                {opt.required ? t('selectOptionRequired', { name: opt.name }) : t('selectOption', { name: opt.name })}
                              </button>
                            </li>
                            {opt.choices.map((choice, ci) => (
                              <li key={`${opt.canonicalName}-${ci}`} role="option" aria-selected={selectedCanonical === opt.canonicalChoices[ci]}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddToCartOptions((prev) => ({
                                      ...prev,
                                      [opt.canonicalName]: opt.canonicalChoices[ci] ?? choice,
                                    }));
                                    setDetailOptionError('');
                                    setDetailOptionDropdownOpen(null);
                                  }}
                                  className={`w-full text-start px-4 py-2.5 text-sm font-medium transition-colors ${
                                    selectedCanonical === opt.canonicalChoices[ci]
                                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                                      : 'text-stone-700 hover:bg-stone-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  {choice}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    );
                  })}
                  {detailProduct.allowCustomerMessage && (
                    <div>
                      <label className="block text-stone-800 font-medium mb-2">
                        <MessageCircle className="w-4 h-4 inline me-1.5 -mt-0.5" />
                        {getLocalizedCustomerMessageLabel(detailProduct, lang, t('messageOptional'))}
                      </label>
                      <textarea
                        value={addToCartMessage}
                        onChange={(e) => setAddToCartMessage(e.target.value)}
                        placeholder={t('messagePlaceholder')}
                        rows={3}
                        className="w-full resize-y rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 max-lg:py-2.5 lg:px-4 lg:py-3"
                      />
                    </div>
                  )}
                  {detailOptionError && (
                    <p className="text-sm font-medium text-red-600">{detailOptionError}</p>
                  )}
                </div>
              )}

              <div className="mt-5 max-lg:mt-5 space-y-3 max-lg:space-y-3 border-t border-stone-200 pt-5 max-lg:pt-5 dark:border-zinc-700 lg:mt-6 lg:space-y-4 lg:pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-500 dark:text-zinc-400">{t('subtotal')}</span>
                  <span className="font-bold text-stone-900 dark:text-zinc-100">{formatPrice(getEffectivePrice(detailProduct, Object.keys(addToCartOptions).length ? addToCartOptions : null) * detailQty, shop!.currency)}</span>
                </div>
                <div className="flex flex-col gap-3 max-lg:flex-col max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                  <div className="flex w-full max-lg:w-full items-center justify-center overflow-hidden rounded-xl border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-900 lg:w-auto">
                    <button type="button" onClick={() => setDetailQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-stone-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800 max-lg:py-2.5 lg:py-3">-</button>
                    <span className="min-w-[2.5rem] text-center font-semibold text-stone-900 dark:text-zinc-100">{detailQty}</span>
                    <button type="button" onClick={() => setDetailQty((q) => q + 1)} className="px-4 py-2.5 text-stone-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800 max-lg:py-2.5 lg:py-3">+</button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCartFromDetail}
                    disabled={detailProduct.inStock === false || addToCartAnim !== 'idle'}
                    className={`shop-add-to-cart-btn w-full max-lg:w-full flex-1 min-w-0 rounded-xl px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-600 shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-50 max-lg:py-2.5 lg:min-w-[180px] lg:px-6 lg:py-3 ${
                      addToCartAnim === 'adding' ? 'shop-add-to-cart-btn--adding' : ''
                    }${addToCartAnim === 'success' ? ' shop-add-to-cart-btn--success' : ''}`}
                  >
                    <span className="relative z-[1] inline-flex items-center justify-center gap-2">
                      {detailProduct.inStock === false ? (
                        t('outOfStock')
                      ) : addToCartAnim === 'adding' ? (
                        <>
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                          {t('adding')}
                        </>
                      ) : addToCartAnim === 'success' ? (
                        <>
                          <Check className="h-4 w-4 shrink-0" aria-hidden />
                          {t('added')}
                        </>
                      ) : (
                        t('addToCart')
                      )}
                    </span>
                  </button>
                </div>
                {shop?.refundEnabled ? (
                  <Link
                    to={`/${username}/refund`}
                    className="inline-block text-start text-xs font-semibold text-brand-700 underline decoration-brand-700/35 underline-offset-2 hover:text-brand-800 dark:text-brand-400 dark:decoration-brand-400/40 dark:hover:text-brand-300 lg:text-sm"
                  >
                    {t('returnExchangePolicy')}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </main>
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
    );
  }

  function RefundView() {
    const { t, lang } = useShopLanguage();
    const refundContentHtml = getLocalizedRefundContent(shop!, lang);
    return (
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <main className="flex-1 pb-8 max-lg:pb-8 lg:pb-14">
          <section className={`${containerClass} pt-4 max-lg:pt-4 lg:pt-8`}>
            <header className="overflow-hidden rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-brand-50/40 to-brand-50/40 p-5 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-brand-950/30 dark:to-brand-950/20 max-lg:p-5 sm:p-10 lg:rounded-3xl lg:p-12">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-700/50 dark:bg-brand-950/50 dark:text-brand-300 max-lg:mb-3 lg:mb-4">
                {t('returnExchangeBadge')}
              </p>
              <h1 className="text-2xl max-lg:leading-snug font-bold leading-tight tracking-tight text-stone-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
                {t('returnExchangePolicy')}
              </h1>
              <p className="mt-2 max-lg:mt-2 max-w-2xl text-sm text-stone-600 dark:text-zinc-400 lg:mt-3 lg:text-base">
                {t('returnExchangeSubtitle', { shopName: shop!.shopName })}
              </p>
            </header>
          </section>

          <section className={`${containerClass} pt-5 max-lg:pt-5 lg:pt-10`}>
            <article className="w-full rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-white p-4 shadow-sm max-lg:p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-8 lg:rounded-3xl lg:p-10">
              {refundContentHtml ? (
                <div
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  className={`text-sm max-lg:text-sm text-stone-700 dark:text-zinc-300 lg:text-lg ${SHOP_RICH_TEXT_BODY_CLASS}`}
                  dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(refundContentHtml) }}
                />
              ) : (
                <p className="text-sm text-stone-500 dark:text-zinc-400 lg:text-base">{t('returnExchangeEmpty')}</p>
              )}
            </article>
          </section>
        </main>
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
    );
  }

  function AboutView() {
    const { t, lang } = useShopLanguage();
    const aboutTitleText =
      getLocalizedAboutTitle(shop!, lang) || t('aboutTitleFallback', { shopName: shop!.shopName });
    const aboutContentHtml = getLocalizedAboutContent(shop!, lang);
    const heroImage = shop!.aboutImages?.[0];
    const aboutHeroTextColor = getSafeHexColor(shop!.aboutTextColor);
    return (
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <main className="flex-1 pb-8 max-lg:pb-8 lg:pb-14">
          <section className={`${containerClass} pt-4 max-lg:pt-4 lg:pt-8`}>
            <header className="relative overflow-hidden rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-brand-50/40 to-brand-50/40 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-brand-950/30 dark:to-brand-950/20 lg:rounded-3xl">
              {heroImage ? (
                <div className="relative w-full aspect-[16/10] lg:aspect-[12/5]">
                  <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-stone-900/45 to-transparent" />
                  <div className="absolute inset-0 flex max-w-2xl flex-col justify-end p-4 max-lg:p-4 sm:p-8 lg:p-12">
                    <p
                      className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm max-lg:mb-2 lg:mb-4 lg:px-3 lg:py-1 lg:text-xs"
                      style={{ color: aboutHeroTextColor }}
                    >
                      {t('aboutBadge')}
                    </p>
                    <h1
                      className="text-xl max-lg:leading-snug font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
                      style={{ color: aboutHeroTextColor }}
                    >
                      {aboutTitleText}
                    </h1>
                    <p
                      className="mt-2 max-lg:mt-2 max-w-xl text-xs max-lg:text-xs lg:mt-3 lg:text-base"
                      style={{ color: aboutHeroTextColor, opacity: 0.9 }}
                    >
                      {t('aboutSubtitleImage', { shopName: shop!.shopName })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 max-lg:p-5 sm:p-10 lg:p-12">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-700/50 dark:bg-brand-950/50 dark:text-brand-300 max-lg:mb-3 lg:mb-4">
                    {t('aboutLabel')}
                  </p>
                  <h1 className="text-2xl max-lg:leading-snug font-bold leading-tight tracking-tight text-stone-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
                    {aboutTitleText}
                  </h1>
                  <p className="mt-2 max-lg:mt-2 max-w-2xl text-sm text-stone-600 dark:text-zinc-400 lg:mt-3 lg:text-base">
                    {t('aboutSubtitlePlain', { shopName: shop!.shopName })}
                  </p>
                </div>
              )}
            </header>
          </section>

          <section className={`${containerClass} pt-5 max-lg:pt-5 lg:pt-10`}>
            <article className="w-full rounded-2xl max-lg:rounded-2xl border border-stone-200 bg-white p-4 shadow-sm max-lg:p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-8 lg:rounded-3xl lg:p-10">
              {aboutContentHtml ? (
                <div
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  className={`text-sm max-lg:text-sm text-stone-700 dark:text-zinc-300 lg:text-lg ${SHOP_RICH_TEXT_BODY_CLASS}`}
                  dangerouslySetInnerHTML={{ __html: prepareShopAboutHtml(aboutContentHtml) }}
                />
              ) : (
                <p className="text-sm text-stone-500 dark:text-zinc-400 lg:text-base">{t('aboutEmpty')}</p>
              )}
            </article>
          </section>
        </main>
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
    );
  }

  function ContactSentView() {
    const { t } = useShopLanguage();
    return (
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <main className={`${containerClass} flex-1 pt-6 pb-8 max-lg:pt-6 max-lg:pb-8 max-w-xl mx-auto text-center lg:pt-10 lg:pb-12`}>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:p-6 sm:p-10 lg:rounded-3xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 max-lg:mb-3 lg:mb-4 lg:h-16 lg:w-16">
              <Send className="h-6 w-6 lg:h-7 lg:w-7" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-stone-900 dark:text-zinc-100 max-lg:leading-snug lg:text-2xl">{t('contactSuccessTitle')}</h2>
            <p className="mb-5 text-sm text-stone-600 dark:text-zinc-400 max-lg:mb-5 lg:mb-6 lg:text-base">{t('contactSuccessBody', { shopName: shop!.shopName })}</p>
            <Link to={`/${username}`} className="inline-flex w-full max-lg:w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 no-underline lg:inline-block lg:w-auto lg:text-base">{t('backToStore')}</Link>
          </div>
        </main>
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
    );
  }

  function ContactView() {
    const { t, lang } = useShopLanguage();
    const localizedAddress = getLocalizedFooterAddress(shop!, lang);
    const contactLinks = (shop!.footerSocialLinks ?? []).filter((link) => link?.url?.trim());
    const hasDirectContactDetails = Boolean(
      (shop!.footerPhone && shop!.footerPhone.trim()) ||
      (shop!.footerEmail && shop!.footerEmail.trim()) ||
      localizedAddress.trim()
    );
    const hasContactSidebar = hasDirectContactDetails || contactLinks.length > 0;

    async function handleSubmitContact(e: React.FormEvent) {
      e.preventDefault();
      setContactError('');
      setContactSubmitting(true);
      try {
        const res = await fetch(`${API_BASE}/api/shop/${encodeURIComponent(username!)}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: contactName.trim(), email: contactEmail.trim(), message: contactMessage.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t('errorContactFailed'));
        setContactSent(true);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } catch (err) {
        setContactError((err as Error).message);
      } finally {
        setContactSubmitting(false);
      }
    }

    return (
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <main className={`${containerClass} flex-1 pt-4 pb-8 max-lg:pt-4 max-lg:pb-8 lg:pt-8 lg:pb-12`}>
          <section className="relative mb-5 max-lg:mb-5 overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-brand-50/45 to-brand-50/45 p-4 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-brand-950/30 dark:to-brand-950/20 max-lg:p-4 lg:mb-8 lg:rounded-3xl lg:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-200/25 blur-3xl dark:bg-brand-500/10" aria-hidden />
            <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-brand-200/25 blur-3xl dark:bg-brand-500/10" aria-hidden />
            <div className="relative max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/80 px-2.5 py-0.5 text-[10px] font-semibold text-brand-700 dark:border-brand-700/50 dark:bg-brand-950/50 dark:text-brand-300 lg:px-3 lg:py-1 lg:text-xs">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {t('contactBadge')}
              </p>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-stone-900 max-lg:leading-snug dark:text-zinc-100 lg:mt-4 lg:text-3xl xl:text-4xl">
                {t('contactTitle', { shopName: shop!.shopName })}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-zinc-400 lg:mt-2 lg:text-base">
                {t('contactIntro')}
              </p>
            </div>
          </section>

          <section
            className={
              hasContactSidebar
                ? 'grid items-start gap-4 max-lg:gap-4 lg:gap-8 xl:grid-cols-[0.95fr_1.05fr]'
                : ''
            }
          >
            {hasContactSidebar && (
              <div className="space-y-3 max-lg:space-y-3 lg:space-y-4">
                {hasDirectContactDetails && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:p-4 lg:rounded-3xl lg:p-6">
                    <h3 className="mb-3 text-base font-bold text-stone-900 dark:text-zinc-100 max-lg:mb-3 lg:mb-4 lg:text-lg">
                      {t('storeContactDetails')}
                    </h3>
                    <div className="max-lg:divide-y max-lg:divide-stone-200/90 dark:max-lg:divide-zinc-700/80 lg:space-y-3">
                      {shop!.footerPhone?.trim() && (
                        <a
                          href={`tel:${shop!.footerPhone.trim()}`}
                          className="flex items-center gap-2.5 py-2.5 text-stone-800 no-underline transition-colors hover:text-brand-700 dark:text-zinc-200 dark:hover:text-brand-400 max-lg:gap-2.5 max-lg:py-2.5 max-lg:first:pt-0 max-lg:last:pb-0 lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-stone-200 lg:bg-stone-50/70 lg:p-3.5 lg:hover:border-brand-300 dark:lg:border-zinc-700 dark:lg:bg-zinc-800/80 dark:lg:hover:border-brand-500/50"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-100/80 dark:bg-brand-950/40 dark:text-brand-400 dark:ring-brand-800/40 lg:h-9 lg:w-9 lg:rounded-lg lg:bg-brand-100 lg:ring-0 dark:lg:bg-brand-950/50">
                            <Phone className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500 lg:text-xs lg:font-semibold lg:tracking-wider lg:text-stone-500">
                              {t('phoneNumber')}
                            </span>
                            <span className="mt-0.5 block text-sm font-medium leading-snug text-stone-800 dark:text-zinc-100 lg:mt-0 lg:text-base lg:font-semibold">
                              <ContactLtrText>{shop!.footerPhone.trim()}</ContactLtrText>
                            </span>
                          </span>
                        </a>
                      )}
                      {shop!.footerEmail?.trim() && (
                        <a
                          href={`mailto:${shop!.footerEmail.trim()}`}
                          className="flex items-center gap-2.5 py-2.5 text-stone-800 no-underline transition-colors hover:text-brand-700 dark:text-zinc-200 dark:hover:text-brand-400 max-lg:gap-2.5 max-lg:py-2.5 lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-stone-200 lg:bg-stone-50/70 lg:p-3.5 lg:hover:border-brand-300 dark:lg:border-zinc-700 dark:lg:bg-zinc-800/80 dark:lg:hover:border-brand-500/50"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-100/80 dark:bg-brand-950/40 dark:text-brand-400 dark:ring-brand-800/40 lg:h-9 lg:w-9 lg:rounded-lg lg:bg-brand-100 lg:ring-0 dark:lg:bg-brand-950/50">
                            <Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500 lg:text-xs lg:font-semibold lg:tracking-wider lg:text-stone-500">
                              {t('email')}
                            </span>
                            <span className="mt-0.5 block break-all text-sm font-medium leading-snug text-stone-800 dark:text-zinc-100 lg:mt-0 lg:text-base lg:font-semibold">
                              <ContactLtrText>{shop!.footerEmail.trim()}</ContactLtrText>
                            </span>
                          </span>
                        </a>
                      )}
                      {localizedAddress.trim() && (
                        <div className="flex items-start gap-2.5 py-2.5 text-stone-800 dark:text-zinc-200 max-lg:gap-2.5 max-lg:py-2.5 lg:gap-3 lg:rounded-xl lg:border lg:border-stone-200 lg:bg-stone-50/70 lg:p-3.5 dark:lg:border-zinc-700 dark:lg:bg-zinc-800/80">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-100/80 dark:bg-brand-950/40 dark:text-brand-400 dark:ring-brand-800/40 lg:h-9 lg:w-9 lg:rounded-lg lg:bg-brand-100 lg:ring-0 dark:lg:bg-brand-950/50">
                            <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500 lg:text-xs lg:font-semibold lg:tracking-wider lg:text-stone-500">
                              {t('address')}
                            </span>
                            <span
                              dir={lang === 'ar' ? 'rtl' : 'ltr'}
                              className="mt-0.5 block text-sm font-medium leading-relaxed text-stone-800 whitespace-pre-wrap dark:text-zinc-100 lg:mt-0 lg:text-base lg:font-semibold lg:leading-normal"
                            >
                              {localizedAddress}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {contactLinks.length > 0 && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:p-4 lg:rounded-3xl lg:p-6">
                    <h3 className="mb-3 text-base font-bold text-stone-900 dark:text-zinc-100 max-lg:mb-3 lg:mb-4 lg:text-lg">
                      {t('socialLinks')}
                    </h3>
                    <div className="flex flex-wrap gap-2 max-lg:gap-2 lg:gap-2.5">
                      {contactLinks.map((link, index) => (
                        <a
                          key={`${link.platform}-${index}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 no-underline hover:border-brand-300 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-brand-500/50 dark:hover:bg-brand-950/40 max-lg:py-2 lg:px-3.5 lg:py-2.5"
                        >
                          <span style={{ color: getSocialBrandColor(link.platform) }}><SocialIcon platform={link.platform} /></span>
                          <span className="capitalize">{link.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSubmitContact}
              className={`space-y-3.5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:space-y-3.5 max-lg:p-4 lg:space-y-4 lg:rounded-3xl lg:p-8 ${hasContactSidebar ? '' : 'mx-auto w-full max-w-3xl'}`}
            >
              <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 lg:text-lg">{t('sendMessageTitle')}</h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 lg:text-sm">{t('sendMessageIntro')}</p>
              {contactError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{contactError}</p>}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('yourName')} <span className="text-red-500">*</span></label>
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} required placeholder={t('contactNamePh')} className="w-full rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-brand-500 max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('email')} <span className="text-red-500">*</span></label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required placeholder={t('contactEmailPh')} className="w-full rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-brand-500 max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('message')} <span className="text-red-500">*</span></label>
                <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required rows={5} placeholder={t('contactMessagePh')} className="w-full min-h-[7.5rem] resize-y rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-brand-500 max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
              </div>
              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-600 py-3 text-sm font-semibold text-white hover:from-brand-500 hover:to-brand-500 disabled:opacity-60 max-lg:py-3 lg:py-3.5 lg:text-base"
              >
                {contactSubmitting ? t('sending') : t('sendMessage')}
              </button>
            </form>
          </section>
        </main>
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
    );
  }

  if (isDetailView && product) {
    return (
      <ShopLang username={username!} shop={shop}>
        <ProductDetailView product={product} />
      </ShopLang>
    );
  }
  if (isProducts) {
    return (
      <ShopLang username={username!} shop={shop}>
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <ShopProductsPage shop={shop} products={products} username={username!} containerClass={containerClass} />
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
      </ShopLang>
    );
  }
  if (isAbout) {
    return (
      <ShopLang username={username!} shop={shop}>
        <AboutView />
      </ShopLang>
    );
  }
  if (isRefund) {
    if (!shop?.refundEnabled) {
      return <Navigate to={`/${username}`} replace />;
    }
    return (
      <ShopLang username={username!} shop={shop}>
        <RefundView />
      </ShopLang>
    );
  }
  if (isContact) {
    if (contactSent) {
      return (
        <ShopLang username={username!} shop={shop}>
          <ContactSentView />
        </ShopLang>
      );
    }
    return (
      <ShopLang username={username!} shop={shop}>
        <ContactView />
      </ShopLang>
    );
  }
  if (isCategories) {
    return (
      <ShopLang username={username!} shop={shop}>
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <ShopCategoriesPage shop={shop} products={products} username={username!} containerClass={containerClass} />
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
      </ShopLang>
    );
  }
  if (isCategory) {
    return (
      <ShopLang username={username!} shop={shop}>
      <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
        <Navbar />
        <ShopCategoryPage
          shop={shop}
          category={currentCategory ?? null}
          categoryImage={categoryImage}
          categoryProducts={categoryProducts}
          username={username!}
          containerClass={containerClass}
        />
        <ShopFooterEl />
        {checkoutModalEl}
      </ShopDirRoot>
      </ShopLang>
    );
  }

  function ShopFooterEl() {
    const quickLinks = useShopNavLinks(username!, shop!);
    return <Footer shop={shop!} quickLinks={quickLinks} containerClass={containerClass} />;
  }
  return (
    <ShopLang username={username!} shop={shop}>
    <ShopDirRoot className={shopPageClass} themeConfig={shop?.themeConfig}>
      <Navbar />
      <ThemedHome shop={shop} products={products} username={username!} containerClass={containerClass} />
      <ShopFooterEl />
      {checkoutModalEl}
    </ShopDirRoot>
    </ShopLang>
  );
}
