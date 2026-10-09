import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronDown, ShoppingBag, MessageCircle, Loader2, Check } from 'lucide-react';
import type { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { useStorefrontTheme } from '../../themes';
import { useCart, getEffectivePrice } from '../../context/CartContext';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { formatPrice } from '../../lib/countryCurrencyOptions';
import { PRODUCT_CARD_ASPECT_CLASS, PRODUCT_IMAGE_CLASS, PRODUCT_IMAGE_FRAME_CLASS } from '../../lib/imageCropViewports';
import ProductImage from '../../components/ProductImage';
import { getProductImageDisplayUrl } from '../../lib/productImageUrl';
import {
  getLocalizedCustomerMessageLabel,
  getShopDisplayProductOptions,
} from '../../lib/shopContentLanguages';
import type { ShopProductLinkState } from '../../lib/shopProductNav';
import DetailCocoaGallery from '../../components/shop/theme-parts/detail/DetailCocoaGallery';
import DetailMartShop from '../../components/shop/theme-parts/detail/DetailMartShop';
import DetailFreshBloom from '../../components/shop/theme-parts/detail/DetailFreshBloom';

const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';
const ADD_TO_CART_ANIM_MS = 750;
const ADD_TO_CART_SUCCESS_MS = 400;

function ProductPrice({
  p,
  currency,
  className = '',
  priceOverride,
}: {
  p: Product;
  currency?: string | null;
  className?: string;
  priceOverride?: number;
}) {
  const sale = priceOverride != null ? priceOverride : Number(p.price) || 0;
  const compare = p.compareAtPrice != null && p.compareAtPrice > sale ? p.compareAtPrice : null;
  if (compare) {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span className="font-extrabold text-theme-primary text-base sm:text-lg">{formatPrice(sale, currency)}</span>
        <span className="text-sm text-theme-text-muted line-through">{formatPrice(compare, currency)}</span>
      </div>
    );
  }
  return <p className={`font-extrabold text-theme-primary text-base sm:text-lg ${className}`}>{formatPrice(sale, currency)}</p>;
}

