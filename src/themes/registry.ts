import type { ThemeId, ThemeDefinition } from './types';
import {
  classicCleanTokens,
  classicCleanDarkTokens,
  modernMinimalTokens,
  modernMinimalDarkTokens,
  boutiqueArtisanTokens,
  boutiqueArtisanDarkTokens,
  retailCatalogTokens,
  retailCatalogDarkTokens,
  noirLuxeTokens,
  noirLuxeLightTokens,
  pacificFreshTokens,
  pacificFreshDarkTokens,
} from './tokens';
import { DEFAULT_THEME_ID } from './constants';

export const THEME_REGISTRY: Record<ThemeId, ThemeDefinition> = {
  // ─── Existing themes ──────────────────────────────────────────────────────

  'classic-clean': {
    id: 'classic-clean',
    name: 'classic-clean',
    displayName: 'Classic Clean',
    tagline: 'Balanced, timeless, and conversion-focused for any storefront',
    description:
      'A versatile layout designed for maximum conversion. Features prominent product grids, clear navigation, and adaptive color accents.',
    category: 'Modern',
    tier: 'basic',
    previewImage: '/themes/previews/classic-clean.webp',
    features: [
      'High-converting product cards with instant add-to-cart',
      'Balanced typography with responsive grid columns',
      'Trust badges and announcement bar integration',
      'Support for category carousels and hero banners',
    ],
    defaultTokens: classicCleanTokens,
    defaultDarkTokens: classicCleanDarkTokens,
    defaultLayout: {
      heroVariant: 'full-banner',
      productCardVariant: 'bordered',
      headerVariant: 'classic-bar',
      footerVariant: 'multi-column',
      productDetailVariant: 'gallery-split',
      aboutVariant: 'minimal-clean',
      contactVariant: 'split-card',
      productGridColumns: 3,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
      homeSections: ['hero', 'trust', 'categories', 'featured', 'products', 'reviews'],
    },
  },

  'modern-minimal': {
    id: 'modern-minimal',
    name: 'modern-minimal',
    displayName: 'Modern Minimal',
    tagline: 'Architectural minimalism with maximum visual breathing room',
    description:
      'Understated elegance focusing on photography and typography. Sharp angles, borderless product showcases, and distraction free shopping.',
    category: 'Minimalist',
    tier: 'basic',
    previewImage: '/themes/previews/modern-minimal.webp',
    features: [
      'Edge to edge product imagery with minimal UI clutter',
      'Monochrome styling with customizable accent strokes',
      'Sticky minimalist header with subtle navigation',
      'Curated lookbook and collection spotlights',
    ],
    defaultTokens: modernMinimalTokens,
    defaultDarkTokens: modernMinimalDarkTokens,
    defaultLayout: {
      heroVariant: 'minimal-clean',
      productCardVariant: 'flat',
      headerVariant: 'minimal-floating',
      footerVariant: 'centered-minimal',
      productDetailVariant: 'gallery-stacked',
      aboutVariant: 'minimal-clean',
      contactVariant: 'centered-minimal',
      productGridColumns: 3,
      showCategoryPillsOnHome: false,
      showFeaturedCollection: true,
      showReviewsSection: false,
      showTrustBadges: false,
      homeSections: ['hero', 'featured', 'products'],
    },
  },


  'boutique-artisan': {
    id: 'boutique-artisan',
    name: 'boutique-artisan',
    displayName: 'Boutique Artisan',
    tagline: 'Cocoa, cream and soft serif — a photo-led boutique storefront',
    description:
      'A cocoa-and-cream storefront built around photography: a full-bleed hero with the navigation floating over it, tall promo cards, soft stone product tiles with paired Add to Cart / Buy Now actions, and mosaic collection grids.',
    category: 'Luxury',
    tier: 'business',
    previewImage: '/themes/previews/boutique-artisan.webp',
    features: [
      'Full-bleed cocoa hero with navigation floating over the photograph',
      'Chunky soft-serif headlines (Fraunces) over a clean grotesque body',
      'Stone product tiles with paired Add to Cart and Buy Now actions',
      'Tall promo cards and a mosaic of recommended collections',
      'Dedicated search catalog, collection, gallery, story and studio layouts',
    ],
    defaultTokens: boutiqueArtisanTokens,
    defaultDarkTokens: boutiqueArtisanDarkTokens,
    defaultLayout: {
      heroVariant: 'cocoa-banner',
      productCardVariant: 'cocoa-tile',
      headerVariant: 'cocoa-overlay',
      footerVariant: 'cocoa-atelier',
      productDetailVariant: 'cocoa-gallery',
      aboutVariant: 'cocoa-story',
      contactVariant: 'cocoa-studio',
      productsPageVariant: 'cocoa-catalog',
      categoryVariant: 'cocoa-collections',
      productGridColumns: 3,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
      homeSections: ['hero', 'categories', 'featured', 'products', 'collections', 'trust', 'reviews'],
    },
  },

  'retail-catalog': {
    id: 'retail-catalog',
    name: 'retail-catalog',
    displayName: 'Retail Catalog',
    tagline: 'High-density catalog optimized for multi-SKU retail and fast shopping',
    description:
      'Optimized for large inventories, supermarkets, and electronics. High density grids, fast quantity selectors, and instant search filter integration.',
    category: 'High-Volume',
    tier: 'business',
    previewImage: '/themes/previews/retail-catalog.webp',
    features: [
      'Dense 4 column product grid with quick view and fast add',
      'Prominent discount pills, stock indicators, and price comparisons',
      'Horizontal category scrollbar with sticky header navigation',
      'Comprehensive footer with store delivery and support specs',
    ],
    defaultTokens: retailCatalogTokens,
    defaultDarkTokens: retailCatalogDarkTokens,
    defaultLayout: {
      heroVariant: 'card-showcase',
      productCardVariant: 'compact',
      headerVariant: 'inline-compact',
      footerVariant: 'multi-column',
      productDetailVariant: 'gallery-split',
      aboutVariant: 'split-image',
      contactVariant: 'split-card',
      productGridColumns: 4,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
      homeSections: ['hero', 'categories', 'featured', 'products', 'trust', 'reviews'],
    },
  },

  // ─── Premium themes ────────────────────────────────────────────────────────

  'noir-luxe': {
    id: 'noir-luxe',
    name: 'noir-luxe',
    displayName: 'Noir Luxe',
    tagline: 'Dark prestige for jewellery, watches, and high-fashion brands',
    description:
      'A deep charcoal canvas with champagne-gold accents and wide-tracked serif headings. Every surface is calibrated for premium positioning — zero visual noise, all atmosphere.',
    category: 'Premium',
    tier: 'business',
    previewImage: '/themes/previews/noir-luxe.webp',
    features: [
      'Dark charcoal ground with champagne-gold accent system',
      'DM Serif Display headings with generous tracking',
      'Hard-edged square geometry for deliberate luxury severity',
      'Gold-tinted glow shadows and minimal floating navigation',
    ],
    defaultTokens: noirLuxeTokens,
    defaultDarkTokens: noirLuxeTokens,   // Dark is the canonical look
    defaultLayout: {
      heroVariant: 'split-image',
      productCardVariant: 'flat',
      headerVariant: 'minimal-floating',
      footerVariant: 'centered-minimal',
      productDetailVariant: 'gallery-stacked',
      aboutVariant: 'split-image',
      contactVariant: 'centered-minimal',
      productGridColumns: 2,
      showCategoryPillsOnHome: false,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: false,
      homeSections: ['hero', 'featured', 'products', 'reviews'],
    },
  },

  'pacific-fresh': {
    id: 'pacific-fresh',
    name: 'pacific-fresh',
    displayName: 'Pacific Fresh',
    tagline: 'Organic wellness aesthetic for beauty, food, and lifestyle brands',
    description:
      'An ultra-premium botanical storefront designed around rich jade greens, warm coastal mist, and luminous mint accents. Floating capsule navigation, soft organic geometry, and tailored wellness editorial layouts.',
    category: 'Premium',
    tier: 'business',
    previewImage: '/themes/previews/pacific-fresh.webp',
    features: [
      'Botanical jade & luminous mint palette with WCAG AAA button contrast',
      'Cormorant Garamond serif headings with organic tracking',
      'Floating capsule navigation bar and curated botanical footer',
      'Botanical Arch, Sanctuary Panorama, and Apothecary Duo hero designs',
      'Dedicated organic-pill product cards and wellness gallery pages',
      'Organic journal story layout and direct concierge inquiries',
    ],
    defaultTokens: pacificFreshTokens,
    defaultDarkTokens: pacificFreshDarkTokens,
    defaultLayout: {
      heroVariant: 'botanical-arch',
      productCardVariant: 'organic-pill',
      headerVariant: 'floating-capsule',
      footerVariant: 'organic-curated',
      productDetailVariant: 'organic-wellness',
      aboutVariant: 'organic-journal',
      contactVariant: 'organic-concierge',
      productGridColumns: 3,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
      homeSections: ['hero', 'categories', 'trust', 'featured', 'products', 'reviews'],
    },
  },

};

export const THEME_LIST: ThemeDefinition[] = Object.values(THEME_REGISTRY);

export function getThemeDefinition(themeId?: string | null): ThemeDefinition {
  if (themeId && themeId in THEME_REGISTRY) {
    return THEME_REGISTRY[themeId as ThemeId];
  }
  return THEME_REGISTRY[DEFAULT_THEME_ID];
}