import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Palette,
  Check,
  Lock,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Sliders,
  LayoutGrid,
  Monitor,
  Smartphone,
  Eye,
  Type,
  Maximize2,
  Zap,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import DashboardLoading from '../components/DashboardLoading';
import DashboardSwitch from '../components/DashboardSwitch';
import ThemePreviewModal from '../components/ThemePreviewModal';
import StorefrontThemeSimulator, { type PreviewDevice } from '../components/StorefrontThemeSimulator';
import {
  THEME_LIST,
  THEME_REGISTRY,
  DEFAULT_THEME_ID,
  FONT_PRESETS,
  RADIUS_PRESETS,
  SAMPLE_PREVIEWS,
  isThemeAllowedForPlan,
  canCustomizeTokens,
  resolveShopTheme,
  type ThemeId,
  type ShopThemeConfig,
  type ThemeColorTokens,
  type ThemeTypographyTokens,
  type ThemeRadiusTokens,
  type ThemeShadowTokens,
  type ThemeLayoutSettings,
  type HeroLayoutVariant,
  type ProductCardVariant,
} from '../themes';
import {
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_BTN_SECONDARY,
  DASHBOARD_INPUT,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';

type ViewTab = 'gallery' | 'customize';

const PRESET_COLOR_SWATCHES = [
  '#4f46e5', // Indigo
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#854d0e', // Artisan Bronze
  '#7c3aed', // Purple
  '#0f172a', // Slate
  '#18181b', // Zinc
];

export default function DashboardThemes() {
  const { t } = useTranslation();
  const { user, loading: authLoading, fetchUser, replaceUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ViewTab>('gallery');
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [customColors, setCustomColors] = useState<Partial<ThemeColorTokens>>({});
  const [customTypography, setCustomTypography] = useState<Partial<ThemeTypographyTokens>>({});
  const [customRadii, setCustomRadii] = useState<Partial<ThemeRadiusTokens>>({});
  const [customShadows, setCustomShadows] = useState<Partial<ThemeShadowTokens>>({});
  const [customLayout, setCustomLayout] = useState<Partial<ThemeLayoutSettings>>({});
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [saving, setSaving] = useState(false);

  // Initialize from user's current saved theme settings
  useEffect(() => {
    if (user) {
      const currentThemeId = user.themeConfig?.themeId || DEFAULT_THEME_ID;
      setSelectedThemeId(currentThemeId in THEME_REGISTRY ? currentThemeId : DEFAULT_THEME_ID);

      if (user.themeConfig) {
        setCustomColors(user.themeConfig.tokens?.colors || {});
        setCustomTypography(user.themeConfig.tokens?.typography || {});
        setCustomRadii(user.themeConfig.tokens?.radii || {});
        setCustomShadows(user.themeConfig.tokens?.shadows || {});
        setCustomLayout(user.themeConfig.layout || {});
      }
    }
  }, [user]);

  const activeThemeDef = THEME_REGISTRY[selectedThemeId] || THEME_REGISTRY[DEFAULT_THEME_ID];
  const isBusinessPlan = user?.plan === 'business';

  // Compute live resolved theme tokens for the interactive preview
  const previewThemeConfig = useMemo<ShopThemeConfig>(() => {
    return {
      version: 1,
      themeId: selectedThemeId,
      tokens: {
        colors: customColors,
        typography: customTypography,
        radii: customRadii,
        shadows: customShadows,
      },
      layout: customLayout,
    };
  }, [selectedThemeId, customColors, customTypography, customRadii, customShadows, customLayout]);

  const resolvedTheme = useMemo(() => {
    return resolveShopTheme(previewThemeConfig);
  }, [selectedThemeId, previewThemeConfig]);

  const [previewModalTheme, setPreviewModalTheme] = useState<ThemeId | null>(null);

  // Handle theme selection and instant activation from gallery
  async function handleApplyTheme(themeId: ThemeId) {
    if (!isThemeAllowedForPlan(themeId, user?.plan)) {
      toast.error('Upgrade to the Business Plan to unlock this premium theme.');
      return;
    }

    setSelectedThemeId(themeId);
    const def = THEME_REGISTRY[themeId];
    setCustomColors({});
    setCustomTypography({});
    setCustomRadii({});
    setCustomShadows({});
    setCustomLayout(def.defaultLayout);

    const nextConfig: ShopThemeConfig = {
      version: 1,
      themeId: themeId,
      tokens: {},
      layout: def.defaultLayout,
    };

    if (user) {
      replaceUser({ ...user, themeConfig: nextConfig });
    }

    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          themeConfig: nextConfig,
        },
      });
      if (user?.username) {
        localStorage.setItem(`stallio_theme_${user.username}`, themeId);
        localStorage.setItem(`stallio_theme_config_${user.username}`, JSON.stringify(nextConfig));
      }
      await fetchUser();
      toast.success(`"${def.displayName}" applied to your storefront!`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to apply theme.');
    } finally {
      setSaving(false);
    }
  }

  // Reset to current theme's original defaults
  function handleResetDefaults() {
    const def = THEME_REGISTRY[selectedThemeId];
    setCustomColors({});
    setCustomTypography({});
    setCustomRadii({});
    setCustomShadows({});
    setCustomLayout({});
    toast.success(`Reset "${def.displayName}" to default design tokens.`);
  }

  // Save active theme & tokens to backend
  async function handleSave() {
    if (!isThemeAllowedForPlan(selectedThemeId, user?.plan)) {
      toast.error('The selected theme requires a Business Plan.');
      return;
    }

    if (!isBusinessPlan) {
      toast.error('Design token customization is exclusive to the Business Plan. Upgrade to publish custom styling.');
      return;
    }

    const nextConfig: ShopThemeConfig = {
      version: 1,
      themeId: selectedThemeId,
      tokens: {
        colors: customColors,
        typography: customTypography,
        radii: customRadii,
        shadows: customShadows,
      },
      layout: customLayout,
    };

    if (user) {
      replaceUser({ ...user, themeConfig: nextConfig });
    }

    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          themeConfig: nextConfig,
        },
      });
      if (user?.username) {
        localStorage.setItem(`stallio_theme_${user.username}`, selectedThemeId);
        localStorage.setItem(`stallio_theme_config_${user.username}`, JSON.stringify(nextConfig));
      }

      await fetchUser();
      toast.success('Theme settings published successfully!');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save theme settings.');
    } finally {
      setSaving(false);
    }
  }


  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardLoading />
      </DashboardLayout>
    );
  }

  const storefrontUrl = user ? `/${user.username}` : '#';

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Palette className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                Storefront Themes
              </h1>
            </div>
            <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
              Select a storefront theme and fine-tune your brand design tokens, colors, and layout.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={DASHBOARD_BTN_OUTLINE}
            >
              <ExternalLink className="w-4 h-4" />
              Live Storefront
            </Link>

            {isBusinessPlan && (
              <>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className={DASHBOARD_BTN_SECONDARY}
                  title="Reset current theme to factory defaults"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Defaults
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={DASHBOARD_BTN_PRIMARY}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Publishing...' : 'Save & Publish'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Plan Callout for Basic Plan Sellers */}
        {!isBusinessPlan && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                <Zap className="w-5 h-5 fill-current" />
              </span>
              <div>
                <p className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Basic Plan: 2 Themes Included • Standard Tokens
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Upgrade to the Business Plan to unlock 3 additional high-conversion themes and the full Design Token Customizer (colors, typography, geometry & layout).
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade to Business
            </Link>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'gallery'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Theme Gallery (5 Available)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customize')}
            className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'customize'
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Design Tokens & Customizer</span>
            {!isBusinessPlan && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Lock className="w-2.5 h-2.5" />
                Business
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: THEME GALLERY */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEME_LIST.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              const isAllowed = isThemeAllowedForPlan(theme.id, user?.plan);
              const palette = theme.defaultTokens.colors;

              return (
                <div
                  key={theme.id}
                  className={`group relative flex flex-col rounded-2xl border-2 transition-all duration-200 overflow-hidden bg-white dark:bg-zinc-900 ${
                    isSelected
                      ? 'border-brand-600 dark:border-brand-400 shadow-xl shadow-brand-500/10'
                      : 'border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 hover:shadow-lg'
                  }`}
                >
                  {/* Visual Header / Real Sample Photography Banner */}
                  <div
                    onClick={() => setPreviewModalTheme(theme.id)}
                    className="relative h-48 overflow-hidden border-b border-stone-100 dark:border-zinc-800 cursor-pointer group/banner"
                    style={{ backgroundColor: palette.background }}
                  >
                    {SAMPLE_PREVIEWS[theme.id]?.heroImage ? (
                      <img
                        src={SAMPLE_PREVIEWS[theme.id].heroImage}
                        alt={`${theme.displayName} preview`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/banner:scale-105"
                      />
                    ) : null}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                    {/* Floating Tier Badge */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase backdrop-blur-md ${
                          theme.tier === 'business'
                            ? 'bg-amber-500/90 text-white shadow-sm shadow-amber-500/30'
                            : 'bg-stone-900/80 text-white border border-white/20'
                        }`}
                      >
                        {theme.tier === 'business' && <Sparkles className="w-3 h-3 text-amber-200 fill-current" />}
                        {theme.tier === 'business' ? 'Business Plan' : 'Basic Plan'}
                      </span>

                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>

                    {/* Quick Preview Hover Pill */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                      <span className="px-4 py-2 rounded-xl bg-white/95 text-stone-900 font-bold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover/banner:translate-y-0 transition-transform">
                        <Eye className="w-4 h-4 text-brand-600" />
                        Click to Live Preview
                      </span>
                    </div>

                    {/* Bottom strip inside banner */}
                    <div className="absolute bottom-3 inset-x-3 flex items-end justify-between z-10 text-white">
                      <div>
                        <div
                          className="font-bold text-sm tracking-tight drop-shadow"
                          style={{ fontFamily: theme.defaultTokens.typography.fontFamilyHeading }}
                        >
                          {theme.displayName}
                        </div>
                        <div className="text-[10px] text-white/80">
                          {theme.category}
                        </div>
                      </div>

                      {/* Palette Dots */}
                      <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-sm">
                        {[palette.primary, palette.surfaceSecondary, palette.textPrimary].map(
                          (color, idx) => (
                            <span
                              key={idx}
                              className="w-3 h-3 rounded-full border border-white/40"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-bold text-lg text-stone-900 dark:text-zinc-100">
                        {theme.displayName}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                        {theme.category}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                      {theme.tagline}
                    </p>

                    <div className="mt-4 space-y-1.5 flex-1">
                      {theme.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-stone-600 dark:text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalTheme(theme.id)}
                        className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                        title="Open interactive full sample preview"
                      >
                        <Eye className="w-4 h-4 text-stone-500" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      {isAllowed ? (
                        <>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleApplyTheme(theme.id)}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm'
                            }`}
                          >
                            {isSelected ? '✓ Active Theme' : saving ? 'Applying...' : 'Apply Theme'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedThemeId(theme.id);
                              setActiveTab('customize');
                            }}
                            className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                            title="Customize design tokens for this theme"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/pricing"
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center hover:brightness-105 shadow-sm shadow-amber-500/20 flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Business Plan
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: DESIGN TOKENS CUSTOMIZER & LIVE PREVIEW */}
        {activeTab === 'customize' && (
          <div className="space-y-6">
            

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT CONTROLS: 6 COLUMNS */}
              <div className="lg:col-span-6 space-y-6">
                {/* Selected Theme Badge Banner */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400">
                      Editing Theme
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                      {activeThemeDef.displayName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gallery')}
                    className={DASHBOARD_BTN_SECONDARY}
                  >
                    Switch Theme
                  </button>
                </div>

              {/* 1. Color Palette Tokens */}
              <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
                <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                  <Palette className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h2 className="font-bold text-stone-900 dark:text-zinc-100">Color Palette Tokens</h2>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                    Primary Brand Color (Buttons & Highlights)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={resolvedTheme.tokens.colors.primary}
                      onChange={(e) =>
                        setCustomColors((prev) => ({
                          ...prev,
                          primary: e.target.value,
                          primaryHover: e.target.value,
                        }))
                      }
                      className="h-11 w-14 rounded-xl border border-stone-300 dark:border-zinc-700 cursor-pointer p-1 bg-white dark:bg-zinc-800"
                    />
                    <input
                      type="text"
                      value={resolvedTheme.tokens.colors.primary}
                      onChange={(e) =>
                        setCustomColors((prev) => ({
                          ...prev,
                          primary: e.target.value,
                          primaryHover: e.target.value,
                        }))
                      }
                      className={DASHBOARD_INPUT}
                      placeholder="#4f46e5"
                    />
                  </div>

                  {/* Swatch suggestions */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] text-stone-400">Presets:</span>
                    {PRESET_COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        onClick={() =>
                          setCustomColors((prev) => ({
                            ...prev,
                            primary: swatch,
                            primaryHover: swatch,
                          }))
                        }
                        className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 transition-transform hover:scale-110"
                        style={{ backgroundColor: swatch }}
                        title={swatch}
                      />
                    ))}
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={resolvedTheme.tokens.colors.secondary}
                      onChange={(e) =>
                        setCustomColors((prev) => ({ ...prev, secondary: e.target.value }))
                      }
                      className="h-11 w-14 rounded-xl border border-stone-300 dark:border-zinc-700 cursor-pointer p-1 bg-white dark:bg-zinc-800"
                    />
                    <input
                      type="text"
                      value={resolvedTheme.tokens.colors.secondary}
                      onChange={(e) =>
                        setCustomColors((prev) => ({ ...prev, secondary: e.target.value }))
                      }
                      className={DASHBOARD_INPUT}
                      placeholder="#0f172a"
                    />
                  </div>
                </div>

                {/* Surface / Background Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      Page Background
                    </label>
                    <input
                      type="text"
                      value={resolvedTheme.tokens.colors.background}
                      onChange={(e) =>
                        setCustomColors((prev) => ({ ...prev, background: e.target.value }))
                      }
                      className={DASHBOARD_INPUT}
                      placeholder="#f8fafc"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      Card Surface
                    </label>
                    <input
                      type="text"
                      value={resolvedTheme.tokens.colors.surface}
                      onChange={(e) =>
                        setCustomColors((prev) => ({ ...prev, surface: e.target.value }))
                      }
                      className={DASHBOARD_INPUT}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Typography Tokens */}
              <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
                <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                  <Type className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h2 className="font-bold text-stone-900 dark:text-zinc-100">Typography Presets</h2>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                    Heading Font Family
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FONT_PRESETS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() =>
                          setCustomTypography((prev) => ({
                            ...prev,
                            fontFamilyHeading: font.family,
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          resolvedTheme.tokens.typography.fontFamilyHeading === font.family
                            ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200'
                            : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300'
                        }`}
                      >
                        <p className="font-bold text-sm" style={{ fontFamily: font.family }}>
                          {font.label}
                        </p>
                        <p className="text-[11px] opacity-70 mt-0.5">The quick brown fox</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Geometry & Corner Radii Tokens */}
              <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
                <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                  <Maximize2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h2 className="font-bold text-stone-900 dark:text-zinc-100">Corner Radii & Geometry</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {RADIUS_PRESETS.map((rad) => (
                    <button
                      key={rad.id}
                      type="button"
                      onClick={() =>
                        setCustomRadii({
                          button: rad.button,
                          card: rad.card,
                          input: rad.button,
                          badge: rad.button,
                        })
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        resolvedTheme.tokens.radii.button === rad.button
                          ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-bold'
                          : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 text-stone-700 dark:text-zinc-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 mx-auto mb-2 border-2 border-current"
                        style={{ borderRadius: rad.button }}
                      />
                      <span className="text-xs">{rad.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Layout & Section Options */}
              <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
                <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                  <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h2 className="font-bold text-stone-900 dark:text-zinc-100">Layout & Section Options</h2>
                </div>

                <div className="space-y-4">
                  {/* Hero Variant */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      Hero Section Style
                    </label>
                    <select
                      value={resolvedTheme.layout.heroVariant}
                      onChange={(e) =>
                        setCustomLayout((prev) => ({
                          ...prev,
                          heroVariant: e.target.value as HeroLayoutVariant,
                        }))
                      }
                      className={DASHBOARD_INPUT}
                    >
                      <option value="full-banner">Full Width Banner with Overlay</option>
                      <option value="split-image">Split Screen (Image + Headline)</option>
                      <option value="minimal-clean">Minimalist Clean Typography</option>
                      <option value="card-showcase">Showcase Floating Cards</option>
                    </select>
                  </div>

                  {/* Product Card Style */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      Product Card Style
                    </label>
                    <select
                      value={resolvedTheme.layout.productCardVariant}
                      onChange={(e) =>
                        setCustomLayout((prev) => ({
                          ...prev,
                          productCardVariant: e.target.value as ProductCardVariant,
                        }))
                      }
                      className={DASHBOARD_INPUT}
                    >
                      <option value="bordered">Bordered Clean Card</option>
                      <option value="flat">Flat Borderless Minimal</option>
                      <option value="elevated">Elevated Shadow Lift</option>
                      <option value="compact">Compact Retail Dense</option>
                      <option value="editorial">Editorial Magazine Aspect</option>
                    </select>
                  </div>

                  {/* Section Visibility Toggles */}
                  <div className="pt-2 space-y-3 border-t border-stone-100 dark:border-zinc-800">
                    <div className={DASHBOARD_TOGGLE_ROW}>
                      <span className={DASHBOARD_TOGGLE_ROW_LABEL}>
                        <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Category Pills on Home</p>
                        <p className="text-xs text-stone-500">Show horizontal filter pills under hero</p>
                      </span>
                      <DashboardSwitch
                        checked={resolvedTheme.layout.showCategoryPillsOnHome}
                        onCheckedChange={(val) =>
                          setCustomLayout((prev) => ({ ...prev, showCategoryPillsOnHome: val }))
                        }
                      />
                    </div>

                    <div className={DASHBOARD_TOGGLE_ROW}>
                      <span className={DASHBOARD_TOGGLE_ROW_LABEL}>
                        <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Featured Products Showcase</p>
                        <p className="text-xs text-stone-500">Highlight starred items in a top shelf</p>
                      </span>
                      <DashboardSwitch
                        checked={resolvedTheme.layout.showFeaturedCollection}
                        onCheckedChange={(val) =>
                          setCustomLayout((prev) => ({ ...prev, showFeaturedCollection: val }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT STICKY: 5 COLUMNS - LIVE STOREFRONT PREVIEW */}
            <div className="lg:col-span-6 sticky top-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                    Live Design Token Preview
                  </span>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive Simulation Frame */}
              <StorefrontThemeSimulator
                resolvedTheme={resolvedTheme}
                sampleData={SAMPLE_PREVIEWS[selectedThemeId] || SAMPLE_PREVIEWS[DEFAULT_THEME_ID]}
                device={previewDevice}
                shopName={user?.shopName || 'Sample Storefront'}
              />
            </div>
          </div>
        </div>
      )}

        {/* PREVIEW MODAL FOR EACH THEME WITH SAMPLE DATA */}
        {previewModalTheme && (
          <ThemePreviewModal
            themeId={previewModalTheme}
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
            onClose={() => setPreviewModalTheme(null)}
            isAllowed={isThemeAllowedForPlan(previewModalTheme, user?.plan)}
            isBusinessPlan={isBusinessPlan}
            isActive={selectedThemeId === previewModalTheme}
            shopName={user?.shopName || 'Sample Storefront'}
            saving={saving}
            onApply={async () => {
              await handleApplyTheme(previewModalTheme);
              setPreviewModalTheme(null);
            }}
            onCustomize={() => {
              setSelectedThemeId(previewModalTheme);
              setActiveTab('customize');
              setPreviewModalTheme(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

