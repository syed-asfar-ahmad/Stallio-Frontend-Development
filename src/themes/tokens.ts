import type { ThemeTokens } from './types';

export const classicCleanTokens: ThemeTokens = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#eff6ff',
    secondary: '#0f172a',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderFocus: '#2563eb',
    badgeBg: '#eff6ff',
    badgeText: '#1d4ed8',
  },
  typography: {
    fontFamilyHeading: 'Outfit, ui-sans-serif, system-ui, sans-serif',
    fontFamilyBody: '"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '-0.02em',
    headingFontWeight: '700',
    headingTransform: 'none',
  },
  radii: {
    button: '0.625rem',
    card: '0.875rem',
    input: '0.5rem',
    badge: '9999px',
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
    cardHover: '0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.03)',
    dropdown: '0 16px 32px -4px rgb(0 0 0 / 0.12), 0 6px 12px -2px rgb(0 0 0 / 0.05)',
  },
};

export const classicCleanDarkTokens: ThemeTokens = {
  ...classicCleanTokens,
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: '#1e3a8a',
    secondary: '#94a3b8',
    background: '#090d16',
    surface: '#111827',
    surfaceSecondary: '#1f2937',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#1e293b',
    borderFocus: '#3b82f6',
    badgeBg: '#1e3a8a',
    badgeText: '#dbeafe',
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.4)',
    cardHover: '0 14px 28px -4px rgb(0 0 0 / 0.5), 0 6px 12px -2px rgb(0 0 0 / 0.3)',
    dropdown: '0 16px 32px -4px rgb(0 0 0 / 0.6)',
  },
};

export const modernMinimalTokens: ThemeTokens = {
  colors: {
    primary: '#171717',
    primaryHover: '#000000',
    primaryLight: '#f4f4f5',
    secondary: '#737373',
    background: '#fbfaf8',
    surface: '#ffffff',
    surfaceSecondary: '#f4f2ee',
    textPrimary: '#171717',
    textSecondary: '#525252',
    textMuted: '#a3a3a3',
    border: '#e8e5df',
    borderFocus: '#171717',
    badgeBg: '#171717',
    badgeText: '#ffffff',
  },
  typography: {
    fontFamilyHeading: '"Playfair Display", "Cinzel", "Cormorant Garamond", Georgia, serif',
    fontFamilyBody: '"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '0.04em',
    headingFontWeight: '500',
    headingTransform: 'none',
  },
  radii: {
    button: '0px',
    card: '0px',
    input: '0px',
    badge: '0px',
  },
  shadows: {
    card: 'none',
    cardHover: 'none',
    dropdown: '0 4px 24px 0 rgb(0 0 0 / 0.08)',
  },
};

export const modernMinimalDarkTokens: ThemeTokens = {
  ...modernMinimalTokens,
  colors: {
    primary: '#fafafa',
    primaryHover: '#ffffff',
    primaryLight: '#262626',
    secondary: '#a3a3a3',
    background: '#0a0a0a',
    surface: '#121212',
    surfaceSecondary: '#1c1c1c',
    textPrimary: '#fafafa',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    border: '#262626',
    borderFocus: '#fafafa',
    badgeBg: '#262626',
    badgeText: '#fafafa',
  },
  shadows: {
    card: 'none',
    cardHover: 'none',
    dropdown: '0 4px 24px 0 rgb(0 0 0 / 0.5)',
  },
};

export const boldEditorialTokens: ThemeTokens = {
  colors: {
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryLight: '#ffe4e6',
    secondary: '#09090b',
    background: '#f4f4f5',
    surface: '#ffffff',
    surfaceSecondary: '#e4e4e7',
    textPrimary: '#09090b',
    textSecondary: '#3f3f46',
    textMuted: '#71717a',
    border: '#09090b',
    borderFocus: '#e11d48',
    badgeBg: '#09090b',
    badgeText: '#ffffff',
  },
  typography: {
    fontFamilyHeading: 'Syne, Outfit, ui-sans-serif, system-ui, sans-serif',
    fontFamilyBody: '"Plus Jakarta Sans", Outfit, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '-0.03em',
    headingFontWeight: '800',
    headingTransform: 'uppercase',
  },
  radii: {
    button: '0.375rem',
    card: '0.5rem',
    input: '0.375rem',
    badge: '0.25rem',
  },
  shadows: {
    card: '4px 4px 0px 0px #09090b',
    cardHover: '6px 6px 0px 0px #09090b',
    dropdown: '6px 6px 0px 0px #09090b',
  },
};


