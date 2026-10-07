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
  Sliders,
  LayoutGrid,
  Monitor,
  Smartphone,
  Eye,
  Type,
  Zap,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import DashboardLoading from '../components/DashboardLoading';
import ConfirmDialog from '../components/ConfirmDialog';
import DashboardSelect from '../components/DashboardSelect';
import ThemePreviewModal from '../components/ThemePreviewModal';
import ThemeLivePreview, { useViewportHeight, type PreviewDevice } from '../components/ThemeLivePreview';
import ThemeThumbnail from '../components/ThemeThumbnail';
import {
  THEME_LIST,
  THEME_REGISTRY,
  DEFAULT_THEME_ID,
  FONT_PRESETS,
  isThemeAllowedForPlan,
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
  type HeaderNavigationVariant,
  type FooterLayoutVariant,
} from '../themes';
import {
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_OUTLINE,
  DASHBOARD_BTN_SECONDARY,
  DASHBOARD_INPUT,
} from '../lib/dashboardFormClasses';
import { getContrastColor } from '../lib/colorUtils';

type ViewTab = 'gallery' | 'customize';
type ThemeConfirmation =
  | { action: 'apply'; themeId: ThemeId }
  | { action: 'save' }
  | null;

const PRESET_COLOR_SWATCHES = [
  '#4f46e5',
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#854d0e',
  '#7c3aed',
  '#0f172a',
  '#18181b',
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
  const [themeConfirmation, setThemeConfirmation] = useState<ThemeConfirmation>(null);
  // Which theme card is currently being applied (so only that button shows "Applying…").
  const [applyingThemeId, setApplyingThemeId] = useState<ThemeId | null>(null);

  useEffect(() => {
    if (user) {
      let effectiveThemeConfig = user.themeConfig;

      if (!effectiveThemeConfig && user.username) {
        try {
          const stored = localStorage.getItem(`stallio_theme_config_${user.username}`);
          if (stored) {
            effectiveThemeConfig = JSON.parse(stored);
          }
        } catch {
        }
      }

      const currentThemeId = effectiveThemeConfig?.themeId || DEFAULT_THEME_ID;
      setSelectedThemeId(currentThemeId in THEME_REGISTRY ? currentThemeId : DEFAULT_THEME_ID);

      if (effectiveThemeConfig) {
        setCustomColors(effectiveThemeConfig.tokens?.colors || {});
        setCustomTypography(effectiveThemeConfig.tokens?.typography || {});
        setCustomRadii(effectiveThemeConfig.tokens?.radii || {});
        setCustomShadows(effectiveThemeConfig.tokens?.shadows || {});
        setCustomLayout(effectiveThemeConfig.layout || {});
      }
    }
  }, [user]);

  // Bypassed for development & testing so all themes and token customization can be tested
  const isBusinessPlan = true;

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
  const viewportH = useViewportHeight();
  // The sticky preview column: header row + toolbar + gaps take ~150px.
  const customizerPreviewHeight = Math.max(560, viewportH - 150);

  function handleApplyTheme(themeId: ThemeId) {
    if (applyingThemeId || themeConfirmation) return;
    if (!isThemeAllowedForPlan(themeId, user?.plan)) {
      toast.error(t('dashboard.themes.upgradeForTheme'));
      return;
    }

    setThemeConfirmation({ action: 'apply', themeId });
  }

  async function applyTheme(themeId: ThemeId) {
    const previous = {
      themeId: selectedThemeId,
      colors: customColors,
      typography: customTypography,
      radii: customRadii,
      shadows: customShadows,
      layout: customLayout,
      user,
    };

    setApplyingThemeId(themeId);
    setSelectedThemeId(themeId);
    const def = THEME_REGISTRY[themeId];
    const localizedThemeName = t(`dashboard.themes.items.${themeId}.name`);
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
      toast.success(t('dashboard.themes.toastApplied', { name: localizedThemeName }));
    } catch (err) {
      // Roll the optimistic change back so the UI matches what is actually saved.
      setSelectedThemeId(previous.themeId);
      setCustomColors(previous.colors);
      setCustomTypography(previous.typography);
      setCustomRadii(previous.radii);
      setCustomShadows(previous.shadows);
      setCustomLayout(previous.layout);
      if (previous.user) replaceUser(previous.user);
      toast.error((err as Error).message || t('dashboard.themes.applyFailed'));
    } finally {
      setApplyingThemeId(null);
    }
  }

  function handleResetDefaults() {
    setCustomColors({});
    setCustomTypography({});
    setCustomRadii({});
    setCustomShadows({});
    setCustomLayout({});
    toast.success(t('dashboard.themes.toastReset', {
      name: t(`dashboard.themes.items.${selectedThemeId}.name`),
    }));
  }

  function handleSave() {
    if (saving || themeConfirmation) return;
    if (!isThemeAllowedForPlan(selectedThemeId, user?.plan)) {
      toast.error(t('dashboard.themes.selectedThemeRequiresBusiness'));
      return;
    }

    if (!isBusinessPlan) {
      toast.error(t('dashboard.themes.customizerRequiresBusiness'));
      return;
    }

    setThemeConfirmation({ action: 'save' });
  }

  async function saveTheme() {
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
      toast.success(t('dashboard.themes.toastSaved'));
    } catch (err) {
      toast.error((err as Error).message || t('dashboard.themes.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmThemeAction() {
    if (!themeConfirmation) return;
    if (themeConfirmation.action === 'apply') {
      await applyTheme(themeConfirmation.themeId);
    } else {
      await saveTheme();
    }
    setThemeConfirmation(null);
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`space-y-6 pb-12 mx-auto ${activeTab === 'customize' ? 'max-w-[1800px]' : 'max-w-7xl'}`}>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-stone-200/80 dark:border-zinc-800 pb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Palette className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                {t('dashboard.themes.page.title')}
              </h1>
            </div>
            <p className="mt-1 text-sm text-stone-500 dark:text-zinc-400">
              {t('dashboard.themes.page.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {/* <Link
              to={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${DASHBOARD_BTN_OUTLINE} whitespace-nowrap`}
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>{t('dashboard.themes.page.liveStorefront')}</span>
            </Link> */}

          <button
            type="button"
            onClick={handleResetDefaults}
            className={`${DASHBOARD_BTN_SECONDARY} inline-flex items-center gap-2 whitespace-nowrap`}
            title={t('dashboard.themes.page.resetTitle')}
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>{t('dashboard.themes.page.resetDefaults')}</span>
          </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`${DASHBOARD_BTN_PRIMARY} whitespace-nowrap`}
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>{saving ? t('dashboard.themes.page.publishing') : t('dashboard.themes.page.savePublish')}</span>
            </button>
          </div>
        </div>

        {!isBusinessPlan && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                <Zap className="w-5 h-5 fill-current" />
              </span>
              <div>
                <p className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  {t('dashboard.themes.page.basicPlanBannerTitle')}
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  {t('dashboard.themes.page.basicPlanBannerBody')}
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:brightness-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('dashboard.themes.page.upgradeBusiness')}
            </Link>
          </div>
        )}

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
            {t('dashboard.themes.page.gallery')}
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
            <span>{t('dashboard.themes.page.customizer')}</span>
            {!isBusinessPlan && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Lock className="w-2.5 h-2.5" />
                Business
              </span>
            )}
          </button>
        </div>

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
                  <div
                    onClick={() => setPreviewModalTheme(theme.id)}
                    className="relative h-48 overflow-hidden border-b border-stone-100 dark:border-zinc-800 cursor-pointer group/banner"
                    style={{ backgroundColor: palette.background }}
                  >
                    <ThemeThumbnail theme={theme} />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase backdrop-blur-md ${
                          theme.tier === 'business'
                            ? 'bg-amber-500/90 text-white shadow-sm shadow-amber-500/30'
                            : 'bg-stone-900/80 text-white border border-white/20'
                        }`}
                      >
                        {theme.tier === 'business' && <Sparkles className="w-3 h-3 text-amber-200 fill-current" />}
                        {theme.tier === 'business'
                          ? t('dashboard.themes.page.businessPlan')
                          : t('dashboard.themes.page.basicPlan')}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                      <span className="px-4 py-2 rounded-xl bg-white/95 text-stone-900 font-bold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover/banner:translate-y-0 transition-transform">
                        <Eye className="w-4 h-4 text-brand-600" />
                        {t('dashboard.themes.page.clickLivePreview')}
                      </span>
                    </div>

                    <div className="absolute bottom-3 inset-x-3 flex items-end justify-between z-10 text-white">
                      <div>
                        <div
                          className="font-bold text-sm tracking-tight drop-shadow"
                          style={{ fontFamily: theme.defaultTokens.typography.fontFamilyHeading }}
                        >
                          {t(`dashboard.themes.items.${theme.id}.name`)}
                        </div>
                        <div className="text-[10px] text-white/80">
                          {t(`dashboard.themes.items.${theme.id}.category`)}
                        </div>
                      </div>

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

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-bold text-lg text-stone-900 dark:text-zinc-100">
                        {t(`dashboard.themes.items.${theme.id}.name`)}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                        {t(`dashboard.themes.items.${theme.id}.category`)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                      {t(`dashboard.themes.items.${theme.id}.tagline`)}
                    </p>

                    <div className="mt-4 space-y-1.5 flex-1">
                      {theme.features.map((_feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-stone-600 dark:text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{t(`dashboard.themes.items.${theme.id}.features.${idx}`)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalTheme(theme.id)}
                        className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                        title={t('dashboard.themes.page.openPreviewTitle')}
                      >
                        <Eye className="w-4 h-4 text-stone-500" />
                        <span className="hidden sm:inline">{t('dashboard.themes.page.preview')}</span>
                      </button>

                      {isAllowed ? (
                        <>
                          <button
                            type="button"
                            disabled={applyingThemeId !== null}
                            aria-busy={applyingThemeId === theme.id}
                            onClick={() => handleApplyTheme(theme.id)}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed ${
                              applyingThemeId !== null && applyingThemeId !== theme.id ? 'opacity-50' : ''
                            } ${
                              isSelected && applyingThemeId !== theme.id
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm'
                            }`}
                          >
                            {applyingThemeId === theme.id
                              ? t('dashboard.themes.page.applying')
                              : t('dashboard.themes.page.applyTheme')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedThemeId(theme.id);
                              setActiveTab('customize');
                            }}
                            className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                            title={t('dashboard.themes.page.customizeThemeTitle')}
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
                          {t('dashboard.themes.page.businessPlan')}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'customize' && (
          <div className="space-y-6">
            

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                      {t(`dashboard.themes.items.${selectedThemeId}.name`)}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gallery')}
                    className={DASHBOARD_BTN_SECONDARY}
                  >
                    {t('dashboard.themes.page.switchTheme')}
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
                  <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                    <Palette className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    <h2 className="font-bold text-stone-900 dark:text-zinc-100">{t('dashboard.themes.page.colorPalette')}</h2>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      {t('dashboard.themes.page.primaryColor')}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={resolvedTheme.tokens.colors.primary}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setCustomColors((prev) => ({
                            ...prev,
                            primary: hex,
                            primaryHover: hex,
                            primaryContrast: getContrastColor(hex),
                          }));
                        }}
                        className="h-11 w-14 rounded-xl border border-stone-300 dark:border-zinc-700 cursor-pointer p-1 bg-white dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={resolvedTheme.tokens.colors.primary}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setCustomColors((prev) => ({
                            ...prev,
                            primary: hex,
                            primaryHover: hex,
                            // Only auto-derive contrast for valid hex values
                            ...((/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex))
                              ? { primaryContrast: getContrastColor(hex) }
                              : {}),
                          }));
                        }}
                        className={DASHBOARD_INPUT}
                        placeholder="#4f46e5"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[11px] text-stone-400">{t('dashboard.themes.page.presets')}:</span>
                      {PRESET_COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch}
                          type="button"
                          onClick={() =>
                            setCustomColors((prev) => ({
                              ...prev,
                              primary: swatch,
                              primaryHover: swatch,
                              primaryContrast: getContrastColor(swatch),
                            }))
                          }
                          className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: swatch }}
                          title={swatch}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      {t('dashboard.themes.page.secondaryColor')}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                        {t('dashboard.themes.page.pageBackground')}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={resolvedTheme.tokens.colors.background}
                          onChange={(e) =>
                            setCustomColors((prev) => ({ ...prev, background: e.target.value }))
                          }
                          className="h-11 w-14 shrink-0 rounded-xl border border-stone-300 dark:border-zinc-700 cursor-pointer p-1 bg-white dark:bg-zinc-800"
                          aria-label={t('dashboard.themes.page.chooseBackgroundColor')}
                        />
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
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                        {t('dashboard.themes.page.cardSurface')}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={resolvedTheme.tokens.colors.surface}
                          onChange={(e) =>
                            setCustomColors((prev) => ({ ...prev, surface: e.target.value }))
                          }
                          className="h-11 w-14 shrink-0 rounded-xl border border-stone-300 dark:border-zinc-700 cursor-pointer p-1 bg-white dark:bg-zinc-800"
                          aria-label={t('dashboard.themes.page.chooseCardColor')}
                        />
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
                </div>

                <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
                  <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                    <Type className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    <h2 className="font-bold text-stone-900 dark:text-zinc-100">{t('dashboard.themes.page.typography')}</h2>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      {t('dashboard.themes.page.headingFont')}
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
                            {t(`dashboard.themes.fonts.${font.id}`)}
                          </p>
                          <p className="text-[11px] opacity-70 mt-0.5">{t('dashboard.themes.page.headingFontSample')}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                      {t('dashboard.themes.page.bodyFont')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {FONT_PRESETS.map((font) => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() =>
                            setCustomTypography((prev) => ({
                              ...prev,
                              fontFamilyBody: font.family,
                            }))
                          }
                          className={`p-3 rounded-xl border text-left transition-all ${
                            resolvedTheme.tokens.typography.fontFamilyBody === font.family
                              ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200'
                              : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300'
                          }`}
                        >
                          <p className="font-semibold text-sm" style={{ fontFamily: font.family }}>
                            {t(`dashboard.themes.fonts.${font.id}`)}
                          </p>
                          <p className="text-[11px] opacity-70 mt-0.5" style={{ fontFamily: font.family }}>
                            {t('dashboard.themes.page.bodyFontSample')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5">
                  <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                    <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    <h2 className="font-bold text-stone-900 dark:text-zinc-100">{t('dashboard.themes.page.layoutOptions')}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                        {t('dashboard.themes.page.heroStyle')}
                      </label>
                      <DashboardSelect
                        value={resolvedTheme.layout.heroVariant}
                        onChange={(value) =>
                          setCustomLayout((prev) => ({
                            ...prev,
                            heroVariant: value as HeroLayoutVariant,
                          }))
                        }
                        options={[
                          { value: 'cocoa-banner', label: t('dashboard.themes.options.hero.cocoaBanner') },
                          { value: 'fresh-bloom', label: t('dashboard.themes.options.hero.freshBloom') },
                          { value: 'mart-bento', label: t('dashboard.themes.options.hero.martBento') },
                          { value: 'botanical-arch', label: t('dashboard.themes.options.hero.botanicalArch') },
                          { value: 'sanctuary-panorama', label: t('dashboard.themes.options.hero.sanctuaryPanorama') },
                          { value: 'apothecary-duo', label: t('dashboard.themes.options.hero.apothecaryDuo') },
                          { value: 'organic-pill', label: t('dashboard.themes.options.hero.organicPill') },
                          { value: 'full-banner', label: t('dashboard.themes.options.hero.fullBanner') },
                          { value: 'split-image', label: t('dashboard.themes.options.hero.splitImage') },
                          { value: 'minimal-clean', label: t('dashboard.themes.options.hero.minimalClean') },
                          { value: 'card-showcase', label: t('dashboard.themes.options.hero.cardShowcase') },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                        {t('dashboard.themes.page.productCardStyle')}
                      </label>
                      <DashboardSelect
                        value={resolvedTheme.layout.productCardVariant}
                        onChange={(value) =>
                          setCustomLayout((prev) => ({
                            ...prev,
                            productCardVariant: value as ProductCardVariant,
                          }))
                        }
                        options={[
                          { value: 'cocoa-tile', label: t('dashboard.themes.options.card.cocoaTile') },
                          { value: 'fresh-bloom', label: t('dashboard.themes.options.card.freshBloom') },
                          { value: 'mart-deal', label: t('dashboard.themes.options.card.martDeal') },
                          { value: 'organic-pill', label: t('dashboard.themes.options.card.organicPill') },
                          { value: 'bordered', label: t('dashboard.themes.options.card.bordered') },
                          { value: 'flat', label: t('dashboard.themes.options.card.flat') },
                          { value: 'elevated', label: t('dashboard.themes.options.card.elevated') },
                          { value: 'compact', label: t('dashboard.themes.options.card.compact') },
                          { value: 'editorial', label: t('dashboard.themes.options.card.editorial') },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                        {t('dashboard.themes.page.headerStyle')}
                      </label>
                      <DashboardSelect
                        value={resolvedTheme.layout.headerVariant}
                        onChange={(value) =>
                          setCustomLayout((prev) => ({
                            ...prev,
                            headerVariant: value as HeaderNavigationVariant,
                          }))
                        }
                        options={[
                          { value: 'cocoa-overlay', label: t('dashboard.themes.options.header.cocoaOverlay') },
                          { value: 'fresh-nav', label: t('dashboard.themes.options.header.freshNav') },
                          { value: 'mart-market', label: t('dashboard.themes.options.header.martMarket') },
                          { value: 'floating-capsule', label: t('dashboard.themes.options.header.floatingCapsule') },
                          { value: 'classic-bar', label: t('dashboard.themes.options.header.classicBar') },
                          { value: 'centered-logo', label: t('dashboard.themes.options.header.centeredLogo') },
                          { value: 'minimal-floating', label: t('dashboard.themes.options.header.minimalFloating') },
                          { value: 'inline-compact', label: t('dashboard.themes.options.header.inlineCompact') },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
                        {t('dashboard.themes.page.footerStyle')}
                      </label>
                      <DashboardSelect
                        value={resolvedTheme.layout.footerVariant}
                        onChange={(value) =>
                          setCustomLayout((prev) => ({
                            ...prev,
                            footerVariant: value as FooterLayoutVariant,
                          }))
                        }
                        options={[
                          { value: 'cocoa-atelier', label: t('dashboard.themes.options.footer.cocoaAtelier') },
                          { value: 'fresh-sage', label: t('dashboard.themes.options.footer.freshSage') },
                          { value: 'mart-teal', label: t('dashboard.themes.options.footer.martTeal') },
                          { value: 'organic-curated', label: t('dashboard.themes.options.footer.organicCurated') },
                          { value: 'multi-column', label: t('dashboard.themes.options.footer.multiColumn') },
                          { value: 'centered-minimal', label: t('dashboard.themes.options.footer.centeredMinimal') },
                          { value: 'bold-newsletter', label: t('dashboard.themes.options.footer.boldNewsletter') },
                          { value: 'compact-inline', label: t('dashboard.themes.options.footer.compactInline') },
                        ]}
                      />
                    </div>

                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 xl:col-span-8 sticky top-6 space-y-3 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                      {t('dashboard.themes.page.liveTokenPreview')}
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
                      title={t('dashboard.themes.page.desktopPreview')}
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
                      title={t('dashboard.themes.page.mobilePreview')}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <ThemeLivePreview
                  themeConfig={previewThemeConfig}
                  shopName={user?.shopName || t('dashboard.themes.page.sampleStorefront')}
                  device={previewDevice}
                  height={customizerPreviewHeight}
                />
              </div>
            </div>
          </div>
        )}

        {previewModalTheme && (
          <ThemePreviewModal
            themeId={previewModalTheme}
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
            onClose={() => setPreviewModalTheme(null)}
            isAllowed={isThemeAllowedForPlan(previewModalTheme, user?.plan)}
            isBusinessPlan={isBusinessPlan}
            shopName={user?.shopName || t('dashboard.themes.page.sampleStorefront')}
            saving={applyingThemeId === previewModalTheme}
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
        <ConfirmDialog
          open={themeConfirmation !== null}
          title={
            themeConfirmation?.action === 'apply'
              ? t('dashboard.themes.confirmApplyTitle')
              : t('dashboard.themes.confirmSaveTitle')
          }
          message={
            themeConfirmation?.action === 'apply'
              ? t('dashboard.themes.confirmApplyMessage', {
                  name: t(`dashboard.themes.items.${themeConfirmation.themeId}.name`),
                })
              : t('dashboard.themes.confirmSaveMessage')
          }
          confirmLabel={
            themeConfirmation?.action === 'apply'
              ? t('dashboard.themes.confirmApply')
              : t('dashboard.themes.confirmSave')
          }
          cancelLabel={t('dashboard.common.cancel')}
          onConfirm={confirmThemeAction}
          onCancel={() => setThemeConfirmation(null)}
          loading={saving || applyingThemeId !== null}
        />
      </div>
    </DashboardLayout>
  );
}
// default export DashboardThemes;