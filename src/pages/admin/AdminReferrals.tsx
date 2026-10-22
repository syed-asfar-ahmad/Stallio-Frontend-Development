import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Search,
  Users,
  Flag,
  XCircle,
  Store,
  CheckCircle2,
  ShieldCheck,
  Ban,
  Shuffle,
  AlertTriangle,
  Gavel,
  Sparkles,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading, { AdminLoadingInline } from '../../components/admin/AdminLoading';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminModal from '../../components/admin/AdminModal';
import AdminSelect from '../../components/admin/AdminSelect';
import { adminTheme } from '../../components/admin/adminTheme';
import StatusBadge from '../../affiliate/components/StatusBadge';
import { adminAffiliateApi } from '../../affiliate/adminAffiliateApi';
import { formatCents } from '../../lib/formatCurrency';
import { DASHBOARD_TEXTAREA } from '../../lib/dashboardFormClasses';
import type { AdminAffiliate, AdminReferral, AffiliateProgramSettings, ReferralReviewAction } from '../../affiliate/types';

const LIMIT = 15;

type Summary = { total: number; flagged: number; rejected: number; trials: number; paid: number };
type Response = { referrals: AdminReferral[]; total: number; summary: Summary };

const VIEWS = [
  { value: 'flagged', label: 'Flagged Review Queue' },
  { value: 'all', label: 'All Referrals' },
  { value: 'trial', label: 'In Trial' },
  { value: 'paid', label: 'Paid' },
  { value: 'churned', label: 'Churned' },
] as const;

const PLAN_CENTS = { monthly: 500, yearly: 5000 } as const;
const d = (iso?: string | null) => (iso ? format(new Date(iso), 'MMM d, yyyy') : '—');

