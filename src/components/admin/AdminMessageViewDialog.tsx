import { useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Mail, MessageSquare, User, X } from 'lucide-react';
import type { AdminSellerFull } from '../../types/admin';
import { adminTheme } from './adminTheme';
import { DASHBOARD_ICON_CLOSE_BTN } from '../../lib/dashboardFormClasses';

type AdminMessage = AdminSellerFull['messages'][0];

type Props = {
  message: AdminMessage;
  onClose: () => void;
};

export default function AdminMessageViewDialog({ message: m, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end lg:items-center justify-center bg-black/55 p-0 max-lg:p-0 lg:p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg max-lg:max-w-none max-lg:max-h-[min(92vh,100dvh)] flex-col overflow-hidden max-lg:rounded-t-2xl max-lg:rounded-b-none lg:rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 max-lg:gap-3 lg:gap-4 border-b border-stone-200 bg-gradient-to-r from-brand-50/80 via-white to-brand-50/60 px-4 py-4 max-lg:px-4 max-lg:py-4 lg:px-6 lg:py-5 dark:border-zinc-700 dark:from-brand-950/30 dark:via-zinc-900 dark:to-brand-950/25">
          <div className="min-w-0">
            <h3 className="text-lg max-lg:text-lg lg:text-xl font-bold text-stone-900 dark:text-zinc-100">Customer message</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500 dark:text-zinc-400">
              <Calendar className="h-4 w-4 text-stone-400 dark:text-zinc-500" />
              {format(new Date(m.createdAt), 'MMM d, yyyy, h:mm a')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-10 w-10`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50/40 px-4 py-4 max-lg:px-4 max-lg:py-4 lg:px-6 lg:py-6 dark:bg-zinc-900/40">
          <div className="flex flex-wrap items-center gap-2">
            {m.responded ? (
              <span className={adminTheme.badgeActive}>Responded</span>
            ) : (
              <span className={adminTheme.badgePending}>Pending</span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-700/40">
                <User className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Name</p>
                <p className="break-words font-medium text-stone-900 dark:text-zinc-100">{m.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-brand-200/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-brand-700/40">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Email</p>
                <p className="break-all font-medium text-stone-900 dark:text-zinc-100">{m.customerEmail}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-950">
              <MessageSquare className="h-4 w-4 text-stone-500 dark:text-zinc-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">Message</p>
            </div>
            <p className="whitespace-pre-wrap px-5 py-4 text-sm leading-relaxed text-stone-800 dark:text-zinc-200">{m.message}</p>
          </div>
        </div>

        <div className="flex shrink-0 border-t border-stone-200 bg-stone-50/30 px-4 py-3 max-lg:px-4 max-lg:py-3 lg:justify-end lg:px-6 lg:py-4 dark:border-zinc-800 dark:bg-zinc-950/90">
          <button type="button" onClick={onClose} className={`w-full max-lg:w-full lg:w-auto ${adminTheme.btnSecondary}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
