import type {
  ThemeId,
  ThemeTokens,
  ThemeLayoutSettings,
  ShopThemeConfig,
} from './types';
import { getThemeDefinition } from './registry';
import { isLightColor, getContrastColor } from '../lib/colorUtils';

export interface ResolvedTheme {
  themeId: ThemeId;
  tokens: ThemeTokens;
  layout: ThemeLayoutSettings;
  cssVariables: Record<string, string>;
  mode: 'light' | 'dark';
}

export function resolveShopTheme(
  customConfig?: ShopThemeConfig | null,
  colorMode: 'light' | 'dark' = 'light'
): ResolvedTheme {
  const definition = getThemeDefinition(customConfig?.themeId);
  const isDark = colorMode === 'dark';
  const baseTokens =
    isDark && definition.defaultDarkTokens
      ? definition.defaultDarkTokens
      : definition.defaultTokens;
  const baseLayout = definition.defaultLayout;

  const userTokens = customConfig?.tokens;
  const userLayout = customConfig?.layout;

  // ── Dark-mode sanitizer ───────────────────────────────────────────────────
  // Strip any user color overrides that would break dark mode legibility.
  // Uses luminance thresholds instead of fragile hardcoded hex comparisons.
  const safeUserColors: Partial<ThemeTokens['colors']> = { ...(userTokens?.colors ?? {}) };
  if (isDark) {
    // Reject very-light surfaces — they would render as near-white on a dark bg
    const lightSurfaceKeys = ['surface', 'surfaceSecondary', 'background'] as const;
    for (const key of lightSurfaceKeys) {
      const val = safeUserColors[key];
      if (val && isLightColor(val)) {
        delete safeUserColors[key];
      }
    }

    // Reject very-dark text colors — they would be invisible on dark backgrounds
    const darkTextKeys = ['textPrimary', 'textSecondary'] as const;
    for (const key of darkTextKeys) {
      const val = safeUserColors[key];
      if (val && isLightColor(val)) {
        delete safeUserColors[key];
      }
    }

    // Reject very-light border colors
    if (safeUserColors.border && isLightColor(safeUserColors.border, 0.65)) {
      delete safeUserColors.border;
    }

    // ── Auto-derive primaryContrast ────────────────────────────────────────
    // If the user picked a custom primary color but did NOT explicitly set
    // primaryContrast, auto-compute it from luminance so button text is always
    // readable (fixes the white-button / white-text dark-mode bug).
    if (safeUserColors.primary && !userTokens?.colors?.primaryContrast) {
      safeUserColors.primaryContrast = getContrastColor(safeUserColors.primary);
    }
  } else {
    // Light mode: still auto-derive primaryContrast if primary was customized
    // and no explicit contrast was provided.
    if (safeUserColors.primary && !userTokens?.colors?.primaryContrast) {
      safeUserColors.primaryContrast = getContrastColor(safeUserColors.primary);
    }
  }

  const mergedTokens: ThemeTokens = {
    colors: {
      ...baseTokens.colors,
      ...safeUserColors,
    },
    typography: {
      ...baseTokens.typography,
      ...(userTokens?.typography ?? {}),
    },
    radii: {
      ...baseTokens.radii,
      ...(userTokens?.radii ?? {}),
    },
    shadows: {
      ...baseTokens.shadows,
      ...(userTokens?.shadows ?? {}),
    },
    personality: {
      imageAspectRatio: '1/1',
      containerMaxWidth: 'max-w-7xl',
      sectionDensity: 'normal',
      cardPadding: '1.25rem',
      accentGlow: 'none',
      motionDuration: '200ms',
      motionEasing: 'ease-out',
      ...(baseTokens.personality ?? {}),
      ...(userTokens?.personality ?? {}),
    },
  };

  const mergedLayout: ThemeLayoutSettings = {
    ...baseLayout,
    ...(userLayout ?? {}),
  };

  const density = mergedTokens.personality?.sectionDensity ?? 'normal';
  const sectionGap = density === 'compact' ? '2rem' : density === 'airy' ? '4.5rem' : '3rem';

  const cssVariables: Record<string, string> = {
    '--theme-primary': mergedTokens.colors.primary,
    '--theme-primary-hover': mergedTokens.colors.primaryHover,
    '--theme-primary-light': mergedTokens.colors.primaryLight,
    '--theme-primary-contrast': mergedTokens.colors.primaryContrast,
    '--theme-secondary': mergedTokens.colors.secondary,
    '--theme-bg': mergedTokens.colors.background,
    '--theme-surface': mergedTokens.colors.surface,
    '--theme-surface-secondary': mergedTokens.colors.surfaceSecondary,
    '--theme-text-primary': mergedTokens.colors.textPrimary,
    '--theme-text-secondary': mergedTokens.colors.textSecondary,
    '--theme-text-muted': mergedTokens.colors.textMuted,
    '--theme-border': mergedTokens.colors.border,
    '--theme-border-focus': mergedTokens.colors.borderFocus,
    '--theme-badge-bg': mergedTokens.colors.badgeBg,
    '--theme-badge-text': mergedTokens.colors.badgeText,

    // Typography variables (consumed by globals.css and inline styles)
    '--theme-font-heading': mergedTokens.typography.fontFamilyHeading,
    '--theme-font-body': mergedTokens.typography.fontFamilyBody,
    '--theme-heading-spacing': mergedTokens.typography.headingLetterSpacing,
    '--theme-heading-weight': mergedTokens.typography.headingFontWeight,
    '--theme-heading-transform': mergedTokens.typography.headingTransform,

    // Radii variables
    '--theme-radius-btn': mergedTokens.radii.button,
    '--theme-radius-card': mergedTokens.radii.card,
    '--theme-radius-input': mergedTokens.radii.input,
    '--theme-radius-badge': mergedTokens.radii.badge,

    // Shadows variables
    '--theme-shadow-card': mergedTokens.shadows.card,
    '--theme-shadow-card-hover': mergedTokens.shadows.cardHover,
    '--theme-shadow-dropdown': mergedTokens.shadows.dropdown,

    // Personality & Level A structural tokens
    '--theme-aspect-ratio': mergedTokens.personality?.imageAspectRatio ?? '1/1',
    '--theme-card-padding': mergedTokens.personality?.cardPadding ?? '1.25rem',
    '--theme-accent-glow': mergedTokens.personality?.accentGlow ?? 'none',
    '--theme-motion-duration': mergedTokens.personality?.motionDuration ?? '200ms',
    '--theme-motion-easing': mergedTokens.personality?.motionEasing ?? 'ease-out',
    '--theme-section-gap': sectionGap,

    // Direct bindings for Tailwind v4 semantic utility classes
    '--color-theme-primary': mergedTokens.colors.primary,
    '--color-theme-primary-hover': mergedTokens.colors.primaryHover,
    '--color-theme-primary-light': mergedTokens.colors.primaryLight,
    '--color-theme-primary-contrast': mergedTokens.colors.primaryContrast,
    '--color-theme-secondary': mergedTokens.colors.secondary,
    '--color-theme-bg': mergedTokens.colors.background,
    '--color-theme-surface': mergedTokens.colors.surface,
    '--color-theme-surface-secondary': mergedTokens.colors.surfaceSecondary,
    '--color-theme-text': mergedTokens.colors.textPrimary,
    '--color-theme-text-secondary': mergedTokens.colors.textSecondary,
    '--color-theme-text-muted': mergedTokens.colors.textMuted,
    '--color-theme-border': mergedTokens.colors.border,
    '--color-theme-border-focus': mergedTokens.colors.borderFocus,
    '--color-theme-badge-bg': mergedTokens.colors.badgeBg,
    '--color-theme-badge-text': mergedTokens.colors.badgeText,

    '--font-theme-heading': mergedTokens.typography.fontFamilyHeading,
    '--font-theme-body': mergedTokens.typography.fontFamilyBody,

    '--radius-theme-btn': mergedTokens.radii.button,
    '--radius-theme-card': mergedTokens.radii.card,
    '--radius-theme-input': mergedTokens.radii.input,
    '--radius-theme-badge': mergedTokens.radii.badge,

    '--shadow-theme-card': mergedTokens.shadows.card,
    '--shadow-theme-card-hover': mergedTokens.shadows.cardHover,
    '--shadow-theme-dropdown': mergedTokens.shadows.dropdown,
  };

  return {
    themeId: definition.id,
    tokens: mergedTokens,
    layout: mergedLayout,
    cssVariables,
    mode: colorMode,
  };
}
