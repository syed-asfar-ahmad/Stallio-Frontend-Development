import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Plus, ShoppingBag } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { useCart } from '../../../../context/CartContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import { FRESH_INK, FRESH_LIME, FRESH_PEACH, isRecentlyAdded, shapeFor } from '../fresh/FreshParts';
import type { ThemeProductCardProps } from '../types';

/**
 * Fresh card — peach tile with a pastel arch behind the product, a New tag, a lime quick-add
 * button, and centered name + price underneath.
 */
export default function CardFreshBloom({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName } = useShopLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const name = productName(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const pct = compare ? Math.round(((compare - sale) / compare) * 100) : null;
  const soldOut = p.inStock === false;
  const fresh = !soldOut && isRecentlyAdded(p);
  const needsChoice = (p.options?.length ?? 0) > 0;
  const detailTo = `/${shopUsername}/product/${p.id}`;

  function quickAdd() {
    if (soldOut) return;
    if (needsChoice) {
      navigate(detailTo, { state: linkState });
      return;
    }
    addToCart(p, 1, null, null);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  }

  const tag = 'rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold leading-none text-[#1e1611] shadow-sm';

  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[var(--theme-radius-card)]" style={{ background: FRESH_PEACH }}>
        <Link to={detailTo} state={linkState} aria-label={name} className="relative block aspect-[4/5] no-underline">
          <span
            aria-hidden
            className="absolute inset-x-[16%] bottom-0 h-[64%] rounded-t-full transition-transform duration-500 group-hover:scale-y-105"
            style={{ background: shapeFor(p.id), transformOrigin: 'bottom' }}
          />
          {p.image ? (
            <img
              src={getProductImageDisplayUrl(p.image)}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-contain p-[13%] drop-shadow-[0_14px_14px_rgb(30_22_17/0.14)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.04] motion-reduce:transition-none ${soldOut ? 'opacity-40 grayscale' : ''}`}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
              <ShoppingBag className="h-10 w-10 opacity-30" strokeWidth={1} />
            </span>
          )}
        </Link>

        <div className="pointer-events-none absolute start-3 top-3 flex gap-1.5">
          {fresh && <span className={tag}>{t('newBadge')}</span>}
          {pct ? <span className={tag}>-{pct}%</span> : null}
          {soldOut && <span className={tag}>{t('badgeSoldOut')}</span>}
        </div>

        <button
          type="button"
          onClick={quickAdd}
          disabled={soldOut}
          aria-label={t('addToCart')}
          title={t('addToCart')}
          className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-lg shadow-md transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 lg:translate-y-1 lg:opacity-0 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          style={{ background: FRESH_LIME, color: FRESH_INK }}
        >
          {added ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
        </button>
      </div>

      <Link to={detailTo} state={linkState} className="mt-3.5 flex flex-col items-center px-1 text-center no-underline">
        <h3
          className="line-clamp-1 text-[13px] font-medium leading-snug sm:text-sm"
          style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-body)', letterSpacing: 0 }}
        >
          {name}
        </h3>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>{formatPrice(sale, currency)}</span>
          {compare ? (
            <span className="text-xs line-through" style={{ color: 'var(--theme-text-muted)' }}>{formatPrice(compare, currency)}</span>
          ) : null}
        </p>
      </Link>
    </article>
  );
}
