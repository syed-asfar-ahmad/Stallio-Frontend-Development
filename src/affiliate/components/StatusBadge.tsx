// ============================================================================
// Stallio Affiliate Reusable StatusBadge
// Handles all 6 Referral, 4 Commission, and 4 Payout Statuses
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  ShieldCheck,
  Store,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Check,
  AlertTriangle,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import type { ReferralStatus, CommissionStatus, PayoutStatus } from '../types';

export type AnyAffiliateStatus =
  | ReferralStatus
  | CommissionStatus
  | PayoutStatus
  | 'active'
  | 'suspended';

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
  iconClasses: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // --- Referral Statuses ---
  pending_verification: {
    label: 'Pending Verification',
    icon: Clock,
    classes:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
    iconClasses: 'text-amber-600 dark:text-amber-400',
  },
  verified: {
    label: 'Email Verified',
    icon: ShieldCheck,
    classes:
      'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60',
    iconClasses: 'text-sky-600 dark:text-sky-400',
  },
  trial: {
    label: '30-Day Free Trial',
    icon: Store,
    classes:
      'bg-brand-50 text-brand-800 border-brand-200/80 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/60',
    iconClasses: 'text-brand-600 dark:text-brand-400',
  },
  paid: {
    label: 'Paid Plan',
    icon: CheckCircle2,
    classes:
      'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
    iconClasses: 'text-emerald-600 dark:text-emerald-400',
  },
  churned: {
    label: 'Trial Expired',
    icon: AlertCircle,
    classes:
      'bg-stone-100 text-stone-700 border-stone-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    iconClasses: 'text-stone-500 dark:text-zinc-500',
  },
  rejected: {
    label: 'Flagged / Rejected',
    icon: XCircle,
    classes:
      'bg-red-50 text-red-800 border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
    iconClasses: 'text-red-600 dark:text-red-400',
  },

  // --- Commission Statuses ---
  pending: {
    label: '30-Day Hold',
    icon: Clock,
    classes:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
    iconClasses: 'text-amber-600 dark:text-amber-400',
  },
  approved: {
    label: 'Approved / Ready',
    icon: Check,
    classes:
      'bg-brand-50 text-brand-800 border-brand-200/80 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/60',
    iconClasses: 'text-brand-600 dark:text-brand-400',
  },
  // Note: 'paid' is shared with referral paid above.
  reversed: {
    label: 'Reversed',
    icon: AlertTriangle,
    classes:
      'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
    iconClasses: 'text-rose-600 dark:text-rose-400',
  },

  // --- Payout Statuses ---
  requested: {
    label: 'Requested',
    icon: Clock,
    classes:
      'bg-stone-100 text-stone-800 border-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    iconClasses: 'text-stone-500 dark:text-zinc-400',
  },
  processing: {
    label: 'Processing Batch',
    icon: RefreshCw,
    classes:
      'bg-brand-50 text-brand-800 border-brand-200/80 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/60',
    iconClasses: 'text-brand-600 dark:text-brand-400 animate-spin',
  },
  failed: {
    label: 'Payout Failed',
    icon: XCircle,
    classes:
      'bg-red-50 text-red-800 border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
    iconClasses: 'text-red-600 dark:text-red-400',
  },

  // --- General Statuses ---
  active: {
    label: 'Active',
    icon: CheckCircle2,
    classes:
      'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
    iconClasses: 'text-emerald-600 dark:text-emerald-400',
  },
  suspended: {
    label: 'Suspended',
    icon: AlertCircle,
    classes:
      'bg-red-50 text-red-800 border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
    iconClasses: 'text-red-600 dark:text-red-400',
  },
};

interface StatusBadgeProps {
  status: AnyAffiliateStatus | string;
  context?: 'referral' | 'commission' | 'payout';
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({
  status,
  context,
  showIcon = true,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const { t } = useTranslation();
  // If context is commission and status is 'paid', customize label
  let key = status;
  let customLabel: string | undefined;

  if (context === 'commission' && status === 'paid') {
    customLabel = 'Disbursed';
  } else if (context === 'commission' && status === 'pending') {
    customLabel = '30-Day Hold';
  } else if (context === 'referral' && status === 'paid') {
    customLabel = 'Paid Plan (20%)';
  }

  const config = STATUS_CONFIGS[key] || {
    label: status.replace(/_/g, ' '),
    icon: Clock,
    classes:
      'bg-stone-100 text-stone-700 border-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    iconClasses: 'text-stone-500',
  };

  const Icon = config.icon;
  const label = t(`affiliate.${statusLabelKey(customLabel || config.label)}`, {
    defaultValue: customLabel || config.label,
  });

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[0.6875rem] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-2';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight rounded-md border shrink-0 transition-colors select-none ${config.classes} ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <Icon className={`${iconSize} shrink-0 ${config.iconClasses}`} />
      )}
      <span>{label}</span>
    </span>
  );
}

function statusLabelKey(label: string): string {
  const keys: Record<string, string> = {
    'Pending Verification': 'pendingVerification',
    'Email Verified': 'emailVerified',
    '30-Day Free Trial': 'freeTrial',
    'Paid Plan': 'paidPlan',
    'Trial Expired': 'trialExpired',
    'Flagged / Rejected': 'flaggedRejected',
    '30-Day Hold': 'refundHold',
    'Approved / Ready': 'approvedReady',
    Reversed: 'reversed',
    Requested: 'requested',
    'Processing Batch': 'processingBatch',
    'Payout Failed': 'payoutFailed',
    Active: 'active',
    Suspended: 'suspended',
    Disbursed: 'disbursed',
    'Paid Plan (20%)': 'paidPlan',
  };
  return keys[label] || label;
}
