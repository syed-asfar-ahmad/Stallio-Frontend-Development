import { useStorefrontTheme } from '../../../themes';
import HeroFullBanner from './hero/HeroFullBanner';
import HeroMinimalClean from './hero/HeroMinimalClean';
import type { ThemeHeroProps } from './types';

export default function Hero(props: ThemeHeroProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.heroVariant) {
    case 'minimal-clean':
      return <HeroMinimalClean {...props} />;
    case 'full-banner':
      return <HeroFullBanner {...props} />;
    default:
      return <HeroFullBanner {...props} />;
  }
}
