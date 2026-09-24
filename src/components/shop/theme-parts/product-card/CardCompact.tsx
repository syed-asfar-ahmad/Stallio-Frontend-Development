import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

export default function CardCompact({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const localizedName = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;

  return (
    <div
      className="group flex flex-col justify-between overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] transition-colors hover:border-[var(--theme-primary)]"
      style={{
        borderColor: 'var(--theme-border)',
      }}
    >
      <Link
        to={`/${shopUsername}/product/${p.id}`}
        state={linkState}
        className="block min-w-0 no-underline"
      >
        <div className="relative overflow-hidden bg-[var(--theme-surface-secondary)]">
          {p.image ? (
            <ProductImage
              src={p.image}
              alt={localizedName}
              aspectClass={PRODUCT_CARD_ASPECT_CLASS}
              loading="lazy"
              imageClassName={`transition-transform duration-300 group-hover:scale-105 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
            />
          ) : null}

          {outOfStock && (
            <span
              className="absolute top-1.5 start-1.5 rounded-[var(--theme-radius-badge)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
            >
              {t('badgeSoldOut')}
            </span>
          )}
        </div>

        <div className="p-2.5">
          <h3
            className="truncate text-xs font-semibold leading-tight"
            style={{ color: 'var(--theme-text-primary)' }}
            title={localizedName}
          >
            {localizedName}
          </h3>

          <div className="mt-1 flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1 truncate">
              <span className="text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>
                {formatPrice(sale, currency)}
              </span>
              {compare ? (
                <span className="text-[10px] line-through" style={{ color: 'var(--theme-text-muted)' }}>
                  {formatPrice(compare, currency)}
                </span>
              ) : null}
            </div>

            <span
              className="p-1 rounded text-theme-muted group-hover:text-theme-primary-contrast group-hover:bg-[var(--theme-primary)] transition-colors"
              title="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
