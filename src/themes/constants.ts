import type { SellerPlanTier } from '../lib/sellerPlanLimits';
import type { ThemeId, FontFamilyPreset, RadiusPreset } from './types';

export const DEFAULT_THEME_ID: ThemeId = 'classic-clean';

export const THEMES_BY_PLAN: Record<SellerPlanTier, ThemeId[]> = {
  basic: ['classic-clean', 'modern-minimal'],
  business: [
    'classic-clean',
    'modern-minimal',
    'boutique-artisan',
    'retail-catalog',
    'noir-luxe',
    'pacific-fresh',
  ],
};

export const BASIC_PLAN_THEMES: ThemeId[] = THEMES_BY_PLAN.basic;
export const BUSINESS_EXCLUSIVE_THEMES: ThemeId[] = [
  'boutique-artisan',
  'retail-catalog',
  'noir-luxe',
  'pacific-fresh',
];

export const FONT_PRESETS: { id: FontFamilyPreset; label: string; family: string }[] = [
  { id: 'outfit', label: 'Outfit (Modern & Clean)', family: 'Outfit, ui-sans-serif, system-ui, sans-serif' },
  { id: 'inter', label: 'Inter (Neutral & Crisp)', family: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { id: 'plus-jakarta', label: 'Plus Jakarta Sans (Contemporary)', family: '"Plus Jakarta Sans", Outfit, ui-sans-serif, system-ui, sans-serif' },
  { id: 'playfair', label: 'Playfair Display (Luxury Serif)', family: '"Playfair Display", Georgia, serif' },
  { id: 'syne', label: 'Syne (Bold Editorial)', family: 'Syne, Outfit, ui-sans-serif, system-ui, sans-serif' },
  { id: 'cormorant', label: 'Cormorant Garamond (Organic Elegance)', family: '"Cormorant Garamond", Georgia, serif' },
  { id: 'dm-serif', label: 'DM Serif Display (Dark Luxury)', family: '"DM Serif Display", "Playfair Display", Georgia, serif' },
  { id: 'cinzel', label: 'Cinzel (Classical Minimal)', family: '"Cinzel", "Playfair Display", Georgia, serif' },
  { id: 'fraunces', label: 'Fraunces (Soft Boutique Serif)', family: '"Fraunces", "Playfair Display", Georgia, serif' },
];

export const RADIUS_PRESETS: { id: RadiusPreset; label: string; button: string; card: string }[] = [
  { id: 'none', label: 'Sharp (0px)', button: '0px', card: '0px' },
  { id: 'sm', label: 'Subtle (4-6px)', button: '0.25rem', card: '0.375rem' },
  { id: 'md', label: 'Balanced (8-12px)', button: '0.5rem', card: '0.75rem' },
  { id: 'lg', label: 'Rounded (12-16px)', button: '0.75rem', card: '1rem' },
  { id: 'xl', label: 'Soft Curve (16-20px)', button: '1rem', card: '1.25rem' },
  { id: 'full', label: 'Pill Round', button: '9999px', card: '1.25rem' },
];

export function isThemeAllowedForPlan(_themeId: ThemeId, _plan?: string | null): boolean {
  // Plan check bypassed so all themes can be tested and selected
  return true;
}

export function getAvailableThemesForPlan(_plan?: string | null): ThemeId[] {
  return [
    'classic-clean',
    'modern-minimal',
    'boutique-artisan',
    'retail-catalog',
    'noir-luxe',
    'pacific-fresh',
  ];
}

export function canCustomizeTokens(_plan?: string | null): boolean {
  // Plan check bypassed to allow full design token customization
  return true;
}