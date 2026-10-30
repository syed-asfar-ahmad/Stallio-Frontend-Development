import { useTranslation } from 'react-i18next';

import { AuthShell, LoginForm } from '@/components/auth';
import PublicLayout from '@/components/PublicLayout';

export default function Login() {
  const { t } = useTranslation();

  return (
    <PublicLayout hideFooter>
      <AuthShell
        eyebrow={t('auth.login.eyebrow')}
        title={t('auth.login.title')}
        description={t('auth.login.description')}
      >
        <LoginForm />
      </AuthShell>
    </PublicLayout>
  );
}
