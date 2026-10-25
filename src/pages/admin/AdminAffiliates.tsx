import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Search,
  Handshake,
  Users,
  Wallet,
  Clock,
  Ban,
  CheckCircle,
  Eye,
  Flag,
  BadgeDollarSign,
  UserX,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import { AdminLoadingInline } from '../../components/admin/AdminLoading';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminTheme } from '../../components/admin/adminTheme';
import StatusBadge from '../../affiliate/components/StatusBadge';
import { adminAffiliateApi } from '../../affiliate/adminAffiliateApi';
import { formatCents } from '../../lib/formatCurrency';
import { DASHBOARD_TEXTAREA } from '../../lib/dashboardFormClasses';
import type { AdminAffiliate } from '../../affiliate/types';

const LIMIT = 15;

type Summary = {
  totalAffiliates: number;
  activeAffiliates: number;
  suspendedAffiliates: number;
  totalReferrals: number;
  paidReferrals: number;
  liabilityCents: number;
  paidOutCents: number;
};

type Response = { affiliates: AdminAffiliate[]; total: number; summary: Summary };

const STATUS_FILTERS = [
  { value: 'all', label: 'All Affiliates' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AdminAffiliates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as 'all' | 'active' | 'suspended') || 'all';
  const query = searchParams.get('q') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query);
  const [suspendTarget, setSuspendTarget] = useState<AdminAffiliate | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [reactivateTarget, setReactivateTarget] = useState<AdminAffiliate | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), status });
      if (query) params.set('q', query);
      setData(await adminAffiliateApi<Response>(`/api/admin/affiliates?${params}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load affiliates');
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

  async function changeStatus(a: AdminAffiliate, next: 'active' | 'suspended', reason?: string) {
    setSaving(true);
    try {
      await adminAffiliateApi(`/api/admin/affiliates/${a.id}/status`, { method: 'POST', body: { status: next, reason } });
      toast.success(next === 'suspended' ? `${a.name} suspended` : `${a.name} reactivated`);
      setSuspendTarget(null);
      setReactivateTarget(null);
      setSuspendReason('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  const s = data?.summary;
  const rows = data?.affiliates ?? [];

  const kpis = s
    ? [
        { label: 'Active Affiliates', value: String(s.activeAffiliates), hint: `${s.totalAffiliates} registered`, icon: Handshake, tone: 'text-brand-700 dark:text-brand-400' },
        { label: 'Referred Sellers', value: String(s.totalReferrals), hint: `${s.paidReferrals} converted to paid`, icon: Users, tone: 'text-stone-900 dark:text-zinc-100' },
        { label: 'Commission Liability', value: formatCents(s.liabilityCents), hint: 'Held + approved, unpaid', icon: Clock, tone: 'text-amber-700 dark:text-amber-300' },
        { label: 'Paid Out To Date', value: formatCents(s.paidOutCents), hint: 'Across all batches', icon: Wallet, tone: 'text-emerald-700 dark:text-emerald-400' },
        { label: 'Suspended', value: String(s.suspendedAffiliates), hint: 'Cannot accrue commission', icon: UserX, tone: 'text-red-700 dark:text-red-400' },
      ]
    : [];

  function renderActions(a: AdminAffiliate) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row lg:flex-nowrap lg:gap-1.5">
        <Link
          to={`/admin/affiliates/${a.id}`}
          className={`inline-flex items-center justify-center gap-1.5 no-underline ${adminTheme.btnSecondary} !px-2.5 !py-1.5 text-xs`}
        >
          <Eye className="h-3.5 w-3.5 shrink-0" />
          View
        </Link>
        {a.status === 'active' ? (
          <button
            type="button"
            onClick={() => setSuspendTarget(a)}
            className={`inline-flex items-center justify-center gap-1.5 ${adminTheme.btnSecondary} !px-2.5 !py-1.5 text-xs text-amber-800 dark:text-amber-300`}
          >
            <Ban className="h-3.5 w-3.5 shrink-0" />
            Suspend
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setReactivateTarget(a)}
            className={`inline-flex items-center justify-center gap-1.5 ${adminTheme.btnSecondary} !px-2.5 !py-1.5 text-xs text-brand-700 dark:text-brand-400`}
          >
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            Reactivate
          </button>
        )}
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-5 lg:mb-6 min-w-0">
        <div className="mb-1 flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
          <Handshake className="h-4 w-4" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-widest">Affiliate Program</span>
        </div>
        <h1 className={adminTheme.pageTitle}>Affiliates</h1>
        <p className={adminTheme.pageSubtitle}>
          Audit partners, monitor referral performance and commission liability, and suspend or reactivate accounts.
        </p>
      </div>

      {loading && !data ? (
        <AdminLoading />
      ) : (
        <>
          <div className="mb-4 lg:mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4 min-w-0">
            {kpis.map((k, i) => (
              <div key={k.label} className={`${adminTheme.statCard} p-4 lg:p-5 ${i === kpis.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
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
                placeholder="Search name, email, referral code or alias..."
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
                <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Partner Directory</h2>
                <p className={`mt-0.5 text-[11px] lg:text-xs ${adminTheme.muted}`}>
                  Ranked by lifetime commission (ready + disbursed).
                </p>
              </div>
              {loading ? <AdminLoadingInline /> : null}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className={adminTheme.theadRow}>
                    <th className={adminTheme.th}>Affiliate</th>
                    <th className={adminTheme.th}>Code</th>
                    <th className={adminTheme.th}>Referrals</th>
                    <th className={adminTheme.th}>Ready To Pay</th>
                    <th className={adminTheme.th}>In Hold</th>
                    <th className={adminTheme.th}>Paid Out</th>
                    <th className={adminTheme.th}>Status</th>
                    <th className={adminTheme.th}>Actions</th>
                  </tr>
                </thead>
                <tbody className={adminTheme.tbodyDivide}>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={`px-4 py-12 text-center ${adminTheme.muted}`}>
                        <Handshake className="mx-auto mb-2 h-8 w-8 opacity-40" />
                        <p className="text-sm font-semibold">No affiliates match this filter</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((a) => {
                      const conv = a.metrics.referrals ? Math.round((a.metrics.paid / a.metrics.referrals) * 100) : 0;
                      return (
                        <tr key={a.id} className={adminTheme.rowHover}>
                          <td className={adminTheme.td}>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-xs font-bold text-white shadow-sm">
                                {initials(a.name)}
                              </span>
                              <div className="min-w-0">
                                <Link to={`/admin/affiliates/${a.id}`} className={`block truncate ${adminTheme.link}`}>
                                  {a.name}
                                </Link>
                                <p className={`truncate text-xs ${adminTheme.muted}`}>{a.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className={adminTheme.td}>
                            <span className="font-semibold text-stone-900 dark:text-zinc-100">@{a.primaryCode}</span>
                            {(a.aliasCodes?.length ?? 0) > 0 ? (
                              <p className={`text-xs ${adminTheme.muted}`}>+{a.aliasCodes!.length} alias{a.aliasCodes!.length > 1 ? 'es' : ''}</p>
                            ) : null}
                          </td>
                          <td className={adminTheme.td}>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold tabular-nums text-stone-900 dark:text-zinc-100">{a.metrics.referrals}</span>
                              <span className={`text-xs ${adminTheme.muted}`}>
                                {a.metrics.paid} paid · {conv}%
                              </span>
                              {a.metrics.flagged > 0 ? (
                                <Link
                                  to={`/admin/referrals?view=flagged&q=${encodeURIComponent(a.primaryCode)}`}
                                  className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 no-underline hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
                                  title="Review flagged referrals"
                                >
                                  <Flag className="h-3 w-3" />
                                  {a.metrics.flagged}
                                </Link>
                              ) : null}
                            </div>
                            <div className="mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-stone-100 dark:bg-zinc-800" aria-hidden>
                              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: `${Math.min(100, conv)}%` }} />
                            </div>
                          </td>
                          <td className={`${adminTheme.td} font-bold tabular-nums text-brand-700 dark:text-brand-400`}>
                            {formatCents(a.metrics.approvedCents)}
                          </td>
                          <td className={`${adminTheme.td} tabular-nums text-amber-700 dark:text-amber-300`}>{formatCents(a.metrics.pendingCents)}</td>
                          <td className={`${adminTheme.td} tabular-nums`}>{formatCents(a.metrics.paidCents)}</td>
                          <td className={adminTheme.td}>
                            <StatusBadge status={a.status} />
                            {a.status === 'suspended' && a.suspendedAt ? (
                              <p className={`mt-1 text-[11px] ${adminTheme.muted}`}>since {format(new Date(a.suspendedAt), 'MMM d')}</p>
                            ) : null}
                          </td>
                          <td className={adminTheme.td}>{renderActions(a)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {rows.length === 0 ? (
                <p className={`px-4 py-10 text-center text-sm ${adminTheme.muted}`}>No affiliates match this filter.</p>
              ) : (
                <ul className={`divide-y ${adminTheme.divide}`}>
                  {rows.map((a) => (
                    <li key={a.id} className="flex flex-col gap-3 p-4 min-w-0">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-sm">
                          {initials(a.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link to={`/admin/affiliates/${a.id}`} className={`block truncate font-semibold ${adminTheme.link}`}>
                            {a.name}
                          </Link>
                          <p className={`truncate text-xs ${adminTheme.muted}`}>
                            @{a.primaryCode} · {a.email}
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-3 text-center dark:bg-zinc-800/50">
                        <div>
                          <dt className={`text-[10px] uppercase tracking-wide ${adminTheme.muted}`}>Ready</dt>
                          <dd className="text-sm font-bold tabular-nums text-brand-700 dark:text-brand-400">{formatCents(a.metrics.approvedCents)}</dd>
                        </div>
                        <div>
                          <dt className={`text-[10px] uppercase tracking-wide ${adminTheme.muted}`}>Hold</dt>
                          <dd className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-300">{formatCents(a.metrics.pendingCents)}</dd>
                        </div>
                        <div>
                          <dt className={`text-[10px] uppercase tracking-wide ${adminTheme.muted}`}>Referrals</dt>
                          <dd className="text-sm font-bold tabular-nums text-stone-900 dark:text-zinc-100">
                            {a.metrics.referrals}
                            {a.metrics.flagged > 0 ? <span className="ms-1 text-red-600 dark:text-red-400">⚑{a.metrics.flagged}</span> : null}
                          </dd>
                        </div>
                      </dl>
                      {renderActions(a)}
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

          <p className={`mt-4 flex items-center gap-2 text-xs ${adminTheme.muted}`}>
            <BadgeDollarSign className="h-3.5 w-3.5 shrink-0" />
            Suspending an affiliate freezes their held commissions and disables new attribution. Approved balances are retained for review.
          </p>
        </>
      )}

      <AdminModal
        open={!!suspendTarget}
        title="Suspend Affiliate"
        description={suspendTarget ? `${suspendTarget.name} (@${suspendTarget.primaryCode})` : undefined}
        busy={saving}
        onClose={() => {
          setSuspendTarget(null);
          setSuspendReason('');
        }}
        footer={
          <>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setSuspendTarget(null);
                setSuspendReason('');
              }}
              className={`w-full sm:flex-1 ${adminTheme.btnSecondary}`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => suspendTarget && void changeStatus(suspendTarget, 'suspended', suspendReason)}
              className="dashboard-pressable flex w-full sm:flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-60"
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : null}
              <span>{saving ? 'Suspending...' : 'Suspend Affiliate'}</span>
            </button>
          </>
        }
      >
        <div className={adminTheme.alertWarn}>
          <Ban className="h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            Held commissions will be reversed, referral links stop attributing new sellers, and the affiliate is excluded from payout batches.
          </p>
        </div>
        <div>
          <label htmlFor="suspend-reason" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
            Internal reason <span className={adminTheme.muted}>(optional)</span>
          </label>
          <textarea
            id="suspend-reason"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="e.g. Self-referral pattern detected on 3 accounts"
            className={DASHBOARD_TEXTAREA}
          />
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!reactivateTarget}
        title="Reactivate Affiliate?"
        message={
          reactivateTarget
            ? `${reactivateTarget.name} will be able to earn on new referrals again and will be included in future payout batches. Previously reversed commissions are not restored automatically.`
            : ''
        }
        confirmLabel={saving ? 'Reactivating...' : 'Reactivate'}
        cancelLabel="Cancel"
        loading={saving}
        adminBusy
        onConfirm={() => reactivateTarget && void changeStatus(reactivateTarget, 'active')}
        onCancel={() => !saving && setReactivateTarget(null)}
      />
    </AdminLayout>
  );
}