export default function AdminReferrals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'flagged';
  const query = searchParams.get('q') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query);

  const [target, setTarget] = useState<AdminReferral | null>(null);
  const [action, setAction] = useState<ReferralReviewAction>('approve');
  const [note, setNote] = useState('');
  const [reassignTo, setReassignTo] = useState('');
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([]);
  const [settings, setSettings] = useState<AffiliateProgramSettings | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), view });
      if (query) params.set('q', query);
      setData(await adminAffiliateApi<Response>(`/api/admin/referrals?${params}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }, [page, view, query]);

  useEffect(() => {
    void load();
  }, [load]);

  function setParams(next: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setSearchParams(p, { replace: true });
  }

  async function openReview(r: AdminReferral, initial?: ReferralReviewAction) {
    const needsApproval = r.status === 'rejected' || !!r.flagReason;
    setTarget(r);
    setAction(initial ?? (needsApproval ? 'approve' : 'reassign'));
    setNote('');
    setReassignTo('');
    try {
      const [list, s] = await Promise.all([
        adminAffiliateApi<{ affiliates: AdminAffiliate[] }>('/api/admin/affiliates?status=active&limit=100'),
        adminAffiliateApi<AffiliateProgramSettings>('/api/admin/affiliate-settings'),
      ]);
      setAffiliates(list.affiliates.filter((a) => a.id !== r.affiliateId));
      setSettings(s);
    } catch {
      /* the modal still works for approve / reject */
    }
  }

  function closeReview() {
    if (saving) return;
    setTarget(null);
  }

  // What approving would do, computed from the same rules the server applies.
  const approvePreview = useMemo(() => {
    if (!target) return null;
    const now = Date.now();
    const restored = target.paidAt
      ? 'Paid Plan'
      : new Date(target.trialEndsAt).getTime() > now
        ? 'In Trial'
        : 'Trial Expired';
    const withinWindow = !!target.paidAt && new Date(target.paidAt) <= new Date(target.payDeadlineAt);
    // A suspended affiliate never receives a newly generated commission.
    const qualifies = withinWindow && !target.commission;
    const base = PLAN_CENTS[target.paidPlan ?? 'yearly'];
    const amount = Math.round((base * (settings?.rateBps ?? 2000)) / 10_000);
    return { restored, qualifies, amount, alreadyHasCommission: !!target.commission };
  }, [target, settings]);

  const reversible =
    target?.commission && (target.commission.status === 'pending' || target.commission.status === 'approved') ? target.commission : null;

  const canSubmit =
    !saving &&
    (action === 'approve' || (action === 'reject' && note.trim().length >= 3) || (action === 'reassign' && !!reassignTo));

  async function submit() {
    if (!target || !canSubmit) return;
    setSaving(true);
    try {
      await adminAffiliateApi(`/api/admin/referrals/${target.id}/review`, {
        method: 'POST',
        body: { action, note: note.trim() || undefined, affiliateId: action === 'reassign' ? reassignTo : undefined },
      });
      toast.success(
        action === 'approve' ? 'Referral approved' : action === 'reject' ? 'Referral rejected' : 'Referral reassigned',
      );
      setTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setSaving(false);
    }
  }

  const s = data?.summary;
  const rows = data?.referrals ?? [];

  const kpis = s
    ? [
        { label: 'All Referrals', value: s.total, icon: Users, tone: 'text-stone-900 dark:text-zinc-100' },
        { label: 'Needs Review', value: s.flagged, icon: Flag, tone: s.flagged ? 'text-red-700 dark:text-red-400' : 'text-stone-900 dark:text-zinc-100' },
        { label: 'Rejected', value: s.rejected, icon: XCircle, tone: 'text-rose-700 dark:text-rose-400' },
        { label: 'In Trial', value: s.trials, icon: Store, tone: 'text-brand-700 dark:text-brand-400' },
        { label: 'Paid Plans', value: s.paid, icon: CheckCircle2, tone: 'text-emerald-700 dark:text-emerald-400' },
      ]
    : [];

  const options: { id: ReferralReviewAction; title: string; desc: string; icon: typeof ShieldCheck; show: boolean; tone: string }[] = target
    ? [
        {
          id: 'approve',
          title: 'Approve',
          desc: 'Clear the flag and restore the referral.',
          icon: ShieldCheck,
          show: target.status === 'rejected' || !!target.flagReason,
          tone: 'text-emerald-600 dark:text-emerald-400',
        },
        {
          id: 'reject',
          title: 'Reject',
          desc: 'Permanently disqualify this referral.',
          icon: Ban,
          show: target.status !== 'rejected',
          tone: 'text-red-600 dark:text-red-400',
        },
        {
          id: 'reassign',
          title: 'Reassign',
          desc: 'Attribute the seller to another affiliate.',
          icon: Shuffle,
          show: true,
          tone: 'text-brand-600 dark:text-brand-400',
        },
      ]
    : [];

  function renderReviewButton(r: AdminReferral) {
    const flagged = r.status === 'rejected' || !!r.flagReason;
    return (
      <button
        type="button"
        onClick={() => void openReview(r)}
        className={`${flagged ? adminTheme.btnPrimary : adminTheme.btnSecondary} inline-flex w-full items-center justify-center gap-1.5 !px-3 !py-1.5 text-xs lg:w-auto`}
      >
        <Gavel className="h-3.5 w-3.5 shrink-0" />
        {flagged ? 'Review' : 'Manage'}
      </button>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-5 lg:mb-6 min-w-0">
        <div className="mb-1 flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
          <Users className="h-4 w-4" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-widest">Affiliate Program</span>
        </div>
        <h1 className={adminTheme.pageTitle}>Referrals</h1>
        <p className={adminTheme.pageSubtitle}>
          Audit every attributed signup, resolve fraud flags, and manually correct attribution.
        </p>
      </div>

      {loading && !data ? (
        <AdminLoading />
      ) : (
        <>
          {s && s.flagged > 0 && view !== 'flagged' ? (
            <div className={`${adminTheme.alertWarn} mb-4 justify-between`}>
              <span className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {s.flagged} referral{s.flagged > 1 ? 's' : ''} awaiting review.
              </span>
              <button type="button" onClick={() => setParams({ view: null, page: null })} className="shrink-0 text-sm font-semibold underline">
                Open queue
              </button>
            </div>
          ) : null}

          <div className="mb-4 lg:mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4 min-w-0">
            {kpis.map((k, i) => (
              <div key={k.label} className={`${adminTheme.statCard} p-4 lg:p-5 ${i === kpis.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
                <p className={`flex items-center gap-1.5 text-xs lg:text-sm ${adminTheme.muted}`}>
                  <k.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{k.label}</span>
                </p>
                <p className={`mt-1 text-xl lg:text-2xl font-bold tabular-nums ${k.tone}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 min-w-0 max-lg:overflow-x-auto max-lg:pb-1">
            <div className="inline-flex gap-2 lg:flex lg:flex-wrap">
              {VIEWS.map((v) => {
                const active = view === v.value;
                const isQueue = v.value === 'flagged';
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setParams({ view: v.value === 'flagged' ? null : v.value, page: null })}
                    className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs lg:text-sm font-medium transition-colors ${
                      active
                        ? isQueue
                          ? adminTheme.btnFilterWarnActive
                          : adminTheme.btnFilterActive
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {isQueue ? <Flag className="h-3.5 w-3.5" /> : null}
                    {v.label}
                    {isQueue && s ? <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white tabular-nums">{s.flagged}</span> : null}
                  </button>
                );
              })}
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
                placeholder="Search shop, seller email, username or affiliate..."
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
                <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">
                  {view === 'flagged' ? 'Flagged Review Queue' : VIEWS.find((v) => v.value === view)?.label ?? 'Referrals'}
                </h2>
                <p className={`mt-0.5 text-[11px] lg:text-xs ${adminTheme.muted}`}>
                  {view === 'flagged'
                    ? 'Referrals that are rejected or carry a fraud flag. Held commissions are blocked until resolved.'
                    : 'Seller emails are shown in full for admin audit.'}
                </p>
              </div>
              {loading ? <AdminLoadingInline /> : null}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className={adminTheme.theadRow}>
                    <th className={adminTheme.th}>Seller</th>
                    <th className={adminTheme.th}>Affiliate</th>
                    <th className={adminTheme.th}>Signed Up</th>
                    <th className={adminTheme.th}>Status</th>
                    <th className={adminTheme.th}>Commission</th>
                    <th className={adminTheme.th}>Actions</th>
                  </tr>
                </thead>
                <tbody className={adminTheme.tbodyDivide}>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`px-4 py-14 text-center ${adminTheme.muted}`}>
                        <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-40" />
                        <p className="text-sm font-semibold">{view === 'flagged' ? 'Queue is clear' : 'No referrals found'}</p>
                        <p className="mt-0.5 text-xs">{view === 'flagged' ? 'No referrals are waiting for review.' : 'Try a different filter or search term.'}</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className={adminTheme.rowHover}>
                        <td className={adminTheme.td}>
                          <p className="font-semibold text-stone-900 dark:text-zinc-100">{r.shopName}</p>
                          <p className={`text-xs ${adminTheme.muted}`}>
                            {r.sellerEmail} · @{r.sellerUsername}
                          </p>
                          {r.flagReason ? (
                            <p className="mt-1.5 flex max-w-sm items-start gap-1.5 rounded-lg bg-red-50 px-2 py-1 text-[11px] leading-snug text-red-700 dark:bg-red-950/30 dark:text-red-300">
                              <Flag className="mt-0.5 h-3 w-3 shrink-0" />
                              <span>{r.flagReason}</span>
                            </p>
                          ) : null}
                        </td>
                        <td className={adminTheme.td}>
                          <Link to={`/admin/affiliates/${r.affiliateId}`} className={adminTheme.link}>
                            {r.affiliateName}
                          </Link>
                          <p className={`text-xs ${adminTheme.muted}`}>via @{r.codeUsed}</p>
                        </td>
                        <td className={`${adminTheme.td} tabular-nums`}>{d(r.signedUpAt)}</td>
                        <td className={adminTheme.td}>
                          <StatusBadge status={r.status} context="referral" />
                        </td>
                        <td className={adminTheme.td}>
                          {r.commission ? (
                            <div className="space-y-1">
                              <span className="font-semibold tabular-nums text-stone-900 dark:text-zinc-100">{formatCents(r.commission.amountCents)}</span>
                              <div>
                                <StatusBadge status={r.commission.status} context="commission" />
                              </div>
                            </div>
                          ) : (
                            <span className={adminTheme.muted}>{r.paidAt ? 'Not issued' : '—'}</span>
                          )}
                        </td>
                        <td className={adminTheme.td}>{renderReviewButton(r)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden">
              {rows.length === 0 ? (
                <p className={`px-4 py-10 text-center text-sm ${adminTheme.muted}`}>{view === 'flagged' ? 'Queue is clear.' : 'No referrals found.'}</p>
              ) : (
                <ul className={`divide-y ${adminTheme.divide}`}>
                  {rows.map((r) => (
                    <li key={r.id} className="flex flex-col gap-3 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900 dark:text-zinc-100">{r.shopName}</p>
                          <p className={`truncate text-xs ${adminTheme.muted}`}>{r.sellerEmail}</p>
                        </div>
                        <StatusBadge status={r.status} context="referral" />
                      </div>
                      {r.flagReason ? (
                        <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                          <Flag className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{r.flagReason}</span>
                        </p>
                      ) : null}
                      <p className={`text-xs ${adminTheme.muted}`}>
                        <Link to={`/admin/affiliates/${r.affiliateId}`} className={adminTheme.link}>
                          {r.affiliateName}
                        </Link>{' '}
                        · {d(r.signedUpAt)}
                        {r.commission ? ` · ${formatCents(r.commission.amountCents)}` : ''}
                      </p>
                      {renderReviewButton(r)}
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
        size="lg"
        title="Review Referral"
        description="Choose how to resolve this referral. The decision is recorded in the audit trail."
        busy={saving}
        onClose={closeReview}
        footer={
          <>
            <button type="button" disabled={saving} onClick={closeReview} className={`w-full sm:flex-1 ${adminTheme.btnSecondary}`}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void submit()}
              className={`flex w-full sm:flex-1 items-center justify-center gap-2 ${
                action === 'reject'
                  ? 'dashboard-pressable rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
                  : `${adminTheme.btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`
              }`}
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : null}
              <span>
                {saving
                  ? 'Saving...'
                  : action === 'approve'
                    ? 'Approve Referral'
                    : action === 'reject'
                      ? 'Reject Permanently'
                      : 'Reassign Referral'}
              </span>
            </button>
          </>
        }
      >
        {target ? (
          <>
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900 dark:text-zinc-100">{target.shopName}</p>
                  <p className={`truncate text-xs ${adminTheme.muted}`}>{target.sellerEmail}</p>
                </div>
                <StatusBadge status={target.status} context="referral" />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className={adminTheme.muted}>Attributed to</dt>
                  <dd className="font-semibold text-stone-800 dark:text-zinc-200">
                    {target.affiliateName} <span className={adminTheme.muted}>@{target.affiliateHandle}</span>
                  </dd>
                </div>
                <div>
                  <dt className={adminTheme.muted}>Signed up</dt>
                  <dd className="font-semibold text-stone-800 dark:text-zinc-200">{d(target.signedUpAt)}</dd>
                </div>
              </dl>
              {target.flagReason ? (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{target.flagReason}</span>
                </p>
              ) : null}
            </div>

            <div role="radiogroup" aria-label="Review action" className="grid gap-2">
              {options
                .filter((o) => o.show)
                .map((o) => {
                  const active = action === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={saving}
                      onClick={() => setAction(o.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-start transition-colors lg:p-4 ${
                        active
                          ? 'border-brand-500 bg-brand-50/80 dark:border-brand-600 dark:bg-brand-950/35'
                          : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-600'
                      }`}
                    >
                      <o.icon className={`mt-0.5 h-5 w-5 shrink-0 ${o.tone}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-stone-900 dark:text-zinc-100">{o.title}</span>
                        <span className={`mt-0.5 block text-xs leading-relaxed ${adminTheme.muted}`}>{o.desc}</span>
                      </span>
                    </button>
                  );
                })}
            </div>

            {action === 'approve' && approvePreview ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs leading-relaxed text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-200">
                <p className="font-semibold">What happens</p>
                <ul className="mt-1 list-disc space-y-0.5 ps-4">
                  <li>The flag is cleared and the referral returns to “{approvePreview.restored}”.</li>
                  {approvePreview.qualifies ? (
                    <li>
                      A qualified commission of <strong>{formatCents(approvePreview.amount)}</strong> is created for @{target.affiliateHandle} and enters the{' '}
                      {settings?.holdPeriodDays ?? 30}-day hold.
                    </li>
                  ) : approvePreview.alreadyHasCommission ? (
                    <li>The existing commission is kept and, if it was reversed by a rejection, restored.</li>
                  ) : (
                    <li>No commission is generated: the seller has not paid inside the qualification window.</li>
                  )}
                </ul>
              </div>
            ) : null}

            {action === 'reject' ? (
              <div className="space-y-3">
                {reversible ? (
                  <p className={adminTheme.alertWarn}>
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="text-xs">
                      The linked {reversible.status} commission ({formatCents(reversible.amountCents)}) will be reversed.
                    </span>
                  </p>
                ) : null}
                <div>
                  <label htmlFor="reject-reason" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
                    Rejection reason <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="reject-reason"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={280}
                    placeholder="Shown to admins in the audit trail"
                    className={DASHBOARD_TEXTAREA}
                  />
                </div>
              </div>
            ) : null}

            {action === 'reassign' ? (
              <div className="space-y-3">
                <AdminSelect label="New affiliate" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} disabled={saving}>
                  <option value="">Select an active affiliate...</option>
                  {affiliates.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (@{a.primaryCode})
                    </option>
                  ))}
                </AdminSelect>
                <div>
                  <label htmlFor="reassign-note" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
                    Note <span className={adminTheme.muted}>(optional)</span>
                  </label>
                  <textarea
                    id="reassign-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={280}
                    className={DASHBOARD_TEXTAREA}
                  />
                </div>
                <p className={`text-xs leading-relaxed ${adminTheme.muted}`}>
                  Any commission not yet disbursed moves with the referral. The flag is cleared on reassignment.
                </p>
              </div>
            ) : null}
          </>
        ) : null}
      </AdminModal>
    </AdminLayout>
  );
}
