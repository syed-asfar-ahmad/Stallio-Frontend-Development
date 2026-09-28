import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

export default function CardBordered({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const localizedName = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;

  return (
    <Link
      to={`/${shopUsername}/product/${p.id}`}
      state={linkState}
      className="group block min-w-0 overflow-hidden rounded-[var(--theme-radius-card)] border no-underline shadow-[var(--theme-shadow-card)] transition-all hover:shadow-[var(--theme-shadow-card-hover)]"
      style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
    >
      <div className="relative">
        {p.image ? (
          <ProductImage
            src={p.image}
            alt={localizedName}
            aspectClass={PRODUCT_CARD_ASPECT_CLASS}
            loading="lazy"
            imageClassName={`transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
          />
        ) : null}
        {outOfStock ? (
          <span
            className="absolute bottom-2 start-2 rounded-[var(--theme-radius-badge)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
          >
            {t('badgeSoldOut')}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
          {localizedName}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-bold" style={{ color: 'var(--theme-primary)' }}>
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
