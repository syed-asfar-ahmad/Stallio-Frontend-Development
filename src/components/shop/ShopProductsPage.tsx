import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import type { Product, Shop } from '../../types';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { getLocalizedProductName } from '../../lib/shopContentLanguages';
import ProductCard from './theme-parts/ProductCard';
import ShopSelect from './ShopSelect';
import ShopPagination from './ShopPagination';
import { SHOP_LIST_PAGE_SIZE } from '../../lib/shopPagination';

type SortKey =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'oldest'
  | 'featured';

const SORT_KEYS = [
  'name-asc',
  'name-desc',
  'price-asc',
  'price-desc',
  'newest',
  'oldest',
  'featured',
] as const satisfies readonly SortKey[];

const SORT_LABEL_KEYS: Record<SortKey, 'sortNameAsc' | 'sortNameDesc' | 'sortPriceAsc' | 'sortPriceDesc' | 'sortNewest' | 'sortOldest' | 'sortFeatured'> = {
  'name-asc': 'sortNameAsc',
  'name-desc': 'sortNameDesc',
  'price-asc': 'sortPriceAsc',
  'price-desc': 'sortPriceDesc',
  newest: 'sortNewest',
  oldest: 'sortOldest',
  featured: 'sortFeatured',
};

function productCreatedAt(p: Product): number {
  const raw = p.createdAt;
  if (raw == null) return 0;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const t = Date.parse(raw);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

function compareByCreatedAt(a: Product, b: Product, direction: 'newest' | 'oldest'): number {
  const diff = productCreatedAt(a) - productCreatedAt(b);
  if (diff !== 0) return direction === 'newest' ? -diff : diff;
  return direction === 'newest' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
}

function sortProducts(list: Product[], sort: SortKey, lang: Parameters<typeof getLocalizedProductName>[1]): Product[] {
  const copy = [...list];
  const nameOf = (p: Product) => getLocalizedProductName(p, lang);
  switch (sort) {
    case 'name-asc':
      copy.sort((a, b) => nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: 'base' }));
      break;
    case 'name-desc':
      copy.sort((a, b) => nameOf(b).localeCompare(nameOf(a), undefined, { sensitivity: 'base' }));
      break;
    case 'price-asc':
      copy.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      break;
    case 'price-desc':
      copy.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      break;
    case 'newest':
      copy.sort((a, b) => compareByCreatedAt(a, b, 'newest'));
      break;
    case 'oldest':
      copy.sort((a, b) => compareByCreatedAt(a, b, 'oldest'));
      break;
    case 'featured':
      copy.sort((a, b) => {
        const af = a.isFeatured ? 1 : 0;
        const bf = b.isFeatured ? 1 : 0;
        if (bf !== af) return bf - af;
        return nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: 'base' });
      });
      break;
    default:
      break;
  }
  return copy;
}

