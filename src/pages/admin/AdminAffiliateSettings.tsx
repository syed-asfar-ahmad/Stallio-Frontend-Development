import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Percent, Clock, CalendarCheck, Banknote, ShieldBan, Plus, X, Lock, RotateCcw, Settings2, Info } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading, { AdminLoadingInline } from '../../components/admin/AdminLoading';
import { adminTheme } from '../../components/admin/adminTheme';
import { adminAffiliateApi } from '../../affiliate/adminAffiliateApi';
import { formatBps, formatCents } from '../../lib/formatCurrency';
import { getBuiltInReservedSlugs, normalizeSlug } from '../../lib/reservedWords';
import { DASHBOARD_INPUT } from '../../lib/dashboardFormClasses';
import type { AffiliateProgramSettings } from '../../affiliate/types';

type Form = { rate: string; hold: string; deadline: string; minimum: string };

const toForm = (s: AffiliateProgramSettings): Form => ({
  rate: String(s.rateBps / 100),
  hold: String(s.holdPeriodDays),
  deadline: String(s.payDeadlineDays),
  minimum: (s.minimumPayoutCents / 100).toFixed(2),
});

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function AdminAffiliateSettings() {
  const [saved, setSaved] = useState<AffiliateProgramSettings | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [wordError, setWordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const builtIn = useMemo(() => getBuiltInReservedSlugs(), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await adminAffiliateApi<AffiliateProgramSettings>('/api/admin/affiliate-settings');
      setSaved(s);
      setForm(toForm(s));
      setWords(s.customReservedWords ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const parsed = useMemo(() => {
    if (!form) return null;
    return {
      rateBps: Math.round(parseFloat(form.rate) * 100),
      holdPeriodDays: parseInt(form.hold, 10),
      payDeadlineDays: parseInt(form.deadline, 10),
      minimumPayoutCents: Math.round(parseFloat(form.minimum) * 100),
    };
  }, [form]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!parsed) return e;
    if (!Number.isFinite(parsed.rateBps) || parsed.rateBps < 100 || parsed.rateBps > 5000) e.rate = 'Enter a rate between 1% and 50%.';
    if (!Number.isFinite(parsed.holdPeriodDays) || parsed.holdPeriodDays < 0 || parsed.holdPeriodDays > 180) e.hold = 'Enter 0 to 180 days.';
    if (!Number.isFinite(parsed.payDeadlineDays) || parsed.payDeadlineDays < 7 || parsed.payDeadlineDays > 365) e.deadline = 'Enter 7 to 365 days.';
    if (!Number.isFinite(parsed.minimumPayoutCents) || parsed.minimumPayoutCents < 500 || parsed.minimumPayoutCents > 1_000_000)
      e.minimum = 'Enter $5.00 to $10,000.00.';
    return e;
  }, [parsed]);

  const dirty = useMemo(() => {
    if (!saved || !parsed) return false;
    return (
      parsed.rateBps !== saved.rateBps ||
      parsed.holdPeriodDays !== saved.holdPeriodDays ||
      parsed.payDeadlineDays !== saved.payDeadlineDays ||
      parsed.minimumPayoutCents !== saved.minimumPayoutCents ||
      JSON.stringify(words) !== JSON.stringify(saved.customReservedWords ?? [])
    );
  }, [saved, parsed, words]);

  const valid = Object.keys(errors).length === 0;

  function addWord() {
    const w = normalizeSlug(wordInput);
    if (!w) return;
    if (w.length < 2 || w.length > 20 || !SLUG_RE.test(w)) {
      setWordError('Use 2–20 characters: lowercase letters, numbers and single hyphens.');
      return;
    }
    if (builtIn.includes(w) || words.includes(w)) {
      setWordError('Already reserved.');
      return;
    }
    setWords((prev) => [...prev, w]);
    setWordInput('');
    setWordError(null);
  }

  async function save() {
    if (!parsed || !valid || !dirty) return;
    setSaving(true);
    try {
      const next = await adminAffiliateApi<AffiliateProgramSettings>('/api/admin/affiliate-settings', {
        method: 'PUT',
        body: { ...parsed, customReservedWords: words },
      });
      setSaved(next);
      setForm(toForm(next));
      setWords(next.customReservedWords ?? []);
      toast.success('Program settings saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    if (!saved) return;
    setForm(toForm(saved));
    setWords(saved.customReservedWords ?? []);
    setWordInput('');
    setWordError(null);
  }

  if (loading && !form) {
    return (
      <AdminLayout>
        <AdminLoading />
      </AdminLayout>
    );
  }
  if (!form || !parsed) return <AdminLayout>{null}</AdminLayout>;

  const fields: {
    key: keyof Form;
    label: string;
    help: string;
    suffix: string;
    icon: typeof Percent;
    step: string;
    live: string;
  }[] = [
    {
      key: 'rate',
      label: 'Default Commission Rate',
      help: 'One-time share of a referred seller’s first paid plan.',
      suffix: '%',
      icon: Percent,
      step: '0.25',
      live: Number.isFinite(parsed.rateBps) ? `${parsed.rateBps} bps · Basic $5 pays ${formatCents(Math.round((500 * parsed.rateBps) / 10_000))}, Yearly $50 pays ${formatCents(Math.round((5000 * parsed.rateBps) / 10_000))}` : '',
    },
    {
      key: 'hold',
      label: 'Hold Period',
      help: 'Days a commission stays pending before it becomes payable. Covers the refund window.',
      suffix: 'days',
      icon: Clock,
      step: '1',
      live: 'Commissions release automatically after this period.',
    },
    {
      key: 'deadline',
      label: 'Pay Qualification Deadline',
      help: 'Days after signup the seller must make a first paid plan for the referral to qualify.',
      suffix: 'days',
      icon: CalendarCheck,
      step: '1',
      live: 'Payments after this window earn no commission.',
    },
    {
      key: 'minimum',
      label: 'Minimum Payout Threshold',
      help: 'Approved balance an affiliate needs before they appear in a monthly batch.',
      suffix: 'USD',
      icon: Banknote,
      step: '0.01',
      live: Number.isFinite(parsed.minimumPayoutCents) ? `Batches include balances of ${formatCents(parsed.minimumPayoutCents)} or more.` : '',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-5 lg:mb-6 min-w-0">
        <div className="mb-1 flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
          <Settings2 className="h-4 w-4" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-widest">Affiliate Program</span>
        </div>
        <h1 className={adminTheme.pageTitle}>Program Settings</h1>
        <p className={adminTheme.pageSubtitle}>Rates, hold windows, payout thresholds, and reserved custom slugs.</p>
      </div>

      <div className={`${adminTheme.alertWarn} mb-5 items-start`}>
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-xs leading-relaxed">
          Changes apply to <strong>new</strong> commissions only. Existing commissions keep the rate and hold date they were created with.
        </p>
      </div>

      <div className="grid gap-4 lg:gap-6 xl:grid-cols-5 min-w-0">
        <section className={`${adminTheme.card} xl:col-span-3 min-w-0`}>
          <div className={adminTheme.cardHeader}>
            <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Commission Rules</h2>
          </div>
          <div className="grid gap-5 p-4 sm:grid-cols-2 lg:p-5">
            {fields.map((f) => {
              const err = errors[f.key];
              return (
                <div key={f.key} className="min-w-0">
                  <label htmlFor={`aff-${f.key}`} className="mb-1.5 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-zinc-300">
                    <f.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    {f.label}
                  </label>
                  <div className="relative">
                    <input
                      id={`aff-${f.key}`}
                      type="number"
                      inputMode="decimal"
                      step={f.step}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      aria-invalid={!!err}
                      aria-describedby={`aff-${f.key}-help`}
                      disabled={saving}
                      className={`${DASHBOARD_INPUT} dashboard-no-spin pe-16 tabular-nums ${err ? '!border-red-400 focus:!border-red-500 focus:!ring-red-500/10' : ''}`}
                    />
                    <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 dark:text-zinc-500">
                      {f.suffix}
                    </span>
                  </div>
                  <p id={`aff-${f.key}-help`} className={`mt-1.5 text-xs leading-relaxed ${err ? 'font-medium text-red-600 dark:text-red-400' : adminTheme.muted}`}>
                    {err ?? f.help}
                  </p>
                  {!err && f.live ? <p className="mt-1 text-[11px] font-medium text-brand-700 dark:text-brand-400">{f.live}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <aside className={`${adminTheme.card} xl:col-span-2 min-w-0 self-start`}>
          <div className={adminTheme.cardHeader}>
            <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Live Preview</h2>
          </div>
          <div className="space-y-3 p-4 lg:p-5">
            <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white shadow-sm">
              <p className="text-xs font-medium text-white/80">Seller pays Business Yearly ($50)</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{valid ? formatCents(Math.round((5000 * parsed.rateBps) / 10_000)) : '—'}</p>
              <p className="mt-1 text-xs text-white/80">
                {valid ? `${formatBps(parsed.rateBps)} commission, payable ${parsed.holdPeriodDays} days later` : 'Fix the highlighted fields'}
              </p>
            </div>
            <ol className="space-y-2 text-xs text-stone-600 dark:text-zinc-300">
              {[
                `Seller signs up with the affiliate’s code`,
                `Must pay within ${Number.isFinite(parsed.payDeadlineDays) ? parsed.payDeadlineDays : '–'} days to qualify`,
                `Commission held ${Number.isFinite(parsed.holdPeriodDays) ? parsed.holdPeriodDays : '–'} days, then approved`,
                `Paid in the monthly batch once balance ≥ ${Number.isFinite(parsed.minimumPayoutCents) ? formatCents(parsed.minimumPayoutCents) : '–'}`,
              ].map((t, i) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <section className={`${adminTheme.card} xl:col-span-5 min-w-0`}>
          <div className={`${adminTheme.cardHeader} flex items-center gap-2`}>
            <ShieldBan className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <div>
              <h2 className="text-sm lg:text-base font-semibold text-stone-900 dark:text-zinc-100">Reserved Words</h2>
              <p className={`mt-0.5 text-[11px] lg:text-xs ${adminTheme.muted}`}>
                Blocked as affiliate codes and seller usernames so they never collide with platform routes.
              </p>
            </div>
          </div>
          <div className="space-y-5 p-4 lg:p-5">
            <div>
              <label htmlFor="reserved-word" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-zinc-300">
                Add a reserved word
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="reserved-word"
                  value={wordInput}
                  onChange={(e) => {
                    setWordInput(e.target.value);
                    setWordError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addWord();
                    }
                  }}
                  placeholder="e.g. promo"
                  maxLength={20}
                  disabled={saving}
                  aria-invalid={!!wordError}
                  className={`${DASHBOARD_INPUT} sm:max-w-xs ${wordError ? '!border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={addWord}
                  disabled={saving || !wordInput.trim()}
                  className={`${adminTheme.btnSecondary} inline-flex items-center justify-center gap-1.5 !py-3`}
                >
                  <Plus className="h-4 w-4" />
                  Add Word
                </button>
              </div>
              {wordError ? <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{wordError}</p> : null}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-stone-700 dark:text-zinc-300">
                Custom words <span className={adminTheme.muted}>({words.length})</span>
              </p>
              {words.length === 0 ? (
                <p className={`text-xs ${adminTheme.muted}`}>No custom words. Add any term you want blocked.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {words.map((w) => (
                    <li key={w} className="inline-flex items-center gap-1 rounded-lg bg-brand-100 py-1 pe-1 ps-2.5 text-xs font-semibold text-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
                      {w}
                      <button
                        type="button"
                        onClick={() => setWords((prev) => prev.filter((x) => x !== w))}
                        disabled={saving}
                        aria-label={`Remove ${w}`}
                        className="rounded p-0.5 hover:bg-brand-200/70 dark:hover:bg-brand-900/60"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <details className="group rounded-xl border border-stone-200 bg-stone-50/60 dark:border-zinc-700 dark:bg-zinc-800/30">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-stone-700 dark:text-zinc-300">
                <Lock className="h-4 w-4 text-stone-400 dark:text-zinc-500" />
                Built-in platform words ({builtIn.length})
                <span className={`ms-auto text-xs ${adminTheme.muted}`}>locked</span>
              </summary>
              <ul className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto px-4 pb-4">
                {builtIn.map((w) => (
                  <li key={w} className={adminTheme.chip}>
                    {w}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 z-20 -mx-3 mt-6 border-t border-stone-200 bg-white/90 px-3 py-3 backdrop-blur-md sm:-mx-4 sm:px-4 lg:-mx-8 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-xs ${dirty ? 'font-medium text-amber-700 dark:text-amber-300' : adminTheme.muted}`}>
            {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={reset} disabled={!dirty || saving} className={`${adminTheme.btnSecondary} inline-flex items-center justify-center gap-1.5`}>
              <RotateCcw className="h-4 w-4" />
              Discard
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!dirty || !valid || saving}
              className={`${adminTheme.btnPrimary} inline-flex items-center justify-center gap-2`}
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : null}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
