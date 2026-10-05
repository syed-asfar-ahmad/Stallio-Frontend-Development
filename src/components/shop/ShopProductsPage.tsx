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
import { useStorefrontTheme } from '../../themes';
import { CocoaHeading } from './theme-parts/cocoa/CocoaParts';

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
  const { t, lang, categoryName } = useShopLanguage();
  const { layout } = useStorefrontTheme();
  const sortOptions = useMemo(
    () => SORT_KEYS.map((value) => ({ value, label: t(SORT_LABEL_KEYS[value]) })),
    [t],
  );
  const visibleAll = useMemo(() => products.filter((p) => p.isVisible !== false), [products]);

  // Unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    visibleAll.forEach((p) => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [visibleAll]);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredSorted = useMemo(() => {
    let filtered = visibleAll.filter((p) => matchesSearch(p, search));
    if (activeCategory) filtered = filtered.filter((p) => p.category === activeCategory);
    return sortProducts(filtered, sort, lang);
  }, [visibleAll, search, sort, lang, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / SHOP_LIST_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => { setPage(1); }, [search, sort, activeCategory]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const displayed = filteredSorted.slice(
    (safePage - 1) * SHOP_LIST_PAGE_SIZE,
    safePage * SHOP_LIST_PAGE_SIZE,
  );
  const trimmedSearch = search.trim();

  // Determine grid columns from layout (default 4 for modern-minimal feel)
  const gridClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  if (layout.productsPageVariant === 'cocoa-catalog') {
    const catLabel = (slug: string) => {
      const c = shop.categories?.find((x) => x.slug === slug);
      return c ? categoryName(c) : slug;
    };
    const cocoaGrid =
      layout.productGridColumns === 4
        ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
        : layout.productGridColumns === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 lg:grid-cols-3';
    const chip = (on: boolean): React.CSSProperties =>
      on
        ? { background: 'var(--theme-secondary)', color: 'var(--theme-bg)', borderColor: 'var(--theme-secondary)' }
        : { background: 'var(--theme-surface)', color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' };

    return (
      <main className={`${containerClass} flex-1 pb-16 pt-10 lg:pb-28 lg:pt-16`}>
        <CocoaHeading as="h1" title={t('productsPageTitle')} body={t('productsPageBody')} className="!mb-7 lg:!mb-9" />

        {visibleAll.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
            >
              <ShoppingBag className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('productsEmpty')}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('productsEmptyBody')}</p>
            </div>
            <Link
              to={`/${username}`}
              className="rounded-[var(--theme-radius-btn)] px-6 py-2.5 text-sm font-semibold no-underline"
              style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
            >
              {t('productsBackHome')}
            </Link>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative mx-auto max-w-2xl">
              <Search
                className="pointer-events-none absolute start-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                style={{ color: 'var(--theme-text-muted)' }}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('productsSearchPh')}
                aria-label={t('productsSearchAria')}
                className="h-14 w-full rounded-2xl border ps-13 pe-12 text-[15px] shadow-[var(--theme-shadow-card)] transition-shadow placeholder:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
                style={{
                  paddingInlineStart: '3.25rem',
                  borderColor: 'var(--theme-border)',
                  background: 'var(--theme-surface)',
                  color: 'var(--theme-text-primary)',
                }}
              />
              {trimmedSearch && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={t('productsClearSearch')}
                  className="absolute end-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-[var(--theme-surface-secondary)]"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  aria-pressed={activeCategory === null}
                  className="rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                  style={chip(activeCategory === null)}
                >
                  {t('categoryAll')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    aria-pressed={activeCategory === cat}
                    className="rounded-full border px-4 py-2 text-xs font-semibold capitalize transition-colors"
                    style={chip(activeCategory === cat)}
                  >
                    {catLabel(cat)}
                  </button>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div
              className={`relative mb-8 mt-10 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between ${sortOpen ? 'z-40 isolate' : 'z-0'}`}
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }} aria-live="polite">
                {trimmedSearch && filteredSorted.length === 0
                  ? t('productsNoResults', { query: trimmedSearch })
                  : t('showingCount', { shown: displayed.length, total: filteredSorted.length })}
              </p>
              <div className="flex items-center gap-2.5">
                <span className="hidden items-center gap-1.5 text-xs font-medium sm:inline-flex" style={{ color: 'var(--theme-text-muted)' }}>
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  {t('productsSort')}
                </span>
                <ShopSelect
                  value={sort}
                  onChange={(v) => setSort(v as SortKey)}
                  onOpenChange={setSortOpen}
                  options={sortOptions}
                  aria-label={t('productsSortAria')}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>

            {filteredSorted.length === 0 ? (
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-14 text-center">
                <p className="text-lg font-semibold" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}>
                  {t('productsNoMatchTitle')}
                </p>
                <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('productsNoMatchBody')}</p>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSort('newest'); setActiveCategory(null); }}
                  className="mt-2 rounded-[var(--theme-radius-btn)] px-6 py-2.5 text-sm font-semibold"
                  style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
                >
                  {t('productsReset')}
                </button>
              </div>
            ) : (
              <>
                <div className={`relative z-0 grid ${cocoaGrid} gap-x-4 gap-y-10 lg:gap-x-5 lg:gap-y-14`}>
                  {displayed.map((p) => (
                    <ProductCard key={p.id} product={p} shopUsername={username} currency={shop.currency} linkState={{ from: 'products' }} />
                  ))}
                </div>
                <ShopPagination
                  className="mt-14 lg:mt-20"
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

  return (
    <main className={`${containerClass} flex-1 pb-10 pt-5 lg:pb-16 lg:pt-8`}>

      {/* ── Page header ── */}
      <div className="mb-6 flex flex-col gap-1 lg:mb-8">
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-bold tracking-tight lg:text-3xl"
            style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading, inherit)' }}
          >
            {t('productsPageTitle')}
          </h1>
          {visibleAll.length > 0 && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
            >
              {visibleAll.length}
            </span>
          )}
        </div>
        <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('productsPageBody')}</p>
      </div>

      {visibleAll.length === 0 ? (
        /* ── Empty state ── */
        <div
          className="flex flex-col items-center gap-4 rounded-[var(--theme-radius-card)] border border-dashed px-6 py-16 text-center"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-[var(--theme-radius-card)]"
            style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
          >
            <ShoppingBag className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <p className="text-base font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('productsEmpty')}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('productsEmptyBody')}</p>
          </div>
          <Link
            to={`/${username}`}
            className="mt-1 inline-flex items-center gap-2 rounded-[var(--theme-radius-btn)] border px-5 py-2.5 text-sm font-semibold no-underline transition-colors hover:bg-[var(--theme-primary-light)]"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
          >
            {t('productsBackHome')}
          </Link>
        </div>
      ) : (
        <>
          {/* ── Filter & Search bar ── */}
          <div
            className={`relative mb-5 rounded-[var(--theme-radius-card)] border bg-[var(--theme-surface)] p-3.5 shadow-[var(--theme-shadow-card)] lg:mb-7 lg:p-4 ${sortOpen ? 'z-40 isolate' : 'z-0'}`}
            style={{ borderColor: 'var(--theme-border)' }}
          >
            {/* Category pills row */}
            {categories.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
                  style={
                    activeCategory === null
                      ? { background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }
                      : { background: 'var(--theme-surface-secondary)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }
                  }
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className="rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all"
                    style={
                      activeCategory === cat
                        ? { background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }
                        : { background: 'var(--theme-surface-secondary)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Search + Sort row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--theme-text-muted)' }}
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('productsSearchPh')}
                  aria-label={t('productsSearchAria')}
                  className="w-full rounded-[var(--theme-radius-input)] border-2 py-2.5 ps-10 pe-10 text-sm font-medium placeholder:opacity-60 focus:outline-none focus:ring-2 lg:py-3"
                  style={{
                    borderColor: 'var(--theme-border)',
                    background: 'var(--theme-surface-secondary)',
                    color: 'var(--theme-text-primary)',
                    '--tw-ring-color': 'var(--theme-primary)',
                  } as React.CSSProperties}
                />
                {trimmedSearch && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute end-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-[var(--theme-surface)]"
                    aria-label={t('productsClearSearch')}
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wide sm:inline-flex"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  {t('productsSort')}
                </span>
                <ShopSelect
                  value={sort}
                  onChange={(v) => setSort(v as SortKey)}
                  onOpenChange={setSortOpen}
                  options={sortOptions}
                  aria-label={t('productsSortAria')}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>

            {/* Results count */}
            {trimmedSearch && (
              <p className="mt-3 border-t pt-2.5 text-xs font-medium" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                {filteredSorted.length === 0
                  ? t('productsNoResults', { query: trimmedSearch })
                  : filteredSorted.length === 1
                  ? t('productsMatchOne', { shown: 1, total: filteredSorted.length })
                  : t('productsMatchMany', { shown: filteredSorted.length, total: filteredSorted.length })}
              </p>
            )}
          </div>

          {/* Results count bar */}
          {!trimmedSearch && filteredSorted.length > 0 && (
            <p className="mb-3 text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
              Showing {displayed.length} of {filteredSorted.length} products
            </p>
          )}

          {/* ── Products grid or no-match state ── */}
          {filteredSorted.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 rounded-[var(--theme-radius-card)] border border-dashed px-4 py-12 text-center"
              style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('productsNoMatchTitle')}</p>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{t('productsNoMatchBody')}</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setSort('newest'); setActiveCategory(null); }}
                className="mt-1 rounded-[var(--theme-radius-btn)] border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--theme-primary-light)]"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
              >
                {t('productsReset')}
              </button>
            </div>
          ) : (
            <>
              <div className={`relative z-0 grid ${gridClass} gap-3 lg:gap-5`}>
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
                className="mt-8 lg:mt-12"
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
