import { useStorefrontTheme } from '../../../themes';
import FooterMultiColumn from './footer/FooterMultiColumn';
import FooterCenteredMinimal from './footer/FooterCenteredMinimal';
import type { ThemeFooterProps } from './types';

export default function Footer(props: ThemeFooterProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.footerVariant) {
    case 'centered-minimal':
      return <FooterCenteredMinimal {...props} />;
    case 'multi-column':
      return <FooterMultiColumn {...props} />;
    default:
      return <FooterMultiColumn {...props} />;
  }
}
