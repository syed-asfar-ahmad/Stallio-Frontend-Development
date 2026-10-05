import { useStorefrontTheme } from '../../../themes';
import HeaderClassicBar from './header/HeaderClassicBar';
import HeaderMinimalFloating from './header/HeaderMinimalFloating';
import HeaderCenteredLogo from './header/HeaderCenteredLogo';
import HeaderInlineCompact from './header/HeaderInlineCompact';
import HeaderFloatingCapsule from './header/HeaderFloatingCapsule';
import HeaderCocoaOverlay from './header/HeaderCocoaOverlay';
import type { ThemeHeaderProps } from './types';

export default function Header(props: ThemeHeaderProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.headerVariant) {
    case 'cocoa-overlay':
      return <HeaderCocoaOverlay {...props} />;
    case 'floating-capsule':
      return <HeaderFloatingCapsule {...props} />;
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

