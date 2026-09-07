import { useRef, useState } from 'react';
import ContentLanguagePicker from '../../ContentLanguagePicker';
import { SHOP_CONTENT_LANGUAGES, type ShopContentLang } from '../../../lib/shopContentLanguages';
import { useAdminShopContentLanguages, useAdminShopMultilingualEnabled } from '../../../hooks/useAdminShopContentLanguages';
import AdminShopAvailabilityFields from './AdminShopAvailabilityFields';
import { useCloseOnOutsideClick } from '../../../hooks/useCloseOnOutsideClick';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  Filter,
  Link2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import type { AdminSellerShopFields } from '../../../types/admin';
import { getStoredToken } from '../../../context/AuthContext';
import { AdminLoadingInline } from '../AdminLoading';
import {
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_FILTER_SELECT,
  DASHBOARD_INPUT,
  DASHBOARD_TEXTAREA,
} from '../../../lib/dashboardFormClasses';
import DashboardIconTextarea from '../../DashboardIconTextarea';
import {
  SHOP_SETTINGS_CARD,
  ADMIN_FIELD_LABEL,
  SHOP_SETTINGS_CARD_PAD,
  ShopSettingsSectionHeading,
  ShopSettingsStack,
} from './shopSettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const FOOTER_DESCRIPTION_MAX = 250;

const SOCIAL_PLATFORM_VALUES = [
  'instagram',
  'tiktok',
  'facebook',
  'twitter',
  'youtube',
  'linkedin',
  'whatsapp',
  'other',
] as const;

const SOCIAL_PLATFORM_I18N: Record<(typeof SOCIAL_PLATFORM_VALUES)[number], string> = {
  instagram: 'dashboard.contact.platformInstagram',
  tiktok: 'dashboard.contact.platformTiktok',
  facebook: 'dashboard.contact.platformFacebook',
  twitter: 'dashboard.contact.platformTwitter',
  youtube: 'dashboard.contact.platformYoutube',
  linkedin: 'dashboard.contact.platformLinkedin',
  whatsapp: 'dashboard.contact.platformWhatsapp',
  other: 'dashboard.contact.platformOther',
};

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
  shopName: string;
};

function footerDescriptionValue(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.footerDescriptionEs ?? '';
  if (lang === 'ar') return form.footerDescriptionAr ?? '';
  return form.footerDescription;
}

function footerAddressValue(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.footerAddressEs ?? '';
  if (lang === 'ar') return form.footerAddressAr ?? '';
  return form.footerAddress;
}