function matchesSearch(p: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [p.name, p.nameEs, p.nameAr, p.description, p.descriptionEs, p.descriptionAr, p.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

type Props = {
  shop: Shop;
  products: Product[];
  username: string;
  containerClass: string;
};

export default function ShopProductsPage({ shop, products, username, containerClass }: Props) {
  const { t, lang } = useShopLanguage();
  const sortOptions = useMemo(
    () => SORT_KEYS.map((value) => ({ value, label: t(SORT_LABEL_KEYS[value]) })),
    [t],
  );
  const visibleAll = useMemo(() => products.filter((p) => p.isVisible !== false), [products]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filteredSorted = useMemo(() => {
    const filtered = visibleAll.filter((p) => matchesSearch(p, search));
    return sortProducts(filtered, sort, lang);
  }, [visibleAll, search, sort, lang]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / SHOP_LIST_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const displayed = filteredSorted.slice(
    (safePage - 1) * SHOP_LIST_PAGE_SIZE,
    safePage * SHOP_LIST_PAGE_SIZE,
  );
  const trimmedSearch = search.trim();

  return (
    <main className={`${containerClass} flex-1 pb-8 pt-4 max-lg:pb-8 max-lg:pt-4 lg:pb-14 lg:pt-7`}>
      <div className="mb-4 max-lg:mb-4 lg:mb-8">
        <h1 className="text-lg max-lg:leading-snug font-bold tracking-tight text-stone-900 dark:text-zinc-100 lg:text-2xl">
          {t('productsPageTitle')}
        </h1>
        <p className="mt-0.5 max-lg:mt-0.5 text-xs max-lg:text-xs text-stone-500 dark:text-zinc-400 lg:mt-1 lg:text-sm">
          {t('productsPageBody')}
        </p>
      </div>

      {visibleAll.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 max-lg:px-4 max-lg:py-10 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900 lg:px-6 lg:py-14">
          <span className="mx-auto flex h-12 w-12 max-lg:h-12 max-lg:w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/50 dark:text-brand-400 dark:ring-brand-800/60 lg:h-14 lg:w-14">
            <ShoppingBag className="h-6 w-6 max-lg:h-6 max-lg:w-6 lg:h-7 lg:w-7" aria-hidden />
          </span>
          <p className="mt-3 max-lg:mt-3 text-sm max-lg:text-sm font-semibold text-stone-800 dark:text-zinc-100 lg:mt-4">
            {t('productsEmpty')}
          </p>
          <p className="mt-1 text-xs max-lg:text-xs text-stone-500 dark:text-zinc-400 lg:text-sm">{t('productsEmptyBody')}</p>
          <Link
            to={`/${username}`}
            className="mt-5 max-lg:mt-5 inline-flex w-full max-lg:w-full items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 no-underline hover:bg-brand-50 dark:border-brand-700/50 dark:bg-zinc-900 dark:text-brand-300 dark:hover:bg-brand-950/40 lg:mt-6 lg:w-auto"
          >
            {t('productsBackHome')}
          </Link>
        </div>
      ) : (
        <>
          <div
            className={`relative mb-4 max-lg:mb-4 overflow-visible rounded-2xl border border-stone-200/90 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 lg:mb-6 lg:p-4 ${
              sortOpen ? 'z-40 isolate' : 'z-0'
            }`}
          >
            <div className="flex flex-col gap-3 max-lg:gap-3 lg:flex-row lg:items-center lg:gap-4">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 max-lg:start-3 lg:start-3.5 dark:text-zinc-500"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('productsSearchPh')}
                  aria-label={t('productsSearchAria')}
                  className="w-full rounded-xl border-2 border-stone-200 bg-stone-50/40 py-2.5 ps-9 pe-9 text-sm font-medium text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-brand-600/60 dark:focus:bg-zinc-950 dark:focus:ring-brand-500/25 max-lg:py-2.5 lg:ps-10 lg:pe-10 lg:py-3"
                />
                {trimmedSearch ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={t('productsClearSearch')}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </div>
              <div className="flex w-full min-w-0 shrink-0 flex-col gap-1.5 max-lg:w-full lg:w-auto lg:flex-row lg:items-center lg:gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-500 lg:text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t('productsSort')}
                </span>
                <ShopSelect
                  value={sort}
                  onChange={(v) => setSort(v as SortKey)}
                  onOpenChange={setSortOpen}
                  options={sortOptions}
                  aria-label={t('productsSortAria')}
                  className="w-full min-w-0 lg:w-auto"
                />
              </div>
            </div>
            {trimmedSearch ? (
              <p className="mt-2.5 max-lg:mt-2.5 border-t border-stone-100 pt-2.5 text-[11px] max-lg:text-[11px] font-medium leading-relaxed text-stone-500 dark:border-zinc-800 dark:text-zinc-400 lg:mt-3 lg:pt-3 lg:text-xs">
                {filteredSorted.length === 0 ? (
                  t('productsNoResults', { query: trimmedSearch })
                ) : filteredSorted.length === 1 ? (
                  t('productsMatchOne', {
                    shown: 1,
                    total: filteredSorted.length,
                  })
                ) : (
                  t('productsMatchMany', {
                    shown: filteredSorted.length,
                    total: filteredSorted.length,
                  })
                )}
              </p>
            ) : null}
          </div>

          {filteredSorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 max-lg:px-4 max-lg:py-10 text-center dark:border-zinc-700 dark:bg-zinc-900 lg:px-6 lg:py-12">
              <p className="text-sm max-lg:text-sm font-semibold text-stone-800 dark:text-zinc-100 lg:text-base">
                {t('productsNoMatchTitle')}
              </p>
              <p className="mt-1 text-xs max-lg:text-xs text-stone-500 dark:text-zinc-400 lg:text-sm">{t('productsNoMatchBody')}</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSort('newest');
                }}
                className="mt-4 max-lg:mt-4 inline-flex w-full max-lg:w-full items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 dark:border-brand-700/50 dark:bg-zinc-900 dark:text-brand-300 dark:hover:bg-brand-950/40 lg:mt-5 lg:w-auto"
              >
                {t('productsReset')}
              </button>
            </div>
          ) : (
            <>
              <div className="relative z-0 grid grid-cols-2 gap-2.5 max-lg:gap-2.5 lg:gap-5 xl:grid-cols-4">
                {displayed.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    shopUsername={username}
                    currency={shop.currency}
                    linkState={{ from: 'products' }}
                  />
                ))}
              </div>

              <ShopPagination
                className="mt-6 max-lg:mt-6 lg:mt-10"
                page={safePage}
                total={filteredSorted.length}
                pageSize={SHOP_LIST_PAGE_SIZE}
                onPage={setPage}
              />
            </>
          )}
        </>
      )}
    </main>
  );
}
