import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { getStoredToken } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DashboardSwitch from '../components/DashboardSwitch';
import ConfirmDialog from '../components/ConfirmDialog';
import RichTextEditor from '../components/RichTextEditor';
import { FieldLabelWithHelp, FieldTitleWithHelp } from '../components/FieldLabelWithHelp';
import ContentLanguagePicker from '../components/ContentLanguagePicker';
import {
  SHOP_CONTENT_LANGUAGES,
  isContentFieldRequired,
  isSharedFieldLocked,
  isSharedFieldRequired,
  type ShopContentLang,
} from '../lib/shopContentLanguages';
import SharedLockedField, { sharedLockedInputClass } from '../components/SharedLockedField';
import { useSellerContentLanguages, useSellerMultilingualEnabled } from '../hooks/useSellerContentLanguages';
import { FileText, Save, Upload, X } from 'lucide-react';
import { AdminLoadingInline } from '../components/DashboardLoading';
import AboutHeroImageCropModal from '../components/AboutHeroImageCropModal';
import DashboardImageRemoveButton from '../components/DashboardImageRemoveButton';
import { ABOUT_HERO_ASPECT_CLASS, ABOUT_HERO_VIEWPORT } from '../lib/imageCropViewports';
import { normalizeShopRichTextHtml } from '../lib/prepareShopAboutHtml';
import {
  DASHBOARD_INPUT,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const DEFAULT_ABOUT_TEXT_COLOR = '#ffffff';
const HEX_COLOR_RE = /^#([0-9A-Fa-f]{6})$/;
const EMPTY_FORM_TEXT: Record<ShopContentLang, string> = { en: '', es: '', ar: '' };

function sanitizeAboutTextColor(value: string | null | undefined): string {
  const trimmed = String(value ?? '').trim();
  return HEX_COLOR_RE.test(trimmed) ? trimmed : DEFAULT_ABOUT_TEXT_COLOR;
}

export default function DashboardAbout() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth();
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [aboutEnabled, setAboutEnabled] = useState(false);
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const [formTitles, setFormTitles] = useState<Record<ShopContentLang, string>>(EMPTY_FORM_TEXT);
  const [formContents, setFormContents] = useState<Record<ShopContentLang, string>>(EMPTY_FORM_TEXT);
  const [aboutImages, setAboutImages] = useState<string[]>([]);
  const [aboutTextColor, setAboutTextColor] = useState(DEFAULT_ABOUT_TEXT_COLOR);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [toggleConfirm, setToggleConfirm] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setAboutEnabled(user.aboutEnabled ?? false);
      setFormTitles({
        en: String(user.aboutTitle ?? '').trim(),
        es: String(user.aboutTitleEs ?? '').trim(),
        ar: String(user.aboutTitleAr ?? '').trim(),
      });
      setFormContents({
        en: String(user.aboutContent ?? ''),
        es: String(user.aboutContentEs ?? ''),
        ar: String(user.aboutContentAr ?? ''),
      });
      setFormLang('en');
      setAboutImages(Array.isArray(user.aboutImages) ? user.aboutImages : []);
      setAboutTextColor(sanitizeAboutTextColor(user.aboutTextColor));
    }
  }, [user]);

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
    setError('');
    try {
      const form = new FormData();
      form.append('file', blob, 'about-hero.jpg');
      form.append('type', 'product');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
      if (data.url) setAboutImages([data.url]);
      toast.success(t('dashboard.about.toastImage'));
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setAboutImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (aboutEnabled) {
      const title = formTitles.en.trim();
      const content = formContents.en.trim();
      const hasImage = Array.isArray(aboutImages) && aboutImages.length > 0;
      if (!title) {
        setError(t('dashboard.about.errHeadline'));
        return;
      }
      if (!content) {
        setError(t('dashboard.about.errStory'));
        return;
      }
      if (!hasImage) {
        setError(t('dashboard.about.errHero'));
        return;
      }
    }
    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          aboutEnabled,
          aboutTitle: formTitles.en.trim(),
          aboutTitleEs: formTitles.es.trim() || undefined,
          aboutTitleAr: formTitles.ar.trim() || undefined,
          aboutContent: normalizeShopRichTextHtml(formContents.en),
          aboutContentEs: formContents.es.trim() ? normalizeShopRichTextHtml(formContents.es) : undefined,
          aboutContentAr: formContents.ar.trim() ? normalizeShopRichTextHtml(formContents.ar) : undefined,
          aboutImages: (Array.isArray(aboutImages) && aboutImages.length > 0) ? [aboutImages[0]] : [],
          aboutTextColor: sanitizeAboutTextColor(aboutTextColor),
        },
      });
      await fetchUser();
      toast.success(t('dashboard.about.toastSaved'));
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const activeFormLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const sharedLocked = isSharedFieldLocked(multilingualEnabled, formLang);
  const formLangFilled = {
    en: Boolean(formTitles.en.trim() || formContents.en.trim()),
    es: Boolean(formTitles.es.trim() || formContents.es.trim()),
    ar: Boolean(formTitles.ar.trim() || formContents.ar.trim()),
  };

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 mb-0.5 max-lg:mb-0.5 lg:mb-1">
          <FileText className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">{t('dashboard.about.section')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">{t('dashboard.about.title')}</h1>
        <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">
          {t('dashboard.about.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSave} className="w-full min-w-0 max-w-full space-y-4 max-lg:space-y-4 lg:space-y-6">
        {error && (
          <div className="rounded-lg max-lg:rounded-lg lg:rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 px-3 max-lg:px-3 lg:px-4 py-2.5 max-lg:py-2.5 lg:py-3 text-red-700 dark:text-red-300 text-xs max-lg:text-xs lg:text-sm font-medium break-words">
            {error}
          </div>
        )}

        <div className="min-w-0 w-full max-w-full rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-visible">
          <div className="p-4 max-lg:p-4 lg:p-6 border-b border-stone-100 dark:border-zinc-800">
            <div className={DASHBOARD_TOGGLE_ROW}>
              <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                <FieldTitleWithHelp
                  title={t('dashboard.about.toggleTitle')}
                  help={t('dashboard.about.toggleHint')}
                  titleClassName="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200"
                />
              </div>
              <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                <DashboardSwitch checked={aboutEnabled} onCheckedChange={(next) => setToggleConfirm(next)} />
              </div>
            </div>
          </div>

          {aboutEnabled && (
            <div className="p-4 max-lg:p-4 lg:p-6 space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0">
              {multilingualEnabled ? (
                <ContentLanguagePicker
                  label={t('dashboard.about.langLabel')}
                  hint={t('dashboard.about.langHint')}
                  value={formLang}
                  onChange={setFormLang}
                  filled={formLangFilled}
                  languages={contentLanguages}
                />
              ) : null}
              <div>
                <FieldLabelWithHelp
                  required={isContentFieldRequired(multilingualEnabled, formLang)}
                  htmlFor="about-form-headline"
                >
                  {multilingualEnabled
                    ? `${t('dashboard.about.headline')} (${activeFormLang.label})`
                    : t('dashboard.about.headline')}
                </FieldLabelWithHelp>
                <input
                  id="about-form-headline"
                  type="text"
                  dir={activeFormLang.dir}
                  value={formTitles[formLang]}
                  onChange={(e) => setFormTitles((prev) => ({ ...prev, [formLang]: e.target.value }))}
                  placeholder={t('dashboard.about.headlinePh')}
                  className={`${DASHBOARD_INPUT} min-w-0 text-sm max-lg:text-sm lg:text-base`}
                />
              </div>
              <div>
                <FieldLabelWithHelp required={isContentFieldRequired(multilingualEnabled, formLang)} className="mb-2">
                  {multilingualEnabled
                    ? `${t('dashboard.about.story')} (${activeFormLang.label})`
                    : t('dashboard.about.story')}
                </FieldLabelWithHelp>
                <div className="min-w-0 w-full max-w-full">
                  <RichTextEditor
                    value={formContents[formLang]}
                    onChange={(value) => setFormContents((prev) => ({ ...prev, [formLang]: value }))}
                    placeholder={t('dashboard.about.storyPh')}
                    minHeight="10rem"
                    dir={activeFormLang.dir ?? 'ltr'}
                  />
                </div>
              </div>
              <SharedLockedField
                locked={sharedLocked}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-lg:gap-4 lg:gap-6 items-start min-w-0"
              >
                <div className="min-w-0 w-full">
                  <div className="mb-2 max-lg:mb-2 lg:mb-3">
                    <FieldLabelWithHelp
                      required={isSharedFieldRequired(multilingualEnabled, formLang)}
                      help={t('dashboard.about.heroHelp', {
                        width: ABOUT_HERO_VIEWPORT.width,
                        height: ABOUT_HERO_VIEWPORT.height,
                      })}
                      labelClassName="font-semibold text-stone-800 dark:text-zinc-200 text-sm"
                    >
                      {t('dashboard.about.heroImage')}
                    </FieldLabelWithHelp>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    disabled={uploading}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || sharedLocked}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/30 dark:bg-zinc-950/60 text-stone-600 dark:text-zinc-400 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-60"
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    {uploading ? t('dashboard.common.uploading') : (aboutImages.length > 0 ? t('dashboard.about.replaceImage') : t('dashboard.about.addImage'))}
                  </button>
                  {(Array.isArray(aboutImages) ? aboutImages : []).length > 0 && (
                    <div className="mt-3 max-lg:mt-3 lg:mt-4 w-full min-w-0 overflow-visible">
                      <div
                        className={`relative z-10 w-full max-w-[12rem] sm:max-w-xs overflow-visible ${ABOUT_HERO_ASPECT_CLASS}`}
                      >
                        <div className="absolute inset-0 overflow-hidden rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700">
                          <img
                            src={(Array.isArray(aboutImages) ? aboutImages : [])[0]}
                            alt=""
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <DashboardImageRemoveButton
                          onClick={() => removeImage(0)}
                          disabled={sharedLocked}
                          aria-label={t('dashboard.about.ariaRemove')}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="min-w-0 w-full">
                  <FieldLabelWithHelp align="end" help={t('dashboard.about.heroColorHelp')} className="mb-2" labelClassName="text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200">
                    {t('dashboard.about.heroColor')}
                  </FieldLabelWithHelp>
                  <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                    <label
                      className={`relative w-9 h-9 shrink-0 rounded-lg border-2 border-stone-200 dark:border-zinc-700 overflow-hidden transition-colors ${sharedLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-brand-300'}`}
                      aria-label={t('dashboard.about.heroColor')}
                    >
                      <span className="absolute inset-0" style={{ backgroundColor: sanitizeAboutTextColor(aboutTextColor) }} />
                      <input
                        type="color"
                        disabled={sharedLocked}
                        value={sanitizeAboutTextColor(aboutTextColor)}
                        onChange={(e) => setAboutTextColor(sanitizeAboutTextColor(e.target.value))}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                    <input
                      type="text"
                      value={aboutTextColor}
                      readOnly={sharedLocked}
                      onChange={(e) => setAboutTextColor(e.target.value)}
                      placeholder={t('dashboard.about.colorPh')}
                      className={sharedLockedInputClass(sharedLocked, `${DASHBOARD_INPUT} min-w-0 flex-1 sm:flex-none sm:w-32 !py-2.5 !rounded-lg text-sm`)}
                    />
                  </div>
                </div>
              </SharedLockedField>
            </div>
          )}
        </div>

        {aboutEnabled && (
          <div className="flex justify-center min-w-0 px-0">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full max-lg:w-full lg:w-auto items-center justify-center gap-2 px-6 max-lg:px-6 lg:px-8 py-3 max-lg:py-3 lg:py-3.5 rounded-xl text-sm max-lg:text-sm lg:text-base font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-60"
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : <Save className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 shrink-0" aria-hidden />}
              {saving ? t('dashboard.common.saving') : t('dashboard.about.save')}
            </button>
          </div>
        )}
      </form>

      <AboutHeroImageCropModal
        open={cropOpen}
        imageFile={cropFile}
        onClose={() => {
          setCropOpen(false);
          setCropFile(null);
        }}
        onConfirm={uploadAboutHeroBlob}
      />

      <ConfirmDialog
        open={toggleConfirm !== null}
        title={toggleConfirm ? t('dashboard.about.enableTitle') : t('dashboard.about.disableTitle')}
        message={toggleConfirm ? t('dashboard.about.enableMsg') : t('dashboard.about.disableMsg')}
        confirmLabel={toggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (toggleConfirm !== null) {
            setAboutEnabled(toggleConfirm);
            toast.success(toggleConfirm ? t('dashboard.about.toastEnabled') : t('dashboard.about.toastDisabled'));
            setToggleConfirm(null);
          }
        }}
        onCancel={() => setToggleConfirm(null)}
      />
    </DashboardLayout>
  );
}
