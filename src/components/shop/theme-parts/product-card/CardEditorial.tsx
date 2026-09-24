import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import type { ThemeProductCardProps } from '../types';

export default function CardEditorial({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const localizedName = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const outOfStock = p.inStock === false;

  return (
    <Link
      to={`/${shopUsername}/product/${p.id}`}
      state={linkState}
      className="group block min-w-0 no-underline space-y-3"
    >
      <div
        className="relative overflow-hidden border"
        style={{
          borderColor: 'var(--theme-border)',
          background: 'var(--theme-surface-secondary)',
          borderRadius: 'var(--theme-radius-card)',
        }}
      >
        {p.image ? (
          <ProductImage
            src={p.image}
            alt={localizedName}
            aspectClass={PRODUCT_CARD_ASPECT_CLASS}
            loading="lazy"
            className="!bg-transparent"
            imageClassName={`transition-transform duration-700 ease-out group-hover:scale-105 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
          />
        ) : null}

        {outOfStock ? (
          <span
            className="absolute top-3 start-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-sm backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.75)', color: '#ffffff' }}
          >
            {t('badgeSoldOut')}
          </span>
        ) : compare ? (
          <span
            className="absolute top-3 start-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'var(--theme-primary)', color: '#ffffff' }}
          >
            Edition
          </span>
        ) : null}

        {/* Subtle Editorial Action Icon */}
        <div className="absolute bottom-3 end-3 h-8 w-8 rounded-full bg-white/90 text-stone-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md translate-y-2 group-hover:translate-y-0">
          <ArrowUpRight className="w-4 h-4 rtl:rotate-90" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-sm font-medium leading-snug line-clamp-2"
            style={{
              color: 'var(--theme-text-primary)',
              fontFamily: 'var(--theme-font-heading)',
            }}
          >
            {localizedName}
          </h3>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--theme-primary)' }}
          >
            {formatPrice(sale, currency)}
          </span>
          {compare ? (
            <span className="text-xs line-through opacity-60" style={{ color: 'var(--theme-text-muted)' }}>
              {formatPrice(compare, currency)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
