import type {
  ThemeId,
  ThemeTokens,
  ThemeLayoutSettings,
  ShopThemeConfig,
} from './types';
import { getThemeDefinition } from './registry';

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

  // In dark mode, filter out default light surfaces so dark themes look deeply atmospheric
  const safeUserColors: Partial<ThemeTokens['colors']> = { ...(userTokens?.colors ?? {}) };
  if (isDark) {
    if (safeUserColors.surface === '#ffffff' || safeUserColors.surface === '#fff') {
      delete safeUserColors.surface;
    }
    if (
      safeUserColors.surfaceSecondary === '#f1f5f9' ||
      safeUserColors.surfaceSecondary === '#f4f4f5' ||
      safeUserColors.surfaceSecondary === '#f4f2ee' ||
      safeUserColors.surfaceSecondary === '#f5eee3'
    ) {
      delete safeUserColors.surfaceSecondary;
    }
    if (
      safeUserColors.background === '#ffffff' ||
      safeUserColors.background === '#f8fafc' ||
      safeUserColors.background === '#fafafa' ||
      safeUserColors.background === '#fbfaf8' ||
      safeUserColors.background === '#fcf8f2'
    ) {
      delete safeUserColors.background;
    }
    if (
      safeUserColors.textPrimary === '#0f172a' ||
      safeUserColors.textPrimary === '#171717' ||
      safeUserColors.textPrimary === '#292524'
    ) {
      delete safeUserColors.textPrimary;
    }
    if (
      safeUserColors.textSecondary === '#475569' ||
      safeUserColors.textSecondary === '#525252' ||
      safeUserColors.textSecondary === '#78716c'
    ) {
      delete safeUserColors.textSecondary;
    }
    if (
      safeUserColors.border === '#e2e8f0' ||
      safeUserColors.border === '#e8e5df' ||
      safeUserColors.border === '#e8decb'
    ) {
      delete safeUserColors.border;
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
  };

  const mergedLayout: ThemeLayoutSettings = {
    ...baseLayout,
    ...(userLayout ?? {}),
  };

  const cssVariables: Record<string, string> = {
    '--theme-primary': mergedTokens.colors.primary,
    '--theme-primary-hover': mergedTokens.colors.primaryHover,
    '--theme-primary-light': mergedTokens.colors.primaryLight,
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

    // Direct bindings for Tailwind v4 semantic utility classes
    '--color-theme-primary': mergedTokens.colors.primary,
    '--color-theme-primary-hover': mergedTokens.colors.primaryHover,
    '--color-theme-primary-light': mergedTokens.colors.primaryLight,
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
    '--theme-heading-spacing': mergedTokens.typography.headingLetterSpacing,
    '--theme-heading-weight': mergedTokens.typography.headingFontWeight,
    '--theme-heading-transform': mergedTokens.typography.headingTransform,

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