export default function AdminShopFooterFields({ form, set, shopName }: Props) {
  const { t } = useTranslation();
  const contentLanguages = useAdminShopContentLanguages(form);
  const multilingualEnabled = useAdminShopMultilingualEnabled(form);
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState<number | null>(null);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(platformDropdownOpen !== null, () => setPlatformDropdownOpen(null), platformDropdownRef);
  const activeLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];

  const socialPlatforms = SOCIAL_PLATFORM_VALUES.map((value) => ({
    value,
    label: t(SOCIAL_PLATFORM_I18N[value]),
  }));

  if (!form.footerEnabled) return null;

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getStoredToken();
    if (!token) return;
    setLogoUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('type', 'logo');
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
      set('footerLogo', data.url);
      toast.success(t('dashboard.footer.toastLogo'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dashboard.productForm.toastUploadFail'));
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }

  function addSocialLink() {
    const used = new Set(form.footerSocialLinks.map((l) => l.platform));
    const firstAvailable = socialPlatforms.find((p) => !used.has(p.value));
    if (!firstAvailable) {
      toast.error(t('dashboard.contact.toastAllPlatforms'));
      return;
    }
    set('footerSocialLinks', [...form.footerSocialLinks, { platform: firstAvailable.value, url: '' }]);
  }

  return (
    <ShopSettingsStack>
      <ShopSettingsSectionHeading title={t('dashboard.footer.title')} />
      <div className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD} space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0`}>
        <div className="min-w-0">
          <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200 mb-2">
            {t('dashboard.footer.logo')} <span className="text-red-500">*</span>
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} className="hidden" />
          <div className="flex flex-col gap-3 max-lg:gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
            {(form.footerLogo || logoUploading) && (
              <div className="shrink-0 self-start">
                {logoUploading ? (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 flex items-center justify-center">
                    <AdminLoadingInline dotsOnly />
                  </div>
                ) : form.footerLogo ? (
                  <img src={form.footerLogo} alt="" className="w-16 h-16 object-contain rounded-xl border border-stone-200 dark:border-zinc-700" />
                ) : null}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className={`${DASHBOARD_BTN_OUTLINE} w-full sm:w-auto justify-center border-dashed max-lg:py-2.5 max-lg:text-sm`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              {form.footerLogo ? t('dashboard.footer.changeLogo') : t('dashboard.footer.uploadLogo')}
            </button>
          </div>
        </div>
        <div className="min-w-0">
          <label className={ADMIN_FIELD_LABEL}>{t('dashboard.footer.titleLabel')}</label>
          <input
            type="text"
            readOnly
            value={shopName}
            className={`${DASHBOARD_INPUT} cursor-not-allowed bg-stone-100/80 dark:bg-zinc-800/80 text-stone-700 dark:text-zinc-300 focus:border-stone-200 dark:focus:border-zinc-700 focus:ring-0`}
            aria-readonly
          />
        </div>
        {multilingualEnabled ? (
          <ContentLanguagePicker
            label={t('dashboard.footer.langLabel')}
            hint={t('dashboard.footer.langHint')}
            value={formLang}
            onChange={setFormLang}
            filled={{
              en: Boolean(form.footerDescription.trim()),
              es: Boolean((form.footerDescriptionEs ?? '').trim()),
              ar: Boolean((form.footerDescriptionAr ?? '').trim()),
            }}
            languages={contentLanguages}
          />
        ) : null}
        <div className="min-w-0">
          <label className={ADMIN_FIELD_LABEL}>
            {multilingualEnabled
              ? `${t('dashboard.footer.description')} (${activeLang.label})`
              : t('dashboard.footer.description')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={footerDescriptionValue(form, formLang)}
            onChange={(e) => {
              const value = e.target.value.slice(0, FOOTER_DESCRIPTION_MAX);
              if (formLang === 'es') set('footerDescriptionEs', value);
              else if (formLang === 'ar') set('footerDescriptionAr', value);
              else set('footerDescription', value);
            }}
            dir={activeLang.dir}
            placeholder={t('dashboard.footer.descPh')}
            rows={5}
            maxLength={FOOTER_DESCRIPTION_MAX}
            className={`${DASHBOARD_TEXTAREA} min-h-[7.5rem] max-h-48`}
          />
          <p className="mt-1 text-right text-[10px] max-lg:text-[10px] lg:text-xs text-stone-500 dark:text-zinc-500 tabular-nums">
            {footerDescriptionValue(form, formLang).length}/{FOOTER_DESCRIPTION_MAX}
          </p>
        </div>
      </div>

      <ShopSettingsSectionHeading title={t('dashboard.contact.pageTitle')} />
      <div
        className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD} min-w-0 overflow-visible ${
          platformDropdownOpen !== null ? 'max-lg:pb-40 lg:pb-56' : ''
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
          <div>
            <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              {t('dashboard.contact.phone')}
            </label>
            <div className="relative min-w-0">
              <Phone className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={form.footerPhone}
                onChange={(e) => set('footerPhone', e.target.value)}
                placeholder={t('dashboard.contact.phonePh')}
                className={`${DASHBOARD_INPUT} pl-9`}
              />
            </div>
          </div>
          <div className="min-w-0">
            <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              {t('dashboard.contact.email')}
            </label>
            <div className="relative min-w-0">
              <Mail className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={form.footerEmail}
                onChange={(e) => set('footerEmail', e.target.value)}
                placeholder={t('dashboard.contact.emailPh')}
                className={`${DASHBOARD_INPUT} pl-9`}
              />
            </div>
          </div>
          <div className="md:col-span-2 min-w-0">
            <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              {t('dashboard.contact.address')}
            </label>
            <DashboardIconTextarea
              icon={MapPin}
              value={footerAddressValue(form, formLang)}
              dir={activeLang.dir}
              onChange={(e) => {
                const value = e.target.value;
                if (formLang === 'es') set('footerAddressEs', value);
                else if (formLang === 'ar') set('footerAddressAr', value);
                else set('footerAddress', value);
              }}
              placeholder={t('dashboard.contact.addressPh')}
              rows={2}
            />
          </div>
        </div>

        <div className="mt-4 max-lg:mt-4 lg:mt-5 min-w-0">
          <div className="flex flex-col gap-2 max-lg:gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
            <label className="text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300">
              {t('dashboard.contact.socialLinks')}
            </label>
            <button type="button" onClick={addSocialLink} className={`${DASHBOARD_BTN_PRIMARY} w-full sm:w-auto max-lg:py-2.5 max-lg:text-sm lg:py-3`}>
              <Plus className="w-4 h-4 shrink-0" />
              {t('dashboard.common.add')}
            </button>
          </div>
          <div className="space-y-2 overflow-visible">
            {form.footerSocialLinks.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-zinc-400 bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2.5">
                {t('dashboard.contact.noSocial')}
              </p>
            ) : (
              form.footerSocialLinks.map((link, index) => {
                const usedPlatforms = form.footerSocialLinks.map((l) => l.platform).filter((_, idx) => idx !== index);
                const availablePlatforms = socialPlatforms.filter(
                  (p) => !usedPlatforms.includes(p.value) || p.value === link.platform,
                );
                const currentLabel = socialPlatforms.find((p) => p.value === link.platform)?.label ?? link.platform;
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-1 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto] lg:grid-cols-[200px_minmax(0,1fr)_auto] items-stretch sm:items-center gap-2 p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-700 relative min-w-0 ${
                      platformDropdownOpen === index ? 'z-[100]' : 'z-0'
                    }`}
                  >
                    <div
                      ref={platformDropdownOpen === index ? platformDropdownRef : undefined}
                      className="relative min-w-0"
                    >
                      <button
                        type="button"
                        onClick={() => setPlatformDropdownOpen(platformDropdownOpen === index ? null : index)}
                        className={`${DASHBOARD_FILTER_SELECT} w-full text-sm max-lg:py-2.5`}
                      >
                        <Filter className="w-4 h-4 shrink-0 text-brand-500" />
                        <span className="truncate text-left flex-1">{currentLabel}</span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform ${platformDropdownOpen === index ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {platformDropdownOpen === index ? (
                        <div className="absolute left-0 right-0 sm:right-auto z-[200] w-full sm:w-52 max-h-64 overflow-y-auto rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1 max-lg:top-full max-lg:mt-1 lg:bottom-full lg:mb-1 lg:top-auto">
                          {availablePlatforms.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => {
                                const next = [...form.footerSocialLinks];
                                next[index] = { ...next[index], platform: p.value };
                                set('footerSocialLinks', next);
                                setPlatformDropdownOpen(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                link.platform === p.value
                                  ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400'
                                  : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="relative min-w-0">
                      <Link2 className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const next = [...form.footerSocialLinks];
                          next[index] = { ...next[index], url: e.target.value };
                          set('footerSocialLinks', next);
                        }}
                        placeholder={t('dashboard.contact.urlPh')}
                        className={`${DASHBOARD_INPUT} pl-9 text-sm max-lg:py-2.5`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => set('footerSocialLinks', form.footerSocialLinks.filter((_, j) => j !== index))}
                      className="inline-flex h-10 w-full sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 sm:justify-self-end dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50"
                      aria-label={t('dashboard.contact.ariaRemove')}
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AdminShopAvailabilityFields form={form} set={set} />
    </ShopSettingsStack>
  );
}
