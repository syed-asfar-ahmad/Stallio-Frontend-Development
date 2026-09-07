import { X } from 'lucide-react';
import { DASHBOARD_IMAGE_REMOVE_BTN } from '../lib/dashboardFormClasses';

type Props = {
  onClick: () => void;
  'aria-label': string;
  disabled?: boolean;
  className?: string;
};

export default function DashboardImageRemoveButton({
  onClick,
  'aria-label': ariaLabel,
  disabled,
  className = '',
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`absolute -top-1 -right-1 z-30 ${DASHBOARD_IMAGE_REMOVE_BTN} ${className} disabled:opacity-50 disabled:pointer-events-none`}
    >
      <X className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
    </button>
  );
}
