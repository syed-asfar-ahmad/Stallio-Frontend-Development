import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Home, Plus, Upload } from 'lucide-react';
import type { AdminSellerShopFields } from '../../../types/admin';
import type { ShopTestimonial, ShopTrustBadge } from '../../../types';
import { getStoredToken } from '../../../context/AuthContext';
import DashboardSwitch from '../../DashboardSwitch';
import DashboardSelect from '../../DashboardSelect';
import ConfirmDialog from '../../ConfirmDialog';
import ContentLanguagePicker from '../../ContentLanguagePicker';
import HeroImageCropModal from '../../HeroImageCropModal';
import DashboardImageRemoveButton from '../../DashboardImageRemoveButton';
import { FieldLabelWithHelp } from '../../FieldLabelWithHelp';
import { AdminLoadingInline } from '../AdminLoading';
import { REVIEW_NAME_MAX, REVIEW_TEXT_MAX } from '../../shop/ShopReviewsSection';
import {
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_INPUT,
  DASHBOARD_ITEM_DELETE_BTN,
  DASHBOARD_TEXTAREA,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../../../lib/dashboardFormClasses';
import {
  SHOP_CONTENT_LANGUAGES,
  isContentFieldRequired,
  isSharedFieldLocked,
  isSharedFieldRequired,
  type ShopContentLang,
} from '../../../lib/shopContentLanguages';
import {
  resolveTrustBadgeType,
  TRUST_BADGE_TYPES,
  TrustBadgeTypeIcon,
  type TrustBadgeType,
} from '../../../lib/trustBadgeIcons';
import { STORE_HERO_IMAGE_HEIGHT, STORE_HERO_IMAGE_WIDTH } from '../../../lib/heroStoreViewport';
import { useAdminShopContentLanguages, useAdminShopMultilingualEnabled } from '../../../hooks/useAdminShopContentLanguages';
import {
  SHOP_SETTINGS_CARD,
  SHOP_SETTINGS_CARD_PAD,
  ShopSettingsSectionHeading,
  ShopSettingsStack,
} from './shopSettingsLayout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const MAX_TRUST = 4;
const TRUST_LABEL_MAX = 30;
const MAX_REVIEWS = 8;
const HERO_HEADLINE_MAX = 80;
const HERO_INTRO_MAX = 250;

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
  shopName: string;
};

const emptyReview = (): ShopTestimonial => ({ name: '', text: '', rating: 5 });
const emptyTrust = (): ShopTrustBadge => ({ label: '', icon: 'check' });

function trustLabelValue(badge: ShopTrustBadge, lang: ShopContentLang): string {
  if (lang === 'es') return badge.labelEs ?? '';
  if (lang === 'ar') return badge.labelAr ?? '';
  return badge.label;
}

function setTrustLabelValue(badge: ShopTrustBadge, lang: ShopContentLang, value: string): ShopTrustBadge {
  if (lang === 'es') return { ...badge, labelEs: value };
  if (lang === 'ar') return { ...badge, labelAr: value };
  return { ...badge, label: value };
}

function reviewNameValue(review: ShopTestimonial, lang: ShopContentLang): string {
  if (lang === 'es') return review.nameEs ?? '';
  if (lang === 'ar') return review.nameAr ?? '';
  return review.name;
}

function setReviewNameValue(review: ShopTestimonial, lang: ShopContentLang, value: string): ShopTestimonial {
  if (lang === 'es') return { ...review, nameEs: value };
  if (lang === 'ar') return { ...review, nameAr: value };
  return { ...review, name: value };
}

function reviewTextValue(review: ShopTestimonial, lang: ShopContentLang): string {
  if (lang === 'es') return review.textEs ?? '';
  if (lang === 'ar') return review.textAr ?? '';
  return review.text;
}

function setReviewTextValue(review: ShopTestimonial, lang: ShopContentLang, value: string): ShopTestimonial {
  if (lang === 'es') return { ...review, textEs: value };
  if (lang === 'ar') return { ...review, textAr: value };
  return { ...review, text: value };
}

function heroTitle(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.homeHeroTitleEs ?? '';
  if (lang === 'ar') return form.homeHeroTitleAr ?? '';
  return form.homeHeroTitle;
}

