export const DASHBOARD_MAIN_SCROLL_ID = 'dashboard-main-scroll';

function runScrollToTop(target: Element | Window, behavior: ScrollBehavior) {
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      target.scrollTo({ top: 0, left: 0, behavior });
    });
  });
}

export function scrollDashboardMainToTop(options: { behavior?: ScrollBehavior } = {}) {
  const behavior = options.behavior ?? 'smooth';
  const el = document.getElementById(DASHBOARD_MAIN_SCROLL_ID);
  if (el) runScrollToTop(el, behavior);
}

export function scrollOnPaginationChange(options: { behavior?: ScrollBehavior } = {}) {
  const behavior = options.behavior ?? 'smooth';
  const main = document.getElementById(DASHBOARD_MAIN_SCROLL_ID);
  if (main) {
    runScrollToTop(main, behavior);
    return;
  }
  runScrollToTop(window, behavior);
}
