import { useTranslation } from 'react-i18next';

import { AuthShell, SignupForm } from '@/components/auth';
import PublicLayout from '@/components/PublicLayout';

export default function Signup() {
  const { t } = useTranslation();

  return (
    <PublicLayout hideFooter>
      <AuthShell
        compact
        eyebrow={t('auth.signup.eyebrow')}
        title={t('auth.signup.title')}
        description={t('auth.signup.description')}
      >
        <SignupForm />
      </AuthShell>
    </PublicLayout>
  );
}
