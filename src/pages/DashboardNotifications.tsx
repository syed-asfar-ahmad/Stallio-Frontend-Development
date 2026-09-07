import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import { FieldTitleWithHelp } from '../components/FieldLabelWithHelp';
import DashboardLoading from '../components/DashboardLoading';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDashboardNotificationsRefresh } from '../context/DashboardNotificationsContext';
import type { DashboardNotification } from '../types';
import { formatNotificationTime, notificationHref, notificationTitle } from '../lib/dashboardNotificationUtils';
import { Bell, Check, Trash2 } from 'lucide-react';
import { DASHBOARD_BTN_OUTLINE } from '../lib/dashboardFormClasses';

export default function DashboardNotifications() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { notificationsTick, refreshNotifications } = useDashboardNotificationsRefresh();
  const [items, setItems] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api<DashboardNotification[]>('/api/notifications?limit=500');
      setItems(Array.isArray(list) ? list : []);
    } catch {
      toast.error(t('dashboard.notifications.loadError'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load, notificationsTick]);

  async function markRead(id: string) {
    setBusyId(id);
    try {
      await api(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)));
      refreshNotifications();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function markAllRead() {
    setBulkBusy(true);
    try {
      await api('/api/notifications/read-all', { method: 'PATCH' });
      setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })));
      refreshNotifications();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  }

  async function removeOne(id: string) {
    setBusyId(id);
    try {
      await api(`/api/notifications/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((n) => n.id !== id));
      refreshNotifications();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeAll() {
    setBulkBusy(true);
    try {
      await api('/api/notifications/all', { method: 'DELETE' });
      setItems([]);
      refreshNotifications();
      setDeleteAllOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  }

  async function openTarget(n: DashboardNotification) {
    if (!n.read) {
      try {
        await api(`/api/notifications/${n.id}/read`, { method: 'PATCH' });
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true, readAt: new Date().toISOString() } : x)));
        refreshNotifications();
      } catch {
}
    }
    navigate(notificationHref(n));
  }

  const locale = i18n.language?.split('-')[0] === 'es' ? 'es' : i18n.language?.split('-')[0] === 'ar' ? 'ar' : 'en-US';

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 dark:text-brand-400 mb-0.5 max-lg:mb-0.5 lg:mb-1">
              <Bell className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
              <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">
                {t('dashboard.notifications.nav')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
              {t('dashboard.notifications.title')}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
            <button
              type="button"
              disabled={bulkBusy || items.length === 0 || !items.some((n) => !n.read)}
              onClick={() => void markAllRead()}
              className={`${DASHBOARD_BTN_OUTLINE} w-full sm:w-auto shrink-0 whitespace-nowrap justify-center max-lg:py-2.5 max-lg:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Check className="w-4 h-4 shrink-0" />
              {t('dashboard.notifications.markAllRead')}
            </button>
            <button
              type="button"
              disabled={bulkBusy || items.length === 0}
              onClick={() => setDeleteAllOpen(true)}
              className="inline-flex w-full sm:w-auto shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-xl border-2 border-red-200 dark:border-red-900/50 px-4 py-2.5 max-lg:py-2.5 text-sm max-lg:text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {t('dashboard.notifications.deleteAll')}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden min-w-0">
        {loading ? (
          <DashboardLoading />
        ) : items.length === 0 ? (
          <div className="text-center py-12 max-lg:py-12 lg:py-16 px-4">
            <Bell className="w-10 h-10 max-lg:w-10 max-lg:h-10 lg:w-12 lg:h-12 mx-auto text-stone-300 dark:text-zinc-600 mb-3" />
            <FieldTitleWithHelp
              title={t('dashboard.notifications.empty')}
              help={t('dashboard.notifications.emptyHint')}
              titleClassName="font-semibold text-stone-800 dark:text-zinc-200"
              className="justify-center"
            />
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex flex-col gap-3 p-4 max-lg:p-4 sm:p-5 sm:flex-row sm:items-start sm:justify-between min-w-0 ${
                  !n.read ? 'bg-brand-50/40 dark:bg-brand-950/15' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => openTarget(n)}
                  className="min-w-0 flex-1 text-start rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <p className={`text-sm max-lg:text-sm lg:text-base font-medium ${!n.read ? 'text-stone-900 dark:text-zinc-100' : 'text-stone-700 dark:text-zinc-300'}`}>
                    {notificationTitle(t, n)}
                  </p>
                  <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-500 mt-1">
                    {formatNotificationTime(n.createdAt, locale)}
                    {!n.read ? `, ${t('dashboard.notifications.unread')}` : ''}
                  </p>
                </button>
                <div className="flex flex-wrap items-stretch gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={busyId === n.id || n.read}
                    onClick={() => void markRead(n.id)}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100/80 dark:hover:bg-brand-950/40 disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    {n.read ? t('dashboard.notifications.alreadyRead') : t('dashboard.notifications.markRead')}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => void removeOne(n.id)}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    {t('dashboard.notifications.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteAllOpen}
        title={t('dashboard.notifications.deleteAll')}
        message={t('dashboard.notifications.deleteAllConfirm')}
        confirmLabel={
          bulkBusy ? t('dashboard.common.deletingSelected') : t('dashboard.notifications.deleteAll')
        }
        cancelLabel={t('dashboard.common.cancel')}
        danger
        loading={bulkBusy}
        onConfirm={() => void removeAll()}
        onCancel={() => !bulkBusy && setDeleteAllOpen(false)}
      />
    </DashboardLayout>
  );
}
