/**
 * colorUtils.ts — Shared color contrast utilities
 * Used by resolver.ts (dark-mode sanitizer) and DashboardThemes customizer.
 */

/**
 * Parse a 6-digit hex color (#rrggbb) into { r, g, b }.
 * Returns null if the hex is invalid.
 */
function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim();
  // Support both #rrggbb and #rgb
  const full = cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
  const match6 = /^#([0-9A-Fa-f]{6})$/.exec(full);
  if (match6) {
    return {
      r: parseInt(match6[1].slice(0, 2), 16),
      g: parseInt(match6[1].slice(2, 4), 16),
      b: parseInt(match6[1].slice(4, 6), 16),
    };
  }
  const match3 = /^#([0-9A-Fa-f]{3})$/.exec(full);
  if (match3) {
    return {
      r: parseInt(match3[1][0].repeat(2), 16),
      g: parseInt(match3[1][1].repeat(2), 16),
      b: parseInt(match3[1][2].repeat(2), 16),
    };
  }
  return null;
}

/**
 * Compute perceived luminance (0–1) using the sRGB formula.
 * Returns 0.5 (neutral) for invalid/unparseable colors so callers degrade gracefully.
 */
function getLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0.5;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

/**
 * Returns '#ffffff' or '#0a0a0a' — whichever provides better WCAG contrast
 * against the given background hex color.
 *
 * Usage in customizer:
 *   const contrast = getContrastColor(primaryHex);
 *   // use as button text / icon color on that background
 */
export function getContrastColor(hex: string): string {
  return getLuminance(hex) > 0.5 ? '#0a0a0a' : '#ffffff';
}

/**
 * Returns true if the color is perceived as a "light" color
 * (luminance above the given threshold, default 0.72).
 *
 * Used by resolver.ts to auto-strip light surfaces in dark mode.
 */
export function isLightColor(hex: string, threshold = 0.72): boolean {
  return getLuminance(hex) > threshold;
}

/**
 * Returns true if the color is perceived as a "dark" color
 * (luminance below the given threshold, default 0.28).
 */
export function isDarkColor(hex: string, threshold = 0.28): boolean {
  return getLuminance(hex) < threshold;
}

/**
 * Computes approximate WCAG contrast ratio between two hex colors.
 * Values ≥ 4.5 are AA compliant for normal text.
 * Values ≥ 3.0 are AA compliant for large text.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const L1 = getLuminance(hex1);
  const L2 = getLuminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
