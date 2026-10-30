import { useTranslation } from 'react-i18next';

import { MarketingCta } from '@/components/marketing/MarketingCta';

export function HowCta() {
  const { t } = useTranslation();

  return (
    <MarketingCta
      eyebrow={t('howItWorks.cta.eyebrow')}
      title={t('howItWorks.cta.title')}
      body={t('howItWorks.cta.body')}
      primaryLabel={t('home.actions.startFree')}
      secondaryLabel={t('howItWorks.cta.secondary')}
      secondaryTo="/features"
    />
  );
}
