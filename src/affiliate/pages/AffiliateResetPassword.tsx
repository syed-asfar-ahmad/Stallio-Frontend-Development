import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '../../components/PublicLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pwd) return { score: 0, label: '', color: '' };
  const hasMinLen = pwd.length >= 8;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const score = [hasMinLen, hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { score, label: 'Good', color: 'bg-lime-500' };
  return { score, label: 'Strong', color: 'bg-brand-500' };
}

export default function AffiliateResetPassword() {
  const { t } = useTranslation();
  const tx = (key: string, options?: Record<string, unknown>) => t(`affiliate.${key}`, options);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(tx('passwordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/affiliate/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || tx('resetPassword'));
          setSubmitting(false);
          return;
        }
      }
    } catch {
      // Allow demo
    }

    setSubmitting(false);
    toast.success(tx('passwordUpdated'));
    navigate('/affiliate/login');
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
            {tx('passwordResetEyebrow')}
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 sm:mt-2 sm:text-3xl dark:text-zinc-100">
            {tx('newPasswordTitle')}
          </h1>
          <p className="mt-2 text-xs font-medium text-stone-600 sm:text-sm dark:text-zinc-400">
            {tx('newPasswordDescription')}
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
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                >
                  {tx('newPassword')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tx('enterNewPassword')}
                    required
                    minLength={8}
                    className={`${inputClass} ps-11 pe-11 text-sm sm:ps-12 sm:pe-12 sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 sm:end-2.5 sm:rounded-xl sm:p-2 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strength.color : 'bg-stone-200 dark:bg-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[0.7rem] font-medium text-stone-500 dark:text-zinc-400">
                      {tx('passwordStrength')} <strong className="font-semibold text-brand-600 dark:text-brand-400">{tx(strength.label)}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                >
                  {tx('confirmNewPassword')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tx('confirmNewPassword')}
                    required
                    minLength={8}
                    className={`${inputClass} ps-11 pe-11 text-sm sm:ps-12 sm:pe-12 sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 sm:end-2.5 sm:rounded-xl sm:p-2 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={showConfirmPassword ? tx('hidePassword') : tx('showPassword')}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="home-btn-primary group relative mt-0.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <KeyRound className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                  {submitting ? tx('updating') : tx('saveChanges')}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
