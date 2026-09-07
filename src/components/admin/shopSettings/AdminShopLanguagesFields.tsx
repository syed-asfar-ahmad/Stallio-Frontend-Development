import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminSellerShopFields } from '../../../types/admin';
import DashboardSwitch from '../../DashboardSwitch';
import ConfirmDialog from '../../ConfirmDialog';
import { FieldTitleWithHelp } from '../../FieldLabelWithHelp';
import {
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../../../lib/dashboardFormClasses';
import { SHOP_SETTINGS_CARD, ShopSettingsSectionHeading, ShopSettingsStack } from './shopSettingsLayout';

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
};

export default function AdminShopLanguagesFields({ form, set }: Props) {
  const { t } = useTranslation();
  const [langEsConfirm, setLangEsConfirm] = useState<boolean | null>(null);
  const [langArConfirm, setLangArConfirm] = useState<boolean | null>(null);

  return (
    <ShopSettingsStack>
      <ShopSettingsSectionHeading title={t('dashboard.delivery.shopLanguages')} />
      <div className={`${SHOP_SETTINGS_CARD} divide-y divide-stone-100 dark:divide-zinc-800 overflow-visible min-w-0`}>
        <div className={`${DASHBOARD_TOGGLE_ROW} p-4 max-lg:p-4 sm:p-5 lg:p-6 opacity-80`}>
          <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
            <FieldTitleWithHelp
              title={t('dashboard.delivery.langEnglish')}
              help={t('dashboard.delivery.langEnglishHint')}
            />
          </div>
          <span
            className={`${DASHBOARD_TOGGLE_ROW_SWITCH} inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-stone-600 dark:bg-zinc-800 dark:text-zinc-300`}
          >
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
            <DashboardSwitch checked={form.shopLangEsEnabled} onCheckedChange={setLangEsConfirm} />
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
            <DashboardSwitch checked={form.shopLangArEnabled} onCheckedChange={setLangArConfirm} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={langEsConfirm !== null}
        title={langEsConfirm ? t('dashboard.delivery.enableLangEsTitle') : t('dashboard.delivery.disableLangEsTitle')}
        message={langEsConfirm ? t('dashboard.delivery.enableLangEsMsg') : t('dashboard.delivery.disableLangEsMsg')}
        confirmLabel={langEsConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        cancelLabel={t('dashboard.common.cancel')}
        onConfirm={() => {
          if (langEsConfirm !== null) {
            set('shopLangEsEnabled', langEsConfirm);
            setLangEsConfirm(null);
          }
        }}
        onCancel={() => setLangEsConfirm(null)}
      />
      <ConfirmDialog
        open={langArConfirm !== null}
        title={langArConfirm ? t('dashboard.delivery.enableLangArTitle') : t('dashboard.delivery.disableLangArTitle')}
        message={langArConfirm ? t('dashboard.delivery.enableLangArMsg') : t('dashboard.delivery.disableLangArMsg')}
        confirmLabel={langArConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        cancelLabel={t('dashboard.common.cancel')}
        onConfirm={() => {
          if (langArConfirm !== null) {
            set('shopLangArEnabled', langArConfirm);
            setLangArConfirm(null);
          }
        }}
        onCancel={() => setLangArConfirm(null)}
      />
    </ShopSettingsStack>
  );
}
