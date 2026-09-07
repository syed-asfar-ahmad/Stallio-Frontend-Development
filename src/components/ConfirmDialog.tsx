import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { AdminLoadingInline } from './admin/AdminLoading';
import { DASHBOARD_ICON_CLOSE_BTN } from '../lib/dashboardFormClasses';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  confirmDisabled?: boolean;
  loading?: boolean;
  adminBusy?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
  confirmDisabled = false,
  loading = false,
}: Props) {
  const { t } = useTranslation();
  const resolvedCancelLabel = cancelLabel ?? t('dashboard.common.cancel');
  const busy = loading || confirmDisabled;

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end lg:items-center justify-center p-0 max-lg:p-0 lg:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !busy && onCancel()}
    >
      <div
        className="w-full max-w-sm max-lg:max-w-none max-lg:max-h-[92vh] max-lg:overflow-y-auto max-lg:rounded-t-2xl max-lg:rounded-b-none lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-xl dark:shadow-black/40"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-8 w-8 disabled:opacity-50 disabled:pointer-events-none`}
            aria-label={t('dashboard.common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-stone-600 dark:text-zinc-300 text-sm mb-6">{message}</p>
        <div className="flex flex-col gap-2 max-lg:flex-col lg:flex-row lg:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="w-full flex-1 py-2.5 rounded-xl font-medium border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 disabled:opacity-50 disabled:pointer-events-none"
          >
            {resolvedCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex w-full flex-1 items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white disabled:opacity-60 disabled:pointer-events-none ${
              danger ? 'bg-red-600 hover:bg-red-500' : 'bg-brand-600 hover:bg-brand-500'
            }`}
          >
            {busy ? <AdminLoadingInline light dotsOnly /> : null}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
