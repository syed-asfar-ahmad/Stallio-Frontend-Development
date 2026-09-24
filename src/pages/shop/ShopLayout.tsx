import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { useShopNavLinks } from '../../hooks/useShopNavLinks';
import { getLocalizedAnnouncementLines } from '../../lib/shopContentLanguages';
import ShopDirRoot from '../../components/shop/ShopDirRoot';
import Header from '../../components/shop/theme-parts/Header';
import Footer from '../../components/shop/theme-parts/Footer';
import CheckoutModal from '../../components/shop/CheckoutModal';

const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

function OrderSuccessView({ onContinue }: { onContinue: () => void }) {
  const { t } = useShopLanguage();
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 text-center max-w-md border border-stone-200 shadow-lg">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6 text-brand-600">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">{t('orderSuccessTitle')}</h2>
      <p className="text-stone-600 mb-8">{t('orderSuccessBody')}</p>
      <button
        type="button"
        onClick={onContinue}
        className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500"
      >
        {t('continueShopping')}
      </button>
    </div>
  );
}

function ShopNavbar() {
  const { shop, username } = useShop();
  const { cartCount, openCheckout } = useCart();
  const { lang } = useShopLanguage();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compactAnnouncement, setCompactAnnouncement] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  );

  const navLinks = useShopNavLinks(username, shop);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setCompactAnnouncement(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!shop) return null;

  const isAbout = location.pathname.endsWith('/about');
  const isRefund = location.pathname.endsWith('/refund');
  const isContact = location.pathname.endsWith('/contact');
  const isProducts = location.pathname.endsWith('/products');
  const isCategories = location.pathname.endsWith('/categories');
  const isCategory = location.pathname.includes('/category/');

  const isNavActive = (to: string) => {
    if (to.endsWith('/categories')) return isCategories || isCategory;
    if (to.endsWith('/products')) return isProducts;
    if (to.endsWith('/about')) return isAbout;
    if (to.endsWith('/refund')) return isRefund;
    if (to.endsWith('/contact')) return isContact;
    return location.pathname === to;
  };

  const announcements = getLocalizedAnnouncementLines(shop, lang);
  const showAnnouncementBar = Boolean(shop.announcementEnabled && announcements.length > 0);

  return (
    <Header
      shop={shop}
      username={username}
      navLinks={navLinks}
      isNavActive={isNavActive}
      cartCount={cartCount}
      onOpenCheckout={openCheckout}
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

function ShopFooter() {
  const { shop, username } = useShop();
  const quickLinks = useShopNavLinks(username, shop);

  if (!shop) return null;

  return <Footer shop={shop} quickLinks={quickLinks} containerClass={containerClass} />;
}

function CheckoutModalMount() {
  const { shop, username } = useShop();
  const {
    cart,
    showCheckout,
    closeCheckout,
    clearCart,
    setOrderDone,
    updateQty,
    removeFromCart,
  } = useCart();

  if (!showCheckout || !username || !shop) return null;

  return (
    <CheckoutModal
      username={username}
      shop={shop}
      cart={cart}
      onClose={closeCheckout}
      onOrderSuccess={() => {
        clearCart();
        closeCheckout();
        setOrderDone(true);
      }}
      onUpdateQty={updateQty}
      onRemoveFromCart={removeFromCart}
    />
  );
}

export default function ShopLayout({ children }: { children: ReactNode }) {
  const { shop } = useShop();
  const { orderDone, clearOrderDone } = useCart();

  if (orderDone) {
    return (
      <ShopDirRoot
        className="shop-storefront min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200"
        themeConfig={shop?.themeConfig}
      >
        <OrderSuccessView onContinue={clearOrderDone} />
      </ShopDirRoot>
    );
  }

  return (
    <ShopDirRoot
      className="shop-storefront min-h-screen flex flex-col transition-colors duration-200"
      themeConfig={shop?.themeConfig}
    >
      <ShopNavbar />
      {children}
      <ShopFooter />
      <CheckoutModalMount />
    </ShopDirRoot>
  );
}
