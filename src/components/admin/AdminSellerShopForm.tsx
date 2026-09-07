import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Footprints,
  Home,
  LayoutGrid,
  Megaphone,
  Package,
  RotateCcw,
  Save,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AdminSellerShopFields } from '../../types/admin';
import DashboardSwitch from '../DashboardSwitch';
import ConfirmDialog from '../ConfirmDialog';
import { AdminLoadingInline } from './AdminLoading';
import {
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../../lib/dashboardFormClasses';
import AdminShopAnnouncementFields from './shopSettings/AdminShopAnnouncementFields';
import AdminShopAboutFields from './shopSettings/AdminShopAboutFields';
import AdminShopCategoriesFields from './shopSettings/AdminShopCategoriesFields';
import AdminShopDeliveryFields from './shopSettings/AdminShopDeliveryFields';
import AdminShopRefundFields from './shopSettings/AdminShopRefundFields';
import AdminShopFooterFields from './shopSettings/AdminShopFooterFields';
import AdminShopHomeFields from './shopSettings/AdminShopHomeFields';
import AdminShopLanguagesFields from './shopSettings/AdminShopLanguagesFields';
import {
  SHOP_SETTINGS_CARD,
  ShopSettingsDisabledHint,
  ShopSettingsStack,
} from './shopSettings/shopSettingsLayout';

type Props = {
  form: AdminSellerShopFields;
  onChange: (form: AdminSellerShopFields) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  productsPanel?: ReactNode;
  shopName?: string;
  currencyCode?: string | null;
};

type SectionId = 'home' | 'announcement' | 'about' | 'categories' | 'footer' | 'delivery' | 'refund' | 'products';

const SECTIONS: {
  id: SectionId;
  labelKey: string;
  icon: LucideIcon;
  enabledKey?: keyof Pick<
    AdminSellerShopFields,
    'announcementEnabled' | 'aboutEnabled' | 'categoriesEnabled' | 'footerEnabled' | 'deliveryEnabled'
  >;
  toggleTitleKey?: string;
  toggleHintKey?: string;
  disabledTitleKey?: string;
  disabledBodyKey?: string;
}[] = [
  {
    id: 'home',
    labelKey: 'dashboard.layout.home',
    icon: Home,
  },
  {
    id: 'announcement',
    labelKey: 'dashboard.delivery.announcement',
    icon: Megaphone,
    enabledKey: 'announcementEnabled',
    toggleTitleKey: 'dashboard.delivery.showBar',
    toggleHintKey: 'dashboard.delivery.showBarHint',
    disabledTitleKey: 'dashboard.delivery.announcement',
    disabledBodyKey: 'dashboard.delivery.showBarHint',
  },
  {
    id: 'about',
    labelKey: 'dashboard.layout.about',
    icon: FileText,
    enabledKey: 'aboutEnabled',
    toggleTitleKey: 'dashboard.about.toggleTitle',
    toggleHintKey: 'dashboard.about.toggleHint',
    disabledTitleKey: 'dashboard.about.title',
    disabledBodyKey: 'dashboard.about.toggleHint',
  },
  {
    id: 'categories',
    labelKey: 'dashboard.layout.categories',
    icon: LayoutGrid,
    enabledKey: 'categoriesEnabled',
    toggleTitleKey: 'dashboard.categories.toggleTitle',
    toggleHintKey: 'dashboard.categories.toggleHint',
    disabledTitleKey: 'dashboard.categories.title',
    disabledBodyKey: 'dashboard.categories.toggleHint',
  },
  {
    id: 'footer',
    labelKey: 'dashboard.layout.footer',
    icon: Footprints,
    enabledKey: 'footerEnabled',
    toggleTitleKey: 'dashboard.footer.toggleTitle',
    toggleHintKey: 'dashboard.footer.toggleHint',
    disabledTitleKey: 'dashboard.footer.title',
    disabledBodyKey: 'dashboard.footer.toggleHint',
  },
  {
    id: 'delivery',
    labelKey: 'dashboard.delivery.deliveryCharges',
    icon: Truck,
    enabledKey: 'deliveryEnabled',
    toggleTitleKey: 'dashboard.delivery.enableCharges',
    toggleHintKey: 'dashboard.delivery.enableChargesHint',
    disabledTitleKey: 'dashboard.delivery.title',
    disabledBodyKey: 'dashboard.delivery.enableChargesHint',
  },
  {
    id: 'refund',
    labelKey: 'dashboard.refund.title',
    icon: RotateCcw,
  },
];

type ToggleConfirm = {
  enabledKey: (typeof SECTIONS)[number]['enabledKey'];
  next: boolean;
  titleKey: string;
};

function parseAnnouncements(text: string): string[] {
  const raw = text.split('\n').map((line) => line.trim()).filter(Boolean);
  return raw.length > 0 ? raw : [];
}

function joinAnnouncements(lines: string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join('\n');
}

export default function AdminSellerShopForm({
  form,
  onChange,
  onSubmit,
  saving,
  productsPanel,
  shopName = '',
  currencyCode,
}: Props) {
  const { t } = useTranslation();
  const [section, setSection] = useState<SectionId>('home');
  const [toggleConfirm, setToggleConfirm] = useState<ToggleConfirm | null>(null);
  const [codToggleConfirm, setCodToggleConfirm] = useState<boolean | null>(null);
  const [refundToggleConfirm, setRefundToggleConfirm] = useState<boolean | null>(null);
  const [announcements, setAnnouncements] = useState<string[]>(() => parseAnnouncements(form.announcementText));

  const currency = currencyCode?.trim() || t('dashboard.delivery.currencyFallback');

  const set = <K extends keyof AdminSellerShopFields>(key: K, value: AdminSellerShopFields[K]) => {
    onChange({ ...form, [key]: value });
  };

  useEffect(() => {
    setAnnouncements(parseAnnouncements(form.announcementText));
  }, [form.announcementText]);

  function setAnnouncementsAndForm(next: string[]) {
    setAnnouncements(next);
    set('announcementText', joinAnnouncements(next));
  }

  const isProducts = section === 'products';
  const active = SECTIONS.find((s) => s.id === section);
  const enabled = active?.enabledKey ? (form[active.enabledKey] as boolean) : true;

  function renderSectionBody(): ReactNode {
    switch (section) {
      case 'home':
        return <AdminShopHomeFields form={form} set={set} shopName={shopName} />;
      case 'announcement':
        return (
          <>
            <AdminShopLanguagesFields form={form} set={set} />
            <AdminShopAnnouncementFields
              form={form}
              set={set}
              announcements={announcements}
              setAnnouncements={setAnnouncementsAndForm}
            />
          </>
        );
      case 'about':
        return <AdminShopAboutFields form={form} set={set} />;
      case 'categories':
        return <AdminShopCategoriesFields form={form} set={set} />;
      case 'footer':
        return <AdminShopFooterFields form={form} set={set} shopName={shopName} />;
      case 'delivery':
        return (
          <AdminShopDeliveryFields
            form={form}
            set={set}
            currencyCode={currency}
            onCodToggle={(next) => setCodToggleConfirm(next)}
          />
        );
      case 'refund':
        return (
          <AdminShopRefundFields
            form={form}
            set={set}
            onRefundToggle={(next) => setRefundToggleConfirm(next)}
          />
        );
      default:
        return null;
    }
  }

  const sectionButtons = (
    <>
      {SECTIONS.map(({ id, labelKey, icon: Icon }) => {
        const isActive = section === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 max-lg:px-3 lg:px-4 py-2 text-xs max-lg:text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-white text-brand-800 shadow-sm dark:bg-zinc-800 dark:text-brand-300'
                : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t(labelKey)}</span>
          </button>
        );
      })}
      {productsPanel ? (
        <button
          type="button"
          onClick={() => setSection('products')}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 max-lg:px-3 lg:px-4 py-2 text-xs max-lg:text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
            isProducts
              ? 'bg-white text-brand-800 shadow-sm dark:bg-zinc-800 dark:text-brand-300'
              : 'text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Package className="h-4 w-4 shrink-0" aria-hidden />
          <span>{t('dashboard.layout.products')}</span>
        </button>
      ) : null}
    </>
  );

  return (
    <form onSubmit={onSubmit} className="pb-28 max-lg:pb-28 lg:pb-24 min-w-0 w-full max-w-6xl mx-auto">
      <div className="mb-4 max-lg:mb-4 lg:mb-6 min-w-0" aria-label="Shop sections">
        <div className="max-lg:overflow-x-auto max-lg:pb-1 lg:overflow-visible">
          <nav className="inline-flex gap-1 rounded-xl border border-stone-200 bg-stone-50/80 p-1 dark:border-zinc-700 dark:bg-zinc-900/80 lg:flex lg:w-full lg:flex-wrap">
            {sectionButtons}
          </nav>
        </div>
      </div>

      {isProducts && productsPanel ? (
        <div className={`${SHOP_SETTINGS_CARD} p-4 max-lg:p-4 lg:p-6 min-w-0`}>{productsPanel}</div>
      ) : active ? (
        <ShopSettingsStack>
          {active.enabledKey ? (
            <div className={`${SHOP_SETTINGS_CARD} overflow-visible min-w-0`}>
              <div className="p-4 max-lg:p-4 lg:p-6 border-b border-stone-100 dark:border-zinc-800">
                <div className={DASHBOARD_TOGGLE_ROW}>
                  <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                    <p className="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200">
                      {t(active.toggleTitleKey!)}
                    </p>
                  </div>
                  <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                    <DashboardSwitch
                      checked={enabled}
                      onCheckedChange={(next) =>
                        setToggleConfirm({
                          enabledKey: active.enabledKey!,
                          next,
                          titleKey: active.toggleTitleKey!,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {active.enabledKey && !enabled ? (
            <ShopSettingsDisabledHint titleKey={active.disabledTitleKey!} bodyKey={active.disabledBodyKey!} />
          ) : (
            renderSectionBody()
          )}
        </ShopSettingsStack>
      ) : null}

      {!isProducts ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200/90 bg-white/90 px-3 max-lg:px-3 py-3 max-lg:py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 lg:left-[18rem] lg:px-4">
          <div className="mx-auto flex max-w-6xl justify-stretch lg:justify-end min-w-0">
            <button
              type="submit"
              disabled={saving}
              className={`${DASHBOARD_BTN_PRIMARY} w-full max-lg:w-full lg:w-auto max-lg:py-3`}
            >
              {saving ? <AdminLoadingInline light dotsOnly /> : <Save className="w-5 h-5 shrink-0" aria-hidden />}
              {saving ? t('dashboard.common.saving') : t('dashboard.categories.saveChanges')}
            </button>
          </div>
        </div>
      ) : (
        <div className="pb-8" />
      )}

      <ConfirmDialog
        open={toggleConfirm !== null}
        title={toggleConfirm ? t(toggleConfirm.titleKey) : ''}
        message={toggleConfirm ? t(active?.toggleHintKey ?? '') : ''}
        confirmLabel={toggleConfirm?.next ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        cancelLabel={t('dashboard.common.cancel')}
        onConfirm={() => {
          if (toggleConfirm?.enabledKey) {
            set(toggleConfirm.enabledKey, toggleConfirm.next as boolean);
            setToggleConfirm(null);
          }
        }}
        onCancel={() => setToggleConfirm(null)}
      />

      <ConfirmDialog
        open={codToggleConfirm !== null}
        title={
          codToggleConfirm ? t('dashboard.delivery.enableCodTitle') : t('dashboard.delivery.disableCodTitle')
        }
        message={codToggleConfirm ? t('dashboard.delivery.enableCodMsg') : t('dashboard.delivery.disableCodMsg')}
        confirmLabel={codToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        cancelLabel={t('dashboard.common.cancel')}
        onConfirm={() => {
          if (codToggleConfirm !== null) {
            set('deliveryCodEnabled', codToggleConfirm);
            setCodToggleConfirm(null);
          }
        }}
        onCancel={() => setCodToggleConfirm(null)}
      />

      <ConfirmDialog
        open={refundToggleConfirm !== null}
        title={refundToggleConfirm ? t('dashboard.refund.enableTitle') : t('dashboard.refund.disableTitle')}
        message={refundToggleConfirm ? t('dashboard.refund.enableMsg') : t('dashboard.refund.disableMsg')}
        confirmLabel={refundToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        cancelLabel={t('dashboard.common.cancel')}
        onConfirm={() => {
          if (refundToggleConfirm !== null) {
            set('refundEnabled', refundToggleConfirm);
            setRefundToggleConfirm(null);
          }
        }}
        onCancel={() => setRefundToggleConfirm(null)}
      />
    </form>
  );
}
