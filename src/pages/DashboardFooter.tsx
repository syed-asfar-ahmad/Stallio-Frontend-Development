import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { getStoredToken } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DashboardSwitch from '../components/DashboardSwitch';
import DashboardCheckbox from '../components/DashboardCheckbox';
import ConfirmDialog from '../components/ConfirmDialog';
import { FieldLabelWithHelp, FieldTitleWithHelp } from '../components/FieldLabelWithHelp';
import { Footprints, Save, Upload, Clock3 } from 'lucide-react';
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
import { AdminLoadingInline } from '../components/DashboardLoading';
import {
  defaultAvailabilityHours,
  normalizeAvailabilityHours,
  normalizeTimeInput,
  WEEKDAY_KEYS,
  type ShopAvailabilitySlot,
  type WeekdayKey,
} from '../lib/shopAvailability';
import {
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_INPUT,
  DASHBOARD_TEXTAREA,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const FOOTER_DESCRIPTION_MAX = 250;
const EMPTY_FOOTER_DESC: Record<ShopContentLang, string> = { en: '', es: '', ar: '' };

export default function DashboardFooter() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth();
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const [footerEnabled, setFooterEnabled] = useState(false);
  const [footerLogo, setFooterLogo] = useState<string | null>(null);
  const [formDescriptions, setFormDescriptions] = useState<Record<ShopContentLang, string>>(EMPTY_FOOTER_DESC);
  const [availabilityEnabled, setAvailabilityEnabled] = useState(false);
  const [availability24Hours, setAvailability24Hours] = useState(false);
  const [availabilityHours, setAvailabilityHours] = useState<ShopAvailabilitySlot[]>(defaultAvailabilityHours());
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [error, setError] = useState('');
  const [toggleConfirm, setToggleConfirm] = useState<boolean | null>(null);
  const [availabilityToggleConfirm, setAvailabilityToggleConfirm] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFooterEnabled(user.footerEnabled ?? false);
      setFooterLogo(user.footerLogo ?? null);
      setFormDescriptions({
        en: user.footerDescription ?? '',
        es: user.footerDescriptionEs ?? '',
        ar: user.footerDescriptionAr ?? '',
      });
      setFormLang('en');
      setAvailabilityEnabled(user.availabilityEnabled ?? false);
      setAvailability24Hours(user.availability24Hours ?? false);
      setAvailabilityHours(normalizeAvailabilityHours(user.availabilityHours as ShopAvailabilitySlot[] | undefined));
    }
  }, [user]);

  function updateDay(day: WeekdayKey, patch: Partial<ShopAvailabilitySlot>) {
    setAvailabilityHours((prev) => prev.map((s) => (s.day === day ? { ...s, ...patch } : s)));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getStoredToken();
    if (!token) return;
    setLogoUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('type', 'logo');
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
      setFooterLogo(data.url);
      toast.success(t('dashboard.footer.toastLogo'));
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (footerEnabled) {
      if (!footerLogo) {
        setError(t('dashboard.footer.errLogo'));
        return;
      }
      if (!user?.shopName?.trim()) {
        setError(t('dashboard.footer.errTitle'));
        return;
      }
      if (!formDescriptions.en.trim()) {
        setError(t('dashboard.footer.errDesc'));
        return;
      }
      if (availabilityEnabled && !availabilityHours.some((s) => s.enabled)) {
        setError(t('dashboard.footer.errAvailabilityDay'));
        return;
      }
    }
    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          footerEnabled,
          footerLogo: footerLogo ?? undefined,
          footerDescription: formDescriptions.en.trim(),
          footerDescriptionEs: formDescriptions.es.trim() || undefined,
          footerDescriptionAr: formDescriptions.ar.trim() || undefined,
          availabilityEnabled: footerEnabled ? availabilityEnabled : false,
          availability24Hours: footerEnabled && availabilityEnabled ? availability24Hours : false,
          availabilityHours: footerEnabled
            ? availabilityHours.map((s) => ({
                ...s,
                openTime: normalizeTimeInput(s.openTime, s.openTime),
                closeTime: normalizeTimeInput(s.closeTime, s.closeTime),
              }))
            : [],
        },
      });
      await fetchUser();
      toast.success(t('dashboard.footer.toastSaved'));
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
    en: Boolean(formDescriptions.en.trim()),
    es: Boolean(formDescriptions.es.trim()),
    ar: Boolean(formDescriptions.ar.trim()),
  };

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
          <Footprints className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
            {t('dashboard.footer.section')}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
          {t('dashboard.footer.title')}
        </h1>
        <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">
          {t('dashboard.footer.subtitle')}
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
                  title={t('dashboard.footer.toggleTitle')}
                  help={t('dashboard.footer.toggleHint')}
                  titleClassName="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200"
                />
              </div>
              <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                <DashboardSwitch checked={footerEnabled} onCheckedChange={(next) => setToggleConfirm(next)} />
              </div>
            </div>
          </div>

          {footerEnabled && (
            <div className="p-4 max-lg:p-4 lg:p-6 space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0">
              <SharedLockedField locked={sharedLocked} className="min-w-0">
              <div className="min-w-0">
                <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200 mb-2">
                  {t('dashboard.footer.logo')}
                  {isSharedFieldRequired(multilingualEnabled, formLang) ? (
                    <span className="text-red-500"> *</span>
                  ) : null}
                </label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} className="hidden" />
                <div className="flex flex-col gap-3 max-lg:gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                  {(footerLogo || logoUploading) && (
                    <div className="shrink-0 self-start">
                      {logoUploading ? (
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 flex items-center justify-center">
                          <AdminLoadingInline dotsOnly />
                        </div>
                      ) : footerLogo ? (
                        <img src={footerLogo} alt="" className="w-16 h-16 object-contain rounded-xl border border-stone-200 dark:border-zinc-700" />
                      ) : null}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoUploading || sharedLocked}
                    className={`${DASHBOARD_BTN_OUTLINE} w-full sm:w-auto justify-center border-dashed max-lg:py-2.5 max-lg:text-sm`}
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    {footerLogo ? t('dashboard.footer.changeLogo') : t('dashboard.footer.uploadLogo')}
                  </button>
                </div>
              </div>
              </SharedLockedField>
              <div className="min-w-0">
                <FieldLabelWithHelp help={t('dashboard.footer.titleHint')} className="mb-2" labelClassName="text-xs max-lg:text-xs lg:text-sm">
                  {t('dashboard.footer.titleLabel')}
                </FieldLabelWithHelp>
                <input
                  type="text"
                  readOnly
                  value={user?.shopName ?? ''}
                  className={`${DASHBOARD_INPUT} cursor-not-allowed bg-stone-100/80 dark:bg-zinc-800/80 text-stone-700 dark:text-zinc-300 focus:border-stone-200 dark:focus:border-zinc-700 focus:ring-0`}
                  aria-readonly="true"
                />
              </div>
              {multilingualEnabled ? (
                <ContentLanguagePicker
                  label={t('dashboard.footer.langLabel')}
                  hint={t('dashboard.footer.langHint')}
                  value={formLang}
                  onChange={setFormLang}
                  filled={formLangFilled}
                  languages={contentLanguages}
                  className="mb-1"
                />
              ) : null}
              <div className="min-w-0">
                <FieldLabelWithHelp
                  required={isContentFieldRequired(multilingualEnabled, formLang)}
                  help={t('dashboard.footer.descHint')}
                  className="mb-2"
                  labelClassName="text-xs max-lg:text-xs lg:text-sm"
                >
                  {multilingualEnabled
                    ? `${t('dashboard.footer.description')} (${activeFormLang.label})`
                    : t('dashboard.footer.description')}
                </FieldLabelWithHelp>
                <textarea
                  value={formDescriptions[formLang]}
                  onChange={(e) =>
                    setFormDescriptions((prev) => ({
                      ...prev,
                      [formLang]: e.target.value.slice(0, FOOTER_DESCRIPTION_MAX),
                    }))
                  }
                  dir={activeFormLang.dir}
                  placeholder={t('dashboard.footer.descPh')}
                  rows={5}
                  maxLength={FOOTER_DESCRIPTION_MAX}
                  className={`${DASHBOARD_TEXTAREA} min-h-[7.5rem] max-h-48`}
                />
                <p className="mt-1 text-right text-[10px] max-lg:text-[10px] lg:text-xs text-stone-500 dark:text-zinc-500 tabular-nums">
                  {formDescriptions[formLang].length}/{FOOTER_DESCRIPTION_MAX}
                </p>
              </div>

              <SharedLockedField locked={sharedLocked}>
              <div className="rounded-lg max-lg:rounded-lg lg:rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/40 dark:bg-zinc-950/40 p-3 max-lg:p-3 sm:p-4 lg:p-5 space-y-3 max-lg:space-y-3 lg:space-y-4 min-w-0">
                <div className={DASHBOARD_TOGGLE_ROW}>
                  <div className={`${DASHBOARD_TOGGLE_ROW_LABEL} flex items-center gap-2`}>
                    <Clock3 className="h-4 w-4 text-brand-600 shrink-0" aria-hidden />
                    <FieldTitleWithHelp
                      title={t('dashboard.footer.availabilityTitle')}
                      help={t('dashboard.footer.availabilityHint')}
                      titleClassName="text-sm max-lg:text-sm lg:text-base"
                    />
                  </div>
                  <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                    <DashboardSwitch checked={availabilityEnabled} disabled={sharedLocked} onCheckedChange={setAvailabilityToggleConfirm} />
                  </div>
                </div>

                {availabilityEnabled ? (
                  <>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        disabled={sharedLocked}
                        onClick={() => setAvailability24Hours(false)}
                        className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                          !availability24Hours
                            ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-300'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600'
                        } disabled:opacity-60`}
                      >
                        {t('dashboard.footer.availabilityCustomHours')}
                      </button>
                      <button
                        type="button"
                        disabled={sharedLocked}
                        onClick={() => setAvailability24Hours(true)}
                        className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                          availability24Hours
                            ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-300'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600'
                        } disabled:opacity-60`}
                      >
                        {t('dashboard.footer.availability24Hours')}
                      </button>
                    </div>
                  <ul className="space-y-2 min-w-0">
                    {WEEKDAY_KEYS.map((day) => {
                      const slot = availabilityHours.find((s) => s.day === day)!;
                      return (
                        <li
                          key={day}
                          className="rounded-lg border border-stone-200/90 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900 min-w-0"
                        >
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <DashboardCheckbox
                              checked={slot.enabled}
                              disabled={sharedLocked}
                              onChange={(next) => updateDay(day, { enabled: next })}
                              label={
                                <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200">
                                  {t(`dashboard.footer.days.${day}`)}
                                </span>
                              }
                              className="min-w-0 w-full shrink-0 sm:min-w-[7.5rem] sm:w-auto"
                            />
                            {slot.enabled ? (
                              availability24Hours ? (
                                <span className="text-xs sm:text-sm font-medium text-stone-600 dark:text-zinc-400 max-sm:pl-7 sm:pl-0">
                                  {t('dashboard.footer.availability24HoursDay')}
                                </span>
                              ) : (
                              <div className="flex min-w-0 w-full items-center gap-1.5 sm:gap-2 max-sm:pl-7 sm:min-w-0 sm:flex-1 sm:pl-0">
                                <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-zinc-500 shrink-0">
                                  {t('dashboard.footer.availabilityFrom')}
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  placeholder="09:00"
                                  maxLength={5}
                                  value={slot.openTime}
                                  readOnly={sharedLocked}
                                  onChange={(e) => updateDay(day, { openTime: e.target.value })}
                                  onBlur={(e) => updateDay(day, { openTime: normalizeTimeInput(e.target.value, slot.openTime) })}
                                  className={sharedLockedInputClass(sharedLocked, `${DASHBOARD_INPUT} dashboard-time-input !py-2 !px-2 text-xs sm:text-sm tabular-nums min-w-0 w-[4.25rem] max-sm:flex-1 max-sm:max-w-[5.5rem] sm:w-[5.5rem] sm:shrink-0`)}
                                />
                                <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-zinc-500 shrink-0">
                                  {t('dashboard.footer.availabilityTo')}
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  placeholder="18:00"
                                  maxLength={5}
                                  value={slot.closeTime}
                                  readOnly={sharedLocked}
                                  onChange={(e) => updateDay(day, { closeTime: e.target.value })}
                                  onBlur={(e) => updateDay(day, { closeTime: normalizeTimeInput(e.target.value, slot.closeTime) })}
                                  className={sharedLockedInputClass(sharedLocked, `${DASHBOARD_INPUT} dashboard-time-input !py-2 !px-2 text-xs sm:text-sm tabular-nums min-w-0 w-[4.25rem] max-sm:flex-1 max-sm:max-w-[5.5rem] sm:w-[5.5rem] sm:shrink-0`)}
                                />
                              </div>
                              )
                            ) : (
                              <span className="text-xs sm:text-sm text-stone-400 dark:text-zinc-500 max-sm:pl-7 sm:pl-0 sm:shrink-0">
                                {t('dashboard.footer.availabilityClosed')}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  </>
                ) : null}
              </div>
              </SharedLockedField>
            </div>
          )}
        </div>

        {footerEnabled && (
          <div className="flex justify-center min-w-0 px-0">
            <button
              type="submit"
              disabled={saving}
              className={`${DASHBOARD_BTN_PRIMARY} w-full max-w-md max-lg:py-3 lg:w-auto lg:px-8 lg:py-3.5 disabled:opacity-60`}
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : <Save className="w-5 h-5 shrink-0" aria-hidden />}
              {saving ? t('dashboard.common.saving') : t('dashboard.footer.save')}
            </button>
          </div>
        )}
      </form>

      <ConfirmDialog
        open={toggleConfirm !== null}
        title={toggleConfirm ? t('dashboard.footer.enableTitle') : t('dashboard.footer.disableTitle')}
        message={
          toggleConfirm
            ? t('dashboard.footer.enableMsg')
            : t('dashboard.footer.disableMsg')
        }
        confirmLabel={toggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (toggleConfirm !== null) {
            setFooterEnabled(toggleConfirm);
            toast.success(toggleConfirm ? t('dashboard.footer.toastEnabled') : t('dashboard.footer.toastDisabled'));
            setToggleConfirm(null);
          }
        }}
        onCancel={() => setToggleConfirm(null)}
      />
      <ConfirmDialog
        open={availabilityToggleConfirm !== null}
        title={
          availabilityToggleConfirm
            ? t('dashboard.footer.enableAvailabilityTitle')
            : t('dashboard.footer.disableAvailabilityTitle')
        }
        message={
          availabilityToggleConfirm
            ? t('dashboard.footer.enableAvailabilityMsg')
            : t('dashboard.footer.disableAvailabilityMsg')
        }
        confirmLabel={availabilityToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (availabilityToggleConfirm !== null) {
            setAvailabilityEnabled(availabilityToggleConfirm);
            setAvailabilityToggleConfirm(null);
          }
        }}
        onCancel={() => setAvailabilityToggleConfirm(null)}
      />
    </DashboardLayout>
  );
}
