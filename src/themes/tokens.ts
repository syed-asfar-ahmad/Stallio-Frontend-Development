import type { ThemeTokens } from './types';

export const classicCleanTokens: ThemeTokens = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#eff6ff',
    primaryContrast: '#ffffff',
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
  personality: {
    imageAspectRatio: '1/1',
    containerMaxWidth: 'max-w-7xl',
    sectionDensity: 'normal',
    cardPadding: '1.25rem',
    accentGlow: 'none',
    motionDuration: '200ms',
    motionEasing: 'ease-out',
  },
};

export const classicCleanDarkTokens: ThemeTokens = {
  ...classicCleanTokens,
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: '#1e3a8a',
    primaryContrast: '#ffffff',
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
    primaryContrast: '#ffffff',
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
  personality: {
    imageAspectRatio: '4/5',
    containerMaxWidth: 'max-w-screen-xl',
    sectionDensity: 'airy',
    cardPadding: '1rem',
    accentGlow: 'none',
    motionDuration: '300ms',
    motionEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

export const modernMinimalDarkTokens: ThemeTokens = {
  ...modernMinimalTokens,
  colors: {
    primary: '#fafafa',
    primaryHover: '#ffffff',
    primaryLight: '#262626',
    primaryContrast: '#0a0a0a',
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
    primaryContrast: '#ffffff',
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
  personality: {
    imageAspectRatio: '4/5',
    containerMaxWidth: 'max-w-7xl',
    sectionDensity: 'normal',
    cardPadding: '1.25rem',
    accentGlow: '4px 4px 0px 0px #09090b',
    motionDuration: '150ms',
    motionEasing: 'ease-in-out',
  },
};


export const boutiqueArtisanTokens: ThemeTokens = {
  colors: {
    primary: '#7d5430',          // cocoa — "Buy Now" buttons, prices, active states
    primaryHover: '#674325',
    primaryLight: '#efe6d8',     // oat — "Add to Cart" buttons, chips
    primaryContrast: '#fbf4e6',  // cream text on cocoa
    secondary: '#2b1b10',        // espresso — headings, dark CTAs
    background: '#ffffff',
    surface: '#ffffff',
    surfaceSecondary: '#f5f3f0', // stone — product tiles
    textPrimary: '#2b1b10',
    textSecondary: '#6a5b4e',
    textMuted: '#9a8e82',
    border: '#e9e2d8',
    borderFocus: '#7d5430',
    badgeBg: '#efe6d8',
    badgeText: '#5b3d22',
  },
  typography: {
    fontFamilyHeading: '"Fraunces", "Playfair Display", Georgia, serif',
    fontFamilyBody: '"Instrument Sans", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '-0.025em',
    headingFontWeight: '600',
    headingTransform: 'none',
  },
  radii: {
    button: '0.625rem',
    card: '1.25rem',
    input: '0.75rem',
    badge: '9999px',
  },
  shadows: {
    card: '0 1px 2px rgb(43 27 16 / 0.04), 0 8px 24px -12px rgb(43 27 16 / 0.12)',
    cardHover: '0 2px 4px rgb(43 27 16 / 0.05), 0 22px 40px -16px rgb(43 27 16 / 0.26)',
    dropdown: '0 24px 48px -12px rgb(43 27 16 / 0.28)',
  },
  personality: {
    imageAspectRatio: '1/1',
    containerMaxWidth: 'max-w-7xl',
    sectionDensity: 'airy',
    cardPadding: '1.25rem',
    accentGlow: '0 10px 32px -10px rgba(125, 84, 48, 0.22)',
    motionDuration: '260ms',
    motionEasing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
};
export const boutiqueArtisanDarkTokens: ThemeTokens = {
  ...boutiqueArtisanTokens,
  colors: {
    primary: '#c79a63',
    primaryHover: '#d8ad78',
    primaryLight: '#2f2318',
    primaryContrast: '#1a110a',
    secondary: '#f3e7d3',
    background: '#150e09',
    surface: '#1d140d',
    surfaceSecondary: '#271b12',
    textPrimary: '#f6ecdc',
    textSecondary: '#d2c3ae',
    textMuted: '#9f917f',
    border: '#3a2a1c',
    borderFocus: '#c79a63',
    badgeBg: '#2f2318',
    badgeText: '#f0d9b5',
  },
  shadows: {
    card: '0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px -12px rgb(0 0 0 / 0.5)',
    cardHover: '0 2px 4px rgb(0 0 0 / 0.5), 0 22px 40px -16px rgb(0 0 0 / 0.7)',
    dropdown: '0 24px 48px -12px rgb(0 0 0 / 0.7)',
  },
};

export const retailCatalogTokens: ThemeTokens = {
  colors: {
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#ecfdf5',
    primaryContrast: '#ffffff',
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
  personality: {
    imageAspectRatio: '1/1',
    containerMaxWidth: 'max-w-screen-xl',
    sectionDensity: 'compact',
    cardPadding: '0.875rem',
    accentGlow: 'none',
    motionDuration: '150ms',
    motionEasing: 'ease-out',
  },
};

export const retailCatalogDarkTokens: ThemeTokens = {
  ...retailCatalogTokens,
  colors: {
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: '#064e3b',
    primaryContrast: '#080d1a',
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
    primaryContrast: '#0e0e0e',  // Deep dark text on champagne gold
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
  personality: {
    imageAspectRatio: '3/4',
    containerMaxWidth: 'max-w-6xl',
    sectionDensity: 'airy',
    cardPadding: '1.5rem',
    accentGlow: '0 0 28px -4px rgba(201, 168, 76, 0.22)',
    motionDuration: '350ms',
    motionEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

export const noirLuxeLightTokens: ThemeTokens = {
  colors: {
    primary: '#8b6914',          // Deep antique gold
    primaryHover: '#6e5210',     // Darker gold
    primaryLight: '#fdf6e3',     // Parchment
    primaryContrast: '#ffffff',  // Crisp white on antique gold
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
  personality: noirLuxeTokens.personality,
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
    primary: '#14532d',          // Rich deep botanical jade
    primaryHover: '#0d3d20',     // Forest depth
    primaryLight: '#ecfdf5',     // Mint seafoam wash
    primaryContrast: '#ffffff',  // Crisp white on deep jade
    secondary: '#0f766e',        // Coastal ocean teal
    background: '#f7faf8',       // Warm organic coastal mist
    surface: '#ffffff',
    surfaceSecondary: '#edf5f0', // Soft soothing sage surface
    textPrimary: '#0f291e',      // Deepest botanical pine black
    textSecondary: '#2d5a44',    // Sophisticated deep jade-sage
    textMuted: '#6b907e',        // Soft coastal moss
    border: '#cfe4d6',           // Refined soft jade border
    borderFocus: '#14532d',      // Jade focus ring
    badgeBg: '#dcfce7',          // Soft mint pill badge
    badgeText: '#14532d',        // Crisp botanical label
  },
  typography: {
    fontFamilyHeading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    fontFamilyBody: '"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '0.02em',
    headingFontWeight: '600',
    headingTransform: 'none',
  },
  radii: {
    button: '9999px',            // Full capsule — organic luxury
    card: '1.5rem',              // Generous softness (24px)
    input: '9999px',             // Pill inputs
    badge: '9999px',             // Pill badges
  },
  shadows: {
    // Soft jade-tinted layered shadows
    card: '0 2px 12px 0 rgb(20 83 45 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
    cardHover: '0 16px 40px -6px rgb(20 83 45 / 0.16), 0 4px 12px -2px rgb(0 0 0 / 0.06)',
    dropdown: '0 24px 48px -8px rgb(15 41 30 / 0.18)',
  },
  personality: {
    imageAspectRatio: '1/1',
    containerMaxWidth: 'max-w-7xl',
    sectionDensity: 'airy',
    cardPadding: '1.5rem',
    accentGlow: '0 12px 32px -8px rgba(20, 83, 45, 0.18)',
    motionDuration: '250ms',
    motionEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

export const pacificFreshDarkTokens: ThemeTokens = {
  ...pacificFreshTokens,
  colors: {
    primary: '#34d399',          // Luminous crystalline sea-mint
    primaryHover: '#10b981',     // Vivid emerald
    primaryLight: '#064e3b',     // Deep emerald night wash
    primaryContrast: '#022c1b',  // Ultra-deep forest black (High WCAG AAA contrast on #34d399)
    secondary: '#6ee7b7',        // Bright mint secondary
    background: '#040d08',       // Deep obsidian ocean forest
    surface: '#0a1c12',          // Polished night jade
    surfaceSecondary: '#102b1c', // Layered botanical night
    textPrimary: '#f0fdf4',      // Luminescent pearl white
    textSecondary: '#a7f3d0',    // Soft glowing mint
    textMuted: '#4e8267',        // Subtle botanical moss
    border: '#17422b',           // Deep jade contour border
    borderFocus: '#34d399',      // Bright mint glow
    badgeBg: '#0d3522',          // Deep jade night pill
    badgeText: '#6ee7b7',        // Luminescent mint text
  },
  shadows: {
    card: '0 2px 14px 0 rgb(0 0 0 / 0.45)',
    cardHover: '0 16px 40px -6px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(52 211 153 / 0.15)',
    dropdown: '0 24px 48px -8px rgb(0 0 0 / 0.75)',
  },
  personality: {
    ...pacificFreshTokens.personality,
    accentGlow: '0 12px 32px -8px rgba(52, 211, 153, 0.25)',
  },
};






