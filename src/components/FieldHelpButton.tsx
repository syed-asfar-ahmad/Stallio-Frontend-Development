import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp } from 'lucide-react';

type Align = 'start' | 'end';

type Props = {
  text: string;align?: Align;
};

const PANEL_BASE =
  'select-text rounded-xl border-2 border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2.5 text-left text-xs leading-relaxed text-stone-600 dark:text-zinc-300 shadow-lg shadow-stone-900/10 dark:shadow-black/40 ring-1 ring-brand-500/15 dark:ring-brand-500/25';
const PANEL_MAX_START = 'max-w-[min(18rem,calc(100vw-1rem))]';
const LEAVE_MS = 120;

export default function FieldHelpButton({ text, align = 'start' }: Props) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pinned, setPinned] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left?: number;
    right?: number;maxW?: number;
  } | null>(null);

  const visible = pinned || hoverOpen;

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const scheduleHoverClose = useCallback(() => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setHoverOpen(false), LEAVE_MS);
  }, [clearLeaveTimer]);

  const openHover = useCallback(() => {
    clearLeaveTimer();
    setHoverOpen(true);
  }, [clearLeaveTimer]);

  const measure = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const margin = 8;
    const maxW = Math.min(288, window.innerWidth - 2 * margin);
    if (align === 'end') {
      const maxPanelW = Math.min(288, Math.max(80, r.right - margin));
      setCoords({ top: r.bottom + margin, right: window.innerWidth - r.right, maxW: maxPanelW });
    } else {
      let left = r.left;
      left = Math.max(margin, Math.min(left, window.innerWidth - margin - maxW));
      setCoords({ top: r.bottom + margin, left });
    }
  }, [align]);

  useLayoutEffect(() => {
    if (!visible) {
      setCoords(null);
      return;
    }
    measure();
  }, [visible, measure, text]);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [visible, measure]);

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPinned(false);
        setHoverOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible]);

  useEffect(() => {
    if (!pinned) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setPinned(false);
      setHoverOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [pinned]);

  useEffect(() => () => clearLeaveTimer(), [clearLeaveTimer]);

  const panel =
    visible && coords ? (
      <div
        ref={panelRef}
        id={id}
        role="tooltip"
        className={`fixed z-[300] w-max ${PANEL_BASE} ${align === 'start' ? PANEL_MAX_START : ''}`}
        style={
          align === 'end'
            ? {
                top: coords.top,
                right: coords.right,
                left: 'auto',
                maxWidth: coords.maxW,
              }
            : { top: coords.top, left: coords.left, right: 'auto' }
        }
        onMouseEnter={openHover}
        onMouseLeave={scheduleHoverClose}
      >
        {text}
      </div>
    ) : null;

  return (
    <span ref={wrapRef} className="relative inline-flex shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Help"
        aria-expanded={pinned}
        aria-controls={visible ? id : undefined}
        aria-describedby={visible ? id : undefined}
        onClick={() => setPinned((p) => !p)}
        onMouseEnter={openHover}
        onMouseLeave={scheduleHoverClose}
        className="rounded-full p-0.5 text-stone-400 dark:text-zinc-500 transition-colors hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900"
      >
        <CircleHelp className="w-4 h-4" aria-hidden />
      </button>
      {typeof document !== 'undefined' && panel ? createPortal(panel, document.body) : null}
    </span>
  );
}
