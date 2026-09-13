import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { getStoredToken } from '../context/AuthContext';
import { getCurrencySymbol } from '../lib/countryCurrencyOptions';
import type { Product, ProductOption } from '../types';
import { X, ImagePlus, Plus, Trash2, ChevronDown, Eye, Package, Layers } from 'lucide-react';
import DashboardSwitch from './DashboardSwitch';
import ConfirmDialog from './ConfirmDialog';
import { FieldLabelWithHelp, FieldTitleWithHelp } from './FieldLabelWithHelp';
import DashboardCheckbox from './DashboardCheckbox';
import {
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_ICON_CLOSE_BTN,
  DASHBOARD_ICON_REMOVE_INLINE_BTN,
  DASHBOARD_INPUT,
  DASHBOARD_NUMBER_INPUT,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';
import DashboardSearchSelect from './DashboardSearchSelect';
import { formatPrice } from '../lib/countryCurrencyOptions';
import { AdminLoadingInline } from './DashboardLoading';
import { PRODUCT_CARD_ASPECT_CLASS, PRODUCT_IMAGE_CLASS, PRODUCT_IMAGE_FRAME_CLASS } from '../lib/imageCropViewports';
import ProductImage from './ProductImage';
import { getProductImageDisplayUrl } from '../lib/productImageUrl';
import MultilingualTextSection from './MultilingualTextSection';
import { useCloseOnOutsideClick } from '../hooks/useCloseOnOutsideClick';
import DashboardImageRemoveButton from './DashboardImageRemoveButton';
import {
  SHOP_CONTENT_LANGUAGES,
  productOptionsHaveContent,
  isContentFieldRequired,
  isSharedFieldLocked,
  isSharedFieldRequired,
  type ShopContentLang,
} from '../lib/shopContentLanguages';
import SharedLockedField, { sharedLockedInputClass } from './SharedLockedField';
import {
  alignedTranslationsForNormalizedEn,
  alignProductOptionTranslations,
  buildLocalizedOptionsForSave,
  mergeProductOptionsForDisplay,
  syncProductOptionTranslations,
} from '../lib/productOptionTranslations';
import { useSellerContentLanguages, useSellerMultilingualEnabled } from '../hooks/useSellerContentLanguages';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function cloneProductOptions(raw?: ProductOption[] | null): ProductOption[] {
  if (!raw?.length) return [];
  return raw.map((o) => {
    const choices = [...(o.choices || [])];
    const mods = Array.isArray(o.choicePriceModifiers) ? o.choicePriceModifiers.slice() : [];
    while (mods.length < choices.length) mods.push(0);
    return { name: o.name, choices, choicePriceModifiers: mods, required: Boolean(o.required) };
  });
}

export type ProductFormSavePayload = {
  name: string;
  nameEs?: string;
  nameAr?: string;
  description: string;
  descriptionEs?: string;
  descriptionAr?: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity?: number | null;
  isVisible?: boolean;
  image?: string;
  imagePublicId?: string;
  images: string[];
  imagePublicIds: string[];
  options: ProductOption[];
  optionsEs?: ProductOption[];
  optionsAr?: ProductOption[];
  allowCustomerMessage: boolean;
  customerMessageLabel: string | null;
  customerMessageLabelEs?: string | null;
  customerMessageLabelAr?: string | null;
  category?: string;
  isFeatured?: boolean;
};

type Props = {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
  currencyCode?: string | null;
  categoriesEnabled?: boolean;
  categories?: { name: string; slug: string }[];
  onSavePayload?: (payload: ProductFormSavePayload) => Promise<void>;
  title?: string;
  adminButtons?: boolean;
  catalogProducts?: Product[];
  maxImages?: number;
};

export default function ProductForm({
  product,
  onClose,
  onSaved,
  currencyCode,
  categoriesEnabled,
  categories,
  onSavePayload,
  title,
  adminButtons = false,
  catalogProducts = [],
  maxImages,
}: Props) {
  const { t } = useTranslation();
  const btn = (key: string, adminLabel: string) => (adminButtons ? adminLabel : t(key));
  const currencySymbol = getCurrencySymbol(currencyCode);
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const [formNames, setFormNames] = useState<Record<ShopContentLang, string>>(() => ({
    en: product?.name ?? '',
    es: product?.nameEs ?? '',
    ar: product?.nameAr ?? '',
  }));
  const [formDescriptions, setFormDescriptions] = useState<Record<ShopContentLang, string>>(() => ({
    en: product?.description ?? '',
    es: product?.descriptionEs ?? '',
    ar: product?.descriptionAr ?? '',
  }));
  const [price, setPrice] = useState(product?.price !== undefined ? String(product.price) : '');
  const [onSale, setOnSale] = useState(() => {
    if (!product) return false;
    const sale = Number(product.price) || 0;
    const original = product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
    return original != null && original > sale;
  });
  const [compareAtPrice, setCompareAtPrice] = useState(() => {
    if (!product) return '';
    const sale = Number(product.price) || 0;
    const original = product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
    if (original != null && original > sale) return String(original);
    return '';
  });
  const [stockQuantity, setStockQuantity] = useState(
    product?.stockQuantity != null ? String(product.stockQuantity) : ''
  );
  const [isVisible, setIsVisible] = useState(product?.isVisible !== false);
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.isFeatured));
  const [visibleToggleConfirm, setVisibleToggleConfirm] = useState<boolean | null>(null);
  const [featuredToggleConfirm, setFeaturedToggleConfirm] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(product?.image ?? null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(product?.imagePublicId ?? null);
  const [images, setImages] = useState<string[]>(product?.images?.length ? product.images : (product?.image ? [product.image] : []));
  const [imagePublicIds, setImagePublicIds] = useState<string[]>(product?.imagePublicIds?.length ? product.imagePublicIds : (product?.imagePublicId ? [product.imagePublicId] : []));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formOptions, setFormOptions] = useState<Record<ShopContentLang, ProductOption[]>>(() => {
    const en = cloneProductOptions(product?.options);
    return syncProductOptionTranslations(en, {
      en,
      es: cloneProductOptions(product?.optionsEs),
      ar: cloneProductOptions(product?.optionsAr),
    });
  });
  const [allowCustomerMessage, setAllowCustomerMessage] = useState(Boolean(product?.allowCustomerMessage));
  const [customerMessageLabels, setCustomerMessageLabels] = useState<Record<ShopContentLang, string>>(() => ({
    en: product?.customerMessageLabel ?? '',
    es: product?.customerMessageLabelEs ?? '',
    ar: product?.customerMessageLabelAr ?? '',
  }));
  const [category, setCategory] = useState<string>(product?.category ?? '');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(categoryDropdownOpen, () => setCategoryDropdownOpen(false), categoryDropdownRef);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copyFromProductId, setCopyFromProductId] = useState('');
  const showCategory = Boolean(categoriesEnabled && categories && categories.length > 0);
  const categoryLabel = (categories ?? []).find((c) => c.slug === category)?.name ?? t('dashboard.productForm.noCategory');

  const displayImages = images.length > 0 ? images : (image ? [image] : []);
  const displayPublicIds = imagePublicIds.length > 0 ? imagePublicIds : (imagePublicId ? [imagePublicId] : []);

  useEffect(() => {
    setFormNames({
      en: product?.name ?? '',
      es: product?.nameEs ?? '',
      ar: product?.nameAr ?? '',
    });
    setFormDescriptions({
      en: product?.description ?? '',
      es: product?.descriptionEs ?? '',
      ar: product?.descriptionAr ?? '',
    });
    const enOpts = cloneProductOptions(product?.options);
    setFormOptions(
      syncProductOptionTranslations(enOpts, {
        en: enOpts,
        es: cloneProductOptions(product?.optionsEs),
        ar: cloneProductOptions(product?.optionsAr),
      }),
    );
    setCustomerMessageLabels({
      en: product?.customerMessageLabel ?? '',
      es: product?.customerMessageLabelEs ?? '',
      ar: product?.customerMessageLabelAr ?? '',
    });
    setFormLang('en');
  }, [product?.id]);

  useEffect(() => {
    const len = images.length > 0 ? images.length : image ? 1 : 0;
    setPreviewImageIndex((i) => (len === 0 ? 0 : Math.min(i, len - 1)));
  }, [images.length, image]);

  function normalizeOptionsForSave(raw: ProductOption[]): ProductOption[] {
    return raw
      .map((o) => {
        const choices = o.choices.map((c) => c.trim()).filter(Boolean);
        const mods = o.choicePriceModifiers ?? choices.map(() => 0);
        return {
          name: o.name.trim(),
          choices,
          choicePriceModifiers: choices.map((_, i) =>
            typeof mods[i] === 'number' && Number.isFinite(mods[i]) ? mods[i] : 0,
          ),
          required: Boolean(o.required),
        };
      })
      .filter((o) => o.name && o.choices.length > 0);
  }

  function copyOptionsFromProduct() {
    const source = catalogProducts.find((p) => p.id === copyFromProductId);
    const enOpts = source?.options;
    if (!source || !productOptionsHaveContent(enOpts)) {
      toast.error(t('dashboard.productForm.noOptions'));
      return;
    }
    const enClone = cloneProductOptions(enOpts);
    setFormOptions(
      syncProductOptionTranslations(enClone, {
        en: enClone,
        es: alignProductOptionTranslations(enClone, source.optionsEs),
        ar: alignProductOptionTranslations(enClone, source.optionsAr),
      }),
    );
    setCopyFromProductId('');
    toast.success(t('dashboard.productForm.choicesCopied'));
  }

  function setFormOptionsAll(updater: (structure: ProductOption[]) => ProductOption[]) {
    setFormOptions((prev) => syncProductOptionTranslations(updater(prev.en ?? []), prev));
  }

  function patchOptionTranslations(
    optionIndex: number,
    lang: ShopContentLang,
    patch: { name?: string; choiceIndex?: number; choiceValue?: string },
  ) {
    setFormOptions((prev) => {
      const enOpt = prev.en[optionIndex];
      if (!enOpt) return prev;

      if (lang === 'en') {
        const nextEn = [...prev.en];
        const cur = nextEn[optionIndex];
        if (!cur) return prev;
        const mods = cur.choicePriceModifiers ?? cur.choices.map(() => 0);
        const name = patch.name ?? cur.name;
        const choices =
          patch.choiceIndex !== undefined
            ? cur.choices.map((c, ci) => (ci === patch.choiceIndex ? patch.choiceValue ?? '' : c))
            : cur.choices;
        nextEn[optionIndex] = {
          ...cur,
          name,
          choices,
          choicePriceModifiers: choices.map((_, i) => (typeof mods[i] === 'number' ? mods[i] : 0)),
          required: Boolean(cur.required),
        };
        return syncProductOptionTranslations(nextEn, prev);
      }

      const next = alignProductOptionTranslations(prev.en, prev[lang]);
      const curTr = next[optionIndex] ?? {
        name: '',
        choices: enOpt.choices.map(() => ''),
        choicePriceModifiers: enOpt.choicePriceModifiers ?? enOpt.choices.map(() => 0),
        required: Boolean(enOpt.required),
      };
      const trName = patch.name !== undefined ? patch.name : curTr.name;
      const trChoices =
        patch.choiceIndex !== undefined
          ? curTr.choices.map((c, ci) => (ci === patch.choiceIndex ? patch.choiceValue ?? '' : c))
          : curTr.choices;
      next[optionIndex] = {
        name: trName,
        choices: enOpt.choices.map((_, ci) => trChoices[ci] ?? ''),
        choicePriceModifiers: curTr.choicePriceModifiers ?? enOpt.choicePriceModifiers ?? enOpt.choices.map(() => 0),
        required: Boolean(enOpt.required),
      };
      return { ...prev, [lang]: next };
    });
  }

  async function uploadImageFile(file: File): Promise<{ url: string; publicId?: string }> {
    const token = getStoredToken();
    if (!token) throw new Error(t('dashboard.productForm.toastLoginUpload'));
    const form = new FormData();
    form.append('file', file, file.name || 'product.png');
    form.append('type', 'product');
    const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
    if (!data.url) throw new Error(t('dashboard.productForm.toastNoUrl'));
    return { url: data.url, publicId: data.publicId };
  }

  function appendUploadedImage(url: string, publicId?: string) {
    setImages((prev) => [...prev, url]);
    setImagePublicIds((prev) => [...prev, ...(publicId ? [publicId] : [])]);
    if (displayImages.length === 0) {
      setImage(url);
      setImagePublicId(publicId ?? null);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!picked.length) {
      toast.error(t('dashboard.home.cropImageOnly'));
      return;
    }
    const currentCount = displayImages.length;
    const slotsLeft = maxImages !== undefined ? Math.max(0, maxImages - currentCount) : picked.length;
    if (maxImages !== undefined && slotsLeft <= 0) {
      toast.error(t('dashboard.productForm.imagesLimitBody', { max: maxImages }));
      return;
    }
    const toUpload = picked.slice(0, slotsLeft);
    const skipped = picked.length - toUpload.length;
    setError('');
    setUploading(true);
    try {
      for (const file of toUpload) {
        const { url, publicId } = await uploadImageFile(file);
        appendUploadedImage(url, publicId);
      }
      toast.success(
        toUpload.length === 1
          ? t('dashboard.productForm.toastSingleUpload')
          : t('dashboard.productForm.toastMultiUpload', { count: toUpload.length }),
      );
      if (skipped > 0 && maxImages !== undefined) {
        toast.error(t('dashboard.productForm.imagesLimitBody', { max: maxImages }));
      }
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addOption() {
    setFormOptionsAll((prev) => [...prev, { name: '', choices: [''], choicePriceModifiers: [0], required: false }]);
  }
  function removeOption(index: number) {
    setFormOptionsAll((prev) => prev.filter((_, i) => i !== index));
  }
  function addChoice(optionIndex: number) {
    setFormOptionsAll((prev) =>
      prev.map((o, i) => {
        if (i !== optionIndex) return o;
        const mods = o.choicePriceModifiers ?? o.choices.map(() => 0);
        return { ...o, choices: [...o.choices, ''], choicePriceModifiers: [...mods, 0] };
      }),
    );
  }
  function updateOptionName(optionIndex: number, name: string) {
    patchOptionTranslations(optionIndex, formLang, { name });
  }

  function updateChoice(optionIndex: number, choiceIndex: number, value: string) {
    patchOptionTranslations(optionIndex, formLang, { choiceIndex, choiceValue: value });
  }
  function updateChoiceModifier(optionIndex: number, choiceIndex: number, modifier: number) {
    setFormOptionsAll((prev) =>
      prev.map((o, i) => {
        if (i !== optionIndex) return o;
        const mods = [...(o.choicePriceModifiers ?? o.choices.map(() => 0))];
        mods[choiceIndex] = modifier;
        return { ...o, choicePriceModifiers: mods };
      }),
    );
  }
  function setOptionRequired(optionIndex: number, required: boolean) {
    setFormOptionsAll((prev) =>
      prev.map((o, i) => (i === optionIndex ? { ...o, required } : o)),
    );
  }
  function removeChoice(optionIndex: number, choiceIndex: number) {
    setFormOptionsAll((prev) =>
      prev.map((o, i) => {
        if (i !== optionIndex) return o;
        const choices = o.choices.filter((_, j) => j !== choiceIndex);
        const mods = (o.choicePriceModifiers ?? o.choices.map(() => 0)).filter((_, j) => j !== choiceIndex);
        return { ...o, choices, choicePriceModifiers: mods };
      }),
    );
  }

  function removeImage(index: number) {
    const urls = [...displayImages];
    const ids = [...displayPublicIds];
    urls.splice(index, 1);
    ids.splice(index, 1);
    setImages(urls);
    setImagePublicIds(ids);
    setImage(urls[0] ?? null);
    setImagePublicId(ids[0] ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!formNames.en.trim()) {
      setError(t('dashboard.productForm.validationName'));
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError(onSale ? t('dashboard.productForm.validationSalePrice') : t('dashboard.productForm.validationPrice'));
      return;
    }
    if (onSale) {
      if (!compareAtPrice.trim()) {
        setError(t('dashboard.productForm.validationSaleFields'));
        return;
      }
      const compareNum = parseFloat(compareAtPrice);
      if (isNaN(compareNum) || compareNum < 0) {
        setError(t('dashboard.productForm.validationComparePrice'));
        return;
      }
      if (compareNum <= numPrice) {
        setError(t('dashboard.productForm.validationSaleOriginal'));
        return;
      }
    }
    const finalImages = displayImages.length > 0 ? displayImages : (image ? [image] : []);
    const finalIds = displayPublicIds.length > 0 ? displayPublicIds : (imagePublicId ? [imagePublicId] : []);
    if (!product && finalImages.length === 0) {
      setError(t('dashboard.productForm.validationImage'));
      return;
    }
    const finalOptions = normalizeOptionsForSave(formOptions.en);
    const finalOptionsEs = buildLocalizedOptionsForSave(
      finalOptions,
      alignedTranslationsForNormalizedEn(formOptions.en, formOptions.es),
    );
    const finalOptionsAr = buildLocalizedOptionsForSave(
      finalOptions,
      alignedTranslationsForNormalizedEn(formOptions.en, formOptions.ar),
    );
    setSaving(true);
    try {
      const compareNum =
        onSale && compareAtPrice.trim() !== '' ? parseFloat(compareAtPrice) : null;
      const stockNum = stockQuantity.trim() === '' ? null : parseInt(stockQuantity, 10);
      if (stockQuantity.trim() && (isNaN(stockNum!) || stockNum! < 0)) {
        setError(t('dashboard.productForm.validationStock'));
        setSaving(false);
        return;
      }
      const payload: ProductFormSavePayload = {
        name: formNames.en.trim(),
        nameEs: formNames.es.trim() || undefined,
        nameAr: formNames.ar.trim() || undefined,
        description: formDescriptions.en.trim(),
        descriptionEs: formDescriptions.es.trim() || undefined,
        descriptionAr: formDescriptions.ar.trim() || undefined,
        price: numPrice,
        compareAtPrice: compareNum,
        stockQuantity: stockNum,
        isVisible,
        image: finalImages[0] ?? undefined,
        imagePublicId: finalIds[0] ?? undefined,
        images: finalImages,
        imagePublicIds: finalIds,
        options: finalOptions,
        optionsEs: finalOptionsEs,
        optionsAr: finalOptionsAr,
        allowCustomerMessage,
        customerMessageLabel: allowCustomerMessage
          ? (customerMessageLabels.en.trim() || t('dashboard.products.defaultMessageLabel'))
          : null,
        customerMessageLabelEs: allowCustomerMessage
          ? (customerMessageLabels.es.trim() || undefined)
          : undefined,
        customerMessageLabelAr: allowCustomerMessage
          ? (customerMessageLabels.ar.trim() || undefined)
          : undefined,
        category: showCategory && category.trim() ? category.trim() : undefined,
        isFeatured,
      };
      if (onSavePayload) {
        await onSavePayload(payload);
      } else if (product?.id) {
        await api('/api/products', { method: 'PATCH', body: { id: product.id, ...payload } });
      } else {
        await api('/api/products', { method: 'POST', body: payload });
      }
      await onSaved();
      toast.success(t('dashboard.productForm.toastSaved'));
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const previewPrice = parseFloat(price) || 0;
  const previewCompare =
    onSale && compareAtPrice.trim() !== ''
      ? (() => {
          const n = parseFloat(compareAtPrice);
          return !isNaN(n) && n > previewPrice ? n : null;
        })()
      : null;
  const activeFormLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const sharedLocked = isSharedFieldLocked(multilingualEnabled, formLang);
  const displayOptions = mergeProductOptionsForDisplay(formOptions.en, formLang, formOptions);
  const structureOptionCount = formOptions.en.length;
  const previewOptions = displayOptions.filter((o) => o.name.trim() && o.choices.some((c) => c.trim()));
  const previewName = formNames[formLang].trim() || formNames.en.trim();
  const previewDescription = formDescriptions[formLang].trim() || formDescriptions.en.trim();
  const formLangFilled = {
    en: Boolean(formNames.en.trim()),
    es: Boolean(formNames.es.trim()),
    ar: Boolean(formNames.ar.trim()),
  };
  const safePreviewImageIndex =
    displayImages.length === 0 ? 0 : Math.min(Math.max(0, previewImageIndex), displayImages.length - 1);
  const previewActiveImageUrl = displayImages.length > 0 ? (displayImages[safePreviewImageIndex] ?? null) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex max-lg:items-end lg:items-center justify-center p-0 max-lg:p-0 lg:p-4 bg-black/50 backdrop-blur-sm"
    >
      <div
        className="bg-white dark:bg-zinc-900 w-full max-w-5xl flex flex-col min-h-0 h-[min(96vh,100dvh)] max-h-[min(96vh,100dvh)] max-lg:max-h-[min(96vh,100dvh)] max-lg:h-[min(96vh,100dvh)] lg:max-h-[90vh] lg:h-auto overflow-hidden rounded-t-2xl max-lg:rounded-b-none lg:rounded-2xl shadow-2xl border border-stone-200/80 dark:border-zinc-600/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0 border-b border-stone-100 dark:border-zinc-800 bg-gradient-to-r from-stone-50/80 to-white dark:from-zinc-900 dark:to-zinc-900 px-4 py-3 sm:px-6 sm:py-5">
          <h2 className="text-base sm:text-xl font-bold text-stone-900 dark:text-zinc-100 min-w-0 pr-2">
            {title ?? (product ? t('dashboard.productForm.editTitle') : t('dashboard.productForm.addTitle'))}
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                showPreview
                  ? 'border-2 border-brand-300 bg-brand-100 text-brand-900 dark:border-brand-700/60 dark:bg-brand-950/60 dark:text-brand-100'
                  : 'border-2 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Eye className="w-4 h-4 shrink-0" />{' '}
              <span className="truncate">
                {showPreview
                  ? btn('dashboard.productForm.hidePreview', 'Hide Preview')
                  : btn('dashboard.productForm.showPreview', 'Show Preview')}
              </span>
            </button>
            <button
            type="button"
            onClick={onClose}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9 sm:h-10 sm:w-10`}
            aria-label={t('dashboard.common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-0 flex-1 overflow-hidden">
            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 px-4 py-3 text-red-700 dark:text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-w-0">
              {multilingualEnabled ? (
                <MultilingualTextSection
                  className="sm:col-span-2"
                  label={t('dashboard.productForm.langLabel')}
                  hint={t('dashboard.productForm.langHint')}
                  value={formLang}
                  onChange={setFormLang}
                  filled={formLangFilled}
                  languages={contentLanguages}
                >
                  <div>
                    <FieldLabelWithHelp
                      required={isContentFieldRequired(multilingualEnabled, formLang)}
                      htmlFor="product-form-name"
                    >
                      {`${t('dashboard.productForm.name')} (${activeFormLang.label})`}
                    </FieldLabelWithHelp>
                    <input
                      id="product-form-name"
                      value={formNames[formLang]}
                      onChange={(e) => setFormNames((prev) => ({ ...prev, [formLang]: e.target.value }))}
                      required={isContentFieldRequired(multilingualEnabled, formLang)}
                      dir={activeFormLang.dir}
                      placeholder={t('dashboard.productForm.name')}
                      className={DASHBOARD_INPUT}
                    />
                  </div>
                  <div>
                    <FieldLabelWithHelp htmlFor="product-form-description">
                      {`${t('dashboard.productForm.description')} (${activeFormLang.label})`}
                    </FieldLabelWithHelp>
                    <textarea
                      id="product-form-description"
                      value={formDescriptions[formLang]}
                      onChange={(e) => setFormDescriptions((prev) => ({ ...prev, [formLang]: e.target.value }))}
                      dir={activeFormLang.dir}
                      placeholder={t('dashboard.productForm.description')}
                      rows={3}
                      className={`${DASHBOARD_INPUT} min-h-[96px] resize-y`}
                    />
                  </div>
                </MultilingualTextSection>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <FieldLabelWithHelp required htmlFor="product-form-name">
                      {t('dashboard.productForm.name')}
                    </FieldLabelWithHelp>
                    <input
                      id="product-form-name"
                      value={formNames.en}
                      onChange={(e) => setFormNames((prev) => ({ ...prev, en: e.target.value }))}
                      required
                      placeholder={t('dashboard.productForm.name')}
                      className={DASHBOARD_INPUT}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabelWithHelp htmlFor="product-form-description">
                      {t('dashboard.productForm.description')}
                    </FieldLabelWithHelp>
                    <textarea
                      id="product-form-description"
                      value={formDescriptions.en}
                      onChange={(e) => setFormDescriptions((prev) => ({ ...prev, en: e.target.value }))}
                      placeholder={t('dashboard.productForm.description')}
                      rows={3}
                      className={`${DASHBOARD_INPUT} min-h-[96px] resize-y`}
                    />
                  </div>
                </>
              )}

              <SharedLockedField locked={sharedLocked} className="sm:col-span-2 space-y-4 sm:space-y-6 sm:grid sm:grid-cols-2 sm:gap-4 sm:gap-6">
              <div className={`${DASHBOARD_TOGGLE_ROW} sm:col-span-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/50 p-3 sm:p-4`}>
                <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                  <FieldTitleWithHelp
                    title={t('dashboard.productForm.onSale')}
                    help={t('dashboard.productForm.onSaleHint')}
                  />
                </div>
                <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                  <DashboardSwitch
                    checked={onSale}
                    disabled={sharedLocked}
                    onCheckedChange={(next) => {
                      setOnSale(next);
                      if (!next) setCompareAtPrice('');
                    }}
                  />
                </div>
              </div>
              {onSale ? (
                <>
                  <div>
                    <FieldLabelWithHelp required={isSharedFieldRequired(multilingualEnabled, formLang)} help={t('dashboard.productForm.originalPriceHint')}>
                      {t('dashboard.productForm.originalPrice', { symbol: currencySymbol })}
                    </FieldLabelWithHelp>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={compareAtPrice}
                      readOnly={sharedLocked}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      required={isSharedFieldRequired(multilingualEnabled, formLang)}
                      placeholder="19.99"
                      className={sharedLockedInputClass(sharedLocked, DASHBOARD_NUMBER_INPUT)}
                    />
                  </div>
                  <div>
                    <FieldLabelWithHelp required={isSharedFieldRequired(multilingualEnabled, formLang)} help={t('dashboard.productForm.salePriceHint')}>
                      {t('dashboard.productForm.salePrice', { symbol: currencySymbol })}
                    </FieldLabelWithHelp>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      readOnly={sharedLocked}
                      onChange={(e) => setPrice(e.target.value)}
                      required={isSharedFieldRequired(multilingualEnabled, formLang)}
                      placeholder="19.99"
                      className={sharedLockedInputClass(sharedLocked, DASHBOARD_NUMBER_INPUT)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabelWithHelp help={t('dashboard.productForm.stockHint')}>
                      {t('dashboard.productForm.stockQuantity')}
                    </FieldLabelWithHelp>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={stockQuantity}
                      readOnly={sharedLocked}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder={t('dashboard.productForm.stockPh')}
                      className={sharedLockedInputClass(sharedLocked, DASHBOARD_NUMBER_INPUT)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <FieldLabelWithHelp required={isSharedFieldRequired(multilingualEnabled, formLang)} help={t('dashboard.productForm.priceHint')}>
                      {t('dashboard.productForm.price', { symbol: currencySymbol })}
                    </FieldLabelWithHelp>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      readOnly={sharedLocked}
                      onChange={(e) => setPrice(e.target.value)}
                      required={isSharedFieldRequired(multilingualEnabled, formLang)}
                      placeholder="19.99"
                      className={sharedLockedInputClass(sharedLocked, DASHBOARD_NUMBER_INPUT)}
                    />
                  </div>
                  <div>
                    <FieldLabelWithHelp help={t('dashboard.productForm.stockHint')}>
                      {t('dashboard.productForm.stockQuantity')}
                    </FieldLabelWithHelp>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={stockQuantity}
                      readOnly={sharedLocked}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder={t('dashboard.productForm.stockPh')}
                      className={sharedLockedInputClass(sharedLocked, DASHBOARD_NUMBER_INPUT)}
                    />
                  </div>
                </>
              )}
              <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/50 p-4">
                  <FieldTitleWithHelp
                    title={t('dashboard.productForm.visibleOnStore')}
                    help={t('dashboard.productForm.visibleHint')}
                  />
                  <DashboardSwitch checked={isVisible} disabled={sharedLocked} onCheckedChange={setVisibleToggleConfirm} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4">
                  <FieldTitleWithHelp
                    title={t('dashboard.productForm.featuredOnHome')}
                    help={t('dashboard.productForm.featuredHint')}
                  />
                  <DashboardSwitch checked={isFeatured} disabled={sharedLocked} onCheckedChange={setFeaturedToggleConfirm} />
                </div>
              </div>
              {showCategory && (
                <div className="sm:col-span-2">
                  <FieldLabelWithHelp help={t('dashboard.productForm.categoryHint')} className="mb-2">
                    {t('dashboard.productForm.category')}
                  </FieldLabelWithHelp>
                  <SharedLockedField locked={sharedLocked}>
                  <div ref={categoryDropdownRef} className="relative z-[110]">
                    <button
                      type="button"
                      disabled={sharedLocked}
                      onClick={() => setCategoryDropdownOpen((o) => !o)}
                      className="w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/60 text-stone-900 dark:text-zinc-100 font-medium hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                    >
                      <span className="truncate text-left">{categoryLabel}</span>
                      <ChevronDown className={`w-4 h-4 text-stone-500 dark:text-zinc-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {categoryDropdownOpen ? (
                      <div className="absolute left-0 top-full mt-1 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl z-[130] py-1 max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setCategory('');
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${category === '' ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'}`}
                        >
                          {t('dashboard.productForm.noCategory')}
                        </button>
                        {categories!.map((c) => (
                          <button
                            key={c.slug}
                            type="button"
                            onClick={() => {
                              setCategory(c.slug);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${category === c.slug ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'}`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  </SharedLockedField>
                </div>
              )}
              </SharedLockedField>
            </div>

            <div className="space-y-4">
              <FieldTitleWithHelp
                title={t('dashboard.productForm.optionsTitle')}
                help={t('dashboard.productForm.optionsHint')}
                titleClassName="font-bold text-stone-800 dark:text-zinc-200 text-base"
              />

              {catalogProducts.length > 0 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/50 p-4">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-xs font-semibold text-stone-600 dark:text-zinc-400">
                      {t('dashboard.productForm.copyChoicesFrom')}
                    </label>
                    <DashboardSearchSelect
                      value={copyFromProductId}
                      onChange={setCopyFromProductId}
                      options={catalogProducts.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                      placeholder={t('dashboard.productForm.copyChoicesFromPlaceholder')}
                      noResultsLabel={t('dashboard.productForm.copyChoicesNoResults')}
                      className="min-w-0 w-full"
                      aria-label={t('dashboard.productForm.copyChoicesFrom')}
                      disabled={sharedLocked}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => copyOptionsFromProduct()}
                    disabled={!copyFromProductId || sharedLocked}
                    className={`${DASHBOARD_BTN_OUTLINE} w-full sm:w-auto shrink-0 justify-center`}
                  >
                    {t('dashboard.productForm.copyChoicesApply')}
                  </button>
                </div>
              )}

              {structureOptionCount === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 p-8 text-center">
                  <Layers className="mx-auto mb-3 h-10 w-10 text-stone-300 dark:text-zinc-600" aria-hidden />
                  <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-md mx-auto">{t('dashboard.productForm.noOptions')}</p>
                  <button
                    type="button"
                    onClick={addOption}
                    disabled={sharedLocked}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/35 px-5 py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100 hover:border-brand-300 dark:hover:bg-brand-900/55 dark:hover:border-brand-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden />
                    {btn('dashboard.productForm.addFirstOption', 'Add your first option')}
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  <ol className="mb-8 list-none space-y-5 p-0 m-0">
                    {displayOptions.map((opt, oi) => {
                      const structureOpt = formOptions.en[oi];
                      const mods = structureOpt?.choicePriceModifiers ?? structureOpt?.choices.map(() => 0) ?? [];
                      return (
                      <li
                        key={oi}
                        className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      >
                        <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 dark:border-zinc-800 px-4 py-3">
                          <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                            {t('dashboard.productForm.optionLabel', { n: oi + 1 })}
                            {multilingualEnabled ? (
                              <span className="normal-case font-medium text-stone-400 dark:text-zinc-500">
                                {' '}
                                ({activeFormLang.label})
                              </span>
                            ) : null}
                          </span>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOptionName(oi, e.target.value)}
                            placeholder={t('dashboard.productForm.optionNamePh')}
                            dir={activeFormLang.dir}
                            className="min-w-[10rem] flex-1 px-4 py-2 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:border-brand-500 text-sm font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(oi)}
                            disabled={sharedLocked}
                            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/35 disabled:opacity-40 disabled:pointer-events-none"
                            aria-label={t('dashboard.productForm.ariaRemoveOption')}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </div>

                        <div className="space-y-4 p-4">
                          <DashboardCheckbox
                            checked={Boolean(structureOpt?.required)}
                            disabled={sharedLocked}
                            onChange={(next) => setOptionRequired(oi, next)}
                            label={t('dashboard.productForm.requiredChoice')}
                          />

                          <div className="space-y-2 border-t border-stone-100 dark:border-zinc-800 pt-4">
                            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.25rem] gap-2 items-center">
                              <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-400 dark:text-zinc-500">
                                {t('dashboard.productForm.choices')}
                              </span>
                              <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-400 dark:text-zinc-500">
                                {t('dashboard.productForm.extraPrice')}
                              </span>
                              <span className="sr-only">{t('dashboard.common.delete')}</span>
                            </div>
                            {opt.choices.map((choice, ci) => (
                              <div
                                key={ci}
                                className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.25rem] gap-2 items-center"
                              >
                                <input
                                  type="text"
                                  value={choice}
                                  onChange={(e) => updateChoice(oi, ci, e.target.value)}
                                  placeholder={t('dashboard.productForm.choiceN', { n: ci + 1 })}
                                  dir={activeFormLang.dir}
                                  className="min-w-0 w-full px-3 py-2 rounded-lg border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-950/50 text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:border-brand-500 text-sm"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  readOnly={sharedLocked}
                                  value={
                                    ((mods ?? [])[ci] ?? 0) === 0
                                      ? ''
                                      : (mods ?? [])[ci]
                                  }
                                  onChange={(e) =>
                                    updateChoiceModifier(oi, ci, e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="+0"
                                  title={t('dashboard.productForm.choiceExtraTitle')}
                                  className={sharedLockedInputClass(sharedLocked, `${DASHBOARD_NUMBER_INPUT} text-sm min-w-0 !py-2 !px-2`)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeChoice(oi, ci)}
                                  disabled={sharedLocked || (structureOpt?.choices.length ?? 1) <= 1}
                                  className={`${DASHBOARD_ICON_REMOVE_INLINE_BTN} justify-self-end h-8 w-8 disabled:opacity-30 disabled:pointer-events-none`}
                                  aria-label={t('dashboard.contact.ariaRemove')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addChoice(oi)}
                              disabled={sharedLocked}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-stone-300 dark:border-zinc-600 py-2.5 text-sm font-medium text-stone-600 dark:text-zinc-400 hover:border-stone-400 hover:bg-stone-50 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4 shrink-0" aria-hidden />
                              {btn('dashboard.productForm.addChoice', 'Add Choice')}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                    })}
                  </ol>

                  <div className="mt-2 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-900/30 p-5 text-center">
                    <button
                      type="button"
                      onClick={addOption}
                      disabled={sharedLocked}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/35 px-5 py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100 hover:border-brand-300 dark:hover:bg-brand-900/55 dark:hover:border-brand-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4 shrink-0" aria-hidden />
                      {btn('dashboard.productForm.addOption', 'Add Option')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <SharedLockedField locked={sharedLocked} className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/50 p-3 sm:p-4 min-w-0">
            <div className="rounded-xl min-w-0">
              <DashboardCheckbox
                checked={allowCustomerMessage}
                disabled={sharedLocked}
                onChange={setAllowCustomerMessage}
                label={<span className="font-semibold text-stone-800 dark:text-zinc-200">{t('dashboard.productForm.customerMessage')}</span>}
              />
              {allowCustomerMessage && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-1">
                    {multilingualEnabled
                      ? `${t('dashboard.productForm.messageLabel')} (${activeFormLang.label})`
                      : t('dashboard.productForm.messageLabel')}
                  </label>
                  <input
                    type="text"
                    value={customerMessageLabels[multilingualEnabled ? formLang : 'en']}
                    onChange={(e) =>
                      setCustomerMessageLabels((prev) => ({
                        ...prev,
                        [multilingualEnabled ? formLang : 'en']: e.target.value,
                      }))
                    }
                    dir={multilingualEnabled ? activeFormLang.dir : undefined}
                    placeholder={t('dashboard.productForm.messageLabelPh')}
                    className={DASHBOARD_INPUT}
                  />
                </div>
              )}
            </div>
            </SharedLockedField>

            <div>
              <FieldLabelWithHelp required={isSharedFieldRequired(multilingualEnabled, formLang)} help={t('dashboard.productForm.imagesHint')} className="mb-3">
                {t('dashboard.productForm.imagesTitle')}
              </FieldLabelWithHelp>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={uploading || (maxImages !== undefined && displayImages.length >= maxImages)}
                className="hidden"
              />
              <SharedLockedField locked={sharedLocked}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sharedLocked || (maxImages !== undefined && displayImages.length >= maxImages)}
                className="w-full flex items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/50 text-stone-600 dark:text-zinc-400 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-300 transition-all disabled:opacity-60 font-medium"
              >
                {uploading ? (
                  <>
                    <AdminLoadingInline dotsOnly />
                    <span className="text-sm">{btn('dashboard.common.uploading', 'Uploading...')}</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5" />
                    <span>{btn('dashboard.productForm.addImages', 'Add Images')}</span>
                  </>
                )}
              </button>
              </SharedLockedField>
              {maxImages !== undefined && (
                <p className={`mt-2 text-xs ${displayImages.length >= maxImages ? 'text-red-500 dark:text-red-400 font-medium' : 'text-stone-500 dark:text-zinc-500'}`}>
                  {displayImages.length >= maxImages
                    ? t('dashboard.productForm.imagesLimitBody', { max: maxImages })
                    : t('dashboard.productForm.imagesLimitUsage', { count: displayImages.length, max: maxImages })}
                </p>
              )}
              {displayImages.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {displayImages.map((url, i) => (
                    <div key={i} className="relative w-24 shrink-0">
                      <div
                        className={`${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} rounded-xl border-2 border-stone-200 shadow-sm dark:border-zinc-700`}
                      >
                        <img src={getProductImageDisplayUrl(url)} alt="" className={`${PRODUCT_IMAGE_CLASS} rounded-[10px]`} />
                        {i === 0 && (
                          <span
                            className="absolute bottom-1 left-1 z-10 px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-semibold"
                            title={t('dashboard.productForm.imagesHint')}
                          >
                            1
                          </span>
                        )}
                      </div>
                      <DashboardImageRemoveButton
                        onClick={() => removeImage(i)}
                        disabled={sharedLocked}
                        className="z-20"
                        aria-label={t('dashboard.categories.ariaRemoveImage')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

            {showPreview && (
            <div className="w-full lg:w-80 xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 p-4 sm:p-5 overflow-y-auto max-h-[40vh] lg:max-h-none min-h-0">
              <div className="flex items-center gap-2 mb-4 text-stone-600 dark:text-zinc-400">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-semibold">{t('dashboard.productForm.previewTitle')}</span>
              </div>
              <div className="rounded-2xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                {previewActiveImageUrl ? (
                  <ProductImage src={previewActiveImageUrl} alt="" />
                ) : (
                  <div className={`${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} flex items-center justify-center`}>
                    <Package className="w-12 h-12 text-stone-400 dark:text-zinc-500" />
                  </div>
                )}
                {displayImages.length > 1 && (
                  <div className="flex gap-2 p-2 overflow-x-auto border-t border-stone-100 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-800/90">
                    {displayImages.map((url, idx) => (
                      <button
                        key={`${url}-${idx}`}
                        type="button"
                        onClick={() => setPreviewImageIndex(idx)}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 dark:bg-zinc-900 dark:focus:ring-offset-zinc-900 ${
                          idx === safePreviewImageIndex ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200 dark:border-zinc-600 hover:border-brand-300 dark:hover:border-brand-500/50'
                        }`}
                        aria-label={`${t('dashboard.productForm.previewTitle')} ${idx + 1}`}
                      >
                        <img src={getProductImageDisplayUrl(url)} alt="" className={PRODUCT_IMAGE_CLASS} />
                      </button>
                    ))}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-stone-900 dark:text-zinc-100 text-lg truncate">{previewName || t('dashboard.productForm.name')}</h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                      {formatPrice(previewPrice, currencyCode)}
                    </p>
                    {previewCompare != null && (
                      <p className="text-sm text-stone-400 line-through">{formatPrice(previewCompare, currencyCode)}</p>
                    )}
                  </div>
                  {previewDescription && <p className="text-stone-600 dark:text-zinc-400 text-sm mt-2 line-clamp-2">{previewDescription}</p>}
                  {previewOptions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {previewOptions.map((o) => (
                        <div key={o.name}>
                          <p className="text-xs font-semibold text-stone-500 dark:text-zinc-400 mb-1">{o.name}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {o.choices.filter(Boolean).map((c) => (
                              <span key={c} className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-xs font-medium">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {allowCustomerMessage && (
                    <p className="mt-3 text-xs text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />{' '}
                      {customerMessageLabels[formLang].trim() ||
                        customerMessageLabels.en.trim() ||
                        t('dashboard.products.defaultMessageLabel')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>

          <div className="relative z-20 px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/30 dark:bg-zinc-950/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 sm:py-3 px-6 rounded-xl text-sm font-medium border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-center"
            >
              {btn('dashboard.common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex w-full sm:flex-1 items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 disabled:opacity-60 transition-all"
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : null}
              {saving
                ? btn('dashboard.productForm.saving', 'Saving...')
                : btn('dashboard.productForm.saveProduct', 'Save Product')}
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={visibleToggleConfirm !== null}
        title={
          visibleToggleConfirm
            ? t('dashboard.productForm.enableVisibleTitle')
            : t('dashboard.productForm.disableVisibleTitle')
        }
        message={
          visibleToggleConfirm
            ? t('dashboard.productForm.enableVisibleMsg')
            : t('dashboard.productForm.disableVisibleMsg')
        }
        confirmLabel={visibleToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (visibleToggleConfirm !== null) {
            setIsVisible(visibleToggleConfirm);
            setVisibleToggleConfirm(null);
          }
        }}
        onCancel={() => setVisibleToggleConfirm(null)}
      />
      <ConfirmDialog
        open={featuredToggleConfirm !== null}
        title={
          featuredToggleConfirm
            ? t('dashboard.productForm.enableFeaturedTitle')
            : t('dashboard.productForm.disableFeaturedTitle')
        }
        message={
          featuredToggleConfirm
            ? t('dashboard.productForm.enableFeaturedMsg')
            : t('dashboard.productForm.disableFeaturedMsg')
        }
        confirmLabel={featuredToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (featuredToggleConfirm !== null) {
            setIsFeatured(featuredToggleConfirm);
            setFeaturedToggleConfirm(null);
          }
        }}
        onCancel={() => setFeaturedToggleConfirm(null)}
      />
    </div>
  );
}
