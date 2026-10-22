import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  LogOut,
  Wallet,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAffiliateAuth } from '../AffiliateAuthContext';
import { affiliateApi } from '../affiliateApi';
import type { AffiliateStatsResponse } from '../types';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatCents } from '../../lib/formatCurrency';

interface AffiliateTopBarProps {
  onOpenMobileMenu: () => void;
  balanceCents?: number;
}

export default function AffiliateTopBar({
  onOpenMobileMenu,
  balanceCents: propBalance,
}: AffiliateTopBarProps) {
  const { t } = useTranslation();
  const { affiliate, logout } = useAffiliateAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [fetchedBalance, setFetchedBalance] = useState<number | null>(null);

  useEffect(() => {
    if (propBalance !== undefined) return;
    let alive = true;
    async function loadBalance() {
      try {
        const stats = await affiliateApi<AffiliateStatsResponse>('/api/affiliate/stats');
        if (alive && stats?.summary) {
          setFetchedBalance(stats.summary.balanceCents);
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadBalance();
    return () => {
      alive = false;
    };
  }, [propBalance]);

  const balanceCents = propBalance ?? fetchedBalance ?? 1000;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-white/95 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 sm:px-6">
        {/* Left: Mobile menu toggle & title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-50 lg:hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/90 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 dark:border-brand-800/60 dark:bg-brand-950/50 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Affiliate Partner Portal
            </span>
          </div>
        </div>

        {/* Right: Quick balance, cross-link, theme, lang, user */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Balance Pill */}
          <Link
            to="/affiliate/dashboard/payouts"
            className="hidden items-center gap-2 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-900 sm:inline-flex dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-brand-600/60 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
            title="View payout balance"
          >
            <Wallet className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>Balance:</span>
            <strong className="text-brand-600 dark:text-brand-400">{formatCents(balanceCents)}</strong>
          </Link>

          {/* Cross-link to Seller App */}
          <Link
            to="/dashboard"
            className="hidden items-center gap-1.5 rounded-xl border border-brand-200/70 bg-brand-50/60 px-3 py-1.5 text-xs font-semibold text-brand-900 transition-colors hover:bg-brand-100 md:inline-flex dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-200 dark:hover:bg-brand-950/70"
          >
            <Store className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>Open a Shop</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User profile dropdown / logout */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2">
            <Link
              to="/affiliate/dashboard/settings"
              className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-800 font-bold text-[0.7rem] dark:bg-brand-950/80 dark:text-brand-300">
                {affiliate?.name ? affiliate.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="hidden max-w-[120px] truncate sm:inline-block">
                {affiliate?.name || 'Partner'}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-red-900/40 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign Out of Affiliate Portal"
        message="Are you sure you want to end your affiliate session? You can sign back in at any time."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
          navigate('/affiliate/login');
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
