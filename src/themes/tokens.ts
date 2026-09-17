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


export const modernMinimalTokens: ThemeTokens = {
  colors: {
    primary: '#18181b',
    primaryHover: '#09090b',
    primaryLight: '#f4f4f5',
    secondary: '#71717a',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceSecondary: '#fafafa',
    textPrimary: '#09090b',
    textSecondary: '#71717a',
    textMuted: '#a1a1aa',
    border: '#e4e4e7',
    borderFocus: '#18181b',
    badgeBg: '#f4f4f5',
    badgeText: '#18181b',
  },
  typography: {
    fontFamilyHeading: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontFamilyBody: 'Inter, ui-sans-serif, system-ui, sans-serif',
    headingLetterSpacing: '-0.025em',
    headingFontWeight: '600',
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
    dropdown: '0 4px 12px 0 rgb(0 0 0 / 0.08)',
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
