import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Crosshair, RotateCcw, X } from 'lucide-react';
import { DASHBOARD_BTN_OUTLINE, DASHBOARD_BTN_PRIMARY } from '../lib/dashboardFormClasses';
import { DEFAULT_FOCAL, focalToObjectPosition, parseImageFocal, withImageFocal } from '../lib/imageFocal';
import type { ImageFocal } from '../lib/imageFocal';
import { getProductImageDisplayUrl } from '../lib/productImageUrl';

export type FocalPreviewRatio = { label: string; ratio: number };

/** Ratios the storefront themes actually render product / category photos at. */
export const PRODUCT_FOCAL_PREVIEWS: FocalPreviewRatio[] = [
  { label: '1:1', ratio: 1 },
  { label: '4:5', ratio: 4 / 5 },
  { label: '3:4', ratio: 3 / 4 },
  { label: '4:3', ratio: 4 / 3 },
];

/** Hero / banner frames: wide desktop banner, split image and tall mobile crop. */
export const HERO_FOCAL_PREVIEWS: FocalPreviewRatio[] = [
  { label: '3:1', ratio: 3 },
  { label: '16:10', ratio: 16 / 10 },
  { label: '1:1', ratio: 1 },
  { label: '3:4', ratio: 3 / 4 },
];

type Props = {
  open: boolean;
  /** Stored image URL (may already carry a focal fragment). */
  src: string | null;
  previews?: FocalPreviewRatio[];
  /** Draws the "keep your subject inside" safe zone (center 75%). */
  showSafeZone?: boolean;
  onClose: () => void;
  /** Receives the image URL with the new focal point stored in it. */
  onConfirm: (nextSrc: string) => void;
};

const KEY_STEP = 0.02;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Lets a merchant choose which part of a photo must stay visible. The same photo is
 * then framed by every theme (cards, banners, bento panels) around that point,
 * so nothing important gets cut off and no per-theme crop is needed.
 */
export default function FocalPointPicker({
  open,
  src,
  previews = PRODUCT_FOCAL_PREVIEWS,
  showSafeZone = true,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const areaRef = useRef<HTMLDivElement>(null);
  const [focal, setFocal] = useState<ImageFocal>(DEFAULT_FOCAL);
  const [safeZone, setSafeZone] = useState(showSafeZone);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFocal(parseImageFocal(src).focal);
    setSafeZone(showSafeZone);
  }, [open, src, showSafeZone]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const moveTo = useCallback((clientX: number, clientY: number) => {
    const el = areaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setFocal({
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    });
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    moveTo(e.clientX, e.clientY);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    moveTo(e.clientX, e.clientY);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? KEY_STEP * 5 : KEY_STEP;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    setFocal((f) => ({ x: clamp01(f.x + dx), y: clamp01(f.y + dy) }));
  }

  if (!open || !src) return null;

  const display = getProductImageDisplayUrl(parseImageFocal(src).url);
  const objectPosition = focalToObjectPosition(focal);
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex flex-col bg-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600/20 text-brand-400">
          <Crosshair className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-base font-semibold text-zinc-100 sm:text-lg">
            {t('dashboard.focal.title')}
          </h2>
          <p className="text-xs text-zinc-500">{t('dashboard.focal.hint')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          aria-label={t('dashboard.common.cancel')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[#2a2a2a] p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-center">
        {/* Picker surface: wrapper shrinks to the rendered image so % maps to the photo itself */}
        <div className="flex min-h-[16rem] flex-1 items-center justify-center lg:max-w-3xl">
          <div
            ref={areaRef}
            role="slider"
            tabIndex={0}
            aria-label={t('dashboard.focal.title')}
            aria-valuetext={t('dashboard.focal.position', { x: pct(focal.x), y: pct(focal.y) })}
            aria-valuenow={Math.round(focal.x * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            className={`relative inline-block max-w-full touch-none select-none overflow-hidden rounded-lg outline-none ring-offset-2 ring-offset-[#2a2a2a] focus-visible:ring-2 focus-visible:ring-brand-400 ${
              dragging ? 'cursor-grabbing' : 'cursor-crosshair'
            }`}
          >
            <img
              src={display}
              alt=""
              draggable={false}
              className="block max-h-[52vh] max-w-full object-contain"
            />
            {safeZone ? (
              <div
                className="pointer-events-none absolute rounded-md border border-dashed border-white/70"
                style={{ inset: '12.5%', boxShadow: '0 0 0 9999px rgba(0,0,0,0.38)' }}
                aria-hidden
              />
            ) : null}
            <span
              className="pointer-events-none absolute z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-500/40 shadow-[0_0_0_2px_rgba(0,0,0,0.55)]"
              style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
              aria-hidden
            >
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </span>
          </div>
        </div>

        {/* Live framing previews */}
        <div className="w-full shrink-0 lg:w-72">
          <p className="mb-2 text-xs font-semibold text-zinc-400">{t('dashboard.focal.previewTitle')}</p>
          <div className="grid grid-cols-4 items-end gap-2 lg:grid-cols-2">
            {previews.map((p) => (
              <figure key={p.label} className="m-0 min-w-0">
                <div
                  className="relative w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800"
                  style={{ aspectRatio: String(p.ratio) }}
                >
                  <img
                    src={display}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition }}
                  />
                </div>
                <figcaption className="mt-1 text-center text-[11px] font-semibold tabular-nums text-zinc-500">
                  {p.label}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">{t('dashboard.focal.previewNote')}</p>
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-300">
            <input
              type="checkbox"
              checked={safeZone}
              onChange={(e) => setSafeZone(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            {t('dashboard.focal.safeZone')}
          </label>
          <button
            type="button"
            onClick={() => setFocal(DEFAULT_FOCAL)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {t('dashboard.focal.reset')}
          </button>
          <div className="ms-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`${DASHBOARD_BTN_OUTLINE} border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
            >
              {t('dashboard.common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(withImageFocal(src, focal))}
              className={`${DASHBOARD_BTN_PRIMARY} min-w-[8rem]`}
            >
              {t('dashboard.focal.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
