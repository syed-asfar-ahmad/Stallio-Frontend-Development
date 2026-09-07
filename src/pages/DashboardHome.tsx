import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth, getStoredToken } from '../context/AuthContext';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import DashboardSwitch from '../components/DashboardSwitch';
import FieldHelpButton from '../components/FieldHelpButton';
import { FieldLabelWithHelp } from '../components/FieldLabelWithHelp';
import DashboardSelect from '../components/DashboardSelect';
import ConfirmDialog from '../components/ConfirmDialog';
import type { ShopTestimonial, ShopTrustBadge } from '../types';
import { REVIEW_NAME_MAX, REVIEW_TEXT_MAX } from '../components/shop/ShopReviewsSection';
import {
  DASHBOARD_INPUT,
  DASHBOARD_TEXTAREA,
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_ITEM_DELETE_BTN,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';
import {
  Home,
  Save,
  Upload,
  Plus,
} from 'lucide-react';
import {
  isTrustBadgeType,
  resolveTrustBadgeType,
  TRUST_BADGE_TYPES,
  TrustBadgeTypeIcon,
  type TrustBadgeType,
} from '../lib/trustBadgeIcons';
import { AdminLoadingInline } from '../components/DashboardLoading';
import HeroImageCropModal from '../components/HeroImageCropModal';
import { STORE_HERO_IMAGE_HEIGHT, STORE_HERO_IMAGE_WIDTH } from '../lib/heroStoreViewport';
import ContentLanguagePicker from '../components/ContentLanguagePicker';
import {
  SHOP_CONTENT_LANGUAGES,
  isContentFieldRequired,
  isSharedFieldLocked,
  isSharedFieldRequired,
  type ShopContentLang,
} from '../lib/shopContentLanguages';
import SharedLockedField from '../components/SharedLockedField';
import DashboardImageRemoveButton from '../components/DashboardImageRemoveButton';
import { useSellerContentLanguages, useSellerMultilingualEnabled } from '../hooks/useSellerContentLanguages';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const MAX_TRUST = 4;
const TRUST_LABEL_MAX = 30;
const MAX_REVIEWS = 8;
const HERO_HEADLINE_MAX = 80;
const HERO_INTRO_MAX = 250;
const EMPTY_FORM_TEXT: Record<ShopContentLang, string> = { en: '', es: '', ar: '' };

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

function FieldLabelWithCounter({
  label,
  current,
  max,
  required,
}: {
  label: string;
  current: number;
  max: number;
  required?: boolean;
}) {
  return (
    <div className="mb-1.5 max-lg:mb-1.5 lg:mb-2 flex items-center justify-between gap-2 min-w-0">
      <label className="text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200 min-w-0">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <span
        className={`text-[11px] max-lg:text-[11px] lg:text-xs tabular-nums shrink-0 ${current >= max ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-zinc-500'}`}
      >
        {current}/{max}
      </span>
    </div>
  );
}

const emptyReview = (): ShopTestimonial => ({ name: '', text: '', rating: 5 });
const emptyTrust = (): ShopTrustBadge => ({ label: '', icon: 'check' });

function trustBadgeMeta(
  icon: string | undefined,
  t: (key: string) => string,
): { label: string; placeholder: string; value: TrustBadgeType } {
  const value = resolveTrustBadgeType(icon);
  return {
    value,
    label: t(`dashboard.home.trustType.${value}.label`),
    placeholder: t(`dashboard.home.trustType.${value}.placeholder`),
  };
}

function SectionToggleHeader({
  title,
  hint,
  checked,
  onCheckedChange,
  icon: Icon,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  icon?: typeof Home;
}) {
  return (
    <div className={`${DASHBOARD_TOGGLE_ROW} border-b border-stone-100 p-4 max-lg:p-4 lg:p-6 dark:border-zinc-800`}>
      <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
        <p className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200 leading-snug">
          {Icon ? <Icon className="h-3.5 w-3.5 max-lg:h-3.5 max-lg:w-3.5 lg:h-4 lg:w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden /> : null}
          <span className="min-w-0">{title}</span>
          <FieldHelpButton text={hint} />
        </p>
      </div>
      <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
        <DashboardSwitch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth();
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const [homeHeroEnabled, setHomeHeroEnabled] = useState(false);
  const [formHeroTitles, setFormHeroTitles] = useState<Record<ShopContentLang, string>>(EMPTY_FORM_TEXT);
  const [formHeroIntros, setFormHeroIntros] = useState<Record<ShopContentLang, string>>(EMPTY_FORM_TEXT);
  const [homeHeroImage, setHomeHeroImage] = useState<string | null>(null);
  const [homeHeroImagePublicId, setHomeHeroImagePublicId] = useState<string | null>(null);
  const [homeTrustEnabled, setHomeTrustEnabled] = useState(false);
  const [homeTrustBadges, setHomeTrustBadges] = useState<ShopTrustBadge[]>([]);
  const [homeReviewsEnabled, setHomeReviewsEnabled] = useState(false);
  const [homeReviews, setHomeReviews] = useState<ShopTestimonial[]>([]);
  const [saving, setSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [error, setError] = useState('');
  const [heroToggleConfirm, setHeroToggleConfirm] = useState<boolean | null>(null);
  const [trustToggleConfirm, setTrustToggleConfirm] = useState<boolean | null>(null);
  const [reviewsToggleConfirm, setReviewsToggleConfirm] = useState<boolean | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const [heroCropFile, setHeroCropFile] = useState<File | null>(null);
  const [heroCropOpen, setHeroCropOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const introEn = (user.homeHeroSubtitle ?? user.shopTagline ?? '').trim();
    setHomeHeroEnabled(user.homeHeroEnabled ?? false);
    setFormHeroTitles({
      en: user.homeHeroTitle ?? '',
      es: user.homeHeroTitleEs ?? '',
      ar: user.homeHeroTitleAr ?? '',
    });
    setFormHeroIntros({
      en: introEn,
      es: user.homeHeroSubtitleEs ?? user.shopTaglineEs ?? '',
      ar: user.homeHeroSubtitleAr ?? user.shopTaglineAr ?? '',
    });
    setFormLang('en');
    setHomeHeroImage(user.homeHeroImage ?? null);
    setHomeHeroImagePublicId(user.homeHeroImagePublicId ?? null);
    setHomeTrustEnabled(user.homeTrustEnabled ?? false);
    setHomeTrustBadges(user.homeTrustBadges?.length ? user.homeTrustBadges : []);
    setHomeReviewsEnabled(user.homeReviewsEnabled ?? false);
    setHomeReviews(user.homeReviews?.length ? user.homeReviews : []);
  }, [user]);

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
    setError('');
    try {
      const form = new FormData();
      form.append('file', blob, 'hero.jpg');
      form.append('type', 'product');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setHomeHeroImage(data.url);
      setHomeHeroImagePublicId(data.publicId ?? null);
      toast.success(t('dashboard.home.toastHeroImage'));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setHeroUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (homeHeroEnabled) {
      if (!formHeroTitles.en.trim()) {
        setError(t('dashboard.home.errHeroHeadline'));
        return;
      }
      if (!formHeroIntros.en.trim()) {
        setError(t('dashboard.home.errHeroIntro'));
        return;
      }
      if (!homeHeroImage) {
        setError(t('dashboard.home.errHeroImage'));
        return;
      }
    }
    if (homeTrustEnabled) {
      if (homeTrustBadges.length === 0) {
        setError(t('dashboard.home.errTrust'));
        return;
      }
      for (const badge of homeTrustBadges) {
        if (!isTrustBadgeType(badge.icon)) {
          setError(t('dashboard.home.errTrustType'));
          return;
        }
        if (!badge.label.trim()) {
          setError(t('dashboard.home.errTrustLabel'));
          return;
        }
      }
    }
    if (homeReviewsEnabled) {
      if (homeReviews.length === 0) {
        setError(t('dashboard.home.errReviews'));
        return;
      }
      for (const review of homeReviews) {
        if (!review.name.trim()) {
          setError(t('dashboard.home.errReviewName'));
          return;
        }
        const rating = Number(review.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
          setError(t('dashboard.home.errReviewRating'));
          return;
        }
        if (!review.text.trim()) {
          setError(t('dashboard.home.errReviewText'));
          return;
        }
      }
    }
    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          shopTagline: formHeroIntros.en.trim(),
          shopTaglineEs: formHeroIntros.es.trim() || undefined,
          shopTaglineAr: formHeroIntros.ar.trim() || undefined,
          homeHeroEnabled,
          homeHeroTitle: formHeroTitles.en.trim(),
          homeHeroTitleEs: formHeroTitles.es.trim() || undefined,
          homeHeroTitleAr: formHeroTitles.ar.trim() || undefined,
          homeHeroSubtitle: formHeroIntros.en.trim(),
          homeHeroSubtitleEs: formHeroIntros.es.trim() || undefined,
          homeHeroSubtitleAr: formHeroIntros.ar.trim() || undefined,
          homeHeroImage: homeHeroImage ?? undefined,
          homeHeroImagePublicId: homeHeroImagePublicId ?? undefined,
          homeTrustEnabled,
          homeTrustBadges: homeTrustBadges
            .filter((b) => b.label.trim())
            .slice(0, MAX_TRUST)
            .map((b) => ({
              label: b.label.trim().slice(0, TRUST_LABEL_MAX),
              labelEs: b.labelEs?.trim().slice(0, TRUST_LABEL_MAX) || undefined,
              labelAr: b.labelAr?.trim().slice(0, TRUST_LABEL_MAX) || undefined,
              icon: isTrustBadgeType(b.icon) ? b.icon : 'check',
            })),
          homeReviewsEnabled,
          homeReviews: homeReviews
            .filter((r) => r.name.trim() && r.text.trim())
            .slice(0, MAX_REVIEWS)
            .map((r) => ({
              name: r.name.trim().slice(0, REVIEW_NAME_MAX),
              nameEs: r.nameEs?.trim().slice(0, REVIEW_NAME_MAX) || undefined,
              nameAr: r.nameAr?.trim().slice(0, REVIEW_NAME_MAX) || undefined,
              text: r.text.trim().slice(0, REVIEW_TEXT_MAX),
              textEs: r.textEs?.trim().slice(0, REVIEW_TEXT_MAX) || undefined,
              textAr: r.textAr?.trim().slice(0, REVIEW_TEXT_MAX) || undefined,
              rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            })),
        },
      });
      await fetchUser();
      toast.success(t('dashboard.home.toastSaved'));
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function applyHeroToggle(next: boolean) {
    setHomeHeroEnabled(next);
    setHeroToggleConfirm(null);
  }

  function applyTrustToggle(next: boolean) {
    setHomeTrustEnabled(next);
    if (next && homeTrustBadges.length === 0) setHomeTrustBadges([emptyTrust()]);
    setTrustToggleConfirm(null);
  }

  function applyReviewsToggle(next: boolean) {
    setHomeReviewsEnabled(next);
    if (next && homeReviews.length === 0) setHomeReviews([emptyReview()]);
    setReviewsToggleConfirm(null);
  }

  const activeFormLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const sharedLocked = isSharedFieldLocked(multilingualEnabled, formLang);
  const formLangFilled = {
    en: Boolean(formHeroTitles.en.trim() || formHeroIntros.en.trim()),
    es: Boolean(formHeroTitles.es.trim() || formHeroIntros.es.trim()),
    ar: Boolean(formHeroTitles.ar.trim() || formHeroIntros.ar.trim()),
  };

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="mb-0.5 max-lg:mb-0.5 lg:mb-1 flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400">
          <Home className="h-4 w-4 max-lg:h-4 max-lg:w-4 lg:h-5 lg:w-5" aria-hidden />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">{t('dashboard.home.section')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 leading-snug">{t('dashboard.home.title')}</h1>
        <p className="mt-0.5 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">{t('dashboard.home.subtitle')}</p>
      </div>

      <form onSubmit={handleSave} className="w-full min-w-0 max-w-full space-y-4 max-lg:space-y-4 lg:space-y-6">
        {error && (
          <div className="rounded-lg max-lg:rounded-lg lg:rounded-xl border border-red-100 bg-red-50 px-3 max-lg:px-3 lg:px-4 py-2.5 max-lg:py-2.5 lg:py-3 text-xs max-lg:text-xs lg:text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-300 break-words">
            {error}
          </div>
        )}

        {multilingualEnabled ? (
          <ContentLanguagePicker
            label={t('dashboard.home.langLabel')}
            hint={t('dashboard.home.langHint')}
            value={formLang}
            onChange={setFormLang}
            filled={formLangFilled}
            languages={contentLanguages}
            className="mb-2"
          />
        ) : null}

        <div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <SectionToggleHeader
            title={t('dashboard.home.heroTitle')}
            hint={t('dashboard.home.heroHintMerged')}
            checked={homeHeroEnabled}
            onCheckedChange={(v) => setHeroToggleConfirm(v)}
          />
          {homeHeroEnabled && (
            <div className="space-y-4 max-lg:space-y-4 lg:space-y-6 p-4 max-lg:p-4 lg:p-6 min-w-0">
              <div>
                <FieldLabelWithCounter
                  label={
                    multilingualEnabled
                      ? `${t('dashboard.home.heroHeading')} (${activeFormLang.label})`
                      : t('dashboard.home.heroHeading')
                  }
                  current={formHeroTitles[formLang].length}
                  max={HERO_HEADLINE_MAX}
                  required={isContentFieldRequired(multilingualEnabled, formLang)}
                />
                <input
                  value={formHeroTitles[formLang]}
                  onChange={(e) =>
                    setFormHeroTitles((prev) => ({ ...prev, [formLang]: e.target.value.slice(0, HERO_HEADLINE_MAX) }))
                  }
                  maxLength={HERO_HEADLINE_MAX}
                  dir={activeFormLang.dir}
                  className={DASHBOARD_INPUT}
                  placeholder={user?.shopName}
                />
              </div>
              <div>
                <FieldLabelWithCounter
                  label={
                    multilingualEnabled
                      ? `${t('dashboard.home.heroIntro')} (${activeFormLang.label})`
                      : t('dashboard.home.heroIntro')
                  }
                  current={formHeroIntros[formLang].length}
                  max={HERO_INTRO_MAX}
                  required={isContentFieldRequired(multilingualEnabled, formLang)}
                />
                <textarea
                  value={formHeroIntros[formLang]}
                  onChange={(e) =>
                    setFormHeroIntros((prev) => ({ ...prev, [formLang]: e.target.value.slice(0, HERO_INTRO_MAX) }))
                  }
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
                <SharedLockedField locked={sharedLocked}>
                  <div className="flex flex-col sm:flex-row flex-wrap items-start gap-3 max-lg:gap-3 lg:gap-4 min-w-0 w-full">
                    {homeHeroImage ? (
                      <div className="relative shrink-0 w-full max-w-[12rem] sm:max-w-none sm:w-auto">
                        <img
                          src={homeHeroImage}
                          alt=""
                          className="w-full max-w-[12rem] sm:w-48 rounded-lg max-lg:rounded-lg lg:rounded-xl border border-stone-200 dark:border-zinc-700"
                          style={{ aspectRatio: `${STORE_HERO_IMAGE_WIDTH} / ${STORE_HERO_IMAGE_HEIGHT}` }}
                        />
                        <DashboardImageRemoveButton
                          disabled={sharedLocked}
                          onClick={() => {
                            setHomeHeroImage(null);
                            setHomeHeroImagePublicId(null);
                          }}
                          className="-right-2 -top-2"
                          aria-label={t('dashboard.common.delete')}
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-2 w-full sm:w-auto min-w-0">
                      <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroFilePick} />
                      <button
                        type="button"
                        onClick={() => heroFileRef.current?.click()}
                        disabled={heroUploading || sharedLocked}
                        className={`${DASHBOARD_BTN_OUTLINE} border-dashed w-full sm:w-auto justify-center`}
                      >
                        {heroUploading ? <AdminLoadingInline dotsOnly /> : <Upload className="h-4 w-4" />}
                        {homeHeroImage ? t('dashboard.home.heroImageReplace') : t('dashboard.common.upload')}
                      </button>
                    </div>
                  </div>
                </SharedLockedField>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 w-full max-w-full overflow-hidden lg:overflow-visible rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="overflow-hidden rounded-t-xl max-lg:rounded-t-xl lg:rounded-t-2xl">
            <SectionToggleHeader
              title={t('dashboard.home.trustTitle')}
              hint={t('dashboard.home.trustHint')}
              checked={homeTrustEnabled}
              onCheckedChange={(v) => setTrustToggleConfirm(v)}
            />
          </div>
          {homeTrustEnabled && (
            <div className="relative z-10 space-y-3 max-lg:space-y-3 lg:space-y-4 overflow-visible p-4 max-lg:p-4 lg:p-6 min-w-0">
              {homeTrustBadges.map((badge, i) => {
                const meta = trustBadgeMeta(badge.icon, t);
                return (
                  <div
                    key={i}
                    className="min-w-0 rounded-lg max-lg:rounded-lg lg:rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 max-lg:p-3 lg:p-4 dark:border-zinc-700 dark:bg-zinc-950/40"
                  >
                    <div className="grid gap-3 max-lg:gap-3 lg:gap-4 lg:grid-cols-[minmax(0,15.5rem)_1fr_auto] lg:items-end">
                      <div className="relative z-[200] min-w-0 w-full lg:min-w-[15.5rem] lg:col-start-1 lg:row-start-1">
                        <label className="mb-1 block max-lg:mb-1 lg:mb-1.5 text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-400">
                          {t('dashboard.home.trustTypeLabel')}
                          {isSharedFieldRequired(multilingualEnabled, formLang) ? (
                            <span className="text-red-500"> *</span>
                          ) : null}
                        </label>
                        <DashboardSelect
                          value={meta.value}
                          truncateSelected={false}
                          disabled={sharedLocked}
                          onChange={(v) => {
                            const next = [...homeTrustBadges];
                            next[i] = { ...next[i], icon: v };
                            setHomeTrustBadges(next);
                          }}
                          options={TRUST_BADGE_TYPES.map((type) => ({
                            value: type,
                            label: t(`dashboard.home.trustType.${type}.label`),
                            icon: <TrustBadgeTypeIcon type={type} />,
                          }))}
                        />
                      </div>
                      <div className="min-w-0 lg:col-start-2 lg:row-start-1">
                        <div className="mb-1 max-lg:mb-1 lg:mb-1.5 flex items-center justify-between gap-2 min-w-0">
                          <label className="block text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-400 min-w-0">
                            {multilingualEnabled
                              ? `${t('dashboard.home.trustLabelField')} (${activeFormLang.label})`
                              : t('dashboard.home.trustLabelField')}
                            {isContentFieldRequired(multilingualEnabled, formLang) ? (
                              <span className="text-red-500"> *</span>
                            ) : null}
                          </label>
                          <span
                            className={`text-xs tabular-nums ${trustLabelValue(badge, formLang).length >= TRUST_LABEL_MAX ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-zinc-500'}`}
                          >
                            {trustLabelValue(badge, formLang).length}/{TRUST_LABEL_MAX}
                          </span>
                        </div>
                        <input
                          value={trustLabelValue(badge, formLang)}
                          maxLength={TRUST_LABEL_MAX}
                          dir={activeFormLang.dir}
                          onChange={(e) => {
                            const next = [...homeTrustBadges];
                            next[i] = setTrustLabelValue(next[i], formLang, e.target.value.slice(0, TRUST_LABEL_MAX));
                            setHomeTrustBadges(next);
                          }}
                          placeholder={meta.placeholder}
                          className={DASHBOARD_INPUT}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setHomeTrustBadges((b) => b.filter((_, j) => j !== i))}
                        className={`${DASHBOARD_ITEM_DELETE_BTN} w-full sm:w-auto justify-self-end lg:col-start-3 lg:row-start-1`}
                      >
                        {t('dashboard.common.delete')}
                      </button>
                    </div>
                  </div>
                );
              })}
              {homeTrustBadges.length < MAX_TRUST && (
                <button type="button" onClick={() => setHomeTrustBadges((b) => [...b, emptyTrust()])} className={DASHBOARD_BTN_OUTLINE}>
                  <Plus className="h-4 w-4" />
                  {t('dashboard.home.addTrust')}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 w-full max-w-full overflow-hidden rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <SectionToggleHeader
            title={t('dashboard.home.reviewsTitle')}
            hint={t('dashboard.home.reviewsHint')}
            checked={homeReviewsEnabled}
            onCheckedChange={(v) => setReviewsToggleConfirm(v)}
          />
          {homeReviewsEnabled && (
            <div className="space-y-3 max-lg:space-y-3 lg:space-y-4 p-4 max-lg:p-4 lg:p-6 min-w-0">
              {homeReviews.map((review, i) => (
                <div
                  key={i}
                  className="min-w-0 space-y-3 max-lg:space-y-3 lg:space-y-4 rounded-lg max-lg:rounded-lg lg:rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 max-lg:p-3 lg:p-5 dark:border-zinc-700 dark:bg-zinc-950/40"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-2.5 max-lg:pb-2.5 lg:pb-3 dark:border-zinc-700 min-w-0">
                    <span className="text-[10px] max-lg:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
                      {t('dashboard.home.reviewN', { n: i + 1 })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHomeReviews((r) => r.filter((_, j) => j !== i))}
                      className={DASHBOARD_ITEM_DELETE_BTN}
                    >
                      {t('dashboard.common.delete')}
                    </button>
                  </div>
                  <div className="grid gap-3 max-lg:gap-3 lg:gap-4 lg:grid-cols-2 min-w-0">
                    <div className="min-w-0">
                      <label className="mb-1.5 max-lg:mb-1.5 lg:mb-2 block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200">
                        {multilingualEnabled
                          ? `${t('dashboard.home.reviewNameLabel')} (${activeFormLang.label})`
                          : t('dashboard.home.reviewNameLabel')}
                        {isContentFieldRequired(multilingualEnabled, formLang) ? (
                          <span className="text-red-500"> *</span>
                        ) : null}
                      </label>
                      <input
                        value={reviewNameValue(review, formLang)}
                        maxLength={REVIEW_NAME_MAX}
                        dir={activeFormLang.dir}
                        onChange={(e) => {
                          const n = [...homeReviews];
                          n[i] = setReviewNameValue(n[i], formLang, e.target.value);
                          setHomeReviews(n);
                        }}
                        placeholder={t('dashboard.home.reviewNamePlaceholder')}
                        className={DASHBOARD_INPUT}
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="mb-1.5 max-lg:mb-1.5 lg:mb-2 block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200">
                        {t('dashboard.home.reviewRatingLabel')}
                        {isSharedFieldRequired(multilingualEnabled, formLang) ? (
                          <span className="text-red-500"> *</span>
                        ) : null}
                      </label>
                      <DashboardSelect
                        value={String(review.rating ?? 5)}
                        disabled={sharedLocked}
                        onChange={(v) => {
                          const n = [...homeReviews];
                          n[i] = { ...n[i], rating: Number(v) };
                          setHomeReviews(n);
                        }}
                        options={[5, 4, 3, 2, 1].map((r) => ({
                          value: String(r),
                          label: t('dashboard.home.starsCount', { count: r }),
                        }))}
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label className="mb-1.5 max-lg:mb-1.5 lg:mb-2 block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200">
                      {multilingualEnabled
                        ? `${t('dashboard.home.reviewTextLabel')} (${activeFormLang.label})`
                        : t('dashboard.home.reviewTextLabel')}
                      {isContentFieldRequired(multilingualEnabled, formLang) ? (
                        <span className="text-red-500"> *</span>
                      ) : null}
                    </label>
                    <textarea
                      value={reviewTextValue(review, formLang)}
                      maxLength={REVIEW_TEXT_MAX}
                      dir={activeFormLang.dir}
                      onChange={(e) => {
                        const n = [...homeReviews];
                        n[i] = setReviewTextValue(n[i], formLang, e.target.value);
                        setHomeReviews(n);
                      }}
                      rows={3}
                      placeholder={t('dashboard.home.reviewTextPlaceholder')}
                      className={DASHBOARD_TEXTAREA}
                    />
                    <p className="mt-1 text-right text-xs text-stone-500 dark:text-zinc-500">
                      {reviewTextValue(review, formLang).length}/{REVIEW_TEXT_MAX}
                    </p>
                  </div>
                </div>
              ))}
              {homeReviews.length < MAX_REVIEWS && (
                <button type="button" onClick={() => setHomeReviews((r) => [...r, emptyReview()])} className={DASHBOARD_BTN_OUTLINE}>
                  <Plus className="h-4 w-4" />
                  {t('dashboard.home.addReview')}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-1 max-lg:pt-1 lg:pt-2 min-w-0">
          <button type="submit" disabled={saving} className={`${DASHBOARD_BTN_PRIMARY} w-full lg:w-auto justify-center`}>
            {saving ? <AdminLoadingInline light dotsOnly /> : <Save className="h-4 w-4 max-lg:h-4 max-lg:w-4 lg:h-5 lg:w-5 shrink-0" aria-hidden />}
            {saving ? t('dashboard.common.saving') : t('dashboard.home.save')}
          </button>
        </div>
      </form>

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
        onConfirm={() => heroToggleConfirm !== null && applyHeroToggle(heroToggleConfirm)}
        onCancel={() => setHeroToggleConfirm(null)}
      />
      <ConfirmDialog
        open={trustToggleConfirm !== null}
        title={trustToggleConfirm ? t('dashboard.home.enableTrustTitle') : t('dashboard.home.disableTrustTitle')}
        message={trustToggleConfirm ? t('dashboard.home.enableTrustMsg') : t('dashboard.home.disableTrustMsg')}
        confirmLabel={trustToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => trustToggleConfirm !== null && applyTrustToggle(trustToggleConfirm)}
        onCancel={() => setTrustToggleConfirm(null)}
      />
      <ConfirmDialog
        open={reviewsToggleConfirm !== null}
        title={reviewsToggleConfirm ? t('dashboard.home.enableReviewsTitle') : t('dashboard.home.disableReviewsTitle')}
        message={reviewsToggleConfirm ? t('dashboard.home.enableReviewsMsg') : t('dashboard.home.disableReviewsMsg')}
        confirmLabel={reviewsToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => reviewsToggleConfirm !== null && applyReviewsToggle(reviewsToggleConfirm)}
        onCancel={() => setReviewsToggleConfirm(null)}
      />
    </DashboardLayout>
  );
}
