import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Bell, Check, ExternalLink, Menu, Trash2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ConfirmDialog from './ConfirmDialog';
import DashboardLoading from './DashboardLoading';
import { api } from '../lib/api';
import type { DashboardNotification } from '../types';
import { formatNotificationTime, notificationHref, notificationTitle } from '../lib/dashboardNotificationUtils';
import { useDashboardNotificationsRefresh } from '../context/DashboardNotificationsContext';

type Props = {
  shopName: string;
  shopPublicUrl: string;
  onOpenMobileMenu: () => void;
};

export default function DashboardTopBar({ shopName, shopPublicUrl, onOpenMobileMenu }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { notificationsTick, refreshNotifications } = useDashboardNotificationsRefresh();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<DashboardNotification[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const fetchUnread = useCallback(async () => {
    try {
      const { count } = await api<{ count: number }>('/api/notifications/unread-count');
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadRecent = useCallback(() => {
    setLoadingRecent(true);
    api<DashboardNotification[]>('/api/notifications?recent=1&limit=15')
      .then((list) => setRecent(Array.isArray(list) ? list : []))
      .catch(() => setRecent([]))
      .finally(() => setLoadingRecent(false));
  }, []);

  useEffect(() => {
    void fetchUnread();
  }, [fetchUnread, notificationsTick]);

  useEffect(() => {
    const id = window.setInterval(() => void fetchUnread(), 30000);
    return () => window.clearInterval(id);
  }, [fetchUnread]);

  useEffect(() => {
    if (!open) return;
    loadRecent();
  }, [open, notificationsTick, loadRecent]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      const panel = document.getElementById('dashboard-notifications-panel');
      if (panel?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const margin = 16;
    const maxWidth = 384;

    function updatePanelPosition() {
      const bell = bellRef.current;
      if (!bell) return;
      const r = bell.getBoundingClientRect();
      const mobile = window.innerWidth < 1024;

      if (mobile) {
        setPanelStyle({
          position: 'fixed',
          top: r.bottom + 8,
          left: margin,
          width: window.innerWidth - margin * 2,
          maxHeight: 'min(85vh, 28rem)',
          zIndex: 200,
        });
        return;
      }

      const width = Math.min(window.innerWidth - margin * 2, maxWidth);
      let left = r.right - width;
      left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

      setPanelStyle({
        position: 'fixed',
        top: r.bottom + 8,
        left,
        width,
        maxHeight: 'min(85vh, 28rem)',
        zIndex: 200,
      });
    }

    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open]);

  const locale = i18n.language?.split('-')[0] === 'es' ? 'es' : i18n.language?.split('-')[0] === 'ar' ? 'ar' : 'en-US';

  function onOpenDetail(n: DashboardNotification) {
    setOpen(false);
    navigate(notificationHref(n));
  }

  async function onMarkReadOne(n: DashboardNotification, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (n.read || busyId) return;
    setBusyId(n.id);
    try {
      await api(`/api/notifications/${n.id}/read`, { method: 'PATCH' });
      setRecent((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true, readAt: new Date().toISOString() } : x)));
      refreshNotifications();
      await fetchUnread();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onDeleteOne(n: DashboardNotification, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busyId) return;
    setBusyId(n.id);
    try {
      await api(`/api/notifications/${n.id}`, { method: 'DELETE' });
      setRecent((prev) => prev.filter((x) => x.id !== n.id));
      refreshNotifications();
      await fetchUnread();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onMarkAllReadPanel() {
    if (bulkBusy || recent.length === 0 || !recent.some((n) => !n.read)) return;
    setBulkBusy(true);
    try {
      await api('/api/notifications/read-all', { method: 'PATCH' });
      setRecent((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })));
      refreshNotifications();
      await fetchUnread();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBulkBusy(false);
    }
  }

  async function onDeleteAllConfirmed() {
    setBulkBusy(true);
    try {
      await api('/api/notifications/all', { method: 'DELETE' });
      setRecent([]);
      refreshNotifications();
      await fetchUnread();
      setDeleteAllOpen(false);
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBulkBusy(false);
    }
  }

  const badgeText = unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden shrink-0 rounded-xl p-2.5 text-stone-600 transition-colors hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={t('dashboard.layout.openMenu')}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <span className="min-w-0 truncate font-semibold text-stone-800 dark:text-zinc-100 lg:hidden">{shopName}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="relative z-40" ref={wrapRef}>
            <button
              ref={bellRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-brand-500/40 dark:hover:bg-zinc-800 dark:hover:text-brand-300"
              aria-label={t('dashboard.layout.notifications')}
              aria-expanded={open}
            >
              <Bell className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
              {badgeText ? (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm tabular-nums">
                  {badgeText}
                </span>
              ) : null}
            </button>

            {open && typeof document !== 'undefined'
              ? createPortal(
                  <div
                    id="dashboard-notifications-panel"
                    style={panelStyle}
                    className="rounded-xl border border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 shadow-xl dark:shadow-black/40 overflow-hidden flex flex-col"
                    role="menu"
                  >
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                      {loadingRecent ? (
                        <DashboardLoading compact />
                      ) : recent.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-stone-500 dark:text-zinc-400">{t('dashboard.notifications.empty')}</p>
                      ) : (
                        <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
                          {recent.map((n) => (
                            <li key={n.id} className={`px-3 py-2.5 ${!n.read ? 'bg-brand-50/40 dark:bg-brand-950/15' : ''}`}>
                              <button
                                type="button"
                                className="w-full text-start rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                                onClick={() => onOpenDetail(n)}
                              >
                                <span
                                  className={`text-sm line-clamp-2 ${!n.read ? 'font-medium text-stone-900 dark:text-zinc-100' : 'text-stone-700 dark:text-zinc-300'}`}
                                >
                                  {notificationTitle(t, n)}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-stone-500 dark:text-zinc-500">
                                  {formatNotificationTime(n.createdAt, locale)}
                                </span>
                              </button>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  disabled={busyId === n.id || n.read}
                                  onClick={(e) => void onMarkReadOne(n, e)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100/80 dark:hover:bg-brand-950/40 disabled:opacity-45 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-3 h-3 shrink-0" />
                                  {n.read ? t('dashboard.notifications.alreadyRead') : t('dashboard.notifications.markRead')}
                                </button>
                                <button
                                  type="button"
                                  disabled={busyId === n.id}
                                  onClick={(e) => void onDeleteOne(n, e)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                                >
                                  <Trash2 className="w-3 h-3 shrink-0" />
                                  {t('dashboard.notifications.delete')}
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="shrink-0 border-t border-stone-100 dark:border-zinc-800 p-2 space-y-2 bg-stone-50/50 dark:bg-zinc-950/40">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={bulkBusy || recent.length === 0 || !recent.some((n) => !n.read)}
                          onClick={() => void onMarkAllReadPanel()}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 dark:border-zinc-600 py-2 text-xs font-semibold text-stone-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          {t('dashboard.notifications.markAllRead')}
                        </button>
                        <button
                          type="button"
                          disabled={bulkBusy || recent.length === 0}
                          onClick={() => {
                            setOpen(false);
                            setDeleteAllOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 py-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t('dashboard.notifications.deleteAll')}
                        </button>
                      </div>
                      <Link
                        to="/dashboard/notifications"
                        role="menuitem"
                        className="flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                        onClick={() => setOpen(false)}
                      >
                        {t('dashboard.notifications.viewAll')}
                      </Link>
                    </div>
                  </div>,
                  document.body,
                )
              : null}
          </div>

          <ConfirmDialog
            open={deleteAllOpen}
            title={t('dashboard.notifications.deleteAll')}
            message={t('dashboard.notifications.deleteAllConfirm')}
            confirmLabel={t('dashboard.notifications.deleteAll')}
            cancelLabel={t('dashboard.common.cancel')}
            danger
            loading={bulkBusy}
            onConfirm={() => void onDeleteAllConfirmed()}
            onCancel={() => !bulkBusy && setDeleteAllOpen(false)}
          />

          <ThemeToggle />

          {shopPublicUrl ? (
            <a
              href={shopPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-2 border-brand-600 bg-brand-600 px-2.5 text-xs font-semibold text-white shadow-sm shadow-brand-600/20 transition-colors hover:border-brand-500 hover:bg-brand-500 sm:px-3 sm:text-sm"
              title={t('dashboard.layout.viewStore')}
            >
              <ExternalLink className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
              <span className="hidden truncate sm:inline">{t('dashboard.layout.viewStore')}</span>
              <span className="sr-only sm:hidden">{t('dashboard.layout.viewStore')}</span>
            </a>
          ) : (
            <span
              className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-stone-300 px-2.5 text-xs font-medium text-stone-400 dark:border-zinc-600 dark:text-zinc-500 sm:px-3 sm:text-sm"
              title={t('dashboard.layout.viewStoreDisabled')}
              role="status"
            >
              <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span className="hidden sm:inline">{t('dashboard.layout.viewStore')}</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
