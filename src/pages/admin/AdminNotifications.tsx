import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminNotification, AdminNotificationsResponse } from '../../types/admin';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading from '../../components/admin/AdminLoading';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminTheme } from '../../components/admin/adminTheme';

function formatNotificationTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<AdminNotificationsResponse>('/api/admin/notifications?limit=500');
      setItems(data.notifications ?? []);
    } catch {
      toast.error('Could not load notifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function markAllRead() {
    setBulkBusy(true);
    try {
      await api('/api/admin/notifications/read-all', { method: 'PATCH' });
      setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  }

  async function removeOne(id: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/notifications/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeAll() {
    setBulkBusy(true);
    try {
      await api('/api/admin/notifications/all', { method: 'DELETE' });
      setItems([]);
      setDeleteAllOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  }

  function openTarget(n: AdminNotification) {
    if (!n.read) {
      void api(`/api/admin/notifications/${n.id}/read`, { method: 'PATCH' }).then(() => {
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true, readAt: new Date().toISOString() } : x)),
        );
      });
    }
    navigate(n.href);
  }

  return (
    <AdminLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
              <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="text-[11px] font-semibold uppercase tracking-wide lg:text-sm lg:tracking-widest">
                Alerts
              </span>
            </div>
            <h1 className="text-xl font-bold leading-snug tracking-tight text-stone-900 dark:text-zinc-100 lg:text-2xl">
              Notifications
            </h1>
            <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
              New signups, orders, and platform alerts
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
            <button
              type="button"
              disabled={bulkBusy || items.length === 0 || !items.some((n) => !n.read)}
              onClick={() => void markAllRead()}
              className={`${adminTheme.btnSecondary} inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 lg:w-auto`}
            >
              <Check className="h-4 w-4 shrink-0" />
              Mark all read
            </button>
            <button
              type="button"
              disabled={bulkBusy || items.length === 0}
              onClick={() => setDeleteAllOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30 sm:flex-1 lg:w-auto"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Delete all
            </button>
          </div>
        </div>
      </div>

      <div className={`${adminTheme.card} min-w-0 overflow-hidden`}>
        {loading ? (
          <AdminLoading />
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-stone-300 dark:text-zinc-600 lg:h-12 lg:w-12" />
            <p className={`text-sm font-medium text-stone-800 dark:text-zinc-200`}>No notifications yet.</p>
            <p className={`mt-1 text-xs ${adminTheme.muted}`}>New signups and platform alerts will appear here.</p>
          </div>
        ) : (
          <ul className={`divide-y ${adminTheme.divide}`}>
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 ${
                  !n.read ? 'bg-brand-50/40 dark:bg-brand-950/15' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => openTarget(n)}
                  className="min-w-0 flex-1 rounded-lg text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <p
                    className={`text-sm font-medium lg:text-base ${!n.read ? 'text-stone-900 dark:text-zinc-100' : 'text-stone-700 dark:text-zinc-300'}`}
                  >
                    {n.title}
                  </p>
                  <p className={`mt-1 text-xs line-clamp-2 ${adminTheme.muted}`}>{n.message}</p>
                  <p className="mt-1 text-[11px] text-stone-500 dark:text-zinc-500">
                    {formatNotificationTime(n.createdAt)}
                    {!n.read ? ', Unread' : ''}
                  </p>
                </button>
                <div className="flex w-full shrink-0 flex-col gap-2 max-lg:flex-col sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2 sm:w-auto">
                  <button
                    type="button"
                    disabled={busyId === n.id || n.read}
                    onClick={() => void markRead(n.id)}
                    className="inline-flex w-full max-lg:w-full sm:flex-1 sm:min-w-[7rem] items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 max-lg:py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100/80 disabled:cursor-not-allowed disabled:opacity-45 dark:text-brand-300 dark:hover:bg-brand-950/40 lg:flex-none"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    {n.read ? 'Already read' : 'Mark read'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => void removeOne(n.id)}
                    className="inline-flex w-full max-lg:w-full sm:flex-1 sm:min-w-[7rem] items-center justify-center gap-1.5 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2.5 max-lg:py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50 lg:flex-none"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteAllOpen}
        title="Delete all"
        message="Delete all notifications? This cannot be undone."
        confirmLabel={bulkBusy ? 'Deleting...' : 'Delete all'}
        cancelLabel="Cancel"
        danger
        loading={bulkBusy}
        onConfirm={() => void removeAll()}
        onCancel={() => !bulkBusy && setDeleteAllOpen(false)}
      />
    </AdminLayout>
  );
}
