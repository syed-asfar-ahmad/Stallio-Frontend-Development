import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

type MenuPos = CSSProperties & { width: number };

export function useAdminMenuPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  options?: { maxHeight?: number; gap?: number },
): MenuPos | null {
  const gap = options?.gap ?? 6;
  const maxHeightCap = options?.maxHeight ?? 320;
  const [pos, setPos] = useState<MenuPos | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }

    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom - gap - 12;
      const maxHeight = Math.max(120, Math.min(maxHeightCap, spaceBelow));
      setPos({
        position: 'fixed',
        top: r.bottom + gap,
        left: r.left,
        width: r.width,
        maxHeight,
        zIndex: 200,
      });
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef, gap, maxHeightCap]);

  return pos;
}
