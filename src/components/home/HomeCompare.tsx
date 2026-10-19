import { useTranslation } from 'react-i18next';

import { MarketingCompareSection } from '@/components/marketing/MarketingCompareSection';

export function HomeCompare() {
  const { t } = useTranslation();

  return (
    <MarketingCompareSection
      copy={{
        eyebrow: t('home.compare.eyebrow'),
        title: t('home.compare.title'),
        body: t('home.compare.body'),
        beforeLabel: t('home.compare.beforeLabel'),
        afterLabel: t('home.compare.afterLabel'),
        beforeTitle: t('home.compare.beforeTitle'),
        afterTitle: t('home.compare.afterTitle'),
        before: t('home.compare.before', { returnObjects: true }) as string[],
        after: t('home.compare.after', { returnObjects: true }) as string[],
      }}
    />
  );
}
