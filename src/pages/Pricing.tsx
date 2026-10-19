import { useTranslation } from 'react-i18next';

import PublicLayout from '@/components/PublicLayout';
import {
  PricingFaq,
  PricingHero,
  PricingIncluded,
  PricingPlans,
} from '@/components/pricing';
import { MarketingCta } from '@/components/marketing/MarketingCta';

export default function Pricing() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <PricingHero />
        <PricingPlans />
        <PricingIncluded />
        <PricingFaq />
        <MarketingCta
          eyebrow={t('pricing.cta.eyebrow')}
          title={t('pricing.cta.title')}
          body={t('pricing.cta.body')}
          primaryLabel={t('pricing.hero.startFree')}
          secondaryLabel={t('pricing.cta.secondary')}
          secondaryTo="/contact"
        />
      </div>
    </PublicLayout>
  );
}
