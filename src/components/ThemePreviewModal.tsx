import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Monitor, Smartphone, X, Sliders, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  resolveShopTheme,
  type ThemeId,
} from '../themes';
import ThemeLivePreview, { useViewportHeight, type PreviewDevice } from './ThemeLivePreview';

export interface ThemePreviewModalProps {
  themeId: ThemeId;
  device: PreviewDevice;
  onDeviceChange: (d: PreviewDevice) => void;
  onClose: () => void;
  isAllowed: boolean;
  isBusinessPlan: boolean;
  shopName: string;
  saving?: boolean;
  onApply: () => Promise<void> | void;
  onCustomize: () => void;
}

export default function ThemePreviewModal({
  themeId,
  device,
  onDeviceChange,
  onClose,
  isAllowed,
  isBusinessPlan,
  shopName,
  saving = false,
  onApply,
  onCustomize,
}: ThemePreviewModalProps) {
  const { t } = useTranslation();
  const { resolved: appColorMode } = useTheme();
  const previewConfig = useMemo(() => ({ version: 1 as const, themeId }), [themeId]);
  const previewResolved = resolveShopTheme(previewConfig, appColorMode);

  // Fill the modal: viewport height minus header, preview toolbar, padding and footer.
  const viewportH = useViewportHeight();
  const previewHeight = Math.max(460, Math.round(viewportH * 0.96 - 232));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[1800px] h-[96vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: previewResolved.tokens.colors.primary }}
            />
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                {t(`dashboard.themes.items.${themeId}.name`)}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300">
                  {t(`dashboard.themes.items.${themeId}.category`)}
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {t(`dashboard.themes.items.${themeId}.tagline`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-stone-200/70 dark:bg-zinc-800 p-1">
              <button
                type="button"
                onClick={() => onDeviceChange('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  device === 'desktop'
                    ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                }`}
                title={t('dashboard.themes.page.desktopPreview')}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeviceChange('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  device === 'mobile'
                    ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                }`}
                title={t('dashboard.themes.page.mobilePreview')}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={t('dashboard.common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: the real storefront, rendered with sample data */}
        <div className="flex-1 overflow-y-auto bg-stone-100 p-4 dark:bg-zinc-950 sm:p-5">
          <ThemeLivePreview
            themeConfig={previewConfig}
            shopName={shopName}
            device={device}
            height={previewHeight}
          />
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="px-5 py-3.5 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100"
          >
            {t('dashboard.themes.page.closePreview')}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCustomize}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('dashboard.themes.page.customizeTokens')}</span>
              {!isBusinessPlan && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {t('dashboard.themes.page.businessPlan')}
                </span>
              )}
            </button>

            {isAllowed ? (
              <button
                type="button"
                disabled={saving}
                onClick={onApply}
                className="px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all bg-stone-900 text-white hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving ? t('dashboard.themes.page.applying') : t('dashboard.themes.page.applyTheme')}
              </button>
            ) : (
              <Link
                to="/pricing"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
              >
                <Lock className="w-3.5 h-3.5" />
                {t('dashboard.themes.page.upgradeToApply')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
