import { useEffect, type RefObject } from 'react';

type ContainerRef = RefObject<HTMLElement | null>;

export function useCloseOnOutsideClick(
  open: boolean,
  onClose: () => void,
  containerRef: ContainerRef | ContainerRef[],
) {
  useEffect(() => {
    if (!open) return;
    const refs = Array.isArray(containerRef) ? containerRef : [containerRef];
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.some((r) => r.current?.contains(target))) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, containerRef]);
}
