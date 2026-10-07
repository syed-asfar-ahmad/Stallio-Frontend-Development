import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Loader2, MessageCircle, Minus, Plus, ShoppingBag, ShoppingCart, Zap } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getEffectivePrice } from '../../../../context/CartContext';
import { formatPrice } from '../../../../lib/countryCurrencyOptions';
import { getProductImageDisplayUrl } from '../../../../lib/productImageUrl';
import { getLocalizedCustomerMessageLabel, getLocalizedTrustLabel } from '../../../../lib/shopContentLanguages';
import { resolveTrustBadgeType, TrustBadgeTypeIcon } from '../../../../lib/trustBadgeIcons';
import ProductCard from '../ProductCard';
import { MartEyebrow, MartSectionHeader, MartStock } from '../mart/MartParts';
import type { DetailCocoaGalleryProps } from './DetailCocoaGallery';

/** Mart showcase — a lit image stage with a thumbnail strip, and a bordered buy panel with segmented options. */
export default function DetailMartShop(p: DetailCocoaGalleryProps) {
  const { t, lang, categoryName } = useShopLanguage();
  const { product, shop, username } = p;

  const soldOut = product.inStock === false;
  const sale = getEffectivePrice(product, Object.keys(p.selected).length ? p.selected : null);
  const compare = product.compareAtPrice != null && product.compareAtPrice > sale ? product.compareAtPrice : null;
  const pct = compare ? Math.round(((compare - sale) / compare) * 100) : null;
  const safeIndex = Math.min(p.activeIndex, Math.max(0, p.images.length - 1));
  const active = p.images[safeIndex] ?? null;
  const cat = product.category ? shop.categories?.find((c) => c.slug === product.category) : null;
  const catLabel = cat ? categoryName(cat) : product.category || '';
  const trust = shop.homeTrustEnabled ? (shop.homeTrustBadges ?? []).filter((b) => b.label?.trim()).slice(0, 4) : [];
  const lines = (p.displayDescription || '').split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const crumb = 'font-medium no-underline transition-colors hover:text-[var(--theme-primary)]';

  return (
    <main className="mx-auto w-full max-w-screen-xl px-3 pb-16 pt-5 sm:px-4 lg:px-5 lg:pb-28 lg:pt-8">
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mb-8">
        <Link
          to={p.backTo}
          className="inline-flex items-center gap-2 text-sm font-semibold no-underline transition-colors hover:text-[var(--theme-primary)]"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden /> {p.backLabel}
        </Link>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-1.5 text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
          <Link to={`/${username}`} className={crumb}>{t('breadcrumbHome')}</Link>
          {p.navFrom === 'category' && p.navCategorySlug ? (
            <>
              <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
              <Link to={`/${username}/category/${p.navCategorySlug}`} className={crumb}>
                {p.navCategory ? categoryName(p.navCategory) : p.navCategorySlug}
              </Link>
            </>
          ) : p.navFrom === 'products' ? (
            <>
              <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
              <Link to={`/${username}/products`} className={crumb}>{t('breadcrumbProducts')}</Link>
            </>
          ) : null}
          <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden />
          <span style={{ color: 'var(--theme-text-primary)' }}>{p.displayName}</span>
        </nav>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        {/* Gallery */}
        <div className="min-w-0">
          <div
            className="relative aspect-square overflow-hidden rounded-2xl border"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
          >
            {active ? (
              <img
                key={active}
                src={getProductImageDisplayUrl(active)}
                alt={p.displayName}
                className={`absolute inset-0 h-full w-full animate-[cocoaFade_450ms_ease-out_both] object-contain p-[9%] motion-reduce:animate-none ${soldOut ? 'opacity-50 grayscale' : ''}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
                <ShoppingBag className="h-16 w-16 opacity-30" strokeWidth={1} />
              </div>
            )}
            {pct ? (
              <span
                className="absolute start-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold leading-none"
                style={{ background: '#e53935', color: '#fff' }}
              >
                -{pct}%
              </span>
            ) : null}
          </div>

          {p.images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {p.images.map((img, i) => {
                const on = i === safeIndex;
                return (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => p.setActiveIndex(i)}
                    aria-label={t('viewImage', { n: i + 1 })}
                    aria-current={on}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition-all"
                    style={{
                      background: 'var(--theme-surface-secondary)',
                      borderColor: on ? 'var(--theme-primary)' : 'var(--theme-border)',
                      boxShadow: on ? '0 0 0 3px rgb(15 79 71 / 0.2)' : undefined,
                      opacity: on ? 1 : 0.75,
                    }}
                  >
                    <img src={getProductImageDisplayUrl(img)} alt="" className="absolute inset-0 h-full w-full object-contain p-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Buy panel */}
        <div className="min-w-0 lg:sticky lg:top-36 lg:self-start">
          <div
            className="rounded-2xl border p-5 sm:p-7"
            style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)', boxShadow: 'var(--theme-shadow-card)' }}
          >
            {catLabel ? <MartEyebrow>{catLabel}</MartEyebrow> : null}
            <h1
              className="mt-3 text-[1.9rem] font-bold leading-[1.08] sm:text-4xl"
              style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.04em', textWrap: 'balance' as never }}
            >
              {p.displayName}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span
                className="text-4xl font-bold leading-none"
                style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.04em' }}
              >
                {formatPrice(sale, shop.currency)}
              </span>
              {compare ? (
                <>
                  <span className="text-lg line-through" style={{ color: 'var(--theme-text-muted)' }}>{formatPrice(compare, shop.currency)}</span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-badge-text)' }}
                  >
                    {t('saveAmount', { amount: formatPrice(compare - sale, shop.currency) })}
                  </span>
                </>
              ) : null}
            </div>
            <div className="mt-3"><MartStock product={product} /></div>

            {lines.length > 0 && (
              <div className="mt-6 border-t pt-6" style={{ borderColor: 'var(--theme-border)' }}>
                <p className="mb-3 text-[11px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                  {t('highlightsTitle')}
                </p>
                {lines.length > 1 ? (
                  <ul className="space-y-2.5">
                    {lines.slice(0, 8).map((l, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--theme-primary)' }} strokeWidth={2.5} aria-hidden />
                        {l}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-7" style={{ color: 'var(--theme-text-secondary)' }}>{lines[0]}</p>
                )}
              </div>
            )}

            {(p.options.length > 0 || product.allowCustomerMessage) && (
              <div className="mt-6 space-y-5 border-t pt-6" style={{ borderColor: 'var(--theme-border)' }}>
                {p.options.map((opt) => {
                  const current = p.selected[opt.canonicalName];
                  return (
                    <fieldset key={opt.canonicalName}>
                      <legend className="mb-2.5 text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                        {opt.name}
                        {opt.required ? <span className="ms-1 text-red-500" aria-hidden>*</span> : (
                          <span className="ms-1.5 text-xs font-normal" style={{ color: 'var(--theme-text-muted)' }}>{t('optional')}</span>
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
                              className="rounded-[var(--theme-radius-btn)] border px-4 py-2.5 text-xs font-medium transition-all"
                              style={
                                on
                                  ? { background: 'var(--theme-primary-light)', borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)', boxShadow: '0 0 0 3px rgb(15 79 71 / 0.15)' }
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
                    <label htmlFor="mart-detail-message" className="mb-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      {getLocalizedCustomerMessageLabel(product, lang, t('messageOptional'))}
                    </label>
                    <textarea
                      id="mart-detail-message"
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

            {p.error ? <p role="alert" className="mt-5 text-sm font-medium text-red-500">{p.error}</p> : null}

            <div className="mt-6 border-t pt-6" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center justify-between gap-4">
                <div
                  className="inline-flex items-center rounded-[var(--theme-radius-btn)] border"
                  style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface-secondary)' }}
                  role="group"
                  aria-label={t('quantityLabel')}
                >
                  <button type="button" onClick={() => p.setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="flex h-11 w-11 items-center justify-center hover:opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold tabular-nums" style={{ color: 'var(--theme-text-primary)' }}>{p.qty}</span>
                  <button type="button" onClick={() => p.setQty((q) => q + 1)} aria-label="Increase quantity" className="flex h-11 w-11 items-center justify-center hover:opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-end">
                  <span className="block text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>{t('subtotal')}</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}>
                    {formatPrice(sale * p.qty, shop.currency)}
                  </span>
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={p.onAddToCart}
                  disabled={soldOut || p.anim !== 'idle'}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] border px-5 text-sm font-semibold transition-colors hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }}
                >
                  {p.anim === 'adding' && p.animMode === 'cart' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t('adding')}</>
                  ) : p.anim === 'success' && p.animMode === 'cart' ? (
                    <><Check className="h-4 w-4" strokeWidth={3} aria-hidden /> {t('added')}</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4" aria-hidden /> {t('addToCart')}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={p.onBuyNow}
                  disabled={soldOut || p.anim !== 'idle'}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)', boxShadow: '0 12px 32px -12px rgb(15 79 71 / 0.6)' }}
                >
                  {p.anim !== 'idle' && p.animMode === 'buy' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t('adding')}</>
                  ) : (
                    <><Zap className="h-4 w-4" aria-hidden /> {t('buyNow')}</>
                  )}
                </button>
              </div>
            </div>

            {trust.length > 0 && (
              <ul className="mt-6 grid grid-cols-1 gap-2.5 border-t pt-6 sm:grid-cols-2" style={{ borderColor: 'var(--theme-border)' }}>
                {trust.map((b, i) => (
                  <li key={`${b.label}-${i}`} className="flex items-center gap-2.5 text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}>
                      <TrustBadgeTypeIcon type={resolveTrustBadgeType(b.icon)} className="h-3.5 w-3.5" />
                    </span>
                    {getLocalizedTrustLabel(b, lang)}
                  </li>
                ))}
              </ul>
            )}
            {shop.refundEnabled ? (
              <Link to={`/${username}/refund`} className="mt-5 inline-block text-xs font-semibold underline underline-offset-4" style={{ color: 'var(--theme-primary)' }}>
                {t('returnExchangePolicy')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {p.related.length > 0 && (
        <section className="mt-16 lg:mt-28">
          <MartSectionHeader title={t('youMayAlsoLike')} action={{ to: `/${username}/products`, label: t('viewAll') }} />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {p.related.map((r) => (
              <ProductCard key={r.id} product={r} shopUsername={username} currency={shop.currency} linkState={{ from: 'products' }} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
