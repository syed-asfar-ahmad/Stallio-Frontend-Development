import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Search, Clock, Check, Wallet, Undo2, AlertTriangle, ReceiptText, Lock } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading, { AdminLoadingInline } from '../../components/admin/AdminLoading';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import { adminTheme } from '../../components/admin/adminTheme';
import StatusBadge from '../../affiliate/components/StatusBadge';
import { adminAffiliateApi } from '../../affiliate/adminAffiliateApi';
import { formatBps, formatCents } from '../../lib/formatCurrency';
import { DASHBOARD_TEXTAREA } from '../../lib/dashboardFormClasses';
import type { AdminCommission } from '../../affiliate/types';

const LIMIT = 15;

type Summary = { pendingCents: number; approvedCents: number; paidCents: number; reversedCents: number; count: number };
type Response = { commissions: AdminCommission[]; total: number; summary: Summary };

const STATUS_FILTERS = [
  { value: 'all', label: 'All Commissions' },
  { value: 'pending', label: 'In Hold' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Disbursed' },
  { value: 'reversed', label: 'Reversed' },
] as const;

const REASON_PRESETS = [
  'Payment refunded by administrator.',
  'Chargeback or payment dispute.',
  'Fraudulent or self-referral activity.',
  'Duplicate commission entry.',
];

const d = (iso?: string | null) => (iso ? format(new Date(iso), 'MMM d, yyyy') : '—');
const daysLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

export default function AdminCommissions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || 'all';
  const query = searchParams.get('q') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query);
  const [target, setTarget] = useState<AdminCommission | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), status });
      if (query) params.set('q', query);
      setData(await adminAffiliateApi<Response>(`/api/admin/commissions?${params}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  }, [page, status, query]);

  useEffect(() => {
    void load();
  }, [load]);

  function setParams(next: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setSearchParams(p, { replace: true });
  }

  function close() {
    if (saving) return;
    setTarget(null);
    setReason('');
  }

  async function reverse() {
    if (!target || reason.trim().length < 3) return;
    setSaving(true);
    try {
      await adminAffiliateApi(`/api/admin/commissions/${target.id}/reverse`, { method: 'POST', body: { reason: reason.trim() } });
      toast.success(`Commission reversed (${formatCents(target.amountCents)})`);
      setTarget(null);
      setReason('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reversal failed');
    } finally {
      setSaving(false);
    }
  }

  const s = data?.summary;
  const rows = data?.commissions ?? [];

  const kpis = s
    ? [
        { label: 'In Hold', value: formatCents(s.pendingCents), hint: 'Awaiting release date', icon: Clock, tone: 'text-amber-700 dark:text-amber-300' },
        { label: 'Approved', value: formatCents(s.approvedCents), hint: 'Ready for next batch', icon: Check, tone: 'text-brand-700 dark:text-brand-400' },
        { label: 'Disbursed', value: formatCents(s.paidCents), hint: 'Paid via batches', icon: Wallet, tone: 'text-emerald-700 dark:text-emerald-400' },
        { label: 'Reversed', value: formatCents(s.reversedCents), hint: 'Refunds & rejections', icon: Undo2, tone: 'text-rose-700 dark:text-rose-400' },
      ]
    : [];

  function renderAction(c: AdminCommission) {
    if (c.status === 'reversed') return <span className={`text-xs ${adminTheme.muted}`}>Reversed {d(c.reversedAt)}</span>;
    if (c.status === 'paid' || c.payoutBatchId) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs ${adminTheme.muted}`}
          title={c.status === 'paid' ? 'Disbursed commissions cannot be reversed from the ledger' : `Attached to open batch ${c.payoutBatchId}`}
        >
          <Lock className="h-3 w-3" />
          {c.status === 'paid' ? 'Locked' : 'In payout batch'}
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setTarget(c)}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 lg:w-auto dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50"
      >
        <Undo2 className="h-3.5 w-3.5 shrink-0" />
        Reverse
      </button>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-5 lg:mb-6 min-w-0">
        <div className="mb-1 flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
          <ReceiptText className="h-4 w-4" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-widest">Affiliate Program</span>
        </div>
        <h1 className={adminTheme.pageTitle}>Commissions</h1>
        <p className={adminTheme.pageSubtitle}>Platform-wide commission ledger with manual reversal for refunds, disputes and fraud.</p>
      </div>

      {loading && !data ? (
        <AdminLoading />
      ) : (
        <>
          <div className="mb-4 lg:mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 min-w-0">
            {kpis.map((k) => (
              <div key={k.label} className={`${adminTheme.statCard} p-4 lg:p-5`}>
                <p className={`flex items-center gap-1.5 text-xs lg:text-sm ${adminTheme.muted}`}>
                  <k.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{k.label}</span>
                </p>
                <p className={`mt-1 text-xl lg:text-2xl font-bold tabular-nums leading-tight ${k.tone}`}>{k.value}</p>
                <p className={`mt-0.5 text-[11px] ${adminTheme.muted}`}>{k.hint}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 min-w-0 max-lg:overflow-x-auto max-lg:pb-1">
            <div className="inline-flex gap-2 lg:flex lg:flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setParams({ status: f.value === 'all' ? null : f.value, page: null })}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs lg:text-sm font-medium transition-colors ${
                    status === f.value
                      ? adminTheme.btnFilterActive
                      : 'border border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <form
            className={`${adminTheme.card} mb-4 lg:mb-6 flex flex-col gap-2 p-4 lg:flex-row lg:items-center min-w-0`}
            onSubmit={(e) => {
              e.preventDefault();
              setParams({ q: search.trim() || null, page: null });
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shop, affiliate, code or commission ID..."
                className={`${adminTheme.input} ps-10 pe-3`}
              />
            </div>
            <button type="submit" className={`${adminTheme.btnPrimary} w-full shrink-0 lg:w-auto`}>
              Search
            </button>
          </form>

          <section className={`${adminTheme.card} overflow-hidden min-w-0`}>
            <div className={`${adminTheme.cardHeader} flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-4`}>
              <div>
                <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Commission Ledger</h2>
                <p className={`mt-0.5 text-[11px] lg:text-xs ${adminTheme.muted}`}>
                  One-time commission per referral, created on the seller&apos;s first qualifying payment.
                </p>
              </div>
              {loading ? <AdminLoadingInline /> : null}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead>
                  <tr className={adminTheme.theadRow}>
                    <th className={adminTheme.th}>Shop &amp; Plan</th>
                    <th className={adminTheme.th}>Affiliate</th>
                    <th className={adminTheme.th}>Seller Paid</th>
                    <th className={adminTheme.th}>Rate</th>
                    <th className={adminTheme.th}>Commission</th>
                    <th className={adminTheme.th}>Release</th>
                    <th className={adminTheme.th}>Status</th>
                    <th className={adminTheme.th}>Action</th>
                  </tr>
                </thead>
                <tbody className={adminTheme.tbodyDivide}>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={`px-4 py-12 text-center ${adminTheme.muted}`}>
                        <ReceiptText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                        <p className="text-sm font-semibold">No commissions match this filter</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((c) => (
                      <tr key={c.id} className={adminTheme.rowHover}>
                        <td className={adminTheme.td}>
                          <p className="font-semibold text-stone-900 dark:text-zinc-100">{c.shopName}</p>
                          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{c.planName}</p>
                        </td>
                        <td className={adminTheme.td}>
                          <Link to={`/admin/affiliates/${c.affiliateId}`} className={adminTheme.link}>
                            {c.affiliateName}
                          </Link>
                          <p className={`text-xs ${adminTheme.muted}`}>@{c.affiliateHandle}</p>
                        </td>
                        <td className={`${adminTheme.td} tabular-nums`}>{formatCents(c.baseAmountCents)}</td>
                        <td className={adminTheme.td}>{formatBps(c.rateBps)}</td>
                        <td className={`${adminTheme.td} font-bold tabular-nums text-stone-900 dark:text-zinc-100`}>{formatCents(c.amountCents)}</td>
                        <td className={`${adminTheme.td} text-xs`}>
                          {c.status === 'pending' ? (
                            <>
                              <span className="font-semibold text-amber-700 dark:text-amber-300">{daysLeft(c.holdUntil)} days left</span>
                              <p className={`tabular-nums ${adminTheme.muted}`}>{d(c.holdUntil)}</p>
                            </>
                          ) : c.status === 'reversed' ? (
                            <span className="text-rose-600 dark:text-rose-400">{c.reversalReason}</span>
                          ) : (
                            <>
                              <span className="tabular-nums">Released {d(c.approvedAt ?? c.holdUntil)}</span>
                              {c.payoutBatchId ? <p className={adminTheme.muted}>{c.payoutBatchId}</p> : null}
                            </>
                          )}
                        </td>
                        <td className={adminTheme.td}>
                          <StatusBadge status={c.status} context="commission" />
                        </td>
                        <td className={adminTheme.td}>{renderAction(c)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {rows.length === 0 ? (
                <p className={`px-4 py-10 text-center text-sm ${adminTheme.muted}`}>No commissions match this filter.</p>
              ) : (
                <ul className={`divide-y ${adminTheme.divide}`}>
                  {rows.map((c) => (
                    <li key={c.id} className="flex flex-col gap-3 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900 dark:text-zinc-100">{c.shopName}</p>
                          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{c.planName}</p>
                        </div>
                        <StatusBadge status={c.status} context="commission" />
                      </div>
                      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-3 text-center dark:bg-zinc-800/50">
                        <div>
                          <dt className={`text-[10px] uppercase tracking-wide ${adminTheme.muted}`}>Paid</dt>
                          <dd className="text-sm font-semibold tabular-nums text-stone-900 dark:text-zinc-100">{formatCents(c.baseAmountCents)}</dd>
                        </div>
                        <div>
                          <dt className={`text-[10px] uppercase tracking-wide ${adminTheme.muted}`}>Rate</dt>
                          <dd className="text-sm font-semibold text-stone-900 dark:text-zinc-100">{formatBps(c.rateBps)}</dd>
                        </div>
                        <div>
                          <dt className={`text-[10px] uppercase tracking-wide ${adminTheme.muted}`}>Earned</dt>
                          <dd className="text-sm font-bold tabular-nums text-brand-700 dark:text-brand-400">{formatCents(c.amountCents)}</dd>
                        </div>
                      </dl>
                      <p className={`text-xs ${adminTheme.muted}`}>
                        {c.affiliateName} · @{c.affiliateHandle}
                        {c.status === 'pending' ? ` · ${daysLeft(c.holdUntil)} days in hold` : ''}
                      </p>
                      {renderAction(c)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {data && data.total > 0 ? (
              <AdminPagination
                embedded
                className="mx-3 lg:mx-4 mb-4"
                page={page}
                total={data.total}
                limit={LIMIT}
                onPage={(p) => setParams({ page: p > 1 ? String(p) : null })}
              />
            ) : null}
          </section>
        </>
      )}

      <AdminModal
        open={!!target}
        title="Reverse Commission"
        description={target ? `${target.shopName} · ${target.affiliateName} (@${target.affiliateHandle})` : undefined}
        busy={saving}
        onClose={close}
        footer={
          <>
            <button type="button" disabled={saving} onClick={close} className={`w-full sm:flex-1 ${adminTheme.btnSecondary}`}>
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || reason.trim().length < 3}
              onClick={() => void reverse()}
              className="dashboard-pressable flex w-full sm:flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : null}
              <span>{saving ? 'Reversing...' : 'Reverse Commission'}</span>
            </button>
          </>
        }
      >
        {target ? (
          <>
            <div className={adminTheme.alertWarn}>
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="text-xs leading-relaxed">
                <strong>{formatCents(target.amountCents)}</strong> will be removed from {target.affiliateName}&apos;s{' '}
                {target.status === 'approved' ? 'approved balance' : 'held balance'}. The affiliate sees the reason in their earnings ledger.
              </p>
            </div>
            <div>
              <label htmlFor="reverse-reason" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
                Reversal reason <span className="text-red-600">*</span>
              </label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {REASON_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={saving}
                    onClick={() => setReason(p)}
                    className={`${adminTheme.chip} transition-colors hover:bg-brand-100 hover:text-brand-800 dark:hover:bg-brand-950/50 dark:hover:text-brand-300`}
                  >
                    {p.replace(/\.$/, '')}
                  </button>
                ))}
              </div>
              <textarea
                id="reverse-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Visible to the affiliate"
                className={DASHBOARD_TEXTAREA}
              />
            </div>
          </>
        ) : null}
      </AdminModal>
    </AdminLayout>
  );
}
