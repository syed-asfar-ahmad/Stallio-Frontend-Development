import { useStorefrontTheme } from '../../../themes';
import CardBordered from './product-card/CardBordered';
import CardFlat from './product-card/CardFlat';
import CardElevated from './product-card/CardElevated';
import CardCompact from './product-card/CardCompact';
import CardEditorial from './product-card/CardEditorial';
import CardOrganicPill from './product-card/CardOrganicPill';
import CardCocoaTile from './product-card/CardCocoaTile';
import CardMartDeal from './product-card/CardMartDeal';
import CardFreshBloom from './product-card/CardFreshBloom';
import type { ThemeProductCardProps } from './types';

export default function ProductCard(props: ThemeProductCardProps) {
  const { layout } = useStorefrontTheme();

  switch (layout.productCardVariant) {
    case 'fresh-bloom':
      return <CardFreshBloom {...props} />;
    case 'mart-deal':
      return <CardMartDeal {...props} />;
    case 'cocoa-tile':
      return <CardCocoaTile {...props} />;
    case 'organic-pill':
      return <CardOrganicPill {...props} />;
    case 'flat':
      return <CardFlat {...props} />;
    case 'elevated':
      return <CardElevated {...props} />;
    case 'compact':
      return <CardCompact {...props} />;
    case 'editorial':
      return <CardEditorial {...props} />;
    case 'bordered':
    default:
      return <CardBordered {...props} />;
  }
}

