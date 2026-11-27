import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { IconArrowLeft } from '@tabler/icons-react';

import {
  AuthAlert,
  AuthField,
  AuthFormCard,
  AuthShell,
  authInputClass,
  authPrimaryBtnClass,
} from '@/components/auth';
import PublicLayout from '@/components/PublicLayout';
import { useAuth, getStoredToken } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

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
      await api('/api/user', {
        method: 'PATCH',
        body: { logo: data.url, logoPublicId: data.publicId },
      });
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

  if (!email) return null;

  return (
    <PublicLayout hideFooter>
      <AuthShell
        eyebrow={t('auth.verify.eyebrow')}
        title={t('auth.verify.title')}
        description={t('auth.verify.subtitle')}
      >
        <AuthFormCard>
          <p
            className="text-foreground mb-5 break-all text-sm font-medium [unicode-bidi:isolate]"
            dir="ltr"
          >
            {email}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error ? <AuthAlert>{error}</AuthAlert> : null}

            <AuthField id="verify-code" label={t('auth.verify.code')} required>
              <input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                required
                autoComplete="one-time-code"
                placeholder={t('auth.verify.codePlaceholder')}
                aria-invalid={Boolean(error) || undefined}
                className={cn(
                  authInputClass,
                  'text-center text-lg font-semibold tracking-[0.35em]',
                )}
              />
            </AuthField>

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className={authPrimaryBtnClass}
            >
              {submitting ? t('auth.verify.verifying') : t('auth.verify.submit')}
            </button>
          </form>

          <div className="border-border/70 mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <Link
              to="/login"
              className="text-brand inline-flex items-center gap-2 text-sm font-medium no-underline transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80"
            >
              <IconArrowLeft
                className="size-4 shrink-0 rtl:rotate-180"
                stroke={1.5}
                aria-hidden
              />
              {t('auth.verify.backToSignIn')}
            </Link>
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending}
              className="text-brand cursor-pointer text-sm font-medium transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? t('auth.verify.resending') : t('auth.verify.resend')}
            </button>
          </div>
        </AuthFormCard>
      </AuthShell>
    </PublicLayout>
  );
}
