import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Sprout, ArrowRight, Truck, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import type { Shop } from '../../../../types';
import { formatPrice, formatQuantity } from '../../../../lib/countryCurrencyOptions';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedDeliveryNote } from '../../../../lib/shopContentLanguages';
import type { ShopCartItem } from '../../CheckoutModal';
import { PacificPillTag } from './PacificParts';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Props = {
  username: string;
  shop: Shop;
  cart: ShopCartItem[];
  onClose: () => void;
  onOrderSuccess: () => void;
  onUpdateQty: (productId: string, delta: number, selectedOptions?: Record<string, string> | null) => void;
  onRemoveFromCart: (productId: string, selectedOptions?: Record<string, string> | null) => void;
};

export default function PacificCartModal({
  username,
  shop,
  cart,
  onClose,
  onOrderSuccess,
  onUpdateQty,
  onRemoveFromCart,
}: Props) {
  const { t, lang } = useShopLanguage();
  const checkoutNoteText = getLocalizedDeliveryNote(shop, lang);
  const cartIsEmpty = cart.length === 0;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponAppliedCode, setCouponAppliedCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const discountAmount = couponDiscount;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shopDeliveryEnabled = Boolean(shop.deliveryEnabled);
  const shopDeliveryType = shop.deliveryType === 'free' ? 'free' : 'fixed';
  const shopDeliveryFee =
    typeof shop.deliveryFee === 'number' && Number.isFinite(shop.deliveryFee) ? Math.max(0, shop.deliveryFee) : 0;
  const shopFreeDeliveryThreshold =
    typeof shop.freeDeliveryThreshold === 'number' && Number.isFinite(shop.freeDeliveryThreshold)
      ? Math.max(0, shop.freeDeliveryThreshold)
      : null;
  const isFreeByThreshold =
    shopDeliveryType === 'free' &&
    shopFreeDeliveryThreshold != null &&
    subtotalAfterDiscount >= shopFreeDeliveryThreshold;
  const deliveryAmount = shopDeliveryEnabled ? (isFreeByThreshold ? 0 : shopDeliveryFee) : 0;
  const total = subtotalAfterDiscount + deliveryAmount;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const deliveryProgress =
    shopFreeDeliveryThreshold && shopFreeDeliveryThreshold > 0
      ? Math.min(100, Math.round((subtotalAfterDiscount / shopFreeDeliveryThreshold) * 100))
      : 100;
  const remainingForFree =
    shopFreeDeliveryThreshold && subtotalAfterDiscount < shopFreeDeliveryThreshold
      ? shopFreeDeliveryThreshold - subtotalAfterDiscount
      : 0;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError('');
    setApplyingCoupon(true);
    try {
      const res = await fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errorInvalidCoupon'));
      setCouponDiscount(data.discountAmount ?? 0);
      setCouponAppliedCode(data.code ?? couponCode.trim());
    } catch (err) {
      setCouponDiscount(0);
      setCouponAppliedCode('');
      setCouponError((err as Error).message);
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: checkoutEmail.trim() || undefined,
          customerAddress: customerAddress.trim(),
          couponCode: couponAppliedCode || undefined,
          items: cart.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
            selectedOptions: c.selectedOptions ?? undefined,
            customerMessage: c.customerMessage ?? undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errorOrderFailed'));
      onOrderSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-md transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex max-h-[min(94dvh,100%)] sm:max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] border border-theme-border bg-theme-surface shadow-2xl ${
          cartIsEmpty ? 'max-w-md' : 'max-w-2xl lg:max-w-3xl'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pacific-cart-title"
      >
        {/* Header */}
        <div
          className="shrink-0 border-b border-theme-border p-5 sm:p-6 flex items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
          }}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <PacificPillTag icon={Sprout}>Harvest Basket</PacificPillTag>
              {!cartIsEmpty && (
                <span className="text-xs font-semibold text-theme-text-muted">
                  {cartCount === 1 ? t('checkoutItem', { count: cartCount }) : t('checkoutItems', { count: cartCount })}
                </span>
              )}
            </div>
            <h2
              id="pacific-cart-title"
              className="text-xl sm:text-2xl font-normal text-theme-text tracking-tight"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('checkoutTitle') || 'Your Selected Provisions'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text-muted hover:border-theme-primary hover:text-theme-primary transition-colors"
            aria-label={t('checkoutClose')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Delivery Tracker (if applicable) */}
        {shopDeliveryEnabled && shopDeliveryType === 'free' && shopFreeDeliveryThreshold != null && !cartIsEmpty && (
          <div className="px-6 py-3 bg-theme-primary-light border-b border-theme-border text-xs">
            <div className="flex items-center justify-between font-semibold text-theme-primary mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                {isFreeByThreshold
                  ? '✨ Complimentary Chilled Courier Unlocked!'
                  : `Add ${formatPrice(remainingForFree, shop.currency)} more for free fresh delivery`}
              </span>
              <span>{deliveryProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-theme-surface overflow-hidden">
              <div
                className="h-full bg-theme-primary rounded-full transition-all duration-500"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Body content */}
        {cartIsEmpty ? (
          <div className="p-8 sm:p-14 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary">
              <ShoppingBag className="h-8 w-8 opacity-40" />
            </div>
            <h3
              className="text-xl font-normal text-theme-text"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('checkoutEmpty') || 'Your harvest basket is empty'}
            </h3>
            <p className="text-xs sm:text-sm text-theme-text-muted max-w-xs mx-auto">
              Explore our artisanal provisions, pure harvests, and cold-pressed elixirs.
            </p>
            <div className="pt-2">
              <Link
                to={`/${username}/products`}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider text-white no-underline shadow-sm"
                style={{ background: 'var(--theme-primary)' }}
              >
                <span>Explore Provisions</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Cart Items List */}
            <ul className="list-none space-y-3">
              {cart.map((c) => (
                <li
                  key={`${c.productId}-${JSON.stringify(c.selectedOptions ?? {})}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-theme-border bg-theme-surface shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-theme-surface-secondary border border-theme-border text-theme-primary">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-theme-text line-clamp-1">{c.productName}</h4>
                      {c.selectedOptions && Object.keys(c.selectedOptions).length > 0 && (
                        <p className="text-[11px] text-theme-text-muted line-clamp-1">
                          {Object.entries(c.selectedOptions)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </p>
                      )}
                      {c.customerMessage && (
                        <p className="text-[11px] text-theme-text-muted italic">"{c.customerMessage}"</p>
                      )}
                      <span className="text-xs font-bold text-theme-primary sm:hidden block mt-0.5">
                        {formatPrice(c.price * c.quantity, shop.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    {/* Stepper */}
                    <div className="flex h-9 items-center rounded-full border border-theme-border bg-theme-surface-secondary p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(c.productId, -1, c.selectedOptions)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-theme-text hover:bg-theme-surface"
                      >
                        -
                      </button>
                      <span className="min-w-[1.75rem] text-center text-xs font-bold text-theme-text">
                        {formatQuantity(c.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(c.productId, 1, c.selectedOptions)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-theme-text hover:bg-theme-surface"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-bold text-theme-primary hidden sm:inline min-w-[4rem] text-end">
                      {formatPrice(c.price * c.quantity, shop.currency)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(c.productId, c.selectedOptions)}
                      className="text-xs font-semibold text-red-600 hover:underline p-1"
                    >
                      {t('checkoutRemove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Coupon Code Section */}
            <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface-secondary space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-theme-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-theme-text">
                  Patron Promotional Code
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code..."
                  className="flex-1 rounded-full border border-theme-border bg-theme-surface px-4 py-2 text-xs text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider bg-theme-primary text-theme-primary-contrast hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {applyingCoupon ? '...' : t('checkoutApplyCoupon') || 'Apply'}
                </button>
              </div>
              {couponAppliedCode && (
                <p className="text-xs font-semibold text-emerald-600">
                  ✓ Code "{couponAppliedCode}" applied (-{formatPrice(discountAmount, shop.currency)})
                </p>
              )}
              {couponError && <p className="text-xs font-semibold text-red-600">{couponError}</p>}
            </div>

            {/* Order Price Breakdown */}
            <div className="p-4 sm:p-5 rounded-2xl border border-theme-border bg-theme-surface space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-theme-text-secondary">
                <span>{t('checkoutSubtotal') || 'Provisions Subtotal'}</span>
                <span className="font-semibold text-theme-text">{formatPrice(subtotal, shop.currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t('checkoutDiscount') || 'Promotional Discount'}</span>
                  <span>-{formatPrice(discountAmount, shop.currency)}</span>
                </div>
              )}
              {shopDeliveryEnabled && (
                <div className="flex justify-between text-theme-text-secondary">
                  <span>{t('checkoutDelivery') || 'Chilled Courier'}</span>
                  <span className="font-semibold text-theme-text">
                    {deliveryAmount === 0 ? (
                      <span className="text-emerald-600 uppercase text-xs font-bold">Complimentary</span>
                    ) : (
                      formatPrice(deliveryAmount, shop.currency)
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-theme-border pt-3 flex justify-between text-base sm:text-lg font-extrabold text-theme-text">
                <span>{t('checkoutTotal') || 'Order Total'}</span>
                <span className="text-theme-primary">{formatPrice(total, shop.currency)}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={placeOrder} className="space-y-4 border-t border-theme-border pt-5">
              <h4
                className="text-base font-normal text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Delivery & Contact Information
              </h4>

              {error && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 text-xs font-semibold text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-text mb-1">
                    {t('checkoutCustomerName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Full name"
                    className="w-full rounded-full border border-theme-border bg-theme-surface-secondary px-4 py-2.5 text-xs text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-text mb-1">
                    {t('checkoutCustomerPhone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="Phone number"
                    className="w-full rounded-full border border-theme-border bg-theme-surface-secondary px-4 py-2.5 text-xs text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-text mb-1">
                  {t('checkoutCustomerEmail') || 'Email (for order dispatch updates)'}
                </label>
                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-full border border-theme-border bg-theme-surface-secondary px-4 py-2.5 text-xs text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-text mb-1">
                  {t('checkoutCustomerAddress')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  required
                  rows={2}
                  placeholder="Street address, apartment, city, postal code"
                  className="w-full rounded-2xl border border-theme-border bg-theme-surface-secondary p-3 text-xs text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                />
              </div>

              {checkoutNoteText && (
                <p className="text-[11px] text-theme-text-muted italic bg-theme-surface-secondary p-3 rounded-xl border border-theme-border">
                  ℹ️ {checkoutNoteText}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex h-13 items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                style={{ background: 'var(--theme-primary)' }}
              >
                <span>{submitting ? t('sending') : t('checkoutSubmit') || 'Complete Order'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
