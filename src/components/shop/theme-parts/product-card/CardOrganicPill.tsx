import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

export default function CardOrganicPill({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const localizedName = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;
  const discountPct = compare ? Math.round(((compare - sale) / compare) * 100) : null;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--theme-shadow-card-hover)]"
      style={{
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow-card)',
      }}
    >
      {/* Product Image Frame */}
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
            imageClassName={`transition-transform duration-700 ease-out group-hover:scale-[1.08] ${
              outOfStock ? 'opacity-40 grayscale' : ''
            }`}
          />
        ) : (
          <div
            className={`${PRODUCT_CARD_ASPECT_CLASS} flex items-center justify-center`}
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <ShoppingBag className="h-10 w-10 opacity-30" strokeWidth={1} />
          </div>
        )}

        {/* Floating Organic Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10">
          {outOfStock ? (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
              style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
            >
              {t('badgeSoldOut')}
            </span>
          ) : discountPct ? (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
              -{discountPct}% OFF
            </span>
          ) : p.isFeatured ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
              style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          ) : null}
        </div>

        {/* Wishlist Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)]/90 text-[var(--theme-text-muted)] opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:border-red-300 hover:text-red-500"
          tabIndex={-1}
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick View / Add To Cart Overlay Pill */}
        {!outOfStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-12 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm"
              style={{
                background: 'var(--theme-primary)',
                color: 'var(--theme-primary-contrast)',
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{t('addToCart')}</span>
            </div>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <Link
        to={`/${shopUsername}/product/${p.id}`}
        state={linkState}
        className="flex flex-1 flex-col gap-2 p-4 sm:p-5 no-underline"
      >
        {p.category && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {p.category}
          </span>
        )}

        <h3
          className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug tracking-tight"
          style={{
            color: 'var(--theme-text-primary)',
            fontFamily: 'var(--theme-font-heading)',
          }}
        >
          {localizedName}
        </h3>

        {/* Botanical Rating Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="h-3 w-3"
                style={{
                  color: s <= 5 ? '#eab308' : 'var(--theme-border)',
                  fill: s <= 5 ? '#eab308' : 'transparent',
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>
            (5.0)
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-2 flex items-baseline justify-between gap-2 border-t border-[var(--theme-border)]/60">
          <div className="flex items-baseline gap-2">
            <span
              className="text-base sm:text-lg font-bold"
              style={{ color: 'var(--theme-primary)' }}
            >
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
