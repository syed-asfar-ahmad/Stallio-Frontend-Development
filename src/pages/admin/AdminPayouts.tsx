import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  BadgeDollarSign,
  CalendarClock,
  ChevronDown,
  CircleCheck,
  Download,
  FileSpreadsheet,
  Hourglass,
  Landmark,
  Layers,
  Settings2,
  Users,
  Wand2,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading, { AdminLoadingInline } from '../../components/admin/AdminLoading';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminTheme } from '../../components/admin/adminTheme';
import StatusBadge from '../../affiliate/components/StatusBadge';
import { adminAffiliateApi } from '../../affiliate/adminAffiliateApi';
import { downloadPayoutBatchCsv } from '../../lib/payoutBatchCsv';
import { formatCents } from '../../lib/formatCurrency';
import { DASHBOARD_INPUT } from '../../lib/dashboardFormClasses';
import type {
  AffiliateProgramSettings,
  PayoutBatch,
  PayoutCandidate,
  PayoutMethodType,
} from '../../affiliate/types';

type Overview = { candidates: PayoutCandidate[]; batches: PayoutBatch[]; settings: AffiliateProgramSettings };

const METHOD_LABEL: Record<PayoutMethodType, string> = { bank_transfer: 'Bank Transfer', paypal: 'PayPal', wise: 'Wise' };
const d = (iso?: string | null) => (iso ? format(new Date(iso), 'MMM d, yyyy') : '—');

