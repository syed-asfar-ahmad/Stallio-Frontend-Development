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
  ShoppingBag,
  Star,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import DashboardLoading from '../components/DashboardLoading';
import DashboardSwitch from '../components/DashboardSwitch';
import {
  THEME_LIST,
  THEME_REGISTRY,
  DEFAULT_THEME_ID,
  FONT_PRESETS,
  RADIUS_PRESETS,
  isThemeAllowedForPlan,
  resolveShopTheme,
  type ThemeId,
  type ShopThemeConfig,
  type ThemeColorTokens,
  type ThemeTypographyTokens,
  type ThemeRadiusTokens,
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
type PreviewDevice = 'desktop' | 'mobile';

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
  const { user, loading: authLoading, fetchUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ViewTab>('gallery');
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [customColors, setCustomColors] = useState<Partial<ThemeColorTokens>>({});
  const [customTypography, setCustomTypography] = useState<Partial<ThemeTypographyTokens>>({});
  const [customRadii, setCustomRadii] = useState<Partial<ThemeRadiusTokens>>({});
  const [customLayout, setCustomLayout] = useState<Partial<ThemeLayoutSettings>>({});
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [saving, setSaving] = useState(false);

  // Initialize from user's current saved theme settings
  useEffect(() => {
    if (user) {
      const currentThemeId = (user.themeId as ThemeId) || DEFAULT_THEME_ID;
      setSelectedThemeId(currentThemeId in THEME_REGISTRY ? currentThemeId : DEFAULT_THEME_ID);

      if (user.themeConfig) {
        setCustomColors(user.themeConfig.tokens?.colors || {});
        setCustomTypography(user.themeConfig.tokens?.typography || {});
        setCustomRadii(user.themeConfig.tokens?.radii || {});
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
      },
      layout: customLayout,
    };
  }, [selectedThemeId, customColors, customTypography, customRadii, customLayout]);

  const resolvedTheme = useMemo(() => {
    return resolveShopTheme(selectedThemeId, previewThemeConfig);
  }, [selectedThemeId, previewThemeConfig]);

  // Handle theme selection from gallery
  function handleSelectTheme(themeId: ThemeId) {
    if (!isThemeAllowedForPlan(themeId, user?.plan)) {
      toast.error('Upgrade to the Business Plan to unlock this premium theme.');
      return;
    }

    setSelectedThemeId(themeId);
    const def = THEME_REGISTRY[themeId];
    // Reset customizations to new theme's defaults
    setCustomColors(def.defaultTokens.colors);
    setCustomTypography(def.defaultTokens.typography);
    setCustomRadii(def.defaultTokens.radii);
    setCustomLayout(def.defaultLayout);
    toast.success(`Selected "${def.displayName}" theme.`);
  }

  // Reset to current theme's original defaults
  function handleResetDefaults() {
    const def = THEME_REGISTRY[selectedThemeId];
    setCustomColors({});
    setCustomTypography({});
    setCustomRadii({});
    setCustomLayout({});
    toast.success(`Reset "${def.displayName}" to default design tokens.`);
  }

  // Save active theme & tokens to backend
  async function handleSave() {
    if (!isThemeAllowedForPlan(selectedThemeId, user?.plan)) {
      toast.error('The selected theme requires a Business Plan.');
      return;
    }

    setSaving(true);
    try {
      await api('/api/user', {
        method: 'PATCH',
        body: {
          themeId: selectedThemeId,
          themeConfig: {
            version: 1,
            themeId: selectedThemeId,
            tokens: {
              colors: customColors,
              typography: customTypography,
              radii: customRadii,
            },
            layout: customLayout,
          },
        },
      });

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
                  Basic Plan: 2 Themes Included
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Upgrade to the Business Plan to unlock 3 additional high-conversion themes (Bold Editorial, Boutique Artisan, & Retail Catalog).
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
            Design Tokens & Customizer
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
                  {/* Visual Header / Palette Simulation */}
                  <div className="relative h-44 p-4 flex flex-col justify-between border-b border-stone-100 dark:border-zinc-800"
                    style={{ backgroundColor: palette.background }}
                  >
                    {/* Floating Tier Badge */}
                    <div className="flex items-center justify-between z-10">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          theme.tier === 'business'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                            : 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700'
                        }`}
                      >
                        {theme.tier === 'business' && <Sparkles className="w-3 h-3 text-amber-500 fill-current" />}
                        {theme.tier === 'business' ? 'Business Plan' : 'Basic Plan'}
                      </span>

                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-600 text-white shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>

                    {/* Miniature Simulated UI Card */}
                    <div
                      className="rounded-xl p-3 shadow-md border flex items-center gap-3 transition-transform group-hover:scale-[1.02]"
                      style={{
                        backgroundColor: palette.surface,
                        borderColor: palette.border,
                        borderRadius: theme.defaultTokens.radii.card,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: palette.primaryLight,
                          color: palette.primary,
                        }}
                      >
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="h-3 w-3/4 rounded font-bold text-xs truncate"
                          style={{ color: palette.textPrimary }}
                        >
                          {theme.displayName}
                        </div>
                        <div
                          className="h-2 w-1/2 rounded mt-1 opacity-70 text-[10px]"
                          style={{ color: palette.textSecondary }}
                        >
                          {theme.category}
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 text-[10px] font-bold rounded"
                        style={{
                          backgroundColor: palette.primary,
                          color: '#ffffff',
                          borderRadius: theme.defaultTokens.radii.button,
                        }}
                      >
                        CTA
                      </span>
                    </div>

                    {/* Color Swatch Dot Strip */}
                    <div className="flex items-center gap-1.5 z-10">
                      {[palette.primary, palette.secondary, palette.surface, palette.textPrimary].map(
                        (color, idx) => (
                          <span
                            key={idx}
                            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shadow-xs"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        )
                      )}
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
                      {isAllowed ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSelectTheme(theme.id)}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                                : 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm'
                            }`}
                          >
                            {isSelected ? 'Currently Applied' : 'Apply Theme'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedThemeId(theme.id);
                              setActiveTab('customize');
                            }}
                            className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                            title="Customize tokens for this theme"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/pricing"
                          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center hover:brightness-105 shadow-sm shadow-amber-500/20 flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Unlock with Business Plan
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT CONTROLS: 7 COLUMNS */}
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
              <div
                className={`mx-auto rounded-2xl border-4 border-stone-800 dark:border-zinc-700 overflow-hidden shadow-2xl transition-all duration-300 ${
                  previewDevice === 'mobile' ? 'max-w-[340px]' : 'w-full'
                }`}
                style={{
                  backgroundColor: resolvedTheme.tokens.colors.background,
                  color: resolvedTheme.tokens.colors.textPrimary,
                  fontFamily: resolvedTheme.tokens.typography.fontFamilyBody,
                }}
              >
                {/* Simulated Announcement Bar */}
                <div
                  className="py-1.5 px-3 text-center text-[10px] font-bold"
                  style={{
                    backgroundColor: resolvedTheme.tokens.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  ✨ Free Worldwide Shipping Over $50
                </div>

                {/* Simulated Storefront Header */}
                <div
                  className="p-3 border-b flex items-center justify-between"
                  style={{
                    backgroundColor: resolvedTheme.tokens.colors.surface,
                    borderColor: resolvedTheme.tokens.colors.border,
                  }}
                >
                  <span
                    className="font-bold text-sm tracking-tight"
                    style={{
                      fontFamily: resolvedTheme.tokens.typography.fontFamilyHeading,
                      letterSpacing: resolvedTheme.tokens.typography.headingLetterSpacing,
                    }}
                  >
                    {user?.shopName || 'Urban Threads'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 text-[11px] font-semibold rounded"
                      style={{
                        backgroundColor: resolvedTheme.tokens.colors.primaryLight,
                        color: resolvedTheme.tokens.colors.primary,
                        borderRadius: resolvedTheme.tokens.radii.button,
                      }}
                    >
                      Cart (2)
                    </span>
                  </div>
                </div>

                {/* Simulated Hero Section */}
                <div className="p-5 border-b" style={{ borderColor: resolvedTheme.tokens.colors.border }}>
                  <span
                    className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full inline-block mb-2"
                    style={{
                      backgroundColor: resolvedTheme.tokens.colors.badgeBg,
                      color: resolvedTheme.tokens.colors.badgeText,
                    }}
                  >
                    New Season Arrival
                  </span>
                  <h2
                    className="text-xl font-bold leading-tight"
                    style={{
                      fontFamily: resolvedTheme.tokens.typography.fontFamilyHeading,
                      fontWeight: resolvedTheme.tokens.typography.headingFontWeight,
                      textTransform: resolvedTheme.tokens.typography.headingTransform,
                    }}
                  >
                    Crafted For Modern Living
                  </h2>
                  <p
                    className="text-xs mt-1.5 opacity-80"
                    style={{ color: resolvedTheme.tokens.colors.textSecondary }}
                  >
                    Explore our newest premium catalog with responsive theme styling.
                  </p>
                  <button
                    type="button"
                    className="mt-3.5 px-4 py-2 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105"
                    style={{
                      backgroundColor: resolvedTheme.tokens.colors.primary,
                      borderRadius: resolvedTheme.tokens.radii.button,
                    }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Shop Now
                  </button>
                </div>

                {/* Simulated Product Card Showcase */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Featured Product</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">In Stock</span>
                  </div>

                  <div
                    className="p-3.5 border transition-all"
                    style={{
                      backgroundColor: resolvedTheme.tokens.colors.surface,
                      borderColor: resolvedTheme.tokens.colors.border,
                      borderRadius: resolvedTheme.tokens.radii.card,
                      boxShadow: resolvedTheme.tokens.shadows.card,
                    }}
                  >
                    <div className="h-28 rounded-lg bg-stone-200/70 dark:bg-zinc-800 flex items-center justify-center text-stone-400">
                      <ShoppingBag className="w-8 h-8 opacity-40" />
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className="font-bold text-xs"
                          style={{ fontFamily: resolvedTheme.tokens.typography.fontFamilyHeading }}
                        >
                          Minimalist Linen Overshirt
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="font-bold text-sm"
                            style={{ color: resolvedTheme.tokens.colors.primary }}
                          >
                            $89.00
                          </span>
                          <span className="line-through text-stone-400 text-xs">$120.00</span>
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 text-[9px] font-bold rounded"
                        style={{
                          backgroundColor: resolvedTheme.tokens.colors.badgeBg,
                          color: resolvedTheme.tokens.colors.badgeText,
                          borderRadius: resolvedTheme.tokens.radii.badge,
                        }}
                      >
                        -25%
                      </span>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: resolvedTheme.tokens.colors.primary,
                        borderRadius: resolvedTheme.tokens.radii.button,
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* Trust Badge Simulation */}
                  <div
                    className="p-2.5 rounded-lg border flex items-center gap-2 text-[11px]"
                    style={{
                      backgroundColor: resolvedTheme.tokens.colors.surfaceSecondary,
                      borderColor: resolvedTheme.tokens.colors.border,
                    }}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Authentic & Certified Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
