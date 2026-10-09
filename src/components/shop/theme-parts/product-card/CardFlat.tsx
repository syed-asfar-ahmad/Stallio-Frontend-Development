import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

// Flat card — ultra-minimal for modern-minimal and noir-luxe themes.
// No border radius on images, borderless card, editorial typographic feel.
export default function CardFlat({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const localizedName = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;

  return (
    <Link to={`/${shopUsername}/product/${p.id}`} state={linkState} className="group block min-w-0 no-underline">
      {/* Image — no radius, slight overlay on hover */}
      <div className="relative overflow-hidden" style={{ background: 'var(--theme-surface-secondary)' }}>
        {p.image ? (
          <ProductImage
            src={p.image}
            alt={localizedName}
            aspectClass={PRODUCT_CARD_ASPECT_CLASS}
            loading="lazy"
            className="!bg-transparent"
            imageClassName={`transition-transform duration-700 ease-out group-hover:scale-[1.05] ${outOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className={`${PRODUCT_CARD_ASPECT_CLASS} flex items-center justify-center`} style={{ color: 'var(--theme-text-muted)' }}>
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h12M17 21a1 1 0 100-2 1 1 0 000 2zm-8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>
        )}

        {/* Sold-out label — understated, flat style */}
        {outOfStock ? (
          <span
            className="absolute bottom-3 start-3 px-2.5 py-0.5 text-[10px] font-light uppercase tracking-[0.2em]"
            style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }}
          >
            {t('badgeSoldOut')}
          </span>
        ) : null}

        {/* Wishlist — appears on hover */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 end-2 flex h-7 w-7 items-center justify-center bg-[var(--theme-surface)]/80 text-[var(--theme-text-muted)] opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:text-red-500"
          tabIndex={-1}
          aria-label="Wishlist"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Minimal text content — no card, no border */}
      <div className="mt-3 min-w-0 space-y-1">
        {p.category && (
          <span
            className="block text-[9px] font-medium uppercase tracking-[0.15em]"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {p.category}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm leading-snug" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', fontWeight: 300 }}>
          {localizedName}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
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
