import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ShoppingBag } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { useCart } from '../../../../context/CartContext';
import { useShop } from '../../../../context/ShopContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import type { ThemeProductCardProps } from '../types';

/**
 * Mart deal card — white tile with a red sale badge, two-line name, category line,
 * bold price with the old price struck through, and an Add to Cart button that
 * reveals on hover (always visible below the lg breakpoint).
 */
export default function CardMartDeal({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName, categoryName } = useShopLanguage();
  const { shop } = useShop();
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
  const qty = p.stockQuantity;
  const lowStock = !soldOut && typeof qty === 'number' && qty > 0 && qty <= 5;
  const needsChoice = (p.options?.length ?? 0) > 0;
  const detailTo = `/${shopUsername}/product/${p.id}`;
  const cat = p.category ? shop?.categories?.find((c) => c.slug === p.category) : null;
  const catLabel = cat ? categoryName(cat) : p.category || '';

  function handleAdd() {
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

  return (
    <article
      className="group relative flex h-full flex-col rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--theme-shadow-card-hover)] focus-within:shadow-[var(--theme-shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)', boxShadow: 'var(--theme-shadow-card)' }}
    >
      <Link to={detailTo} state={linkState} aria-label={name} className="relative block overflow-hidden rounded-t-lg no-underline">
        <div className={`relative ${PRODUCT_CARD_ASPECT_CLASS}`} style={{ background: 'var(--theme-surface)' }}>
          {p.image ? (
            <img
              src={getProductImageDisplayUrl(p.image)}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-contain p-[9%] transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transition-none ${soldOut ? 'opacity-40 grayscale' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
              <ShoppingBag className="h-10 w-10 opacity-30" strokeWidth={1} />
            </div>
          )}
          {(pct || soldOut) && (
            <span
              className="absolute start-2.5 top-2.5 rounded px-2 py-1 text-[10px] font-bold leading-none"
              style={
                soldOut
                  ? { background: 'var(--theme-surface-secondary)', color: 'var(--theme-text-muted)' }
                  : { background: '#e53935', color: '#ffffff' }
              }
            >
              {soldOut ? t('badgeSoldOut') : `-${pct}%`}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <Link to={detailTo} state={linkState} className="no-underline">
          <h3
            className="line-clamp-2 min-h-[2.5em] text-xs font-medium leading-snug sm:text-[13px]"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-body)', letterSpacing: 0 }}
          >
            {name}
          </h3>
        </Link>

        <p className="mt-2 flex min-h-[1rem] items-center gap-1.5 text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
          {catLabel ? (
            <>
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: 'var(--theme-primary)' }} />
              <span className="truncate capitalize">{catLabel}</span>
            </>
          ) : null}
          {lowStock && (
            <span className="ms-auto shrink-0 font-semibold" style={{ color: '#d97706' }}>
              {t('lowStockLabel', { n: qty as number })}
            </span>
          )}
        </p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[15px] font-extrabold leading-none" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}>
            {formatPrice(sale, currency)}
          </span>
          {compare ? (
            <span className="text-[11px] line-through" style={{ color: 'var(--theme-text-muted)' }}>
              {formatPrice(compare, currency)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all hover:brightness-110 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-40 lg:translate-y-1 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> {t('added')}
            </>
          ) : (
            t('addToCart')
          )}
        </button>
      </div>
    </article>
  );
}
