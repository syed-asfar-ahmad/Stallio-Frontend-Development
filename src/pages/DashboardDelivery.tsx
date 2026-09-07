import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { MoreHorizontal, Save, Banknote, BadgePercent, Clock3, StickyNote, Megaphone, Plus, Trash2, RotateCcw } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { isContentFieldRequired } from '../lib/shopContentLanguages';
import { normalizeShopRichTextHtml } from '../lib/prepareShopAboutHtml';
import DashboardLayout from '../components/DashboardLayout';
import { AdminLoadingInline } from '../components/DashboardLoading';
import DashboardSwitch from '../components/DashboardSwitch';
import ConfirmDialog from '../components/ConfirmDialog';
import FieldHelpButton from '../components/FieldHelpButton';
import { FieldLabelWithHelp, FieldTitleWithHelp } from '../components/FieldLabelWithHelp';
import ContentLanguagePicker from '../components/ContentLanguagePicker';
import { SHOP_CONTENT_LANGUAGES, type ShopContentLang } from '../lib/shopContentLanguages';
import { useSellerContentLanguages, useSellerMultilingualEnabled } from '../hooks/useSellerContentLanguages';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_INPUT,
  DASHBOARD_NUMBER_INPUT,
  DASHBOARD_TEXTAREA,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';

type DeliveryType = 'fixed' | 'free';

const EMPTY_ANNOUNCEMENTS: Record<ShopContentLang, string[]> = { en: [], es: [], ar: [] };
const EMPTY_CHECKOUT_NOTES: Record<ShopContentLang, string> = { en: '', es: '', ar: '' };
const EMPTY_REFUND_CONTENT: Record<ShopContentLang, string> = { en: '', es: '', ar: '' };

