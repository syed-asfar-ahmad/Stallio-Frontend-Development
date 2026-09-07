import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Lock, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getPasswordStrength(pwd: string): {
  score: number;
  strengthKey: 'weak' | 'fair' | 'good' | 'strong' | null;
  color: string;
} {
  if (!pwd) return { score: 0, strengthKey: null, color: '' };
  const hasMinLen = pwd.length >= 8;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const score = [hasMinLen, hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { score, strengthKey: 'weak', color: 'bg-red-500' };
  if (score === 2) return { score, strengthKey: 'fair', color: 'bg-amber-500' };
  if (score === 3) return { score, strengthKey: 'good', color: 'bg-lime-500' };
  return { score, strengthKey: 'strong', color: 'bg-brand-500' };
}

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { score, strengthKey, color } = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t('auth.reset.toastPasswordMismatch'));
      return;
    }
    if (password.length < 8) {
      toast.error(t('auth.reset.toastMinLength'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error || t('auth.reset.toastResetFailed'));
        return;
      }
      toast.success(data.message || t('auth.reset.toastPasswordUpdated'));
      navigate('/login', { replace: true });
    } catch {
      toast.error(t('auth.common.networkError'));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3.5 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  if (!token) {
    return (
      <PublicLayout hideFooter>
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-stone-50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center sm:px-6 sm:py-6 dark:bg-zinc-950">
          <h1 className="text-pretty text-xl font-extrabold text-stone-900 max-lg:text-xl sm:text-2xl dark:text-zinc-100">{t('auth.reset.invalidTitle')}</h1>
          <p className="mt-2 max-w-sm text-sm text-stone-600 dark:text-zinc-400">{t('auth.reset.invalidBody')}</p>
          <Link to="/forgot-password" className="mt-6 text-sm font-bold text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300">
            {t('auth.reset.requestReset')}
          </Link>
          <Link to="/login" className="mt-3 text-sm font-semibold text-stone-600 underline decoration-stone-300 underline-offset-2 dark:text-zinc-400 dark:decoration-zinc-600">
            {t('auth.reset.backToSignIn')}
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-stone-50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(91,69,229,0.14),transparent_55%)] dark:opacity-40"
          aria-hidden
        />
        <div className="relative w-full max-w-md text-center">
          <p className="text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
            {t('auth.reset.eyebrow')}
          </p>
          <h1 className="mt-2 text-pretty text-2xl font-extrabold tracking-tight text-stone-900 max-lg:text-2xl sm:text-3xl dark:text-zinc-100">
            {t('auth.reset.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-stone-600 sm:text-base dark:text-zinc-400">
            {t('auth.reset.subtitle')}
          </p>

          <div className="mt-6 rounded-[1.35rem] border border-stone-200/90 bg-white/95 p-6 text-start shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm sm:rounded-3xl sm:p-8 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="rp-password" className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">
                  {t('auth.reset.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                  <input
                    id="rp-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={t('auth.reset.placeholderMin8')}
                    className={`${inputClass} ps-12 pe-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={showPassword ? t('auth.reset.hidePassword') : t('auth.reset.showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordFocused && password ? (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? color : 'bg-stone-200 dark:bg-zinc-600'}`} />
                      ))}
                    </div>
                    <p
                      className={`mt-1.5 text-xs font-medium ${
                        score <= 1 ? 'text-red-600' : score === 2 ? 'text-amber-600' : score === 3 ? 'text-lime-600' : 'text-brand-600'
                      }`}
                    >
                      {t('auth.signup.passwordStrength')} {strengthKey ? t(`auth.signup.strength.${strengthKey}`) : ''}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-[0.7rem] text-stone-500 sm:text-xs dark:text-zinc-500">
                      <li className={password.length >= 8 ? 'text-brand-600' : ''}>{t('auth.signup.rules.min8')}</li>
                      <li className={/[a-z]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.lower')}</li>
                      <li className={/[A-Z]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.upper')}</li>
                      <li className={/[0-9]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.number')}</li>
                      <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.special')}</li>
                    </ul>
                  </div>
                ) : null}
              </div>
              <div>
                <label htmlFor="rp-confirm" className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">
                  {t('auth.reset.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                  <input
                    id="rp-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={t('auth.reset.placeholderRepeat')}
                    className={`${inputClass} ps-12 pe-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={showConfirmPassword ? t('auth.reset.hidePassword') : t('auth.reset.showPassword')}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="home-btn-primary group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:opacity-60 sm:py-4 sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <LogIn className="h-5 w-5 shrink-0" aria-hidden />
                  {submitting ? t('auth.reset.saving') : t('auth.reset.updatePassword')}
                </span>
              </button>
            </form>
            <p className="mt-5 text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
                {t('auth.reset.backToSignIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
