import { useEffect, useMemo, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import DashboardTopBar from './DashboardTopBar';
import DashboardLoading from './DashboardLoading';
import { DashboardNotificationsProvider } from '../context/DashboardNotificationsContext';
import { api } from '../lib/api';
import { DASHBOARD_MAIN_SCROLL_ID, scrollDashboardMainToTop } from '../lib/scrollDashboardMainToTop';
import {
  handleSidebarNavMouseDown,
  restoreSidebarScrollRepeated,
} from '../lib/dashboardSidebarScroll';
import { attachBlockNumberInputWheel } from '../lib/blockNumberInputWheel';
import { DASHBOARD_ICON_CLOSE_BTN } from '../lib/dashboardFormClasses';
import type { Order } from '../types';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  X,
  FileText,
  LayoutGrid,
  Mail,
  Footprints,
  Home,
  Inbox,
  Bell,
  LayoutPanelLeft,
  PanelLeftOpen,
  MoreHorizontal,
  Headphones,
  BadgePercent,
  Palette,
} from 'lucide-react';

type NavLeaf = { to: string; label: string; icon: LucideIcon };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [unreadOrdersCount, setUnreadOrdersCount] = useState(0);
  const [pendingMessagesCount, setPendingMessagesCount] = useState(0);
  const [supportUnreadCount, setSupportUnreadCount] = useState(0);
  const desktopNavRef = useRef<HTMLElement>(null);
  const OVERVIEW_ITEM = useMemo<NavLeaf>(
    () => ({ to: '/dashboard', label: t('dashboard.layout.overview'), icon: LayoutDashboard }),
    [t, i18n.language]
  );
  const STOREFRONT_LINKS = useMemo<NavLeaf[]>(
    () => [
      { to: '/dashboard/home', label: t('dashboard.layout.home'), icon: Home },
      { to: '/dashboard/products', label: t('dashboard.layout.products'), icon: Package },
      { to: '/dashboard/about', label: t('dashboard.layout.about'), icon: FileText },
      { to: '/dashboard/categories', label: t('dashboard.layout.categories'), icon: LayoutGrid },
      { to: '/dashboard/contact', label: t('dashboard.layout.contact'), icon: Mail },
      { to: '/dashboard/footer', label: t('dashboard.layout.footer'), icon: Footprints },
      { to: '/dashboard/themes', label: t('dashboard.layout.storefrontTheme'), icon: Palette },
      { to: '/dashboard/coupons', label: t('dashboard.layout.coupons'), icon: BadgePercent },
      { to: '/dashboard/delivery', label: t('dashboard.layout.others'), icon: MoreHorizontal },
    ],
    [t, i18n.language]
  );
  const INBOX_LINKS = useMemo<NavLeaf[]>(
    () => [
      { to: '/dashboard/messages', label: t('dashboard.layout.messages'), icon: Inbox },
      { to: '/dashboard/orders', label: t('dashboard.layout.orders'), icon: ShoppingBag },
      { to: '/dashboard/notifications', label: t('dashboard.notifications.nav'), icon: Bell },
    ],
    [t, i18n.language]
  );

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
    if (!loading && user?.role === 'admin') navigate('/admin', { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    document.title = t('dashboard.metaTitle');
  }, [location.pathname, t, i18n.language]);

  useEffect(() => {
    document.documentElement.classList.add('dashboard-shell-active');
    const detachWheel = attachBlockNumberInputWheel();
    return () => {
      detachWheel();
      document.documentElement.classList.remove('dashboard-shell-active');
    };
  }, []);

  useLayoutEffect(() => {
    scrollDashboardMainToTop({ behavior: 'auto' });
    restoreSidebarScrollRepeated(desktopNavRef.current, 'seller');
  }, [location.pathname]);

  const onSidebarNavMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    handleSidebarNavMouseDown(e, e.currentTarget.closest('nav'), 'seller');
  }, []);

  useEffect(() => {
    if (!user) return;

    if (location.pathname === '/dashboard/orders') {
      setUnreadOrdersCount(0);
      return;
    }

    let alive = true;
    const fetchUnreadCount = async () => {
      try {
        const data = await api<Order[]>('/api/orders');
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setUnreadOrdersCount(list.filter((o) => !o.isRead).length);
      } catch {
        if (!alive) return;
        setUnreadOrdersCount(0);
      }
    };

    fetchUnreadCount();
    const id = window.setInterval(fetchUnreadCount, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user) return;

    if (location.pathname === '/dashboard/messages') {
      setPendingMessagesCount(0);
      return;
    }

    let alive = true;
    const fetchPendingMessages = async () => {
      try {
        const data = await api<Array<{ responded?: boolean }>>('/api/contact-submissions');
        if (!alive) return;
        const list = Array.isArray(data) ? data : [];
        setPendingMessagesCount(list.filter((s) => !s.responded).length);
      } catch {
        if (!alive) return;
        setPendingMessagesCount(0);
      }
    };

    fetchPendingMessages();
    const id = window.setInterval(fetchPendingMessages, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user) return;

    if (location.pathname === '/dashboard/support') {
      setSupportUnreadCount(0);
      return;
    }

    let alive = true;
    const fetchSupportUnread = async () => {
      try {
        const data = await api<{ unreadCount: number }>('/api/support-chat?markRead=false');
        if (!alive) return;
        setSupportUnreadCount(data.unreadCount ?? 0);
      } catch {
        if (!alive) return;
        setSupportUnreadCount(0);
      }
    };

    fetchSupportUnread();
    const id = window.setInterval(fetchSupportUnread, 10000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [user, location.pathname]);

  const shopPublicUrl = useMemo(() => {
    const base = import.meta.env.VITE_BASE_URL || window.location.origin;
    const slug = user?.username?.trim();
    return slug ? `${base}/${slug}` : '';
  }, [user?.username]);

  const openMobileMenu = useCallback(() => setMobileOpen(true), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-zinc-950 px-4">
        <DashboardLoading />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-zinc-950 px-4">
        <DashboardLoading />
      </div>
    );
  }

  const linkClass = (to: string, isCollapsed?: boolean, nested?: boolean) => {
    const active = location.pathname === to;
    const nestedPad = nested ? 'text-[13px] py-2 pl-1' : 'py-2.5';
    const base = `relative flex items-center gap-3 px-4 ${nestedPad} rounded-xl text-sm font-medium no-underline transition-colors select-none`;
    if (isCollapsed) {
      return `${base} ${
        active
          ? 'text-brand-600 dark:text-brand-400'
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800'
      } justify-center px-2`;
    }
    return `${base} ${
      active
        ? 'bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400'
        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800'
    }`;
  };

  function renderNavLink(item: NavLeaf, opts: { collapsed: boolean; nested?: boolean; onNavigate?: () => void }) {
    const { collapsed, nested, onNavigate } = opts;
    const active = location.pathname === item.to;
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        onMouseDown={onSidebarNavMouseDown}
        onClick={() => onNavigate?.()}
        className={linkClass(item.to, collapsed, nested)}
        title={collapsed ? item.label : undefined}
      >
        <Icon
          className={`shrink-0 ${nested ? 'w-[17px] h-[17px]' : 'w-[18px] h-[18px]'} ${active ? 'text-brand-600 dark:text-brand-400' : 'text-stone-500 dark:text-zinc-400'}`}
          strokeWidth={2}
        />
        {!collapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {item.to === '/dashboard/orders' && unreadOrdersCount > 0 && (
              <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                {unreadOrdersCount > 99 ? '99+' : unreadOrdersCount}
              </span>
            )}
            {item.to === '/dashboard/messages' && pendingMessagesCount > 0 && (
              <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                {pendingMessagesCount > 99 ? '99+' : pendingMessagesCount}
              </span>
            )}
          </>
        )}
        {collapsed && item.to === '/dashboard/orders' && unreadOrdersCount > 0 && (
          <span className="absolute top-1.5 right-1.5 inline-flex min-w-4 h-4 items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadOrdersCount > 9 ? '9+' : unreadOrdersCount}
          </span>
        )}
        {collapsed && item.to === '/dashboard/messages' && pendingMessagesCount > 0 && (
          <span className="absolute top-1.5 right-1.5 inline-flex min-w-4 h-4 items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {pendingMessagesCount > 9 ? '9+' : pendingMessagesCount}
          </span>
        )}
        {collapsed && item.to === '/dashboard/support' && supportUnreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 inline-flex min-w-4 h-4 items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {supportUnreadCount > 9 ? '9+' : supportUnreadCount}
          </span>
        )}
      </Link>
    );
  }

  function renderSectionLabel(text: string, collapsed: boolean) {
    if (collapsed) {
      return <div key={text} className="h-px bg-stone-100 dark:bg-zinc-800 mx-2 my-2" aria-hidden />;
    }
    return (
      <p key={text} className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        {text}
      </p>
    );
  }

  function renderDesktopNav() {
    const c = sidebarCollapsed;
    return (
      <nav
        ref={desktopNavRef}
        className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden min-h-0 min-w-0 [overflow-anchor:none]"
      >
        {renderNavLink(OVERVIEW_ITEM, { collapsed: c })}
        {renderSectionLabel(t('dashboard.buyersSection'), c)}
        {INBOX_LINKS.map((item) => renderNavLink(item, { collapsed: c }))}
        {renderSectionLabel(t('dashboard.storefrontSection'), c)}
        {STOREFRONT_LINKS.map((item) => renderNavLink(item, { collapsed: c }))}
        {renderSectionLabel(t('dashboard.accountSection'), c)}
        <Link
          to="/dashboard/support"
          onMouseDown={onSidebarNavMouseDown}
          className={`${linkClass('/dashboard/support', c)} relative`}
          title={c ? t('dashboard.layout.supportChat') : undefined}
        >
          <Headphones
            className={`shrink-0 w-[18px] h-[18px] ${location.pathname === '/dashboard/support' ? 'text-brand-600 dark:text-brand-400' : 'text-stone-500 dark:text-zinc-400'}`}
            strokeWidth={2}
          />
          {!c && (
            <>
              <span className="truncate">{t('dashboard.layout.supportChat')}</span>
              {supportUnreadCount > 0 && (
                <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                  {supportUnreadCount > 99 ? '99+' : supportUnreadCount}
                </span>
              )}
            </>
          )}
        </Link>
        <Link
          to="/dashboard/settings"
          onMouseDown={onSidebarNavMouseDown}
          className={linkClass('/dashboard/settings', c)}
          title={c ? t('dashboard.layout.account') : undefined}
        >
          <Settings
            className={`shrink-0 w-[18px] h-[18px] ${location.pathname === '/dashboard/settings' ? 'text-brand-600 dark:text-brand-400' : 'text-stone-500 dark:text-zinc-400'}`}
            strokeWidth={2}
          />
          {!c && <span className="truncate">{t('dashboard.layout.account')}</span>}
        </Link>
      </nav>
    );
  }

  function renderMobileNav() {
    return (
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {renderNavLink(OVERVIEW_ITEM, { collapsed: false, onNavigate: () => setMobileOpen(false) })}
        {renderSectionLabel(t('dashboard.buyersSection'), false)}
        {INBOX_LINKS.map((item) =>
          renderNavLink(item, { collapsed: false, onNavigate: () => setMobileOpen(false) })
        )}
        {renderSectionLabel(t('dashboard.storefrontSection'), false)}
        {STOREFRONT_LINKS.map((item) => renderNavLink(item, { collapsed: false, onNavigate: () => setMobileOpen(false) }))}
        {renderSectionLabel(t('dashboard.accountSection'), false)}
        <Link
          to="/dashboard/support"
          onMouseDown={onSidebarNavMouseDown}
          onClick={() => setMobileOpen(false)}
          className={`${linkClass('/dashboard/support', false)} relative`}
        >
          <Headphones
            className={`shrink-0 w-[18px] h-[18px] ${location.pathname === '/dashboard/support' ? 'text-brand-600 dark:text-brand-400' : 'text-stone-500 dark:text-zinc-400'}`}
            strokeWidth={2}
          />
          <span className="truncate">{t('dashboard.layout.supportChat')}</span>
          {supportUnreadCount > 0 && (
            <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
              {supportUnreadCount > 99 ? '99+' : supportUnreadCount}
            </span>
          )}
        </Link>
        <Link
          to="/dashboard/settings"
          onMouseDown={onSidebarNavMouseDown}
          onClick={() => setMobileOpen(false)}
          className={linkClass('/dashboard/settings', false)}
        >
          <Settings
            className={`shrink-0 w-[18px] h-[18px] ${location.pathname === '/dashboard/settings' ? 'text-brand-600 dark:text-brand-400' : 'text-stone-500 dark:text-zinc-400'}`}
            strokeWidth={2}
          />
          <span className="truncate">{t('dashboard.layout.account')}</span>
        </Link>
      </nav>
    );
  }

  return (
    <DashboardNotificationsProvider>
    <div className="fixed inset-0 z-0 flex min-h-0 overflow-hidden bg-stone-50 dark:bg-zinc-950">
      <aside
        className={`dashboard-sidebar hidden lg:flex lg:flex-col lg:shrink-0 lg:border-e lg:border-stone-200 lg:dark:border-zinc-800 lg:bg-white lg:dark:bg-zinc-900 lg:shadow-sm lg:dark:shadow-none lg:h-full lg:min-h-0 lg:overflow-x-hidden lg:min-w-0 transition-[width] duration-200 ease-out ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-72'
        }`}
      >
        <div className={`p-4 flex items-center relative ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <Link
              to="/dashboard"
              onMouseDown={onSidebarNavMouseDown}
              className="flex items-center gap-3 no-underline text-stone-900 dark:text-zinc-100 hover:text-stone-700 dark:hover:text-zinc-200 transition-colors min-w-0"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-sm shrink-0">
                {user.logo ? (
                  <img src={user.logo} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                    <Store className="w-5 h-5" />
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <span className="font-bold text-lg text-stone-800 dark:text-zinc-100 block truncate">{t('dashboard.layout.title')}</span>
                <span className="text-xs text-stone-500 dark:text-zinc-400 block truncate">{user.shopName}</span>
              </div>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link
              to="/dashboard"
              onMouseDown={onSidebarNavMouseDown}
              className="flex items-center justify-center"
              aria-label={t('dashboard.layout.title')}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-sm">
                {user.logo ? (
                  <img src={user.logo} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                    <Store className="w-5 h-5" />
                  </span>
                )}
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            tabIndex={sidebarCollapsed ? -1 : 0}
            className={`p-2 rounded-xl text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-800 dark:hover:text-zinc-100 shrink-0 transition-colors select-none ${sidebarCollapsed ? 'absolute w-0 h-0 opacity-0 pointer-events-none overflow-hidden' : ''}`}
            aria-label={t('dashboard.layout.collapseSidebar')}
            aria-hidden={sidebarCollapsed}
          >
            <LayoutPanelLeft className="w-[22px] h-[22px]" strokeWidth={1.75} absoluteStrokeWidth />
          </button>
        </div>
        {renderDesktopNav()}
        <div className="p-4 border-t border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 mt-auto">
          <button
            type="button"
            onClick={() => setLogoutConfirm(true)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors select-none ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? t('dashboard.layout.logout') : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>{t('dashboard.layout.logout')}</span>}
          </button>
        </div>
      </aside>
      <button
        type="button"
        onClick={() => setSidebarCollapsed(false)}
        tabIndex={!sidebarCollapsed ? -1 : 0}
        className={`hidden lg:flex fixed start-[72px] top-1/2 -translate-y-1/2 z-20 w-8 h-14 rounded-e-xl bg-white dark:bg-zinc-900 border border-s-0 border-stone-200 dark:border-zinc-700 shadow-md dark:shadow-black/40 items-center justify-center text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-100 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-stone-300 dark:hover:border-zinc-600 transition-colors select-none ${!sidebarCollapsed ? 'invisible pointer-events-none opacity-0' : ''}`}
        aria-label={t('dashboard.layout.expandSidebar')}
        aria-hidden={!sidebarCollapsed}
      >
        <PanelLeftOpen className="w-[22px] h-[22px]" strokeWidth={1.75} absoluteStrokeWidth />
      </button>

      <ConfirmDialog
        open={logoutConfirm}
        title={t('dashboard.layout.logOutTitle')}
        message={t('dashboard.layout.logOutMessage')}
        confirmLabel={t('dashboard.layout.logOutConfirm')}
        onConfirm={() => {
          setLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setLogoutConfirm(false)}
        danger
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`dashboard-sidebar fixed top-0 start-0 z-50 h-full w-72 max-w-[85vw] flex flex-col bg-white dark:bg-zinc-900 border-e border-stone-200 dark:border-zinc-800 shadow-xl dark:shadow-black/40 transform transition-transform duration-200 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 no-underline text-stone-900 dark:text-zinc-100"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-sm shrink-0">
              {user.logo ? (
                <img src={user.logo} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <Store className="w-5 h-5" />
                </span>
              )}
            </span>
            <div>
              <span className="font-bold text-lg text-stone-800 dark:text-zinc-100 block">{t('dashboard.layout.title')}</span>
              <span className="text-xs text-stone-500 dark:text-zinc-400">{user.shopName}</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-10 w-10 select-none`}
            aria-label={t('dashboard.layout.closeMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderMobileNav()}
        <div className="p-4 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/50">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setLogoutConfirm(true);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors select-none"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {t('dashboard.layout.logout')}
          </button>
        </div>
      </aside>

      <div
        id={DASHBOARD_MAIN_SCROLL_ID}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <DashboardTopBar
          shopName={user.shopName}
          shopPublicUrl={shopPublicUrl}
          onOpenMobileMenu={openMobileMenu}
        />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
    </DashboardNotificationsProvider>
  );
}
