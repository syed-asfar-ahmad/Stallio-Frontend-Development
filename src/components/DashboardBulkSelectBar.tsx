import { useTranslation } from 'react-i18next';
import { CheckSquare, Square, Trash2, X } from 'lucide-react';

type Props = {
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  deleteDisabled?: boolean;
  listEmpty?: boolean;
};

export default function DashboardBulkSelectBar({
  selectionMode,
  onToggleSelectionMode,
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  deleteDisabled = false,
  listEmpty = false,
}: Props) {
  const { t } = useTranslation();

  if (listEmpty) return null;

  if (!selectionMode) {
    return (
      <button
        type="button"
        onClick={onToggleSelectionMode}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
      >
        <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        {t('dashboard.common.select')}
      </button>
    );
  }

  const allSelected = totalSelectable > 0 && selectedCount >= totalSelectable;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={allSelected ? onClearSelection : onSelectAll}
        disabled={totalSelectable === 0}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-200 dark:hover:border-brand-600/45 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-50 transition-colors"
      >
        {allSelected ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4 text-stone-400" />}
        {allSelected ? t('dashboard.common.clearSelection') : t('dashboard.common.selectAll')}
      </button>
      <button
        type="button"
        disabled={selectedCount === 0 || deleteDisabled}
        onClick={onDeleteSelected}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/45 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        {t('dashboard.common.deleteSelected')}
      </button>
      <button
        type="button"
        disabled={deleteDisabled}
        onClick={onToggleSelectionMode}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-stone-200 dark:border-zinc-700 px-3 py-2.5 text-sm font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
      >
        <X className="w-4 h-4" />
        {t('dashboard.common.cancelSelect')}
      </button>
    </div>
  );
}
