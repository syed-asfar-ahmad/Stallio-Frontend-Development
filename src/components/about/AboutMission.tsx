import { useTranslation } from 'react-i18next';

import { MarketingCompareSection } from '@/components/marketing/MarketingCompareSection';

export function AboutMission() {
  const { t } = useTranslation();

  return (
    <MarketingCompareSection
      copy={{
        eyebrow: t('about.mission.eyebrow'),
        title: t('about.mission.title'),
        body: t('about.mission.subtitle'),
        beforeLabel: t('about.mission.frictionTitle'),
        afterLabel: t('about.mission.solutionTitle'),
        beforeTitle: t('about.mission.frictionTitle'),
        afterTitle: t('about.mission.solutionTitle'),
        beforeIntro: t('about.mission.frictionIntro'),
        afterIntro: t('about.mission.solutionIntro'),
        before: t('about.mission.problems', { returnObjects: true }) as string[],
        after: t('about.mission.solutions', { returnObjects: true }) as string[],
      }}
    />
  );
}
