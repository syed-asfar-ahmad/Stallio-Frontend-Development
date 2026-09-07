import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { AdminLoadingInline } from './DashboardLoading';
import { DASHBOARD_BTN_OUTLINE, DASHBOARD_BTN_PRIMARY } from '../lib/dashboardFormClasses';
import type { ImageCropViewport } from '../lib/imageCropViewports';

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.12;
const MASK_SHADOW = '0 0 0 9999px rgba(0, 0, 0, 0.68)';

type Props = {
  open: boolean;
  imageFile: File | null;
  viewport: ImageCropViewport;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
};

type Point = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

async function loadImage(file: File): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = objectUrl;
  });
  return { img, objectUrl };
}

function cropToBlob(
  image: HTMLImageElement,
  outW: number,
  outH: number,
  frameW: number,
  frameH: number,
  offset: Point,
  zoom: number,
): Promise<Blob> {
  const baseScale = Math.max(frameW / image.naturalWidth, frameH / image.naturalHeight);
  const scale = baseScale * zoom;
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;

  const minX = frameW - drawW;
  const minY = frameH - drawH;
  const drawX = clamp(offset.x, minX, 0);
  const drawY = clamp(offset.y, minY, 0);

  const srcX = -drawX / scale;
  const srcY = -drawY / scale;
  const srcW = frameW / scale;
  const srcH = frameH / scale;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas not supported'));

  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not export image'))),
      'image/png',
    );
  });
}

function zoomPercent(zoom: number) {
  return `${Math.round(zoom * 100)}%`;
}

function fitCropFrame(wsW: number, wsH: number, aspect: number) {
  const pad = 28;
  const availW = Math.max(0, wsW - pad * 2);
  const availH = Math.max(0, wsH - pad * 2);
  let w = availW;
  let h = w / aspect;
  if (h > availH) {
    h = availH;
    w = h * aspect;
  }
  return {
    w: Math.max(1, Math.round(w)),
    h: Math.max(1, Math.round(h)),
    left: Math.round((wsW - w) / 2),
    top: Math.round((wsH - h) / 2),
  };
}

