import { useStorefrontTheme } from '../../../themes';
import FooterMultiColumn from './footer/FooterMultiColumn';
import FooterCenteredMinimal from './footer/FooterCenteredMinimal';
import FooterBoldNewsletter from './footer/FooterBoldNewsletter';
import FooterCompactInline from './footer/FooterCompactInline';
import FooterOrganicCurated from './footer/FooterOrganicCurated';
import FooterCocoaAtelier from './footer/FooterCocoaAtelier';
import type { ThemeFooterProps } from './types';

export default function Footer(props: ThemeFooterProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.footerVariant) {
    case 'cocoa-atelier':
      return <FooterCocoaAtelier {...props} />;
    case 'organic-curated':
      return <FooterOrganicCurated {...props} />;
    case 'centered-minimal':
      return <FooterCenteredMinimal {...props} />;
    case 'bold-newsletter':
      return <FooterBoldNewsletter {...props} />;
    case 'compact-inline':
      return <FooterCompactInline {...props} />;
    case 'multi-column':
    default:
      return <FooterMultiColumn {...props} />;
  }
}

