import ShopImage from '../../../ShopImage';
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
            <ShopImage
              src={getProductImageDisplayUrl(p.image)}
              alt=""
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-contain p-[6%] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04] motion-reduce:transition-none ${
                soldOut ? 'opacity-40 grayscale' : ''
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
              <ShoppingBag className="h-8 w-8 opacity-30" strokeWidth={1} />
            </div>
          )}
          {(soldOut || discountPct) && (
            <span
              className="absolute start-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-semibold leading-none"
              style={{ background: soldOut ? 'var(--theme-badge-bg)' : 'var(--theme-secondary)', color: soldOut ? 'var(--theme-badge-text)' : 'var(--theme-bg)' }}
            >
              {soldOut ? t('badgeSoldOut') : `-${discountPct}%`}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-2.5 sm:pt-3">
        <Link to={detailTo} state={linkState} className="flex flex-1 flex-col no-underline">
          <div className="flex items-center justify-between gap-1.5">
            <p className="flex items-baseline gap-1.5">
              <span
                className="text-[0.95rem] font-bold leading-none sm:text-base"
                style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                {formatPrice(sale, currency)}
              </span>
              {compare ? (
                <span className="text-[10px] line-through sm:text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  {formatPrice(compare, currency)}
                </span>
              ) : null}
            </p>
            {categoryLabel ? (
              <span
                className="max-w-[48%] truncate rounded-full px-2 py-0.5 text-[9px] font-medium capitalize leading-none sm:text-[10px]"
                style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-badge-text)' }}
              >
                {categoryLabel}
              </span>
            ) : null}
          </div>
          <h3
            className="mt-1.5 line-clamp-1 text-xs font-semibold leading-snug sm:text-[13px]"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-body)', letterSpacing: 0 }}
          >
            {name}
          </h3>
          <p
            className="mt-0.5 line-clamp-2 min-h-[2em] text-[10px] leading-[1.15rem] sm:text-[11px]"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {blurb}
          </p>
        </Link>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="inline-flex h-8 sm:h-8.5 items-center justify-center gap-1 rounded-[var(--theme-radius-btn)] px-1.5 text-[11px] font-semibold transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-text-primary)' }}
          >
            {justAdded ? (
              <>
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
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
            className="inline-flex h-8 sm:h-8.5 items-center justify-center rounded-[var(--theme-radius-btn)] px-1.5 text-[11px] font-semibold transition-colors hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
          >
            {t('buyNow')}
          </button>
        </div>
      </div>
    </article>
  );
}
