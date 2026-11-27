import { useTranslation } from 'react-i18next';

import { MarketingCta } from '@/components/marketing/MarketingCta';

export function HomeCta() {
  const { t } = useTranslation();

  return (
    <MarketingCta
      eyebrow={t('home.cta.eyebrow')}
      title={t('home.cta.title')}
      body={t('home.cta.body')}
      primaryLabel={t('home.actions.startFree')}
      secondaryLabel={t('home.actions.logIn')}
      secondaryTo="/login"
      titleAccentDot
    />
  );
}
