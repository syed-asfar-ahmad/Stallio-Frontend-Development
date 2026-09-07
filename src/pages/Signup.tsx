import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Select from 'react-select';
import {
  Mail,
  Lock,
  AtSign,
  Store,
  UserPlus,
  ArrowRight,
  Globe,
  Banknote,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth, getStoredToken } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import PublicLayout from '../components/PublicLayout';
import { getCountryOptionsList, getCurrencyOptionsList } from '../lib/countryCurrencyOptions';
import type { CountryOption, CurrencyOption } from '../lib/countryCurrencyOptions';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const ALLOWED_LOGO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const ALLOWED_LOGO_MIMES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function isValidSignupLogoFile(file: File): boolean {
  const name = file.name.trim().toLowerCase();
  const dot = name.lastIndexOf('.');
  if (dot < 1 || dot === name.length - 1) return false;
  const ext = name.slice(dot + 1);
  if (!ALLOWED_LOGO_EXTENSIONS.has(ext)) return false;
  const mime = (file.type || '').toLowerCase().split(';')[0].trim();
  if (mime && !ALLOWED_LOGO_MIMES.has(mime)) return false;
  return true;
}

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

function PasswordStrength({ password }: { password: string }) {
  const { t } = useTranslation();
  const { score, strengthKey, color } = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? color : 'bg-stone-200 dark:bg-zinc-600'}`}
          />
        ))}
      </div>
      <p
        className={`mt-1.5 text-xs font-medium ${
          score <= 1 ? 'text-red-600' : score === 2 ? 'text-amber-600' : score === 3 ? 'text-lime-600' : 'text-brand-600'
        }`}
      >
        {t('auth.signup.passwordStrength')}{' '}
        {strengthKey ? t(`auth.signup.strength.${strengthKey}`) : ''}
      </p>
      <ul className="mt-1 space-y-0.5 text-[0.7rem] text-stone-500 sm:text-xs dark:text-zinc-500">
        <li className={password.length >= 8 ? 'text-brand-600' : ''}>{t('auth.signup.rules.min8')}</li>
        <li className={/[a-z]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.lower')}</li>
        <li className={/[A-Z]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.upper')}</li>
        <li className={/[0-9]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.number')}</li>
        <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-brand-600' : ''}>{t('auth.signup.rules.special')}</li>
      </ul>
    </div>
  );
}

export default function Signup() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [shopName, setShopName] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup, fetchUser } = useAuth();
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isValidSignupLogoFile(file)) {
      toast.error(t('dashboard.home.cropImageOnly'));
      return;
    }
    setLogoFile(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  const countryOptions = useMemo(() => getCountryOptionsList(), []);
  const currencyOptions = useMemo(() => getCurrencyOptionsList(), []);
  const { resolved } = useTheme();

  const selectStyles = useMemo(() => {
    const dark = resolved === 'dark';
    return {
      control: (base: object, state: { isFocused: boolean }) => ({
        ...base,
        minHeight: 50,
        paddingLeft: 44,
        borderWidth: 2,
        borderColor: state.isFocused ? (dark ? '#5e2bec' : '#5b45e5') : dark ? '#52525b' : '#e7e5e4',
        borderRadius: 14,
        backgroundColor: dark ? '#18181b' : '#fff',
        boxShadow: state.isFocused
          ? dark
            ? '0 0 0 4px rgba(94, 43, 236, 0.15)'
            : '0 0 0 4px rgba(63, 52, 186, 0.12)'
          : 'none',
      }),
      menu: (base: object) => ({
        ...base,
        borderRadius: 14,
        overflow: 'hidden',
        zIndex: 50,
        backgroundColor: dark ? '#18181b' : '#fff',
        border: dark ? '1px solid #3f3f46' : '1px solid #e7e5e4',
      }),
      menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
      option: (base: Record<string, unknown>, state: { isFocused: boolean; isSelected: boolean }) => ({
        ...base,
        backgroundColor: state.isSelected
          ? dark
            ? 'rgb(37 26 102)'
            : 'rgb(235 232 252)'
          : state.isFocused
            ? dark
              ? 'rgb(39 39 42)'
              : 'rgb(245 245 244)'
            : dark
              ? '#18181b'
              : ((base.backgroundColor as string) ?? '#fff'),
        color: state.isSelected ? (dark ? '#d6cff9' : '#2f2184') : dark ? '#fafafa' : '#1c1917',
      }),
      placeholder: (base: object) => ({ ...base, color: dark ? '#a1a1aa' : '#a8a29e' }),
      input: (base: object) => ({ ...base, margin: 0, padding: 0, color: dark ? '#fafafa' : undefined }),
      singleValue: (base: object) => ({ ...base, color: dark ? '#fafafa' : '#1c1917', fontWeight: 600 }),
    };
  }, [resolved]);

  const inputClass =
    'w-full rounded-2xl border-2 border-stone-200 bg-white py-3 text-sm text-stone-900 placeholder:text-stone-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 sm:py-3.5 sm:text-base dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-400 dark:focus:ring-brand-400/20';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!country.trim()) {
      setError(t('auth.signup.errorCountry'));
      return;
    }
    if (!currency.trim()) {
      setError(t('auth.signup.errorCurrency'));
      return;
    }
    if (password !== confirmPassword) {
      const mismatchError = t('auth.reset.toastPasswordMismatch');
      setError(mismatchError);
      return;
    }
    setSubmitting(true);
    const result = await signup({
      email,
      password,
      username,
      shopName,
      country: country.trim(),
      currency: currency.trim(),
    });
    if (result.error) {
      setSubmitting(false);
      setError(result.error);
      return;
    }
    if (result.requiresEmailVerification || !getStoredToken()) {
      setSubmitting(false);
      toast.success(t('auth.verify.toastSignupCheckEmail'));
      navigate('/verify-email', {
        state: {
          email: result.email ?? email.trim().toLowerCase(),
          logoFile,
          emailDeliveryFailed: result.emailDeliveryFailed,
        },
      });
      return;
    }
    if (logoFile) {
      try {
        const token = getStoredToken();
        if (token) {
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
      } catch {
        toast.error(t('auth.signup.logoUploadFailed'));
      }
    }
    setSubmitting(false);
    toast.success(t('auth.signup.toastCreated'));
    navigate('/dashboard');
  }

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-stone-50 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgba(91,69,229,0.12),transparent_55%)] dark:opacity-40"
          aria-hidden
        />

        <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full min-w-0 max-w-3xl px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-lg:px-4 sm:px-6 sm:py-8">

            <div className="text-center">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brand-600 sm:text-[0.8125rem] sm:tracking-[0.16em] dark:text-brand-400">
                {t('auth.signup.getStarted')}
              </p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl md:text-3xl dark:text-zinc-100">
                {t('auth.signup.title')}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-xs font-medium text-stone-600 sm:text-sm dark:text-zinc-400">
                {t('auth.signup.subtitle')}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-stone-200/90 bg-white/95 p-4 shadow-[0_16px_48px_-36px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm max-lg:p-4 sm:mt-7 sm:rounded-3xl sm:p-7 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
              <form
                onSubmit={handleSubmit}
                className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-4 md:items-start"
              >
                {error && (
                  <div
                    className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/95 p-3 text-xs font-medium text-red-800 sm:gap-3 sm:p-4 sm:text-sm md:col-span-2 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
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
                    {t('auth.signup.email')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                    <input
                      id="email"
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className={`${inputClass} ps-11 pe-3 sm:ps-12 sm:pe-4`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shopName" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                    {t('auth.signup.shopName')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                    <input
                      id="shopName"
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder={t('auth.signup.placeholderShop')}
                      required
                      className={`${inputClass} ps-11 pe-3 sm:ps-12 sm:pe-4`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                    {t('auth.signup.username')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                      placeholder="myshop"
                      required
                      pattern="[a-z0-9_-]+"
                      title={t('auth.signup.usernamePatternTitle')}
                      className={`${inputClass} ps-11 pe-3 sm:ps-12 sm:pe-4`}
                    />
                  </div>
                  <p className="mt-1 text-[0.65rem] text-stone-500 sm:text-xs dark:text-zinc-500">{t('auth.signup.usernameHint')}</p>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                    {t('auth.signup.password')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder={t('auth.signup.placeholderPassword')}
                      className={`${inputClass} ps-11 pe-11 sm:ps-12 sm:pe-12`}
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
                  {passwordFocused && password ? <PasswordStrength password={password} /> : null}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                    {t('auth.reset.confirmPassword')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-stone-400 sm:start-4 sm:h-5 sm:w-5 dark:text-zinc-500" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder={t('auth.reset.placeholderRepeat')}
                      className={`${inputClass} ps-11 pe-11 sm:ps-12 sm:pe-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 sm:end-2.5 sm:rounded-xl sm:p-2 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      aria-label={showConfirmPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                    {t('auth.signup.country')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute start-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-brand-600/70 sm:start-4 dark:text-brand-400/80" />
                    <Select<CountryOption>
                      inputId="country"
                      isClearable
                      isSearchable
                      menuPosition="fixed"
                      menuPlacement="auto"
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      options={countryOptions}
                      value={country ? countryOptions.find((o) => o.value === country) ?? null : null}
                      onChange={(opt) => setCountry(opt?.value ?? '')}
                      placeholder={t('auth.common.searchCountry')}
                      noOptionsMessage={() => t('auth.common.noCountryFound')}
                      formatOptionLabel={(opt) => (
                        <span className="flex items-center gap-2">
                          {opt.flagUrl ? (
                            <img src={opt.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded object-cover" />
                          ) : null}
                          <span>{opt.label}</span>
                        </span>
                      )}
                      styles={selectStyles}
                      classNamePrefix="signup-select"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currency" className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                    {t('auth.signup.currency')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Banknote className="pointer-events-none absolute start-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-brand-600/70 sm:start-4 dark:text-brand-400/80" />
                    <Select<CurrencyOption>
                      inputId="currency"
                      isClearable
                      isSearchable
                      menuPosition="fixed"
                      menuPlacement="auto"
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      options={currencyOptions}
                      value={currency ? currencyOptions.find((o) => o.value === currency) ?? null : null}
                      onChange={(opt) => setCurrency(opt?.value ?? '')}
                      placeholder={t('auth.common.searchCurrency')}
                      noOptionsMessage={() => t('auth.common.noCurrencyFound')}
                      filterOption={(option, inputValue) => {
                        const v = inputValue.trim().toLowerCase();
                        return option.label.toLowerCase().includes(v) || option.value.toLowerCase().includes(v);
                      }}
                      formatOptionLabel={(opt) => (
                        <span className="flex items-center gap-2">
                          {opt.flagUrl ? (
                            <img src={opt.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded object-cover" />
                          ) : null}
                          <span>{opt.label}</span>
                        </span>
                      )}
                      styles={selectStyles}
                      classNamePrefix="signup-select"
                    />
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-stone-800 sm:mb-2 sm:text-sm dark:text-zinc-200">
                    {t('auth.signup.logoOptional')}
                  </span>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <div className={`flex w-full gap-3 ${logoPreview ? 'items-stretch' : ''}`}>
                    {logoPreview ? (
                      <div className="shrink-0">
                        <img
                          src={logoPreview}
                          alt=""
                          className="h-20 w-20 rounded-xl border-2 border-stone-200 object-contain dark:border-zinc-700"
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={submitting}
                      className={`inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 bg-white px-3 py-3 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 ${logoPreview ? 'min-w-0 flex-1 cursor-pointer' : 'w-full cursor-pointer'}`}
                    >
                      <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                      {logoFile ? t('auth.signup.changeLogo') : t('auth.signup.chooseLogo')}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="home-btn-primary group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-900/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-base md:col-span-2"
                >
                  <span className="relative z-[2] inline-flex items-center gap-2">
                    <UserPlus className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
                    {submitting ? t('auth.signup.creating') : t('auth.signup.createMyShop')}
                  </span>
                </button>
              </form>

              <p className="mt-5 border-t border-stone-100 pt-4 text-center text-xs font-medium text-stone-600 sm:mt-6 sm:pt-5 sm:text-sm dark:border-zinc-700 dark:text-zinc-400">
                {t('auth.signup.alreadyHave')}{' '}
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1 font-bold text-brand-700 no-underline transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {t('auth.signup.logIn')}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180 sm:h-4 sm:w-4" aria-hidden />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
