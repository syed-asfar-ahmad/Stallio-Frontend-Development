import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import {
  AuthAlert,
  AuthFormCard,
  authPrimaryBtnClass,
} from '@/components/auth/AuthFormCard';
import { AuthField } from '@/components/auth/AuthField';
import {
  AuthPasswordField,
  authInputClass,
} from '@/components/auth/AuthPasswordField';
import {
  isValidEmail,
  isValidUsername,
} from '@/components/auth/auth-options';
import { useAuth, getStoredToken } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import {
  getCountryOptionsList,
  getCurrencyOptionsList,
  type CountryOption,
  type CurrencyOption,
} from '@/lib/countryCurrencyOptions';
import { motionEase } from '@/lib/motion';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const ALLOWED_LOGO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const ALLOWED_LOGO_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

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

type FormState = {
  email: string;
  shopName: string;
  username: string;
  password: string;
  confirmPassword: string;
  country: string;
  currency: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
type Step = 0 | 1;

const compactInputClass = cn(authInputClass, 'h-11');

const accountKeys: (keyof FormState)[] = [
  'email',
  'password',
  'confirmPassword',
];
const shopKeys: (keyof FormState)[] = [
  'shopName',
  'username',
  'country',
  'currency',
];

export function SignupForm() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { signup, fetchUser } = useAuth();
  const { resolved } = useTheme();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>({
    email: '',
    shopName: '',
    username: '',
    password: '',
    confirmPassword: '',
    country: '',
    currency: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const countryOptions = useMemo(() => getCountryOptionsList(), []);
  const currencyOptions = useMemo(() => getCurrencyOptionsList(), []);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const selectStyles = useMemo(() => {
    const dark = resolved === 'dark';
    return {
      control: (base: object, state: { isFocused: boolean }) => ({
        ...base,
        minHeight: 44,
        borderWidth: 1,
        borderColor: state.isFocused
          ? dark
            ? '#5e2bec'
            : 'color-mix(in srgb, var(--brand) 70%, transparent)'
          : dark
            ? '#52525b'
            : 'color-mix(in srgb, var(--border) 70%, transparent)',
        borderRadius: 16,
        backgroundColor: dark ? '#18181b' : 'var(--background, #fff)',
        boxShadow: state.isFocused
          ? '0 0 0 3px color-mix(in srgb, var(--brand) 25%, transparent)'
          : 'inset 0 1px 1px rgba(255,255,255,0.35)',
        fontSize: '0.875rem',
      }),
      menu: (base: object) => ({
        ...base,
        borderRadius: 16,
        overflow: 'hidden',
        zIndex: 50,
        backgroundColor: dark ? '#18181b' : '#fff',
        border: dark ? '1px solid #3f3f46' : '1px solid #e7e5e4',
      }),
      menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
      option: (
        base: Record<string, unknown>,
        state: { isFocused: boolean; isSelected: boolean },
      ) => ({
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
        color: state.isSelected
          ? dark
            ? '#d6cff9'
            : '#2f2184'
          : dark
            ? '#fafafa'
            : '#1c1917',
      }),
      placeholder: (base: object) => ({
        ...base,
        color: dark ? '#a1a1aa' : '#a8a29e',
      }),
      input: (base: object) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: dark ? '#fafafa' : undefined,
      }),
      singleValue: (base: object) => ({
        ...base,
        color: dark ? '#fafafa' : '#1c1917',
        fontWeight: 500,
      }),
    };
  }, [resolved]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) setErrors(validate(next));
  }

  function validate(next: FormState = form) {
    const nextErrors: FieldErrors = {};
    if (!next.email.trim()) nextErrors.email = t('auth.signup.emailRequired');
    else if (!isValidEmail(next.email))
      nextErrors.email = t('auth.signup.emailInvalid');

    if (!next.shopName.trim())
      nextErrors.shopName = t('auth.signup.shopRequired');

    if (!next.username.trim())
      nextErrors.username = t('auth.signup.urlRequired');
    else if (!isValidUsername(next.username))
      nextErrors.username = t('auth.signup.urlInvalid');

    if (!next.password) nextErrors.password = t('auth.signup.passwordRequired');
    else if (next.password.length < 8)
      nextErrors.password = t('auth.signup.passwordShort');

    if (!next.confirmPassword)
      nextErrors.confirmPassword = t('auth.signup.confirmRequired');
    else if (next.confirmPassword !== next.password)
      nextErrors.confirmPassword = t('auth.signup.passwordMismatch');

    if (!next.country) nextErrors.country = t('auth.signup.countryRequired');
    if (!next.currency) nextErrors.currency = t('auth.signup.currencyRequired');

    return nextErrors;
  }

  function markTouched(keys: (keyof FormState)[]) {
    setTouched((prev) => {
      const next = { ...prev };
      for (const key of keys) next[key] = true;
      return next;
    });
  }

  function validateStep(current: Step) {
    const keys = current === 0 ? accountKeys : shopKeys;
    markTouched(keys);
    const all = validate();
    const stepErrors: FieldErrors = {};
    for (const key of keys) {
      if (all[key]) stepErrors[key] = all[key];
    }
    setErrors(all);
    return stepErrors;
  }

  async function goNext() {
    setFormError(null);
    const stepErrors = validateStep(0);
    if (Object.keys(stepErrors).length) {
      setFormError(t('auth.signup.formError'));
      return;
    }
    setStep(1);
  }

  async function createShop() {
    setFormError(null);
    const stepErrors = validateStep(1);
    if (Object.keys(stepErrors).length) {
      setFormError(t('auth.signup.formError'));
      return;
    }

    setSubmitting(true);
    try {
      const result = await signup({
        email: form.email,
        password: form.password,
        username: form.username.trim().toLowerCase(),
        shopName: form.shopName,
        country: form.country.trim(),
        currency: form.currency.trim(),
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.requiresEmailVerification || !getStoredToken()) {
        toast.success(t('auth.verify.toastSignupCheckEmail'));
        navigate('/verify-email', {
          state: {
            email: result.email ?? form.email.trim().toLowerCase(),
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
            const body = new FormData();
            body.append('file', logoFile);
            body.append('type', 'logo');
            const res = await fetch(`${API_BASE}/api/upload`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body,
            });
            const data = await res.json();
            if (res.ok && data.url) {
              await api('/api/user', {
                method: 'PATCH',
                body: { logo: data.url, logoPublicId: data.publicId },
              });
              await fetchUser();
            }
          }
        } catch {
          toast.error(t('auth.signup.logoUploadFailed'));
        }
      }

      toast.success(t('auth.signup.toastCreated'));
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }

  const storePreview = form.username.trim()
    ? `stallio.shop/${form.username.trim().toLowerCase()}`
    : 'stallio.shop/you';

  return (
    <AuthFormCard compact>
      <div className="mb-4 flex items-center justify-center gap-2" aria-hidden>
        {[0, 1].map((index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                step === index
                  ? 'bg-brand text-brand-foreground scale-105'
                  : step > index
                    ? 'bg-brand/15 text-brand'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                'text-[11px] font-medium tracking-[0.14em] uppercase',
                step === index ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {index === 0
                ? t('auth.signup.stepAccount')
                : t('auth.signup.stepShop')}
            </span>
            {index === 0 ? (
              <span className="bg-border mx-1 h-px w-6 sm:w-10" />
            ) : null}
          </div>
        ))}
      </div>

      <form
        className="space-y-3.5"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        {formError ? <AuthAlert>{formError}</AuthAlert> : null}

        <div className="relative min-h-[17.5rem] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 ? (
              <motion.div
                key="account"
                className="space-y-3.5"
                initial={reduce ? false : { opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 18 }}
                transition={{ duration: 0.45, ease: motionEase }}
              >
                <AuthField
                  id="signup-email"
                  label={t('auth.signup.email')}
                  required
                  className="space-y-1.5"
                  error={touched.email ? errors.email : undefined}
                >
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    placeholder={t('auth.signup.emailPlaceholder')}
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, email: true }));
                      setErrors(validate());
                    }}
                    aria-invalid={
                      Boolean(touched.email && errors.email) || undefined
                    }
                    className={cn(compactInputClass, '[unicode-bidi:isolate]')}
                  />
                </AuthField>

                <AuthPasswordField
                  id="signup-password"
                  label={t('auth.signup.password')}
                  name="password"
                  required
                  className="space-y-1.5"
                  inputClassName="h-11"
                  value={form.password}
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  autoComplete="new-password"
                  error={touched.password ? errors.password : undefined}
                  onChange={(value) => setField('password', value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, password: true }));
                    setErrors(validate());
                  }}
                />

                <AuthPasswordField
                  id="signup-confirm"
                  label={t('auth.signup.confirmPassword')}
                  name="confirmPassword"
                  required
                  className="space-y-1.5"
                  inputClassName="h-11"
                  value={form.confirmPassword}
                  placeholder={t('auth.signup.confirmPlaceholder')}
                  autoComplete="new-password"
                  error={
                    touched.confirmPassword
                      ? errors.confirmPassword
                      : undefined
                  }
                  onChange={(value) => setField('confirmPassword', value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, confirmPassword: true }));
                    setErrors(validate());
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="shop"
                className="space-y-3.5"
                initial={reduce ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -18 }}
                transition={{ duration: 0.45, ease: motionEase }}
              >
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <AuthField
                    id="signup-shop"
                    label={t('auth.signup.shopName')}
                    required
                    className="space-y-1.5"
                    error={touched.shopName ? errors.shopName : undefined}
                  >
                    <input
                      id="signup-shop"
                      name="shopName"
                      type="text"
                      autoComplete="organization"
                      placeholder={t('auth.signup.shopNamePlaceholder')}
                      value={form.shopName}
                      onChange={(e) => setField('shopName', e.target.value)}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, shopName: true }));
                        setErrors(validate());
                      }}
                      aria-invalid={
                        Boolean(touched.shopName && errors.shopName) ||
                        undefined
                      }
                      className={compactInputClass}
                    />
                  </AuthField>

                  <AuthField
                    id="signup-username"
                    label={t('auth.signup.storeUrl')}
                    required
                    className="space-y-1.5"
                    error={touched.username ? errors.username : undefined}
                    success={
                      touched.username && !errors.username && form.username
                        ? storePreview
                        : undefined
                    }
                  >
                    <input
                      id="signup-username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder={t('auth.signup.usernamePlaceholder')}
                      value={form.username}
                      onChange={(e) =>
                        setField(
                          'username',
                          e.target.value.replace(/\s/g, '').toLowerCase(),
                        )
                      }
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, username: true }));
                        setErrors(validate());
                      }}
                      aria-invalid={
                        Boolean(touched.username && errors.username) ||
                        undefined
                      }
                      className={compactInputClass}
                    />
                  </AuthField>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <AuthField
                    id="signup-country"
                    label={t('auth.signup.country')}
                    required
                    className="space-y-1.5"
                    error={touched.country ? errors.country : undefined}
                  >
                    <Select<CountryOption>
                      inputId="signup-country"
                      isClearable
                      isSearchable
                      menuPosition="fixed"
                      menuPlacement="auto"
                      menuPortalTarget={
                        typeof document !== 'undefined' ? document.body : null
                      }
                      options={countryOptions}
                      value={
                        form.country
                          ? (countryOptions.find(
                              (o) => o.value === form.country,
                            ) ?? null)
                          : null
                      }
                      onChange={(opt) => {
                        setField('country', opt?.value ?? '');
                        setTouched((prev) => ({ ...prev, country: true }));
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, country: true }));
                        setErrors(validate());
                      }}
                      placeholder={t('auth.signup.selectCountry')}
                      noOptionsMessage={() => t('auth.common.noCountryFound')}
                      formatOptionLabel={(opt) => (
                        <span className="flex items-center gap-2">
                          {opt.flagUrl ? (
                            <img
                              src={opt.flagUrl}
                              alt=""
                              className="h-4 w-6 shrink-0 rounded object-cover"
                            />
                          ) : null}
                          <span>{opt.label}</span>
                        </span>
                      )}
                      styles={selectStyles}
                      classNamePrefix="signup-select"
                    />
                  </AuthField>

                  <AuthField
                    id="signup-currency"
                    label={t('auth.signup.currency')}
                    required
                    className="space-y-1.5"
                    error={touched.currency ? errors.currency : undefined}
                  >
                    <Select<CurrencyOption>
                      inputId="signup-currency"
                      isClearable
                      isSearchable
                      menuPosition="fixed"
                      menuPlacement="auto"
                      menuPortalTarget={
                        typeof document !== 'undefined' ? document.body : null
                      }
                      options={currencyOptions}
                      value={
                        form.currency
                          ? (currencyOptions.find(
                              (o) => o.value === form.currency,
                            ) ?? null)
                          : null
                      }
                      onChange={(opt) => {
                        setField('currency', opt?.value ?? '');
                        setTouched((prev) => ({ ...prev, currency: true }));
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, currency: true }));
                        setErrors(validate());
                      }}
                      placeholder={t('auth.signup.selectCurrency')}
                      noOptionsMessage={() => t('auth.common.noCurrencyFound')}
                      filterOption={(option, inputValue) => {
                        const v = inputValue.trim().toLowerCase();
                        return (
                          option.label.toLowerCase().includes(v) ||
                          option.value.toLowerCase().includes(v)
                        );
                      }}
                      formatOptionLabel={(opt) => (
                        <span className="flex items-center gap-2">
                          {opt.flagUrl ? (
                            <img
                              src={opt.flagUrl}
                              alt=""
                              className="h-4 w-6 shrink-0 rounded object-cover"
                            />
                          ) : null}
                          <span>{opt.label}</span>
                        </span>
                      )}
                      styles={selectStyles}
                      classNamePrefix="signup-select"
                    />
                  </AuthField>
                </div>

                <AuthField
                  id="signup-logo"
                  label={t('auth.signup.logo')}
                  className="space-y-1.5"
                  hint={
                    logoFile
                      ? logoFile.name
                      : t('auth.signup.optional')
                  }
                >
                  <label
                    htmlFor="signup-logo"
                    className="border-border/70 bg-background hover:bg-muted/40 text-foreground flex h-11 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 text-sm transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    <span className="text-muted-foreground flex min-w-0 items-center gap-3 truncate">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt=""
                          className="size-8 shrink-0 rounded-lg object-contain"
                        />
                      ) : null}
                      <span className="truncate">
                        {logoFile
                          ? t('auth.signup.changeLogo')
                          : t('auth.signup.chooseLogo')}
                      </span>
                    </span>
                    <span className="text-brand shrink-0 text-xs font-medium tracking-[0.14em] uppercase">
                      {t('auth.signup.upload')}
                    </span>
                    <input
                      id="signup-logo"
                      name="logo"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      onChange={(e) => {
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
                      }}
                    />
                  </label>
                </AuthField>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === 0 ? (
          <button
            type="button"
            onClick={goNext}
            className={cn(authPrimaryBtnClass, 'h-11')}
          >
            {t('auth.signup.continue')}
          </button>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-[auto_1fr]">
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setStep(0);
              }}
              className="border-border/70 bg-background text-foreground hover:bg-muted/50 inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              {t('auth.signup.back')}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void createShop()}
              className={cn(authPrimaryBtnClass, 'h-11')}
            >
              {t('auth.signup.submit')}
            </button>
          </div>
        )}
      </form>

      <p className="text-muted-foreground mt-4 text-center text-sm leading-6">
        {t('auth.signup.haveAccount')}{' '}
        <Link
          to="/login"
          className="text-foreground hover:text-brand font-medium underline-offset-4 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:underline"
        >
          {t('auth.signup.signIn')}
        </Link>
      </p>
      <p className="text-muted-foreground mt-2 text-center text-xs leading-5">
        {t('auth.signup.legalBefore', { name: t('home.actions.brandName') })}{' '}
        <Link
          to="/terms"
          className="underline-offset-2 hover:underline"
        >
          {t('layout.footer.terms')}
        </Link>{' '}
        {t('auth.signup.legalMid')}{' '}
        <Link
          to="/privacy"
          className="underline-offset-2 hover:underline"
        >
          {t('layout.footer.privacy')}
        </Link>
        {t('auth.signup.legalAfter', { name: t('home.actions.brandName') })}
      </p>
    </AuthFormCard>
  );
}
