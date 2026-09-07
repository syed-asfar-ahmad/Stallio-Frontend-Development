import type { MouseEvent } from 'react';

const SELLER_KEY = 'dashboard-sidebar-scroll';
const ADMIN_KEY = 'admin-sidebar-scroll';

export function saveSidebarScroll(nav: HTMLElement | null, scope: 'seller' | 'admin') {
  if (!nav) return;
  const top = nav.scrollTop;
  sessionStorage.setItem(scope === 'seller' ? SELLER_KEY : ADMIN_KEY, String(top));
}

export function readSidebarScroll(scope: 'seller' | 'admin'): number | null {
  const raw = sessionStorage.getItem(scope === 'seller' ? SELLER_KEY : ADMIN_KEY);
  if (raw == null) return null;
  const top = Number(raw);
  return Number.isFinite(top) ? top : null;
}

export function restoreSidebarScroll(nav: HTMLElement | null, scope: 'seller' | 'admin') {
  if (!nav) return;
  const saved = readSidebarScroll(scope);
  if (saved == null) return;
  nav.scrollTop = saved;
}

export function restoreSidebarScrollRepeated(nav: HTMLElement | null, scope: 'seller' | 'admin') {
  if (!nav) return;
  const apply = () => restoreSidebarScroll(nav, scope);
  apply();
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
}

export function handleSidebarNavMouseDown(
  e: MouseEvent<HTMLElement>,
  nav: HTMLElement | null,
  scope: 'seller' | 'admin',
) {
  if (e.button !== 0) return;
  saveSidebarScroll(nav, scope);
  e.preventDefault();
}
