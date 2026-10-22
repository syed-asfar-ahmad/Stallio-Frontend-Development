import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAffiliateAuth } from '../AffiliateAuthContext';
import PublicLayout from '../../components/PublicLayout';

export default function AffiliateVerifyEmail() {
  const { t } = useTranslation();
  const tx = (key: string, options?: Record<string, unknown>) => t(`affiliate.${key}`, options);
  const location = useLocation();
  const navigate = useNavigate();
  const stateEmail = ((location.state as { email?: string } | null)?.email ?? '').trim().toLowerCase();

  const [email, setEmail] = useState(stateEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  const { verifyEmail, resendVerification } = useAffiliateAuth();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !code.trim()) return;

    setError('');
    setSubmitting(true);
    const result = await verifyEmail(email, code.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast.success(tx('verifiedSuccess'));
    navigate('/affiliate/dashboard');
  }

  async function handleResend() {
    if (cooldown > 0 || resending || !email) return;
    setResending(true);
    setError('');
    const result = await resendVerification(email);
    setResending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setCooldown(60);
    toast.success(tx('codeDispatched'));
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
            <ShieldCheck className="h-7 w-7" />
          </div>

          <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600 sm:text-[0.8125rem] sm:tracking-[0.16em] dark:text-brand-400">
            {tx('verifyEyebrow')}
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 sm:mt-2 sm:text-3xl dark:text-zinc-100">
            {tx('verifyTitle')}
          </h1>
          <p className="mt-2 text-xs font-medium text-stone-600 sm:text-sm dark:text-zinc-400">
            {tx('verificationSent')}{' '}
            <strong className="text-stone-900 dark:text-zinc-100">{email || tx('yourEmail')}</strong>.
          </p>

          <div className="mt-4 rounded-2xl border border-stone-200/90 bg-white/95 p-5 text-start shadow-[0_16px_48px_-36px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm sm:mt-5 sm:rounded-3xl sm:p-7 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
            <form onSubmit={handleVerify} className="space-y-4">
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

              {!stateEmail && (
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                  >
                    {tx('email')}
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
              )}

              {/* 6-Digit OTP Input */}
              <div>
                <label
                  htmlFor="code"
                  className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                >
                  {tx('verificationCode')}
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-center font-mono text-2xl tracking-[0.35em] text-stone-900 placeholder:text-stone-300 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || code.length < 4}
                className="home-btn-primary group relative mt-0.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                  {submitting ? tx('verifying') : tx('confirmOpenPortal')}
                </span>
              </button>
            </form>

            {/* Resend Cooldown Section */}
            <div className="mt-5 flex flex-col items-center justify-center gap-2.5 border-t border-stone-100 pt-4 text-center text-xs font-medium dark:border-zinc-700">
              {cooldown > 0 ? (
                <p className="text-stone-500 dark:text-zinc-400">
                  {tx('resendIn', { seconds: cooldown })}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 inline-flex items-center gap-1.5"
                >
                  {resending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{tx('resendCode')}</span>
                </button>
              )}

              <Link
                to="/affiliate/signup"
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                <span>{tx('backToLogin')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
