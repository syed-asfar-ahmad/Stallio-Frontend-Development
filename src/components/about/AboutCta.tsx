import { useTranslation } from 'react-i18next';

import { MarketingCta } from '@/components/marketing/MarketingCta';

export function AboutCta() {
  const { t } = useTranslation();

  return (
    <MarketingCta
      eyebrow={t('about.cta.eyebrow')}
      title={t('about.cta.title')}
      body={t('about.cta.subtitle')}
      primaryLabel={t('about.cta.createFreeStore')}
      secondaryLabel={t('about.cta.contactUs')}
      secondaryTo="/contact"
    />
  );
}
