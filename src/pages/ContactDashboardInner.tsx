import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DashboardLoading, { AdminLoadingInline } from '../components/DashboardLoading';
import ConfirmDialog from '../components/ConfirmDialog';
import DashboardBulkSelectBar from '../components/DashboardBulkSelectBar';
import BulkSelectableCard from '../components/BulkSelectableCard';
import BulkItemCheckbox from '../components/BulkItemCheckbox';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useCloseOnOutsideClick } from '../hooks/useCloseOnOutsideClick';
import {
  Mail,
  RefreshCw,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Phone,
  MapPin,
  Plus,
  Save,
  Link2,
  ChevronDown,
  Filter,
  Inbox,
  Clock,
  CircleAlert,
} from 'lucide-react';
import { DASHBOARD_MAIN_SCROLL_ID, scrollOnPaginationChange } from '../lib/scrollDashboardMainToTop';
import {
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_FILTER_SELECT,
  DASHBOARD_ICON_CLOSE_BTN,
  DASHBOARD_INPUT,
  DASHBOARD_TEXTAREA,
} from '../lib/dashboardFormClasses';
import ContentLanguagePicker from '../components/ContentLanguagePicker';
import {
  SHOP_CONTENT_LANGUAGES,
  isContentFieldRequired,
  type ShopContentLang,
} from '../lib/shopContentLanguages';
import { useSellerContentLanguages, useSellerMultilingualEnabled } from '../hooks/useSellerContentLanguages';

const FOOTER_ADDRESS_MAX = 500;
const EMPTY_CONTACT_ADDRESS: Record<ShopContentLang, string> = { en: '', es: '', ar: '' };

const PAGE_SIZE = 10;
const AUTO_REFRESH_MS = 5 * 60 * 1000;

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

type SocialPlatformValue = (typeof SOCIAL_PLATFORM_VALUES)[number];

const SOCIAL_PLATFORM_I18N: Record<SocialPlatformValue, string> = {
  instagram: 'dashboard.contact.platformInstagram',
  tiktok: 'dashboard.contact.platformTiktok',
  facebook: 'dashboard.contact.platformFacebook',
  twitter: 'dashboard.contact.platformTwitter',
  youtube: 'dashboard.contact.platformYoutube',
  linkedin: 'dashboard.contact.platformLinkedin',
  whatsapp: 'dashboard.contact.platformWhatsapp',
  other: 'dashboard.contact.platformOther',
};

type Submission = {
  id: string;
  customerName: string;
  customerEmail: string;
  message: string;
  responded?: boolean;
  createdAt: string;
};
type MessageFilter = 'all' | 'last24h' | 'responded' | 'pending';

export type ContactDashboardMode = 'page' | 'messages';

