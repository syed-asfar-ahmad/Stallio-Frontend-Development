import type { SellerPlanTier } from '../lib/sellerPlanLimits';
import type { ThemeId, FontFamilyPreset, RadiusPreset } from './types';

export const DEFAULT_THEME_ID: ThemeId = 'classic-clean';

/**
 * Categorization of themes by subscription plan tier.
 * Basic plan: 2 core themes
 * Business plan: 3 additional themes (5 total)
 */
export const THEMES_BY_PLAN: Record<SellerPlanTier, ThemeId[]> = {
  basic: ['classic-clean', 'modern-minimal'],
  business: [
    'classic-clean',
    'modern-minimal',
    'bold-editorial',
    'boutique-artisan',
    'retail-catalog',
  ],
};

export const BASIC_PLAN_THEMES: ThemeId[] = THEMES_BY_PLAN.basic;
export const BUSINESS_EXCLUSIVE_THEMES: ThemeId[] = [
  'bold-editorial',
  'boutique-artisan',
  'retail-catalog',
];

export const FONT_PRESETS: { id: FontFamilyPreset; label: string; family: string }[] = [
  { id: 'outfit', label: 'Outfit (Modern & Clean)', family: 'Outfit, ui-sans-serif, system-ui, sans-serif' },
  { id: 'inter', label: 'Inter (Neutral & Crisp)', family: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { id: 'plus-jakarta', label: 'Plus Jakarta Sans (Contemporary)', family: '"Plus Jakarta Sans", Outfit, ui-sans-serif, system-ui, sans-serif' },
  { id: 'playfair', label: 'Playfair Display (Luxury Serif)', family: '"Playfair Display", Georgia, serif' },
  { id: 'syne', label: 'Syne (Bold Editorial)', family: 'Syne, Outfit, ui-sans-serif, system-ui, sans-serif' },
  { id: 'cormorant', label: 'Cormorant (Artisan Classic)', family: '"Cormorant Garamond", Georgia, serif' },
];

export const RADIUS_PRESETS: { id: RadiusPreset; label: string; button: string; card: string }[] = [
  { id: 'none', label: 'Sharp (0px)', button: '0px', card: '0px' },
  { id: 'sm', label: 'Subtle (4-6px)', button: '0.25rem', card: '0.375rem' },
  { id: 'md', label: 'Balanced (8-12px)', button: '0.5rem', card: '0.75rem' },
  { id: 'lg', label: 'Rounded (12-16px)', button: '0.75rem', card: '1rem' },
  { id: 'xl', label: 'Soft Curve (16-20px)', button: '1rem', card: '1.25rem' },
  { id: 'full', label: 'Pill Round', button: '9999px', card: '1.25rem' },
];

export function isThemeAllowedForPlan(themeId: ThemeId, plan?: string | null): boolean {
  const tier: SellerPlanTier = plan === 'business' ? 'business' : 'basic';
  return THEMES_BY_PLAN[tier].includes(themeId);
}

export function getAvailableThemesForPlan(plan?: string | null): ThemeId[] {
  const tier: SellerPlanTier = plan === 'business' ? 'business' : 'basic';
  return THEMES_BY_PLAN[tier];
}
