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
    tagline: 'A deep-teal and orange marketplace storefront for multi-category retail',
    description:
      'Built for large inventories, electronics and everyday retail. A marketplace header with pill search and a Browse Categories menu, a bento hero, a Weekly Best Deals band with live filters, hover-reveal Add to Cart cards, round category shortcuts and tabbed product showcases.',
    category: 'High-Volume',
    tier: 'business',
    previewImage: '/themes/previews/retail-catalog.webp',
    features: [
      'Marketplace header: announcement bar, pill search with orange button, Browse Categories menu',
      'Bento hero built from your hero and category photography',
      'Weekly Best Deals band with category filter chips and promo banners',
      'Product cards with sale badge, price comparison and hover-reveal Add to Cart',
      'Round category shortcuts, tabbed New Arrivals / Best Seller / Best Offers showcase',
      'Catalog sidebar, category pages, product detail, about and contact in the same system',
    ],
    defaultTokens: retailCatalogTokens,
    defaultDarkTokens: retailCatalogDarkTokens,
    defaultLayout: {
      heroVariant: 'mart-bento',
      productCardVariant: 'mart-deal',
      headerVariant: 'mart-market',
      footerVariant: 'mart-teal',
      productDetailVariant: 'mart-shop',
      aboutVariant: 'mart-story',
      contactVariant: 'mart-support',
      productsPageVariant: 'mart-catalog',
      categoryVariant: 'mart-collections',
      productGridColumns: 4,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
      homeSections: ['hero', 'featured', 'categories', 'products', 'collections', 'trust', 'reviews'],
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
    tagline: 'Sage, lime and high-contrast serif — a fresh skincare and wellness storefront',
    description:
      'A bright, editorial beauty storefront: a sage hero with a Didone headline and floating product tiles, round category shortcuts, peach product tiles with pastel arches, a numbered benefits section, a full-bleed photo banner and a testimonials band.',
    category: 'Premium',
    tier: 'business',
    previewImage: '/themes/previews/pacific-fresh.webp',
    features: [
      'Centered Playfair hero with floating product tiles and a lime call-to-action',
      'Lime announcement bar and sage header with a lime active-link underline',
      'Peach product tiles with pastel arch shapes, New tags and hover quick-add',
      'Round category shortcuts and a numbered "why you will love it" section',
      'Full-bleed photo banner, Everyday feature pair and sage testimonials band',
      'Catalog, category, product detail, about and contact in the same system',
    ],
    defaultTokens: pacificFreshTokens,
    defaultDarkTokens: pacificFreshDarkTokens,
    defaultLayout: {
      heroVariant: 'fresh-bloom',
      productCardVariant: 'fresh-bloom',
      headerVariant: 'fresh-nav',
      footerVariant: 'fresh-sage',
      productDetailVariant: 'fresh-detail',
      aboutVariant: 'fresh-story',
      contactVariant: 'fresh-contact',
      productsPageVariant: 'fresh-catalog',
      categoryVariant: 'fresh-collections',
      productGridColumns: 4,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
      homeSections: ['hero', 'categories', 'products', 'trust', 'collections', 'featured', 'reviews'],
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