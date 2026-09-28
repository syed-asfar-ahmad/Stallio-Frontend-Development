import { useStorefrontTheme } from '../../../themes';
import HeaderClassicBar from './header/HeaderClassicBar';
import HeaderMinimalFloating from './header/HeaderMinimalFloating';
import HeaderCenteredLogo from './header/HeaderCenteredLogo';
import HeaderInlineCompact from './header/HeaderInlineCompact';
import type { ThemeHeaderProps } from './types';

export default function Header(props: ThemeHeaderProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.headerVariant) {
    case 'minimal-floating':
      return <HeaderMinimalFloating {...props} />;
    case 'centered-logo':
      return <HeaderCenteredLogo {...props} />;
    case 'inline-compact':
      return <HeaderInlineCompact {...props} />;
    case 'classic-bar':
    default:
      return <HeaderClassicBar {...props} />;
  }
}
