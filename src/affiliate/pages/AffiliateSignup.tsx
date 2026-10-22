import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  Store,
} from 'lucide-react';
import { useAffiliateAuth } from '../AffiliateAuthContext';
import PublicLayout from '../../components/PublicLayout';

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
  if (score <= 1) return { score, label: 'weak', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'fair', color: 'bg-amber-500' };
  if (score === 3) return { score, label: 'good', color: 'bg-lime-500' };
  return { score, label: 'strong', color: 'bg-brand-500' };
}

export default function AffiliateSignup() {
  const { t } = useTranslation();
  const tx = (key: string, options?: Record<string, unknown>) => t(`affiliate.${key}`, options);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAffiliateAuth();
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

    if (!acceptedTerms) {
      setError(tx('acceptTermsError'));
      return;
    }

    setSubmitting(true);
    const result = await signup({
      name,
      email,
      password,
      acceptedTerms,
    });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast.success(tx('signupSuccess'));
    navigate('/affiliate/verify-email', {
      state: { email: result.email ?? email.trim().toLowerCase() },
    });
  }

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-stone-50 dark:bg-zinc-950">
        {/* Stallio Ambient Radial Background Glow */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(91,69,229,0.12),transparent_55%)] dark:opacity-40"
          aria-hidden
        />

        <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full min-w-0 max-w-xl px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600 sm:text-[0.8125rem] sm:tracking-[0.16em] dark:text-brand-400">
            {tx('signupEyebrow')}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 sm:mt-2 sm:text-3xl dark:text-zinc-100">
            {tx('signupTitle')}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-stone-600 sm:text-sm dark:text-zinc-400">
            {tx('signupDescription')}
          </p>

          <div className="mt-5 rounded-2xl border border-stone-200/90 bg-white/95 p-5 text-start shadow-[0_16px_48px_-36px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm sm:mt-7 sm:rounded-3xl sm:p-7 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
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

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                >
                  {tx('fullName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tx('namePlaceholder')}
                    required
                    className={`${inputClass} ps-11 pe-3 text-sm sm:ps-12 sm:pe-4 sm:text-base`}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                >
                  {tx('email')} <span className="text-red-500">*</span>
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

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tx('createStrongPassword')}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={`${inputClass} ps-11 pe-11 text-sm sm:ps-12 sm:pe-12 sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 sm:end-2.5 sm:rounded-xl sm:p-2 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={showPassword ? tx('hidePassword') : tx('showPassword')}
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200"
                >
                  {tx('confirmPassword')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tx('confirmPassword')}
                    required
                    minLength={8}
                    autoComplete="new-password"
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

              {/* Anti-Fraud & Terms Checkbox */}
              <div className="rounded-xl border border-stone-200/90 bg-stone-50/70 p-3.5 dark:border-zinc-700/80 dark:bg-zinc-800/40">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <span className="text-xs leading-relaxed text-stone-600 dark:text-zinc-300">
                    {tx('termsAgree')} {tx('termsDetail')}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="home-btn-primary group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                  {submitting ? tx('creatingAccount') : tx('createAffiliateAccount')}
                </span>
              </button>
            </form>

            {/* Bottom Cross-links */}
            <div className="mt-5 border-t border-stone-100 pt-4 text-center text-xs font-medium text-stone-600 sm:mt-6 sm:pt-5 sm:text-sm dark:border-zinc-700 dark:text-zinc-400 space-y-2">
              <p>
                {tx('alreadyHaveAccount')}{' '}
                <Link
                  to="/affiliate/login"
                  className="inline-flex items-center justify-center gap-1 font-bold text-brand-700 no-underline transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {tx('signInLink')}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180 sm:h-4 sm:w-4" aria-hidden />
                </Link>
              </p>
              <p className="text-stone-500 dark:text-zinc-400">
                {tx('merchantSignupPrompt')}{' '}
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1 font-semibold text-stone-700 hover:text-stone-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  <Store className="h-3 w-3" />
                  {tx('createMerchantShop')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
);
}
