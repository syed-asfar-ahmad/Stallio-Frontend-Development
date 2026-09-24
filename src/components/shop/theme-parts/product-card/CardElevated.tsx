import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

export default function CardElevated({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const localizedName = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow-card)',
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
              imageClassName={`transition-transform duration-500 ease-out group-hover:scale-108 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
            />
          ) : null}

          {outOfStock ? (
            <span
              className="absolute top-2.5 start-2.5 rounded-[var(--theme-radius-badge)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
              style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
            >
              {t('badgeSoldOut')}
            </span>
          ) : compare ? (
            <span
              className="absolute top-2.5 start-2.5 rounded-[var(--theme-radius-badge)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm"
              style={{ background: 'var(--theme-primary)' }}
            >
              Sale
            </span>
          ) : null}

          {/* Quick Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-md transition-transform scale-95 group-hover:scale-100"
              style={{ background: 'var(--theme-primary)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <h3
            className="truncate text-sm font-bold tracking-tight transition-colors"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {localizedName}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold" style={{ color: 'var(--theme-primary)' }}>
                {formatPrice(sale, currency)}
              </span>
              {compare ? (
                <span className="text-xs line-through" style={{ color: 'var(--theme-text-muted)' }}>
                  {formatPrice(compare, currency)}
                </span>
              ) : null}
            </div>

            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform active:scale-95 group-hover:rotate-6"
              style={{ background: 'var(--theme-primary)' }}
              aria-hidden
            >
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