export default function ImageCropModal({
  open,
  imageFile,
  viewport,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const aspect = viewport.width / viewport.height;
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [frameSize, setFrameSize] = useState({ w: 320, h: 200 });
  const [framePos, setFramePos] = useState({ left: 0, top: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const confirmingRef = useRef(false);
  const frozenPreviewRef = useRef<{
    offset: Point;
    zoom: number;
    frameW: number;
    frameH: number;
    drawW: number;
    drawH: number;
  } | null>(null);

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      confirmingRef.current = false;
      frozenPreviewRef.current = null;
    }
    if (!open || !imageFile) {
      setImage(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      return;
    }
    let alive = true;
    loadImage(imageFile)
      .then(({ img, objectUrl }) => {
        if (!alive) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = objectUrl;
        setImage(img);
        resetView();
      })
      .catch(() => {
        if (alive) onClose();
      });
    return () => {
      alive = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [open, imageFile, onClose, resetView]);

  useEffect(() => {
    if (!open || !workspaceRef.current) return;
    const el = workspaceRef.current;
    const update = () => {
      if (confirmingRef.current) return;
      const { w, h, left, top } = fitCropFrame(el.clientWidth, el.clientHeight, aspect);
      setFrameSize({ w, h });
      setFramePos({ left, top });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, aspect]);

  const baseScale = image
    ? Math.max(frameSize.w / image.naturalWidth, frameSize.h / image.naturalHeight)
    : 1;
  const drawW = image ? image.naturalWidth * baseScale * zoom : 0;
  const drawH = image ? image.naturalHeight * baseScale * zoom : 0;
  const minX = frameSize.w - drawW;
  const minY = frameSize.h - drawH;

  const clampOffset = useCallback(
    (p: Point) => ({
      x: clamp(p.x, minX, 0),
      y: clamp(p.y, minY, 0),
    }),
    [minX, minY],
  );

  useEffect(() => {
    if (busy) return;
    setOffset((prev) => clampOffset(prev));
  }, [zoom, frameSize.w, frameSize.h, image, clampOffset, busy]);

  const bumpZoom = useCallback((delta: number) => {
    setZoom((z) => clamp(Number((z + delta).toFixed(2)), ZOOM_MIN, ZOOM_MAX));
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (!image || busy) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(
      clampOffset({
        x: dragStart.current.ox + dx,
        y: dragStart.current.oy + dy,
      }),
    );
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
    dragStart.current = null;
  }

  useEffect(() => {
    if (!open || !workspaceRef.current) return;
    const el = workspaceRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (busy) return;
      bumpZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, busy, bumpZoom]);

  async function handleConfirm() {
    if (!image || busy || confirmingRef.current) return;
    confirmingRef.current = true;
    frozenPreviewRef.current = {
      offset: { ...offset },
      zoom,
      frameW: frameSize.w,
      frameH: frameSize.h,
      drawW,
      drawH,
    };
    setBusy(true);
    try {
      const snap = frozenPreviewRef.current;
      const blob = await cropToBlob(
        image,
        viewport.width,
        viewport.height,
        snap.frameW,
        snap.frameH,
        snap.offset,
        snap.zoom,
      );
      await onConfirm(blob);
    } finally {
      confirmingRef.current = false;
      frozenPreviewRef.current = null;
      setBusy(false);
    }
  }

  const preview = busy && frozenPreviewRef.current ? frozenPreviewRef.current : null;
  const displayOffset = preview?.offset ?? offset;
  const displayDrawW = preview?.drawW ?? drawW;
  const displayDrawH = preview?.drawH ?? drawH;

  if (!open || !imageFile) return null;

  const frameStyle = {
    left: framePos.left,
    top: framePos.top,
    width: frameSize.w,
    height: frameSize.h,
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600/20 text-brand-400">
          <ImageIcon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-base font-semibold text-zinc-100 sm:text-lg">
            {t(viewport.titleKey)}
          </h2>
          <p className="text-xs text-zinc-500">
            {t('dashboard.home.cropDimensions', { width: viewport.width, height: viewport.height })}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
          aria-label={t('dashboard.common.cancel')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={workspaceRef}
        className={`relative min-h-0 flex-1 overflow-hidden bg-[#2a2a2a] touch-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {image ? (
          <div className="absolute overflow-visible" style={frameStyle}>
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="absolute left-0 top-0 max-w-none select-none"
              style={{
                width: displayDrawW,
                height: displayDrawH,
                transform: `translate(${displayOffset.x}px, ${displayOffset.y}px)`,
              }}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">
            <AdminLoadingInline dotsOnly />
          </div>
        )}

        {image && frameSize.w > 0 ? (
          <>
            <div
              className="pointer-events-none absolute z-10 border border-white/45"
              style={{ ...frameStyle, boxShadow: MASK_SHADOW }}
            />
            <div
              className="pointer-events-none absolute z-20 grid grid-cols-3 grid-rows-3"
              style={frameStyle}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className={`border-white/25 ${i % 3 !== 2 ? 'border-r' : ''} ${i < 6 ? 'border-b' : ''}`}
                />
              ))}
            </div>
            <span
              className="pointer-events-none absolute z-20 rounded bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90"
              style={{ left: framePos.left + 8, top: framePos.top + 8 }}
            >
              {t(viewport.frameLabelKey)}
            </span>
          </>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t('dashboard.home.cropZoom')}
          </span>
          <div className="flex min-w-[12rem] flex-1 items-center gap-2">
            <button
              type="button"
              disabled={busy || zoom <= ZOOM_MIN}
              onClick={() => bumpZoom(-ZOOM_STEP)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40"
              aria-label={t('dashboard.home.cropZoomOut')}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.01}
              value={zoom}
              disabled={busy}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-brand-500"
              aria-valuetext={zoomPercent(zoom)}
            />
            <button
              type="button"
              disabled={busy || zoom >= ZOOM_MAX}
              onClick={() => bumpZoom(ZOOM_STEP)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40"
              aria-label={t('dashboard.home.cropZoomIn')}
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-400">
              {zoomPercent(zoom)}
            </span>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={resetView}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {t('dashboard.home.cropReset')}
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-xs text-zinc-500">{t('dashboard.home.cropToolbarHint')}</p>

        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`${DASHBOARD_BTN_OUTLINE} border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
          >
            {t('dashboard.common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy || !image}
            className={`${DASHBOARD_BTN_PRIMARY} min-w-[10.5rem]`}
          >
            {busy ? (
              <>
                <AdminLoadingInline light dotsOnly />
                <span>{t('dashboard.common.uploading')}</span>
              </>
            ) : (
              t('dashboard.common.save')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
