export function attachBlockNumberInputWheel(): () => void {
  const handler = (e: WheelEvent) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement && el.type === 'number' && document.activeElement === el)) return;
    e.preventDefault();
    let parent = el.parentElement;
    while (parent) {
      const { overflowY } = getComputedStyle(parent);
      if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
        parent.scrollTop += e.deltaY;
        return;
      }
      parent = parent.parentElement;
    }
  };
  document.addEventListener('wheel', handler, { passive: false, capture: true });
  return () => document.removeEventListener('wheel', handler, { capture: true });
}
