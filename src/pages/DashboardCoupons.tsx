import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BadgePercent, Plus, Trash2, Pencil, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import DashboardLoading, { AdminLoadingInline } from '../components/DashboardLoading';
import DashboardSwitch from '../components/DashboardSwitch';
import DashboardSelect from '../components/DashboardSelect';
import DashboardDateInput from '../components/DashboardDateInput';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../lib/api';
import { formatPrice } from '../lib/countryCurrencyOptions';
import { useAuth } from '../context/AuthContext';
import type { Coupon } from '../types';
import {
  DASHBOARD_INPUT,
  DASHBOARD_NUMBER_INPUT,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_ICON_CLOSE_BTN,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';

export default function DashboardCoupons() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'add' | string>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [active, setActive] = useState(true);
  const [activeToggleConfirm, setActiveToggleConfirm] = useState<boolean | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api<Coupon[]>('/api/coupons');
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setCode('');
    setDiscountType('percent');
    setDiscountValue('');
    setExpiresAt('');
    setActive(true);
    setModal('add');
  }

  function openEdit(c: Coupon) {
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(String(c.discountValue));
    setExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 10) : '');
    setActive(c.active !== false);
    setModal(c.id);
  }

  async function saveModal() {
    const val = parseFloat(discountValue);
    if (!code.trim() || isNaN(val) || val < 0) {
      toast.error(t('dashboard.coupons.validation'));
      return;
    }
    if (discountType === 'percent' && val > 100) {
      toast.error(t('dashboard.coupons.validationPercent'));
      return;
    }
    setSaving(true);
    try {
      const body = {
        code: code.trim(),
        discountType,
        discountValue: val,
        expiresAt: expiresAt.trim() ? expiresAt : null,
        active,
      };
      if (modal === 'add') {
        await api('/api/coupons', { method: 'POST', body });
        toast.success(t('dashboard.coupons.toastAdded'));
      } else if (modal) {
        await api(`/api/coupons/${modal}`, { method: 'PATCH', body });
        toast.success(t('dashboard.coupons.toastUpdated'));
      }
      setModal(null);
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/coupons/${deleteId}`, { method: 'DELETE' });
      toast.success(t('dashboard.coupons.toastDeleted'));
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  function isExpired(c: Coupon) {
    if (!c.expiresAt) return false;
    return new Date(c.expiresAt).getTime() < Date.now();
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
              <BadgePercent className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
              <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
                {t('dashboard.coupons.section')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
              {t('dashboard.coupons.title')}
            </h1>
            <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">{t('dashboard.coupons.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className={`${DASHBOARD_BTN_PRIMARY} w-full justify-center max-lg:py-2.5 max-lg:text-sm lg:w-auto lg:shrink-0`}
          >
            <Plus className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5 shrink-0" />
            {t('dashboard.coupons.add')}
          </button>
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 max-lg:p-8 lg:p-16 text-center shadow-sm min-w-0">
          <div className="w-14 h-14 max-lg:w-14 max-lg:h-14 lg:w-16 lg:h-16 rounded-xl max-lg:rounded-xl lg:rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/25">
            <BadgePercent className="w-7 h-7 max-lg:w-7 max-lg:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <p className="text-sm max-lg:text-sm lg:text-base text-stone-600 dark:text-zinc-400">{t('dashboard.coupons.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-3 max-lg:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 min-w-0">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-5 shadow-sm ring-1 ring-stone-100/80 dark:ring-zinc-800/80 min-w-0"
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-mono font-bold text-base max-lg:text-base lg:text-lg text-brand-700 dark:text-brand-400 break-all">{c.code}</p>
                  <p className="text-xs max-lg:text-xs lg:text-sm text-stone-600 dark:text-zinc-400 mt-1">
                    {c.discountType === 'percent'
                      ? t('dashboard.coupons.percentOff', { value: c.discountValue })
                      : t('dashboard.coupons.fixedOff', { value: formatPrice(c.discountValue, user?.currency) })}
                  </p>
                  {c.expiresAt && (
                    <p className={`text-[10px] max-lg:text-[10px] lg:text-xs mt-2 ${isExpired(c) ? 'text-red-600 dark:text-red-400' : 'text-stone-500 dark:text-zinc-400'}`}>
                      {isExpired(c) ? t('dashboard.coupons.expired') : t('dashboard.coupons.expires', { date: new Date(c.expiresAt).toLocaleDateString() })}
                    </p>
                  )}
                  {c.active === false && (
                    <span className="inline-block mt-2 text-[10px] max-lg:text-[10px] lg:text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full">
                      {t('dashboard.coupons.inactive')}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                    aria-label={t('dashboard.common.edit')}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(c.id)}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                    aria-label={t('dashboard.common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex min-w-0 gap-1.5 sm:gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-lg border-2 border-stone-200 bg-white px-2 py-2 text-[10px] font-medium text-stone-700 hover:border-brand-200 hover:bg-brand-50 sm:gap-1.5 sm:px-2.5 sm:text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40"
                  aria-label={t('dashboard.common.edit')}
                >
                  <Pencil className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />
                  <span className="truncate">{t('dashboard.common.edit')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(c.id)}
                  className="inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-lg border-2 border-red-200 bg-red-50 px-2 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-100 sm:gap-1.5 sm:px-2.5 sm:text-xs dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50"
                  aria-label={t('dashboard.common.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />
                  <span className="truncate">{t('dashboard.common.delete')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div
            className="w-full max-h-[min(92vh,100%)] sm:max-h-[90vh] max-w-lg flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 max-lg:px-4 sm:px-6 sm:py-4 border-b border-stone-100 dark:border-zinc-800 shrink-0">
              <h3 className="text-base max-lg:text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100 pr-2 min-w-0">
                {modal === 'add' ? t('dashboard.coupons.modalAdd') : t('dashboard.coupons.modalEdit')}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9 shrink-0`}
                aria-label={t('dashboard.common.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 max-lg:p-4 sm:p-6 space-y-4 min-w-0">
              <div className="min-w-0">
                <label className="block text-xs max-lg:text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200 mb-2">{t('dashboard.coupons.code')}</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={`${DASHBOARD_INPUT} font-mono uppercase`}
                  placeholder="SAVE10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0">
                  <label className="block text-xs max-lg:text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200 mb-2">{t('dashboard.coupons.type')}</label>
                  <DashboardSelect
                    value={discountType}
                    onChange={(v) => setDiscountType(v as 'percent' | 'fixed')}
                    options={[
                      { value: 'percent', label: t('dashboard.coupons.typePercent') },
                      { value: 'fixed', label: t('dashboard.coupons.typeFixed') },
                    ]}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs max-lg:text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200 mb-2">{t('dashboard.coupons.value')}</label>
                  <input
                    type="number"
                    min="0"
                    step={discountType === 'percent' ? '1' : '0.01'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className={DASHBOARD_NUMBER_INPUT}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <label className="block text-xs max-lg:text-xs sm:text-sm font-semibold text-stone-800 dark:text-zinc-200 mb-2">{t('dashboard.coupons.expiry')}</label>
                <DashboardDateInput
                  value={expiresAt}
                  onChange={setExpiresAt}
                  disablePast
                  placeholder={t('dashboard.coupons.datePlaceholder')}
                  clearLabel={t('dashboard.coupons.clearDate')}
                />
              </div>
              <div className={`${DASHBOARD_TOGGLE_ROW} rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-950/50 p-3 max-lg:p-3 sm:p-4`}>
                <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                  <p className="font-semibold text-stone-800 dark:text-zinc-200 text-xs max-lg:text-xs sm:text-sm">{t('dashboard.coupons.active')}</p>
                </div>
                <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                  <DashboardSwitch checked={active} onCheckedChange={setActiveToggleConfirm} />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 max-lg:px-4 sm:px-6 sm:py-4 border-t border-stone-100 dark:border-zinc-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 shrink-0 bg-white dark:bg-zinc-900">
              <button type="button" onClick={() => setModal(null)} className={`${DASHBOARD_BTN_SECONDARY} w-full sm:w-auto justify-center`}>
                {t('dashboard.common.cancel')}
              </button>
              <button
                type="button"
                onClick={saveModal}
                disabled={saving}
                className={`${DASHBOARD_BTN_PRIMARY} w-full sm:w-auto justify-center !px-4 !py-2.5 inline-flex items-center gap-2`}
              >
                {saving ? <AdminLoadingInline light dotsOnly /> : null}
                {saving ? t('dashboard.common.saving') : t('dashboard.common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        title={t('dashboard.coupons.deleteTitle')}
        message={t('dashboard.coupons.deleteMessage')}
        confirmLabel={deleting ? t('dashboard.common.deleting') : t('dashboard.common.delete')}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteId(null)}
        danger
      />
      <ConfirmDialog
        open={activeToggleConfirm !== null}
        title={
          activeToggleConfirm
            ? t('dashboard.coupons.enableActiveTitle')
            : t('dashboard.coupons.disableActiveTitle')
        }
        message={
          activeToggleConfirm
            ? t('dashboard.coupons.enableActiveMsg')
            : t('dashboard.coupons.disableActiveMsg')
        }
        confirmLabel={activeToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (activeToggleConfirm !== null) {
            setActive(activeToggleConfirm);
            setActiveToggleConfirm(null);
          }
        }}
        onCancel={() => setActiveToggleConfirm(null)}
      />
    </DashboardLayout>
  );
}
