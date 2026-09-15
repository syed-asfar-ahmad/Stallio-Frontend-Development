import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Zap, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getSellerPlanTier, SELLER_PLAN_LIMITS, canUpgradePlan } from '../../lib/sellerPlanLimits';

interface PlanSubscriptionCardProps {
  plan?: string | null;
}

/**
 * Premium Plan & Subscription card for the Dashboard Settings page.
 * Displays tier prestige, live resource quota allowances, and prominent upgrade CTA.
 */
export default function PlanSubscriptionCard({ plan }: PlanSubscriptionCardProps) {
  const { t } = useTranslation();
  const tier = getSellerPlanTier(plan);
  const isBasic = tier === 'basic';
  const isUpgradable = canUpgradePlan(plan);
  const currentLimits = SELLER_PLAN_LIMITS[tier];

  const label = isBasic
    ? t('dashboard.layout.planBadgeBasic', 'Basic Plan')
    : t('dashboard.layout.planBadgeBusiness', 'Business Plan');

  const Icon = isBasic ? Crown : Sparkles;

  return (
    <div className="relative rounded-2xl border border-stone-200/90 dark:border-zinc-700/80 bg-gradient-to-br from-white via-stone-50/50 to-white dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900 shadow-md shadow-stone-200/30 dark:shadow-black/40 overflow-hidden min-w-0">
      {/* Decorative top gradient bar */}
      <div
        className={`h-1.5 w-full ${
          isBasic
            ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'
            : 'bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500'
        }`}
      />

      <div className="p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-stone-100 dark:border-zinc-800/90">
          <div className="flex items-start gap-3.5 min-w-0">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                isBasic
                  ? 'bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-gradient-to-br from-brand-500/25 via-purple-500/20 to-transparent text-brand-600 dark:text-brand-400 border border-brand-500/40 shadow-brand-500/10'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-stone-900 dark:text-zinc-100 tracking-tight">
                  {label}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isBasic
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50'
                      : 'bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-300/60 dark:border-brand-700/50'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  {isBasic ? t('dashboard.settings.planActive', 'Active Plan') : t('dashboard.settings.proActive', 'Pro Active')}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                {isBasic
                  ? t('dashboard.settings.planBasicDesc', 'Standard selling tier with essential tools for your storefront.')
                  : t('dashboard.settings.planBusinessDesc', 'High-volume tier with expanded quotas, max images, and unlimited orders.')}
              </p>
            </div>
          </div>

          {isUpgradable ? (
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-500/25 transition-all hover:shadow-brand-500/35 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{t('dashboard.settings.upgradePlanCta', 'Upgrade to Business')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-800/50">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{t('dashboard.settings.topTierUnlocked', 'All Pro Features Unlocked')}</span>
            </div>
          )}
        </div>

        {/* Feature limits grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 block mb-0.5">
              {t('dashboard.products.title', 'Products')}
            </span>
            <span className="text-base font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
              {currentLimits.maxProducts} <span className="text-[11px] font-normal text-stone-400 dark:text-zinc-500">max</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 block mb-0.5">
              {t('dashboard.categories.title', 'Categories')}
            </span>
            <span className="text-base font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
              {currentLimits.maxCategories} <span className="text-[11px] font-normal text-stone-400 dark:text-zinc-500">max</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 block mb-0.5">
              {t('dashboard.productForm.imagesTitle', 'Photos / Item')}
            </span>
            <span className="text-base font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
              {currentLimits.maxImagesPerProduct} <span className="text-[11px] font-normal text-stone-400 dark:text-zinc-500">slots</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 block mb-0.5">
              {t('dashboard.orders.title', 'Orders')}
            </span>
            <span className="text-base font-bold text-stone-900 dark:text-zinc-100 tabular-nums">
              {currentLimits.maxOrders === null ? 'Unlimited ⚡' : `${currentLimits.maxOrders} max`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
