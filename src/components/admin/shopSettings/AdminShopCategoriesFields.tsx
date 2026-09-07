import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LayoutGrid, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import type { AdminSellerShopFields } from '../../../types/admin';
import { getStoredToken } from '../../../context/AuthContext';
import ImageCropModal from '../../ImageCropModal';
import { AdminLoadingInline } from '../AdminLoading';
import { DASHBOARD_BTN_PRIMARY, DASHBOARD_INPUT } from '../../../lib/dashboardFormClasses';
import { CATEGORY_CARD_ASPECT_CLASS, CATEGORY_CARD_VIEWPORT } from '../../../lib/imageCropViewports';
import { getProductImageDisplayUrl } from '../../../lib/productImageUrl';
import { ADMIN_FIELD_LABEL, SHOP_SETTINGS_CARD_PAD, ShopSettingsStack } from './shopSettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function slugFromName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'category'
  );
}

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
};

export default function AdminShopCategoriesFields({ form, set }: Props) {
  const { t } = useTranslation();
  const [cropOpen, setCropOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropIndex, setCropIndex] = useState<number | 'new' | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!form.categoriesEnabled) return null;

  function pickImage(index: number | 'new', file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error(t('dashboard.home.cropImageOnly'));
      return;
    }
    setCropIndex(index);
    setCropFile(file);
    setCropOpen(true);
  }

  async function uploadCategoryBlob(blob: Blob) {
    const token = getStoredToken();
    if (!token || cropIndex === null) return;
    setCropOpen(false);
    setCropFile(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', blob, 'category.jpg');
      body.append('type', 'product');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
      if (cropIndex === 'new') {
        set('categories', [...form.categories, { name: '', slug: '', image: data.url }]);
      } else {
        const next = [...form.categories];
        next[cropIndex] = { ...next[cropIndex], image: data.url };
        set('categories', next);
      }
      toast.success(t('dashboard.categories.toastUpload'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dashboard.productForm.toastUploadFail'));
    } finally {
      setUploading(false);
      setCropIndex(null);
    }
  }

  return (
    <ShopSettingsStack>
      {form.categories.length === 0 ? (
        <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-8 max-lg:p-8 lg:p-16 text-center overflow-hidden relative min-w-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-500/5 pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/25">
              <LayoutGrid className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2">{t('dashboard.categories.emptyTitle')}</h2>
            <p className="text-stone-600 dark:text-zinc-400 mb-8 max-w-sm mx-auto text-sm">{t('dashboard.categories.emptyBody')}</p>
            <label className={`${DASHBOARD_BTN_PRIMARY} inline-flex cursor-pointer`}>
              <Plus className="w-5 h-5 shrink-0" />
              {t('dashboard.categories.addCategory')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) pickImage('new', file);
                }}
              />
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5 min-w-0 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
              {t('dashboard.categories.yourCategories')}
            </p>
            <label className={`${DASHBOARD_BTN_PRIMARY} inline-flex w-full sm:w-auto cursor-pointer justify-center max-lg:py-2.5 max-lg:text-sm`}>
              <Plus className="h-4 w-4 shrink-0" />
              {t('dashboard.categories.addCategory')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) pickImage('new', file);
                }}
              />
            </label>
          </div>
          <ul className="grid gap-4 max-lg:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 min-w-0 w-full">
            {form.categories.map((c, i) => (
              <li
                key={`${c.slug}-${i}`}
                className="min-w-0 rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-lg shadow-stone-200/20 flex flex-col h-full"
              >
                <div className={`${CATEGORY_CARD_ASPECT_CLASS} relative overflow-hidden bg-stone-100 dark:bg-zinc-800`}>
                  {c.image ? (
                    <img
                      src={getProductImageDisplayUrl(c.image)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-zinc-500">
                      <Upload className="w-14 h-14" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                    <p className="text-white font-semibold text-base line-clamp-1">{c.name || t('dashboard.categories.modalAdd')}</p>
                  </div>
                </div>
                <div className="p-4 max-lg:p-4 lg:p-5 flex flex-col gap-3 min-w-0 mt-auto">
                  <div>
                    <label className={ADMIN_FIELD_LABEL}>
                      {t('dashboard.categories.nameLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={c.name}
                      onChange={(e) => {
                        const next = [...form.categories];
                        next[i] = { ...next[i], name: e.target.value, slug: slugFromName(e.target.value) };
                        set('categories', next);
                      }}
                      placeholder={t('dashboard.categories.namePh')}
                      className={`${DASHBOARD_INPUT} text-sm`}
                    />
                  </div>
                  <div className="flex min-w-0 gap-1.5 sm:gap-2">
                    <label className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-stone-200 bg-white px-2 py-2 text-xs font-medium text-stone-700 transition-all hover:border-brand-200 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40 sm:gap-1.5 lg:rounded-xl lg:px-4 lg:py-2.5 lg:text-sm">
                      <Pencil className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate">{c.image ? t('dashboard.about.replaceImage') : t('dashboard.about.addImage')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) pickImage(i, file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => set('categories', form.categories.filter((_, j) => j !== i))}
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border-2 border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50 sm:gap-1.5 lg:rounded-xl lg:px-4 lg:py-2.5 lg:text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate">{t('dashboard.common.delete')}</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ImageCropModal
        open={cropOpen}
        imageFile={cropFile}
        viewport={CATEGORY_CARD_VIEWPORT}
        onClose={() => {
          setCropOpen(false);
          setCropFile(null);
          setCropIndex(null);
        }}
        onConfirm={uploadCategoryBlob}
      />
      {uploading ? (
        <div className="flex justify-center py-2">
          <AdminLoadingInline dotsOnly />
        </div>
      ) : null}
    </ShopSettingsStack>
  );
}
