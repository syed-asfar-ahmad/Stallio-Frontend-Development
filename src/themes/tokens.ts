import type { ThemeTokens } from './types';

export const classicCleanTokens: ThemeTokens = {
  colors: {
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#eef2ff',
    secondary: '#0f172a',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderFocus: '#4f46e5',
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3',
  },
  typography: {
    fontFamilyHeading: 'Outfit, ui-sans-serif, system-ui, sans-serif',
    fontFamilyBody: 'Outfit, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '-0.015em',
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
    card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
    cardHover: '0 10px 20px -5px rgb(0 0 0 / 0.08), 0 4px 6px -2px rgb(0 0 0 / 0.04)',
    dropdown: '0 12px 24px -4px rgb(0 0 0 / 0.12)',
  },
};

export const classicCleanDarkTokens: ThemeTokens = {
  ...classicCleanTokens,
  colors: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryLight: '#312e81',
    secondary: '#94a3b8',
    background: '#090d16',
    surface: '#111827',
    surfaceSecondary: '#1f2937',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#1e293b',
    borderFocus: '#6366f1',
    badgeBg: '#312e81',
    badgeText: '#e0e7ff',
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
    cardHover: '0 10px 20px -5px rgb(0 0 0 / 0.4)',
    dropdown: '0 12px 24px -4px rgb(0 0 0 / 0.5)',
  },
};

export const modernMinimalTokens: ThemeTokens = {
  colors: {
    primary: '#18181b',
    primaryHover: '#000000',
    primaryLight: '#f4f4f5',
    secondary: '#71717a',
    background: '#faf9f6',
    surface: '#ffffff',
    surfaceSecondary: '#f4f3ef',
    textPrimary: '#1c1917',
    textSecondary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e7e5e4',
    borderFocus: '#1c1917',
    badgeBg: '#1c1917',
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
    dropdown: '0 4px 20px 0 rgb(0 0 0 / 0.06)',
  },
};

export const modernMinimalDarkTokens: ThemeTokens = {
  ...modernMinimalTokens,
  colors: {
    primary: '#fafaf9',
    primaryHover: '#ffffff',
    primaryLight: '#27272a',
    secondary: '#a1a1aa',
    background: '#09090b',
    surface: '#141416',
    surfaceSecondary: '#1f1f23',
    textPrimary: '#fafaf9',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    border: '#27272a',
    borderFocus: '#fafaf9',
    badgeBg: '#27272a',
    badgeText: '#fafaf9',
  },
  shadows: {
    card: 'none',
    cardHover: 'none',
    dropdown: '0 4px 20px 0 rgb(0 0 0 / 0.4)',
  },
};

export const boldEditorialTokens: ThemeTokens = {
  colors: {
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    primaryLight: '#fef2f2',
    secondary: '#18181b',
    background: '#fafafa',
    surface: '#ffffff',
    surfaceSecondary: '#f4f4f5',
    textPrimary: '#09090b',
    textSecondary: '#52525b',
    textMuted: '#a1a1aa',
    border: '#18181b',
    borderFocus: '#dc2626',
    badgeBg: '#18181b',
    badgeText: '#ffffff',
  },
  typography: {
    fontFamilyHeading: 'Syne, Outfit, ui-sans-serif, system-ui, sans-serif',
    fontFamilyBody: 'Plus Jakarta Sans, Outfit, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '-0.03em',
    headingFontWeight: '800',
    headingTransform: 'uppercase',
  },
  radii: {
    button: '0.25rem',
    card: '0.375rem',
    input: '0.25rem',
    badge: '0.25rem',
  },
  shadows: {
    card: '3px 3px 0px 0px #09090b',
    cardHover: '5px 5px 0px 0px #09090b',
    dropdown: '4px 4px 0px 0px #09090b',
  },
};

export const boldEditorialDarkTokens: ThemeTokens = {
  ...boldEditorialTokens,
  colors: {
    primary: '#ef4444',
    primaryHover: '#dc2626',
    primaryLight: '#450a0a',
    secondary: '#e4e4e7',
    background: '#09090b',
    surface: '#18181b',
    surfaceSecondary: '#27272a',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    border: '#3f3f46',
    borderFocus: '#ef4444',
    badgeBg: '#ef4444',
    badgeText: '#ffffff',
  },
  shadows: {
    card: '3px 3px 0px 0px #27272a',
    cardHover: '5px 5px 0px 0px #27272a',
    dropdown: '4px 4px 0px 0px #27272a',
  },
};

export const boutiqueArtisanTokens: ThemeTokens = {
  colors: {
    primary: '#854d0e',
    primaryHover: '#713f12',
    primaryLight: '#fef3c7',
    secondary: '#451a03',
    background: '#faf6f0',
    surface: '#ffffff',
    surfaceSecondary: '#f5efe6',
    textPrimary: '#292524',
    textSecondary: '#78716c',
    textMuted: '#a8a29e',
    border: '#e7e0d6',
    borderFocus: '#854d0e',
    badgeBg: '#fef3c7',
    badgeText: '#78350f',
  },
  typography: {
    fontFamilyHeading: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    fontFamilyBody: '"Plus Jakarta Sans", Outfit, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '0.01em',
    headingFontWeight: '600',
    headingTransform: 'none',
  },
  radii: {
    button: '1rem',
    card: '1.25rem',
    input: '0.75rem',
    badge: '9999px',
  },
  shadows: {
    card: '0 4px 20px -4px rgb(69 26 3 / 0.06)',
    cardHover: '0 12px 28px -6px rgb(69 26 3 / 0.12)',
    dropdown: '0 16px 32px -8px rgb(69 26 3 / 0.15)',
  },
};

export const boutiqueArtisanDarkTokens: ThemeTokens = {
  ...boutiqueArtisanTokens,
  colors: {
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryLight: '#451a03',
    secondary: '#fed7aa',
    background: '#120e0b',
    surface: '#1c1612',
    surfaceSecondary: '#2a211b',
    textPrimary: '#faf6f0',
    textSecondary: '#d6cfc7',
    textMuted: '#a89f91',
    border: '#382c23',
    borderFocus: '#d97706',
    badgeBg: '#451a03',
    badgeText: '#fde68a',
  },
  shadows: {
    card: '0 4px 20px -4px rgb(0 0 0 / 0.4)',
    cardHover: '0 12px 28px -6px rgb(0 0 0 / 0.5)',
    dropdown: '0 16px 32px -8px rgb(0 0 0 / 0.6)',
  },
};

export const retailCatalogTokens: ThemeTokens = {
  colors: {
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#d1fae5',
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
    card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    cardHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

export const retailCatalogDarkTokens: ThemeTokens = {
  ...retailCatalogTokens,
  colors: {
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: '#064e3b',
    secondary: '#38bdf8',
    background: '#0a0f1d',
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
    card: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    cardHover: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
  },
};

