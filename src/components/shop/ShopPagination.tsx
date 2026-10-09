import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { scrollOnPaginationChange } from '../../lib/scrollDashboardMainToTop';

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  className?: string;
};

function pageItems(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);
  if (left > 2) items.push('ellipsis');
  for (let p = left; p <= right; p++) items.push(p);
  if (right < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);
  return items;
}

export default function ShopPagination({ page, total, pageSize, onPage, className = '' }: Props) {
  const { t } = useShopLanguage();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const pages = pageItems(page, totalPages);

  function changePage(next: number) {
    if (next === page) return;
    onPage(next);
    scrollOnPaginationChange();
  }

  return (
    <nav
      className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`.trim()}
      aria-label={t('paginationAria')}
    >
      {/* Count info */}
      <p className="text-xs tabular-nums" style={{ color: 'var(--theme-text-muted)' }}>
        {t('paginationShowing', { start: rangeStart, end: rangeEnd, total })}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => changePage(page - 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--theme-radius-btn)] border px-3 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }}
          aria-label={t('paginationPrevAria')}
        >
          <ChevronLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
          <span className="hidden sm:inline">{t('paginationPrevious')}</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => changePage(item)}
                aria-current={item === page ? 'page' : undefined}
                className="min-w-[2.25rem] rounded-full px-2.5 py-1.5 text-sm font-semibold tabular-nums transition-all"
                style={
                  item === page
                    ? { background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }
                    : { color: 'var(--theme-text-primary)' }
                }
              >
                {item}
              </button>
            ),
          )}
        </div>

        {/* Mobile page indicator */}
        <span className="px-2 text-sm tabular-nums sm:hidden" style={{ color: 'var(--theme-text-muted)' }}>
          {t('paginationPageOf', { page, total: totalPages })}
        </span>

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => changePage(page + 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--theme-radius-btn)] border px-3 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }}
          aria-label={t('paginationNextAria')}
        >
          <span className="hidden sm:inline">{t('paginationNext')}</span>
          <ChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
