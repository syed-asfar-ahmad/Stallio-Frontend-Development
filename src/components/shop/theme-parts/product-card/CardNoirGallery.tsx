import ShopImage from '../../../ShopImage';
import { Link } from 'react-router-dom';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import type { ThemeProductCardProps } from '../types';

export default function CardNoirGallery({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const name = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;
  const off = compare ? Math.round((1 - sale / compare) * 100) : 0;

  return (
    <Link to={`/${shopUsername}/product/${p.id}`} state={linkState} className="group block min-w-0 no-underline">
      <div className="relative aspect-[3/4] overflow-hidden" style={{ background: 'var(--theme-surface-secondary)' }}>
        {p.image ? (
          <ShopImage
            src={getProductImageDisplayUrl(p.image)}
            alt={name}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.07] ${outOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xl" style={{ color: 'var(--theme-primary)' }}>✦</div>
        )}
        {/* Inner border on hover */}
        <span aria-hidden className="absolute inset-[6px] border border-transparent transition-colors duration-500 group-hover:border-[var(--theme-primary)]" />
        {/* Bottom gradient */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 opacity-60"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}
        />
        {/* Sale badge */}
        {off > 0 ? (
          <span className="absolute end-2.5 top-2.5 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}>
            −{off}%
          </span>
        ) : null}
        {/* Sold out badge */}
        {outOfStock ? (
          <span className="absolute start-2.5 top-2.5 border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ background: 'var(--theme-background)', borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}>
            {t('badgeSoldOut')}
          </span>
        ) : null}
        {/* "View" CTA slide-up */}
        <span
          className="absolute inset-x-0 bottom-0 translate-y-full py-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.28em] transition-transform duration-500 group-hover:translate-y-0"
          style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
        >
          {t('buyNow')}
        </span>
      </div>

      {/* Info row */}
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          {p.category ? (
            <span className="block text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--theme-text-muted)' }}>{p.category}</span>
          ) : null}
          <h3 className="mt-0.5 line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm uppercase leading-snug tracking-[0.06em]" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
            {name}
          </h3>
        </div>
        <div className="shrink-0 text-end">
          <span className="block text-xs sm:text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>{formatPrice(sale, currency)}</span>
          {compare ? <span className="block text-[10px] sm:text-[11px] line-through" style={{ color: 'var(--theme-text-muted)' }}>{formatPrice(compare, currency)}</span> : null}
        </div>
      </div>
      {/* Gold accent line — expands on hover */}
      <span className="mt-1.5 block h-px w-full origin-left scale-x-[0.12] transition-transform duration-700 group-hover:scale-x-100" style={{ background: 'var(--theme-primary)' }} />
    </Link>
  );
}