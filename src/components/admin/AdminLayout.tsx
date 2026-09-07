import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Inbox, CreditCard, LogOut, X, ExternalLink, Headphones, Bell } from 'lucide-react';
import { api } from '../../lib/api';
import AdminBrandMark from './AdminBrandMark';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../ConfirmDialog';
import AdminLoading from './AdminLoading';
import AdminTopBar, { AdminTopBarStrip } from './AdminTopBar';
import { DASHBOARD_MAIN_SCROLL_ID, scrollDashboardMainToTop } from '../../lib/scrollDashboardMainToTop';
import { DASHBOARD_ICON_CLOSE_BTN } from '../../lib/dashboardFormClasses';
import {
  handleSidebarNavMouseDown,
  restoreSidebarScrollRepeated,
} from '../../lib/dashboardSidebarScroll';
import { attachBlockNumberInputWheel } from '../../lib/blockNumberInputWheel';
import { adminTheme } from './adminTheme';
import type { LucideIcon } from 'lucide-react';

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Sellers', icon: Users },
  { to: '/admin/shops', label: 'Shop Settings', icon: Store },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/support-chat', label: 'Seller Chat', icon: Headphones },
];

function SidebarBrand() {
  return (
    <>
      <AdminBrandMark />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-base font-bold text-stone-800 dark:text-zinc-100">Stallio</p>
        <p className="truncate text-xs leading-snug text-stone-500 dark:text-zinc-400">Platform Admin</p>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [supportUnreadCount, setSupportUnreadCount] = useState(0);
  const adminNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = 'Admin, Stallio';
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.add('admin-shell-active');
    const detachWheel = attachBlockNumberInputWheel();
    return () => {
      detachWheel();
      document.documentElement.classList.remove('admin-shell-active');
    };
  }, []);

  useLayoutEffect(() => {
    scrollDashboardMainToTop({ behavior: 'auto' });
    restoreSidebarScrollRepeated(adminNavRef.current, 'admin');
  }, [location.pathname]);

  const onAdminNavMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    handleSidebarNavMouseDown(e, e.currentTarget.closest('nav'), 'admin');
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    let alive = true;

    const fetchUnread = async () => {
      try {
        const data = await api<{ unreadCount: number }>('/api/support-chat/admin/unread-count');
        if (!alive) return;
        setSupportUnreadCount(data.unreadCount ?? 0);
      } catch {
        if (!alive) return;
        setSupportUnreadCount(0);
      }
    };

    fetchUnread();
    const id = window.setInterval(fetchUnread, 10000);
    const onFocus = () => {
      void fetchUnread();
    };
    window.addEventListener('focus', onFocus);
    const onRefresh = () => {
      void fetchUnread();
    };
    const onUnread = (e: Event) => {
      const count = (e as CustomEvent<{ unreadCount: number }>).detail?.unreadCount;
      if (typeof count === 'number') setSupportUnreadCount(count);
    };
    window.addEventListener('admin-support-chat-refresh', onRefresh);
    window.addEventListener('admin-support-chat-unread', onUnread);
    return () => {
      alive = false;
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('admin-support-chat-refresh', onRefresh);
      window.removeEventListener('admin-support-chat-unread', onUnread);
    };
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true });
      return;
    }
    if (!loading && user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  const openMobileMenu = useCallback(() => setMobileOpen(true), []);

  const linkClass = (to: string, end?: boolean) => {
    const active = end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);
    return `flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium no-underline transition-colors select-none ${
      active
        ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
    }`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-zinc-950">
        <AdminLoading />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-zinc-950">
        <AdminLoading />
      </div>
    );
  }

  function renderNav(onNavigate?: () => void) {
    return (
      <nav ref={adminNavRef} className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-4 [overflow-anchor:none]">
        {NAV.map(({ to, label, icon: Icon, end }) => {
          const showBadge = to === '/admin/support-chat' && supportUnreadCount > 0;
          return (
            <Link key={to} to={to} onMouseDown={onAdminNavMouseDown} onClick={onNavigate} className={linkClass(to, end)}>
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              <span className="truncate flex-1">{label}</span>
              {showBadge && (
                <span className="ml-auto inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                  {supportUnreadCount > 99 ? '99+' : supportUnreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  const sidebarFooter = (
    <div className="shrink-0 space-y-1 border-t border-stone-100 p-4 dark:border-zinc-800">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-600 no-underline transition-colors hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ExternalLink className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        View Site
      </a>
      <button
        type="button"
        onClick={() => setLogoutConfirm(true)}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-stone-50 dark:bg-zinc-950 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:grid-rows-[4rem_minmax(0,1fr)]">
      <Link
        to="/admin"
        className={`dashboard-sidebar ${adminTheme.shellHeader} hidden gap-3 border-e border-stone-200 bg-white px-5 no-underline hover:bg-stone-50/60 lg:col-start-1 lg:row-start-1 lg:flex dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/30`}
      >
        <SidebarBrand />
      </Link>

      <div className="hidden lg:col-start-2 lg:row-start-1 lg:block">
        <AdminTopBarStrip />
      </div>

      <aside className="dashboard-sidebar hidden min-h-0 flex-col border-e border-stone-200 bg-white lg:col-start-1 lg:row-start-2 lg:flex dark:border-zinc-800 dark:bg-zinc-900">
        {renderNav()}
        {sidebarFooter}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
      )}
      <aside
        className={`dashboard-sidebar fixed start-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-e border-stone-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40 ${
          mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className={`${adminTheme.shellHeader} justify-between gap-2 px-4`}>
          <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex min-w-0 items-center gap-3 no-underline">
            <AdminBrandMark />
            <div className="min-w-0">
              <p className="font-bold text-stone-800 dark:text-zinc-100">Admin</p>
              <p className="truncate text-xs text-stone-500 dark:text-zinc-400">{user.email}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-10 w-10`}
            aria-label="Close Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {renderNav(() => setMobileOpen(false))}
        {sidebarFooter}
      </aside>

      <div
        id={DASHBOARD_MAIN_SCROLL_ID}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden lg:col-start-2 lg:row-start-2"
      >
        <AdminTopBar title="Platform Admin" subtitle={user.email} onOpenMobileMenu={openMobileMenu} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:max-lg:px-4 sm:max-lg:py-5 lg:px-8 lg:py-8">{children}</main>
      </div>

      <ConfirmDialog
        open={logoutConfirm}
        title="Sign out?"
        message="You will need to sign in again to access the admin panel."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          setLogoutConfirm(false);
          logout();
          navigate('/admin/login');
        }}
        onCancel={() => setLogoutConfirm(false)}
      />
    </div>
  );
}
