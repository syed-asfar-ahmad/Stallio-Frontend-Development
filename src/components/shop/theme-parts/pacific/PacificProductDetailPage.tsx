import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Loader2,
  Sprout,
  ShieldCheck,
  Droplets,
  Sun,
  Truck,
  Sparkles,
  Heart,
  MessageCircle,
} from 'lucide-react';
import type { Product, Shop, ShopCategory } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { formatPrice, formatQuantity } from '../../../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS } from '../../../../lib/imageCropViewports';
import ProductImage from '../../../ProductImage';
import ProductCard from '../ProductCard';
import type { ShopDisplayOption } from '../../../../lib/shopContentLanguages';
import { PacificPillTag } from './PacificParts';

type Props = {
  shop: Shop;
  username: string;
  product: Product;
  related: Product[];
  displayName: string;
  displayDescription: string;
  images: string[];
  activeIndex: number;
  setActiveIndex: (idx: number) => void;
  options: ShopDisplayOption[];
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
  navFrom?: string;
  navCategorySlug?: string | null;
  navCategory?: ShopCategory | null;
};

export default function PacificProductDetailPage({
  shop,
  username,
  product,
  related,
  displayName,
  displayDescription,
  images,
  activeIndex,
  setActiveIndex,
  options,
  selected,
  setSelected,
  message,
  setMessage,
  qty,
  setQty,
  error,
  clearError,
  anim,
  animMode,
  onAddToCart,
  onBuyNow,
  backTo,
  backLabel,
  navCategory,
}: Props) {
  const { t, categoryName } = useShopLanguage();
  const [activeTab, setActiveTab] = useState<'origin' | 'freshness' | 'delivery'>('origin');

  const sale = Number(product.price) || 0;
  const compare = product.compareAtPrice != null && product.compareAtPrice > sale ? product.compareAtPrice : null;
  const outOfStock = product.inStock === false;
  const discountPct = compare ? Math.round(((compare - sale) / compare) * 100) : null;
  const safeImages = images.length > 0 ? images : product.image ? [product.image] : [];
  const currentImage = safeImages[activeIndex] || safeImages[0] || null;

  return (
    <main className="flex-1 pb-16 pt-4 lg:pb-28 lg:pt-8">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
        {/* Navigation Breadcrumbs & Back */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <nav
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-theme-text-muted"
            aria-label="Breadcrumb"
          >
            <Link
              to={`/${username}`}
              className="font-medium no-underline transition-colors hover:text-theme-primary"
            >
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
            {navCategory ? (
              <>
                <Link
                  to={`/${username}/category/${navCategory.slug}`}
                  className="font-medium no-underline transition-colors hover:text-theme-primary"
                >
                  {categoryName(navCategory)}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
              </>
            ) : (
              <>
                <Link
                  to={`/${username}/products`}
                  className="font-medium no-underline transition-colors hover:text-theme-primary"
                >
                  {t('breadcrumbProducts') || 'Provisions'}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />
              </>
            )}
            <span className="font-semibold text-theme-text line-clamp-1">{displayName}</span>
          </nav>

          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-theme-border bg-theme-surface text-theme-text no-underline hover:bg-theme-surface-secondary shadow-sm transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* ── Product Hero Presentation Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Gallery (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Primary Image */}
            <div
              className="relative aspect-square w-full overflow-hidden rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface-secondary)] shadow-[var(--theme-shadow-card)] group"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={displayName}
                  className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
                    outOfStock ? 'opacity-40 grayscale' : ''
                  }`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-theme-text-muted">
                  <ShoppingBag className="w-16 h-16 opacity-30" />
                </div>
              )}

              {/* Floating Badges */}
              <div className="absolute top-4 start-4 flex flex-col gap-2 z-10">
                {outOfStock ? (
                  <span
                    className="rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm"
                    style={{ background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
                  >
                    {t('badgeSoldOut')}
                  </span>
                ) : discountPct ? (
                  <span className="rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white shadow-sm">
                    -{discountPct}% OFF
                  </span>
                ) : product.isFeatured ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white bg-emerald-800 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    Signature Harvest
                  </span>
                ) : null}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {safeImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[calc(var(--theme-radius-card)*0.5)] border-2 transition-all ${
                      activeIndex === idx
                        ? 'border-theme-primary ring-2 ring-theme-primary/30 scale-105'
                        : 'border-theme-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Buying Information (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PacificPillTag icon={Sprout}>
                  {product.category ? product.category : 'Artisanal Provision'}
                </PacificPillTag>
                {product.inStock !== false && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Fresh Harvest in Stock
                  </span>
                )}
              </div>

              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-normal text-theme-text tracking-tight leading-[1.12]"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {displayName}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-theme-primary">
                  {formatPrice(sale, shop.currency)}
                </span>
                {compare && (
                  <span className="text-base text-theme-text-muted line-through">
                    {formatPrice(compare, shop.currency)}
                  </span>
                )}
              </div>
            </div>

            {/* Short Narrative Description */}
            {displayDescription && (
              <p className="text-sm sm:text-base text-theme-text-secondary leading-relaxed border-t border-theme-border pt-4">
                {displayDescription}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs font-semibold text-red-600 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Variant / Options Selection */}
            {options.length > 0 && (
              <div className="space-y-4 border-t border-theme-border pt-4">
                {options.map((opt) => (
                  <div key={opt.canonicalName} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-theme-text uppercase tracking-wider">
                      <span>{opt.name}</span>
                      {selected[opt.canonicalName] && (
                        <span className="text-theme-primary normal-case font-semibold">
                          {selected[opt.canonicalName]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isChosen = selected[opt.canonicalName] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              clearError();
                              setSelected((prev) => ({ ...prev, [opt.canonicalName]: val }));
                            }}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                              isChosen
                                ? 'bg-theme-primary text-theme-primary-contrast shadow-sm scale-105'
                                : 'bg-theme-surface text-theme-text border border-theme-border hover:border-theme-primary'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Message Input (if enabled) */}
            {product.allowCustomerMessage && (
              <div className="border-t border-theme-border pt-4 space-y-2">
                <label
                  htmlFor="pacific-customer-msg"
                  className="block text-xs font-bold uppercase tracking-wider text-theme-text"
                >
                  <MessageCircle className="inline w-3.5 h-3.5 me-1 text-theme-primary" />
                  {t('customerMessageOptional') || 'Harvest / Delivery Note'}
                </label>
                <textarea
                  id="pacific-customer-msg"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('customerMessagePlaceholder') || 'Add custom packing or preparation instructions...'}
                  className="w-full rounded-2xl border border-theme-border bg-theme-surface p-3 text-xs text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                />
              </div>
            )}

            {/* Quantity Stepper & Add to Cart Buttons */}
            <div className="space-y-4 border-t border-theme-border pt-5">
              <div className="flex items-center gap-4">
                {/* Stepper */}
                <div className="flex h-12 items-center rounded-full border border-theme-border bg-theme-surface p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1 || outOfStock}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-theme-text hover:bg-theme-surface-secondary disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-bold text-theme-text">
                    {formatQuantity(qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    disabled={outOfStock}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-theme-text hover:bg-theme-surface-secondary disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Basket Action */}
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={outOfStock || anim !== 'idle'}
                  className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-primary-contrast)',
                  }}
                >
                  {anim === 'adding' && animMode === 'cart' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : anim === 'success' && animMode === 'cart' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Added to Basket</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{outOfStock ? t('badgeSoldOut') : t('addToCart') || 'Add to Basket'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Purchase Button */}
              {!outOfStock && (
                <button
                  type="button"
                  onClick={onBuyNow}
                  disabled={anim !== 'idle'}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-full border-2 px-6 text-xs font-bold uppercase tracking-wider text-theme-text transition-all hover:bg-theme-surface-secondary active:scale-95 shadow-sm"
                  style={{
                    borderColor: 'var(--theme-primary)',
                    color: 'var(--theme-primary)',
                  }}
                >
                  {anim === 'adding' && animMode === 'buy' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t('buyNow') || 'Instant Purchase'}</span>
                  )}
                </button>
              )}
            </div>

            {/* Sourcing & Quality Guarantee Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-theme-border">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-surface-secondary border border-theme-border">
                <Sprout className="w-4 h-4 text-theme-primary shrink-0" />
                <span className="text-xs font-semibold text-theme-text">Cold-Harvested</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-theme-surface-secondary border border-theme-border">
                <Truck className="w-4 h-4 text-theme-primary shrink-0" />
                <span className="text-xs font-semibold text-theme-text">Fresh Courier</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Editorial Story & Information Tabs ── */}
        <section className="mt-16 lg:mt-24 border-t border-theme-border pt-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-center border-b border-theme-border pb-4 gap-4">
              {[
                { id: 'origin', label: 'Origin & Sourcing' },
                { id: 'freshness', label: 'Freshness Standards' },
                { id: 'delivery', label: 'Storage & Preparation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as never)}
                  className={`pb-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-4.5 ${
                    activeTab === tab.id
                      ? 'border-theme-primary text-theme-primary'
                      : 'border-transparent text-theme-text-muted hover:text-theme-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-10 rounded-[var(--theme-radius-card)] bg-theme-surface border border-theme-border shadow-sm text-sm sm:text-base text-theme-text-secondary leading-relaxed space-y-4">
              {activeTab === 'origin' && (
                <>
                  <h3 className="text-xl font-normal text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                    Cultivated on Biodynamic Partner Farms
                  </h3>
                  <p>
                    Every batch of {displayName} is harvested by generational farmers using regenerative agriculture principles. We avoid synthetic inputs, allowing the natural terroir and rich living soil to infuse each harvest with deep flavor and active vitality.
                  </p>
                </>
              )}

              {activeTab === 'freshness' && (
                <>
                  <h3 className="text-xl font-normal text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                    The 24-Hour Cold-Harvest Promise
                  </h3>
                  <p>
                    We pack and dispatch within 24 hours of harvest. Handled strictly through monitored cold-chain storage to preserve delicate aromas, enzymatic vitality, and peak crispness without chemicals.
                  </p>
                </>
              )}

              {activeTab === 'delivery' && (
                <>
                  <h3 className="text-xl font-normal text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                    Storage Recommendations
                  </h3>
                  <p>
                    Keep in a cool, dark pantry or refrigerated at 4°C to sustain biological freshness. Consume within recommended seasonal timelines for optimal taste and vitality.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Related / Complementary Provisions ── */}
        {related.length > 0 && (
          <section className="mt-16 lg:mt-24 border-t border-theme-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <PacificPillTag icon={Sparkles}>Curated Pairing</PacificPillTag>
                <h2
                  className="mt-2 text-2xl sm:text-3xl font-normal text-theme-text"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Pairs Beautifully With
                </h2>
              </div>
              <Link
                to={`/${username}/products`}
                className="text-xs font-bold text-theme-primary hover:underline"
              >
                View Full Pantry →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  shopUsername={username}
                  currency={shop.currency}
                  linkState={{ from: 'products' }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
