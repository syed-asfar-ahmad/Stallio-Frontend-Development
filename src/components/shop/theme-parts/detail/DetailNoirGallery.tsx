import ShopImage from '../../../ShopImage';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import type { Product, Shop, ShopCategory } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getEffectivePrice } from '../../../../context/CartContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import type { getShopDisplayProductOptions } from '../../../../lib/shopContentLanguages';
import ProductCard from '../ProductCard';

type Props = {
  shop: Shop;
  username: string;
  product: Product;
  related: Product[];
  displayName: string;
  displayDescription?: string | null;
  images: string[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  options: ReturnType<typeof getShopDisplayProductOptions>;
  selected: Record<string, string>;
  setSelected: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  message: string;
  setMessage: (v: string) => void;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  error: string;
  clearError: () => void;
  anim: 'idle' | 'adding' | 'success';
  animMode: 'cart' | 'buy' | null;
  onAddToCart: () => void;
  onBuyNow: () => void;
  backTo: string;
  backLabel: string;
  navCategory?: ShopCategory | null;
  [key: string]: unknown;
};

const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

export default function DetailNoirGallery(props: Props) {
  const { shop, username, product, related, displayName, displayDescription, images, activeIndex, setActiveIndex,
    options, selected, setSelected, message, setMessage, qty, setQty, error, clearError, anim, animMode,
    onAddToCart, onBuyNow, backTo, backLabel } = props;
  const { t } = useShopLanguage();

  const chosen = Object.values(selected).some(Boolean) ? selected : null;
  const unit = getEffectivePrice(product, chosen);
  const compare = product.compareAtPrice != null && product.compareAtPrice > unit ? product.compareAtPrice : null;
  const out = product.inStock === false;
  const main = images[activeIndex] ?? images[0];
  const busy = anim !== 'idle';

  return (
    <main className={`${containerClass} pb-20 pt-8 lg:pb-32 lg:pt-12`}>
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] no-underline"
        style={{ color: 'var(--theme-text-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {backLabel}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {images.length > 1 ? (
            <div className="flex gap-3 sm:w-20 sm:flex-col">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden border sm:w-full"
                  style={{ borderColor: i === activeIndex ? 'var(--theme-primary)' : 'var(--theme-border)' }}
                >
                  <ShopImage src={getProductImageDisplayUrl(img)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
          <div className="relative flex-1">
            <span aria-hidden className="absolute -bottom-4 -end-4 h-full w-full border" style={{ borderColor: 'var(--theme-primary)' }} />
            <div className="relative aspect-[4/5] overflow-hidden" style={{ background: 'var(--theme-surface-secondary)' }}>
              {main ? (
                <ShopImage src={getProductImageDisplayUrl(main)} alt={displayName} className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:pt-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.4em]" style={{ color: 'var(--theme-primary)' }}>
            ✦ {product.category || shop.shopName}
          </span>
          <h1
            className="mt-5 text-3xl uppercase leading-[1.1] tracking-[0.1em] lg:text-5xl"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
          >
            {displayName}
          </h1>
          <span className="mt-6 block h-px w-16" style={{ background: 'var(--theme-primary)' }} />
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl" style={{ color: 'var(--theme-primary)' }}>{formatPrice(unit, shop.currency)}</span>
            {compare ? <span className="text-base line-through" style={{ color: 'var(--theme-text-muted)' }}>{formatPrice(compare, shop.currency)}</span> : null}
          </div>
          {out ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--theme-primary)' }}>{t('outOfStock')}</p> : null}
          {displayDescription ? (
            <p className="mt-6 text-[15px] leading-[1.9]" style={{ color: 'var(--theme-text-secondary)' }}>{displayDescription}</p>
          ) : null}

          {options.map((opt) => (
            <div key={opt.canonicalName} className="mt-8">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--theme-text-muted)' }}>
                {opt.name}{opt.required ? ' *' : ''}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {opt.choices.map((choice, ci) => {
                  const canon = opt.canonicalChoices[ci] ?? choice;
                  const on = selected[opt.canonicalName] === canon;
                  return (
                    <button
                      key={`${opt.canonicalName}-${ci}`}
                      type="button"
                      onClick={() => { setSelected((p) => ({ ...p, [opt.canonicalName]: on ? '' : canon })); clearError(); }}
                      className="border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
                      style={on
                        ? { background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)', borderColor: 'var(--theme-primary)' }
                        : { borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {product.allowCustomerMessage ? (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={t('messagePlaceholder')}
              className="mt-8 w-full border-0 border-b bg-transparent px-0 py-3 text-sm focus:outline-none"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
            />
          ) : null}
          {error ? <p className="mt-4 text-sm" style={{ color: 'var(--theme-primary)' }}>{error}</p> : null}

          <div className="mt-10 flex flex-wrap items-stretch gap-3">
            <div className="flex items-center border" style={{ borderColor: 'var(--theme-border)' }}>
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3" style={{ color: 'var(--theme-text-primary)' }}>−</button>
              <span className="min-w-[2rem] text-center text-sm tabular-nums" style={{ color: 'var(--theme-text-primary)' }}>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} className="px-4 py-3" style={{ color: 'var(--theme-text-primary)' }}>+</button>
            </div>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={out || busy}
              className="flex flex-1 items-center justify-center gap-2 border px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] disabled:opacity-50"
              style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
            >
              {anim === 'adding' && animMode === 'cart' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {anim === 'success' && animMode === 'cart' ? <Check className="h-4 w-4" /> : null}
              {t('addToCart')}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              disabled={out || busy}
              className="flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] disabled:opacity-50"
              style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
            >
              {anim === 'adding' && animMode === 'buy' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t('buyNow')}
            </button>
          </div>
          {shop.refundEnabled ? (
            <Link to={`/${username}/refund`} className="mt-6 inline-block text-xs underline" style={{ color: 'var(--theme-primary)' }}>
              {t('returnExchangePolicy')}
            </Link>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-24 lg:mt-36">
          <div className="mb-12 text-center">
            <h2 className="text-2xl uppercase tracking-[0.18em] lg:text-4xl" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
              {t('homeMoreTitle')}
            </h2>
            <span className="mx-auto mt-5 block h-px w-16" style={{ background: 'var(--theme-primary)' }} />
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'products' }} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}