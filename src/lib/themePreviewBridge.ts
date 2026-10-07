import { useSyncExternalStore } from 'react';
import type { ShopThemeConfig, ThemeId } from '../themes/types';

/**
 * Theme preview bridge.
 *
 * The real storefront is rendered at `/__theme-preview` in two situations:
 *
 *  1. FRAME      – inside the dashboard's single live <iframe> (customizer / preview modal).
 *                  Config arrives from the dashboard through `postMessage`.
 *  2. STANDALONE – in its own browser tab ("Open in new tab"). The tab is a normal, URL-addressable
 *                  page: `/__theme-preview/<page>?theme=<id>&mode=<light|dark>`.
 *                  Config comes from (in priority order):
 *                    a) the draft the dashboard keeps in localStorage (unsaved customizer edits),
 *                    b) the URL (`theme`, `mode`, `shop`) so the tab ALWAYS renders something,
 *                  and then stays live through a BroadcastChannel while the dashboard is open.
 *
 * This module has no runtime dependencies on the theme system so it can be imported anywhere
 * (including ThemeContext) without creating import cycles.
 */

export const THEME_PREVIEW_USERNAME = '__theme-preview';

const DRAFT_STORAGE_KEY = 'stallio:theme-preview:draft';
const CHANNEL_NAME = 'stallio:theme-preview';
const DEFAULT_THEME_ID: ThemeId = 'classic-clean';
const DEFAULT_SHOP_NAME = 'Sample Storefront';

export const PREVIEW_MSG = {
  /** iframe → parent: the preview app finished booting */
  ready: 'stallio:theme-preview:ready',
  /** parent → iframe: theme config + display settings */
  config: 'stallio:theme-preview:config',
  /** parent → iframe: navigate inside the storefront */
  navigate: 'stallio:theme-preview:navigate',
  /** iframe → parent: storefront path changed */
  path: 'stallio:theme-preview:path',
  /** iframe → parent: visitor pressed the light/dark toggle inside the storefront */
  toggleMode: 'stallio:theme-preview:toggle-mode',
} as const;

export type PreviewColorMode = 'light' | 'dark';

export interface ThemePreviewPayload {
  themeConfig: ShopThemeConfig;
  shopName: string;
  colorMode: PreviewColorMode;
}

/* ───────────────────────────── Environment detection ───────────────────────────── */

function onPreviewPath(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.location.pathname === `/${THEME_PREVIEW_USERNAME}` ||
      window.location.pathname.startsWith(`/${THEME_PREVIEW_USERNAME}/`))
  );
}

/** True only inside the dashboard's preview iframe. */
export function isThemePreviewFrame(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.parent !== window && onPreviewPath();
  } catch {
    return false;
  }
}

/** True when the preview was opened as its own top-level browser tab. */
export function isStandaloneThemePreview(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.parent === window && onPreviewPath();
  } catch {
    return false;
  }
}

/* ───────────────────────────── Payload validation ───────────────────────────── */

function isThemePreviewPayload(value: unknown): value is ThemePreviewPayload {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ThemePreviewPayload>;
  return (
    typeof candidate.shopName === 'string' &&
    !!candidate.themeConfig &&
    typeof candidate.themeConfig === 'object' &&
    typeof candidate.themeConfig.themeId === 'string' &&
    (candidate.colorMode === 'light' || candidate.colorMode === 'dark')
  );
}

/* ───────────────────────────── Shared external store ───────────────────────────── */

let payload: ThemePreviewPayload | null = null;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const notify = () => listeners.forEach((listener) => listener());

function setPayload(next: ThemePreviewPayload) {
  payload = next;
  notify();
}

/** Non-reactive read of the current payload (used by tests and one-off reads). */
export function getThemePreviewPayload(): ThemePreviewPayload | null {
  return payload;
}

export function useThemePreviewPayload(): ThemePreviewPayload | null {
  return useSyncExternalStore(
    subscribe,
    () => payload,
    () => null,
  );
}

/* Standalone-tab sync status (drives the little badge in the corner). */
let linkedToDashboard = false;
const linkListeners = new Set<() => void>();
function setLinked(next: boolean) {
  if (linkedToDashboard === next) return;
  linkedToDashboard = next;
  linkListeners.forEach((l) => l());
}

/** `true` once the standalone tab has received a live update from the dashboard. */
export function useStandalonePreviewLinked(): boolean {
  return useSyncExternalStore(
    (cb) => {
      linkListeners.add(cb);
      return () => linkListeners.delete(cb);
    },
    () => linkedToDashboard,
    () => false,
  );
}

/* ───────────────────────────── Draft storage (dashboard → new tab) ───────────────────────────── */

function readDraft(): ThemePreviewPayload | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { payload?: unknown } | null;
    return parsed && isThemePreviewPayload(parsed.payload) ? parsed.payload : null;
  } catch {
    return null;
  }
}

let draftTimer: number | undefined;
function writeDraftSoon(next: ThemePreviewPayload) {
  if (typeof window === 'undefined') return;
  window.clearTimeout(draftTimer);
  draftTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ payload: next, updatedAt: Date.now() }));
    } catch {
      // Storage can be full or blocked; the URL fallback still renders the theme.
    }
  }, 200);
}

function writeDraftNow(next: ThemePreviewPayload) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ payload: next, updatedAt: Date.now() }));
  } catch {
    // ignore – see above
  }
}

/* ───────────────────────────── Dashboard side ───────────────────────────── */

let dashboardChannel: BroadcastChannel | null = null;
let latestDashboardPayload: ThemePreviewPayload | null = null;

