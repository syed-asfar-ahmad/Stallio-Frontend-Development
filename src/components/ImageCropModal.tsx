import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon, Minus, Plus, RotateCcw, X, Crop } from 'lucide-react';
import { AdminLoadingInline } from './DashboardLoading';
import { DASHBOARD_BTN_OUTLINE, DASHBOARD_BTN_PRIMARY } from '../lib/dashboardFormClasses';
import type { ImageCropViewport } from '../lib/imageCropViewports';

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.15;
const MASK_SHADOW = '0 0 0 9999px rgba(0, 0, 0, 0.65)';

type Props = {
  open: boolean;
  imageFile: File | null;
  viewport: ImageCropViewport;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
  onSkip?: () => void;
  skipLabel?: string;
};

type NormalizedCrop = {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
};

type AspectRatioOption = 'free' | '1:1' | 'original' | '16:9' | '5:3' | '4:3';

type DragMode =
  | 'none'
  | 'pan'
  | 'move'
  | 'nw'
  | 'ne'
  | 'se'
  | 'sw'
  | 'n'
  | 's'
  | 'w'
  | 'e';

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

function getNumericRatio(mode: AspectRatioOption, naturalWidth: number, naturalHeight: number): number | null {
  switch (mode) {
    case 'free':
      return null;
    case '1:1':
      return 1;
    case 'original':
      return naturalWidth / naturalHeight;
    case '16:9':
      return 16 / 9;
    case '5:3':
      return 5 / 3;
    case '4:3':
      return 4 / 3;
    default:
      return null;
  }
}

function calculateInitialCrop(
  ratio: number | null,
  naturalWidth: number,
  naturalHeight: number,
): NormalizedCrop {
  if (ratio === null) {
    return { x: 0, y: 0, w: 1, h: 1 };
  }
  const imgAspect = naturalWidth / naturalHeight;
  const targetNormRatio = ratio / imgAspect; // normW / normH = targetNormRatio

  let normW = 1;
  let normH = 1;

  if (targetNormRatio <= 1) {
    // Taller in normalized space or narrower width
    normW = clamp(targetNormRatio, 0.05, 1);
    normH = 1;
  } else {
    // Wider in normalized space
    normW = 1;
    normH = clamp(1 / targetNormRatio, 0.05, 1);
  }

  const x = (1 - normW) / 2;
  const y = (1 - normH) / 2;
  return { x, y, w: normW, h: normH };
}