export const boutiqueArtisanTokens: ThemeTokens = {
  colors: {
    primary: '#9a3412',
    primaryHover: '#7c2d12',
    primaryLight: '#ffedd5',
    secondary: '#431407',
    background: '#fcf8f2',
    surface: '#ffffff',
    surfaceSecondary: '#f5eee3',
    textPrimary: '#292524',
    textSecondary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e8decb',
    borderFocus: '#9a3412',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
  },
  typography: {
    fontFamilyHeading: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    fontFamilyBody: '"Plus Jakarta Sans", Outfit, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '0.01em',
    headingFontWeight: '600',
    headingTransform: 'none',
  },
  radii: {
    button: '9999px',
    card: '1.25rem',
    input: '0.75rem',
    badge: '9999px',
  },
  shadows: {
    card: '0 6px 24px -4px rgb(154 52 18 / 0.07)',
    cardHover: '0 16px 36px -6px rgb(154 52 18 / 0.14)',
    dropdown: '0 20px 40px -8px rgb(154 52 18 / 0.16)',
  },
};

export const boutiqueArtisanDarkTokens: ThemeTokens = {
  ...boutiqueArtisanTokens,
  colors: {
    primary: '#f59e0b',
    primaryHover: '#d97706',
    primaryLight: '#451a03',
    secondary: '#fef3c7',
    background: '#120e0b',
    surface: '#1c1612',
    surfaceSecondary: '#292019',
    textPrimary: '#faf6f0',
    textSecondary: '#d6cfc7',
    textMuted: '#a89f91',
    border: '#3b2e24',
    borderFocus: '#f59e0b',
    badgeBg: '#451a03',
    badgeText: '#fef3c7',
  },
  shadows: {
    card: '0 6px 24px -4px rgb(0 0 0 / 0.4)',
    cardHover: '0 16px 36px -6px rgb(0 0 0 / 0.55)',
    dropdown: '0 20px 40px -8px rgb(0 0 0 / 0.65)',
  },
};

export const retailCatalogTokens: ThemeTokens = {
  colors: {
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#ecfdf5',
    secondary: '#0284c7',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderFocus: '#059669',
    badgeBg: '#fee2e2',
    badgeText: '#991b1b',
  },
  typography: {
    fontFamilyHeading: 'Outfit, ui-sans-serif, system-ui, sans-serif',
    fontFamilyBody: 'Inter, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '-0.02em',
    headingFontWeight: '700',
    headingTransform: 'none',
  },
  radii: {
    button: '0.375rem',
    card: '0.5rem',
    input: '0.375rem',
    badge: '0.25rem',
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
    cardHover: '0 6px 12px -2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
    dropdown: '0 12px 20px -4px rgb(0 0 0 / 0.12)',
  },
};