function ensureDashboardChannel(): BroadcastChannel | null {
  if (dashboardChannel) return dashboardChannel;
  if (typeof BroadcastChannel === 'undefined') return null;
  dashboardChannel = new BroadcastChannel(CHANNEL_NAME);
  dashboardChannel.onmessage = (e: MessageEvent) => {
    // A freshly opened standalone tab asks for the current state.
    if (e.data?.type === 'hello' && latestDashboardPayload) {
      dashboardChannel?.postMessage({ type: 'config', payload: latestDashboardPayload });
    }
  };
  return dashboardChannel;
}

/**
 * Called by the dashboard preview whenever its config changes. Keeps the draft fresh (so a new
 * tab / reload starts from the latest edits) and pushes live updates to any open standalone tab.
 */
export function publishThemePreviewPayload(next: ThemePreviewPayload): void {
  if (typeof window === 'undefined' || isThemePreviewFrame() || isStandaloneThemePreview()) return;
  latestDashboardPayload = next;
  writeDraftSoon(next);
  ensureDashboardChannel()?.postMessage({ type: 'config', payload: next });
}

/** Build the URL of the standalone preview. Safe to share: it renders from the URL alone. */
export function buildThemePreviewUrl(previewPayload: ThemePreviewPayload, path = '/'): string {
  const safePath = path.startsWith('/') && !path.startsWith('//') ? path : '/';
  const url = new URL(
    `/${THEME_PREVIEW_USERNAME}${safePath === '/' ? '' : safePath}`,
    window.location.origin,
  );
  url.searchParams.set('theme', previewPayload.themeConfig.themeId);
  url.searchParams.set('mode', previewPayload.colorMode);
  if (previewPayload.shopName && previewPayload.shopName !== DEFAULT_SHOP_NAME) {
    url.searchParams.set('shop', previewPayload.shopName);
  }
  return url.toString();
}

/** Open the standalone preview in a new tab. Throws if the browser blocked the pop-up. */
export function openThemePreviewTab(previewPayload: ThemePreviewPayload, path: string): void {
  // Persist the latest edits synchronously so the new tab can read them on its very first paint.
  latestDashboardPayload = previewPayload;
  writeDraftNow(previewPayload);
  ensureDashboardChannel();

  const previewWindow = window.open(buildThemePreviewUrl(previewPayload, path), '_blank');
  if (!previewWindow) throw new Error('The preview tab was blocked by the browser.');
  try {
    previewWindow.opener = null;
  } catch {
    // Not critical.
  }
}

/* ───────────────────────────── Preview-page side (frame + standalone) ───────────────────────────── */

let listenerInstalled = false;
let fetchStubbed = false;

function payloadFromUrl(): ThemePreviewPayload {
  const params = new URLSearchParams(window.location.search);
  const themeId = (params.get('theme') || DEFAULT_THEME_ID) as ThemeId;
  const colorMode: PreviewColorMode = params.get('mode') === 'dark' ? 'dark' : 'light';
  return {
    themeConfig: { version: 1, themeId },
    shopName: params.get('shop') || DEFAULT_SHOP_NAME,
    colorMode,
  };
}

function installStandalone() {
  const themeParam = new URLSearchParams(window.location.search).get('theme');
  const draft = readDraft();
  const draftMatches = !!draft && (!themeParam || draft.themeConfig.themeId === themeParam);
  // Never leave the tab empty: draft first, URL otherwise.
  setPayload(draftMatches && draft ? draft : payloadFromUrl());

  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (e: MessageEvent) => {
    const data = e.data as { type?: string; payload?: unknown } | null;
    if (data?.type === 'config' && isThemePreviewPayload(data.payload)) {
      setLinked(true);
      setPayload(data.payload);
    }
  };
  // Ask an already-open dashboard for the freshest state.
  channel.postMessage({ type: 'hello' });
}

/** Listen for config from the dashboard and announce readiness. No-op on non-preview pages. */
export function installThemePreviewListener(): void {
  if (listenerInstalled) return;

  if (isStandaloneThemePreview()) {
    listenerInstalled = true;
    try {
      installStandalone();
    } catch (error) {
      console.error('Failed to initialise the standalone theme preview.', error);
      setPayload(payloadFromUrl());
    }
    return;
  }

  if (!isThemePreviewFrame()) return;
  listenerInstalled = true;

  window.addEventListener('message', (e: MessageEvent) => {
    if (e.origin !== window.location.origin || e.source !== window.parent) return;
    const data = e.data as { type?: string; payload?: unknown } | null;
    if (data?.type === PREVIEW_MSG.config && isThemePreviewPayload(data.payload)) {
      setPayload(data.payload);
    }
  });

  window.parent.postMessage({ type: PREVIEW_MSG.ready }, window.location.origin);
}

/**
 * Inside the preview (frame or standalone), storefront API calls for the sample shop
 * (contact form, checkout, coupons) resolve with a harmless success response instead of
 * hitting the network.
 */
export function installThemePreviewFetchStub(): void {
  if (fetchStubbed || !(isThemePreviewFrame() || isStandaloneThemePreview())) return;
  fetchStubbed = true;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes(`/api/shop/${THEME_PREVIEW_USERNAME}`)) {
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true, preview: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    return original(input, init);
  };
}

/** Ask the dashboard to flip the preview's light/dark mode (used by the storefront's own toggle). */
export function requestPreviewModeToggle(): void {
  try {
    window.parent.postMessage({ type: PREVIEW_MSG.toggleMode }, window.location.origin);
  } catch {
    /* ignore */
  }
}

export function toggleStandalonePreviewMode(): void {
  if (!payload || !isStandaloneThemePreview()) return;
  setPayload({ ...payload, colorMode: payload.colorMode === 'dark' ? 'light' : 'dark' });
}
