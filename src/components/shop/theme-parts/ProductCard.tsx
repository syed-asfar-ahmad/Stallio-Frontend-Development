import { useStorefrontTheme } from '../../../themes';
import CardBordered from './product-card/CardBordered';
import CardFlat from './product-card/CardFlat';
import type { ThemeProductCardProps } from './types';

export default function ProductCard(props: ThemeProductCardProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.productCardVariant) {
    case 'flat':
      return <CardFlat {...props} />;
    case 'bordered':
      return <CardBordered {...props} />;
    default:
      return <CardBordered {...props} />;
  }
}
