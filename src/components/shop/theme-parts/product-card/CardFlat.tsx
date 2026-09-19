import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

export default function CardFlat({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const localizedName = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;

  return (
    <Link to={`/${shopUsername}/product/${p.id}`} state={linkState} className="group block min-w-0 no-underline">
      <div className="relative overflow-hidden" style={{ background: 'var(--theme-surface-secondary)' }}>
        {p.image ? (
          <ProductImage
            src={p.image}
            alt={localizedName}
            aspectClass={PRODUCT_CARD_ASPECT_CLASS}
            loading="lazy"
            className="!bg-transparent"
            imageClassName={`transition-transform duration-700 ease-out group-hover:scale-105 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
          />
        ) : null}
        {outOfStock ? (
          <span
            className="absolute bottom-3 start-3 px-2.5 py-1 text-[10px] font-light uppercase tracking-[0.2em]"
            style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }}
          >
            {t('badgeSoldOut')}
          </span>
        ) : null}
      </div>
      <div className="mt-3 min-w-0">
        <h3 className="truncate text-sm font-light" style={{ color: 'var(--theme-text-primary)' }}>
          {localizedName}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-light" style={{ color: 'var(--theme-text-secondary)' }}>
            {formatPrice(sale, currency)}
          </span>
          {compare ? (
            <span className="text-xs line-through" style={{ color: 'var(--theme-text-muted)' }}>
              {formatPrice(compare, currency)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
