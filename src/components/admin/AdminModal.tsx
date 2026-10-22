import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DASHBOARD_ICON_CLOSE_BTN } from '../../lib/dashboardFormClasses';
import { adminTheme } from './adminTheme';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** Blocks backdrop / Esc / close-button dismissal while a request is in flight. */
  busy?: boolean;
  children: ReactNode;
  /** Rendered as the dialog's action row (use adminTheme.btnSecondary / btnPrimary). */
  footer?: ReactNode;
  size?: 'md' | 'lg';
};

/**
 * Shell for admin form dialogs. Visual structure is identical to
 * AdminSuspendSellerDialog / ConfirmDialog (bottom sheet on mobile, centered on desktop)
 * but accepts arbitrary content for forms that ConfirmDialog's string message cannot express.
 */
export default function AdminModal({ open, title, description, onClose, busy = false, children, footer, size = 'md' }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end lg:items-center justify-center bg-black/50 p-0 max-lg:p-0 lg:p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        className={`w-full ${size === 'lg' ? 'max-w-xl' : 'max-w-md'} max-lg:max-h-[92vh] max-lg:max-w-none max-lg:overflow-y-auto max-lg:rounded-t-2xl max-lg:rounded-b-none lg:max-h-[90vh] lg:overflow-y-auto lg:rounded-2xl border border-stone-200 bg-white p-4 max-lg:p-4 lg:p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100">
              {title}
            </h3>
            {description ? (
              <p className={`mt-1 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-8 w-8 disabled:opacity-50`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        {footer ? (
          <div className="mt-5 max-lg:mt-5 lg:mt-6 flex flex-col gap-2 max-lg:flex-col sm:flex-row lg:flex-row lg:gap-3">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
