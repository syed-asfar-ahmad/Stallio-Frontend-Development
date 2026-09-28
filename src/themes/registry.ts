import type { ThemeId, ThemeDefinition } from './types';
import {
  classicCleanTokens,
  classicCleanDarkTokens,
  modernMinimalTokens,
  modernMinimalDarkTokens,
  boldEditorialTokens,
  boldEditorialDarkTokens,
  boutiqueArtisanTokens,
  boutiqueArtisanDarkTokens,
  retailCatalogTokens,
  retailCatalogDarkTokens,
  // Premium themes
  noirLuxeTokens,
  noirLuxeLightTokens,
  pacificFreshTokens,
  pacificFreshDarkTokens,
  studioGridTokens,
  studioGridDarkTokens,
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
      productGridColumns: 3,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
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
      productGridColumns: 3,
      showCategoryPillsOnHome: false,
      showFeaturedCollection: true,
      showReviewsSection: false,
      showTrustBadges: false,
    },
  },

  'bold-editorial': {
    id: 'bold-editorial',
    name: 'bold-editorial',
    displayName: 'Bold Editorial',
    tagline: 'High-impact streetwear and lifestyle magazine aesthetic',
    description:
      'High contrast, oversized typography, and neo-brutalist shadows. Built for trendsetting brands that want to make an aggressive statement.',
    category: 'Editorial',
    tier: 'business',
    previewImage: '/themes/previews/bold-editorial.webp',
    features: [
      'High contrast solid borders with drop-shadow effects',
      'Oversized display typography with uppercase badges',
      'Split screen dynamic hero section with bold CTA buttons',
      'Editorial style story and testimonial blocks',
    ],
    defaultTokens: boldEditorialTokens,
    defaultDarkTokens: boldEditorialDarkTokens,
    defaultLayout: {
      heroVariant: 'split-image',
      productCardVariant: 'editorial',
      headerVariant: 'classic-bar',
      footerVariant: 'bold-newsletter',
      productGridColumns: 2,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
    },
  },

  'boutique-artisan': {
    id: 'boutique-artisan',
    name: 'boutique-artisan',
    displayName: 'Boutique Artisan',
    tagline: 'Warm, crafted aesthetic with refined serif elegance',
    description:
      'Designed for specialty artisans, perfumeries, ceramics, and boutique confectioners. Features warm earth tones and smooth organic curves.',
    category: 'Luxury',
    tier: 'business',
    previewImage: '/themes/previews/boutique-artisan.webp',
    features: [
      'Serif display typography for elevated luxury appeal',
      'Soft organic border radiuses and warm cream backgrounds',
      'Story first layout with rich about brand integration',
      'Floating card showcases and artisan trust badges',
    ],
    defaultTokens: boutiqueArtisanTokens,
    defaultDarkTokens: boutiqueArtisanDarkTokens,
    defaultLayout: {
      heroVariant: 'card-showcase',
      productCardVariant: 'elevated',
      headerVariant: 'centered-logo',
      footerVariant: 'multi-column',
      productGridColumns: 3,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
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
      productGridColumns: 4,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
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
      productGridColumns: 2,
      showCategoryPillsOnHome: false,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: false,
    },
  },

  'pacific-fresh': {
    id: 'pacific-fresh',
    name: 'pacific-fresh',
    displayName: 'Pacific Fresh',
    tagline: 'Organic wellness aesthetic for beauty, food, and lifestyle brands',
    description:
      'A photography-forward layout built around jade greens and warm whites. Capsule buttons, generous card rounding, and layered soft shadows create an environment of natural ease.',
    category: 'Premium',
    tier: 'business',
    previewImage: '/themes/previews/pacific-fresh.webp',
    features: [
      'Jade-green and sage palette with mint accent tints',
      'Cormorant Garamond headings for gentle organic elegance',
      'Full-capsule buttons and softly rounded product cards',
      'Card-showcase hero with ingredient and story integration',
    ],
    defaultTokens: pacificFreshTokens,
    defaultDarkTokens: pacificFreshDarkTokens,
    defaultLayout: {
      heroVariant: 'card-showcase',
      productCardVariant: 'elevated',
      headerVariant: 'centered-logo',
      footerVariant: 'multi-column',
      productGridColumns: 3,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: true,
      showTrustBadges: true,
    },
  },

  'studio-grid': {
    id: 'studio-grid',
    name: 'studio-grid',
    displayName: 'Studio Grid',
    tagline: 'Precise, technical layout for electronics and design-led products',
    description:
      'A clinical white canvas with saturated cobalt authority and tight geometric grid discipline. Built for brands where spec sheets matter as much as photography.',
    category: 'Premium',
    tier: 'business',
    previewImage: '/themes/previews/studio-grid.webp',
    features: [
      'Saturated cobalt primary with cool-slate accent palette',
      'Syne display headings — geometric authority at every size',
      'Tight 4–6 px radius geometry with ruled borders',
      'Dense 4-column product grid with inline compact header',
    ],
    defaultTokens: studioGridTokens,
    defaultDarkTokens: studioGridDarkTokens,
    defaultLayout: {
      heroVariant: 'full-banner',
      productCardVariant: 'compact',
      headerVariant: 'inline-compact',
      footerVariant: 'multi-column',
      productGridColumns: 4,
      showCategoryPillsOnHome: true,
      showFeaturedCollection: true,
      showReviewsSection: false,
      showTrustBadges: true,
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