import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../../../lib/dashboardFormClasses';
import DashboardSwitch from '../../DashboardSwitch';

export const SHOP_SETTINGS_CARD =
  'rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm min-w-0';

export const SHOP_SETTINGS_CARD_PAD = 'p-4 max-lg:p-4 sm:p-5 lg:p-6';

export const ADMIN_FIELD_LABEL =
  'block text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-800 dark:text-zinc-200 mb-1.5';

export function ShopSettingsSectionHeading({ title }: { title: string }) {
  return (
    <h3 className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight min-w-0">
      {title}
    </h3>
  );
}

export function ShopSettingsToggleCard({
  title,
  checked,
  onCheckedChange,
}: {
  title: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD}`}>
      <div className={DASHBOARD_TOGGLE_ROW}>
        <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
          <p className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200">{title}</p>
        </div>
        <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
          <DashboardSwitch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
      </div>
    </div>
  );
}

export function ShopSettingsDisabledHint({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
      <p className="font-medium text-stone-700 dark:text-zinc-300">{t(titleKey)}</p>
      <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">{t(bodyKey)}</p>
    </div>
  );
}

export function ShopSettingsStack({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-3 max-lg:space-y-3 lg:space-y-4 min-w-0 ${className}`}>{children}</div>;
}