function heroIntro(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.homeHeroSubtitleEs ?? form.shopTaglineEs ?? '';
  if (lang === 'ar') return form.homeHeroSubtitleAr ?? form.shopTaglineAr ?? '';
  return form.homeHeroSubtitle || form.shopTagline;
}

function trustBadgeMeta(icon: string | undefined, t: (key: string) => string) {
  const value = resolveTrustBadgeType(icon);
  return {
    value,
    placeholder: t(`dashboard.home.trustType.${value}.placeholder`),
  };
}

export default function AdminShopHomeFields({ form, set, shopName }: Props) {
  const { t } = useTranslation();
  const contentLanguages = useAdminShopContentLanguages(form);
  const multilingualEnabled = useAdminShopMultilingualEnabled(form);
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroCropOpen, setHeroCropOpen] = useState(false);
  const [heroCropFile, setHeroCropFile] = useState<File | null>(null);
  const [heroToggleConfirm, setHeroToggleConfirm] = useState<boolean | null>(null);
  const [trustToggleConfirm, setTrustToggleConfirm] = useState<boolean | null>(null);
  const [reviewsToggleConfirm, setReviewsToggleConfirm] = useState<boolean | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const activeFormLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const sharedLocked = isSharedFieldLocked(multilingualEnabled, formLang);

  function setHeroTitle(lang: ShopContentLang, value: string) {
    const trimmed = value.slice(0, HERO_HEADLINE_MAX);
    if (lang === 'es') set('homeHeroTitleEs', trimmed);
    else if (lang === 'ar') set('homeHeroTitleAr', trimmed);
    else set('homeHeroTitle', trimmed);
  }

  function setHeroIntro(lang: ShopContentLang, value: string) {
    const trimmed = value.slice(0, HERO_INTRO_MAX);
    if (lang === 'es') {
      set('homeHeroSubtitleEs', trimmed);
      set('shopTaglineEs', trimmed);
    } else if (lang === 'ar') {
      set('homeHeroSubtitleAr', trimmed);
      set('shopTaglineAr', trimmed);
    } else {
      set('homeHeroSubtitle', trimmed);
      set('shopTagline', trimmed);
    }
  }

  function handleHeroFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('dashboard.home.cropImageOnly'));
      return;
    }
    setHeroCropFile(file);
    setHeroCropOpen(true);
  }

  async function uploadHeroBlob(blob: Blob) {
    const token = getStoredToken();
    if (!token) return;
    setHeroCropOpen(false);
    setHeroCropFile(null);
    setHeroUploading(true);
    try {
      const body = new FormData();
      body.append('file', blob, 'hero.jpg');
      body.append('type', 'product');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
      set('homeHeroImage', data.url);
      set('homeHeroImagePublicId', data.publicId ?? null);
      toast.success(t('dashboard.home.toastHeroImage'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('dashboard.productForm.toastUploadFail'));
    } finally {
      setHeroUploading(false);
    }
  }

  const formLangFilled = {
    en: Boolean(heroTitle(form, 'en').trim() || heroIntro(form, 'en').trim()),
    es: Boolean(heroTitle(form, 'es').trim() || heroIntro(form, 'es').trim()),
    ar: Boolean(heroTitle(form, 'ar').trim() || heroIntro(form, 'ar').trim()),
  };

  return (
    <ShopSettingsStack>
      <ShopSettingsSectionHeading title={t('dashboard.home.title')} />

      {multilingualEnabled ? (
        <ContentLanguagePicker
          label={t('dashboard.home.langLabel')}
          hint={t('dashboard.home.langHint')}
          value={formLang}
          onChange={setFormLang}
          filled={formLangFilled}
          languages={contentLanguages}
        />
      ) : null}

      <div className={`${SHOP_SETTINGS_CARD} overflow-visible min-w-0`}>
        <div className={`${DASHBOARD_TOGGLE_ROW} ${SHOP_SETTINGS_CARD_PAD} border-b border-stone-100 dark:border-zinc-800`}>
          <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
            <p className="flex items-center gap-2 text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200">
              <Home className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              {t('dashboard.home.heroTitle')}
            </p>
          </div>
          <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
            <DashboardSwitch checked={form.homeHeroEnabled} onCheckedChange={setHeroToggleConfirm} />
          </div>
        </div>
        {form.homeHeroEnabled ? (
          <div className={`${SHOP_SETTINGS_CARD_PAD} space-y-4 min-w-0`}>
            <div>
              <label className="block text-xs font-semibold text-stone-800 dark:text-zinc-200 mb-1.5">
                {multilingualEnabled
                  ? `${t('dashboard.home.heroHeading')} (${activeFormLang.label})`
                  : t('dashboard.home.heroHeading')}
                {isContentFieldRequired(multilingualEnabled, formLang) ? <span className="text-red-500"> *</span> : null}
              </label>
              <input
                value={heroTitle(form, formLang)}
                onChange={(e) => setHeroTitle(formLang, e.target.value)}
                maxLength={HERO_HEADLINE_MAX}
                dir={activeFormLang.dir}
                placeholder={shopName}
                className={DASHBOARD_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 dark:text-zinc-200 mb-1.5">
                {multilingualEnabled
                  ? `${t('dashboard.home.heroIntro')} (${activeFormLang.label})`
                  : t('dashboard.home.heroIntro')}
                {isContentFieldRequired(multilingualEnabled, formLang) ? <span className="text-red-500"> *</span> : null}
              </label>
              <textarea
                value={heroIntro(form, formLang)}
                onChange={(e) => setHeroIntro(formLang, e.target.value)}
                rows={3}
                maxLength={HERO_INTRO_MAX}
                dir={activeFormLang.dir}
                placeholder={t('dashboard.home.taglinePh')}
                className={DASHBOARD_TEXTAREA}
              />
            </div>
            <div>
              <FieldLabelWithHelp
                required={isSharedFieldRequired(multilingualEnabled, formLang)}
                help={t('dashboard.home.heroImageSize', { width: STORE_HERO_IMAGE_WIDTH, height: STORE_HERO_IMAGE_HEIGHT })}
                className="mb-3"
              >
                {t('dashboard.home.heroImage')}
              </FieldLabelWithHelp>
              <div className="flex flex-col sm:flex-row flex-wrap items-start gap-3 min-w-0">
                {form.homeHeroImage ? (
                  <div className="relative shrink-0">
                    <img
                      src={form.homeHeroImage}
                      alt=""
                      className="w-full max-w-[12rem] sm:w-48 rounded-lg border border-stone-200 dark:border-zinc-700"
                      style={{ aspectRatio: `${STORE_HERO_IMAGE_WIDTH} / ${STORE_HERO_IMAGE_HEIGHT}` }}
                    />
                    <DashboardImageRemoveButton
                      disabled={sharedLocked}
                      onClick={() => {
                        set('homeHeroImage', null);
                        set('homeHeroImagePublicId', null);
                      }}
                      className="-right-2 -top-2"
                      aria-label={t('dashboard.common.delete')}
                    />
                  </div>
                ) : null}
                <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroFilePick} />
                <button
                  type="button"
                  onClick={() => heroFileRef.current?.click()}
                  disabled={heroUploading || sharedLocked}
                  className={`${DASHBOARD_BTN_OUTLINE} border-dashed w-full sm:w-auto justify-center`}
                >
                  {heroUploading ? <AdminLoadingInline dotsOnly /> : <Upload className="h-4 w-4" />}
                  {form.homeHeroImage ? t('dashboard.home.heroImageReplace') : t('dashboard.common.upload')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`${SHOP_SETTINGS_CARD} overflow-visible min-w-0`}>
        <div className={`${DASHBOARD_TOGGLE_ROW} ${SHOP_SETTINGS_CARD_PAD} border-b border-stone-100 dark:border-zinc-800`}>
          <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
            <p className="text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('dashboard.home.trustTitle')}</p>
          </div>
          <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
            <DashboardSwitch
              checked={form.homeTrustEnabled}
              onCheckedChange={(next) => {
                if (next && form.homeTrustBadges.length === 0) {
                  set('homeTrustBadges', [emptyTrust()]);
                }
                setTrustToggleConfirm(next);
              }}
            />
          </div>
        </div>
        {form.homeTrustEnabled ? (
          <div className={`${SHOP_SETTINGS_CARD_PAD} space-y-3 min-w-0`}>
            {form.homeTrustBadges.map((badge, i) => {
              const meta = trustBadgeMeta(badge.icon, t);
              return (
                <div
                  key={i}
                  className="rounded-lg border border-stone-200/80 bg-stone-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-950/40"
                >
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,15.5rem)_1fr_auto] lg:items-end">
                    <div className="min-w-0">
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                        {t('dashboard.home.trustTypeLabel')}
                      </label>
                      <DashboardSelect
                        value={meta.value}
                        disabled={sharedLocked}
                        onChange={(v) => {
                          const next = [...form.homeTrustBadges];
                          next[i] = { ...next[i], icon: v };
                          set('homeTrustBadges', next);
                        }}
                        options={TRUST_BADGE_TYPES.map((type: TrustBadgeType) => ({
                          value: type,
                          label: t(`dashboard.home.trustType.${type}.label`),
                          icon: <TrustBadgeTypeIcon type={type} />,
                        }))}
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                        {multilingualEnabled
                          ? `${t('dashboard.home.trustLabelField')} (${activeFormLang.label})`
                          : t('dashboard.home.trustLabelField')}
                      </label>
                      <input
                        value={trustLabelValue(badge, formLang)}
                        maxLength={TRUST_LABEL_MAX}
                        dir={activeFormLang.dir}
                        onChange={(e) => {
                          const next = [...form.homeTrustBadges];
                          next[i] = setTrustLabelValue(next[i], formLang, e.target.value.slice(0, TRUST_LABEL_MAX));
                          set('homeTrustBadges', next);
                        }}
                        placeholder={meta.placeholder}
                        className={DASHBOARD_INPUT}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => set('homeTrustBadges', form.homeTrustBadges.filter((_, j) => j !== i))}
                      className={`${DASHBOARD_ITEM_DELETE_BTN} w-full sm:w-auto`}
                    >
                      {t('dashboard.common.delete')}
                    </button>
                  </div>
                </div>
              );
            })}
            {form.homeTrustBadges.length < MAX_TRUST ? (
              <button
                type="button"
                onClick={() => set('homeTrustBadges', [...form.homeTrustBadges, emptyTrust()])}
                className={DASHBOARD_BTN_OUTLINE}
              >
                <Plus className="h-4 w-4" />
                {t('dashboard.home.addTrust')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={`${SHOP_SETTINGS_CARD} overflow-visible min-w-0`}>
        <div className={`${DASHBOARD_TOGGLE_ROW} ${SHOP_SETTINGS_CARD_PAD} border-b border-stone-100 dark:border-zinc-800`}>
          <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
            <p className="text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('dashboard.home.reviewsTitle')}</p>
          </div>
          <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
            <DashboardSwitch
              checked={form.homeReviewsEnabled}
              onCheckedChange={(next) => {
                if (next && form.homeReviews.length === 0) {
                  set('homeReviews', [emptyReview()]);
                }
                setReviewsToggleConfirm(next);
              }}
            />
          </div>
        </div>
        {form.homeReviewsEnabled ? (
          <div className={`${SHOP_SETTINGS_CARD_PAD} space-y-3 min-w-0`}>
            {form.homeReviews.map((review, i) => (
              <div
                key={i}
                className="space-y-3 rounded-lg border border-stone-200/80 bg-stone-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-950/40"
              >
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-2 dark:border-zinc-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {t('dashboard.home.reviewN', { n: i + 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => set('homeReviews', form.homeReviews.filter((_, j) => j !== i))}
                    className={DASHBOARD_ITEM_DELETE_BTN}
                  >
                    {t('dashboard.common.delete')}
                  </button>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-stone-800 dark:text-zinc-200">
                      {multilingualEnabled
                        ? `${t('dashboard.home.reviewNameLabel')} (${activeFormLang.label})`
                        : t('dashboard.home.reviewNameLabel')}
                    </label>
                    <input
                      value={reviewNameValue(review, formLang)}
                      maxLength={REVIEW_NAME_MAX}
                      dir={activeFormLang.dir}
                      onChange={(e) => {
                        const next = [...form.homeReviews];
                        next[i] = setReviewNameValue(next[i], formLang, e.target.value);
                        set('homeReviews', next);
                      }}
                      placeholder={t('dashboard.home.reviewNamePlaceholder')}
                      className={DASHBOARD_INPUT}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-stone-800 dark:text-zinc-200">
                      {t('dashboard.home.reviewRatingLabel')}
                    </label>
                    <DashboardSelect
                      value={String(review.rating ?? 5)}
                      disabled={sharedLocked}
                      onChange={(v) => {
                        const next = [...form.homeReviews];
                        next[i] = { ...next[i], rating: Number(v) };
                        set('homeReviews', next);
                      }}
                      options={[5, 4, 3, 2, 1].map((r) => ({
                        value: String(r),
                        label: t('dashboard.home.starsCount', { count: r }),
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-stone-800 dark:text-zinc-200">
                    {multilingualEnabled
                      ? `${t('dashboard.home.reviewTextLabel')} (${activeFormLang.label})`
                      : t('dashboard.home.reviewTextLabel')}
                  </label>
                  <textarea
                    value={reviewTextValue(review, formLang)}
                    maxLength={REVIEW_TEXT_MAX}
                    dir={activeFormLang.dir}
                    onChange={(e) => {
                      const next = [...form.homeReviews];
                      next[i] = setReviewTextValue(next[i], formLang, e.target.value);
                      set('homeReviews', next);
                    }}
                    rows={3}
                    placeholder={t('dashboard.home.reviewTextPlaceholder')}
                    className={DASHBOARD_TEXTAREA}
                  />
                </div>
              </div>
            ))}
            {form.homeReviews.length < MAX_REVIEWS ? (
              <button
                type="button"
                onClick={() => set('homeReviews', [...form.homeReviews, emptyReview()])}
                className={DASHBOARD_BTN_OUTLINE}
              >
                <Plus className="h-4 w-4" />
                {t('dashboard.home.addReview')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <HeroImageCropModal
        open={heroCropOpen}
        imageFile={heroCropFile}
        onClose={() => {
          setHeroCropOpen(false);
          setHeroCropFile(null);
        }}
        onConfirm={uploadHeroBlob}
      />

      <ConfirmDialog
        open={heroToggleConfirm !== null}
        title={heroToggleConfirm ? t('dashboard.home.enableHeroTitle') : t('dashboard.home.disableHeroTitle')}
        message={heroToggleConfirm ? t('dashboard.home.enableHeroMsg') : t('dashboard.home.disableHeroMsg')}
        confirmLabel={heroToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (heroToggleConfirm !== null) {
            set('homeHeroEnabled', heroToggleConfirm);
            setHeroToggleConfirm(null);
          }
        }}
        onCancel={() => setHeroToggleConfirm(null)}
      />
      <ConfirmDialog
        open={trustToggleConfirm !== null}
        title={trustToggleConfirm ? t('dashboard.home.enableTrustTitle') : t('dashboard.home.disableTrustTitle')}
        message={trustToggleConfirm ? t('dashboard.home.enableTrustMsg') : t('dashboard.home.disableTrustMsg')}
        confirmLabel={trustToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (trustToggleConfirm !== null) {
            set('homeTrustEnabled', trustToggleConfirm);
            setTrustToggleConfirm(null);
          }
        }}
        onCancel={() => setTrustToggleConfirm(null)}
      />
      <ConfirmDialog
        open={reviewsToggleConfirm !== null}
        title={reviewsToggleConfirm ? t('dashboard.home.enableReviewsTitle') : t('dashboard.home.disableReviewsTitle')}
        message={reviewsToggleConfirm ? t('dashboard.home.enableReviewsMsg') : t('dashboard.home.disableReviewsMsg')}
        confirmLabel={reviewsToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (reviewsToggleConfirm !== null) {
            set('homeReviewsEnabled', reviewsToggleConfirm);
            setReviewsToggleConfirm(null);
          }
        }}
        onCancel={() => setReviewsToggleConfirm(null)}
      />
    </ShopSettingsStack>
  );
}
