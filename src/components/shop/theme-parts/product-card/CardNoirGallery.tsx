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
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: 'var(--theme-surface-secondary)' }}>
        {p.image ? (
          <img
            src={getProductImageDisplayUrl(p.image)}
            alt={name}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.08] ${outOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl" style={{ color: 'var(--theme-primary)' }}>✦</div>
        )}
        <span aria-hidden className="absolute inset-0 border transition-colors duration-500 group-hover:border-[var(--theme-primary)]" style={{ borderColor: 'transparent', margin: 10 }} />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 opacity-70"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}
        />
        {off > 0 ? (
          <span className="absolute end-3 top-3 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}>
            −{off}%
          </span>
        ) : null}
        {outOfStock ? (
          <span className="absolute start-3 top-3 border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.25em]" style={{ background: 'var(--theme-background)', borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}>
            {t('badgeSoldOut')}
          </span>
        ) : null}
        <span
          className="absolute inset-x-0 bottom-0 translate-y-full py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.3em] transition-transform duration-500 group-hover:translate-y-0"
          style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
        >
          {t('buyNow')}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {p.category ? (
            <span className="block text-[9px] font-semibold uppercase tracking-[0.35em]" style={{ color: 'var(--theme-text-muted)' }}>{p.category}</span>
          ) : null}
          <h3 className="mt-1.5 line-clamp-2 text-sm uppercase leading-snug tracking-[0.1em]" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
            {name}
          </h3>
        </div>
        <div className="shrink-0 text-end">
          <span className="block text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>{formatPrice(sale, currency)}</span>
          {compare ? <span className="block text-[11px] line-through" style={{ color: 'var(--theme-text-muted)' }}>{formatPrice(compare, currency)}</span> : null}
        </div>
      </div>
      <span className="mt-3 block h-px w-full origin-left scale-x-[0.15] transition-transform duration-700 group-hover:scale-x-100" style={{ background: 'var(--theme-primary)' }} />
    </Link>
  );
}