import { useStorefrontTheme } from '../../../themes';
import HeaderClassicBar from './header/HeaderClassicBar';
import HeaderMinimalFloating from './header/HeaderMinimalFloating';
import type { ThemeHeaderProps } from './types';

export default function Header(props: ThemeHeaderProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.headerVariant) {
    case 'minimal-floating':
      return <HeaderMinimalFloating {...props} />;
    case 'classic-bar':
      return <HeaderClassicBar {...props} />;
    default:
      return <HeaderClassicBar {...props} />;
  }
}
