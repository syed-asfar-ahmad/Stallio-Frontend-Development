// ============================================================================
// Stallio Affiliate Payouts Screen (Payouts.tsx)
// Monthly batch payout tracking, threshold progress, and banking method editor
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { affiliateApi } from '../affiliateApi';
import type { PayoutItem, PayoutMethod, PayoutMethodType } from '../types';
import StatusBadge from '../components/StatusBadge';
import AdminLoading from '../../components/admin/AdminLoading';
import { formatCents } from '../../lib/formatCurrency';
import {
  DASHBOARD_INPUT,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
} from '../../lib/dashboardFormClasses';

interface PayoutsResponse {
  payouts: PayoutItem[];
  balanceCents: number;
  minimumPayoutCents: number;
  payoutMethod: PayoutMethod;
}

export default function Payouts() {
  const { t, i18n } = useTranslation();
  const tx = (key: string, options?: Record<string, unknown>) => t(`affiliate.${key}`, options);
  const [data, setData] = useState<PayoutsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Payout Method Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<PayoutMethodType>('bank_transfer');
  const [editDetails, setEditDetails] = useState('');
  const [updatingMethod, setUpdatingMethod] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadPayouts() {
      setLoading(true);
      try {
        const res = await affiliateApi<PayoutsResponse>('/api/affiliate/payouts');
        if (alive && res) {
          setData(res);
          if (res.payoutMethod) {
            setEditType(res.payoutMethod.type);
          }
        }
      } catch {
        // Mock fallback handles errors
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadPayouts();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSaveMethod(e: React.FormEvent) {
    e.preventDefault();
    if (!editDetails.trim()) {
      toast.error(tx('enterAccountDetails'));
      return;
    }

    setUpdatingMethod(true);
    try {
      const res = await affiliateApi<{ success: boolean; payoutMethod: PayoutMethod }>(
        '/api/affiliate/payout-method',
        {
          method: 'PUT',
          body: {
            type: editType,
            details: editDetails.trim(),
          },
        }
      );

      if (res.success && res.payoutMethod) {
        setData((prev) => (prev ? { ...prev, payoutMethod: res.payoutMethod } : null));
        toast.success(tx('payoutUpdated'));
        setShowEditModal(false);
        setEditDetails('');
      }
    } catch {
      toast.error(tx('payoutUpdateFailed'));
    } finally {
      setUpdatingMethod(false);
    }
  }

  function formatDisplayDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(i18n.resolvedLanguage || 'en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <AdminLoading message={tx('loadingPayouts')} />
      </div>
    );
  }

  const balanceCents = data?.balanceCents ?? 0;
  const minPayoutCents = data?.minimumPayoutCents ?? 5000;
  const progressPercent = Math.min(100, Math.round((balanceCents / minPayoutCents) * 100));
  const method = data?.payoutMethod;
  const payouts = data?.payouts || [];
  const payoutMethodLabel = (type?: string) => {
    if (type === 'paypal') return tx('paypal');
    if (type === 'wise') return tx('wise');
    return tx('bankTransfer');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 lg:gap-2 text-brand-600 mb-0.5">
            <CreditCard className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-[11px] lg:text-sm font-semibold uppercase tracking-wide lg:tracking-widest">
              {tx('disbursementsBanking')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
            {tx('payoutsBanking')}
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs lg:text-sm">
            {tx('payoutDescription')}
          </p>
        </div>
      </div>

      {/* Top Grid: Balance Threshold Progress & Active Method Card */}
      <div className="grid md:grid-cols-12 gap-5 items-stretch">
        {/* Payout Progress Card (7 Cols) */}
        <div className="md:col-span-7 rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                {tx('monthlyThreshold')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-xs font-bold">
                {tx('reached', { percent: progressPercent })}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-zinc-100 tabular-nums">
                {formatCents(balanceCents)}
              </span>
              <span className="text-xs text-stone-500 dark:text-zinc-400">
                / {formatCents(minPayoutCents)} {tx('minimumThreshold')}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs text-stone-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>{tx('nextBatch')} <strong>{tx('nextMonth')}</strong></span>
            </div>
            {balanceCents >= minPayoutCents ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{tx('eligibleNextBatch')}</span>
              </span>
            ) : (
              <span>{tx('moreToDisburse', { amount: formatCents(minPayoutCents - balanceCents) })}</span>
            )}
          </div>
        </div>

        {/* Payout Destination Card (5 Cols) */}
        <div className="md:col-span-5 rounded-2xl border border-stone-200/80 bg-white p-5 lg:p-6 shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>{tx('payoutDestination')}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
              >
                <Edit2 className="w-3 h-3" />
                <span>{tx('edit')}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-700/70 space-y-1">
              <p className="text-xs font-bold text-stone-900 dark:text-zinc-100 capitalize">
                {payoutMethodLabel(method?.type)}
              </p>
              <p className="text-xs text-stone-600 dark:text-zinc-400 font-mono">
                {method?.detailsSummary || `Account ending in •••• ${method?.last4 || '4892'}`}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-1.5 text-[0.7rem] text-stone-500 dark:text-zinc-400">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>{tx('encryptedPayoutNotice')}</span>
          </div>
        </div>
      </div>

      {/* Payout History Ledger */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
          {tx('payoutHistory')}
        </h3>

        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-lg shadow-stone-200/30 dark:border-zinc-700/80 dark:bg-zinc-900 dark:shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/80 text-stone-500 font-semibold dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400">
                  <th className="py-3.5 px-4">{tx('dateDisbursed')}</th>
                  <th className="py-3.5 px-4">{tx('amount')}</th>
                  <th className="py-3.5 px-4">{tx('methodAccount')}</th>
                  <th className="py-3.5 px-4">{tx('batchId')}</th>
                  <th className="py-3.5 px-4">{tx('reference')}</th>
                  <th className="py-3.5 px-4 text-right">{tx('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 text-stone-700 dark:text-zinc-300">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400 dark:text-zinc-500">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-semibold">{tx('noDisbursements')}</p>
                      <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
                        {tx('noDisbursementsNote', { amount: formatCents(minPayoutCents) })}
                      </p>
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-stone-50/70 transition-colors dark:hover:bg-zinc-800/40"
                    >
                      <td className="py-3.5 px-4 text-xs tabular-nums text-stone-600 dark:text-zinc-400">
                        {formatDisplayDate(p.paidAt || p.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
                        {formatCents(p.amountCents)}
                      </td>
                      <td className="py-3.5 px-4 text-xs capitalize text-stone-700 dark:text-zinc-300">
                        {payoutMethodLabel(p.method)} (•••• {p.last4})
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-stone-500 dark:text-zinc-400">
                        {p.batchId || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-stone-500 dark:text-zinc-400">
                        {p.reference || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <StatusBadge status={p.status} context="payout" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Payout Destination Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 dark:bg-zinc-900 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                {tx('updatePayoutMethod')}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                  {tx('payoutMethodType')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank_transfer', label: tx('bankTransfer') },
                    { id: 'paypal', label: tx('paypal') },
                    { id: 'wise', label: tx('wise') },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEditType(m.id as PayoutMethodType)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                        editType === m.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                  {editType === 'paypal'
                    ? tx('paypalEmail')
                    : editType === 'wise'
                    ? tx('wiseDetails')
                    : tx('bankDetails')}
                </label>
                <input
                  type="text"
                  required
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  placeholder={
                    editType === 'paypal'
                      ? 'payments@yourbrand.com'
                      : editType === 'wise'
                      ? 'name@wise.com'
                      : tx('accountOrIban')
                  }
                  className={DASHBOARD_INPUT}
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-500 dark:text-zinc-400">
                {tx('payoutDetailsNotice')}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={updatingMethod}
                  className={DASHBOARD_BTN_SECONDARY}
                >
                  {tx('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updatingMethod}
                  className={DASHBOARD_BTN_PRIMARY}
                >
                  {updatingMethod ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tx('saving')}</span>
                    </>
                  ) : (
                    <span>{tx('saveMethod')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
