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

const btnBase =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40 max-lg:py-2.5';
const btnEnabled =
  'border-stone-200 bg-white text-stone-700 hover:border-brand-300 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40';

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
      className={`flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-white px-3 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:gap-3 max-lg:px-3 max-lg:py-3 sm:flex-row sm:items-center sm:justify-between lg:px-4 lg:py-3.5 ${className}`.trim()}
      aria-label={t('paginationAria')}
    >
      <p className="text-center text-xs tabular-nums text-stone-600 dark:text-zinc-400 max-lg:text-center sm:text-start lg:text-sm">
        {t('paginationShowing', { start: rangeStart, end: rangeEnd, total })}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 max-lg:grid max-lg:w-full max-lg:grid-cols-[1fr_auto_1fr] max-lg:gap-2 sm:justify-end">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => changePage(page - 1)}
          className={`${btnBase} max-lg:justify-center ${btnEnabled}`}
          aria-label={t('paginationPrevAria')}
        >
          <ChevronLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
          {t('paginationPrevious')}
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-sm font-medium text-stone-400 dark:text-zinc-500">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => changePage(item)}
                aria-current={item === page ? 'page' : undefined}
                className={`min-w-[2.25rem] rounded-xl px-2.5 py-2 text-sm font-semibold tabular-nums transition-colors ${
                  item === page
                    ? 'bg-gradient-to-r from-brand-600 to-brand-600 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <span className="justify-self-center px-2 text-sm font-medium tabular-nums text-stone-500 dark:text-zinc-400 sm:hidden">
          {t('paginationPageOf', { page, total: totalPages })}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => changePage(page + 1)}
          className={`${btnBase} max-lg:justify-self-end max-lg:justify-center ${btnEnabled}`}
          aria-label={t('paginationNextAria')}
        >
          {t('paginationNext')}
          <ChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
