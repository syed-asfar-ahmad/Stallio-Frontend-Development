import type { KeyboardEvent, ReactNode } from 'react';
import BulkItemCheckbox from './BulkItemCheckbox';

const SELECTED_CLASS =
  'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/20 dark:bg-brand-950/15 cursor-pointer';
const UNSELECTED_CLASS =
  'cursor-pointer hover:border-brand-300 dark:hover:border-brand-600/45';

type Props = {
  selectionMode: boolean;
  selected: boolean;
  onToggle: () => void;
  ariaLabel: string;className: string;hideCheckbox?: boolean;
  children: ReactNode;
};

export default function BulkSelectableCard({
  selectionMode,
  selected,
  onToggle,
  ariaLabel,
  className,
  hideCheckbox = false,
  children,
}: Props) {
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }

  const surfaceClass = selectionMode
    ? selected
      ? `${SELECTED_CLASS} ${className}`
      : `${UNSELECTED_CLASS} ${className}`
    : className;

  return (
    <div
      role={selectionMode ? 'button' : undefined}
      tabIndex={selectionMode ? 0 : undefined}
      onClick={selectionMode ? onToggle : undefined}
      onKeyDown={selectionMode ? onKeyDown : undefined}
      className={`relative overflow-hidden transition-all duration-300 ${surfaceClass}`}
    >
      {selectionMode && !hideCheckbox && (
        <BulkItemCheckbox checked={selected} onChange={onToggle} label={ariaLabel} />
      )}
      {children}
    </div>
  );
}
