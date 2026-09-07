import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock3 } from 'lucide-react';
import type { AdminSellerShopFields } from '../../../types/admin';
import DashboardSwitch from '../../DashboardSwitch';
import DashboardCheckbox from '../../DashboardCheckbox';
import ConfirmDialog from '../../ConfirmDialog';
import { FieldTitleWithHelp } from '../../FieldLabelWithHelp';
import {
  DASHBOARD_INPUT,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../../../lib/dashboardFormClasses';
import {
  WEEKDAY_KEYS,
  normalizeAvailabilityHours,
  normalizeTimeInput,
  type ShopAvailabilitySlot,
} from '../../../lib/shopAvailability';
import { SHOP_SETTINGS_CARD, SHOP_SETTINGS_CARD_PAD } from './shopSettingsLayout';

type Props = {
  form: AdminSellerShopFields;
  set: <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => void;
};

export default function AdminShopAvailabilityFields({ form, set }: Props) {
  const { t } = useTranslation();
  const [toggleConfirm, setToggleConfirm] = useState<boolean | null>(null);
  const hours = normalizeAvailabilityHours(form.availabilityHours);

  function updateDay(day: ShopAvailabilitySlot['day'], patch: Partial<ShopAvailabilitySlot>) {
    set(
      'availabilityHours',
      hours.map((slot) => (slot.day === day ? { ...slot, ...patch } : slot)),
    );
  }

  return (
    <>
      <div className={`${SHOP_SETTINGS_CARD} ${SHOP_SETTINGS_CARD_PAD} min-w-0`}>
        <div className="rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50/40 dark:bg-zinc-950/40 p-3 max-lg:p-3 sm:p-4 lg:p-5 space-y-3 max-lg:space-y-3 lg:space-y-4 min-w-0">
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
              <DashboardSwitch checked={form.availabilityEnabled} onCheckedChange={setToggleConfirm} />
            </div>
          </div>

          {form.availabilityEnabled ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={() => set('availability24Hours', false)}
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                    !form.availability24Hours
                      ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-300'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  {t('dashboard.footer.availabilityCustomHours')}
                </button>
                <button
                  type="button"
                  onClick={() => set('availability24Hours', true)}
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                    form.availability24Hours
                      ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-300'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  {t('dashboard.footer.availability24Hours')}
                </button>
              </div>
            <ul className="space-y-2 min-w-0">
              {WEEKDAY_KEYS.map((day) => {
                const slot = hours.find((s) => s.day === day)!;
                return (
                  <li
                    key={day}
                    className="rounded-lg border border-stone-200/90 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900 min-w-0"
                  >
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <DashboardCheckbox
                        checked={slot.enabled}
                        onChange={(next) => updateDay(day, { enabled: next })}
                        label={
                          <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200">
                            {t(`dashboard.footer.days.${day}`)}
                          </span>
                        }
                        className="min-w-0 w-full shrink-0 sm:min-w-[7.5rem] sm:w-auto"
                      />
                      {slot.enabled ? (
                        form.availability24Hours ? (
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
                            onChange={(e) => updateDay(day, { openTime: e.target.value })}
                            onBlur={(e) => updateDay(day, { openTime: normalizeTimeInput(e.target.value, slot.openTime) })}
                            className={`${DASHBOARD_INPUT} dashboard-time-input !py-2 !px-2 text-xs sm:text-sm tabular-nums min-w-0 w-[4.25rem] max-sm:flex-1 max-sm:max-w-[5.5rem] sm:w-[5.5rem] sm:shrink-0`}
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
                            onChange={(e) => updateDay(day, { closeTime: e.target.value })}
                            onBlur={(e) => updateDay(day, { closeTime: normalizeTimeInput(e.target.value, slot.closeTime) })}
                            className={`${DASHBOARD_INPUT} dashboard-time-input !py-2 !px-2 text-xs sm:text-sm tabular-nums min-w-0 w-[4.25rem] max-sm:flex-1 max-sm:max-w-[5.5rem] sm:w-[5.5rem] sm:shrink-0`}
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
      </div>

      <ConfirmDialog
        open={toggleConfirm !== null}
        title={
          toggleConfirm
            ? t('dashboard.footer.enableAvailabilityTitle')
            : t('dashboard.footer.disableAvailabilityTitle')
        }
        message={
          toggleConfirm
            ? t('dashboard.footer.enableAvailabilityMsg')
            : t('dashboard.footer.disableAvailabilityMsg')
        }
        confirmLabel={toggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        cancelLabel={t('dashboard.common.cancel')}
        onConfirm={() => {
          if (toggleConfirm !== null) {
            set('availabilityEnabled', toggleConfirm);
            setToggleConfirm(null);
          }
        }}
        onCancel={() => setToggleConfirm(null)}
      />
    </>
  );
}