function parseAnnouncementLines(text: string | undefined | null): string[] {
  const lines = (text ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  return lines;
}

export default function DashboardDelivery() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth();
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [announcementLang, setAnnouncementLang] = useState<ShopContentLang>('en');
  const [checkoutNoteLang, setCheckoutNoteLang] = useState<ShopContentLang>('en');
  const currencyCode = user?.currency?.trim() || t('dashboard.delivery.currencyFallback');
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('fixed');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [deliveryEta, setDeliveryEta] = useState('');
  const [formCheckoutNotes, setFormCheckoutNotes] = useState<Record<ShopContentLang, string>>(EMPTY_CHECKOUT_NOTES);
  const [deliveryCodEnabled, setDeliveryCodEnabled] = useState(false);
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [formAnnouncements, setFormAnnouncements] = useState<Record<ShopContentLang, string[]>>(EMPTY_ANNOUNCEMENTS);
  const [shopLangEsEnabled, setShopLangEsEnabled] = useState(false);
  const [shopLangArEnabled, setShopLangArEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [announcementToggleConfirm, setAnnouncementToggleConfirm] = useState<boolean | null>(null);
  const [deliveryToggleConfirm, setDeliveryToggleConfirm] = useState<boolean | null>(null);
  const [codToggleConfirm, setCodToggleConfirm] = useState<boolean | null>(null);
  const [langEsToggleConfirm, setLangEsToggleConfirm] = useState<boolean | null>(null);
  const [langArToggleConfirm, setLangArToggleConfirm] = useState<boolean | null>(null);
  const [refundEnabled, setRefundEnabled] = useState(false);
  const [refundLang, setRefundLang] = useState<ShopContentLang>('en');
  const [formRefundContents, setFormRefundContents] = useState<Record<ShopContentLang, string>>(EMPTY_REFUND_CONTENT);
  const [refundToggleConfirm, setRefundToggleConfirm] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    setDeliveryEnabled(Boolean(user.deliveryEnabled));
    setDeliveryType((user.deliveryType as DeliveryType) ?? 'fixed');
    setDeliveryFee(
      typeof user.deliveryFee === 'number' && Number.isFinite(user.deliveryFee) ? String(user.deliveryFee) : ''
    );
    setFreeDeliveryThreshold(
      typeof user.freeDeliveryThreshold === 'number' && Number.isFinite(user.freeDeliveryThreshold)
        ? String(user.freeDeliveryThreshold)
        : ''
    );
    setDeliveryEta(user.deliveryEta ?? '');
    setFormCheckoutNotes({
      en: user.deliveryNote ?? '',
      es: user.deliveryNoteEs ?? '',
      ar: user.deliveryNoteAr ?? '',
    });
    setCheckoutNoteLang('en');
    setDeliveryCodEnabled(Boolean(user.deliveryCodEnabled));
    setAnnouncementEnabled(Boolean(user.announcementEnabled));
    setFormAnnouncements({
      en: parseAnnouncementLines(user.announcementText),
      es: parseAnnouncementLines(user.announcementTextEs),
      ar: parseAnnouncementLines(user.announcementTextAr),
    });
    setAnnouncementLang('en');
    setShopLangEsEnabled(Boolean(user.shopLangEsEnabled));
    setShopLangArEnabled(Boolean(user.shopLangArEnabled));
    setRefundEnabled(Boolean(user.refundEnabled));
    setFormRefundContents({
      en: user.refundContent ?? '',
      es: user.refundContentEs ?? '',
      ar: user.refundContentAr ?? '',
    });
    setRefundLang('en');
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const fee = Number(deliveryFee);
    const threshold = Number(freeDeliveryThreshold);

    if (deliveryEnabled && (!Number.isFinite(fee) || fee < 0)) {
      setError(t('dashboard.delivery.errFee'));
      return;
    }
    if (deliveryEnabled && deliveryType === 'free' && freeDeliveryThreshold.trim() && (!Number.isFinite(threshold) || threshold < 0)) {
      setError(t('dashboard.delivery.errThreshold'));
      return;
    }
    if (refundEnabled && !formRefundContents.en.trim()) {
      setError(t('dashboard.refund.errPolicy'));
      return;
    }

    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          deliveryEnabled,
          deliveryType,
          deliveryFee: deliveryEnabled ? fee : 0,
          freeDeliveryThreshold:
            deliveryEnabled && deliveryType === 'free' && freeDeliveryThreshold.trim()
              ? threshold
              : null,
          deliveryEta: deliveryEta.trim(),
          deliveryNote: formCheckoutNotes.en.trim(),
          deliveryNoteEs: formCheckoutNotes.es.trim() || undefined,
          deliveryNoteAr: formCheckoutNotes.ar.trim() || undefined,
          deliveryCodEnabled,
          announcementEnabled,
          announcementText: formAnnouncements.en.map((a) => a.trim()).filter(Boolean).join('\n'),
          announcementTextEs: formAnnouncements.es.length
            ? formAnnouncements.es.map((a) => a.trim()).filter(Boolean).join('\n')
            : undefined,
          announcementTextAr: formAnnouncements.ar.length
            ? formAnnouncements.ar.map((a) => a.trim()).filter(Boolean).join('\n')
            : undefined,
          shopLangEsEnabled,
          shopLangArEnabled,
          refundEnabled,
          refundContent: normalizeShopRichTextHtml(formRefundContents.en),
          refundContentEs: formRefundContents.es.trim() ? normalizeShopRichTextHtml(formRefundContents.es) : undefined,
          refundContentAr: formRefundContents.ar.trim() ? normalizeShopRichTextHtml(formRefundContents.ar) : undefined,
        },
      });
      await fetchUser();
      toast.success(t('dashboard.delivery.toastSaved'));
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const activeAnnouncementLang =
    contentLangMeta.find((l) => l.id === announcementLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const activeCheckoutNoteLang =
    contentLangMeta.find((l) => l.id === checkoutNoteLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const announcements = formAnnouncements[announcementLang] ?? [];
  const announcementLangFilled = {
    en: formAnnouncements.en.some((a) => a.trim()),
    es: formAnnouncements.es.some((a) => a.trim()),
    ar: formAnnouncements.ar.some((a) => a.trim()),
  };
  const checkoutNoteLangFilled = {
    en: Boolean(formCheckoutNotes.en.trim()),
    es: Boolean(formCheckoutNotes.es.trim()),
    ar: Boolean(formCheckoutNotes.ar.trim()),
  };
  const activeRefundLang =
    contentLangMeta.find((l) => l.id === refundLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const refundLangFilled = {
    en: Boolean(formRefundContents.en.trim()),
    es: Boolean(formRefundContents.es.trim()),
    ar: Boolean(formRefundContents.ar.trim()),
  };

  const patchAnnouncements = (updater: (prev: string[]) => string[]) => {
    setFormAnnouncements((prev) => ({ ...prev, [announcementLang]: updater(prev[announcementLang] ?? []) }));
  };

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
          <MoreHorizontal className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
            {t('dashboard.delivery.section')}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
          {t('dashboard.delivery.title')}
        </h1>
        <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">
          {t('dashboard.delivery.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSave} className="w-full space-y-8 max-lg:space-y-8 lg:space-y-10 min-w-0">
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 px-4 py-3 text-red-700 dark:text-red-300 text-xs max-lg:text-xs lg:text-sm font-medium">
            {error}
          </div>
        )}

        <section className="space-y-3 max-lg:space-y-3 lg:space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight">{t('dashboard.delivery.shopLanguages')}</h2>
            <FieldHelpButton text={t('dashboard.delivery.shopLanguagesHint')} />
          </div>
          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm divide-y divide-stone-100 dark:divide-zinc-800 min-w-0">
            <div className={`${DASHBOARD_TOGGLE_ROW} p-4 max-lg:p-4 sm:p-5 lg:p-6 opacity-80`}>
              <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                <FieldTitleWithHelp
                  title={t('dashboard.delivery.langEnglish')}
                  help={t('dashboard.delivery.langEnglishHint')}
                />
              </div>
              <span className={`${DASHBOARD_TOGGLE_ROW_SWITCH} inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-stone-600 dark:bg-zinc-800 dark:text-zinc-300`}>
                EN
              </span>
            </div>
            <div className={`${DASHBOARD_TOGGLE_ROW} p-4 max-lg:p-4 sm:p-5 lg:p-6`}>
              <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                <FieldTitleWithHelp
                  title={t('dashboard.delivery.langSpanish')}
                  help={t('dashboard.delivery.langSpanishHint')}
                />
              </div>
              <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                <DashboardSwitch checked={shopLangEsEnabled} onCheckedChange={setLangEsToggleConfirm} />
              </div>
            </div>
            <div className={`${DASHBOARD_TOGGLE_ROW} p-4 max-lg:p-4 sm:p-5 lg:p-6`}>
              <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                <FieldTitleWithHelp
                  title={t('dashboard.delivery.langArabic')}
                  help={t('dashboard.delivery.langArabicHint')}
                />
              </div>
              <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                <DashboardSwitch checked={shopLangArEnabled} onCheckedChange={setLangArToggleConfirm} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 max-lg:space-y-3 lg:space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight">{t('dashboard.delivery.announcement')}</h2>
            <FieldHelpButton text={t('dashboard.delivery.announcementHint')} />
          </div>
          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 max-lg:p-4 sm:p-5 lg:p-6 min-w-0">
            <div className={DASHBOARD_TOGGLE_ROW}>
              <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                <FieldTitleWithHelp title={t('dashboard.delivery.showBar')} help={t('dashboard.delivery.showBarHint')} />
              </div>
              <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                <DashboardSwitch checked={announcementEnabled} onCheckedChange={setAnnouncementToggleConfirm} />
              </div>
            </div>
          </div>

          {announcementEnabled && (
            <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 max-lg:p-4 sm:p-5 lg:p-6 space-y-3 min-w-0">
              {multilingualEnabled ? (
                <ContentLanguagePicker
                  label={t('dashboard.delivery.announcementLangLabel')}
                  hint={t('dashboard.delivery.announcementLangHint')}
                  value={announcementLang}
                  onChange={setAnnouncementLang}
                  filled={announcementLangFilled}
                  languages={contentLanguages}
                  className="mb-2"
                />
              ) : null}
              {announcements.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 p-6 text-center">
                  <Megaphone className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <FieldTitleWithHelp
                    title={t('dashboard.delivery.noAnnouncements')}
                    help={t('dashboard.delivery.noAnnouncementsHint')}
                    titleClassName="text-stone-500 dark:text-zinc-400 text-sm font-medium"
                    className="justify-center"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {announcements.map((text, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500 pointer-events-none" />
                        <input
                          type="text"
                          value={text}
                          dir={activeAnnouncementLang.dir}
                          onChange={(e) =>
                            patchAnnouncements((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))
                          }
                          placeholder={t('dashboard.delivery.announcePh')}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => patchAnnouncements((prev) => prev.filter((_, j) => j !== i))}
                        className="p-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/40 shrink-0"
                        aria-label={t('dashboard.delivery.removeAnnouncement')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => patchAnnouncements((prev) => [...prev, ''])}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 text-stone-500 dark:text-zinc-400 text-sm font-semibold hover:border-brand-200 dark:hover:border-brand-600/45 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> {t('dashboard.delivery.addAnnouncement')}
              </button>
            </div>
          )}
        </section>

        <section className="space-y-3 max-lg:space-y-3 lg:space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight">{t('dashboard.delivery.deliveryCharges')}</h2>
            <FieldHelpButton text={t('dashboard.delivery.deliveryChargesHint')} />
          </div>
          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 max-lg:p-4 sm:p-5 lg:p-6 min-w-0">
            <div className={DASHBOARD_TOGGLE_ROW}>
              <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                <FieldTitleWithHelp
                  title={t('dashboard.delivery.enableCharges')}
                  help={t('dashboard.delivery.enableChargesHint')}
                />
              </div>
              <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                <DashboardSwitch checked={deliveryEnabled} onCheckedChange={setDeliveryToggleConfirm} />
              </div>
            </div>
          </div>

          {deliveryEnabled && (
            <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 max-lg:p-4 sm:p-5 lg:p-6 space-y-4 max-lg:space-y-4 lg:space-y-5 min-w-0">
              <div>
                <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-2">{t('dashboard.delivery.deliveryMode')}</label>
                <div className="flex w-full max-w-full sm:inline-flex rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 p-1">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('fixed')}
                    className={`flex-1 sm:flex-none px-3 max-lg:px-3 lg:px-4 py-2 rounded-lg text-xs max-lg:text-xs lg:text-sm font-semibold ${
                      deliveryType === 'fixed' ? 'bg-white dark:bg-zinc-900 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {t('dashboard.delivery.modeFixed')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('free')}
                    className={`flex-1 sm:flex-none px-3 max-lg:px-3 lg:px-4 py-2 rounded-lg text-xs max-lg:text-xs lg:text-sm font-semibold ${
                      deliveryType === 'free' ? 'bg-white dark:bg-zinc-900 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {t('dashboard.delivery.modeFreeAbove')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-lg:gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">{t('dashboard.delivery.deliveryFee')}</label>
                  <div className="relative">
                    <Banknote className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className={`${DASHBOARD_NUMBER_INPUT} h-11 pl-9 pr-24 py-0`}
                      placeholder={t('dashboard.delivery.feePh')}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 text-xs font-semibold">
                      {currencyCode}
                    </span>
                  </div>
                </div>

                {deliveryType === 'free' && (
                  <div>
                    <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">{t('dashboard.delivery.freeAbove')}</label>
                    <div className="relative">
                      <BadgePercent className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={freeDeliveryThreshold}
                        onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                        className={`${DASHBOARD_NUMBER_INPUT} h-11 pl-9 pr-3 py-0`}
                        placeholder={t('dashboard.delivery.freeAbovePh')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 max-lg:p-4 sm:p-5 lg:p-6 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-lg:gap-4 md:gap-6">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300">
                  {t('dashboard.delivery.eta')}
                </label>
                <div className="relative">
                  <Clock3 className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={deliveryEta}
                    onChange={(e) => setDeliveryEta(e.target.value)}
                    className={`${DASHBOARD_INPUT} h-11 pl-9 py-0`}
                    placeholder={t('dashboard.delivery.etaPh')}
                  />
                </div>
              </div>
              <div className={`${DASHBOARD_TOGGLE_ROW} rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 px-4 py-3 min-h-[2.75rem] self-end`}>
                <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                  <p className="text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300">{t('dashboard.delivery.cod')}</p>
                  <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    {deliveryCodEnabled ? t('dashboard.delivery.codOn') : t('dashboard.delivery.codOff')}
                  </p>
                </div>
                <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                  <DashboardSwitch
                    checked={deliveryCodEnabled}
                    onCheckedChange={setCodToggleConfirm}
                    activeClassName="border-brand-500 bg-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 max-lg:space-y-3 lg:space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight">{t('dashboard.delivery.checkout')}</h2>
            <FieldHelpButton text={t('dashboard.delivery.checkoutHint')} />
          </div>
          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 max-lg:p-4 sm:p-5 lg:p-6 space-y-5 max-lg:space-y-5 min-w-0">
            {multilingualEnabled ? (
              <ContentLanguagePicker
                label={t('dashboard.delivery.checkoutLangLabel')}
                hint={t('dashboard.delivery.checkoutLangHint')}
                value={checkoutNoteLang}
                onChange={setCheckoutNoteLang}
                filled={checkoutNoteLangFilled}
                languages={contentLanguages}
              />
            ) : null}
            <div>
              <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-2">
                {multilingualEnabled
                  ? `${t('dashboard.delivery.noteLabel')} (${activeCheckoutNoteLang.label})`
                  : t('dashboard.delivery.noteLabel')}
              </label>
              <div className="relative">
                <StickyNote className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute start-3 top-3.5" />
                <textarea
                  rows={2}
                  dir={activeCheckoutNoteLang.dir}
                  value={formCheckoutNotes[checkoutNoteLang]}
                  onChange={(e) =>
                    setFormCheckoutNotes((prev) => ({ ...prev, [checkoutNoteLang]: e.target.value }))
                  }
                  className={`${DASHBOARD_TEXTAREA} ps-9`}
                  placeholder={t('dashboard.delivery.notePh')}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 max-lg:space-y-3 lg:space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
            <h2 className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
              {t('dashboard.refund.title')}
            </h2>
            <FieldHelpButton text={t('dashboard.refund.subtitle')} />
          </div>
          <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm min-w-0 overflow-visible">
            <div className="p-4 max-lg:p-4 sm:p-5 lg:p-6 border-b border-stone-100 dark:border-zinc-800">
              <div className={DASHBOARD_TOGGLE_ROW}>
                <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                  <FieldTitleWithHelp
                    title={t('dashboard.refund.toggleTitle')}
                    help={t('dashboard.refund.toggleHint')}
                  />
                </div>
                <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                  <DashboardSwitch checked={refundEnabled} onCheckedChange={setRefundToggleConfirm} />
                </div>
              </div>
            </div>
            {refundEnabled ? (
              <div className="p-4 max-lg:p-4 sm:p-5 lg:p-6 space-y-4 max-lg:space-y-4 min-w-0">
                {multilingualEnabled ? (
                  <ContentLanguagePicker
                    label={t('dashboard.refund.langLabel')}
                    hint={t('dashboard.refund.langHint')}
                    value={refundLang}
                    onChange={setRefundLang}
                    filled={refundLangFilled}
                    languages={contentLanguages}
                  />
                ) : null}
                <div>
                  <FieldLabelWithHelp required={isContentFieldRequired(multilingualEnabled, refundLang)} className="mb-2">
                    {multilingualEnabled
                      ? `${t('dashboard.refund.policy')} (${activeRefundLang.label})`
                      : t('dashboard.refund.policy')}
                  </FieldLabelWithHelp>
                  <RichTextEditor
                    value={formRefundContents[refundLang]}
                    onChange={(value) => setFormRefundContents((prev) => ({ ...prev, [refundLang]: value }))}
                    placeholder={t('dashboard.refund.policyPh')}
                    minHeight="12rem"
                    dir={activeRefundLang.dir ?? 'ltr'}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="flex justify-center min-w-0 px-0">
          <button
            type="submit"
            disabled={saving}
            className={`${DASHBOARD_BTN_PRIMARY} w-full max-w-md max-lg:py-3 lg:w-auto lg:px-8 lg:py-3.5`}
          >
            {saving ? <AdminLoadingInline light dotsOnly /> : <Save className="w-5 h-5 shrink-0" aria-hidden />}
            {saving ? t('dashboard.common.saving') : t('dashboard.delivery.save')}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={announcementToggleConfirm !== null}
        title={
          announcementToggleConfirm
            ? t('dashboard.delivery.enableAnnouncementTitle')
            : t('dashboard.delivery.disableAnnouncementTitle')
        }
        message={
          announcementToggleConfirm
            ? t('dashboard.delivery.enableAnnouncementMsg')
            : t('dashboard.delivery.disableAnnouncementMsg')
        }
        confirmLabel={announcementToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (announcementToggleConfirm !== null) {
            setAnnouncementEnabled(announcementToggleConfirm);
            setAnnouncementToggleConfirm(null);
          }
        }}
        onCancel={() => setAnnouncementToggleConfirm(null)}
      />
      <ConfirmDialog
        open={deliveryToggleConfirm !== null}
        title={
          deliveryToggleConfirm
            ? t('dashboard.delivery.enableDeliveryTitle')
            : t('dashboard.delivery.disableDeliveryTitle')
        }
        message={
          deliveryToggleConfirm
            ? t('dashboard.delivery.enableDeliveryMsg')
            : t('dashboard.delivery.disableDeliveryMsg')
        }
        confirmLabel={deliveryToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (deliveryToggleConfirm !== null) {
            setDeliveryEnabled(deliveryToggleConfirm);
            setDeliveryToggleConfirm(null);
          }
        }}
        onCancel={() => setDeliveryToggleConfirm(null)}
      />
      <ConfirmDialog
        open={codToggleConfirm !== null}
        title={codToggleConfirm ? t('dashboard.delivery.enableCodTitle') : t('dashboard.delivery.disableCodTitle')}
        message={codToggleConfirm ? t('dashboard.delivery.enableCodMsg') : t('dashboard.delivery.disableCodMsg')}
        confirmLabel={codToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (codToggleConfirm !== null) {
            setDeliveryCodEnabled(codToggleConfirm);
            setCodToggleConfirm(null);
          }
        }}
        onCancel={() => setCodToggleConfirm(null)}
      />
      <ConfirmDialog
        open={langEsToggleConfirm !== null}
        title={
          langEsToggleConfirm
            ? t('dashboard.delivery.enableLangSpanishTitle')
            : t('dashboard.delivery.disableLangSpanishTitle')
        }
        message={
          langEsToggleConfirm
            ? t('dashboard.delivery.enableLangSpanishMsg')
            : t('dashboard.delivery.disableLangSpanishMsg')
        }
        confirmLabel={langEsToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (langEsToggleConfirm !== null) {
            setShopLangEsEnabled(langEsToggleConfirm);
            setLangEsToggleConfirm(null);
          }
        }}
        onCancel={() => setLangEsToggleConfirm(null)}
      />
      <ConfirmDialog
        open={refundToggleConfirm !== null}
        title={refundToggleConfirm ? t('dashboard.refund.enableTitle') : t('dashboard.refund.disableTitle')}
        message={refundToggleConfirm ? t('dashboard.refund.enableMsg') : t('dashboard.refund.disableMsg')}
        confirmLabel={refundToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (refundToggleConfirm !== null) {
            setRefundEnabled(refundToggleConfirm);
            setRefundToggleConfirm(null);
          }
        }}
        onCancel={() => setRefundToggleConfirm(null)}
      />
      <ConfirmDialog
        open={langArToggleConfirm !== null}
        title={
          langArToggleConfirm
            ? t('dashboard.delivery.enableLangArabicTitle')
            : t('dashboard.delivery.disableLangArabicTitle')
        }
        message={
          langArToggleConfirm
            ? t('dashboard.delivery.enableLangArabicMsg')
            : t('dashboard.delivery.disableLangArabicMsg')
        }
        confirmLabel={langArToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (langArToggleConfirm !== null) {
            setShopLangArEnabled(langArToggleConfirm);
            setLangArToggleConfirm(null);
          }
        }}
        onCancel={() => setLangArToggleConfirm(null)}
      />
    </DashboardLayout>
  );
}