export default function AdminPayouts() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paidTarget, setPaidTarget] = useState<PayoutBatch | null>(null);
  const [reference, setReference] = useState('');
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminAffiliateApi<Overview>('/api/admin/payouts'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const min = data?.settings.minimumPayoutCents ?? 5000;
  const eligible = useMemo(() => (data?.candidates ?? []).filter((c) => c.eligible), [data]);
  const eligibleTotal = eligible.reduce((t, c) => t + c.approvedCents, 0);
  const awaiting = (data?.batches ?? []).filter((b) => b.status === 'processing');
  const awaitingTotal = awaiting.reduce((t, b) => t + b.totalCents, 0);

  async function generate() {
    setGenerating(true);
    try {
      const { batch } = await adminAffiliateApi<{ batch: PayoutBatch }>('/api/admin/payouts/batches', { method: 'POST' });
      downloadPayoutBatchCsv(batch);
      toast.success(`${batch.id} generated: ${batch.items.length} affiliates, ${formatCents(batch.totalCents)}. CSV downloaded.`);
      setConfirmOpen(false);
      setExpanded(batch.id);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not generate batch');
    } finally {
      setGenerating(false);
    }
  }

  async function markPaid() {
    if (!paidTarget || reference.trim().length < 4) return;
    setMarking(true);
    try {
      await adminAffiliateApi(`/api/admin/payouts/batches/${encodeURIComponent(paidTarget.id)}/paid`, {
        method: 'POST',
        body: { reference: reference.trim() },
      });
      toast.success(`${paidTarget.id} marked as paid`);
      setPaidTarget(null);
      setReference('');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not mark batch as paid');
    } finally {
      setMarking(false);
    }
  }

  function blockedLabel(c: PayoutCandidate) {
    if (c.blockedReason === 'below_threshold') return `${formatCents(min - c.approvedCents)} to go`;
    if (c.blockedReason === 'no_payout_method') return 'No payout method';
    if (c.blockedReason === 'suspended') return 'Suspended';
    return 'Eligible';
  }

  const kpis = [
    { label: 'Eligible Affiliates', value: String(eligible.length), hint: `${(data?.candidates.length ?? 0) - eligible.length} not yet eligible`, icon: Users, tone: 'text-brand-700 dark:text-brand-400' },
    { label: 'Payable This Run', value: formatCents(eligibleTotal), hint: 'Approved & above threshold', icon: BadgeDollarSign, tone: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Awaiting Transfer', value: formatCents(awaitingTotal), hint: `${awaiting.length} batch${awaiting.length === 1 ? '' : 'es'} processing`, icon: Hourglass, tone: 'text-amber-700 dark:text-amber-300' },
    { label: 'Minimum Payout', value: formatCents(min), hint: 'Set in program settings', icon: Landmark, tone: 'text-stone-900 dark:text-zinc-100' },
  ];

  return (
    <AdminLayout>
      <div className="mb-5 lg:mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between min-w-0">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
            <Layers className="h-4 w-4" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-widest">Affiliate Program</span>
          </div>
          <h1 className={adminTheme.pageTitle}>Payouts</h1>
          <p className={adminTheme.pageSubtitle}>
            Build the monthly payment batch, export it for your bank or PayPal, then log the transfer reference.
          </p>
        </div>
        <button
          type="button"
          disabled={loading || eligible.length === 0 || generating}
          onClick={() => setConfirmOpen(true)}
          className={`${adminTheme.btnPrimary} inline-flex w-full shrink-0 items-center justify-center gap-2 lg:w-auto`}
        >
          <Wand2 className="h-4 w-4 shrink-0" />
          Generate Monthly Batch
        </button>
      </div>

      {loading && !data ? (
        <AdminLoading />
      ) : data ? (
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

          <section className={`${adminTheme.card} mb-6 lg:mb-8 overflow-hidden min-w-0`}>
            <div className={`${adminTheme.cardHeader} flex flex-wrap items-center justify-between gap-2 px-4 py-3 lg:px-5 lg:py-4`}>
              <div>
                <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Next Run Preview</h2>
                <p className={`mt-0.5 text-[11px] lg:text-xs ${adminTheme.muted}`}>
                  Affiliates with approved balances. Only those at or above {formatCents(min)} with a payout method are included.
                </p>
              </div>
              <Link to="/admin/affiliate-settings" className={`inline-flex items-center gap-1.5 text-xs no-underline ${adminTheme.link}`}>
                <Settings2 className="h-3.5 w-3.5" />
                Threshold settings
              </Link>
            </div>

            {data.candidates.length === 0 ? (
              <div className={`px-4 py-12 text-center ${adminTheme.muted}`}>
                <CalendarClock className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm font-semibold">Nothing approved yet</p>
                <p className="mt-0.5 text-xs">Commissions appear here once their {data.settings.holdPeriodDays}-day hold is released.</p>
              </div>
            ) : (
              <ul className={`divide-y ${adminTheme.divide}`}>
                {data.candidates.map((c) => {
                  const pct = Math.min(100, Math.round((c.approvedCents / min) * 100));
                  return (
                    <li key={c.affiliateId} className="flex flex-col gap-3 px-4 py-3.5 lg:flex-row lg:items-center lg:gap-6 lg:px-5">
                      <div className="min-w-0 lg:w-64">
                        <Link to={`/admin/affiliates/${c.affiliateId}`} className={`block truncate ${adminTheme.link}`}>
                          {c.affiliateName}
                        </Link>
                        <p className={`truncate text-xs ${adminTheme.muted}`}>
                          @{c.affiliateHandle} · {c.method ? `${METHOD_LABEL[c.method]} •••• ${c.last4}` : 'No payout method'}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-bold tabular-nums text-stone-900 dark:text-zinc-100">{formatCents(c.approvedCents)}</span>
                          <span className={adminTheme.muted}>
                            {c.commissionCount} commission{c.commissionCount === 1 ? '' : 's'} · min {formatCents(min)}
                          </span>
                        </div>
                        <div
                          className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-zinc-800"
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${c.affiliateName} progress toward minimum payout`}
                        >
                          <div
                            className={`h-full rounded-full transition-all ${
                              c.eligible ? 'bg-gradient-to-r from-brand-500 to-brand-600' : 'bg-stone-300 dark:bg-zinc-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="lg:w-36 lg:text-end">
                        {c.eligible ? (
                          <span className={`${adminTheme.badgeActive} gap-1`}>
                            <CircleCheck className="h-3 w-3" />
                            Eligible
                          </span>
                        ) : (
                          <span className={c.blockedReason === 'below_threshold' ? adminTheme.badgeBase + ' bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300' : adminTheme.badgePending}>
                            {blockedLabel(c)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={`${adminTheme.card} overflow-hidden min-w-0`}>
            <div className={`${adminTheme.cardHeader} px-4 py-3 lg:px-5 lg:py-4`}>
              <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Batch History</h2>
              <p className={`mt-0.5 text-[11px] lg:text-xs ${adminTheme.muted}`}>
                Download the CSV for your bank or PayPal mass payment, then log the transaction reference to disburse every attached commission.
              </p>
            </div>

            {data.batches.length === 0 ? (
              <p className={`px-4 py-12 text-center text-sm ${adminTheme.muted}`}>No batches generated yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className={adminTheme.theadRow}>
                      <th className={`${adminTheme.th} w-10`} />
                      <th className={adminTheme.th}>Batch</th>
                      <th className={adminTheme.th}>Created</th>
                      <th className={adminTheme.th}>Affiliates</th>
                      <th className={adminTheme.th}>Total</th>
                      <th className={adminTheme.th}>Reference</th>
                      <th className={adminTheme.th}>Status</th>
                      <th className={adminTheme.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={adminTheme.tbodyDivide}>
                    {data.batches.map((b) => {
                      const open = expanded === b.id;
                      return (
                        <Fragment key={b.id}>
                          <tr className={adminTheme.rowHover}>
                            <td className="ps-3">
                              <button
                                type="button"
                                onClick={() => setExpanded(open ? null : b.id)}
                                aria-expanded={open}
                                aria-label={`${open ? 'Collapse' : 'Expand'} ${b.id}`}
                                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                              </button>
                            </td>
                            <td className={adminTheme.td}>
                              <p className="font-semibold text-stone-900 dark:text-zinc-100">{b.label}</p>
                              <p className={`text-xs ${adminTheme.muted}`}>{b.id}</p>
                            </td>
                            <td className={`${adminTheme.td} tabular-nums`}>{d(b.createdAt)}</td>
                            <td className={`${adminTheme.td} tabular-nums`}>{b.items.length}</td>
                            <td className={`${adminTheme.td} font-bold tabular-nums text-stone-900 dark:text-zinc-100`}>{formatCents(b.totalCents)}</td>
                            <td className={`${adminTheme.td} font-mono text-xs`}>
                              {b.reference ?? <span className={`font-sans ${adminTheme.muted}`}>Awaiting transfer</span>}
                              {b.paidAt ? <p className={`font-sans ${adminTheme.muted}`}>Paid {d(b.paidAt)}</p> : null}
                            </td>
                            <td className={adminTheme.td}>
                              <StatusBadge status={b.status === 'paid' ? 'paid' : 'processing'} context="payout" />
                            </td>
                            <td className={adminTheme.td}>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => downloadPayoutBatchCsv(b)}
                                  className={`${adminTheme.btnSecondary} inline-flex items-center gap-1.5 !px-2.5 !py-1.5 text-xs`}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  CSV
                                </button>
                                {b.status === 'processing' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPaidTarget(b);
                                      setReference('');
                                    }}
                                    className={`${adminTheme.btnPrimary} inline-flex items-center gap-1.5 !px-2.5 !py-1.5 text-xs`}
                                  >
                                    <CircleCheck className="h-3.5 w-3.5" />
                                    Mark as Paid
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                          {open ? (
                            <tr>
                              <td colSpan={8} className="bg-stone-50/70 px-4 py-4 dark:bg-zinc-800/30 lg:px-6">
                                <p className={`mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${adminTheme.muted}`}>
                                  <FileSpreadsheet className="h-3.5 w-3.5" />
                                  Payment lines
                                </p>
                                <ul className="grid gap-2 lg:grid-cols-2">
                                  {b.items.map((i) => (
                                    <li
                                      key={i.affiliateId}
                                      className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900"
                                    >
                                      <div className="min-w-0">
                                        <Link to={`/admin/affiliates/${i.affiliateId}`} className={`block truncate text-sm ${adminTheme.link}`}>
                                          {i.affiliateName}
                                        </Link>
                                        <p className={`truncate text-xs ${adminTheme.muted}`}>
                                          {METHOD_LABEL[i.method]} •••• {i.last4} · {i.commissionIds.length} commission{i.commissionIds.length === 1 ? '' : 's'}
                                        </p>
                                      </div>
                                      <span className="shrink-0 text-sm font-bold tabular-nums text-stone-900 dark:text-zinc-100">{formatCents(i.amountCents)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Generate Monthly Batch?"
        message={`This attaches ${eligible.length} affiliate${eligible.length === 1 ? '' : 's'} and ${formatCents(eligibleTotal)} of approved commissions to a new batch, then downloads the payout CSV. Attached commissions are locked from reversal until the batch is marked as paid.`}
        confirmLabel={generating ? 'Generating...' : 'Generate & Download CSV'}
        cancelLabel="Cancel"
        loading={generating}
        adminBusy
        onConfirm={() => void generate()}
        onCancel={() => !generating && setConfirmOpen(false)}
      />

      <AdminModal
        open={!!paidTarget}
        title="Mark Batch as Paid"
        description={paidTarget ? `${paidTarget.id} · ${paidTarget.items.length} affiliates · ${formatCents(paidTarget.totalCents)}` : undefined}
        busy={marking}
        onClose={() => !marking && setPaidTarget(null)}
        footer={
          <>
            <button type="button" disabled={marking} onClick={() => setPaidTarget(null)} className={`w-full sm:flex-1 ${adminTheme.btnSecondary}`}>
              Cancel
            </button>
            <button
              type="button"
              disabled={marking || reference.trim().length < 4}
              onClick={() => void markPaid()}
              className={`flex w-full sm:flex-1 items-center justify-center gap-2 ${adminTheme.btnPrimary}`}
            >
              {marking ? <AdminLoadingInline light dotsOnly /> : null}
              <span>{marking ? 'Saving...' : 'Confirm Payment'}</span>
            </button>
          </>
        }
      >
        <div className={adminTheme.alertWarn}>
          <CircleCheck className="h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            Every commission attached to this batch will be marked <strong>paid</strong>, and affiliates will see the reference in their payout history. This cannot be undone.
          </p>
        </div>
        <div>
          <label htmlFor="payout-reference" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
            Transaction reference <span className="text-red-600">*</span>
          </label>
          <input
            id="payout-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={64}
            autoFocus
            placeholder="e.g. ACH-STL-98234 or PayPal batch ID"
            className={`${DASHBOARD_INPUT} font-mono`}
          />
          <p className={`mt-1.5 text-xs ${adminTheme.muted}`}>Use the bank or PayPal mass-payment reference so the transfer can be reconciled later.</p>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
