import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminNotification, AdminNotificationsResponse } from '../../types/admin';
import ConfirmDialog from '../ConfirmDialog';
import AdminLoading from './AdminLoading';

function formatNotificationTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminNotificationsBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const fetchUnread = useCallback(async () => {
    try {
      const { count } = await api<{ count: number }>('/api/admin/notifications/unread-count');
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadPanel = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<AdminNotificationsResponse>('/api/admin/notifications?limit=15');
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    const id = window.setInterval(() => void fetchUnread(), 15000);
    const onFocus = () => void fetchUnread();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchUnread]);

  useEffect(() => {
    if (!open) return;
    void loadPanel();
  }, [open, loadPanel]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      const panel = document.getElementById('admin-notifications-panel');
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

  function onOpenDetail(n: AdminNotification) {
    setOpen(false);
    navigate(n.href);
  }

  async function onMarkReadOne(n: AdminNotification, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (n.read || busyId) return;
    setBusyId(n.id);
    try {
      await api(`/api/admin/notifications/${n.id}/read`, { method: 'PATCH' });
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true, readAt: new Date().toISOString() } : x)),
      );
      await fetchUnread();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onDeleteOne(n: AdminNotification, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busyId) return;
    setBusyId(n.id);
    try {
      await api(`/api/admin/notifications/${n.id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((x) => x.id !== n.id));
      await fetchUnread();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onMarkAllReadPanel() {
    if (bulkBusy || items.length === 0 || !items.some((n) => !n.read)) return;
    setBulkBusy(true);
    try {
      await api('/api/admin/notifications/read-all', { method: 'PATCH' });
      setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not mark notifications as read');
    } finally {
      setBulkBusy(false);
    }
  }

  async function onDeleteAllConfirmed() {
    setBulkBusy(true);
    try {
      await api('/api/admin/notifications/all', { method: 'DELETE' });
      setItems([]);
      setUnreadCount(0);
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
    <>
      <div ref={wrapRef} className="relative z-40">
        <button
          ref={bellRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-brand-500/40 dark:hover:bg-zinc-800 dark:hover:text-brand-300"
          aria-label="Notifications"
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
                id="admin-notifications-panel"
                style={panelStyle}
                className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-black/40"
                role="menu"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  {loading ? (
                    <AdminLoading compact />
                  ) : items.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-stone-500 dark:text-zinc-400">No notifications yet.</p>
                  ) : (
                    <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
                      {items.map((n) => (
                        <li key={n.id} className={`px-3 py-2.5 ${!n.read ? 'bg-brand-50/40 dark:bg-brand-950/15' : ''}`}>
                          <button
                            type="button"
                            className="w-full rounded-md text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            onClick={() => onOpenDetail(n)}
                          >
                            <span
                              className={`text-sm line-clamp-2 ${!n.read ? 'font-medium text-stone-900 dark:text-zinc-100' : 'text-stone-700 dark:text-zinc-300'}`}
                            >
                              {n.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-stone-500 dark:text-zinc-500">
                              {formatNotificationTime(n.createdAt)}
                            </span>
                          </button>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={busyId === n.id || n.read}
                              onClick={(e) => void onMarkReadOne(n, e)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100/80 dark:hover:bg-brand-950/40 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              <Check className="w-3 h-3 shrink-0" />
                              {n.read ? 'Already read' : 'Mark read'}
                            </button>
                            <button
                              type="button"
                              disabled={busyId === n.id}
                              onClick={(e) => void onDeleteOne(n, e)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3 shrink-0" />
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="shrink-0 space-y-2 border-t border-stone-100 bg-stone-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={bulkBusy || items.length === 0 || !items.some((n) => !n.read)}
                      onClick={() => void onMarkAllReadPanel()}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 py-2 text-xs font-semibold text-stone-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                    <button
                      type="button"
                      disabled={bulkBusy || items.length === 0}
                      onClick={() => {
                        setOpen(false);
                        setDeleteAllOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/25"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete all
                    </button>
                  </div>
                  <Link
                    to="/admin/notifications"
                    role="menuitem"
                    className="flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950/30"
                    onClick={() => setOpen(false)}
                  >
                    View all
                  </Link>
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>

      <ConfirmDialog
        open={deleteAllOpen}
        title="Delete all"
        message="Delete all notifications? This cannot be undone."
        confirmLabel={bulkBusy ? 'Deleting...' : 'Delete all'}
        cancelLabel="Cancel"
        danger
        loading={bulkBusy}
        onConfirm={() => void onDeleteAllConfirmed()}
        onCancel={() => !bulkBusy && setDeleteAllOpen(false)}
      />
    </>
  );
}
