import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Inbox, Search, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPagination from '../../components/admin/AdminPagination';
import { adminTheme } from '../../components/admin/adminTheme';
import AdminLoading from '../../components/admin/AdminLoading';
import ConfirmDialog from '../../components/ConfirmDialog';
import { api } from '../../lib/api';
import type { AdminMessage } from '../../types/admin';

const LIMIT = 20;

export default function AdminMessages() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), source: 'marketing' });
      if (query) params.set('search', query);
      if (pendingOnly) params.set('pending', 'true');
      const data = await api<{ messages: AdminMessage[]; total: number }>(`/api/admin/messages?${params}`);
      setMessages(data.messages);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [page, query, pendingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!deleteId || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/admin/messages/${deleteId}`, { method: 'DELETE' });
      toast.success('Message deleted');
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-6 flex flex-col gap-3 max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between min-w-0">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-brand-700 dark:text-brand-400">
            <Inbox className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest lg:text-sm">Admin</span>
          </div>
          <h1 className="text-xl max-lg:leading-snug lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            Contact Messages
          </h1>
          <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
            Inquiries from the marketing website contact form
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPendingOnly((v) => !v);
            setPage(1);
          }}
          className={`w-full max-lg:w-full lg:w-auto shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pendingOnly
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              : 'border border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          {pendingOnly ? 'Showing Unanswered' : 'Unanswered Only'}
        </button>
      </div>

      <form
        className={`${adminTheme.card} mb-4 max-lg:mb-4 lg:mb-6 flex flex-col gap-2 max-lg:gap-2 lg:flex-row lg:items-center p-4 max-lg:p-4 min-w-0`}
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search.trim());
        }}
      >
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className={`${adminTheme.input} pl-10`}
          />
        </div>
        <button type="submit" className={`${adminTheme.btnPrimary} w-full max-lg:w-full lg:w-auto shrink-0`}>
          Search
        </button>
      </form>

      <div className="space-y-3 max-lg:space-y-3 min-w-0">
        {loading ? (
          <div className={`${adminTheme.card} p-6`}>
            <AdminLoading compact />
          </div>
        ) : messages.length === 0 ? (
          <div className={`${adminTheme.card} px-4 py-10 text-center`}>
            <p className={`text-sm ${adminTheme.muted}`}>No messages found</p>
          </div>
        ) : (
          messages.map((m) => (
            <article
              key={m.id}
              className={`${adminTheme.card} p-4 max-lg:p-4 lg:p-5 min-w-0 overflow-hidden`}
            >
              <div className="flex flex-col gap-3 max-lg:gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-900 dark:text-zinc-100 truncate">{m.customerName}</p>
                  <p className="text-sm text-stone-500 dark:text-zinc-400 truncate">{m.customerEmail}</p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-zinc-500">
                    Marketing website, {format(new Date(m.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end shrink-0">
                  {!m.responded ? (
                    <span className={adminTheme.badgePending}>Unanswered</span>
                  ) : (
                    <span className={`${adminTheme.badgeBase} bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400`}>
                      Answered
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteId(m.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50 sm:border-0 sm:bg-transparent sm:p-2 sm:font-normal"
                    aria-label="Delete message"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
              {m.subject ? (
                <p className="mt-3 text-sm font-medium text-stone-900 dark:text-zinc-100 break-words">
                  Subject: {m.subject}
                </p>
              ) : null}
              <p
                className={`text-sm text-stone-700 dark:text-zinc-300 whitespace-pre-wrap break-words ${m.subject ? 'mt-2' : 'mt-3'}`}
              >
                {m.message}
              </p>
            </article>
          ))
        )}
      </div>

      <AdminPagination className="mt-4 max-lg:mt-4" page={page} total={total} limit={LIMIT} onPage={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete message?"
        message="This permanently removes the contact submission."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        danger
        loading={deleting}
        adminBusy
        onConfirm={() => void confirmDelete()}
        onCancel={() => !deleting && setDeleteId(null)}
      />
    </AdminLayout>
  );
}
