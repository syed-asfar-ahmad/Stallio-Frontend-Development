import { adminTheme } from './adminTheme';

type Props = {
  suspended: boolean;
  dashboardSuspended: boolean;
};

export type SellerRestrictionKind = 'active' | 'fully_suspended' | 'store_blocked' | 'dashboard_blocked';

export function getSellerRestrictionKind(suspended: boolean, dashboardSuspended: boolean): SellerRestrictionKind {
  if (!suspended && !dashboardSuspended) return 'active';
  if (suspended && dashboardSuspended) return 'fully_suspended';
  if (suspended) return 'store_blocked';
  return 'dashboard_blocked';
}

const LABELS: Record<Exclude<SellerRestrictionKind, 'active'>, { short: string; title: string }> = {
  fully_suspended: {
    short: 'Suspended',
    title: 'Public store hidden and seller dashboard blocked',
  },
  store_blocked: {
    short: 'Store Blocked',
    title: 'Public storefront is hidden from customers',
  },
  dashboard_blocked: {
    short: 'Dashboard Blocked',
    title: 'Seller cannot sign in or use the dashboard',
  },
};

export default function AdminSellerRestrictionBadge({ suspended, dashboardSuspended }: Props) {
  const kind = getSellerRestrictionKind(suspended, dashboardSuspended);

  if (kind === 'active') {
    return <span className={`${adminTheme.badgeActive} whitespace-nowrap`}>Active</span>;
  }

  const { short, title } = LABELS[kind];
  return (
    <span className={`${adminTheme.badgeSuspended} whitespace-nowrap`} title={title}>
      {short}
    </span>
  );
}
