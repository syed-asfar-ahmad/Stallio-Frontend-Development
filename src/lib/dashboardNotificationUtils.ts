import type { TFunction } from 'i18next';
import type { DashboardNotification } from '../types';

const KIND_PREFIX = 'dashboard.notifications.kinds.';

export function notificationTitle(t: TFunction, n: DashboardNotification): string {
  const p = n.payload;
  const key = `${KIND_PREFIX}${n.kind}`;
  switch (n.kind) {
    case 'order_new':
      return t(key, {
        customerName: String(p.customerName ?? ''),
        amount: Number(p.totalAmount ?? 0).toFixed(2),
      });
    case 'message_new':
      return t(key, { customerName: String(p.customerName ?? '') });
    case 'support_chat_new':
      return t(key);
    default:
      return t(key);
  }
}

export function notificationHref(n: DashboardNotification): string {
  switch (n.kind) {
    case 'order_new':
      return '/dashboard/orders';
    case 'message_new':
      return '/dashboard/messages';
    case 'support_chat_new':
      return '/dashboard/support';
    default:
      return '/dashboard/notifications';
  }
}

export function formatNotificationTime(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return iso;
  }
}
