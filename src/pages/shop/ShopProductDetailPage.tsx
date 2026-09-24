import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronDown, ShoppingBag, MessageCircle, Loader2, Check } from 'lucide-react';
import type { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
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
  const addToCartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveDetailImageIndex(0);
    setDetailOptionDropdownOpen(null);
    setDetailOptionError('');
    setAddToCartAnim('idle');
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

  function handleAddToCartFromDetail() {
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

    setAddToCartAnim('adding');
    addToCartTimerRef.current = setTimeout(() => {
      addToCart(product, detailQty, Object.keys(opts).length > 0 ? opts : null, addToCartMessage.trim() || null);
      setAddToCartAnim('success');
      addToCartTimerRef.current = setTimeout(() => {
        openCheckout();
        setAddToCartAnim('idle');
        addToCartTimerRef.current = null;
      }, ADD_TO_CART_SUCCESS_MS);
    }, ADD_TO_CART_ANIM_MS);
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
        <div className="relative z-0 mx-auto w-full max-w-[480px] lg:mx-0 lg:max-w-none lg:w-full overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface shadow-theme-card">
          {activeImage ? (
            <ProductImage src={activeImage} alt={displayName} />
          ) : (
            <div className={`${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} flex items-center justify-center text-theme-text-muted`}>
              <ShoppingBag className="w-16 h-16" />
            </div>
          )}
          {detailImages.length > 1 && (
            <div className="border-t border-theme-border bg-theme-surface-secondary p-3 max-lg:p-3 lg:p-4">
              <div className="flex items-center gap-2 max-lg:gap-2 overflow-x-auto pb-1 lg:gap-3">
                {detailImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveDetailImageIndex(idx)}
                    className={`relative h-16 w-16 max-lg:h-16 max-lg:w-16 shrink-0 overflow-hidden rounded-theme-card border-2 bg-theme-surface transition-all lg:h-20 lg:w-20 ${
                      idx === safeImageIndex
                        ? 'border-theme-primary ring-2 ring-theme-primary/20'
                        : 'border-theme-border hover:border-theme-primary'
                    }`}
                    aria-label={t('viewImage', { n: idx + 1 })}
                  >
                    <img src={getProductImageDisplayUrl(img)} alt="" className={PRODUCT_IMAGE_CLASS} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`min-w-0 rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:p-4 lg:sticky lg:top-24 lg:p-7 ${
            detailOptionDropdownOpen ? 'relative z-40 isolate' : 'relative z-0'
          }`}
        >
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-theme-primary max-lg:mb-1.5 lg:mb-2">{t('productDetails')}</p>
          <h1 className="text-xl max-lg:leading-snug font-bold leading-tight text-theme-text lg:text-3xl">{displayName}</h1>
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
            <p className="mt-3 max-lg:mt-3 text-sm max-lg:text-sm leading-relaxed text-theme-text-secondary lg:mt-4 lg:text-base">{displayDescription}</p>
          )}

          {(hasOptions || hasMessage) && (
            <div className="mt-5 max-lg:mt-5 space-y-4 max-lg:space-y-4 border-t border-theme-border pt-5 max-lg:pt-5 lg:mt-6 lg:space-y-5 lg:pt-6">
              {detailDisplayOptions.map((opt) => {
                const selectedCanonical = addToCartOptions[opt.canonicalName];
                const selectedIdx =
                  selectedCanonical != null ? opt.canonicalChoices.indexOf(selectedCanonical) : -1;
                const selectedLabel =
                  selectedIdx >= 0 ? opt.choices[selectedIdx] : selectedCanonical;
                return (
                  <div key={opt.canonicalName}>
                    <label className="mb-1.5 block text-sm font-medium text-theme-text max-lg:mb-1.5 lg:mb-2">
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
                        className="inline-flex w-full items-center justify-between gap-3 rounded-theme-input border-2 border-theme-border bg-theme-surface-secondary px-3 py-2.5 text-sm font-medium text-theme-text transition-colors hover:border-theme-primary hover:bg-theme-primary-light max-lg:py-2.5 lg:px-4 lg:py-3"
                      >
                        <span className="truncate text-start">
                          {selectedLabel
                            ? selectedLabel
                            : t('selectOption', { name: opt.name })}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-theme-text-muted transition-transform ${detailOptionDropdownOpen === opt.canonicalName ? 'rotate-180' : ''}`} />
                      </button>
                      {detailOptionDropdownOpen === opt.canonicalName && (
                        <ul
                          role="listbox"
                          className="absolute start-0 top-full z-50 mt-1 max-h-[min(18rem,55vh)] w-full touch-pan-y overflow-y-auto overscroll-y-contain rounded-theme-card border border-theme-border bg-theme-surface py-1 shadow-theme-dropdown"
                        >
                          <li role="option" aria-selected={!selectedCanonical}>
                            <button
                              type="button"
                              onClick={() => {
                                setAddToCartOptions((prev) => ({ ...prev, [opt.canonicalName]: '' }));
                                setDetailOptionError('');
                                setDetailOptionDropdownOpen(null);
                              }}
                              className="w-full text-start px-4 py-2.5 text-sm font-medium text-theme-text-muted hover:bg-theme-surface-secondary"
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
                                    ? 'bg-theme-primary-light text-theme-primary font-semibold'
                                    : 'text-theme-text hover:bg-theme-surface-secondary'
                                }`}
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
                  <label className="block text-theme-text font-medium mb-2">
                    <MessageCircle className="w-4 h-4 inline me-1.5 -mt-0.5" />
                    {getLocalizedCustomerMessageLabel(product, lang, t('messageOptional'))}
                  </label>
                  <textarea
                    value={addToCartMessage}
                    onChange={(e) => setAddToCartMessage(e.target.value)}
                    placeholder={t('messagePlaceholder')}
                    rows={3}
                    className="w-full resize-y rounded-theme-input border border-theme-border bg-theme-surface-secondary px-3 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-primary/20 max-lg:py-2.5 lg:px-4 lg:py-3"
                  />
                </div>
              )}
              {detailOptionError && (
                <p className="text-sm font-medium text-red-600">{detailOptionError}</p>
              )}
            </div>
          )}

          <div className="mt-5 max-lg:mt-5 space-y-3 max-lg:space-y-3 border-t border-theme-border pt-5 max-lg:pt-5 lg:mt-6 lg:space-y-4 lg:pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-theme-text-muted">{t('subtotal')}</span>
              <span className="font-bold text-theme-text">{formatPrice(getEffectivePrice(product, Object.keys(addToCartOptions).length ? addToCartOptions : null) * detailQty, shop.currency)}</span>
            </div>
            <div className="flex flex-col gap-3 max-lg:flex-col max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div className="flex w-full max-lg:w-full items-center justify-center overflow-hidden rounded-theme-btn border border-theme-border bg-theme-surface lg:w-auto">
                <button type="button" onClick={() => setDetailQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-theme-text hover:bg-theme-surface-secondary max-lg:py-2.5 lg:py-3">-</button>
                <span className="min-w-[2.5rem] text-center font-semibold text-theme-text">{detailQty}</span>
                <button type="button" onClick={() => setDetailQty((q) => q + 1)} className="px-4 py-2.5 text-theme-text hover:bg-theme-surface-secondary max-lg:py-2.5 lg:py-3">+</button>
              </div>
              <button
                type="button"
                onClick={handleAddToCartFromDetail}
                disabled={product.inStock === false || addToCartAnim !== 'idle'}
                className={`shop-add-to-cart-btn w-full max-lg:w-full flex-1 min-w-0 rounded-theme-btn px-5 py-2.5 font-semibold text-theme-badge-text bg-theme-primary shadow-theme-card hover:bg-theme-primary-hover disabled:cursor-not-allowed disabled:opacity-50 max-lg:py-2.5 lg:min-w-[180px] lg:px-6 lg:py-3 ${
                  addToCartAnim === 'adding' ? 'shop-add-to-cart-btn--adding' : ''
                }${addToCartAnim === 'success' ? ' shop-add-to-cart-btn--success' : ''}`}
              >
                <span className="relative z-[1] inline-flex items-center justify-center gap-2">
                  {product.inStock === false ? (
                    t('outOfStock')
                  ) : addToCartAnim === 'adding' ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      {t('adding')}
                    </>
                  ) : addToCartAnim === 'success' ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" aria-hidden />
                      {t('added')}
                    </>
                  ) : (
                    t('addToCart')
                  )}
                </span>
              </button>
            </div>
            {shop.refundEnabled ? (
              <Link
                to={`/${username}/refund`}
                className="inline-block text-start text-xs font-semibold text-theme-primary underline decoration-theme-primary/35 underline-offset-2 hover:text-theme-primary-hover lg:text-sm"
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
