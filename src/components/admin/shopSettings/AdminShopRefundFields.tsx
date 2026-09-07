import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminSellerShopFields } from '../../../types/admin';
import DashboardSwitch from '../../DashboardSwitch';
import RichTextEditor from '../../RichTextEditor';
import ContentLanguagePicker from '../../ContentLanguagePicker';
import { FieldLabelWithHelp } from '../../FieldLabelWithHelp';
import { SHOP_CONTENT_LANGUAGES, type ShopContentLang } from '../../../lib/shopContentLanguages';
import { useAdminShopContentLanguages, useAdminShopMultilingualEnabled } from '../../../hooks/useAdminShopContentLanguages';
import {
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

function refundContentValue(form: AdminSellerShopFields, lang: ShopContentLang): string {
  if (lang === 'es') return form.refundContentEs ?? '';
  if (lang === 'ar') return form.refundContentAr ?? '';
  return form.refundContent;
}

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
  onRefundToggle: (next: boolean) => void;
};

export default function AdminShopRefundFields({ form, set, onRefundToggle }: Props) {
  const { t } = useTranslation();
  const contentLanguages = useAdminShopContentLanguages(form);
  const multilingualEnabled = useAdminShopMultilingualEnabled(form);
  const contentLangMeta = SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id));
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const activeLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];

  return (
    <ShopSettingsStack>
      <ShopSettingsSectionHeading title={t('dashboard.refund.title')} />
      <div className={`${SHOP_SETTINGS_CARD} overflow-visible min-w-0`}>
        <div className={`${SHOP_SETTINGS_CARD_PAD} border-b border-stone-100 dark:border-zinc-800`}>
          <div className={DASHBOARD_TOGGLE_ROW}>
            <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
              <p className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200">
                {t('dashboard.refund.toggleTitle')}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">{t('dashboard.refund.toggleHint')}</p>
            </div>
            <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
              <DashboardSwitch checked={form.refundEnabled} onCheckedChange={onRefundToggle} />
            </div>
          </div>
        </div>
        {form.refundEnabled ? (
          <div className={`${SHOP_SETTINGS_CARD_PAD} space-y-4 min-w-0`}>
            {multilingualEnabled ? (
              <ContentLanguagePicker
                label={t('dashboard.refund.langLabel')}
                hint={t('dashboard.refund.langHint')}
                value={formLang}
                onChange={setFormLang}
                filled={{
                  en: Boolean(form.refundContent.trim()),
                  es: Boolean((form.refundContentEs ?? '').trim()),
                  ar: Boolean((form.refundContentAr ?? '').trim()),
                }}
                languages={contentLanguages}
              />
            ) : null}
            <FieldLabelWithHelp required className="mb-2">
              {multilingualEnabled
                ? `${t('dashboard.refund.policy')} (${activeLang.label})`
                : t('dashboard.refund.policy')}
            </FieldLabelWithHelp>
            <RichTextEditor
              value={refundContentValue(form, formLang)}
              onChange={(value) => {
                if (formLang === 'es') set('refundContentEs', value);
                else if (formLang === 'ar') set('refundContentAr', value);
                else set('refundContent', value);
              }}
              placeholder={t('dashboard.refund.policyPh')}
              minHeight="12rem"
            />
          </div>
        ) : null}
      </div>
    </ShopSettingsStack>
  );
}
