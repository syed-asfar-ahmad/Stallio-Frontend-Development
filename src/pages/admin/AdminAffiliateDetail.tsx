import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Copy,
  Link2,
  Users,
  Wallet,
  Clock,
  Landmark,
  Flag,
  ShieldAlert,
  Mail,
  CalendarDays,
  Receipt,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading, { AdminLoadingInline } from '../../components/admin/AdminLoading';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminTheme } from '../../components/admin/adminTheme';
import StatusBadge from '../../affiliate/components/StatusBadge';
import { adminAffiliateApi } from '../../affiliate/adminAffiliateApi';
import { formatBps, formatCents } from '../../lib/formatCurrency';
import { DASHBOARD_TEXTAREA } from '../../lib/dashboardFormClasses';
import type {
  AdminAffiliate,
  AdminCommission,
  AdminReferral,
  AffiliateProgramSettings,
  PayoutBatch,
} from '../../affiliate/types';

type Detail = {
  affiliate: AdminAffiliate;
  referrals: AdminReferral[];
  commissions: AdminCommission[];
  batches: PayoutBatch[];
  settings: AffiliateProgramSettings;
};

type Tab = 'referrals' | 'ledger' | 'payouts';

const METHOD_LABEL = { bank_transfer: 'Bank Transfer', paypal: 'PayPal', wise: 'Wise' } as const;
const d = (iso?: string | null) => (iso ? format(new Date(iso), 'MMM d, yyyy') : '—');

