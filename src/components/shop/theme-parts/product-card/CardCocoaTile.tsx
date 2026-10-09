import { useRef, useState, useEffect } from 'react';
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
 * Cocoa Tile card — stone image panel, price + category chip on one line, name, two-line blurb,
 * then a paired "Add to Cart" (oat) and "Buy Now" (cocoa) action row.
 * Products that need a choice (options) send both actions to the detail page instead.
 */
export default function CardCocoaTile({ product: p, shopUsername, currency, linkState }: ThemeProductCardProps) {
  const { t, productName, productDescription, categoryName } = useShopLanguage();
  const { shop } = useShop();
  const { addToCart, openCheckout } = useCart();
  const navigate = useNavigate();

  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const name = productName(p);
  const blurb = productDescription(p);
  const sale = Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  const discountPct = compare ? Math.round(((compare - sale) / compare) * 100) : null;
  const soldOut = p.inStock === false;
  const needsChoice = (p.options?.length ?? 0) > 0;
  const detailTo = `/${shopUsername}/product/${p.id}`;

  const cat = p.category ? shop?.categories?.find((c) => c.slug === p.category) : null;
  const categoryLabel = cat ? categoryName(cat) : p.category || '';

  function handleAdd() {
    if (soldOut) return;
    if (needsChoice) {
      navigate(detailTo, { state: linkState });
      return;
    }
    addToCart(p, 1, null, null);
    setJustAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1400);
  }

  function handleBuy() {
    if (soldOut) return;
    if (needsChoice) {
      navigate(detailTo, { state: linkState });
      return;
    }
    addToCart(p, 1, null, null);
    openCheckout();
  }

  return (
    <article className="group flex h-full flex-col">
      <Link
        to={detailTo}
        state={linkState}
        aria-label={name}
        className="relative block overflow-hidden rounded-[calc(var(--theme-radius-card)*0.8)] no-underline"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--theme-surface) 70%, var(--theme-surface-secondary)) 0%, var(--theme-surface-secondary) 100%)',
        }}
      >
        <div className={`relative ${PRODUCT_CARD_ASPECT_CLASS}`}>
          {p.image ? (
            <img
              src={getProductImageDisplayUrl(p.image)}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-contain p-[9%] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.05] motion-reduce:transition-none ${
                soldOut ? 'opacity-40 grayscale' : ''
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
              <ShoppingBag className="h-10 w-10 opacity-30" strokeWidth={1} />
            </div>
          )}
          {(soldOut || discountPct) && (
            <span
              className="absolute start-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none"
              style={{ background: soldOut ? 'var(--theme-badge-bg)' : 'var(--theme-secondary)', color: soldOut ? 'var(--theme-badge-text)' : 'var(--theme-bg)' }}
            >
              {soldOut ? t('badgeSoldOut') : `-${discountPct}%`}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        <Link to={detailTo} state={linkState} className="flex flex-1 flex-col no-underline">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-baseline gap-2">
              <span
                className="text-[1.0625rem] font-bold leading-none sm:text-lg"
                style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                {formatPrice(sale, currency)}
              </span>
              {compare ? (
                <span className="text-xs line-through" style={{ color: 'var(--theme-text-muted)' }}>
                  {formatPrice(compare, currency)}
                </span>
              ) : null}
            </p>
            {categoryLabel ? (
              <span
                className="max-w-[48%] truncate rounded-full px-2.5 py-1 text-[10px] font-medium capitalize leading-none"
                style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-badge-text)' }}
              >
                {categoryLabel}
              </span>
            ) : null}
          </div>
          <h3
            className="mt-2.5 line-clamp-1 text-[13px] font-semibold leading-snug sm:text-sm"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-body)', letterSpacing: 0 }}
          >
            {name}
          </h3>
          <p
            className="mt-1 line-clamp-2 min-h-[2.4em] text-[11px] leading-[1.2rem]"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {blurb}
          </p>
        </Link>

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--theme-radius-btn)] px-2 text-xs font-semibold transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-text-primary)' }}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                {t('added')}
              </>
            ) : (
              t('addToCart')
            )}
          </button>
          <button
            type="button"
            onClick={handleBuy}
            disabled={soldOut}
            className="inline-flex h-9 items-center justify-center rounded-[var(--theme-radius-btn)] px-2 text-xs font-semibold transition-colors hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
          >
            {t('buyNow')}
          </button>
        </div>
      </div>
    </article>
  );
}
