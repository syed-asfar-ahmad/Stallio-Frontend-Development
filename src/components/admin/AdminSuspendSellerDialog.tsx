import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AdminLoadingInline } from './AdminLoading';
import BulkItemCheckbox from '../BulkItemCheckbox';
import { adminTheme } from './adminTheme';
import { DASHBOARD_ICON_CLOSE_BTN } from '../../lib/dashboardFormClasses';

export type SuspendSellerOptions = {
  hideShop: boolean;
  blockDashboard: boolean;
};

type Props = {
  open: boolean;
  initial: SuspendSellerOptions;
  saving?: boolean;
  onConfirm: (options: SuspendSellerOptions) => void;
  onCancel: () => void;
};

function SuspensionOptionCard({
  checked,
  onChange,
  title,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 p-3 max-lg:p-3 lg:p-4 text-start transition-colors ${
        checked
          ? 'border-brand-500 bg-brand-50/80 dark:border-brand-600 dark:bg-brand-950/35'
          : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-600'
      } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <BulkItemCheckbox
        checked={checked}
        onChange={() => onChange(!checked)}
        label={title}
        variant="inline"
        className="!mt-0 shadow-sm"
      />
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-semibold text-stone-900 dark:text-zinc-100">{title}</span>
        <span className={`mt-0.5 block text-xs leading-relaxed ${adminTheme.muted}`}>{description}</span>
      </span>
    </div>
  );
}

export default function AdminSuspendSellerDialog({
  open,
  initial,
  saving = false,
  onConfirm,
  onCancel,
}: Props) {
  const [hideShop, setHideShop] = useState(initial.hideShop);
  const [blockDashboard, setBlockDashboard] = useState(initial.blockDashboard);

  useEffect(() => {
    if (open) {
      setHideShop(initial.hideShop);
      setBlockDashboard(initial.blockDashboard);
    }
  }, [open, initial.hideShop, initial.blockDashboard]);

  if (!open || typeof document === 'undefined') return null;

  const canConfirm = hideShop || blockDashboard;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end lg:items-center justify-center bg-black/50 p-0 max-lg:p-0 lg:p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !saving && onCancel()}
    >
      <div
        className="w-full max-w-md max-lg:max-h-[92vh] max-lg:overflow-y-auto max-lg:rounded-t-2xl max-lg:rounded-b-none lg:rounded-2xl border border-stone-200 bg-white p-4 max-lg:p-4 lg:p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-seller-dialog-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 id="suspend-seller-dialog-title" className="text-base max-lg:text-base lg:text-lg font-bold text-stone-900 dark:text-zinc-100">
              Manage Suspension
            </h3>
            <p className={`mt-1 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted}`}>
              Choose what to restrict for this seller. You can change these anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-8 w-8 disabled:opacity-50`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <SuspensionOptionCard
            checked={hideShop}
            onChange={setHideShop}
            disabled={saving}
            title="Hide Public Storefront"
            description="Customers cannot view the live shop at the store URL."
          />
          <SuspensionOptionCard
            checked={blockDashboard}
            onChange={setBlockDashboard}
            disabled={saving}
            title="Block Seller Dashboard"
            description="Seller cannot sign in or manage products, orders, and settings."
          />
        </div>

        {!canConfirm ? (
          <p className="mt-3 text-xs font-medium text-amber-800 dark:text-amber-300">
            Select at least one option, or cancel to leave the seller fully active.
          </p>
        ) : null}

        <div className="mt-5 max-lg:mt-5 lg:mt-6 flex flex-col gap-2 max-lg:flex-col sm:flex-row lg:flex-row lg:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className={`w-full sm:flex-1 ${adminTheme.btnSecondary}`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !canConfirm}
            onClick={() => onConfirm({ hideShop, blockDashboard })}
            className={`flex w-full sm:flex-1 items-center justify-center gap-2 ${adminTheme.btnPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {saving ? <AdminLoadingInline light dotsOnly /> : null}
            <span>{saving ? 'Applying...' : 'Apply'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
