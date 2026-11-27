import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
import { isValidEmail } from '@/components/auth/auth-options';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('dashboard_suspended') === '1') {
      sessionStorage.removeItem('dashboard_suspended');
      const msg =
        'Your seller dashboard access has been suspended. Please contact the admin.';
      setFormError(msg);
      toast.error(msg);
    }
  }, []);

  function validate(next = { email, password }) {
    const nextErrors: FieldErrors = {};
    if (!next.email.trim()) nextErrors.email = t('auth.login.emailRequired');
    else if (!isValidEmail(next.email))
      nextErrors.email = t('auth.login.emailInvalid');
    if (!next.password) nextErrors.password = t('auth.login.passwordRequired');
    return nextErrors;
  }

  async function signIn() {
    setTouched({ email: true, password: true });
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const { error: err, code, email: loginEmail, role } = await login(
        email,
        password,
      );
      if (err) {
        if (code === 'EMAIL_NOT_VERIFIED') {
          navigate('/verify-email', {
            state: { email: loginEmail ?? email.trim().toLowerCase() },
          });
          return;
        }
        setFormError(err);
        toast.error(err);
        return;
      }
      toast.success(t('auth.login.toastWelcome'));
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void signIn();
        }}
        noValidate
      >
        {formError ? <AuthAlert>{formError}</AuthAlert> : null}

        <AuthField
          id="login-email"
          label={t('auth.login.email')}
          required
          error={touched.email ? errors.email : undefined}
        >
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder={t('auth.login.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email)
                setErrors(validate({ email: e.target.value, password }));
            }}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, email: true }));
              setErrors(validate());
            }}
            aria-invalid={Boolean(touched.email && errors.email) || undefined}
            className={cn(authInputClass, '[unicode-bidi:isolate]')}
          />
        </AuthField>

        <AuthPasswordField
          id="login-password"
          label={t('auth.login.password')}
          required
          value={password}
          placeholder={t('auth.login.passwordPlaceholder')}
          autoComplete="current-password"
          error={touched.password ? errors.password : undefined}
          onChange={(value) => {
            setPassword(value);
            if (touched.password)
              setErrors(validate({ email, password: value }));
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, password: true }));
            setErrors(validate());
          }}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-brand text-sm font-medium transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80"
          >
            {t('auth.login.forgot')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={authPrimaryBtnClass}
        >
          {t('auth.login.submit')}
        </button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm leading-6">
        {t('auth.login.newTo')}{' '}
        <Link
          to="/signup"
          className="text-foreground hover:text-brand font-medium underline-offset-4 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:underline"
        >
          {t('home.actions.startFree')}
        </Link>
      </p>
    </AuthFormCard>
  );
}