export function ContactDashboardInner({ mode }: { mode: ContactDashboardMode }) {
  const { t } = useTranslation();
  const isPage = mode === 'page';
  const isMessages = mode === 'messages';
  const { user, fetchUser } = useAuth();
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(isMessages);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);
  const [deleteSubmission, setDeleteSubmission] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const bulk = useBulkSelection();
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const [formAddresses, setFormAddresses] = useState<Record<ShopContentLang, string>>(EMPTY_CONTACT_ADDRESS);
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSocialLinks, setContactSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [savingContact, setSavingContact] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState<number | null>(null);
  const [messageFilter, setMessageFilter] = useState<MessageFilter>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const messageFilterMobileRef = useRef<HTMLDivElement>(null);
  const messageFilterDesktopRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(platformDropdownOpen !== null, () => setPlatformDropdownOpen(null), platformDropdownRef);
  useCloseOnOutsideClick(filterDropdownOpen, () => setFilterDropdownOpen(false), [
    messageFilterMobileRef,
    messageFilterDesktopRef,
  ]);

  const socialPlatforms = useMemo(
    () =>
      SOCIAL_PLATFORM_VALUES.map((value) => ({
        value,
        label: t(SOCIAL_PLATFORM_I18N[value]),
      })),
    [t]
  );

  const messageFilterOptions = useMemo(
    () =>
      (
        [
          ['all', 'dashboard.contact.filterAll'],
          ['last24h', 'dashboard.contact.filter24h'],
          ['responded', 'dashboard.contact.filterResponded'],
          ['pending', 'dashboard.contact.filterPending'],
        ] as const
      ).map(([value, key]) => ({ value: value as MessageFilter, label: t(key) })),
    [t]
  );

  useEffect(() => {
    if (!user || !isPage) return;
    setFormAddresses({
      en: user.footerAddress ?? '',
      es: user.footerAddressEs ?? '',
      ar: user.footerAddressAr ?? '',
    });
    setFormLang('en');
    setContactPhone(user.footerPhone ?? '');
    setContactEmail(user.footerEmail ?? '');
    setContactSocialLinks(user.footerSocialLinks ?? []);
  }, [user, isPage]);

  const load = useCallback(async (opts?: { manual?: boolean }) => {
    if (opts?.manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const data = await api<Submission[]>('/api/contact-submissions');
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
      setSubmissions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isMessages) return;
    void load();
    const interval = setInterval(() => {
      void load();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [isMessages, load]);

  async function handleDelete() {
    if (!deleteSubmission) return;
    setDeleting(true);
    try {
      await api(`/api/contact-submissions/${deleteSubmission.id}`, { method: 'DELETE' });
      setSubmissions((prev) => prev.filter((s) => s.id !== deleteSubmission.id));
      setDeleteSubmission(null);
      toast.success(t('dashboard.contact.toastDeleted'));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteSelected() {
    const ids = Array.from(bulk.selectedIds);
    if (ids.length === 0) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => api(`/api/contact-submissions/${id}`, { method: 'DELETE' }))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      const succeeded = ids.length - failed;
      setSubmissions((prev) => prev.filter((s) => !bulk.selectedIds.has(s.id)));
      bulk.exitSelectionMode();
      setBulkDeleteOpen(false);
      if (succeeded > 0) toast.success(t('dashboard.common.toastDeletedSelected', { count: succeeded }));
      if (failed > 0) {
        const firstErr = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
        toast.error(firstErr?.reason instanceof Error ? firstErr.reason.message : t('dashboard.notifications.loadError'));
      }
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleMarkResponded(s: Submission) {
    if (s.responded) return;
    setMarkingId(s.id);
    try {
      await api(`/api/contact-submissions/${s.id}`, { method: 'PATCH', body: { responded: true } });
      setSubmissions((prev) => prev.map((x) => (x.id === s.id ? { ...x, responded: true } : x)));
      if (viewSubmission?.id === s.id) setViewSubmission((prev) => (prev ? { ...prev, responded: true } : null));
      toast.success(t('dashboard.contact.toastMarked'));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setMarkingId(null);
    }
  }

  function addSocialLink() {
    const used = new Set(contactSocialLinks.map((l) => l.platform));
    const firstAvailable = socialPlatforms.find((p) => !used.has(p.value));
    if (!firstAvailable) {
      toast.error(t('dashboard.contact.toastAllPlatforms'));
      return;
    }
    setContactSocialLinks((prev) => [...prev, { platform: firstAvailable.value, url: '' }]);
  }

  function updateSocialLink(index: number, field: 'platform' | 'url', value: string) {
    setContactSocialLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function removeSocialLink(index: number) {
    setContactSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveContactDetails() {
    setSavingContact(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          footerAddress: formAddresses.en.trim(),
          footerAddressEs: formAddresses.es.trim() || undefined,
          footerAddressAr: formAddresses.ar.trim() || undefined,
          footerPhone: contactPhone.trim(),
          footerEmail: contactEmail.trim(),
          footerSocialLinks: contactSocialLinks
            .filter((l) => l.url.trim())
            .map((l) => ({ platform: l.platform, url: l.url.trim() })),
        },
      });
      await fetchUser();
      toast.success(t('dashboard.contact.toastSaved'));
      setPlatformDropdownOpen(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingContact(false);
    }
  }

  const activeFormLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const formLangFilled = {
    en: Boolean(formAddresses.en.trim()),
    es: Boolean(formAddresses.es.trim()),
    ar: Boolean(formAddresses.ar.trim()),
  };

  const filteredSubmissions = useMemo(() => {
    if (messageFilter === 'all') return submissions;
    if (messageFilter === 'responded') return submissions.filter((s) => Boolean(s.responded));
    if (messageFilter === 'pending') return submissions.filter((s) => !s.responded);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return submissions.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
  }, [submissions, messageFilter]);

  useEffect(() => {
    setPage(1);
  }, [messageFilter]);

  useEffect(() => {
    if (!isMessages || !filterDropdownOpen) return;
    const scrollEl = document.getElementById(DASHBOARD_MAIN_SCROLL_ID);
    const close = () => setFilterDropdownOpen(false);
    scrollEl?.addEventListener('scroll', close, { passive: true });
    window.addEventListener('scroll', close, { passive: true });
    return () => {
      scrollEl?.removeEventListener('scroll', close);
      window.removeEventListener('scroll', close);
    };
  }, [isMessages, filterDropdownOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredSubmissions.slice(start, start + PAGE_SIZE);
  const rangeEnd = filteredSubmissions.length === 0 ? 0 : Math.min(start + pageItems.length, filteredSubmissions.length);
  const selectableIds = useMemo(() => filteredSubmissions.map((s) => s.id), [filteredSubmissions]);

  const messageStats = useMemo(() => {
    const total = submissions.length;
    const responded = submissions.filter((s) => Boolean(s.responded)).length;
    const pending = submissions.filter((s) => !s.responded).length;
    return { total, responded, pending };
  }, [submissions]);

  if (isMessages && loading && submissions.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {isPage && (
        <>
          <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
            <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
              <Mail className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
              <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
                {t('dashboard.contact.pageSection')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
              {t('dashboard.contact.pageTitle')}
            </h1>
            <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">
              {t('dashboard.contact.pageSubtitle')}
            </p>
          </div>

          <div
            className={`rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 max-lg:p-4 sm:p-5 lg:p-6 mb-5 max-lg:mb-5 lg:mb-6 min-w-0 overflow-visible ${
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
                    dir="ltr"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
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
                    dir="ltr"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder={t('dashboard.contact.emailPh')}
                    className={`${DASHBOARD_INPUT} pl-9`}
                  />
                </div>
              </div>
              <div className="md:col-span-2 min-w-0">
                {multilingualEnabled ? (
                  <ContentLanguagePicker
                    label={t('dashboard.about.langLabel')}
                    hint={t('dashboard.about.langHint')}
                    value={formLang}
                    onChange={setFormLang}
                    filled={formLangFilled}
                    languages={contentLanguages}
                    className="mb-3"
                  />
                ) : null}
                <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                  {multilingualEnabled
                    ? `${t('dashboard.contact.address')} (${activeFormLang.label})`
                    : t('dashboard.contact.address')}
                  {isContentFieldRequired(multilingualEnabled, formLang) ? (
                    <span className="text-red-500"> *</span>
                  ) : null}
                </label>
                <div className="relative min-w-0">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-stone-400 dark:text-zinc-500"
                    aria-hidden
                  />
                  <textarea
                    value={formAddresses[formLang]}
                    onChange={(e) =>
                      setFormAddresses((prev) => ({
                        ...prev,
                        [formLang]: e.target.value.slice(0, FOOTER_ADDRESS_MAX),
                      }))
                    }
                    dir={activeFormLang.dir}
                    placeholder={t('dashboard.contact.addressPh')}
                    rows={2}
                    maxLength={FOOTER_ADDRESS_MAX}
                    className={`${DASHBOARD_TEXTAREA} min-h-[5rem] w-full resize-y py-3 pe-4 ps-10`}
                  />
                </div>
                <p className="mt-1 text-right text-[10px] max-lg:text-[10px] lg:text-xs text-stone-500 dark:text-zinc-500 tabular-nums">
                  {formAddresses[formLang].length}/{FOOTER_ADDRESS_MAX}
                </p>
              </div>
            </div>

            <div className="mt-4 max-lg:mt-4 lg:mt-5 min-w-0">
              <div className="flex flex-col gap-2 max-lg:gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                <label className="text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300">
                  {t('dashboard.contact.socialLinks')}
                </label>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className={`${DASHBOARD_BTN_PRIMARY} w-full sm:w-auto max-lg:py-2.5 max-lg:text-sm lg:py-3`}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {t('dashboard.common.add')}
                </button>
              </div>
              <div className="space-y-2 overflow-visible">
                {contactSocialLinks.length === 0 ? (
                  <p className="text-sm text-stone-500 dark:text-zinc-400 bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-700 rounded-xl px-3 py-2.5">
                    {t('dashboard.contact.noSocial')}
                  </p>
                ) : (
                  contactSocialLinks.map((link, index) => {
                    const usedPlatforms = contactSocialLinks.map((l) => l.platform).filter((_, idx) => idx !== index);
                    const availablePlatforms = socialPlatforms.filter(
                      (p) => !usedPlatforms.includes(p.value) || p.value === link.platform
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
                                    updateSocialLink(index, 'platform', p.value);
                                    setPlatformDropdownOpen(null);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                    link.platform === p.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
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
                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            placeholder={t('dashboard.contact.urlPh')}
                            className={`${DASHBOARD_INPUT} pl-9 text-sm max-lg:py-2.5`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
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

          <div className="flex justify-center min-w-0 px-0 max-lg:px-0">
            <button
              type="button"
              onClick={saveContactDetails}
              disabled={savingContact}
              className={`${DASHBOARD_BTN_PRIMARY} w-full max-w-md max-lg:py-3 lg:w-auto lg:px-8 lg:py-3.5 disabled:opacity-60`}
            >
              <Save className="w-5 h-5 shrink-0" aria-hidden />
              {savingContact ? t('dashboard.common.saving') : t('dashboard.contact.saveDetails')}
            </button>
          </div>
        </>
      )}

      {isMessages && (
        <div className="flex min-h-[calc(100dvh-7rem)] flex-col min-w-0 max-w-full">
          <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
            <div className="flex flex-col gap-3 min-w-0 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
                  <Mail className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
                  <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
                    {t('dashboard.contact.messagesSection')}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
                  {t('dashboard.contact.messagesTitle')}
                </h1>
                <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">
                  {t('dashboard.contact.messagesSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void load({ manual: true })}
                disabled={refreshing || loading}
                className={`${DASHBOARD_BTN_OUTLINE} w-full shrink-0 lg:w-auto lg:self-start justify-center disabled:opacity-60`}
                aria-busy={refreshing}
              >
                <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? t('dashboard.common.refreshing') : t('dashboard.common.refresh')}
              </button>
            </div>
          </div>

          <div className="mb-5 max-lg:mb-5 lg:mb-6 space-y-3 max-lg:space-y-3 lg:space-y-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-lg:gap-3 lg:gap-4">
              <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/90 dark:border-zinc-600/90 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-5 shadow-sm ring-1 ring-stone-100/80 dark:ring-zinc-800/80 flex items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
                <span className="flex h-11 w-11 max-lg:h-11 max-lg:w-11 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
                  <Inbox className="w-6 h-6 max-lg:w-6 max-lg:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-stone-900 dark:text-zinc-100 tabular-nums leading-tight">{messageStats.total}</p>
                  <p className="text-xs max-lg:text-xs lg:text-sm font-medium text-stone-500 dark:text-zinc-400">{t('dashboard.contact.statTotal')}</p>
                </div>
              </div>
              <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-brand-200/80 dark:border-brand-800/40 bg-gradient-to-br from-white to-brand-50/50 dark:from-zinc-900 dark:to-brand-950/25 p-4 max-lg:p-4 lg:p-5 shadow-sm dark:shadow-black/20 flex items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
                <span className="flex h-11 w-11 max-lg:h-11 max-lg:w-11 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-brand-100 dark:bg-brand-950/45 text-brand-700 dark:text-brand-200 ring-1 ring-brand-200/60 dark:ring-brand-700/45">
                  <CheckCircle className="w-6 h-6 max-lg:w-6 max-lg:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-brand-800 dark:text-brand-100 tabular-nums leading-tight">{messageStats.responded}</p>
                  <p className="text-xs max-lg:text-xs lg:text-sm font-medium text-brand-700/90 dark:text-brand-300/90">{t('dashboard.contact.statResponded')}</p>
                </div>
              </div>
              <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-amber-200/90 dark:border-amber-800/40 bg-gradient-to-br from-white to-amber-50/40 dark:from-zinc-900 dark:to-amber-950/25 p-4 max-lg:p-4 lg:p-5 shadow-sm dark:shadow-black/20 flex items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
                <span className="flex h-11 w-11 max-lg:h-11 max-lg:w-11 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 ring-1 ring-amber-200/70 dark:ring-amber-700/50">
                  <CircleAlert className="w-6 h-6 max-lg:w-6 max-lg:h-6 lg:w-7 lg:h-7" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-xl max-lg:text-xl lg:text-2xl font-bold text-amber-950 dark:text-amber-100 tabular-nums leading-tight">{messageStats.pending}</p>
                  <p className="text-xs max-lg:text-xs lg:text-sm font-medium text-amber-900/90 dark:text-amber-300/90">{t('dashboard.contact.statPending')}</p>
                </div>
              </div>
            </div>

            <div className="sticky top-0 z-20 -mx-4 px-4 py-3 max-lg:-mx-4 max-lg:px-4 sm:-mx-6 sm:px-6 bg-stone-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-stone-200/70 dark:border-zinc-800/70 lg:hidden">
              <div
                className="mb-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/35 px-3 py-1.5 text-[11px] font-semibold text-brand-900 dark:text-brand-100 shadow-sm"
                title={t('dashboard.orders.autoRefreshTitle')}
              >
                <Clock className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
                <span>{t('dashboard.orders.autoRefresh')}</span>
              </div>
              {bulk.selectionMode ? (
                <div className="w-full min-w-0 [&>div]:w-full [&>div]:flex [&>div]:flex-col [&>div]:gap-2 [&_button]:w-full [&_button]:justify-center">
                  {filteredSubmissions.length > 0 && (
                    <DashboardBulkSelectBar
                      selectionMode={bulk.selectionMode}
                      onToggleSelectionMode={bulk.toggleSelectionMode}
                      selectedCount={bulk.selectedCount}
                      totalSelectable={selectableIds.length}
                      onSelectAll={() => bulk.selectAll(selectableIds)}
                      onClearSelection={bulk.clearSelection}
                      onDeleteSelected={() => setBulkDeleteOpen(true)}
                      deleteDisabled={bulkDeleting}
                    />
                  )}
                </div>
              ) : (
                <div
                  className={`grid min-w-0 w-full gap-2 ${filteredSubmissions.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}
                >
                  <div ref={messageFilterMobileRef} className={`relative min-w-0 ${filterDropdownOpen ? 'z-50' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setFilterDropdownOpen(filterDropdownOpen ? false : true)}
                      className={`${DASHBOARD_FILTER_SELECT} w-full min-h-[2.75rem] text-sm max-lg:py-2.5`}
                    >
                      <Filter className="w-4 h-4 shrink-0 text-brand-500" />
                      <span className="truncate text-left flex-1">
                        {messageFilterOptions.find((o) => o.value === messageFilter)?.label ?? t('dashboard.contact.filterAll')}
                      </span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {filterDropdownOpen ? (
                      <div className="absolute left-0 right-0 top-full z-[200] mt-1 max-h-64 overflow-y-auto rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-xl">
                        {messageFilterOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setMessageFilter(option.value);
                              setFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                              messageFilter === option.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {filteredSubmissions.length > 0 && (
                    <div className="min-w-0 [&_button]:flex [&_button]:h-full [&_button]:min-h-[2.75rem] [&_button]:w-full [&_button]:justify-center">
                      <DashboardBulkSelectBar
                        selectionMode={bulk.selectionMode}
                        onToggleSelectionMode={bulk.toggleSelectionMode}
                        selectedCount={bulk.selectedCount}
                        totalSelectable={selectableIds.length}
                        onSelectAll={() => bulk.selectAll(selectableIds)}
                        onClearSelection={bulk.clearSelection}
                        onDeleteSelected={() => setBulkDeleteOpen(true)}
                        deleteDisabled={bulkDeleting}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sticky top-0 z-20 -mx-4 hidden px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:block lg:px-8 bg-stone-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-stone-200/70 dark:border-zinc-800/70">
              <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/35 px-3.5 py-2 text-xs font-semibold text-brand-900 dark:text-brand-100 shadow-sm"
                  title={t('dashboard.orders.autoRefreshTitle')}
                >
                  <Clock className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
                  <span>{t('dashboard.orders.autoRefresh')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <div ref={messageFilterDesktopRef} className={`relative ${filterDropdownOpen ? 'z-50' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setFilterDropdownOpen(filterDropdownOpen ? false : true)}
                      className={`${DASHBOARD_FILTER_SELECT} text-sm`}
                    >
                      <Filter className="w-4 h-4 shrink-0 text-brand-500" />
                      <span className="truncate max-w-[10rem] xl:max-w-none">
                        {messageFilterOptions.find((o) => o.value === messageFilter)?.label ?? t('dashboard.contact.filterAll')}
                      </span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {filterDropdownOpen ? (
                      <div className="absolute right-0 top-full z-[200] mt-1 w-52 max-h-64 overflow-y-auto rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-xl">
                        {messageFilterOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setMessageFilter(option.value);
                              setFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                              messageFilter === option.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {filteredSubmissions.length > 0 && (
                    <DashboardBulkSelectBar
                      selectionMode={bulk.selectionMode}
                      onToggleSelectionMode={bulk.toggleSelectionMode}
                      selectedCount={bulk.selectedCount}
                      totalSelectable={selectableIds.length}
                      onSelectAll={() => bulk.selectAll(selectableIds)}
                      onClearSelection={bulk.clearSelection}
                      onDeleteSelected={() => setBulkDeleteOpen(true)}
                      deleteDisabled={bulkDeleting}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 px-4 py-3 text-red-700 dark:text-red-300 text-xs max-lg:text-xs lg:text-sm mb-4 max-lg:mb-4 lg:mb-6">{error}</div>
          )}

          <div className="flex flex-1 min-h-0 flex-col space-y-3 max-lg:space-y-3 lg:space-y-4 min-w-0">
            {filteredSubmissions.length === 0 ? (
              <div className="flex flex-1 min-h-[220px] max-lg:min-h-[220px] lg:min-h-[280px] items-center justify-center rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 max-lg:p-8 lg:p-12 text-center text-sm max-lg:text-sm lg:text-base text-stone-500 dark:text-zinc-400">
                {submissions.length === 0 ? t('dashboard.contact.emptyNone') : t('dashboard.contact.emptyFilter')}
              </div>
            ) : (
              pageItems.map((s) => (
                <div key={s.id} className={bulk.selectionMode ? 'flex items-start gap-3' : undefined}>
                  {bulk.selectionMode && (
                    <BulkItemCheckbox
                      variant="inline"
                      checked={bulk.isSelected(s.id)}
                      onChange={() => bulk.toggleId(s.id)}
                      label={s.customerName}
                    />
                  )}
                <BulkSelectableCard
                  selectionMode={bulk.selectionMode}
                  selected={bulk.isSelected(s.id)}
                  onToggle={() => bulk.toggleId(s.id)}
                  ariaLabel={s.customerName}
                  hideCheckbox={bulk.selectionMode}
                  className={`rounded-xl max-lg:rounded-xl lg:rounded-2xl border shadow-sm min-w-0 ${
                    bulk.selectionMode ? 'flex-1 min-w-0 ' : ''
                  }${
                    s.responded
                      ? 'border-brand-200/80 dark:border-brand-800/50 bg-brand-50/30 dark:bg-brand-950/20'
                      : 'border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="p-4 max-lg:p-4 sm:p-5 lg:p-6 min-w-0">
                    <div className="flex flex-col gap-2 max-lg:gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between mb-2 min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm max-lg:text-sm lg:text-base text-stone-900 dark:text-zinc-100 truncate">{s.customerName}</span>
                        {s.responded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950/45 text-brand-700 dark:text-brand-200 text-[10px] max-lg:text-[10px] lg:text-xs font-medium shrink-0">
                            <CheckCircle className="w-3 h-3 max-lg:w-3 max-lg:h-3 lg:w-3.5 lg:h-3.5" />
                            {t('dashboard.contact.respondedBadge')}
                          </span>
                        )}
                      </div>
                      {!bulk.selectionMode && (
                      <div className="flex min-w-0 w-full gap-1.5 lg:w-auto lg:items-center lg:gap-2">
                        {!s.responded && (
                          <button
                            type="button"
                            onClick={() => handleMarkResponded(s)}
                            disabled={markingId === s.id}
                            className="inline-flex min-w-0 flex-1 basis-0 lg:flex-none items-center justify-center gap-1 rounded-lg border-2 border-brand-200 bg-brand-50 px-1.5 py-2 text-[10px] font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-60 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-3 lg:py-1.5 lg:text-sm lg:font-medium lg:text-brand-600 lg:hover:bg-brand-50 dark:border-brand-900/50 dark:bg-brand-950/35 dark:text-brand-300 lg:dark:bg-transparent lg:dark:hover:bg-brand-950/35"
                          >
                            {markingId === s.id ? <AdminLoadingInline dotsOnly /> : <CheckCircle className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />}
                            <span className="truncate">
                              {markingId === s.id ? t('dashboard.contact.markingResponded') : t('dashboard.contact.markResponded')}
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewSubmission(s)}
                          className="inline-flex min-w-0 flex-1 basis-0 lg:flex-none items-center justify-center gap-1 rounded-lg border-2 border-stone-200 bg-white px-1.5 py-2 text-[10px] font-medium text-stone-700 hover:border-brand-200 hover:bg-brand-50 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-3 lg:py-1.5 lg:text-sm lg:text-brand-600 lg:hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 lg:dark:bg-transparent dark:hover:border-transparent dark:hover:bg-brand-950/40"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />
                          <span className="truncate">{t('dashboard.common.view')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteSubmission(s)}
                          className="inline-flex min-w-0 flex-1 basis-0 lg:flex-none items-center justify-center gap-1 rounded-lg border-2 border-red-200 bg-red-50 px-1.5 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-100 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-3 lg:py-1.5 lg:text-sm lg:font-medium lg:text-red-600 lg:hover:bg-red-50 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 lg:dark:bg-transparent lg:dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />
                          <span className="truncate">{t('dashboard.common.delete')}</span>
                        </button>
                      </div>
                      )}
                    </div>
                    <a href={`mailto:${s.customerEmail}`} className="text-brand-600 text-xs max-lg:text-xs lg:text-sm font-medium hover:underline break-all">
                      {s.customerEmail}
                    </a>
                    <p className="text-stone-700 dark:text-zinc-300 text-xs max-lg:text-xs lg:text-sm mt-2.5 max-lg:mt-2.5 lg:mt-3 whitespace-pre-wrap line-clamp-2 border-t border-stone-100 dark:border-zinc-800 pt-2.5 max-lg:pt-2.5 lg:pt-3">
                      {s.message}
                    </p>
                    <span className="text-stone-500 dark:text-zinc-400 text-[10px] max-lg:text-[10px] lg:text-xs mt-2 block">{new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                </BulkSelectableCard>
                </div>
              ))
            )}
          </div>

          {filteredSubmissions.length > 0 && (
            <div className="mt-5 max-lg:mt-5 lg:mt-6 flex flex-col gap-3 max-lg:gap-3 lg:gap-4 rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 px-3 max-lg:px-3 lg:px-4 py-3 max-lg:py-3 lg:py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between min-w-0 w-full max-w-full">
              <p className="text-xs max-lg:text-xs lg:text-sm text-stone-600 dark:text-zinc-400 tabular-nums text-center sm:text-left">
                {t('dashboard.common.showingRange', { start: start + 1, end: rangeEnd, total: filteredSubmissions.length })}
                {messageFilter !== 'all' ? ` ${t('dashboard.common.filtered')}` : ''}
              </p>
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      scrollOnPaginationChange();
                    }}
                    disabled={page <= 1}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    {t('dashboard.common.previous')}
                  </button>
                  <span className="px-1 text-xs max-lg:text-xs lg:text-sm font-medium text-stone-500 dark:text-zinc-400 tabular-nums shrink-0">
                    {t('dashboard.common.pageOf', { current: page, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      scrollOnPaginationChange();
                    }}
                    disabled={page >= totalPages}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-40"
                  >
                    {t('dashboard.common.next')}
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          )}

          {viewSubmission && (
            <div
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
              onClick={(e) => e.target === e.currentTarget && setViewSubmission(null)}
            >
              <div
                className="bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-xl w-full max-w-lg max-h-[min(92vh,100%)] sm:max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 max-lg:px-4 max-lg:py-3 sm:p-6 border-b border-stone-200 dark:border-zinc-700 shrink-0">
                  <h2 className="text-base max-lg:text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100 pr-2 min-w-0">{t('dashboard.contact.messageTitle')}</h2>
                  <button
                    type="button"
                    onClick={() => setViewSubmission(null)}
                    className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9`}
                    aria-label={t('dashboard.common.close')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 max-lg:p-4 sm:p-6 overflow-y-auto space-y-3 min-w-0">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-400 dark:text-zinc-500 mb-0.5">{t('dashboard.contact.from')}</p>
                    <p className="font-semibold text-stone-900 dark:text-zinc-100">{viewSubmission.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-400 dark:text-zinc-500 mb-0.5">{t('dashboard.contact.email')}</p>
                    <a href={`mailto:${viewSubmission.customerEmail}`} className="text-brand-600 font-medium hover:underline">
                      {viewSubmission.customerEmail}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-400 dark:text-zinc-500 mb-0.5">{t('dashboard.contact.date')}</p>
                    <p className="text-stone-600 dark:text-zinc-400 text-sm">{new Date(viewSubmission.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-400 dark:text-zinc-500 mb-0.5">{t('dashboard.contact.message')}</p>
                    <p className="text-stone-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{viewSubmission.message}</p>
                  </div>
                </div>
                <div className="p-4 max-lg:p-4 sm:p-6 border-t border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewSubmission(null)}
                    className="w-full py-2.5 max-lg:py-2.5 rounded-xl text-sm font-medium border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
                  >
                    {t('dashboard.common.close')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={!!deleteSubmission}
            title={t('dashboard.contact.deleteTitle')}
            message={
              deleteSubmission ? t('dashboard.contact.deleteMsg', { name: deleteSubmission.customerName }) : ''
            }
            confirmLabel={deleting ? t('dashboard.contact.deleting') : t('dashboard.common.delete')}
            onConfirm={() => void handleDelete()}
            onCancel={() => !deleting && setDeleteSubmission(null)}
            danger
            loading={deleting}
          />

          <ConfirmDialog
            open={bulkDeleteOpen}
            title={t('dashboard.common.deleteSelected')}
            message={t('dashboard.common.deleteSelectedConfirm', { count: bulk.selectedCount })}
            confirmLabel={bulkDeleting ? t('dashboard.common.deletingSelected') : t('dashboard.common.delete')}
            onConfirm={() => void handleDeleteSelected()}
            onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
            danger
            loading={bulkDeleting}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
