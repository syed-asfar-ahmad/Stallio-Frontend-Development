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
}

/**
 * Merges a shop's custom theme configuration on top of the base theme defaults.
 * Produces fully hydrated tokens, layout settings, and CSS Custom Properties.
 */
export function resolveShopTheme(
  themeId?: string | null,
  customConfig?: ShopThemeConfig | null
): ResolvedTheme {
  const definition = getThemeDefinition(themeId || customConfig?.themeId);
  const baseTokens = definition.defaultTokens;
  const baseLayout = definition.defaultLayout;

  const userTokens = customConfig?.tokens;
  const userLayout = customConfig?.layout;

  const mergedTokens: ThemeTokens = {
    colors: {
      ...baseTokens.colors,
      ...(userTokens?.colors ?? {}),
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

  
    '--theme-font-heading': mergedTokens.typography.fontFamilyHeading,
    '--theme-font-body': mergedTokens.typography.fontFamilyBody,
    '--theme-heading-spacing': mergedTokens.typography.headingLetterSpacing,
    '--theme-heading-weight': mergedTokens.typography.headingFontWeight,
    '--theme-heading-transform': mergedTokens.typography.headingTransform,


    '--theme-radius-btn': mergedTokens.radii.button,
    '--theme-radius-card': mergedTokens.radii.card,
    '--theme-radius-input': mergedTokens.radii.input,
    '--theme-radius-badge': mergedTokens.radii.badge,


    '--theme-shadow-card': mergedTokens.shadows.card,
    '--theme-shadow-card-hover': mergedTokens.shadows.cardHover,
    '--theme-shadow-dropdown': mergedTokens.shadows.dropdown,
  };

  return {
    themeId: definition.id,
    tokens: mergedTokens,
    layout: mergedLayout,
    cssVariables,
  };
}
