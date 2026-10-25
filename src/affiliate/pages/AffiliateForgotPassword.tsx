import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '../../components/PublicLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function AffiliateForgotPassword() {
  const { t } = useTranslation();
  const tx = (key: string, options?: Record<string, unknown>) => t(`affiliate.${key}`, options);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      if (API_BASE) {
        await fetch(`${API_BASE}/api/affiliate/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
      }
    } catch {
      // Gracefully continue
    }
    setSubmitting(false);
    setSent(true);
    toast.success(tx('instructionsDispatched'));
  }

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col items-center justify-center overflow-x-hidden bg-stone-50 px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-12 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(91,69,229,0.14),transparent_55%)] dark:opacity-40"
          aria-hidden
        />

        <div className="relative w-full min-w-0 max-w-[min(100%,22rem)] shrink-0 text-center sm:max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm ring-1 ring-brand-100 dark:bg-zinc-800 dark:text-brand-300 dark:ring-zinc-700">
            <KeyRound className="h-7 w-7" />
          </div>

          <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600 sm:text-[0.8125rem] sm:tracking-[0.16em] dark:text-brand-400">
            {tx('recoveryEyebrow')}
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 sm:mt-2 sm:text-3xl dark:text-zinc-100">
            {tx('recoveryTitle')}
          </h1>
          <p className="mt-2 text-xs font-medium text-stone-600 sm:text-sm dark:text-zinc-400">
            {tx('recoveryDescription')}
          </p>

          <div className="mt-4 rounded-2xl border border-stone-200/90 bg-white/95 p-5 text-start shadow-[0_16px_48px_-36px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm sm:mt-5 sm:rounded-3xl sm:p-7 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
            {sent ? (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                  {tx('instructionsDispatched')}
                </h3>
                <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                  {tx('recoverySent', { email })}
                </p>
                <div className="pt-2">
                  <Link
                    to="/affiliate/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    <span>{tx('returnToLogin')}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                  >
                    {tx('partnerEmail')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tx('emailPlaceholder')}
                      required
                      dir="ltr"
                      className={`${inputClass} ps-11 pe-3 text-sm sm:ps-12 sm:pe-4 sm:text-base [unicode-bidi:isolate]`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="home-btn-primary group relative mt-0.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
                >
                  <span className="relative z-[2] inline-flex items-center gap-2">
                    <KeyRound className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                    {submitting ? tx('sending') : tx('sendRecovery')}
                  </span>
                </button>

                <div className="pt-2 text-center">
                  <Link
                    to="/affiliate/login"
                    className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    <span>{tx('backToLogin')}</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
