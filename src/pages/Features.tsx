import { useTranslation } from 'react-i18next';

import PublicLayout from '@/components/PublicLayout';
import {
  FeaturesBento,
  FeaturesHero,
  FeaturesLoop,
  FeaturesSpotlight,
  FeaturesTools,
} from '@/components/features';
import { MarketingCta } from '@/components/marketing/MarketingCta';
import { MARKETING_DEMO_SHOP_PATH } from '@/lib/marketingDemoShop';

export default function Features() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <FeaturesHero />
        <FeaturesLoop />
        <FeaturesSpotlight />
        <FeaturesBento />
        <FeaturesTools />
        <MarketingCta
          eyebrow={t('features.cta.eyebrow')}
          title={t('features.cta.title')}
          body={t('features.cta.body')}
          primaryLabel={t('home.actions.startFree')}
          secondaryLabel={t('features.cta.secondary')}
          secondaryTo={MARKETING_DEMO_SHOP_PATH}
        />
      </div>
    </PublicLayout>
  );
}
