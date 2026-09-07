import {
  Award,
  BadgeCheck,
  Clock,
  Leaf,
  Shield,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';

export const TRUST_BADGE_TYPES = ['check', 'clock', 'truck', 'star', 'leaf', 'shield', 'badge'] as const;
export type TrustBadgeType = (typeof TRUST_BADGE_TYPES)[number];

const TRUST_BADGE_ICONS: Record<TrustBadgeType, LucideIcon> = {
  check: BadgeCheck,
  clock: Clock,
  truck: Truck,
  star: Star,
  leaf: Leaf,
  shield: Shield,
  badge: Award,
};

export function isTrustBadgeType(v: string | undefined): v is TrustBadgeType {
  return TRUST_BADGE_TYPES.includes(v as TrustBadgeType);
}

export function resolveTrustBadgeType(icon: string | undefined): TrustBadgeType {
  return isTrustBadgeType(icon) ? icon : 'check';
}

export function TrustBadgeTypeIcon({
  type,
  className,
}: {
  type: TrustBadgeType;
  className?: string;
}) {
  const Icon = TRUST_BADGE_ICONS[type];
  return <Icon className={className ?? 'h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400'} aria-hidden />;
}
