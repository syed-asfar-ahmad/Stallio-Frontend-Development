import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Shop } from '../../types';
import { formatPrice, formatQuantity } from '../../lib/countryCurrencyOptions';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { getLocalizedDeliveryNote } from '../../lib/shopContentLanguages';
import { DASHBOARD_ICON_CLOSE_BTN } from '../../lib/dashboardFormClasses';
import ContactLtrText from '../ContactLtrText';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type ShopCartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedOptions?: Record<string, string> | null;
  customerMessage?: string | null;
};

type Props = {
  username: string;
  shop: Shop;
  cart: ShopCartItem[];
  onClose: () => void;
  onOrderSuccess: () => void;
  onUpdateQty: (productId: string, delta: number, selectedOptions?: Record<string, string> | null) => void;
  onRemoveFromCart: (productId: string, selectedOptions?: Record<string, string> | null) => void;
};

export default function CheckoutModal({
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

  const fieldClass =
    'w-full rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 focus:border-brand-500 focus:outline-none max-lg:py-2.5 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-600/60 lg:px-4 lg:py-3 lg:text-base';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-stone-800 dark:text-zinc-200';

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
  const deliveryEtaText = shop.deliveryEta?.trim()
    ? /^\d+(\.\d+)?$/.test(shop.deliveryEta.trim())
      ? `${shop.deliveryEta.trim()} day(s)`
      : shop.deliveryEta.trim()
    : '';

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
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          customerEmail: checkoutEmail.trim() || undefined,
          couponCode: couponAppliedCode || couponCode.trim() || undefined,
          items: cart.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
            selectedOptions: c.selectedOptions ?? null,
            customerMessage: c.customerMessage ?? null,
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm max-lg:items-end max-lg:p-0 dark:bg-black/70 lg:items-center lg:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex max-h-[min(92dvh,100%)] w-full flex-col overflow-hidden border border-stone-200 bg-white shadow-2xl max-lg:max-h-[92dvh] max-lg:rounded-t-2xl max-lg:rounded-b-none dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/50 lg:max-h-[92vh] lg:rounded-3xl ${cartIsEmpty ? 'max-w-md' : 'lg:max-w-[720px]'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-dialog-title"
      >
        <div className="shrink-0 border-b border-stone-200 bg-gradient-to-r from-brand-50/70 to-brand-50/70 px-4 py-4 dark:border-zinc-700 dark:from-brand-950/45 dark:to-brand-950/35 max-lg:px-4 max-lg:py-4 lg:px-8 lg:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="checkout-dialog-title" className="text-lg font-bold text-stone-900 dark:text-zinc-100 max-lg:leading-snug lg:text-2xl">
                {t('checkoutTitle')}
              </h2>
              {!cartIsEmpty ? (
                <p className="mt-0.5 text-xs text-stone-600 dark:text-zinc-400 lg:text-sm">
                  {cartCount === 1 ? t('checkoutItem', { count: cartCount }) : t('checkoutItems', { count: cartCount })}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9 shrink-0 disabled:pointer-events-none disabled:opacity-50`}
              aria-label={t('checkoutClose')}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        {cartIsEmpty ? (
          <div className="px-4 py-12 text-center max-lg:px-4 max-lg:py-12 lg:px-8 lg:py-20">
            <p className="text-base font-bold text-stone-900 dark:text-zinc-100 lg:text-lg">{t('checkoutEmpty')}</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y px-4 py-4 max-lg:px-4 max-lg:py-4 lg:px-8 lg:py-8">
            <ul className="mb-5 list-none space-y-2.5 max-lg:mb-5 max-lg:space-y-2.5 lg:mb-6 lg:space-y-3">
              {cart.map((c) => (
                <li
                  key={`${c.productId}-${JSON.stringify(c.selectedOptions ?? {})}`}
                  className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3 dark:border-zinc-700 dark:bg-zinc-800/50 max-lg:p-3 lg:p-4"
                >
                  <div className="flex flex-col gap-2 max-lg:gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 lg:text-base">{c.productName}</p>
                      {(c.selectedOptions && Object.keys(c.selectedOptions).length > 0) || c.customerMessage ? (
                        <div className="mt-1.5 text-xs text-stone-500 dark:text-zinc-400">
                          {c.selectedOptions && Object.keys(c.selectedOptions).length > 0 && (
                            <span className="break-words">
                              {Object.entries(c.selectedOptions)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}
                            </span>
                          )}
                          {c.customerMessage && <span className="mt-0.5 block break-words">{c.customerMessage}</span>}
                        </div>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm font-bold text-brand-700 dark:text-brand-400 sm:text-end sm:text-base">
                      {formatPrice(c.price * c.quantity, shop.currency)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 max-lg:mt-3 lg:gap-3">
                    <div className="flex items-center overflow-hidden rounded-xl border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-900">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(c.productId, -1, c.selectedOptions)}
                        className="flex h-9 w-9 items-center justify-center font-medium text-stone-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        -
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-stone-900 dark:text-zinc-100">
                        {formatQuantity(c.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(c.productId, 1, c.selectedOptions)}
                        className="flex h-9 w-9 items-center justify-center font-medium text-stone-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(c.productId, c.selectedOptions)}
                      className="text-sm font-semibold text-red-600 hover:underline dark:text-red-400"
                    >
                      {t('checkoutRemove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mb-5 space-y-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-3.5 dark:border-brand-800/50 dark:bg-brand-950/30 max-lg:mb-5 max-lg:p-3.5 lg:mb-6 lg:space-y-2.5 lg:p-5">
              {shopDeliveryEnabled && shopDeliveryType === 'free' && shopFreeDeliveryThreshold != null && (
                <p
                  className={`inline-flex max-w-full flex-wrap rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                    isFreeByThreshold
                      ? 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800/50 dark:bg-brand-950/40 dark:text-brand-300'
                      : 'border-brand-200 bg-brand-100/60 text-brand-700 dark:border-brand-800/50 dark:bg-brand-950/50 dark:text-brand-300'
                  }`}
                >
                  {isFreeByThreshold
                    ? t('checkoutFreeUnlocked', { amount: formatPrice(shopFreeDeliveryThreshold, shop.currency) })
                    : t('checkoutFreeThreshold', { amount: formatPrice(shopFreeDeliveryThreshold, shop.currency) })}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 text-sm">
                <p className="font-medium text-stone-600 dark:text-zinc-400">{t('subtotal')}</p>
                <p className="shrink-0 font-semibold text-stone-800 dark:text-zinc-200">{formatPrice(subtotal, shop.currency)}</p>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between gap-2 text-sm text-brand-700 dark:text-brand-400">
                  <p className="min-w-0 font-medium">
                    {t('checkoutDiscount')}
                    {couponAppliedCode ? (
                      <>
                        {' ('}
                        <ContactLtrText>{couponAppliedCode}</ContactLtrText>
                        {')'}
                      </>
                    ) : (
                      ''
                    )}
                  </p>
                  <p className="shrink-0 font-semibold">-{formatPrice(discountAmount, shop.currency)}</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 text-sm">
                <p className="font-medium text-stone-600 dark:text-zinc-400">{t('checkoutDelivery')}</p>
                <p className="shrink-0 text-end font-semibold text-stone-800 dark:text-zinc-200">
                  {deliveryAmount === 0 && shopDeliveryEnabled && shopDeliveryFee > 0 ? (
                    <span className="inline-flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                      <span className="text-stone-400 line-through dark:text-zinc-500">
                        {formatPrice(shopDeliveryFee, shop.currency)}
                      </span>
                      <span className="font-bold text-brand-700 dark:text-brand-400">{t('checkoutFree')}</span>
                    </span>
                  ) : deliveryAmount === 0 && shopDeliveryEnabled ? (
                    t('checkoutFree')
                  ) : (
                    formatPrice(deliveryAmount, shop.currency)
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-brand-200/70 pt-2 dark:border-brand-800/50">
                <p className="text-sm font-semibold text-stone-700 dark:text-zinc-300">{t('checkoutTotal')}</p>
                <p className="shrink-0 text-lg font-extrabold text-brand-700 dark:text-brand-400 lg:text-2xl">
                  {formatPrice(total, shop.currency)}
                </p>
              </div>
              {(deliveryEtaText || checkoutNoteText) && (
                <p className="pt-1 text-xs leading-relaxed text-stone-500 dark:text-zinc-400">
                  {deliveryEtaText ? t('checkoutEta', { eta: deliveryEtaText }) : ''}
                  {deliveryEtaText && checkoutNoteText ? ', ' : ''}
                  {checkoutNoteText}
                </p>
              )}
              {shop.deliveryCodEnabled && (
                <p className="text-xs font-medium text-brand-700 dark:text-brand-400">{t('checkoutCod')}</p>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-2 max-lg:mb-4 lg:flex-row">
              <input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponDiscount(0);
                  setCouponAppliedCode('');
                }}
                placeholder={t('checkoutCouponPh')}
                dir="ltr"
                className={`${fieldClass} flex-1 font-mono uppercase [unicode-bidi:isolate]`}
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={applyingCoupon || !couponCode.trim()}
                className="w-full shrink-0 rounded-xl border-2 border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60 dark:border-brand-700/50 dark:bg-zinc-800 dark:text-brand-300 dark:hover:bg-brand-950/40 max-lg:py-2.5 lg:w-auto lg:py-3"
              >
                {applyingCoupon ? t('checkoutChecking') : t('checkoutApply')}
              </button>
            </div>
            {couponError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{couponError}</p>}

            <form onSubmit={placeOrder}>
              {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="mb-4 grid gap-3 max-lg:mb-4 max-lg:gap-3 lg:grid-cols-2 lg:gap-4">
                <div>
                  <label className={labelClass}>
                    {t('yourName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder={t('checkoutNamePh')}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {t('phoneNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder={t('checkoutPhonePh')}
                    dir="ltr"
                    className={`${fieldClass} [unicode-bidi:isolate]`}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelClass}>{t('checkoutEmailLabel')}</label>
                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  placeholder={t('checkoutEmailPh')}
                  dir="ltr"
                  className={`${fieldClass} [unicode-bidi:isolate]`}
                />
              </div>
              <div className="mb-5 max-lg:mb-5 lg:mb-6">
                <label className={labelClass}>
                  {t('address')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  required
                  placeholder={t('checkoutAddressPh')}
                  className={`${fieldClass} min-h-[5.5rem] resize-y lg:min-h-[100px]`}
                />
              </div>
              {shop.refundEnabled ? (
                <div className="mb-4 text-start max-lg:mb-4 lg:mb-5">
                  <Link
                    to={`/${username}/refund`}
                    onClick={onClose}
                    className="text-xs font-semibold text-brand-700 underline decoration-brand-700/35 underline-offset-2 hover:text-brand-800 dark:text-brand-400 dark:decoration-brand-400/40 dark:hover:text-brand-300 lg:text-sm"
                  >
                    {t('returnExchangePolicy')}
                  </Link>
                </div>
              ) : null}
              <div className="flex flex-col gap-2.5 max-lg:gap-2.5 lg:flex-row lg:gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-brand-500 disabled:opacity-60 max-lg:py-3 lg:py-3.5 lg:text-base"
                >
                  {submitting ? t('checkoutPlacing') : t('checkoutPlaceOrder')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 max-lg:py-3 lg:w-auto lg:py-3.5 lg:text-base"
                >
                  {t('continueShopping')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