function cropToBlob(
  image: HTMLImageElement,
  normCrop: NormalizedCrop,
): Promise<Blob> {
  const srcX = Math.max(0, Math.round(normCrop.x * image.naturalWidth));
  const srcY = Math.max(0, Math.round(normCrop.y * image.naturalHeight));
  const srcW = Math.max(1, Math.min(image.naturalWidth - srcX, Math.round(normCrop.w * image.naturalWidth)));
  const srcH = Math.max(1, Math.min(image.naturalHeight - srcY, Math.round(normCrop.h * image.naturalHeight)));

  const maxDimension = 2400;
  const downscale = Math.min(1, maxDimension / Math.max(srcW, srcH));
  const outW = Math.max(1, Math.round(srcW * downscale));
  const outH = Math.max(1, Math.round(srcH * downscale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas not supported'));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
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

export default function ImageCropModal({
  open,
  imageFile,
  viewport,
  onClose,
  onConfirm,
  onSkip,
  skipLabel,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Determine initial aspect ratio mode
  const initialRatioMode = (): AspectRatioOption => {
    const r = viewport.width / viewport.height;
    if (Math.abs(r - 1) < 0.05) return '1:1';
    if (Math.abs(r - 5 / 3) < 0.05) return '5:3';
    if (Math.abs(r - 16 / 9) < 0.05) return '16:9';
    return 'free';
  };

  const [aspectRatioMode, setAspectRatioMode] = useState<AspectRatioOption>(initialRatioMode);
  const [normCrop, setNormCrop] = useState<NormalizedCrop>({ x: 0, y: 0, w: 1, h: 1 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [workspaceSize, setWorkspaceSize] = useState({ w: 600, h: 400 });
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [busy, setBusy] = useState(false);

  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    normCrop: NormalizedCrop;
    pan: { x: number; y: number };
  } | null>(null);

  // Load image
  useEffect(() => {
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

        const initMode = initialRatioMode();
        setAspectRatioMode(initMode);
        const numeric = getNumericRatio(initMode, img.naturalWidth, img.naturalHeight);
        setNormCrop(calculateInitialCrop(numeric, img.naturalWidth, img.naturalHeight));
        setZoom(1);
        setPan({ x: 0, y: 0 });
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
  }, [open, imageFile, onClose]);

  // Track workspace dimensions
  useEffect(() => {
    if (!open || !workspaceRef.current) return;
    const el = workspaceRef.current;
    const update = () => {
      setWorkspaceSize({ w: el.clientWidth, h: el.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Image display scale: fit completely within workspace padding at zoom = 1
  const padding = 36;
  const availW = Math.max(100, workspaceSize.w - padding * 2);
  const availH = Math.max(100, workspaceSize.h - padding * 2);

  const fitScale = image
    ? Math.min(availW / image.naturalWidth, availH / image.naturalHeight)
    : 1;

  const displayedW = image ? Math.max(1, image.naturalWidth * fitScale * zoom) : 0;
  const displayedH = image ? Math.max(1, image.naturalHeight * fitScale * zoom) : 0;

  const imgLeft = (workspaceSize.w - displayedW) / 2 + pan.x;
  const imgTop = (workspaceSize.h - displayedH) / 2 + pan.y;

  const cropScreenX = imgLeft + normCrop.x * displayedW;
  const cropScreenY = imgTop + normCrop.y * displayedH;
  const cropScreenW = normCrop.w * displayedW;
  const cropScreenH = normCrop.h * displayedH;

  const cropPixelW = image ? Math.round(normCrop.w * image.naturalWidth) : 0;
  const cropPixelH = image ? Math.round(normCrop.h * image.naturalHeight) : 0;

  const bumpZoom = useCallback((delta: number) => {
    setZoom((z) => clamp(Number((z + delta).toFixed(2)), ZOOM_MIN, ZOOM_MAX));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (image) {
      const numeric = getNumericRatio(aspectRatioMode, image.naturalWidth, image.naturalHeight);
      setNormCrop(calculateInitialCrop(numeric, image.naturalWidth, image.naturalHeight));
    }
  }, [aspectRatioMode, image]);

  const handleRatioSelect = (mode: AspectRatioOption) => {
    setAspectRatioMode(mode);
    if (!image) return;
    const numeric = getNumericRatio(mode, image.naturalWidth, image.naturalHeight);
    setNormCrop(calculateInitialCrop(numeric, image.naturalWidth, image.naturalHeight));
  };

  // Wheel zoom
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

  // Pointer interactions
  function startDrag(mode: DragMode, e: React.PointerEvent) {
    if (!image || busy) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragMode(mode);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      normCrop: { ...normCrop },
      pan: { ...pan },
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragMode === 'none' || !dragStartRef.current || !image) return;
    const start = dragStartRef.current;
    const dx = e.clientX - start.clientX;
    const dy = e.clientY - start.clientY;

    if (dragMode === 'pan') {
      setPan({
        x: start.pan.x + dx,
        y: start.pan.y + dy,
      });
      return;
    }

    const dNormX = dx / displayedW;
    const dNormY = dy / displayedH;
    const minNormW = Math.max(0.04, 30 / displayedW);
    const minNormH = Math.max(0.04, 30 / displayedH);

    if (dragMode === 'move') {
      const nextX = clamp(start.normCrop.x + dNormX, 0, 1 - start.normCrop.w);
      const nextY = clamp(start.normCrop.y + dNormY, 0, 1 - start.normCrop.h);
      setNormCrop({
        ...start.normCrop,
        x: nextX,
        y: nextY,
      });
      return;
    }

    const numericRatio = getNumericRatio(aspectRatioMode, image.naturalWidth, image.naturalHeight);
    const normRatio = numericRatio !== null ? numericRatio / (image.naturalWidth / image.naturalHeight) : null;

    let { x, y, w, h } = start.normCrop;

    if (normRatio === null) {
      // Free aspect ratio resizing
      switch (dragMode) {
        case 'se':
          w = clamp(start.normCrop.w + dNormX, minNormW, 1 - start.normCrop.x);
          h = clamp(start.normCrop.h + dNormY, minNormH, 1 - start.normCrop.y);
          break;
        case 'sw': {
          const maxLeftShift = start.normCrop.x;
          const shiftX = clamp(dNormX, -maxLeftShift, start.normCrop.w - minNormW);
          x = start.normCrop.x + shiftX;
          w = start.normCrop.w - shiftX;
          h = clamp(start.normCrop.h + dNormY, minNormH, 1 - start.normCrop.y);
          break;
        }
        case 'ne': {
          w = clamp(start.normCrop.w + dNormX, minNormW, 1 - start.normCrop.x);
          const maxUpShift = start.normCrop.y;
          const shiftY = clamp(dNormY, -maxUpShift, start.normCrop.h - minNormH);
          y = start.normCrop.y + shiftY;
          h = start.normCrop.h - shiftY;
          break;
        }
        case 'nw': {
          const maxLeftShift = start.normCrop.x;
          const shiftX = clamp(dNormX, -maxLeftShift, start.normCrop.w - minNormW);
          x = start.normCrop.x + shiftX;
          w = start.normCrop.w - shiftX;
          const maxUpShift = start.normCrop.y;
          const shiftY = clamp(dNormY, -maxUpShift, start.normCrop.h - minNormH);
          y = start.normCrop.y + shiftY;
          h = start.normCrop.h - shiftY;
          break;
        }
        case 'e':
          w = clamp(start.normCrop.w + dNormX, minNormW, 1 - start.normCrop.x);
          break;
        case 'w': {
          const maxLeftShift = start.normCrop.x;
          const shiftX = clamp(dNormX, -maxLeftShift, start.normCrop.w - minNormW);
          x = start.normCrop.x + shiftX;
          w = start.normCrop.w - shiftX;
          break;
        }
        case 's':
          h = clamp(start.normCrop.h + dNormY, minNormH, 1 - start.normCrop.y);
          break;
        case 'n': {
          const maxUpShift = start.normCrop.y;
          const shiftY = clamp(dNormY, -maxUpShift, start.normCrop.h - minNormH);
          y = start.normCrop.y + shiftY;
          h = start.normCrop.h - shiftY;
          break;
        }
      }
    } else {
      // Locked aspect ratio resizing (preserves ratio)
      switch (dragMode) {
        case 'se': {
          const maxW = 1 - start.normCrop.x;
          const maxH = 1 - start.normCrop.y;
          const maxAllowedW = Math.min(maxW, maxH * normRatio);
          w = clamp(start.normCrop.w + dNormX, minNormW, maxAllowedW);
          h = w / normRatio;
          break;
        }
        case 'sw': {
          const shiftX = dNormX;
          let candidateW = start.normCrop.w - shiftX;
          const maxW = start.normCrop.x + start.normCrop.w;
          const maxH = 1 - start.normCrop.y;
          const maxAllowedW = Math.min(maxW, maxH * normRatio);
          candidateW = clamp(candidateW, minNormW, maxAllowedW);
          w = candidateW;
          h = w / normRatio;
          x = start.normCrop.x + (start.normCrop.w - w);
          break;
        }
        case 'ne': {
          let candidateW = start.normCrop.w + dNormX;
          const maxW = 1 - start.normCrop.x;
          const maxH = start.normCrop.y + start.normCrop.h;
          const maxAllowedW = Math.min(maxW, maxH * normRatio);
          candidateW = clamp(candidateW, minNormW, maxAllowedW);
          w = candidateW;
          h = w / normRatio;
          y = start.normCrop.y + (start.normCrop.h - h);
          break;
        }
        case 'nw': {
          const shiftX = dNormX;
          let candidateW = start.normCrop.w - shiftX;
          const maxW = start.normCrop.x + start.normCrop.w;
          const maxH = start.normCrop.y + start.normCrop.h;
          const maxAllowedW = Math.min(maxW, maxH * normRatio);
          candidateW = clamp(candidateW, minNormW, maxAllowedW);
          w = candidateW;
          h = w / normRatio;
          x = start.normCrop.x + (start.normCrop.w - w);
          y = start.normCrop.y + (start.normCrop.h - h);
          break;
        }
        case 'e':
        case 'w': {
          const delta = dragMode === 'e' ? dNormX : -dNormX;
          let candidateW = clamp(start.normCrop.w + delta, minNormW, 1);
          let candidateH = candidateW / normRatio;
          if (candidateH > 1) {
            candidateH = 1;
            candidateW = candidateH * normRatio;
          }
          w = candidateW;
          h = candidateH;
          if (dragMode === 'w') {
            x = clamp(start.normCrop.x + (start.normCrop.w - w), 0, 1 - w);
          }
          y = clamp(start.normCrop.y + (start.normCrop.h - h) / 2, 0, 1 - h);
          break;
        }
        case 's':
        case 'n': {
          const delta = dragMode === 's' ? dNormY : -dNormY;
          let candidateH = clamp(start.normCrop.h + delta, minNormH, 1);
          let candidateW = candidateH * normRatio;
          if (candidateW > 1) {
            candidateW = 1;
            candidateH = candidateW / normRatio;
          }
          w = candidateW;
          h = candidateH;
          if (dragMode === 'n') {
            y = clamp(start.normCrop.y + (start.normCrop.h - h), 0, 1 - h);
          }
          x = clamp(start.normCrop.x + (start.normCrop.w - w) / 2, 0, 1 - w);
          break;
        }
      }
    }

    setNormCrop({
      x: clamp(x, 0, 1 - w),
      y: clamp(y, 0, 1 - h),
      w: clamp(w, minNormW, 1),
      h: clamp(h, minNormH, 1),
    });
  }

  function stopDrag(e: React.PointerEvent) {
    if (dragMode === 'none') return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setDragMode('none');
    dragStartRef.current = null;
  }

  async function handleConfirm() {
    if (!image || busy) return;
    setBusy(true);
    try {
      const blob = await cropToBlob(image, normCrop);
      await onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  if (!open || !imageFile) return null;

  const ratioOptions: { id: AspectRatioOption; label: string }[] = [
    { id: 'free', label: t('dashboard.home.cropRatioFree', 'Free') },
    { id: '1:1', label: t('dashboard.home.cropRatioSquare', '1:1') },
    { id: 'original', label: t('dashboard.home.cropRatioOriginal', 'Original') },
    { id: '16:9', label: '16:9' },
    { id: '5:3', label: '5:3' },
    { id: '4:3', label: '4:3' },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-zinc-950 text-zinc-100 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Top Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900/95 px-4 py-2.5 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600/20 text-brand-400">
          <Crop className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-sm sm:text-base font-semibold text-zinc-100">
            {t(viewport.titleKey)}
          </h2>
          <p className="text-xs text-zinc-500">
            {t('dashboard.home.cropDimensions', { width: cropPixelW, height: cropPixelH })}
          </p>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-zinc-800/80 p-1 border border-zinc-700/60">
          {ratioOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleRatioSelect(opt.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                aspectRatioMode === opt.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
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

      {/* Mobile Aspect Ratio Selector */}
      <div className="flex md:hidden shrink-0 items-center gap-1.5 overflow-x-auto border-b border-zinc-800 bg-zinc-900 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 mr-1">
          {t('dashboard.home.cropRatio', 'Ratio')}
        </span>
        {ratioOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleRatioSelect(opt.id)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
              aspectRatioMode === opt.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 border border-zinc-700/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Main Interactive Canvas / Workspace */}
      <div
        ref={workspaceRef}
        className={`relative min-h-0 flex-1 overflow-hidden bg-[#18181b] touch-none ${
          dragMode === 'pan' ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={(e) => startDrag('pan', e)}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        {image ? (
          <>
            {/* Displayed Image */}
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="absolute pointer-events-none select-none max-w-none shadow-2xl transition-transform"
              style={{
                left: imgLeft,
                top: imgTop,
                width: displayedW,
                height: displayedH,
              }}
            />

            {/* Dark Mask & Active Crop Box */}
            <div
              className="absolute z-10 border-2 border-white/90 shadow-2xl transition-all"
              style={{
                left: cropScreenX,
                top: cropScreenY,
                width: cropScreenW,
                height: cropScreenH,
                boxShadow: MASK_SHADOW,
              }}
            >
              {/* Inner Move Area */}
              <div
                className="absolute inset-0 cursor-move"
                onPointerDown={(e) => startDrag('move', e)}
              />

              {/* Rule-of-Thirds Grid */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className={`border-white/20 ${i % 3 !== 2 ? 'border-r' : ''} ${i < 6 ? 'border-b' : ''}`}
                  />
                ))}
              </div>

              {/* Dimensions Badge */}
              <span className="pointer-events-none absolute left-2 top-2 z-20 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white/95 shadow">
                {cropPixelW} × {cropPixelH}
              </span>

              {/* 4 Corner Resize Handles */}
              {/* Top-Left */}
              <div
                className="absolute -left-2 -top-2 h-5 w-5 cursor-nwse-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('nw', e)}
              >
                <div className="h-3.5 w-3.5 rounded-sm bg-white border border-zinc-800 shadow" />
              </div>
              {/* Top-Right */}
              <div
                className="absolute -right-2 -top-2 h-5 w-5 cursor-nesw-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('ne', e)}
              >
                <div className="h-3.5 w-3.5 rounded-sm bg-white border border-zinc-800 shadow" />
              </div>
              {/* Bottom-Right */}
              <div
                className="absolute -right-2 -bottom-2 h-5 w-5 cursor-nwse-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('se', e)}
              >
                <div className="h-3.5 w-3.5 rounded-sm bg-white border border-zinc-800 shadow" />
              </div>
              {/* Bottom-Left */}
              <div
                className="absolute -left-2 -bottom-2 h-5 w-5 cursor-nesw-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('sw', e)}
              >
                <div className="h-3.5 w-3.5 rounded-sm bg-white border border-zinc-800 shadow" />
              </div>

              {/* 4 Edge Handles */}
              {/* Top Edge */}
              <div
                className="absolute left-1/2 -top-2 -translate-x-1/2 h-4 w-10 cursor-ns-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('n', e)}
              >
                <div className="h-1.5 w-6 rounded-full bg-white shadow" />
              </div>
              {/* Bottom Edge */}
              <div
                className="absolute left-1/2 -bottom-2 -translate-x-1/2 h-4 w-10 cursor-ns-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('s', e)}
              >
                <div className="h-1.5 w-6 rounded-full bg-white shadow" />
              </div>
              {/* Left Edge */}
              <div
                className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-10 cursor-ew-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('w', e)}
              >
                <div className="w-1.5 h-6 rounded-full bg-white shadow" />
              </div>
              {/* Right Edge */}
              <div
                className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-10 cursor-ew-resize z-30 flex items-center justify-center touch-none"
                onPointerDown={(e) => startDrag('e', e)}
              >
                <div className="w-1.5 h-6 rounded-full bg-white shadow" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">
            <AdminLoadingInline dotsOnly />
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* Zoom Slider and Controls */}
          <div className="flex items-center gap-2.5 min-w-[15rem] flex-1 max-w-md">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 shrink-0">
              {t('dashboard.home.cropZoom', 'Zoom')}
            </span>
            <button
              type="button"
              disabled={busy || zoom <= ZOOM_MIN}
              onClick={() => bumpZoom(-ZOOM_STEP)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40"
              aria-label={t('dashboard.home.cropZoomOut', 'Zoom out')}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.05}
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
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40"
              aria-label={t('dashboard.home.cropZoomIn', 'Zoom in')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-400">
              {zoomPercent(zoom)}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={resetView}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-40"
              title={t('dashboard.home.cropReset', 'Reset view')}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              <span>{t('dashboard.home.cropReset', 'Reset')}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className={`${DASHBOARD_BTN_OUTLINE} border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
            >
              {t('dashboard.common.cancel')}
            </button>
            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                disabled={busy}
                className={`${DASHBOARD_BTN_OUTLINE} border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
              >
                {skipLabel ?? t('dashboard.productForm.useOriginal', 'Use Original')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy || !image}
              className={`${DASHBOARD_BTN_PRIMARY} min-w-[9.5rem]`}
            >
              {busy ? (
                <>
                  <AdminLoadingInline light dotsOnly />
                  <span>{t('dashboard.common.saving', 'Saving...')}</span>
                </>
              ) : (
                t('dashboard.home.cropConfirm', 'Use This Crop')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
