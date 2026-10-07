import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

// Shopcart-style card: always-visible "Add to Cart" button, star ratings, description line.
export default function CardBordered({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName, productDescription } = useShopLanguage();
  const localizedName = productName(p);
  const localizedDesc = productDescription(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;
  const discountPct = compare ? Math.round(((compare - sale) / compare) * 100) : null;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] transition-shadow duration-200 hover:shadow-[var(--theme-shadow-card-hover)]"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      {/* ── Image ── */}
      <Link
        to={`/${shopUsername}/product/${p.id}`}
        state={linkState}
        className="relative block overflow-hidden no-underline"
        style={{ background: 'var(--theme-surface-secondary)' }}
        tabIndex={-1}
        aria-hidden
      >
        {p.image ? (
          <ProductImage
            src={p.image}
            alt={localizedName}
            aspectClass={PRODUCT_CARD_ASPECT_CLASS}
            loading="lazy"
            imageClassName={`transition-transform duration-500 group-hover:scale-[1.04] ${outOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div
            className={`${PRODUCT_CARD_ASPECT_CLASS} flex items-center justify-center`}
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <ShoppingCart className="h-10 w-10" strokeWidth={1} />
          </div>
        )}

        {/* Sale badge */}
        {!outOfStock && discountPct ? (
          <span className="absolute top-2 start-2 rounded-[var(--theme-radius-badge)] bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            -{discountPct}%
          </span>
        ) : outOfStock ? (
          <span
            className="absolute top-2 start-2 rounded-[var(--theme-radius-badge)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
          >
            {t('badgeSoldOut')}
          </span>
        ) : null}

        {/* Wishlist button — always visible top-right */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 end-2 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-muted)] shadow-sm transition-colors hover:border-red-300 hover:text-red-500"
          aria-label="Wishlist"
          tabIndex={-1}
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
      </Link>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Name */}
        <Link
          to={`/${shopUsername}/product/${p.id}`}
          state={linkState}
          className="no-underline"
        >
          <h3
            className="line-clamp-2 text-sm font-bold leading-snug hover:underline"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {localizedName}
          </h3>
        </Link>

        {/* Description */}
        {localizedDesc && (
          <p className="line-clamp-1 text-[11px] leading-snug" style={{ color: 'var(--theme-text-muted)' }}>
            {localizedDesc}
          </p>
        )}

        {/* Star ratings */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className="h-3 w-3"
              style={{
                color: s <= 4 ? '#f59e0b' : '#d1d5db',
                fill: s <= 4 ? '#f59e0b' : '#d1d5db',
              }}
            />
          ))}
          <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>(121)</span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold" style={{ color: 'var(--theme-primary)' }}>
            {formatPrice(sale, currency)}
          </span>
          {compare ? (
            <span className="text-[11px] line-through" style={{ color: 'var(--theme-text-muted)' }}>
              {formatPrice(compare, currency)}
            </span>
          ) : null}
        </div>

        {/* ── Add to Cart button — always visible, Shopcart outline style ── */}
        <div className="mt-auto pt-1.5">
          {outOfStock ? (
            <span
              className="flex w-full items-center justify-center rounded-[var(--theme-radius-btn)] border px-3 py-2 text-xs font-semibold opacity-50"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
            >
              {t('badgeSoldOut')}
            </span>
          ) : (
            <Link
              to={`/${shopUsername}/product/${p.id}`}
              state={linkState}
              className="flex w-full items-center justify-center gap-1.5 rounded-[var(--theme-radius-btn)] border-2 px-3 py-2 text-xs font-semibold text-theme-primary no-underline transition-colors hover:border-theme-primary hover:bg-theme-primary hover:text-theme-primary-contrast"
              style={{ borderColor: 'var(--theme-primary)' }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {t('addToCart')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
