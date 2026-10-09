import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const discountPct = compare ? Math.round(((compare - sale) / compare) * 100) : null;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--theme-shadow-card-hover)]"
      style={{
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow-card)',
      }}
    >
      {/* Image */}
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
            imageClassName={`transition-transform duration-500 ease-out group-hover:scale-[1.06] ${outOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className={`${PRODUCT_CARD_ASPECT_CLASS} flex items-center justify-center`} style={{ color: 'var(--theme-text-muted)' }}>
            <ShoppingBag className="h-10 w-10" strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        {outOfStock ? (
          <span
            className="absolute top-3 start-3 rounded-[var(--theme-radius-badge)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
            style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
          >
            {t('badgeSoldOut')}
          </span>
        ) : discountPct ? (
          <span className="absolute top-3 start-3 rounded-[var(--theme-radius-badge)] bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            -{discountPct}%
          </span>
        ) : null}

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)]/90 text-[var(--theme-text-muted)] opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:border-red-300 hover:text-red-500"
          tabIndex={-1}
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Add to cart overlay */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-200 ease-out group-hover:translate-y-0">
            <div
              className="flex items-center justify-center gap-2 py-3 text-sm font-semibold"
              style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
            >
              <ShoppingBag className="h-4 w-4" />
              {t('addToCart')}
            </div>
          </div>
        )}
      </Link>

      {/* Card body */}
      <Link
        to={`/${shopUsername}/product/${p.id}`}
        state={linkState}
        className="flex flex-1 flex-col gap-2 p-4 no-underline"
      >
        {p.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
            {p.category}
          </span>
        )}

        <h3
          className="line-clamp-2 text-sm font-bold leading-snug tracking-tight"
          style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
        >
          {localizedName}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className="h-3 w-3"
              style={{ color: s <= 4 ? '#f59e0b' : 'var(--theme-border)', fill: s <= 4 ? '#f59e0b' : 'var(--theme-border)' }}
            />
          ))}
          <span className="text-[10px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>(4.0)</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
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
        </div>
      </Link>
    </div>
  );
}
