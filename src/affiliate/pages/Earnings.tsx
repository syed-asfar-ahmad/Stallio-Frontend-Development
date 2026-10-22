// ============================================================================
// Stallio Affiliate Earnings & Commissions Ledger (Earnings.tsx)
// Detailed commission audit ledger, 30-day hold countdowns, and funnel metrics
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { affiliateApi } from '../affiliateApi';
import type { CommissionItem, AffiliateStatsResponse, CommissionStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import FunnelChart from '../components/FunnelChart';
import AdminLoading from '../../components/admin/AdminLoading';
import { formatCents, formatBps } from '../../lib/formatCurrency';
import { DASHBOARD_SEARCH_INPUT } from '../../lib/dashboardFormClasses';

type CommissionFilterTab = 'all' | 'pending' | 'approved' | 'paid' | 'reversed';

export default function Earnings() {
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [stats, setStats] = useState<AffiliateStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CommissionFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let alive = true;
    async function loadData() {
      setLoading(true);
      try {
        const [cRes, sRes] = await Promise.all([
          affiliateApi<{ commissions: CommissionItem[] }>('/api/affiliate/earnings'),
          affiliateApi<AffiliateStatsResponse>('/api/affiliate/stats'),
        ]);
        if (alive) {
          if (cRes?.commissions) setCommissions(cRes.commissions);
          if (sRes) setStats(sRes);
        }
      } catch {
        // Handled by mock fallback
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadData();
    return () => {
      alive = false;
    };
  }, []);

  // Filter logic
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      if (activeTab !== 'all' && c.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchShop = c.shopName.toLowerCase().includes(q);
        const matchPlan = c.planName.toLowerCase().includes(q);
        if (!matchShop && !matchPlan) return false;
      }
      return true;
    });
  }, [commissions, activeTab, searchQuery]);

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

  if (loading && commissions.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <AdminLoading message="Loading commissions ledger..." />
      </div>
    );
  }

  const s = stats?.summary;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 lg:gap-2 text-brand-600 mb-0.5">
            <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[11px] lg:text-sm font-semibold uppercase tracking-wide lg:tracking-widest">
              COMMISSIONS & REVENUE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
            Earnings Ledger
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs lg:text-sm">
            Auditable record of one-time 20% commissions earned on seller first paid plans.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {/* Available Balance */}
        <div className="rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-5 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-700/80">
          <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-1">
            Available Balance
          </p>
          <p className="text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
            {formatCents(s?.balanceCents ?? 0)}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
            Ready for monthly batch payout
          </p>
        </div>

        {/* 30-Day Escrow Hold */}
        <div className="rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-5 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-700/80">
          <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-1">
            In 30-Day Hold
          </p>
          <p className="text-xl lg:text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {formatCents(s?.pendingEarningsCents ?? 0)}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
            Held per refund dispute terms
          </p>
        </div>

        {/* Disbursed */}
        <div className="rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-5 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-700/80">
          <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-1">
            Lifetime Disbursed
          </p>
          <p className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCents(s?.paidEarningsCents ?? 0)}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
            Transferred via batch payouts
          </p>
        </div>

        {/* Commission Rate */}
        <div className="rounded-xl lg:rounded-2xl bg-white dark:bg-zinc-900 p-4 lg:p-5 shadow-lg shadow-stone-200/30 dark:shadow-black/40 border border-stone-200/80 dark:border-zinc-700/80">
          <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-1">
            Commission Rate
          </p>
          <p className="text-xl lg:text-2xl font-bold text-brand-600 dark:text-brand-400 tabular-nums">
            {formatBps(stats?.settings?.rateBps ?? 2000)}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
            One-time on seller&apos;s 1st paid plan
          </p>
        </div>
      </div>

      {/* Funnel Visualization */}
      {s && <FunnelChart summary={s} />}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800/80 overflow-x-auto">
          {[
            { id: 'all', label: 'All Commissions' },
            { id: 'pending', label: 'In 30d Hold' },
            { id: 'approved', label: 'Approved' },
            { id: 'paid', label: 'Disbursed' },
            { id: 'reversed', label: 'Reversed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CommissionFilterTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-brand-700 shadow-xs dark:bg-zinc-700 dark:text-brand-300'
                  : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop or plan..."
            className={`${DASHBOARD_SEARCH_INPUT} text-xs py-2`}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80 text-stone-500 font-semibold dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400">
                <th className="py-3.5 px-4">Merchant & Plan</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Seller Paid</th>
                <th className="py-3.5 px-4">Rate</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Hold Release</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 text-stone-700 dark:text-zinc-300">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 dark:text-zinc-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No commission records found</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
                      Commissions appear once an admin records a seller&apos;s first paid plan payment.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((c) => {
                  const holdDaysLeft = getDaysRemaining(c.holdUntil);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-stone-50/70 transition-colors dark:hover:bg-zinc-800/40"
                    >
                      {/* Shop Name & Plan */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-stone-900 dark:text-zinc-100">
                            {c.shopName}
                          </p>
                          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                            {c.planName}
                          </p>
                        </div>
                      </td>

                      {/* Payment Recorded Date */}
                      <td className="py-3 px-4 text-xs tabular-nums text-stone-600 dark:text-zinc-400">
                        {formatDisplayDate(c.createdAt)}
                      </td>

                      {/* Seller Paid Base */}
                      <td className="py-3 px-4 text-xs tabular-nums text-stone-700 dark:text-zinc-300">
                        {formatCents(c.baseAmountCents)}
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-4 text-xs font-semibold text-stone-600 dark:text-zinc-400">
                        {formatBps(c.rateBps)}
                      </td>

                      {/* Commission Amount */}
                      <td className="py-3 px-4 text-xs font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                        {formatCents(c.amountCents)}
                      </td>

                      {/* 30-Day Hold Release */}
                      <td className="py-3 px-4 text-xs">
                        {c.status === 'pending' ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-amber-700 dark:text-amber-400">
                              {holdDaysLeft} days left
                            </span>
                            <p className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums">
                              Releases {formatDisplayDate(c.holdUntil)}
                            </p>
                          </div>
                        ) : c.status === 'reversed' ? (
                          <span className="text-rose-600 dark:text-rose-400" title={c.reversalReason || undefined}>
                            {c.reversalReason || 'Payment Refunded'}
                          </span>
                        ) : (
                          <span className="text-stone-500 dark:text-zinc-400 tabular-nums">
                            Released {formatDisplayDate(c.approvedAt || c.holdUntil)}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={c.status} context="commission" />
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
