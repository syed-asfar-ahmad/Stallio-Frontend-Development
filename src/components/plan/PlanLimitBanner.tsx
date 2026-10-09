import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, X, ArrowRight } from 'lucide-react';
import { SELLER_PLAN_LIMITS } from '../../lib/sellerPlanLimits';

interface PlanLimitBannerProps {
  show: boolean;
}

/**
 * Persistent upgrade callout that appears when a Basic seller hits a plan limit.
 * Never renders for Business plan sellers.
 * Dismissible per-session (local state — reappears on page reload when limit is still active).
 */
export default function PlanLimitBanner({ show }: PlanLimitBannerProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  const biz = SELLER_PLAN_LIMITS.business;

  return (
    <div
      role="alert"
      className="relative mb-5 lg:mb-6 rounded-xl lg:rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 dark:from-amber-950/25 dark:via-orange-950/15 dark:to-amber-950/25 overflow-hidden shadow-sm shadow-amber-200/30 dark:shadow-amber-900/10"
    >
      {/* Decorative left accent bar */}
      <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-s-xl lg:rounded-s-2xl" />

      <div className="px-4 lg:px-5 py-3.5 lg:py-4 ps-5 lg:ps-6 flex items-start gap-3">
        {/* Icon */}
        <span className="shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-400/30">
          <Zap className="w-4 h-4 text-white fill-current" aria-hidden />
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-snug">
            {t('dashboard.layout.upgradeBannerTitle')}
          </p>
          <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/70 leading-relaxed">
            {t('dashboard.layout.upgradeBannerBody', {
              products: biz.maxProducts,
              categories: biz.maxCategories,
              images: biz.maxImagesPerProduct,
            })}
          </p>

          <Link
            to="/pricing"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-amber-500/25 transition-all hover:shadow-amber-500/30 hover:-translate-y-px active:translate-y-0"
          >
            <Zap className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden />
            {t('dashboard.layout.upgradeBannerCta')}
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden />
          </Link>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t('dashboard.layout.upgradeBannerDismiss')}
          className="shrink-0 -mt-0.5 -me-1 flex h-7 w-7 items-center justify-center rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
