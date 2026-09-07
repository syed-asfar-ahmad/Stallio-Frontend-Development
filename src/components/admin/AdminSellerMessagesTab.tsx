import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import type { AdminSellerFull } from '../../types/admin';
import AdminPagination from './AdminPagination';
import { adminTheme } from './adminTheme';

type AdminMessage = AdminSellerFull['messages'][0];

type Props = {
  messages: AdminMessage[];
  paginatedMessages: AdminMessage[];
  messagesPage: number;
  messagesPageLimit: number;
  onMessagesPageChange: (page: number) => void;
  onViewMessage: (message: AdminMessage) => void;
};

export default function AdminSellerMessagesTab({
  messages,
  paginatedMessages,
  messagesPage,
  messagesPageLimit,
  onMessagesPageChange,
  onViewMessage,
}: Props) {
  if (messages.length === 0) {
    return <p className={adminTheme.muted}>No messages</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-zinc-600/80 dark:bg-zinc-900">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 dark:border-zinc-700 dark:bg-zinc-800/80">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Customer</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Status</th>
                <th className="w-24 px-5 py-3.5" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {paginatedMessages.map((m) => (
                <tr key={m.id} className="bg-white transition-colors hover:bg-stone-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-3 font-medium text-stone-800 dark:text-zinc-200">{m.customerName}</td>
                  <td className="px-5 py-3 text-sm text-stone-600 dark:text-zinc-400">{m.customerEmail}</td>
                  <td className="px-5 py-3 text-sm text-stone-600 dark:text-zinc-400">
                    {format(new Date(m.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-5 py-3">
                    {m.responded ? (
                      <span className={adminTheme.badgeActive}>Responded</span>
                    ) : (
                      <span className={adminTheme.badgePending}>Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-2">
                    <button
                      type="button"
                      onClick={() => onViewMessage(m)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-950/40"
                      title="View message"
                    >
                      <Eye className="h-4 w-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-zinc-800 lg:hidden">
          {paginatedMessages.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="font-semibold text-stone-900 dark:text-zinc-100">{m.customerName}</p>
                <p className="text-sm text-stone-600 dark:text-zinc-400">{m.customerEmail}</p>
                <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                  {format(new Date(m.createdAt), 'MMM d, yyyy')} | {m.responded ? 'Responded' : 'Pending'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onViewMessage(m)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40"
              >
                <Eye className="h-4 w-4" /> View
              </button>
            </div>
          ))}
        </div>
      </div>

      <AdminPagination
        page={messagesPage}
        total={messages.length}
        limit={messagesPageLimit}
        onPage={onMessagesPageChange}
      />
    </div>
  );
}
