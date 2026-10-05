import type { SellerPlanTier } from '../lib/sellerPlanLimits';

export type ThemeId =
  | 'classic-clean'
  | 'modern-minimal'
  | 'boutique-artisan'
  | 'retail-catalog'
  | 'noir-luxe'        
  | 'pacific-fresh';   

export type FontFamilyPreset =
  | 'outfit'
  | 'inter'
  | 'playfair'
  | 'plus-jakarta'
  | 'syne'
  | 'cormorant'
  | 'cabinet-grotesk'
  | 'dm-serif'
  | 'cinzel'
  | 'fraunces';

export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type HeroLayoutVariant =
  | 'split-image'
  | 'full-banner'
  | 'minimal-clean'
  | 'card-showcase'
  | 'organic-pill'
  | 'botanical-arch'
  | 'sanctuary-panorama'
  | 'apothecary-duo'
  | 'cocoa-banner';

export type ProductCardVariant =
  | 'bordered'
  | 'flat'
  | 'elevated'
  | 'compact'
  | 'editorial'
  | 'organic-pill'
  | 'cocoa-tile';

export type HeaderNavigationVariant =
  | 'classic-bar'
  | 'centered-logo'
  | 'minimal-floating'
  | 'inline-compact'
  | 'floating-capsule'
  | 'cocoa-overlay';

export type FooterLayoutVariant =
  | 'multi-column'
  | 'centered-minimal'
  | 'bold-newsletter'
  | 'compact-inline'
  | 'organic-curated'
  | 'cocoa-atelier';

export interface ThemeColorTokens {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryContrast: string;
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
  headingFontWeight: '400' | '500' | '600' | '700' | '800';
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

export interface ThemePersonalityTokens {
  imageAspectRatio: '1/1' | '4/5' | '3/4';
  containerMaxWidth: 'max-w-6xl' | 'max-w-7xl' | 'max-w-screen-xl';
  sectionDensity: 'compact' | 'normal' | 'airy';
  cardPadding: string;
  accentGlow: string;
  motionDuration: string;
  motionEasing: string;
}

export interface ThemeTokens {
  colors: ThemeColorTokens;
  typography: ThemeTypographyTokens;
  radii: ThemeRadiusTokens;
  shadows: ThemeShadowTokens;
  personality?: ThemePersonalityTokens;
}

export type ProductDetailLayoutVariant =
  | 'gallery-split'
  | 'gallery-stacked'
  | 'gallery-carousel'
  | 'organic-wellness'
  | 'cocoa-gallery';

export type AboutLayoutVariant =
  | 'story-first'
  | 'split-image'
  | 'minimal-clean'
  | 'organic-journal'
  | 'botanical-editorial'
  | 'sanctuary-story'
  | 'cocoa-story';

export type ContactLayoutVariant =
  | 'split-card'
  | 'centered-minimal'
  | 'organic-concierge'
  | 'botanical-concierge'
  | 'curated-inquiry'
  | 'cocoa-studio';

/** Layout of the all-products / search page. `classic` keeps the shared default. */
export type ProductsPageLayoutVariant = 'classic' | 'cocoa-catalog';

/** Layout of the categories index and the single-category page. */
export type CategoryLayoutVariant = 'classic' | 'cocoa-collections';

export type HomeSectionId =
  | 'hero'
  | 'trust'
  | 'categories'
  | 'featured'
  | 'products'
  | 'collections'
  | 'reviews';

export interface ThemeLayoutSettings {
  heroVariant: HeroLayoutVariant;
  productCardVariant: ProductCardVariant;
  headerVariant: HeaderNavigationVariant;
  footerVariant: FooterLayoutVariant;
  productDetailVariant?: ProductDetailLayoutVariant;
  aboutVariant?: AboutLayoutVariant;
  contactVariant?: ContactLayoutVariant;
  productsPageVariant?: ProductsPageLayoutVariant;
  categoryVariant?: CategoryLayoutVariant;
  productGridColumns: 2 | 3 | 4;
  showCategoryPillsOnHome: boolean;
  showFeaturedCollection: boolean;
  showReviewsSection: boolean;
  showTrustBadges: boolean;
  homeSections?: HomeSectionId[];
}

export interface ShopThemeConfig {
  version: number;
  themeId: ThemeId;
  tokens?: {
    colors?: Partial<ThemeColorTokens>;
    typography?: Partial<ThemeTypographyTokens>;
    radii?: Partial<ThemeRadiusTokens>;
    shadows?: Partial<ThemeShadowTokens>;
    personality?: Partial<ThemePersonalityTokens>;
  };
  layout?: Partial<ThemeLayoutSettings>;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  category: 'Modern' | 'Minimalist' | 'Luxury'  | 'High-Volume' | 'Premium';
  tier: SellerPlanTier;
  previewImage: string;
  demoUrl?: string;
  features: string[];
  defaultTokens: ThemeTokens;
  defaultDarkTokens?: ThemeTokens;
  defaultLayout: ThemeLayoutSettings;
}