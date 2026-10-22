// ============================================================================
// Stallio Affiliate Referrals Screen (Referrals.tsx)
// Full ledger of referred merchants, trial deadlines, and status tracking
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Calendar,
  Clock,
  Store,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { affiliateApi } from '../affiliateApi';
import type { ReferralItem, ReferralStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import AdminLoading from '../../components/admin/AdminLoading';
import {
  DASHBOARD_INPUT,
  DASHBOARD_SEARCH_INPUT,
} from '../../lib/dashboardFormClasses';

type FilterTab = 'all' | 'trial' | 'paid' | 'pending' | 'churned';

export default function Referrals() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    let alive = true;
    async function loadReferrals() {
      setLoading(true);
      try {
        const res = await affiliateApi<{ referrals: ReferralItem[] }>(
          '/api/affiliate/referrals'
        );
        if (alive && res?.referrals) {
          setReferrals(res.referrals);
        }
      } catch {
        // Handled gracefully by mock fallback
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadReferrals();
    return () => {
      alive = false;
    };
  }, []);

  // Filter logic
  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      // Tab matching
      if (activeTab === 'trial' && item.status !== 'trial') return false;
      if (activeTab === 'paid' && item.status !== 'paid') return false;
      if (
        activeTab === 'pending' &&
        item.status !== 'pending_verification' &&
        item.status !== 'verified'
      )
        return false;
      if (
        activeTab === 'churned' &&
        item.status !== 'churned' &&
        item.status !== 'rejected'
      )
        return false;

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.shopName.toLowerCase().includes(q);
        const matchEmail = item.maskedEmail.toLowerCase().includes(q);
        const matchCode = item.codeUsed.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCode) return false;
      }

      return true;
    });
  }, [referrals, activeTab, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: referrals.length,
      trial: referrals.filter((r) => r.status === 'trial').length,
      paid: referrals.filter((r) => r.status === 'paid').length,
      pending: referrals.filter(
        (r) => r.status === 'pending_verification' || r.status === 'verified'
      ).length,
      churned: referrals.filter(
        (r) => r.status === 'churned' || r.status === 'rejected'
      ).length,
    };
  }, [referrals]);

  function formatDisplayDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  function getDaysRemaining(targetIso: string): number {
    const diff = new Date(targetIso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <AdminLoading message="Loading referred merchants ledger..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 lg:gap-2 text-brand-600 mb-0.5">
            <Users className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[11px] lg:text-sm font-semibold uppercase tracking-wide lg:tracking-widest">
              ATTRIBUTED MERCHANTS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
            Referred Merchants
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs lg:text-sm">
            Monitor seller registrations, free trial completion, and 90-day qualifying payment deadlines.
          </p>
        </div>
      </div>

      {/* Rules Information Banner */}
      <div className="rounded-2xl border border-brand-200/90 bg-gradient-to-r from-brand-50/80 via-brand-50/30 to-transparent p-4 sm:p-5 dark:border-brand-800/60 dark:bg-zinc-900/80">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed">
            <strong className="text-stone-900 dark:text-zinc-100">
              One-Time 20% Commission Eligibility:
            </strong>{' '}
            Referred sellers must complete their 1-month free trial and purchase their first paid plan within{' '}
            <strong className="text-brand-700 dark:text-brand-400">90 days of registration</strong>. Once the subscription payment is recorded by admin, commission enters a 30-day refund hold.
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800/80 overflow-x-auto">
          {[
            { id: 'all', label: 'All Merchants', count: counts.all },
            { id: 'trial', label: 'In Trial', count: counts.trial },
            { id: 'paid', label: 'Paid Plans', count: counts.paid },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'churned', label: 'Expired / Flagged', count: counts.churned },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-brand-700 shadow-xs dark:bg-zinc-700 dark:text-brand-300'
                  : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[0.625rem] ${
                  activeTab === tab.id
                    ? 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300'
                    : 'bg-stone-200/80 text-stone-600 dark:bg-zinc-700 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop, email, code..."
            className={`${DASHBOARD_SEARCH_INPUT} text-xs py-2`}
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80 text-stone-500 font-semibold dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400">
                <th className="py-3.5 px-4">Merchant & Shop</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Signup Date</th>
                <th className="py-3.5 px-4">30-Day Trial</th>
                <th className="py-3.5 px-4">90-Day Pay Deadline</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 text-stone-700 dark:text-zinc-300">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 dark:text-zinc-500">
                    <Store className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No referred merchants found</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
                      {searchQuery
                        ? 'Try clearing your search query or switching tabs.'
                        : 'Share your referral link or QR code to attract your first seller!'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((r) => {
                  const trialDaysLeft = getDaysRemaining(r.trialEndsAt);
                  const payDeadlineDaysLeft = getDaysRemaining(r.payDeadlineAt);

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-stone-50/70 transition-colors dark:hover:bg-zinc-800/40"
                    >
                      {/* Shop Name & Masked Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/70 text-brand-700 dark:bg-brand-950/60 dark:border-brand-800/60 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {r.shopName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-stone-900 dark:text-zinc-100 truncate">
                              {r.shopName}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-zinc-400 font-mono truncate">
                              {r.maskedEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Code Used */}
                      <td className="py-3 px-4 font-mono text-xs text-stone-600 dark:text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700">
                          {r.codeUsed}
                        </span>
                      </td>

                      {/* Signup Date */}
                      <td className="py-3 px-4 text-xs tabular-nums text-stone-600 dark:text-zinc-400">
                        {formatDisplayDate(r.signedUpAt)}
                      </td>

                      {/* 30-Day Trial Status */}
                      <td className="py-3 px-4 text-xs">
                        {r.status === 'trial' ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-brand-700 dark:text-brand-300">
                              {trialDaysLeft} days remaining
                            </span>
                            <p className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums">
                              Ends {formatDisplayDate(r.trialEndsAt)}
                            </p>
                          </div>
                        ) : r.status === 'paid' ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            Completed & Paid
                          </span>
                        ) : (
                          <span className="text-stone-400 dark:text-zinc-500">
                            {formatDisplayDate(r.trialEndsAt)}
                          </span>
                        )}
                      </td>

                      {/* 90-Day Pay Deadline */}
                      <td className="py-3 px-4 text-xs">
                        {r.status === 'paid' ? (
                          <span className="text-stone-400 dark:text-zinc-500">
                            Qualified on {formatDisplayDate(r.paidAt)}
                          </span>
                        ) : r.status === 'churned' ? (
                          <span className="text-red-600 dark:text-red-400">
                            Deadline Expired
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-medium text-stone-800 dark:text-zinc-200 tabular-nums">
                              {payDeadlineDaysLeft} days left
                            </span>
                            <p className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums">
                              Due {formatDisplayDate(r.payDeadlineAt)}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={r.status} context="referral" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
