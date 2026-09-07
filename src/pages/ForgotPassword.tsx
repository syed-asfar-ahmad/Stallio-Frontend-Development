import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error || t('auth.common.somethingWrong'));
        return;
      }
      navigate('/forgot-password/check-email', { replace: true });
    } catch {
      toast.error(t('auth.common.networkError'));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3.5 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-stone-50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(91,69,229,0.14),transparent_55%)] dark:opacity-40"
          aria-hidden
        />
        <div className="relative w-full max-w-md text-center">
          <p className="text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
            {t('auth.forgot.eyebrow')}
          </p>
          <h1 className="mt-2 text-pretty text-2xl font-extrabold tracking-tight text-stone-900 max-lg:text-2xl sm:text-3xl dark:text-zinc-100">
            {t('auth.forgot.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-stone-600 sm:text-base dark:text-zinc-400">
            {t('auth.forgot.subtitle')}
          </p>

          <div className="mt-6 rounded-[1.35rem] border border-stone-200/90 bg-white/95 p-6 text-start shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm sm:rounded-3xl sm:p-8 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">
                  {t('auth.forgot.email')}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    dir="ltr"
                    className={`${inputClass} ps-12 pe-4 [unicode-bidi:isolate]`}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="home-btn-primary group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:opacity-60 sm:py-4 sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <Send className="h-5 w-5 shrink-0" aria-hidden />
                  {submitting ? t('auth.forgot.sending') : t('auth.forgot.sendResetLink')}
                </span>
              </button>
            </form>

            <p className="mt-6 border-t border-stone-100 pt-5 text-center dark:border-zinc-700">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
                {t('auth.forgot.backToSignIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
