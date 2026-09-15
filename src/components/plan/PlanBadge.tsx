import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { getSellerPlanTier, SELLER_PLAN_LIMITS, canUpgradePlan } from '../../lib/sellerPlanLimits';
import { useCloseOnOutsideClick } from '../../hooks/useCloseOnOutsideClick';

interface PlanBadgeProps {
  plan?: string | null;
  /** When sidebar is collapsed, show icon-only with tooltip */
  collapsed?: boolean;
}

/**
 * Premium Tier badge shown in the sidebar beneath the shop name.
 * Features micro-gradients, soft border glow, and an interactive quick-view popover
 * detailing the seller's active plan limits and direct upgrade CTA.
 */
export default function PlanBadge({ plan, collapsed = false }: PlanBadgeProps) {
  const { t } = useTranslation();
  const tier = getSellerPlanTier(plan);
  const isBasic = tier === 'basic';
  const isUpgradable = canUpgradePlan(plan);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useCloseOnOutsideClick(popoverOpen, () => setPopoverOpen(false), popoverRef);

  const label = isBasic
    ? t('dashboard.layout.planBadgeBasic')
    : t('dashboard.layout.planBadgeBusiness');

  const Icon = isBasic ? Crown : Sparkles;
  const currentLimits = SELLER_PLAN_LIMITS[tier];

  if (collapsed) {
    return (
      <div ref={popoverRef} className="relative inline-flex">
        <button
          type="button"
          onClick={() => setPopoverOpen((prev) => !prev)}
          title={label}
          aria-label={label}
          className={`group relative flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-300 focus:outline-none ${
            isBasic
              ? 'bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-transparent text-amber-700 dark:text-amber-400 border border-amber-500/25 hover:border-amber-500/50 shadow-sm shadow-amber-500/10'
              : 'bg-gradient-to-br from-brand-600/20 via-purple-500/15 to-transparent text-brand-600 dark:text-brand-400 border border-brand-500/30 hover:border-brand-500/60 shadow-sm shadow-brand-500/15'
          }`}
        >
          <Icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.2} />
          {isBasic && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </button>

        {popoverOpen && (
          <div className="absolute left-full ml-3 top-0 z-[250] w-64 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 shadow-xl shadow-stone-900/10 dark:shadow-black/50 text-start animate-in fade-in zoom-in-95 duration-150">
            {renderPopoverContent()}
          </div>
        )}
      </div>
    );
  }

  function renderPopoverContent() {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                isBasic
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  : 'bg-brand-500/15 text-brand-600 dark:text-brand-400'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-zinc-100">{label}</p>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400">
                {isBasic ? t('dashboard.layout.planBadgeBasicDesc', 'Standard Seller Tier') : t('dashboard.layout.planBadgeBusinessDesc', 'High Volume Pro Tier')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-300">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 dark:text-zinc-400">{t('dashboard.products.title')}:</span>
            <span className="font-semibold text-stone-800 dark:text-zinc-200">
              {currentLimits.maxProducts}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 dark:text-zinc-400">{t('dashboard.categories.title')}:</span>
            <span className="font-semibold text-stone-800 dark:text-zinc-200">
              {currentLimits.maxCategories}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 dark:text-zinc-400">{t('dashboard.productForm.imagesTitle')}:</span>
            <span className="font-semibold text-stone-800 dark:text-zinc-200">
              {currentLimits.maxImagesPerProduct} / item
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 dark:text-zinc-400">{t('dashboard.orders.title')}:</span>
            <span className="font-semibold text-stone-800 dark:text-zinc-200">
              {currentLimits.maxOrders === null ? 'Unlimited ⚡' : `${currentLimits.maxOrders}`}
            </span>
          </div>
        </div>

        {isUpgradable ? (
          <Link
            to="/pricing"
            onClick={() => setPopoverOpen(false)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 py-2 px-3 text-[11px] font-bold text-white shadow-sm shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:-translate-y-px"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{t('dashboard.layout.upgradeBannerCta', 'View Business Plan')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-brand-600 dark:text-brand-400 pt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('dashboard.layout.planTopTier', 'Top tier active')}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={popoverRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setPopoverOpen((prev) => !prev)}
        className={`group relative inline-flex items-center gap-1.5 rounded-full py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none select-none ${
          isBasic
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent text-amber-800 dark:text-amber-300 border border-amber-500/25 hover:border-amber-500/40 hover:bg-amber-500/15 shadow-sm shadow-amber-500/5'
            : 'bg-gradient-to-r from-brand-500/15 via-purple-500/10 to-brand-500/5 text-brand-700 dark:text-brand-300 border border-brand-500/30 hover:border-brand-500/50 hover:bg-brand-500/20 shadow-sm shadow-brand-500/10'
        }`}
      >
        <Icon className="w-3 h-3 shrink-0 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.4} />
        <span>{label}</span>
        {isBasic && (
          <span className="ml-0.5 inline-flex items-center text-[9px] font-semibold text-amber-600 dark:text-amber-400 opacity-80 group-hover:opacity-100">
            • Upgrade
          </span>
        )}
      </button>

      {popoverOpen && (
        <div className="absolute left-0 top-full mt-2 z-[250] w-64 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 shadow-xl shadow-stone-900/10 dark:shadow-black/50 text-start animate-in fade-in zoom-in-95 duration-150">
          {renderPopoverContent()}
        </div>
      )}
    </div>
  );
}
