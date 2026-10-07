import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Loader2, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import type { ShopThemeConfig } from '../themes';
import {
  openThemePreviewTab,
  PREVIEW_MSG,
  publishThemePreviewPayload,
  THEME_PREVIEW_USERNAME,
  type PreviewColorMode,
  type ThemePreviewPayload,
} from '../lib/themePreviewBridge';
import { getPreviewPaths } from '../lib/themePreviewData';

export type PreviewDevice = 'desktop' | 'mobile';

/**
 * The desktop preview renders the storefront at the width of its panel, clamped to this range, so a
 * bigger panel shows a bigger, sharper preview (1:1 whenever the panel is >= DESKTOP_MIN_WIDTH wide)
 * instead of a heavily shrunk 1280px page.
 */
const DESKTOP_MIN_WIDTH = 1024;
const DESKTOP_MAX_WIDTH = 1440;
const MOBILE_WIDTH = 390;

/** Current window height, for sizing previews to the screen. */
export function useViewportHeight(): number {
  const [h, setH] = useState(() => (typeof window === 'undefined' ? 900 : window.innerHeight));
  useEffect(() => {
    const onResize = () => setH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return h;
}
const PREVIEW_SRC = `/${THEME_PREVIEW_USERNAME}`;

type PageKey = 'home' | 'products' | 'categories' | 'category' | 'product' | 'about' | 'contact';

const PAGES: { key: PageKey; labelKey: string }[] = [
  { key: 'home', labelKey: 'home' },
  { key: 'products', labelKey: 'products' },
  { key: 'categories', labelKey: 'categories' },
  { key: 'category', labelKey: 'category' },
  { key: 'product', labelKey: 'product' },
  { key: 'about', labelKey: 'about' },
  { key: 'contact', labelKey: 'contact' },
];

function pathForPage(page: PageKey, themeId: string): string {
  const { categorySlug, productId } = getPreviewPaths(themeId);
  switch (page) {
    case 'products':
      return '/products';
    case 'categories':
      return '/categories';
    case 'category':
      return `/category/${categorySlug}`;
    case 'product':
      return `/product/${productId}`;
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    default:
      return '/';
  }
}

function pageForPath(path: string): PageKey {
  if (path.startsWith('/product/')) return 'product';
  if (path.startsWith('/category/')) return 'category';
  if (path.startsWith('/products')) return 'products';
  if (path.startsWith('/categories')) return 'categories';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/contact')) return 'contact';
  return 'home';
}

/** Shared handshake: sends the payload when the iframe announces it is ready (and again on load). */
function usePreviewChannel(
  iframeRef: React.RefObject<HTMLIFrameElement>,
  payload: ThemePreviewPayload,
  options: {
    onPath?: (path: string) => void;
    onToggleMode?: () => void;
    initialPath?: string;
  } = {},
) {
  const [ready, setReady] = useState(false);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const optsRef = useRef(options);
  optsRef.current = options;

  const post = useCallback((message: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, [iframeRef]);

  const sendConfig = useCallback(() => {
    post({ type: PREVIEW_MSG.config, payload: payloadRef.current });
  }, [post]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      const data = e.data as { type?: string; path?: string } | null;
      switch (data?.type) {
        case PREVIEW_MSG.ready:
          sendConfig();
          if (optsRef.current.initialPath && optsRef.current.initialPath !== '/') {
            post({ type: PREVIEW_MSG.navigate, path: optsRef.current.initialPath });
          }
          setReady(true);
          break;
        case PREVIEW_MSG.path:
          if (typeof data.path === 'string') optsRef.current.onPath?.(data.path);
          break;
        case PREVIEW_MSG.toggleMode:
          optsRef.current.onToggleMode?.();
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [iframeRef, post, sendConfig]);

  // Push every config change (live token edits, light/dark, theme switch).
  useEffect(() => {
    if (ready) sendConfig();
  }, [ready, payload, sendConfig]);

  return { ready, post, sendConfig };
}

/* ───────────────────────────── Full interactive preview ───────────────────────────── */

export interface ThemeLivePreviewProps {
  themeConfig: ShopThemeConfig;
  shopName: string;
  device?: PreviewDevice;
  /** Height of the preview viewport in px. */
  height?: number;
  className?: string;
}

/**
 * The ONE live storefront iframe. Mount it only where the person is actively customising or
 * previewing (customizer panel, preview modal). The gallery uses static thumbnails instead.
 */
export default function ThemeLivePreview({
  themeConfig,
  shopName,
  device = 'desktop',
  height = 680,
  className = '',
}: ThemeLivePreviewProps) {
  const { t } = useTranslation();
  const { resolved: appMode } = useTheme();
  const [colorMode, setColorMode] = useState<PreviewColorMode>(appMode);
  const [currentPath, setCurrentPath] = useState('/');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [frameLoaded, setFrameLoaded] = useState(false);

  const payload = useMemo<ThemePreviewPayload>(
    () => ({ themeConfig, shopName, colorMode }),
    [themeConfig, shopName, colorMode],
  );

  const { ready, post, sendConfig } = usePreviewChannel(iframeRef, payload, {
    onPath: setCurrentPath,
    onToggleMode: () => setColorMode((m) => (m === 'dark' ? 'light' : 'dark')),
    initialPath: currentPath,
  });

  // Keep the "Open in new tab" window (and its reload draft) in sync with every edit.
  useEffect(() => {
    publishThemePreviewPayload(payload);
  }, [payload]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    ro.observe(el);
    setStageWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const activePage = pageForPath(currentPath);
  const goTo = (page: PageKey) => {
    const path = pathForPage(page, themeConfig.themeId);
    setCurrentPath(path);
    post({ type: PREVIEW_MSG.navigate, path });
  };

  const isMobile = device === 'mobile';
  const frameWidth = isMobile
    ? MOBILE_WIDTH
    : stageWidth > 0
      ? Math.min(DESKTOP_MAX_WIDTH, Math.max(DESKTOP_MIN_WIDTH, Math.round(stageWidth)))
      : DESKTOP_MIN_WIDTH;
  const scale = isMobile
    ? Math.min(1, stageWidth > 0 ? stageWidth / (MOBILE_WIDTH + 24) : 1)
    : stageWidth > 0
      ? Math.min(1, stageWidth / frameWidth)
      : 0.6;
  const innerHeight = height / scale;
  // Centre the desktop frame when the panel is wider than the largest render width.
  const desktopLeft = isMobile ? 0 : Math.max(0, Math.round((stageWidth - frameWidth * scale) / 2));
  const showSpinner = !ready || !frameLoaded;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-stone-200/70 p-1 dark:bg-zinc-800" role="tablist" aria-label={t('dashboard.themes.preview.page')}>
          {PAGES.map((p) => {
            const on = activePage === p.key;
            return (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => goTo(p.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  on
                    ? 'bg-white text-brand-600 shadow-xs dark:bg-zinc-700 dark:text-brand-400'
                    : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {t(`dashboard.themes.preview.pages.${p.labelKey}`)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              try {
                openThemePreviewTab(payload, currentPath);
              } catch (error) {
                console.error('Failed to open the theme preview in a new tab.', error);
                toast.error(t('dashboard.themes.preview.openFailed'));
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-200/70 px-3 py-2 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label={t('dashboard.themes.preview.openNewTab')}
            title={t('dashboard.themes.preview.openNewTab')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t('dashboard.themes.preview.openNewTab')}
          </button>

          <button
            type="button"
            onClick={() => setColorMode((m) => (m === 'dark' ? 'light' : 'dark'))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-200/70 px-3 py-2 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label={
              colorMode === 'dark'
                ? t('dashboard.themes.preview.lightMode')
                : t('dashboard.themes.preview.darkMode')
            }
          >
            {colorMode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {colorMode === 'dark'
              ? t('dashboard.themes.preview.light')
              : t('dashboard.themes.preview.dark')}
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-zinc-800 dark:bg-zinc-950"
        style={{ height: Math.round(height) + (isMobile ? 24 : 0) }}
      >
        <div
          className={isMobile ? 'absolute left-1/2 top-3 overflow-hidden rounded-[2rem] border-[6px] border-stone-800 bg-white shadow-2xl dark:border-zinc-700' : 'absolute top-0'}
          style={
            isMobile
              ? { width: MOBILE_WIDTH, height: height - 0, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center' }
              : { width: frameWidth, height: innerHeight, left: desktopLeft, transform: `scale(${scale})`, transformOrigin: 'top left' }
          }
        >
          <iframe
            ref={iframeRef}
            src={PREVIEW_SRC}
            title={t('dashboard.themes.preview.storefrontTitle', { name: shopName })}
            onLoad={() => {
              setFrameLoaded(true);
              sendConfig();
            }}
            className="block h-full w-full border-0 bg-white"
            style={{ width: isMobile ? '100%' : frameWidth, height: isMobile ? '100%' : innerHeight }}
          />
        </div>

        {showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100/80 backdrop-blur-sm dark:bg-zinc-950/80">
            <Loader2 className="h-6 w-6 animate-spin text-stone-500 dark:text-zinc-400" aria-label={t('dashboard.themes.preview.loading')} />
          </div>
        )}
      </div>
    </div>
  );
}
