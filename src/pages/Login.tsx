import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../components/PublicLayout';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('dashboard_suspended') === '1') {
      sessionStorage.removeItem('dashboard_suspended');
      const msg =
        'Your seller dashboard access has been suspended. Please contact the admin.';
      setError(msg);
      toast.error(msg);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: err, code, email: loginEmail, role } = await login(email, password);
    setSubmitting(false);
    if (err) {
      if (code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: loginEmail ?? email.trim().toLowerCase() } });
        return;
      }
      setError(err);
      toast.error(err);
      return;
    }
    toast.success(t('auth.login.toastWelcome'));
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  }

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-stone-50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(91,69,229,0.14),transparent_55%)] dark:opacity-40"
          aria-hidden
        />

        <div className="relative w-full min-w-0 max-w-[min(100%,22rem)] shrink-0 text-center sm:max-w-md">

          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600 sm:text-[0.8125rem] sm:tracking-[0.16em] dark:text-brand-400">
            {t('auth.login.welcomeBack')}
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 sm:mt-2 sm:text-3xl dark:text-zinc-100">
            {t('auth.login.title')}
          </h1>

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
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                  {t('auth.login.email')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    dir="ltr"
                    className={`${inputClass} ps-11 pe-3 text-sm sm:ps-12 sm:pe-4 sm:text-base [unicode-bidi:isolate]`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold text-stone-800 sm:text-sm dark:text-zinc-200">
                    {t('auth.login.password')} <span className="text-red-500">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="shrink-0 text-xs font-bold text-brand-700 no-underline hover:text-brand-800 sm:text-sm dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="current-password"
                    placeholder={t('auth.login.placeholderPassword')}
                    className={`${inputClass} ps-11 pe-11 text-sm sm:ps-12 sm:pe-12 sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 sm:end-2.5 sm:rounded-xl sm:p-2 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="home-btn-primary group relative mt-0.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-3.5 sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                  {submitting ? t('auth.login.signingIn') : t('auth.login.signIn')}
                </span>
              </button>
            </form>

            <p className="mt-5 border-t border-stone-100 pt-4 text-center text-xs font-medium text-stone-600 sm:mt-6 sm:pt-5 sm:text-sm dark:border-zinc-700 dark:text-zinc-400">
              {t('auth.login.newTo')}{' '}
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-1 font-bold text-brand-700 no-underline transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {t('auth.login.createShop')}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180 sm:h-4 sm:w-4" aria-hidden />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
