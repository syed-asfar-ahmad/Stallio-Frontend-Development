import { useRef, useState } from 'react';
import ContentLanguagePicker from '../../ContentLanguagePicker';
import { SHOP_CONTENT_LANGUAGES, type ShopContentLang } from '../../../lib/shopContentLanguages';
import { useAdminShopContentLanguages, useAdminShopMultilingualEnabled } from '../../../hooks/useAdminShopContentLanguages';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';
import type { AdminSellerShopFields } from '../../../types/admin';
import { getStoredToken } from '../../../context/AuthContext';
import RichTextEditor from '../../RichTextEditor';
import AboutHeroImageCropModal from '../../AboutHeroImageCropModal';
import { AdminLoadingInline } from '../AdminLoading';
import {
  DASHBOARD_INPUT,
} from '../../../lib/dashboardFormClasses';
import { ABOUT_HERO_ASPECT_CLASS, ABOUT_HERO_VIEWPORT } from '../../../lib/imageCropViewports';
import DashboardImageRemoveButton from '../../DashboardImageRemoveButton';
import { ADMIN_FIELD_LABEL, SHOP_SETTINGS_CARD_PAD, ShopSettingsStack } from './shopSettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const DEFAULT_ABOUT_TEXT_COLOR = '#ffffff';
const HEX_COLOR_RE = /^#([0-9A-Fa-f]{6})$/;

function sanitizeAboutTextColor(value: string): string {
  const trimmed = value.trim();
  return HEX_COLOR_RE.test(trimmed) ? trimmed : DEFAULT_ABOUT_TEXT_COLOR;
}

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
};

function aboutTitleValue(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.aboutTitleEs ?? '';
  if (lang === 'ar') return form.aboutTitleAr ?? '';
  return form.aboutTitle;
}

function aboutContentValue(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.aboutContentEs ?? '';
  if (lang === 'ar') return form.aboutContentAr ?? '';
  return form.aboutContent;
}

export default function AdminShopAboutFields({ form, set }: Props) {
  const { t } = useTranslation();
  const contentLanguages = useAdminShopContentLanguages(form);
  const multilingualEnabled = useAdminShopMultilingualEnabled(form);
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const activeLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  if (!form.aboutEnabled) return null;

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('dashboard.home.cropImageOnly'));
      return;
    }
    setCropFile(file);
    setCropOpen(true);
  }

  async function uploadAboutHeroBlob(blob: Blob) {
    const token = getStoredToken();
    if (!token) return;
    setCropOpen(false);
    setCropFile(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', blob, 'about-hero.jpg');
      body.append('type', 'product');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
      if (data.url) set('aboutImages', [data.url]);
      toast.success(t('dashboard.about.toastImage'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dashboard.productForm.toastUploadFail'));
    } finally {
      setUploading(false);
    }
  }

  const hero = form.aboutImages[0] ?? null;

  return (
    <ShopSettingsStack>
      <div className={`rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm ${SHOP_SETTINGS_CARD_PAD} space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0`}>
        {multilingualEnabled ? (
          <ContentLanguagePicker
            label={t('dashboard.about.langLabel')}
            hint={t('dashboard.about.langHint')}
            value={formLang}
            onChange={setFormLang}
            filled={{
              en: Boolean(form.aboutTitle.trim() || form.aboutContent.trim()),
              es: Boolean((form.aboutTitleEs ?? '').trim() || (form.aboutContentEs ?? '').trim()),
              ar: Boolean((form.aboutTitleAr ?? '').trim() || (form.aboutContentAr ?? '').trim()),
            }}
            languages={contentLanguages}
          />
        ) : null}
        <div>
          <label htmlFor="admin-about-headline" className={ADMIN_FIELD_LABEL}>
            {multilingualEnabled
              ? `${t('dashboard.about.headline')} (${activeLang.label})`
              : t('dashboard.about.headline')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="admin-about-headline"
            type="text"
            dir={activeLang.dir}
            value={aboutTitleValue(form, formLang)}
            onChange={(e) => {
              const value = e.target.value;
              if (formLang === 'es') set('aboutTitleEs', value);
              else if (formLang === 'ar') set('aboutTitleAr', value);
              else set('aboutTitle', value);
            }}
            placeholder={t('dashboard.about.headlinePh')}
            className={`${DASHBOARD_INPUT} text-sm max-lg:text-sm lg:text-base`}
          />
        </div>
        <div>
          <label className={`${ADMIN_FIELD_LABEL} mb-2`}>
            {multilingualEnabled
              ? `${t('dashboard.about.story')} (${activeLang.label})`
              : t('dashboard.about.story')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="min-w-0 w-full max-w-full">
            <RichTextEditor
              value={aboutContentValue(form, formLang)}
              onChange={(value) => {
                if (formLang === 'es') set('aboutContentEs', value);
                else if (formLang === 'ar') set('aboutContentAr', value);
                else set('aboutContent', value);
              }}
              placeholder={t('dashboard.about.storyPh')}
              minHeight="10rem"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-lg:gap-4 lg:gap-6 items-start min-w-0">
          <div className="min-w-0 w-full">
            <label className={ADMIN_FIELD_LABEL}>
              {t('dashboard.about.heroImage')} <span className="text-red-500">*</span>
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} disabled={uploading} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/60 text-stone-600 dark:text-zinc-400 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-60"
            >
              <Upload className="w-4 h-4 shrink-0" />
              {uploading ? t('dashboard.common.uploading') : hero ? t('dashboard.about.replaceImage') : t('dashboard.about.addImage')}
            </button>
            {hero ? (
              <div className="mt-3 max-lg:mt-3 lg:mt-4 w-full min-w-0 overflow-visible">
                <div className={`relative z-10 w-full max-w-[12rem] sm:max-w-xs overflow-visible ${ABOUT_HERO_ASPECT_CLASS}`}>
                  <div className="absolute inset-0 overflow-hidden rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700">
                    <img src={hero} alt="" className="h-full w-full object-cover object-center" />
                  </div>
                  <DashboardImageRemoveButton
                    onClick={() => set('aboutImages', [])}
                    aria-label={t('dashboard.about.ariaRemove')}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div className="min-w-0 w-full">
            <label className={ADMIN_FIELD_LABEL}>{t('dashboard.about.heroColor')}</label>
            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
              <label
                className="relative w-9 h-9 shrink-0 rounded-lg border-2 border-stone-200 dark:border-zinc-700 overflow-hidden cursor-pointer hover:border-brand-300 transition-colors"
                aria-label={t('dashboard.about.heroColor')}
              >
                <span className="absolute inset-0" style={{ backgroundColor: sanitizeAboutTextColor(form.aboutTextColor) }} />
                <input
                  type="color"
                  value={sanitizeAboutTextColor(form.aboutTextColor)}
                  onChange={(e) => set('aboutTextColor', sanitizeAboutTextColor(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <input
                type="text"
                value={form.aboutTextColor}
                onChange={(e) => set('aboutTextColor', e.target.value)}
                placeholder={t('dashboard.about.colorPh')}
                className={`${DASHBOARD_INPUT} min-w-0 flex-1 sm:flex-none sm:w-32 !py-2.5 !rounded-lg text-sm`}
              />
            </div>
          </div>
        </div>
      </div>

      <AboutHeroImageCropModal
        open={cropOpen}
        imageFile={cropFile}
        onClose={() => {
          setCropOpen(false);
          setCropFile(null);
        }}
        onConfirm={uploadAboutHeroBlob}
      />
    </ShopSettingsStack>
  );
}
