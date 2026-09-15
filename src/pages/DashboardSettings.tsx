import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import { getStoredToken } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { AdminLoadingInline } from '../components/DashboardLoading';
import AccountLanguageThemeRow from '../components/AccountLanguageThemeRow';
import ThemeAppearancePicker from '../components/ThemeAppearancePicker';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { FieldLabelWithHelp } from '../components/FieldLabelWithHelp';
import { getCountryOptionsList, getCurrencyOptionsList } from '../lib/countryCurrencyOptions';
import type { CountryOption, CurrencyOption } from '../lib/countryCurrencyOptions';
import { Store, Copy, Check, Globe, Banknote, ExternalLink, Sparkles, Link2, Upload, AlertTriangle, Save } from 'lucide-react';
import { DASHBOARD_BTN_PRIMARY } from '../lib/dashboardFormClasses';
import PlanSubscriptionCard from '../components/plan/PlanSubscriptionCard';
const API_BASE = import.meta.env.VITE_API_URL ?? '';
const DELETE_ACCOUNT_CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

export default function DashboardSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, fetchUser, deleteAccount } = useAuth();
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const [shopName, setShopName] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countryOptions = useMemo(() => getCountryOptionsList(), []);
  const currencyOptions = useMemo(() => getCurrencyOptionsList(), []);
  const selectStyles = useMemo(
    () => ({
      control: (base: object, state: { isFocused: boolean }) => ({
        ...base,
        minHeight: 48,
        paddingLeft: 44,
        borderWidth: 2,
        borderColor: state.isFocused ? '#5b45e5' : isDark ? '#3f3f46' : '#e7e5e4',
        borderRadius: 14,
        backgroundColor: isDark ? 'rgb(24 24 27 / 0.65)' : 'rgb(250 250 249 / 0.8)',
        boxShadow: state.isFocused ? '0 0 0 4px rgba(91, 69, 229, 0.15)' : 'none',
      }),
      menu: (base: object) => ({
        ...base,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: isDark ? '#18181b' : '#fff',
        border: isDark ? '1px solid rgb(63 63 70)' : undefined,
        boxShadow: isDark ? '0 10px 40px -10px rgba(0,0,0,0.55)' : '0 10px 40px -10px rgba(0,0,0,0.15)',
      }),
      menuList: (base: object) => ({ ...base, padding: 4 }),
      option: (base: Record<string, unknown>, state: { isFocused: boolean; isSelected: boolean }) => ({
        ...base,
        borderRadius: 10,
        cursor: 'pointer',
        backgroundColor: state.isSelected
          ? isDark
            ? 'rgba(91, 69, 229, 0.22)'
            : '#ebe8fc'
          : state.isFocused
            ? isDark
              ? '#27272a'
              : '#f5f5f4'
            : 'transparent',
        color: state.isSelected ? (isDark ? '#d6cff9' : '#2f2184') : isDark ? '#fafafa' : '#1c1917',
      }),
      singleValue: (base: object) => ({ ...base, color: isDark ? '#fafafa' : '#1c1917' }),
      placeholder: (base: object) => ({ ...base, color: isDark ? '#71717a' : '#a8a29e' }),
      input: (base: object) => ({ ...base, margin: 0, padding: 0, color: isDark ? '#fafafa' : '#1c1917' }),
    }),
    [isDark],
  );

  useEffect(() => {
    if (user) {
      setShopName(user.shopName);
      setUsername(user.username);
      setCountry(user.country ?? '');
      setCurrency(user.currency ?? '');
      setLogo(user.logo ?? null);
    }
  }, [user]);

  const base = import.meta.env.VITE_BASE_URL || window.location.origin;
  const shopUrl = user ? `${base}/${username}` : '';

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getStoredToken();
    if (!token) return;
    setLogoUploading(true);
    setMessage('');
    const form = new FormData();
    form.append('file', file);
    form.append('type', 'logo');
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setLogo(data.url);
      await api('/api/user', { method: 'PATCH', body: { shopName, username, logo: data.url, logoPublicId: data.publicId } });
      await fetchUser();
      toast.success(t('dashboard.settings.toastLogo'));
      setMessage('');
    } catch (err) {
      setMessage((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setLogoUploading(false);
    }
    e.target.value = '';
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!country.trim()) {
      setMessage(t('dashboard.settings.errCountry'));
      return;
    }
    if (!currency.trim()) {
      setMessage(t('dashboard.settings.errCurrency'));
      return;
    }
    const slug = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!/^[a-z0-9_-]+$/.test(slug)) {
      setMessage(t('dashboard.settings.errUrl'));
      return;
    }
    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          shopName,
          username: slug,
          logo: logo ?? undefined,
          country: country.trim(),
          currency: currency.trim(),
        },
      });
      await fetchUser();
      toast.success(t('dashboard.settings.toastSaved'));
      setMessage('');
    } catch (err) {
      setMessage((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleCopyUrl() {
    if (!shopUrl) return;
    navigator.clipboard.writeText(shopUrl).then(() => {
      setUrlCopied(true);
      toast.success(t('dashboard.settings.toastLinkCopied'));
      setTimeout(() => setUrlCopied(false), 2000);
    });
  }

  async function handleDeleteAccount() {
    setMessage('');
    if (deletePhrase.trim() !== DELETE_ACCOUNT_CONFIRM_PHRASE) {
      toast.error(t('dashboard.settings.deletePhraseToast', { phrase: DELETE_ACCOUNT_CONFIRM_PHRASE }));
      return;
    }
    setDeletingAccount(true);
    try {
      const { error } = await deleteAccount(deletePhrase.trim());
      if (error) {
        setMessage(error);
        toast.error(error);
        return;
      }
      toast.success(t('dashboard.settings.toastAccountDeleted'));
      navigate('/', { replace: true });
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
          <Sparkles className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
            {t('dashboard.settings.section')}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
          {t('dashboard.settings.title')}
        </h1>
        <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">{t('dashboard.settings.subtitle')}</p>
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-5 max-lg:space-y-4 min-w-0">
        <PlanSubscriptionCard plan={user?.plan} />

        <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 shadow-lg shadow-stone-200/20 overflow-hidden">
          <form onSubmit={handleSave} className="p-4 max-lg:p-4 lg:p-8 space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0">
              {message && (
                <div className="rounded-lg max-lg:rounded-lg lg:rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 px-3 max-lg:px-3 lg:px-4 py-2.5 max-lg:py-2.5 lg:py-3 text-red-700 dark:text-red-300 text-xs max-lg:text-xs lg:text-sm font-medium flex items-center gap-2 break-words">
                  <span className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500 shrink-0" />
                  {message}
                </div>
              )}

              <div className="space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-lg:gap-4 lg:gap-8 items-start min-w-0">
                  <div className="min-w-0">
                    <label className="block font-semibold text-stone-800 dark:text-zinc-200 text-xs max-lg:text-xs lg:text-sm mb-2">
                      {t('dashboard.settings.shopName')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-500" />
                      <input
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                        placeholder={t('dashboard.settings.shopNamePh')}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <FieldLabelWithHelp required help={t('dashboard.settings.urlHint')}>
                      {t('dashboard.settings.storeUrl')}
                    </FieldLabelWithHelp>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder={t('dashboard.settings.storeUrlPh')}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 font-mono text-sm placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-gradient-to-br from-brand-50 to-brand-50/50 dark:from-brand-950/40 dark:to-brand-950/25 border border-brand-100 dark:border-brand-800/40 p-3 max-lg:p-3 lg:p-5 min-w-0">
                  <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 mb-2">
                    <Link2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.settings.storeLink')}</span>
                  </div>
                  <p className="font-mono text-sm text-stone-800 dark:text-zinc-200 break-all mb-4">{base}/{username || 'your-store'}</p>
                  <div className="flex flex-wrap gap-2 max-lg:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => shopUrl && window.open(shopUrl, '_blank', 'noopener,noreferrer')}
                      disabled={!shopUrl}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium border-2 border-brand-600 text-brand-600 bg-white dark:bg-zinc-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors max-lg:flex-1 max-lg:min-w-0 max-lg:px-2 max-lg:text-sm max-lg:whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      {t('dashboard.settings.openStore')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-colors max-lg:flex-1 max-lg:min-w-0 max-lg:px-2 max-lg:text-sm max-lg:whitespace-nowrap"
                    >
                      {urlCopied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                      {urlCopied ? t('dashboard.common.copied') : t('dashboard.common.copyLink')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-lg:gap-4 lg:gap-8 min-w-0">
                <div className="min-w-0">
                  <label className="block font-semibold text-stone-800 dark:text-zinc-200 text-xs max-lg:text-xs lg:text-sm mb-2">{t('dashboard.settings.country')} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-500 pointer-events-none z-10" />
                    <Select<CountryOption>
                      isClearable
                      isSearchable
                      options={countryOptions}
                      value={country ? countryOptions.find((o) => o.value === country) ?? null : null}
                      onChange={(opt) => setCountry(opt?.value ?? '')}
                      placeholder={t('dashboard.settings.searchCountry')}
                      noOptionsMessage={() => t('dashboard.settings.noCountry')}
                      formatOptionLabel={(opt) => (
                        <span className="flex items-center gap-2">
                          {opt.flagUrl ? <img src={opt.flagUrl} alt="" className="w-6 h-4 object-cover rounded shrink-0" /> : null}
                          <span>{opt.label}</span>
                        </span>
                      )}
                      styles={selectStyles}
                      classNamePrefix="settings-select"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block font-semibold text-stone-800 dark:text-zinc-200 text-xs max-lg:text-xs lg:text-sm mb-2">{t('dashboard.settings.currency')} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-500 pointer-events-none z-10" />
                    <Select<CurrencyOption>
                      isClearable
                      isSearchable
                      options={currencyOptions}
                      value={currency ? currencyOptions.find((o) => o.value === currency) ?? null : null}
                      onChange={(opt) => setCurrency(opt?.value ?? '')}
                      placeholder={t('dashboard.settings.searchCurrency')}
                      noOptionsMessage={() => t('dashboard.settings.noCurrency')}
                      filterOption={(option, inputValue) => {
                        const o = option as unknown as CurrencyOption;
                        const v = inputValue.trim().toLowerCase();
                        return o.label.toLowerCase().includes(v) || o.value.toLowerCase().includes(v);
                      }}
                      formatOptionLabel={(opt) => (
                        <span className="flex items-center gap-2">
                          {opt.flagUrl ? <img src={opt.flagUrl} alt="" className="w-6 h-4 object-cover rounded shrink-0" /> : null}
                          <span>{opt.label}</span>
                        </span>
                      )}
                      styles={selectStyles}
                      classNamePrefix="settings-select"
                    />
                  </div>
                </div>
              </div>

              <div>
                <FieldLabelWithHelp help={t('dashboard.settings.logoHint')} className="mb-2">
                  {t('dashboard.settings.logoOptional')}
                </FieldLabelWithHelp>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                  className="hidden"
                />
                <div className="flex flex-col max-lg:flex-col lg:flex-row lg:items-center gap-3 max-lg:gap-3 lg:gap-4 min-w-0">
                  {(logo || logoUploading) && (
                    <div className="shrink-0">
                      {logoUploading ? (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
                          <AdminLoadingInline dotsOnly />
                        </div>
                      ) : logo ? (
                        <img src={logo} alt={t('dashboard.settings.logoAlt')} className="w-20 h-20 object-contain rounded-xl border-2 border-stone-200 dark:border-zinc-700" />
                      ) : null}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={logoUploading}
                      className="inline-flex w-full max-lg:w-full lg:w-fit items-center justify-center max-lg:justify-center lg:justify-start gap-2 py-2.5 px-4 rounded-xl font-medium border-2 border-dashed border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 text-stone-700 dark:text-zinc-300 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {logoUploading ? t('dashboard.common.uploading') : logo ? t('dashboard.settings.changeLogo') : t('dashboard.settings.uploadLogo')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/50 px-3 max-lg:px-3 lg:px-5 py-3 max-lg:py-3 lg:py-5 space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0">
                <AccountLanguageThemeRow />
                <div className="pt-4 max-lg:pt-4 lg:pt-6 border-t border-stone-200 dark:border-zinc-600/80">
                  <ThemeAppearancePicker />
                </div>
              </div>

              <div className="pt-1 max-lg:pt-1 lg:pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`${DASHBOARD_BTN_PRIMARY} w-full max-lg:py-3 lg:w-auto lg:px-8 lg:py-3.5`}
                >
                  {saving ? <AdminLoadingInline light dotsOnly /> : <Save className="w-5 h-5 shrink-0" aria-hidden />}
                  {saving ? t('dashboard.common.saving') : t('dashboard.settings.saveSettings')}
                </button>
              </div>
          </form>
        </div>

        <div className="mt-4 max-lg:mt-4 lg:mt-6 rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-red-200/90 dark:border-red-900/50 bg-white dark:bg-zinc-900 shadow-lg shadow-stone-200/20 overflow-hidden min-w-0">
          <div className="p-4 max-lg:p-4 lg:p-8">
            <div className="flex items-start gap-3 min-w-0">
              <span className="flex h-9 w-9 max-lg:h-9 max-lg:w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 max-lg:h-4 max-lg:w-4 lg:h-5 lg:w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-stone-900 dark:text-zinc-100 text-base max-lg:text-base lg:text-lg">{t('dashboard.settings.deleteSection')}</h2>
                <p className="text-xs max-lg:text-xs lg:text-sm text-stone-600 dark:text-zinc-400 mt-1">
                  {t('dashboard.settings.deleteBody')}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="mt-3 max-lg:mt-3 lg:mt-4 inline-flex w-full max-lg:w-full lg:w-auto items-center justify-center rounded-xl border-2 border-red-300 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-xs max-lg:text-xs lg:text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                >
                  {t('dashboard.settings.deleteCta')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <DeleteAccountModal
          open={deleteModalOpen}
          expectedPhrase={DELETE_ACCOUNT_CONFIRM_PHRASE}
          phrase={deletePhrase}
          onPhraseChange={setDeletePhrase}
          deleting={deletingAccount}
          onConfirm={handleDeleteAccount}
          onClose={() => {
            if (deletingAccount) return;
            setDeleteModalOpen(false);
            setDeletePhrase('');
          }}
        />
      </div>
    </DashboardLayout>
  );
}
