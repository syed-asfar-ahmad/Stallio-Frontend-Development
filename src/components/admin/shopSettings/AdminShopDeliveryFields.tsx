import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContentLanguagePicker from '../../ContentLanguagePicker';
import { SHOP_CONTENT_LANGUAGES, type ShopContentLang } from '../../../lib/shopContentLanguages';
import { useAdminShopContentLanguages, useAdminShopMultilingualEnabled } from '../../../hooks/useAdminShopContentLanguages';
import { BadgePercent, Banknote, Clock3, StickyNote } from 'lucide-react';
import type { AdminSellerShopFields } from '../../../types/admin';
import DashboardSwitch from '../../DashboardSwitch';
import {
  DASHBOARD_INPUT,
  DASHBOARD_NUMBER_INPUT,
  DASHBOARD_TEXTAREA,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../../../lib/dashboardFormClasses';
import {
  SHOP_SETTINGS_CARD,
  SHOP_SETTINGS_CARD_PAD,
  ShopSettingsSectionHeading,
  ShopSettingsStack,
} from './shopSettingsLayout';

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
  currencyCode: string;
  onCodToggle: (next: boolean) => void;
};

function deliveryNoteValue(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.deliveryNoteEs ?? '';
  if (lang === 'ar') return form.deliveryNoteAr ?? '';
  return form.deliveryNote;
}

export default function AdminShopDeliveryFields({ form, set, currencyCode, onCodToggle }: Props) {
  const { t } = useTranslation();
  const contentLanguages = useAdminShopContentLanguages(form);
  const multilingualEnabled = useAdminShopMultilingualEnabled(form);
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [noteLang, setNoteLang] = useState<ShopContentLang>('en');
  const activeLang = contentLangMeta.find((l) => l.id === noteLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];

  if (!form.deliveryEnabled) return null;

  return (
    <ShopSettingsStack>
      <ShopSettingsSectionHeading title={t('dashboard.delivery.deliveryCharges')} />
      <div className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD} space-y-4 max-lg:space-y-4 lg:space-y-5 min-w-0`}>
        <div>
          <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-2">
            {t('dashboard.delivery.deliveryMode')}
          </label>
          <div className="flex w-full max-w-full sm:inline-flex rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => set('deliveryType', 'fixed')}
              className={`flex-1 sm:flex-none px-3 max-lg:px-3 lg:px-4 py-2 rounded-lg text-xs max-lg:text-xs lg:text-sm font-semibold ${
                form.deliveryType === 'fixed'
                  ? 'bg-white dark:bg-zinc-900 text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              {t('dashboard.delivery.modeFixed')}
            </button>
            <button
              type="button"
              onClick={() => set('deliveryType', 'free')}
              className={`flex-1 sm:flex-none px-3 max-lg:px-3 lg:px-4 py-2 rounded-lg text-xs max-lg:text-xs lg:text-sm font-semibold ${
                form.deliveryType === 'free'
                  ? 'bg-white dark:bg-zinc-900 text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-stone-600 dark:text-zinc-400'
              }`}
            >
              {t('dashboard.delivery.modeFreeAbove')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-lg:gap-3 lg:gap-4">
          <div>
            <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              {t('dashboard.delivery.deliveryFee')}
            </label>
            <div className="relative">
              <Banknote className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.deliveryFee}
                onChange={(e) => set('deliveryFee', Number(e.target.value))}
                disabled={form.deliveryType === 'free'}
                className={`${DASHBOARD_NUMBER_INPUT} h-11 pl-9 pr-24 py-0 dashboard-no-spin`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 text-xs font-semibold">
                {currencyCode}
              </span>
            </div>
          </div>
          {form.deliveryType === 'free' ? (
            <div>
              <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                {t('dashboard.delivery.freeAbove')}
              </label>
              <div className="relative">
                <BadgePercent className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.freeDeliveryThreshold ?? ''}
                  onChange={(e) =>
                    set('freeDeliveryThreshold', e.target.value === '' ? null : Number(e.target.value))
                  }
                  className={`${DASHBOARD_NUMBER_INPUT} h-11 pl-9 pr-3 py-0 dashboard-no-spin`}
                  placeholder={t('dashboard.delivery.freeAbovePh')}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD} min-w-0`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-lg:gap-4 md:gap-6">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300">
              {t('dashboard.delivery.eta')}
            </label>
            <div className="relative">
              <Clock3 className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.deliveryEta}
                onChange={(e) => set('deliveryEta', e.target.value)}
                className={`${DASHBOARD_INPUT} h-11 pl-9 py-0`}
                placeholder={t('dashboard.delivery.etaPh')}
              />
            </div>
          </div>
          <div className={`${DASHBOARD_TOGGLE_ROW} rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-900/50 px-4 py-3 min-h-[2.75rem] self-end`}>
            <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
              <p className="text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300">{t('dashboard.delivery.cod')}</p>
              <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400 mt-0.5 leading-snug">
                {form.deliveryCodEnabled ? t('dashboard.delivery.codOn') : t('dashboard.delivery.codOff')}
              </p>
            </div>
            <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
              <DashboardSwitch
                checked={form.deliveryCodEnabled}
                onCheckedChange={onCodToggle}
                activeClassName="border-brand-500 bg-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      <ShopSettingsSectionHeading title={t('dashboard.delivery.checkout')} />
      <div className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD} min-w-0 space-y-3`}>
        {multilingualEnabled ? (
          <ContentLanguagePicker
            label={t('dashboard.delivery.checkoutLangLabel')}
            hint={t('dashboard.delivery.checkoutLangHint')}
            value={noteLang}
            onChange={setNoteLang}
            filled={{
              en: Boolean(form.deliveryNote.trim()),
              es: Boolean((form.deliveryNoteEs ?? '').trim()),
              ar: Boolean((form.deliveryNoteAr ?? '').trim()),
            }}
            languages={contentLanguages}
          />
        ) : null}
        <label className="block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
          {multilingualEnabled
            ? `${t('dashboard.delivery.noteLabel')} (${activeLang.label})`
            : t('dashboard.delivery.noteLabel')}
        </label>
        <div className="relative">
          <StickyNote className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3 top-3.5" />
          <textarea
            rows={2}
            dir={activeLang.dir}
            value={deliveryNoteValue(form, noteLang)}
            onChange={(e) => {
              const value = e.target.value;
              if (noteLang === 'es') set('deliveryNoteEs', value);
              else if (noteLang === 'ar') set('deliveryNoteAr', value);
              else set('deliveryNote', value);
            }}
            className={`${DASHBOARD_TEXTAREA} pl-9`}
            placeholder={t('dashboard.delivery.notePh')}
          />
        </div>
      </div>
    </ShopSettingsStack>
  );
}
