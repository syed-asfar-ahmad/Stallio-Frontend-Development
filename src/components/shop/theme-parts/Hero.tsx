import { useStorefrontTheme } from '../../../themes';
import HeroFullBanner from './hero/HeroFullBanner';
import HeroMinimalClean from './hero/HeroMinimalClean';
import HeroSplitImage from './hero/HeroSplitImage';
import HeroCardShowcase from './hero/HeroCardShowcase';
import HeroOrganicPill from './hero/HeroOrganicPill';
import HeroBotanicalArch from './hero/HeroBotanicalArch';
import HeroSanctuaryPanorama from './hero/HeroSanctuaryPanorama';
import HeroApothecaryDuo from './hero/HeroApothecaryDuo';
import HeroCocoaBanner from './hero/HeroCocoaBanner';
import HeroMartBento from './hero/HeroMartBento';
import HeroFreshBloom from './hero/HeroFreshBloom';
import type { ThemeHeroProps } from './types';

export default function Hero(props: ThemeHeroProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.heroVariant) {
    case 'fresh-bloom':
      return <HeroFreshBloom {...props} />;
    case 'mart-bento':
      return <HeroMartBento {...props} />;
    case 'cocoa-banner':
      return <HeroCocoaBanner {...props} />;
    case 'botanical-arch':
      return <HeroBotanicalArch {...props} />;
    case 'sanctuary-panorama':
      return <HeroSanctuaryPanorama {...props} />;
    case 'apothecary-duo':
      return <HeroApothecaryDuo {...props} />;
    case 'organic-pill':
      return <HeroOrganicPill {...props} />;
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
