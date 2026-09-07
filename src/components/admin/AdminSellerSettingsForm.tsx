import { useMemo, useState } from 'react';
import Select from 'react-select';
import {
  Banknote,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  Sparkles,
  Store,
  Trash2,
  User,
} from 'lucide-react';
import { getCountryOptionsList, getCurrencyOptionsList } from '../../lib/countryCurrencyOptions';
import type { CountryOption, CurrencyOption } from '../../lib/countryCurrencyOptions';
import AdminImageUpload from './AdminImageUpload';
import { AdminLoadingInline } from './AdminLoading';
import { adminTheme } from './adminTheme';

export type AdminSellerSettingsValues = {
  shopName: string;
  email: string;
  username: string;
  country: string;
  currency: string;
  logo: string;
};

type Props = {
  values: AdminSellerSettingsValues;
  onChange: (values: AdminSellerSettingsValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  onDeleteAccount: () => void;
};

const fieldClass =
  'w-full rounded-xl border-2 border-stone-200 bg-stone-50/50 py-3 pl-12 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/15';

function useAdminSelectStyles() {
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return useMemo(
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
}

export default function AdminSellerSettingsForm({
  values,
  onChange,
  onSubmit,
  saving,
  onDeleteAccount,
}: Props) {
  const countryOptions = useMemo(() => getCountryOptionsList(), []);
  const currencyOptions = useMemo(() => getCurrencyOptionsList(), []);
  const selectStyles = useAdminSelectStyles();
  const [urlCopied, setUrlCopied] = useState(false);

  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const shopUrl = values.username.trim() ? `${base}/${values.username.trim()}` : '';

  const set = <K extends keyof AdminSellerSettingsValues>(key: K, v: AdminSellerSettingsValues[K]) => {
    onChange({ ...values, [key]: v });
  };

  async function copyShopUrl() {
    if (!shopUrl) return;
    try {
      await navigator.clipboard.writeText(shopUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0">
      <div className="mb-4 max-lg:mb-4 lg:mb-6">
        <div className="mb-1 flex items-center gap-2 text-brand-700 dark:text-brand-400">
          <Sparkles className="h-4 w-4 max-lg:h-4 lg:h-5 lg:w-5 shrink-0" aria-hidden />
          <span className="text-xs max-lg:text-xs lg:text-sm font-semibold uppercase tracking-widest">Account</span>
        </div>
        <h2 className="text-lg max-lg:text-lg lg:text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">Seller settings</h2>
        <p className={`mt-0.5 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>Shop identity, login email, and regional defaults</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-lg shadow-stone-200/20 dark:border-zinc-600/80 dark:bg-zinc-900 dark:shadow-none min-w-0">
        <form onSubmit={onSubmit} className="space-y-5 max-lg:space-y-5 lg:space-y-6 p-4 max-lg:p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">
                Shop name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                <input
                  value={values.shopName}
                  onChange={(e) => set('shopName', e.target.value)}
                  required
                  className={fieldClass}
                  placeholder="Sweet Cravings Studio"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">
                Store URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                <input
                  value={values.username}
                  onChange={(e) =>
                    set(
                      'username',
                      e.target.value.replace(/\s/g, '').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                    )
                  }
                  required
                  className={`${fieldClass} font-mono`}
                  placeholder="my-shop"
                />
              </div>
              <p className={`mt-1.5 text-xs ${adminTheme.muted}`}>Letters, numbers, hyphens only</p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-brand-50/50 p-4 sm:p-5 dark:border-brand-800/40 dark:from-brand-950/40 dark:to-brand-950/25">
            <div className="mb-2 flex items-center gap-2 text-brand-700 dark:text-brand-400">
              <Link2 className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">Live store link</span>
            </div>
            <p className="mb-4 break-all font-mono text-sm text-stone-800 dark:text-zinc-200">
              {shopUrl || `${base}/your-store`}
            </p>
            <div className="flex flex-col gap-2 max-lg:flex-col sm:flex-row sm:flex-wrap">
              <a
                href={shopUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex w-full max-lg:w-full sm:w-auto items-center justify-center gap-2 ${adminTheme.btnSecondary}`}
                onClick={(e) => !shopUrl && e.preventDefault()}
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                Open Store
              </a>
              <button
                type="button"
                onClick={() => void copyShopUrl()}
                disabled={!shopUrl}
                className={`inline-flex w-full max-lg:w-full sm:w-auto items-center justify-center gap-2 ${adminTheme.btnPrimary} disabled:opacity-50`}
              >
                {urlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {urlCopied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
              <input
                type="email"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">Country</label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                <Select<CountryOption>
                  isClearable
                  isSearchable
                  options={countryOptions}
                  value={values.country ? countryOptions.find((o) => o.value === values.country) ?? null : null}
                  onChange={(opt) => set('country', opt?.value ?? '')}
                  placeholder="Search country..."
                  styles={selectStyles}
                  classNamePrefix="admin-settings-select"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-800 dark:text-zinc-200">Currency</label>
              <div className="relative">
                <Banknote className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                <Select<CurrencyOption>
                  isClearable
                  isSearchable
                  options={currencyOptions}
                  value={values.currency ? currencyOptions.find((o) => o.value === values.currency) ?? null : null}
                  onChange={(opt) => set('currency', opt?.value ?? '')}
                  placeholder="Search currency..."
                  styles={selectStyles}
                  classNamePrefix="admin-settings-select"
                />
              </div>
            </div>
          </div>

          <AdminImageUpload
            label="Shop logo"
            value={values.logo || null}
            onChange={(url) => set('logo', url ?? '')}
            uploadType="logo"
            previewContain
            hint="Optional - shown in the shop header"
          />

          <button
            type="submit"
            disabled={saving}
            className={`flex w-full items-center justify-center gap-2 py-3.5 ${adminTheme.btnPrimary}`}
          >
            {saving ? <AdminLoadingInline light dotsOnly /> : null}
            <span>{saving ? 'Saving...' : 'Save Account Settings'}</span>
          </button>

          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 max-lg:p-4 lg:p-5 dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">Danger zone</p>
            <p className={`mt-1 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>
              Permanently deletes this seller, all products, orders, and messages.
            </p>
            <button
              type="button"
              onClick={onDeleteAccount}
              className="mt-4 inline-flex w-full max-lg:w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-4 w-4" />
              Delete Seller Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
