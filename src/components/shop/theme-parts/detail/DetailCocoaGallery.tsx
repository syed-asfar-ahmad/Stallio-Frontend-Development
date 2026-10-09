import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Loader2, MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getEffectivePrice } from '../../../../context/CartContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import {
  getLocalizedCustomerMessageLabel,
  getLocalizedTrustLabel,
  type getShopDisplayProductOptions,
} from '../../../../lib/shopContentLanguages';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../../lib/trustBadgeIcons';
import ProductCard from '../ProductCard';
import { CocoaHeading } from '../cocoa/CocoaParts';
import type { Product, Shop, ShopCategory } from '../../../../types';

type DisplayOption = ReturnType<typeof getShopDisplayProductOptions>[number];

export type DetailCocoaGalleryProps = {
  shop: Shop;
  username: string;
  product: Product;
  related: Product[];
  displayName: string;
  displayDescription: string;
  images: string[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  options: DisplayOption[];
  selected: Record<string, string>;
  setSelected: Dispatch<SetStateAction<Record<string, string>>>;
  message: string;
  setMessage: (v: string) => void;
  qty: number;
  setQty: Dispatch<SetStateAction<number>>;
  error: string;
  clearError: () => void;
  anim: 'idle' | 'adding' | 'success';
  animMode: 'cart' | 'buy' | null;
  onAddToCart: () => void;
  onBuyNow: () => void;
  backTo: string;
  backLabel: string;
  navFrom?: string;
  navCategorySlug?: string | null;
  navCategory?: ShopCategory | null;
};

export default function DetailCocoaGallery(p: DetailCocoaGalleryProps) {
  const { t, lang, categoryName } = useShopLanguage();
  const { product, shop, username } = p;

  const soldOut = product.inStock === false;
  const sale = getEffectivePrice(product, Object.keys(p.selected).length ? p.selected : null);
  const compare = product.compareAtPrice != null && product.compareAtPrice > sale ? product.compareAtPrice : null;
  const discountPct = compare ? Math.round(((compare - sale) / compare) * 100) : null;
  const activeImage = p.images[Math.min(p.activeIndex, Math.max(0, p.images.length - 1))] ?? null;

  const cat = product.category ? shop.categories?.find((c) => c.slug === product.category) : null;
  const categoryLabel = cat ? categoryName(cat) : product.category || '';

  const trust = shop.homeTrustEnabled ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()).slice(0, 4) : [];

  const crumb = 'font-medium no-underline transition-colors hover:text-[var(--theme-primary)]';

  return (
    <main className="w-full max-w-7xl mx-auto px-3 pb-16 pt-5 sm:px-4 lg:px-5 lg:pb-28 lg:pt-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mb-10">
        <Link
          to={p.backTo}
          className="inline-flex items-center gap-2 text-sm font-semibold no-underline transition-colors hover:text-[var(--theme-primary)]"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {p.backLabel}
        </Link>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-1.5 text-xs"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          <Link to={`/${username}`} className={crumb}>
            {t('breadcrumbHome')}
          </Link>
          {p.navFrom === 'category' && p.navCategorySlug ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
              <Link to={`/${username}/category/${p.navCategorySlug}`} className={crumb}>
                {p.navCategory ? categoryName(p.navCategory) : p.navCategorySlug}
              </Link>
            </>
          ) : p.navFrom === 'products' ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
              <Link to={`/${username}/products`} className={crumb}>
                {t('breadcrumbProducts')}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
          <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            {p.displayName}
          </span>
        </nav>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        {/* ── Gallery ── */}
        <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start lg:gap-4">
          <div
            className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[var(--theme-radius-card)]"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--theme-surface) 70%, var(--theme-surface-secondary)) 0%, var(--theme-surface-secondary) 100%)',
            }}
          >
            {activeImage ? (
              <img
                key={activeImage}
                src={getProductImageDisplayUrl(activeImage)}
                alt={p.displayName}
                className={`absolute inset-0 h-full w-full animate-[cocoaFade_450ms_ease-out_both] object-contain p-[8%] motion-reduce:animate-none ${soldOut ? 'opacity-50 grayscale' : ''}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
                <ShoppingBag className="h-16 w-16 opacity-30" strokeWidth={1} />
              </div>
            )}
            {discountPct ? (
              <span
                className="absolute start-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold leading-none"
                style={{ background: 'var(--theme-secondary)', color: 'var(--theme-bg)' }}
              >
                -{discountPct}%
              </span>
            ) : null}
          </div>

          {p.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 lg:max-h-[38rem] lg:w-[4.75rem] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
              {p.images.map((img, i) => {
                const on = i === Math.min(p.activeIndex, p.images.length - 1);
                return (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => p.setActiveIndex(i)}
                    aria-label={t('viewImage', { n: i + 1 })}
                    aria-current={on}
                    className="relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl transition-all lg:h-[4.75rem] lg:w-[4.75rem]"
                    style={{
                      background: 'var(--theme-surface-secondary)',
                      outline: on ? '2px solid var(--theme-primary)' : '2px solid transparent',
                      outlineOffset: 2,
                      opacity: on ? 1 : 0.7,
                    }}
                  >
                    <img src={getProductImageDisplayUrl(img)} alt="" className="absolute inset-0 h-full w-full object-contain p-1.5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Buy box ── */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {categoryLabel ? (
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-medium capitalize leading-none"
                style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-badge-text)' }}
              >
                {categoryLabel}
              </span>
            ) : null}
            {soldOut ? (
              <span className="text-xs font-semibold" style={{ color: '#b42318' }}>
                {t('outOfStock')}
              </span>
            ) : null}
          </div>

          <h1
            className="mt-4 text-[2.1rem] font-semibold leading-[1.06] sm:text-5xl"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.035em', textWrap: 'balance' as never }}
          >
            {p.displayName}
          </h1>

          <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className="text-3xl font-bold leading-none"
              style={{ color: 'var(--theme-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {formatPrice(sale, shop.currency)}
            </span>
            {compare ? (
              <span className="text-base line-through" style={{ color: 'var(--theme-text-muted)' }}>
                {formatPrice(compare, shop.currency)}
              </span>
            ) : null}
          </p>

          {p.displayDescription ? (
            <p className="mt-6 max-w-xl whitespace-pre-line text-[15px] leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
              {p.displayDescription}
            </p>
          ) : null}

          {/* Options as chips */}
          {(p.options.length > 0 || product.allowCustomerMessage) && (
            <div className="mt-8 space-y-6 border-t pt-7" style={{ borderColor: 'var(--theme-border)' }}>
              {p.options.map((opt) => {
                const current = p.selected[opt.canonicalName];
                return (
                  <fieldset key={opt.canonicalName}>
                    <legend className="mb-3 text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                      {opt.name}
                      {opt.required ? (
                        <span className="ms-1 text-red-600" aria-hidden>*</span>
                      ) : (
                        <span className="ms-1.5 text-xs font-normal" style={{ color: 'var(--theme-text-muted)' }}>
                          {t('optional')}
                        </span>
                      )}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {opt.choices.map((choice, ci) => {
                        const value = opt.canonicalChoices[ci] ?? choice;
                        const on = current === value;
                        return (
                          <button
                            key={`${opt.canonicalName}-${ci}`}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              p.setSelected((prev) => ({ ...prev, [opt.canonicalName]: on && !opt.required ? '' : value }));
                              p.clearError();
                            }}
                            className="rounded-[var(--theme-radius-btn)] border px-4 py-2.5 text-sm font-medium transition-colors"
                            style={
                              on
                                ? { background: 'var(--theme-secondary)', borderColor: 'var(--theme-secondary)', color: 'var(--theme-bg)' }
                                : { background: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }
                            }
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              {product.allowCustomerMessage && (
                <div>
                  <label htmlFor="cocoa-detail-message" className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    {getLocalizedCustomerMessageLabel(product, lang, t('messageOptional'))}
                  </label>
                  <textarea
                    id="cocoa-detail-message"
                    value={p.message}
                    onChange={(e) => p.setMessage(e.target.value)}
                    placeholder={t('messagePlaceholder')}
                    rows={3}
                    className="w-full resize-y rounded-[var(--theme-radius-input)] border px-4 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
                    style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface-secondary)', color: 'var(--theme-text-primary)' }}
                  />
                </div>
              )}
            </div>
          )}

          {p.error ? (
            <p role="alert" className="mt-5 text-sm font-medium text-red-600">
              {p.error}
            </p>
          ) : null}

          {/* Quantity + actions */}
          <div className="mt-8 border-t pt-7" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                {t('quantityLabel')}
              </span>
              <div
                className="inline-flex items-center rounded-[var(--theme-radius-btn)] border"
                style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
              >
                <button
                  type="button"
                  onClick={() => p.setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-9 text-center text-sm font-semibold tabular-nums" style={{ color: 'var(--theme-text-primary)' }}>
                  {p.qty}
                </span>
                <button
                  type="button"
                  onClick={() => p.setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between text-sm">
              <span style={{ color: 'var(--theme-text-muted)' }}>{t('subtotal')}</span>
              <span className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
                {formatPrice(sale * p.qty, shop.currency)}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={p.onAddToCart}
                disabled={soldOut || p.anim !== 'idle'}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] px-5 text-sm font-semibold transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-text-primary)' }}
              >
                {p.anim === 'adding' && p.animMode === 'cart' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t('adding')}
                  </>
                ) : p.anim === 'success' && p.animMode === 'cart' ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                    {t('added')}
                  </>
                ) : (
                  t('addToCart')
                )}
              </button>
              <button
                type="button"
                onClick={p.onBuyNow}
                disabled={soldOut || p.anim !== 'idle'}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
              >
                {p.anim !== 'idle' && p.animMode === 'buy' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t('adding')}
                  </>
                ) : (
                  t('buyNow')
                )}
              </button>
            </div>
          </div>

          {trust.length > 0 && (
            <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {trust.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-3 text-[13px] font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
                  >
                    <TrustBadgeTypeIcon type={resolveTrustBadgeType(b.icon)} className="h-4 w-4" />
                  </span>
                  {getLocalizedTrustLabel(b, lang)}
                </li>
              ))}
            </ul>
          )}

          {shop.refundEnabled ? (
            <Link
              to={`/${username}/refund`}
              className="mt-6 inline-block text-xs font-semibold underline underline-offset-4"
              style={{ color: 'var(--theme-primary)' }}
            >
              {t('returnExchangePolicy')}
            </Link>
          ) : null}
        </div>
      </div>

      {/* ── Related ── */}
      {p.related.length > 0 && (
        <section className="mt-20 lg:mt-32">
          <CocoaHeading title={t('youMayAlsoLike')} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-5">
            {p.related.map((r) => (
              <ProductCard key={r.id} product={r} shopUsername={username} currency={shop.currency} linkState={{ from: 'products' }} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
