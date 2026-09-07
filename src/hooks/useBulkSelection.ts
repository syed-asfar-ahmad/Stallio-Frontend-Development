import { useCallback, useState } from 'react';

export function useBulkSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelectionMode = useCallback(() => {
    if (selectionMode) {
      exitSelectionMode();
    } else {
      setSelectionMode(true);
      setSelectedIds(new Set());
    }
  }, [selectionMode, exitSelectionMode]);

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  return {
    selectionMode,
    selectedIds,
    selectedCount: selectedIds.size,
    toggleSelectionMode,
    exitSelectionMode,
    toggleId,
    selectAll,
    clearSelection,
    isSelected,
  };
}