export const retailCatalogDarkTokens: ThemeTokens = {
  ...retailCatalogTokens,
  colors: {
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: '#064e3b',
    secondary: '#38bdf8',
    background: '#080d1a',
    surface: '#0f172a',
    surfaceSecondary: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#1e293b',
    borderFocus: '#10b981',
    badgeBg: '#450a0a',
    badgeText: '#fca5a5',
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.4)',
    cardHover: '0 6px 12px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    dropdown: '0 12px 20px -4px rgb(0 0 0 / 0.6)',
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM THEME 1 — NOIR LUXE
// Target: high-end fashion, jewellery, watches, perfume
// Palette: deep charcoal ground · champagne gold primary · warm white text
// Typography: DM Serif Display headings (tracked wide) · Inter body
// Geometry: sharp card corners, pill badges, lifted gold shadows
// ─────────────────────────────────────────────────────────────────────────────

export const noirLuxeTokens: ThemeTokens = {
  colors: {
    primary: '#c9a84c',          // Champagne gold
    primaryHover: '#b08d38',     // Burnished gold
    primaryLight: '#2e2516',     // Deep amber tint for highlights
    secondary: '#f0ece4',        // Warm white
    background: '#0e0e0e',       // Near-true black
    surface: '#161616',          // Lifted charcoal
    surfaceSecondary: '#1f1f1f', // Subtle step up
    textPrimary: '#f0ece4',      // Warm white
    textSecondary: '#b0a898',    // Warm grey
    textMuted: '#6b6460',        // Muted taupe
    border: '#2a2826',           // Barely-visible dark border
    borderFocus: '#c9a84c',      // Gold focus ring
    badgeBg: '#c9a84c',          // Gold badge
    badgeText: '#0e0e0e',        // Black text on gold
  },
  typography: {
    fontFamilyHeading: '"DM Serif Display", "Playfair Display", Georgia, serif',
    fontFamilyBody: 'Inter, "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '0.06em',
    headingFontWeight: '400',    // Serifs read luxurious at regular weight
    headingTransform: 'none',
  },
  radii: {
    button: '0px',               // Hard-edged — deliberate luxury severity
    card: '0px',
    input: '2px',
    badge: '9999px',             // Pill badges only
  },
  shadows: {
    // Warm gold-tinted glow — makes cards feel lit from within
    card: '0 2px 8px 0 rgb(201 168 76 / 0.06)',
    cardHover: '0 12px 32px -4px rgb(201 168 76 / 0.18), 0 2px 8px 0 rgb(0 0 0 / 0.4)',
    dropdown: '0 20px 40px -8px rgb(0 0 0 / 0.7), 0 0 0 1px rgb(201 168 76 / 0.12)',
  },
};

export const noirLuxeLightTokens: ThemeTokens = {
  colors: {
    primary: '#8b6914',          // Deep antique gold
    primaryHover: '#6e5210',     // Darker gold
    primaryLight: '#fdf6e3',     // Parchment
    secondary: '#1a1207',        // Ink black
    background: '#fdfaf4',       // Warm parchment
    surface: '#ffffff',
    surfaceSecondary: '#f5edd8', // Ivory surface
    textPrimary: '#1a1207',
    textSecondary: '#5c4e38',
    textMuted: '#9c8c72',
    border: '#e8d9b8',
    borderFocus: '#8b6914',
    badgeBg: '#1a1207',
    badgeText: '#fdf6e3',
  },
  typography: noirLuxeTokens.typography,
  radii: noirLuxeTokens.radii,
  shadows: {
    card: '0 2px 8px 0 rgb(26 18 7 / 0.06)',
    cardHover: '0 12px 32px -4px rgb(26 18 7 / 0.12)',
    dropdown: '0 16px 32px -4px rgb(26 18 7 / 0.18)',
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM THEME 2 — PACIFIC FRESH
// Target: wellness, organic skincare, supplements, health food, plant-based
// Palette: pure white surface · deep jade primary · sage tint accents
// Typography: Cormorant Garamond headings (soft elegance) · Plus Jakarta body
// Geometry: generous rounding, soft layered shadows, capsule buttons
// ─────────────────────────────────────────────────────────────────────────────

export const pacificFreshTokens: ThemeTokens = {
  colors: {
    primary: '#1a6b4a',          // Deep jade green
    primaryHover: '#155a3d',     // Forest
    primaryLight: '#e8f5ee',     // Mint tint
    secondary: '#0d3d2a',        // Deep forest secondary
    background: '#f7fbf8',       // Barely-green white
    surface: '#ffffff',
    surfaceSecondary: '#eef7f2', // Soft sage
    textPrimary: '#0d2b1e',      // Near-black green-tinted
    textSecondary: '#3d6654',    // Mid green-grey
    textMuted: '#7da890',        // Sage muted
    border: '#c8e4d4',           // Pale sage border
    borderFocus: '#1a6b4a',      // Jade focus
    badgeBg: '#1a6b4a',          // Jade badge
    badgeText: '#ffffff',
  },
  typography: {
    fontFamilyHeading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    fontFamilyBody: '"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '0.02em',
    headingFontWeight: '600',
    headingTransform: 'none',
  },
  radii: {
    button: '9999px',            // Full capsule — fresh, approachable
    card: '1.5rem',              // Generous softness
    input: '9999px',             // Capsule inputs
    badge: '9999px',
  },
  shadows: {
    // Soft jade-tinted layered shadows
    card: '0 2px 12px 0 rgb(26 107 74 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
    cardHover: '0 16px 40px -6px rgb(26 107 74 / 0.14), 0 4px 12px -2px rgb(0 0 0 / 0.06)',
    dropdown: '0 24px 48px -8px rgb(13 43 30 / 0.18)',
  },
};

export const pacificFreshDarkTokens: ThemeTokens = {
  ...pacificFreshTokens,
  colors: {
    primary: '#2dd4a0',          // Bright teal-mint on dark
    primaryHover: '#22c98e',
    primaryLight: '#052e1e',     // Deep forest tint
    secondary: '#a3e8cb',        // Pale mint secondary
    background: '#060f0a',       // Deep forest black
    surface: '#0c1a11',          // Forest surface
    surfaceSecondary: '#132419', // Slightly lighter
    textPrimary: '#e8f5ee',      // Mint-white
    textSecondary: '#7bc4a0',    // Soft mint
    textMuted: '#3e6b52',        // Muted forest
    border: '#1a3328',           // Dark jade border
    borderFocus: '#2dd4a0',      // Bright teal focus
    badgeBg: '#2dd4a0',
    badgeText: '#060f0a',
  },
  shadows: {
    card: '0 2px 12px 0 rgb(0 0 0 / 0.4)',
    cardHover: '0 16px 40px -6px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(45 212 160 / 0.08)',
    dropdown: '0 24px 48px -8px rgb(0 0 0 / 0.7)',
  },
};





