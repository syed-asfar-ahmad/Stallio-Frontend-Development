import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const discountPct = compare ? Math.round(((compare - sale) / compare) * 100) : null;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] transition-all duration-200 hover:border-[var(--theme-primary)] hover:shadow-[var(--theme-shadow-card-hover)]"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <Link
        to={`/${shopUsername}/product/${p.id}`}
        state={linkState}
        className="relative block overflow-hidden no-underline"
        style={{ background: 'var(--theme-surface-secondary)' }}
      >
        {p.image ? (
          <ProductImage
            src={p.image}
            alt={localizedName}
            aspectClass={PRODUCT_CARD_ASPECT_CLASS}
            loading="lazy"
            imageClassName={`transition-transform duration-300 group-hover:scale-[1.04] ${outOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className={`${PRODUCT_CARD_ASPECT_CLASS} flex items-center justify-center`} style={{ color: 'var(--theme-text-muted)' }}>
            <ShoppingCart className="h-8 w-8" strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        {outOfStock ? (
          <span
            className="absolute top-1.5 start-1.5 rounded-[var(--theme-radius-badge)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
            style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
          >
            {t('badgeSoldOut')}
          </span>
        ) : discountPct ? (
          <span className="absolute top-1.5 start-1.5 rounded-[var(--theme-radius-badge)] bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            -{discountPct}%
          </span>
        ) : null}

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-1.5 end-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)]/90 text-[var(--theme-text-muted)] opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:text-red-500"
          tabIndex={-1}
          aria-label="Wishlist"
        >
          <Heart className="h-3 w-3" />
        </button>
      </Link>

      <Link
        to={`/${shopUsername}/product/${p.id}`}
        state={linkState}
        className="flex flex-1 flex-col p-2.5 no-underline"
      >
        {p.category && (
          <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: 'var(--theme-text-muted)' }}>
            {p.category}
          </span>
        )}

        <h3
          className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug"
          style={{ color: 'var(--theme-text-primary)' }}
          title={localizedName}
        >
          {localizedName}
        </h3>

        {/* Stars */}
        <div className="mt-1 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className="h-2.5 w-2.5"
              style={{ color: s <= 4 ? '#f59e0b' : 'var(--theme-border)', fill: s <= 4 ? '#f59e0b' : 'var(--theme-border)' }}
            />
          ))}
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>
              {formatPrice(sale, currency)}
            </span>
            {compare ? (
              <span className="text-[10px] line-through" style={{ color: 'var(--theme-text-muted)' }}>
                {formatPrice(compare, currency)}
              </span>
            ) : null}
          </div>

          {!outOfStock && (
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--theme-radius-btn)] transition-all"
              style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
              title={t('addToCart')}
            >
              <ShoppingCart className="h-3 w-3" />
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
