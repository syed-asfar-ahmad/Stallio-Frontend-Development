// ============================================================================
// Stallio Affiliate Layout Shell - Mirrors Stallio DashboardLayout Architecture
// ============================================================================

import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Wallet,
  CreditCard,
  Settings,
  X,
  Sparkles,
  LayoutPanelLeft,
  PanelLeftOpen,
  LogOut,
  Store,
  ExternalLink,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import AffiliateTopBar from './components/AffiliateTopBar';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAffiliateAuth } from './AffiliateAuthContext';
import { DASHBOARD_ICON_CLOSE_BTN } from '../lib/dashboardFormClasses';

const NAV_ITEMS = [
  { to: '/affiliate/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/affiliate/dashboard/referrals', label: 'Referrals', icon: Users },
  { to: '/affiliate/dashboard/link', label: 'Link & QR', icon: QrCode },
  { to: '/affiliate/dashboard/earnings', label: 'Earnings', icon: Wallet },
  { to: '/affiliate/dashboard/payouts', label: 'Payouts', icon: CreditCard },
  { to: '/affiliate/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function AffiliateLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const { logout } = useAffiliateAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-0 flex min-h-0 overflow-hidden bg-stone-50 dark:bg-zinc-950 font-sans">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`dashboard-sidebar hidden lg:flex lg:flex-col lg:shrink-0 lg:border-e lg:border-stone-200 lg:dark:border-zinc-800 lg:bg-white lg:dark:bg-zinc-900 lg:shadow-sm lg:dark:shadow-none lg:h-full lg:min-h-0 lg:overflow-x-hidden lg:min-w-0 transition-[width] duration-200 ease-out ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-72'
        }`}
      >
        {/* Brand header */}
        <div
          className={`p-4 flex items-center relative ${
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!sidebarCollapsed && (
            <Link
              to="/affiliate/dashboard"
              className="flex items-center gap-2.5 no-underline min-w-0"
            >
              <BrandLogo className="h-8 w-auto shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[0.625rem] font-extrabold uppercase tracking-wider text-brand-800 dark:bg-brand-950/90 dark:text-brand-300 w-fit">
                  Affiliate
                </span>
              </div>
            </Link>
          )}

          {sidebarCollapsed && (
            <Link
              to="/affiliate/dashboard"
              className="flex items-center justify-center"
              aria-label="Affiliate Dashboard"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-sm shadow-sm">
                A
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            tabIndex={sidebarCollapsed ? -1 : 0}
            className={`p-2 rounded-xl text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-800 dark:hover:text-zinc-100 shrink-0 transition-colors select-none ${
              sidebarCollapsed ? 'absolute w-0 h-0 opacity-0 pointer-events-none overflow-hidden' : ''
            }`}
            aria-label="Collapse sidebar"
            aria-hidden={sidebarCollapsed}
          >
            <LayoutPanelLeft className="w-[22px] h-[22px]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                    sidebarCollapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive
                      ? 'bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-100 dark:ring-brand-800/80'
                      : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-stone-400 dark:text-zinc-500'
                      }`}
                      strokeWidth={1.9}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Callout & Cross-link */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-stone-100 dark:border-zinc-800 space-y-2">
            <div className="rounded-xl border border-brand-200/80 bg-gradient-to-br from-brand-50/80 to-brand-100/30 p-3 dark:border-brand-800/50 dark:bg-brand-950/30">
              <div className="flex items-center gap-2 text-brand-800 dark:text-brand-300">
                <Sparkles className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold">20% Tier Active</span>
              </div>
              <p className="mt-1 text-[0.7rem] leading-snug text-stone-600 dark:text-zinc-400">
                Earn 20% on every referred seller's first paid subscription.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="flex items-center justify-between gap-2 w-full rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-brand-300 hover:bg-brand-50/40 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-brand-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Store className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                <span>Open a Shop</span>
              </div>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </div>
        )}

        {/* Sidebar Log out button */}
        <div className="p-4 border-t border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 mt-auto">
          <button
            type="button"
            onClick={() => setLogoutConfirm(true)}
            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors select-none ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Expand sidebar trigger button when collapsed */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed(false)}
        tabIndex={!sidebarCollapsed ? -1 : 0}
        className={`hidden lg:flex fixed start-[72px] top-1/2 -translate-y-1/2 z-20 w-8 h-14 rounded-e-xl bg-white dark:bg-zinc-900 border border-s-0 border-stone-200 dark:border-zinc-700 shadow-md dark:shadow-black/40 items-center justify-center text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-100 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:border-stone-300 dark:hover:border-zinc-600 transition-colors select-none ${
          !sidebarCollapsed ? 'invisible pointer-events-none opacity-0' : ''
        }`}
        aria-label="Expand sidebar"
        aria-hidden={!sidebarCollapsed}
      >
        <PanelLeftOpen className="w-[22px] h-[22px]" strokeWidth={1.75} />
      </button>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside
        className={`dashboard-sidebar fixed top-0 start-0 z-50 h-full w-72 max-w-[85vw] flex flex-col bg-white dark:bg-zinc-900 border-e border-stone-200 dark:border-zinc-800 shadow-xl dark:shadow-black/40 transform transition-transform duration-200 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <Link
            to="/affiliate/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 no-underline"
          >
            <BrandLogo className="h-8 w-auto shrink-0" />
            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[0.625rem] font-extrabold uppercase tracking-wider text-brand-800 dark:bg-brand-950/90 dark:text-brand-300">
              Affiliate
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-10 w-10 select-none`}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-100 dark:ring-brand-800/80'
                      : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-stone-400 dark:text-zinc-500'
                      }`}
                      strokeWidth={1.9}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

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
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={logoutConfirm}
        title="Sign Out of Affiliate Portal"
        message="Are you sure you want to log out of your affiliate partner account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          setLogoutConfirm(false);
          logout();
          navigate('/affiliate/login');
        }}
        onCancel={() => setLogoutConfirm(false)}
      />

      {/* Main Content Scroll View */}
      <div
        id="affiliate-main-scroll"
        className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <AffiliateTopBar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
