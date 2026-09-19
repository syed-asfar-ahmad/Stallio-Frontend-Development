import type { SellerPlanTier } from '../lib/sellerPlanLimits';

export type ThemeId =
  | 'classic-clean'
  | 'modern-minimal'
  | 'bold-editorial'
  | 'boutique-artisan'
  | 'retail-catalog';

export type FontFamilyPreset =
  | 'outfit'
  | 'inter'
  | 'playfair'
  | 'plus-jakarta'
  | 'syne'
  | 'cormorant'
  | 'cabinet-grotesk';

export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type HeroLayoutVariant =
  | 'split-image'
  | 'full-banner'
  | 'minimal-clean'
  | 'card-showcase';

export type ProductCardVariant =
  | 'bordered'
  | 'flat'
  | 'elevated'
  | 'compact'
  | 'editorial';

export type HeaderNavigationVariant =
  | 'classic-bar'
  | 'centered-logo'
  | 'minimal-floating'
  | 'inline-compact';

export type FooterLayoutVariant =
  | 'multi-column'
  | 'centered-minimal'
  | 'bold-newsletter'
  | 'compact-inline';

export interface ThemeColorTokens {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  badgeBg: string;
  badgeText: string;
}

export interface ThemeTypographyTokens {
  fontFamilyHeading: string;
  fontFamilyBody: string;
  headingLetterSpacing: string;
  headingFontWeight: '600' | '700' | '800';
  headingTransform: 'none' | 'uppercase' | 'capitalize';
}

export interface ThemeRadiusTokens {
  button: string;
  card: string;
  input: string;
  badge: string;
}

export interface ThemeShadowTokens {
  card: string;
  cardHover: string;
  dropdown: string;
}

export interface ThemeTokens {
  colors: ThemeColorTokens;
  typography: ThemeTypographyTokens;
  radii: ThemeRadiusTokens;
  shadows: ThemeShadowTokens;
}

export interface ThemeLayoutSettings {
  heroVariant: HeroLayoutVariant;
  productCardVariant: ProductCardVariant;
  headerVariant: HeaderNavigationVariant;
  footerVariant: FooterLayoutVariant;
  productGridColumns: 2 | 3 | 4;
  showCategoryPillsOnHome: boolean;
  showFeaturedCollection: boolean;
  showReviewsSection: boolean;
  showTrustBadges: boolean;
}

export interface ShopThemeConfig {
  version: number;
  themeId: ThemeId;
  tokens?: {
    colors?: Partial<ThemeColorTokens>;
    typography?: Partial<ThemeTypographyTokens>;
    radii?: Partial<ThemeRadiusTokens>;
    shadows?: Partial<ThemeShadowTokens>;
  };
  layout?: Partial<ThemeLayoutSettings>;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  category: 'Modern' | 'Minimalist' | 'Luxury' | 'Editorial' | 'High-Volume';
  tier: SellerPlanTier;
  previewImage: string;
  demoUrl?: string;
  features: string[];
  defaultTokens: ThemeTokens;
  defaultLayout: ThemeLayoutSettings;
}
