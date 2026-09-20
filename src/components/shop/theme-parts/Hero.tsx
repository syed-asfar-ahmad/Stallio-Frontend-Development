import { useStorefrontTheme } from '../../../themes';
import HeroFullBanner from './hero/HeroFullBanner';
import HeroMinimalClean from './hero/HeroMinimalClean';
import HeroSplitImage from './hero/HeroSplitImage';
import HeroCardShowcase from './hero/HeroCardShowcase';
import type { ThemeHeroProps } from './types';

export default function Hero(props: ThemeHeroProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.heroVariant) {
    case 'minimal-clean':
      return <HeroMinimalClean {...props} />;
    case 'split-image':
      return <HeroSplitImage {...props} />;
    case 'card-showcase':
      return <HeroCardShowcase {...props} />;
    case 'full-banner':
    default:
      return <HeroFullBanner {...props} />;
  }
}