export default function ShopProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { shop, products, username } = useShop();
  const { layout } = useStorefrontTheme();
  const detailVariant = layout.productDetailVariant ?? 'gallery-split';
  const { addToCart, openCheckout } = useCart();
  const location = useLocation();
  const { t, categoryName, productName, productDescription, lang } = useShopLanguage();

  const product = productId ? products.find((p) => p.id === productId) ?? null : null;

  const [detailQty, setDetailQty] = useState(1);
  const [addToCartOptions, setAddToCartOptions] = useState<Record<string, string>>({});
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [activeDetailImageIndex, setActiveDetailImageIndex] = useState(0);
  const [detailOptionDropdownOpen, setDetailOptionDropdownOpen] = useState<string | null>(null);
  const [detailOptionError, setDetailOptionError] = useState('');
  const [addToCartAnim, setAddToCartAnim] = useState<'idle' | 'adding' | 'success'>('idle');
  const [addToCartMode, setAddToCartMode] = useState<'cart' | 'buy' | null>(null);
  const addToCartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveDetailImageIndex(0);
    setDetailOptionDropdownOpen(null);
    setDetailOptionError('');
    setAddToCartAnim('idle');
    setAddToCartMode(null);
    setAddToCartOptions({});
    setAddToCartMessage('');
    setDetailQty(1);
    if (addToCartTimerRef.current) {
      clearTimeout(addToCartTimerRef.current);
      addToCartTimerRef.current = null;
    }
  }, [productId]);

  useEffect(() => {
    return () => {
      if (addToCartTimerRef.current) clearTimeout(addToCartTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!detailOptionDropdownOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-shop-product-option]')) {
        setDetailOptionDropdownOpen(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [detailOptionDropdownOpen]);

  if (!shop || !product) {
    return null;
  }

  const navState = location.state as ShopProductLinkState | null | undefined;
  const navFrom = navState?.from;
  const navCategorySlug = navState?.from === 'category' ? navState.categorySlug : null;
  const categoryFromNav = navCategorySlug
    ? shop.categories?.find((c) => c.slug === navCategorySlug)
    : null;

  const displayName = productName(product);
  const displayDescription = productDescription(product);
  const detailDisplayOptions = getShopDisplayProductOptions(product, lang);
  const hasOptions = detailDisplayOptions.length > 0;
  const hasMessage = Boolean(product.allowCustomerMessage);
  const detailImages = (product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])).filter(Boolean) as string[];
  const safeImageIndex = Math.min(activeDetailImageIndex, Math.max(0, detailImages.length - 1));
  const activeImage = detailImages[safeImageIndex] ?? null;

  let productBackTo = `/${username}`;
  let backLabel = t('backToStore');
  if (navFrom === 'category' && navCategorySlug) {
    productBackTo = `/${username}/category/${navCategorySlug}`;
    backLabel = categoryFromNav
      ? t('backToCategory', { name: categoryName(categoryFromNav) })
      : t('backToProducts');
  } else if (navFrom === 'products') {
    productBackTo = `/${username}/products`;
    backLabel = t('backToProducts');
  }

  function handleAddToCartFromDetail(mode: 'cart' | 'buy' = 'buy') {
    if (!product || addToCartAnim !== 'idle') return;
    if (product.inStock === false) {
      setDetailOptionError(t('errorOutOfStock'));
      return;
    }
    const missingRequired = detailDisplayOptions.find(
      (o) => Boolean(o.required) && !addToCartOptions[o.canonicalName],
    );
    if (missingRequired) {
      setDetailOptionError(t('errorSelectOption', { name: missingRequired.name }));
      return;
    }

    const opts: Record<string, string> = {};
    product.options?.forEach((o) => {
      const v = addToCartOptions[o.name];
      if (v) opts[o.name] = v;
    });
    setDetailOptionError('');
    setDetailOptionDropdownOpen(null);

    if (addToCartTimerRef.current) clearTimeout(addToCartTimerRef.current);

    setAddToCartMode(mode);
    setAddToCartAnim('adding');
    addToCartTimerRef.current = setTimeout(() => {
      addToCart(product, detailQty, Object.keys(opts).length > 0 ? opts : null, addToCartMessage.trim() || null);
      setAddToCartAnim('success');
      addToCartTimerRef.current = setTimeout(
        () => {
          if (mode === 'buy') openCheckout();
          setAddToCartAnim('idle');
          setAddToCartMode(null);
          addToCartTimerRef.current = null;
        },
        mode === 'buy' ? ADD_TO_CART_SUCCESS_MS : 1200,
      );
    }, ADD_TO_CART_ANIM_MS);
  }

  if (detailVariant === 'cocoa-gallery' || detailVariant === 'mart-shop' || detailVariant === 'fresh-detail') {
    const DetailComponent =
      detailVariant === 'mart-shop' ? DetailMartShop : detailVariant === 'fresh-detail' ? DetailFreshBloom : DetailCocoaGallery;
    const pool = products.filter((x) => x.id !== product.id && x.isVisible !== false);
    const related = [
      ...pool.filter((x) => product.category && x.category === product.category),
      ...pool.filter((x) => !(product.category && x.category === product.category)),
    ].slice(0, 4);

    return (
      <DetailComponent
        shop={shop}
        username={username}
        product={product}
        related={related}
        displayName={displayName}
        displayDescription={displayDescription}
        images={detailImages}
        activeIndex={safeImageIndex}
        setActiveIndex={setActiveDetailImageIndex}
        options={detailDisplayOptions}
        selected={addToCartOptions}
        setSelected={setAddToCartOptions}
        message={addToCartMessage}
        setMessage={setAddToCartMessage}
        qty={detailQty}
        setQty={setDetailQty}
        error={detailOptionError}
        clearError={() => setDetailOptionError('')}
        anim={addToCartAnim}
        animMode={addToCartMode}
        onAddToCart={() => handleAddToCartFromDetail('cart')}
        onBuyNow={() => handleAddToCartFromDetail('buy')}
        backTo={productBackTo}
        backLabel={backLabel}
        navFrom={navFrom}
        navCategorySlug={navCategorySlug}
        navCategory={categoryFromNav}
      />
    );
  }

  return (
    <main className={`${containerClass} pt-4 max-lg:pt-4 pb-8 max-lg:pb-8 lg:pt-6 lg:pb-12`}>
      <div className="mb-4 max-lg:mb-4 flex flex-col items-start gap-2.5 max-lg:gap-2.5 lg:mb-6 lg:gap-3">
        <Link
          to={productBackTo}
          className="inline-flex items-center gap-2 rounded-theme-btn border border-theme-border bg-theme-surface px-4 py-2.5 text-sm font-semibold text-theme-text no-underline shadow-theme-card transition-colors hover:border-theme-primary hover:bg-theme-primary-light"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          {backLabel}
        </Link>
        <nav
          className="flex flex-wrap items-center gap-x-1 gap-y-0.5 max-lg:gap-x-1 text-xs max-lg:text-xs text-theme-text-muted lg:gap-x-1.5 lg:text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            to={`/${username}`}
            className="font-medium no-underline transition-colors hover:text-theme-primary"
          >
            {t('breadcrumbHome')}
          </Link>
          {navFrom === 'category' && navCategorySlug ? (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
              <Link
                to={`/${username}/categories`}
                className="font-medium no-underline transition-colors hover:text-theme-primary"
              >
                {t('breadcrumbCategories')}
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
              <Link
                to={`/${username}/category/${navCategorySlug}`}
                className="font-medium break-words no-underline transition-colors hover:text-theme-primary"
              >
                {categoryFromNav ? categoryName(categoryFromNav) : navCategorySlug}
              </Link>
            </>
          ) : null}
          {navFrom === 'products' ? (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
              <Link
                to={`/${username}/products`}
                className="font-medium no-underline transition-colors hover:text-theme-primary"
              >
                {t('breadcrumbProducts')}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />
          <span className="font-semibold break-words text-theme-text">{displayName}</span>
        </nav>
      </div>

      <div className="grid gap-4 max-lg:gap-4 lg:grid-cols-[480px_1fr] lg:gap-8 xl:grid-cols-[560px_1fr] lg:items-start">
        {/* Gallery Variants Dispatcher */}
        {detailVariant === 'gallery-stacked' ? (
          <div className="space-y-4">
            {detailImages.length > 0 ? (
              detailImages.map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className="relative overflow-hidden border shadow-theme-card transition-all"
                  style={{
                    borderRadius: 'var(--theme-radius-card)',
                    borderColor: 'var(--theme-border)',
                    background: 'var(--theme-surface)',
                  }}
                >
                  <ProductImage
                    src={img}
                    alt={`${displayName} - ${idx + 1}`}
                    aspectClass={PRODUCT_CARD_ASPECT_CLASS}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))
            ) : (
              <div
                className={`relative overflow-hidden border ${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} flex items-center justify-center`}
                style={{
                  borderRadius: 'var(--theme-radius-card)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                <ShoppingBag className="w-16 h-16" />
              </div>
            )}
          </div>
        ) : detailVariant === 'gallery-carousel' ? (
          <div
            className="relative overflow-hidden border glow-theme-accent transition-all"
            style={{
              borderRadius: 'var(--theme-radius-card)',
              borderColor: 'var(--theme-border)',
              background: 'var(--theme-surface)',
              boxShadow: 'var(--theme-shadow-card)',
            }}
          >
            {activeImage ? (
              <ProductImage src={activeImage} alt={displayName} aspectClass={PRODUCT_CARD_ASPECT_CLASS} />
            ) : (
              <div
                className={`${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} flex items-center justify-center`}
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <ShoppingBag className="w-16 h-16" />
              </div>
            )}
            {detailImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 p-3.5 bg-[var(--theme-surface-secondary)] border-t border-[var(--theme-border)]">
                {detailImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveDetailImageIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === safeImageIndex
                        ? 'w-8 bg-theme-primary'
                        : 'w-2.5 bg-theme-border hover:bg-theme-muted'
                    }`}
                    aria-label={t('viewImage', { n: idx + 1 })}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* gallery-split (Default Classic & Retail) */
          <div
            className="relative z-0 mx-auto w-full max-w-[480px] lg:mx-0 lg:max-w-none lg:w-full overflow-hidden border"
            style={{
              borderRadius: 'var(--theme-radius-card)',
              borderColor: 'var(--theme-border)',
              background: 'var(--theme-surface)',
              boxShadow: 'var(--theme-shadow-card)',
            }}
          >
            {activeImage ? (
              <ProductImage src={activeImage} alt={displayName} />
            ) : (
              <div
                className={`${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} flex items-center justify-center`}
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <ShoppingBag className="w-16 h-16" />
              </div>
            )}
            {detailImages.length > 1 && (
              <div
                className="border-t p-3 max-lg:p-3 lg:p-4"
                style={{
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-surface-secondary)',
                }}
              >
                <div className="flex items-center gap-2 max-lg:gap-2 overflow-x-auto pb-1 lg:gap-3">
                  {detailImages.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setActiveDetailImageIndex(idx)}
                      className={`relative h-16 w-16 max-lg:h-16 max-lg:w-16 shrink-0 overflow-hidden border-2 transition-all lg:h-20 lg:w-20 ${
                        idx === safeImageIndex
                          ? 'border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)]/20 scale-105'
                          : 'border-[var(--theme-border)] hover:border-[var(--theme-primary)]'
                      }`}
                      style={{
                        borderRadius: 'calc(var(--theme-radius-card) * 0.75)',
                        background: 'var(--theme-surface)',
                      }}
                      aria-label={t('viewImage', { n: idx + 1 })}
                    >
                      <img src={getProductImageDisplayUrl(img)} alt="" className={PRODUCT_IMAGE_CLASS} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className={`min-w-0 border p-5 sm:p-7 lg:sticky lg:top-24 ${
            detailOptionDropdownOpen ? 'relative z-40 isolate' : 'relative z-0'
          }`}
          style={{
            borderRadius: 'var(--theme-radius-card)',
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface)',
            boxShadow: 'var(--theme-shadow-card)',
          }}
        >
          <p
            className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--theme-primary)' }}
          >
            {product.category || t('productDetails')}
          </p>
          <h1
            className="text-xl max-lg:leading-snug font-bold leading-tight lg:text-3xl"
            style={{
              color: 'var(--theme-text-primary)',
              fontFamily: 'var(--theme-font-heading)',
              letterSpacing: 'var(--theme-heading-spacing)',
              textTransform: 'var(--theme-heading-transform)' as any,
            }}
          >
            {displayName}
          </h1>
          <div className="mt-2">
            <ProductPrice
              p={product}
              currency={shop.currency}
              priceOverride={
                detailDisplayOptions.length > 0
                  ? getEffectivePrice(
                      product,
                      Object.keys(addToCartOptions).length ? addToCartOptions : null,
                    )
                  : undefined
              }
            />
          </div>
          {product.inStock === false && (
            <p className="mt-2 text-sm font-semibold text-red-600">{t('outOfStock')}</p>
          )}
          {displayDescription && (
            <p
              className="mt-3 max-lg:mt-3 text-sm max-lg:text-sm leading-relaxed lg:mt-4 lg:text-base"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              {displayDescription}
            </p>
          )}

          {(hasOptions || hasMessage) && (
            <div
              className="mt-5 max-lg:mt-5 space-y-4 max-lg:space-y-4 border-t pt-5 max-lg:pt-5 lg:mt-6 lg:space-y-5 lg:pt-6"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              {detailDisplayOptions.map((opt) => {
                const selectedCanonical = addToCartOptions[opt.canonicalName];
                const selectedIdx =
                  selectedCanonical != null ? opt.canonicalChoices.indexOf(selectedCanonical) : -1;
                const selectedLabel =
                  selectedIdx >= 0 ? opt.choices[selectedIdx] : selectedCanonical;
                return (
                  <div key={opt.canonicalName}>
                    <label
                      className="mb-1.5 block text-sm font-medium max-lg:mb-1.5 lg:mb-2"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {opt.name}
                      {opt.required ? <span className="ms-1 text-red-500">*</span> : <span className="ms-1 text-sm text-theme-text-muted">{t('optional')}</span>}
                    </label>
                    <div
                      data-shop-product-option
                      className={`relative ${detailOptionDropdownOpen === opt.canonicalName ? 'z-40' : 'z-0'}`}
                    >
                      <button
                        type="button"
                        aria-expanded={detailOptionDropdownOpen === opt.canonicalName}
                        aria-haspopup="listbox"
                        onClick={() =>
                          setDetailOptionDropdownOpen(
                            detailOptionDropdownOpen === opt.canonicalName ? null : opt.canonicalName,
                          )
                        }
                        className="inline-flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-sm font-medium transition-colors max-lg:py-2.5 lg:px-4 lg:py-3"
                        style={{
                          borderRadius: 'var(--theme-radius-input)',
                          borderColor: 'var(--theme-border)',
                          background: 'var(--theme-surface-secondary)',
                          color: 'var(--theme-text-primary)',
                        }}
                      >
                        <span className="truncate text-start">
                          {selectedLabel
                            ? selectedLabel
                            : t('selectOption', { name: opt.name })}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${detailOptionDropdownOpen === opt.canonicalName ? 'rotate-180' : ''}`} style={{ color: 'var(--theme-text-muted)' }} />
                      </button>
                      {detailOptionDropdownOpen === opt.canonicalName && (
                        <ul
                          role="listbox"
                          className="absolute start-0 top-full z-50 mt-1 max-h-[min(18rem,55vh)] w-full touch-pan-y overflow-y-auto overscroll-y-contain border py-1"
                          style={{
                            borderRadius: 'var(--theme-radius-card)',
                            borderColor: 'var(--theme-border)',
                            background: 'var(--theme-surface)',
                            boxShadow: 'var(--theme-shadow-dropdown)',
                          }}
                        >
                          <li role="option" aria-selected={!selectedCanonical}>
                            <button
                              type="button"
                              onClick={() => {
                                setAddToCartOptions((prev) => ({ ...prev, [opt.canonicalName]: '' }));
                                setDetailOptionError('');
                                setDetailOptionDropdownOpen(null);
                              }}
                              className="w-full text-start px-4 py-2.5 text-sm font-medium hover:opacity-80"
                              style={{ color: 'var(--theme-text-muted)' }}
                            >
                              {opt.required ? t('selectOptionRequired', { name: opt.name }) : t('selectOption', { name: opt.name })}
                            </button>
                          </li>
                          {opt.choices.map((choice, ci) => (
                            <li key={`${opt.canonicalName}-${ci}`} role="option" aria-selected={selectedCanonical === opt.canonicalChoices[ci]}>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddToCartOptions((prev) => ({
                                    ...prev,
                                    [opt.canonicalName]: opt.canonicalChoices[ci] ?? choice,
                                  }));
                                  setDetailOptionError('');
                                  setDetailOptionDropdownOpen(null);
                                }}
                                className={`w-full text-start px-4 py-2.5 text-sm font-medium transition-colors ${
                                  selectedCanonical === opt.canonicalChoices[ci]
                                    ? 'font-bold'
                                    : 'hover:opacity-80'
                                }`}
                                style={{
                                  background:
                                    selectedCanonical === opt.canonicalChoices[ci]
                                      ? 'var(--theme-primary-light)'
                                      : 'transparent',
                                  color:
                                    selectedCanonical === opt.canonicalChoices[ci]
                                      ? 'var(--theme-primary)'
                                      : 'var(--theme-text-primary)',
                                }}
                              >
                                {choice}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
              {product.allowCustomerMessage && (
                <div>
                  <label className="block font-medium mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                    <MessageCircle className="w-4 h-4 inline me-1.5 -mt-0.5" />
                    {getLocalizedCustomerMessageLabel(product, lang, t('messageOptional'))}
                  </label>
                  <textarea
                    value={addToCartMessage}
                    onChange={(e) => setAddToCartMessage(e.target.value)}
                    placeholder={t('messagePlaceholder')}
                    rows={3}
                    className="w-full resize-y border px-3 py-2.5 text-sm max-lg:py-2.5 lg:px-4 lg:py-3 focus:outline-none"
                    style={{
                      borderRadius: 'var(--theme-radius-input)',
                      borderColor: 'var(--theme-border)',
                      background: 'var(--theme-surface-secondary)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                </div>
              )}
              {detailOptionError && (
                <p className="text-sm font-medium text-red-600">{detailOptionError}</p>
              )}
            </div>
          )}

          <div
            className="mt-5 max-lg:mt-5 space-y-3 max-lg:space-y-3 border-t pt-5 max-lg:pt-5 lg:mt-6 lg:space-y-4 lg:pt-6"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium" style={{ color: 'var(--theme-text-muted)' }}>{t('subtotal')}</span>
              <span className="font-bold text-lg" style={{ color: 'var(--theme-text-primary)' }}>
                {formatPrice(getEffectivePrice(product, Object.keys(addToCartOptions).length ? addToCartOptions : null) * detailQty, shop.currency)}
              </span>
            </div>
            <div className="flex flex-col gap-3 max-lg:flex-col max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div
                className="flex w-full max-lg:w-full items-center justify-center overflow-hidden border lg:w-auto"
                style={{
                  borderRadius: 'var(--theme-radius-btn)',
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-surface)',
                }}
              >
                <button type="button" onClick={() => setDetailQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 hover:opacity-70 max-lg:py-2.5 lg:py-3" style={{ color: 'var(--theme-text-primary)' }}>-</button>
                <span className="min-w-[2.5rem] text-center font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{detailQty}</span>
                <button type="button" onClick={() => setDetailQty((q) => q + 1)} className="px-4 py-2.5 hover:opacity-70 max-lg:py-2.5 lg:py-3" style={{ color: 'var(--theme-text-primary)' }}>+</button>
              </div>
              <button
                type="button"
                onClick={() => handleAddToCartFromDetail()}
                disabled={product.inStock === false || addToCartAnim !== 'idle'}
                className={`shop-add-to-cart-btn w-full max-lg:w-full flex-1 min-w-0 px-5 py-3.5 font-bold rounded-full disabled:cursor-not-allowed disabled:opacity-50 max-lg:py-3.5 lg:min-w-[180px] lg:px-6 lg:py-4 transition-all active:scale-[0.99] ${
                  addToCartAnim === 'adding' ? 'shop-add-to-cart-btn--adding' : ''
                }${addToCartAnim === 'success' ? ' shop-add-to-cart-btn--success' : ''}`}
                style={{
                  background: 'var(--theme-primary)',
                  color: 'var(--theme-primary-contrast)',
                  boxShadow: 'var(--theme-shadow-card)',
                }}
              >
                <span className="relative z-[1] inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                  {product.inStock === false ? (
                    t('outOfStock')
                  ) : addToCartAnim === 'adding' ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      {t('adding')}
                    </>
                  ) : addToCartAnim === 'success' ? (
                    <>
                      <Check className="h-4 w-4 shrink-0 stroke-[3]" aria-hidden />
                      {t('added')}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      {t('addToCart')}
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Botanical Trust & Policy micro-row */}
            <div
              className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-xs"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--theme-primary)' }} />
                <span>100% Authentic & Pure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--theme-primary)' }} />
                <span>Eco-Conscious Packaging</span>
              </div>
            </div>

            {shop.refundEnabled ? (
              <Link
                to={`/${username}/refund`}
                className="inline-block text-start text-xs font-semibold underline underline-offset-2 hover:opacity-80 lg:text-sm mt-2"
                style={{ color: 'var(--theme-primary)' }}
              >
                {t('returnExchangePolicy')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
