import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth, getStoredToken } from '../context/AuthContext';
import { api } from '../lib/api';
import PublicLayout from '../components/PublicLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type VerifyState = {
  email?: string;
  logoFile?: File | null;
  emailDeliveryFailed?: boolean;
};

export default function VerifyEmail() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as VerifyState | null) ?? {};
  const email = (state.email ?? '').trim().toLowerCase();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendVerification, fetchUser } = useAuth();

  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (state.emailDeliveryFailed) {
      toast.error(t('auth.verify.emailDeliveryFailed'));
    }
  }, [state.emailDeliveryFailed, t]);

  async function uploadLogoIfNeeded(logoFile: File | null | undefined) {
    if (!logoFile) return;
    const token = getStoredToken();
    if (!token) return;
    const form = new FormData();
    form.append('file', logoFile);
    form.append('type', 'logo');
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (res.ok && data.url) {
      await api('/api/user', { method: 'PATCH', body: { logo: data.url, logoPublicId: data.publicId } });
      await fetchUser();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError('');
    setSubmitting(true);
    const { error: err } = await verifyEmail(email, code.trim());
    if (err) {
      setSubmitting(false);
      setError(err);
      return;
    }
    try {
      await uploadLogoIfNeeded(state.logoFile);
    } catch {
      toast.error(t('auth.signup.logoUploadFailed'));
    }
    setSubmitting(false);
    toast.success(t('auth.verify.toastVerified'));
    navigate('/dashboard');
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    const { error: err } = await resendVerification(email);
    setResending(false);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success(t('auth.verify.toastResent'));
  }

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  if (!email) return null;

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-stone-50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(91,69,229,0.14),transparent_55%)] dark:opacity-40"
          aria-hidden
        />
        <div className="relative w-full min-w-0 max-w-[min(100%,22rem)] shrink-0 text-center sm:max-w-md">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600 sm:text-[0.8125rem] sm:tracking-[0.16em] dark:text-brand-400">
            {t('auth.verify.eyebrow')}
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 sm:mt-2 sm:text-3xl dark:text-zinc-100">
            {t('auth.verify.title')}
          </h1>
          <p className="mt-2 text-sm font-medium text-stone-600 sm:text-base dark:text-zinc-400">
            {t('auth.verify.subtitle')}
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-stone-900 sm:text-base dark:text-zinc-100" dir="ltr">
            {email}
          </p>

          <div className="mt-4 rounded-2xl border border-stone-200/90 bg-white/95 p-5 text-start shadow-[0_16px_48px_-36px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm sm:mt-5 sm:rounded-3xl sm:p-7 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/95 p-3 text-xs font-medium text-red-800 sm:gap-3 sm:p-4 sm:text-sm dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[0.65rem] font-bold text-red-600 sm:h-6 sm:w-6 sm:text-xs dark:bg-red-900/60 dark:text-red-300">
                    !
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="verify-code" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                  {t('auth.verify.code')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoComplete="one-time-code"
                    placeholder={t('auth.verify.codePlaceholder')}
                    className={`${inputClass} ps-11 pe-3 text-center text-lg font-bold tracking-[0.35em] sm:ps-12 sm:pe-4 sm:text-xl`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="home-btn-primary group relative mt-0.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
              >
                {submitting ? t('auth.verify.verifying') : t('auth.verify.submit')}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 sm:mt-6 sm:pt-5 dark:border-zinc-700">
              <Link
                to="/login"
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
                {t('auth.verify.backToSignIn')}
              </Link>
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={resending}
                className="cursor-pointer text-sm font-bold text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {resending ? t('auth.verify.resending') : t('auth.verify.resend')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
