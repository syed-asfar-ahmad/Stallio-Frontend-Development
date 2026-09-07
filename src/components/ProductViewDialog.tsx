import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MessageCircle, X } from 'lucide-react';
import { formatPrice } from '../lib/countryCurrencyOptions';
import type { Product } from '../types';
import ProductImage from './ProductImage';
import { PRODUCT_IMAGE_CLASS } from '../lib/imageCropViewports';
import { getProductImageDisplayUrl } from '../lib/productImageUrl';
import { DASHBOARD_ICON_CLOSE_BTN } from '../lib/dashboardFormClasses';

type Props = {
  product: Product;
  currencyCode?: string | null;
  onClose: () => void;
};

export default function ProductViewDialog({ product: p, currencyCode, onClose }: Props) {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
  const options = (Array.isArray(p.options) ? p.options : []).filter((opt) => (opt?.name ?? '').trim());
  const currentImage = images[currentImageIndex] ?? images[0];
  const productName = p.name ?? t('dashboard.products.name');
  const productPrice = Number(p.price);
  const productDescription = p.description?.trim() ?? '';
  const allowMessage = Boolean(p.allowCustomerMessage);
  const messageLabel = p.customerMessageLabel?.trim() || t('dashboard.products.defaultMessageLabel');

  return (
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end lg:items-center justify-center p-0 max-lg:p-0 lg:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl max-lg:max-w-none max-h-[90vh] max-lg:max-h-[92vh] overflow-hidden max-lg:rounded-t-2xl max-lg:rounded-b-none lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 max-lg:gap-3 lg:gap-4 px-4 max-lg:px-4 lg:px-6 py-3 max-lg:py-3 lg:py-4 border-b border-stone-200 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-900 shrink-0">
          <h3 className="font-bold text-stone-900 dark:text-zinc-100 text-base max-lg:text-base lg:text-lg truncate">{t('dashboard.products.productDetails')}</h3>
          <button
            type="button"
            onClick={onClose}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9`}
            aria-label={t('dashboard.common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 max-lg:p-4 lg:p-6 space-y-4 max-lg:space-y-4 lg:space-y-5 min-h-0">
          {images.length > 0 && (
            <div className="rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden">
              <ProductImage src={currentImage} alt={productName}>
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1))}
                      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 dark:bg-zinc-800/90 shadow-md border border-white/20 dark:border-zinc-600 flex items-center justify-center text-white hover:bg-black/70 dark:hover:bg-zinc-700 hover:border-brand-500/40"
                      aria-label={t('dashboard.products.ariaPrevImage')}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1))}
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 dark:bg-zinc-800/90 shadow-md border border-white/20 dark:border-zinc-600 flex items-center justify-center text-white hover:bg-black/70 dark:hover:bg-zinc-700 hover:border-brand-500/40"
                      aria-label={t('dashboard.products.ariaNextImage')}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                      {currentImageIndex + 1} {t('dashboard.common.of')} {images.length}
                    </span>
                  </>
                )}
              </ProductImage>
              {images.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto border-t border-stone-100 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-800/90">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-stone-100 focus:ring-2 focus:ring-brand-500 transition-colors dark:bg-zinc-800 ${
                        i === currentImageIndex ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200 dark:border-zinc-700'
                      }`}
                    >
                      <img src={getProductImageDisplayUrl(url)} alt="" className={PRODUCT_IMAGE_CLASS} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-1">{t('dashboard.products.name')}</p>
            <p className="font-semibold text-stone-900 dark:text-zinc-100 text-lg">{productName}</p>
          </div>
          {productDescription && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-1">{t('dashboard.products.description')}</p>
              <p className="text-stone-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">{productDescription}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-1">{t('dashboard.products.price')}</p>
            <p className="font-bold text-brand-600 text-xl tabular-nums">{formatPrice(productPrice, currencyCode)}</p>
          </div>
          {(options.length > 0 || allowMessage) && (
            <div className="space-y-5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 p-4">
              <div className="space-y-4">
                {options.map((opt, optIdx) => {
                  const choices = Array.isArray(opt.choices) ? opt.choices.filter(Boolean) : [];
                  const optionName = opt && opt.name ? String(opt.name).trim() : t('dashboard.products.optionN', { n: optIdx + 1 });
                  return (
                    <div key={`opt-${optIdx}`}>
                      <p className="text-stone-800 dark:text-zinc-200 font-medium mb-2">{optionName}</p>
                      {choices.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {choices.map((c) => (
                            <span
                              key={String(c)}
                              className="inline-flex items-center rounded-full bg-stone-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-stone-800 dark:text-zinc-200"
                            >
                              {String(c)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-stone-500 dark:text-zinc-400 text-sm">-</p>
                      )}
                    </div>
                  );
                })}
                {allowMessage && (
                  <div>
                    <label className="block text-stone-800 dark:text-zinc-200 font-medium mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      {messageLabel}
                    </label>
                    <textarea
                      readOnly
                      tabIndex={-1}
                      rows={3}
                      placeholder={t('dashboard.products.messagePlaceholder')}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 placeholder-stone-400 dark:placeholder-zinc-500 resize-none cursor-default"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/35 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50"
          >
            {t('dashboard.common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