export default function AdminAffiliateDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('referrals');
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setData(await adminAffiliateApi<Detail>(`/api/admin/affiliates/${id}`));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load affiliate');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(next: 'active' | 'suspended') {
    if (!data) return;
    setSaving(true);
    try {
      await adminAffiliateApi(`/api/admin/affiliates/${data.affiliate.id}/status`, {
        method: 'POST',
        body: { status: next, reason },
      });
      toast.success(next === 'suspended' ? 'Affiliate suspended' : 'Affiliate reactivated');
      setSuspendOpen(false);
      setReactivateOpen(false);
      setReason('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied');
    } catch {
      toast.error('Copy failed');
    }
  }

  if (loading && !data) {
    return (
      <AdminLayout>
        <AdminLoading />
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <Link to="/admin/affiliates" className={`mb-4 inline-flex items-center gap-2 no-underline ${adminTheme.btnSecondary}`}>
          <ArrowLeft className="h-4 w-4" /> Back To Affiliates
        </Link>
        <p className={adminTheme.alertError}>{error ?? 'Affiliate not found'}</p>
      </AdminLayout>
    );
  }

  const { affiliate: a, referrals, commissions, batches } = data;
  const m = a.metrics;
  const codes = [a.primaryCode, ...(a.aliasCodes ?? [])];
  const conv = m.referrals ? Math.round((m.paid / m.referrals) * 100) : 0;
  const myBatchItem = (b: PayoutBatch) => b.items.find((i) => i.affiliateId === a.id);

  const kpis = [
    { label: 'Referred Sellers', value: String(m.referrals), hint: `${conv}% paid conversion`, icon: Users, tone: 'text-stone-900 dark:text-zinc-100' },
    { label: 'Ready To Pay', value: formatCents(m.approvedCents), hint: 'Approved balance', icon: Wallet, tone: 'text-brand-700 dark:text-brand-400' },
    { label: 'In Hold', value: formatCents(m.pendingCents), hint: `${data.settings.holdPeriodDays}-day hold`, icon: Clock, tone: 'text-amber-700 dark:text-amber-300' },
    { label: 'Paid Out', value: formatCents(m.paidCents), hint: 'Lifetime disbursed', icon: Receipt, tone: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Reversed', value: formatCents(m.reversedCents), hint: 'Refunds & rejections', icon: ShieldAlert, tone: 'text-rose-700 dark:text-rose-400' },
  ];

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'referrals', label: 'Referrals', count: referrals.length },
    { id: 'ledger', label: 'Commission Ledger', count: commissions.length },
    { id: 'payouts', label: 'Payout History', count: batches.length },
  ];

  return (
    <AdminLayout>
      <Link to="/admin/affiliates" className={`mb-4 inline-flex items-center gap-2 no-underline ${adminTheme.btnSecondary}`}>
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back To Affiliates
      </Link>

      <div className="mb-5 lg:mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between min-w-0">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-sm">
            {a.name
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0])
              .join('')}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">{a.name}</h1>
              <StatusBadge status={a.status} size="md" />
            </div>
            <div className={`mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs lg:text-sm ${adminTheme.muted}`}>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {a.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Joined {d(a.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          {a.status === 'active' ? (
            <button
              type="button"
              onClick={() => setSuspendOpen(true)}
              className={`inline-flex items-center justify-center gap-2 ${adminTheme.btnSecondary} text-amber-800 dark:text-amber-300`}
            >
              <Ban className="h-4 w-4" />
              Suspend Affiliate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setReactivateOpen(true)}
              className={`inline-flex items-center justify-center gap-2 ${adminTheme.btnSecondary} text-brand-700 dark:text-brand-400`}
            >
              <CheckCircle className="h-4 w-4" />
              Reactivate
            </button>
          )}
        </div>
      </div>

      {a.status === 'suspended' ? (
        <div className={`${adminTheme.alertError} mb-5 flex items-start gap-3`}>
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p>Suspended {d(a.suspendedAt)}</p>
            <p className="mt-0.5 text-xs font-normal opacity-90">{a.suspendedReason}</p>
          </div>
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-5 lg:gap-4 min-w-0">
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

      <div className="mb-5 grid gap-4 lg:mb-6 lg:grid-cols-5 min-w-0">
        <section className={`${adminTheme.card} lg:col-span-3 min-w-0`}>
          <div className={`${adminTheme.cardHeader} flex items-center gap-2`}>
            <Link2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Referral Codes &amp; Aliases</h2>
          </div>
          <ul className={`divide-y ${adminTheme.divide}`}>
            {codes.map((code, i) => (
              <li key={code} className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-zinc-100">
                    <span className="truncate">stallio.shop/r/{code}</span>
                    <span className={i === 0 ? adminTheme.badgeActive : adminTheme.chip}>{i === 0 ? 'Primary' : 'Alias'}</span>
                  </p>
                  <p className={`mt-0.5 text-xs ${adminTheme.muted}`}>
                    {i === 0 ? 'Used for new links and QR codes' : 'Permanent redirect, printed QR codes never break'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copy(`https://stallio.shop/r/${code}`)}
                  className={`${adminTheme.btnSecondary} inline-flex shrink-0 items-center gap-1.5 !px-2.5 !py-1.5 text-xs`}
                  aria-label={`Copy link for ${code}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${adminTheme.card} lg:col-span-2 min-w-0`}>
          <div className={`${adminTheme.cardHeader} flex items-center gap-2`}>
            <Landmark className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Payout Destination</h2>
          </div>
          <div className="p-4 lg:p-5">
            {a.payoutMethod ? (
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
                <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">{METHOD_LABEL[a.payoutMethod.type]}</p>
                <p className="mt-1 font-mono text-sm tracking-wider text-stone-600 dark:text-zinc-300">•••• {a.payoutMethod.last4}</p>
                <p className={`mt-2 text-[11px] ${adminTheme.muted}`}>Full details are only included in the batch CSV export.</p>
              </div>
            ) : (
              <div className={adminTheme.alertWarn}>
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <p className="text-xs">No payout method on file. This affiliate is skipped from payout batches until they add one.</p>
              </div>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className={`text-xs ${adminTheme.muted}`}>Unique clicks</dt>
                <dd className="font-semibold tabular-nums text-stone-900 dark:text-zinc-100">{m.clicks.toLocaleString()}</dd>
              </div>
              <div>
                <dt className={`text-xs ${adminTheme.muted}`}>Flagged referrals</dt>
                <dd className={`font-semibold tabular-nums ${m.flagged ? 'text-red-600 dark:text-red-400' : 'text-stone-900 dark:text-zinc-100'}`}>{m.flagged}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <div className="mb-4 min-w-0 max-lg:overflow-x-auto max-lg:pb-1">
        <div className="inline-flex gap-1 rounded-xl border border-stone-200 bg-stone-50/80 p-1 dark:border-zinc-700 dark:bg-zinc-900/80">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors lg:px-4 lg:text-sm ${
                tab === t.id
                  ? 'bg-white text-brand-800 shadow-sm dark:bg-zinc-800 dark:text-brand-300'
                  : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {t.label}
              <span className="rounded-full bg-stone-200/70 px-1.5 text-[10px] tabular-nums dark:bg-zinc-700">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <section className={`${adminTheme.card} overflow-hidden min-w-0`}>
        <div className="overflow-x-auto">
          {tab === 'referrals' ? (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className={adminTheme.theadRow}>
                  <th className={adminTheme.th}>Shop</th>
                  <th className={adminTheme.th}>Code Used</th>
                  <th className={adminTheme.th}>Signed Up</th>
                  <th className={adminTheme.th}>Qualify By</th>
                  <th className={adminTheme.th}>Commission</th>
                  <th className={adminTheme.th}>Status</th>
                </tr>
              </thead>
              <tbody className={adminTheme.tbodyDivide}>
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-4 py-10 text-center ${adminTheme.muted}`}>No referrals yet.</td>
                  </tr>
                ) : (
                  referrals.map((r) => (
                    <tr key={r.id} className={adminTheme.rowHover}>
                      <td className={adminTheme.td}>
                        <p className="font-semibold text-stone-900 dark:text-zinc-100">{r.shopName}</p>
                        <p className={`text-xs ${adminTheme.muted}`}>{r.sellerEmail}</p>
                        {r.flagReason ? (
                          <p className="mt-1 flex items-start gap-1 text-[11px] text-red-600 dark:text-red-400">
                            <Flag className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>{r.flagReason}</span>
                          </p>
                        ) : null}
                      </td>
                      <td className={adminTheme.td}>@{r.codeUsed}</td>
                      <td className={`${adminTheme.td} tabular-nums`}>{d(r.signedUpAt)}</td>
                      <td className={`${adminTheme.td} tabular-nums`}>{d(r.payDeadlineAt)}</td>
                      <td className={`${adminTheme.td} font-semibold tabular-nums`}>
                        {r.commission ? formatCents(r.commission.amountCents) : <span className={adminTheme.muted}>—</span>}
                      </td>
                      <td className={adminTheme.td}>
                        <StatusBadge status={r.status} context="referral" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}

          {tab === 'ledger' ? (
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className={adminTheme.theadRow}>
                  <th className={adminTheme.th}>Shop &amp; Plan</th>
                  <th className={adminTheme.th}>Created</th>
                  <th className={adminTheme.th}>Seller Paid</th>
                  <th className={adminTheme.th}>Rate</th>
                  <th className={adminTheme.th}>Commission</th>
                  <th className={adminTheme.th}>Batch</th>
                  <th className={adminTheme.th}>Status</th>
                </tr>
              </thead>
              <tbody className={adminTheme.tbodyDivide}>
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-10 text-center ${adminTheme.muted}`}>No commissions yet.</td>
                  </tr>
                ) : (
                  commissions.map((c) => (
                    <tr key={c.id} className={adminTheme.rowHover}>
                      <td className={adminTheme.td}>
                        <p className="font-semibold text-stone-900 dark:text-zinc-100">{c.shopName}</p>
                        <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{c.planName}</p>
                      </td>
                      <td className={`${adminTheme.td} tabular-nums`}>{d(c.createdAt)}</td>
                      <td className={`${adminTheme.td} tabular-nums`}>{formatCents(c.baseAmountCents)}</td>
                      <td className={adminTheme.td}>{formatBps(c.rateBps)}</td>
                      <td className={`${adminTheme.td} font-bold tabular-nums text-stone-900 dark:text-zinc-100`}>{formatCents(c.amountCents)}</td>
                      <td className={`${adminTheme.td} text-xs`}>{c.payoutBatchId ?? <span className={adminTheme.muted}>—</span>}</td>
                      <td className={adminTheme.td}>
                        <StatusBadge status={c.status} context="commission" />
                        {c.reversalReason ? <p className="mt-1 max-w-[200px] text-[11px] text-rose-600 dark:text-rose-400">{c.reversalReason}</p> : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}

          {tab === 'payouts' ? (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className={adminTheme.theadRow}>
                  <th className={adminTheme.th}>Batch</th>
                  <th className={adminTheme.th}>Created</th>
                  <th className={adminTheme.th}>Amount</th>
                  <th className={adminTheme.th}>Method</th>
                  <th className={adminTheme.th}>Reference</th>
                  <th className={adminTheme.th}>Status</th>
                </tr>
              </thead>
              <tbody className={adminTheme.tbodyDivide}>
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-4 py-10 text-center ${adminTheme.muted}`}>No payouts have been issued yet.</td>
                  </tr>
                ) : (
                  batches.map((b) => {
                    const item = myBatchItem(b)!;
                    return (
                      <tr key={b.id} className={adminTheme.rowHover}>
                        <td className={adminTheme.td}>
                          <p className="font-semibold text-stone-900 dark:text-zinc-100">{b.label}</p>
                          <p className={`text-xs ${adminTheme.muted}`}>{b.id}</p>
                        </td>
                        <td className={`${adminTheme.td} tabular-nums`}>{d(b.createdAt)}</td>
                        <td className={`${adminTheme.td} font-bold tabular-nums`}>{formatCents(item.amountCents)}</td>
                        <td className={adminTheme.td}>
                          {METHOD_LABEL[item.method]} <span className={adminTheme.muted}>•••• {item.last4}</span>
                        </td>
                        <td className={`${adminTheme.td} font-mono text-xs`}>{b.reference ?? <span className={adminTheme.muted}>Awaiting transfer</span>}</td>
                        <td className={adminTheme.td}>
                          <StatusBadge status={b.status === 'paid' ? 'paid' : 'processing'} context="payout" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : null}
        </div>
      </section>

      <AdminModal
        open={suspendOpen}
        title="Suspend Affiliate"
        description={`${a.name} (@${a.primaryCode})`}
        busy={saving}
        onClose={() => setSuspendOpen(false)}
        footer={
          <>
            <button type="button" disabled={saving} onClick={() => setSuspendOpen(false)} className={`w-full sm:flex-1 ${adminTheme.btnSecondary}`}>
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void changeStatus('suspended')}
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
            Held commissions ({formatCents(m.pendingCents)}) will be reversed and this affiliate is excluded from payout batches.
          </p>
        </div>
        <div>
          <label htmlFor="detail-suspend-reason" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
            Internal reason <span className={adminTheme.muted}>(optional)</span>
          </label>
          <textarea
            id="detail-suspend-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={280}
            className={DASHBOARD_TEXTAREA}
          />
        </div>
      </AdminModal>

      <ConfirmDialog
        open={reactivateOpen}
        title="Reactivate Affiliate?"
        message={`${a.name} will earn on new referrals again and be included in future payout batches. Previously reversed commissions are not restored automatically.`}
        confirmLabel={saving ? 'Reactivating...' : 'Reactivate'}
        cancelLabel="Cancel"
        loading={saving}
        adminBusy
        onConfirm={() => void changeStatus('active')}
        onCancel={() => !saving && setReactivateOpen(false)}
      />
    </AdminLayout>
  );
}
