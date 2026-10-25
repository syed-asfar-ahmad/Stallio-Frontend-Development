/**
 * Image focal point helpers.
 *
 * A focal point (0–1 on each axis) tells every storefront theme which part of an
 * image must stay visible when the theme frames it with `object-fit: cover`.
 *
 * It is stored inside the existing image URL string as a fragment
 * (`https://…/photo.jpg#fp=0.32,0.61`). Browsers never send fragments to the
 * server, so no schema or API change is needed and old URLs keep working
 * (no fragment = centered).
 */

export type ImageFocal = { x: number; y: number };

export const DEFAULT_FOCAL: ImageFocal = { x: 0.5, y: 0.5 };

const FOCAL_FRAGMENT_RE = /#fp=(\d*\.?\d+),(\d*\.?\d+)$/;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function round3(n: number): number {
  return Math.round(clamp01(n) * 1000) / 1000;
}

export type ParsedImageFocal = {
  /** The URL without the focal fragment. */
  url: string;
  focal: ImageFocal;
  /** True when the URL carried an explicit (non-default) focal point. */
  hasFocal: boolean;
};

export function parseImageFocal(src?: string | null): ParsedImageFocal {
  const raw = src?.trim() ?? '';
  if (!raw) return { url: '', focal: DEFAULT_FOCAL, hasFocal: false };
  const m = FOCAL_FRAGMENT_RE.exec(raw);
  if (!m) return { url: raw, focal: DEFAULT_FOCAL, hasFocal: false };
  return {
    url: raw.slice(0, m.index),
    focal: { x: clamp01(parseFloat(m[1])), y: clamp01(parseFloat(m[2])) },
    hasFocal: true,
  };
}

/** Returns `src` with the given focal point stored in its fragment (or removed when centered). */
export function withImageFocal(src: string, focal: ImageFocal): string {
  const { url } = parseImageFocal(src);
  if (!url) return src;
  const x = round3(focal.x);
  const y = round3(focal.y);
  if (x === 0.5 && y === 0.5) return url;
  return `${url}#fp=${x},${y}`;
}

export function stripImageFocal(src?: string | null): string {
  return parseImageFocal(src).url;
}

/** CSS `object-position` value for a focal point. */
export function focalToObjectPosition(focal: ImageFocal): string {
  return `${round3(focal.x) * 100}% ${round3(focal.y) * 100}%`;
}

/** Re-attaches the focal fragment of `original` onto a derived URL (e.g. a proxied one). */
export function copyImageFocal(original: string | null | undefined, derivedUrl: string): string {
  const { focal, hasFocal } = parseImageFocal(original);
  if (!hasFocal || !derivedUrl) return derivedUrl;
  return withImageFocal(derivedUrl, focal);
}
