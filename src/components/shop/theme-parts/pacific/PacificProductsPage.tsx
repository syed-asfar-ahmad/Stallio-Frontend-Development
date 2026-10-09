import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, SlidersHorizontal, X, Sparkles, Sprout, ArrowRight } from 'lucide-react';
import type { Product, Shop } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedProductName } from '../../../../lib/shopContentLanguages';
import ProductCard from '../ProductCard';
import ShopSelect from '../../ShopSelect';
import ShopPagination from '../../ShopPagination';
import { SHOP_LIST_PAGE_SIZE } from '../../../../lib/shopPagination';
import { PacificPillTag, PacificEditorialHeader } from './PacificParts';

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

export default function PacificProductsPage({ shop, products, username, containerClass }: Props) {
  const { t, lang, categoryName } = useShopLanguage();
  const sortOptions = useMemo(
    () => SORT_KEYS.map((value) => ({ value, label: t(SORT_LABEL_KEYS[value]) })),
    [t],
  );
  const visibleAll = useMemo(() => products.filter((p) => p.isVisible !== false), [products]);

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    visibleAll.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
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

  useEffect(() => {
    setPage(1);
  }, [search, sort, activeCategory]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const displayed = filteredSorted.slice(
    (safePage - 1) * SHOP_LIST_PAGE_SIZE,
    safePage * SHOP_LIST_PAGE_SIZE,
  );
  const trimmedSearch = search.trim();

  const getCatLabel = (slug: string) => {
    const c = shop.categories?.find((x) => x.slug === slug);
    return c ? categoryName(c) : slug;
  };

  return (
    <main className={`${containerClass} flex-1 pb-16 pt-8 lg:pb-28 lg:pt-14`}>
      {/* Editorial Catalog Heading */}
      <PacificEditorialHeader
        tag="The Complete Harvest"
        tagIcon={Sprout}
        title={t('productsPageTitle') || 'Artisanal Provisions & Pantry'}
        body={t('productsPageBody') || 'Explore our full seasonal range of certified organic produce, cold-pressed elixirs, and handcrafted provisions.'}
      />

      {visibleAll.length === 0 ? (
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-[var(--theme-radius-card)] border border-dashed p-12 text-center"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }}
          >
            <ShoppingBag className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-base font-semibold text-theme-text">{t('productsEmpty')}</p>
          <p className="text-sm text-theme-text-muted">{t('productsEmptyBody')}</p>
          <Link
            to={`/${username}`}
            className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline shadow-sm"
            style={{ background: 'var(--theme-primary)' }}
          >
            {t('productsBackHome')}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Discovery Control Bar: Search & Category Chips */}
          <div className="space-y-4">
            {/* Search Capsule */}
            <div className="relative mx-auto max-w-2xl">
              <Search
                className="pointer-events-none absolute start-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-theme-text-muted"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('productsSearchPh') || 'Search heirloom provisions, cold harvests, oils...'}
                aria-label={t('productsSearchAria')}
                className="h-14 w-full rounded-full border border-theme-border bg-theme-surface ps-13 pe-12 text-[15px] text-theme-text shadow-[var(--theme-shadow-card)] transition-all placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
                style={{ paddingInlineStart: '3.25rem' }}
              />
              {trimmedSearch && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={t('productsClearSearch')}
                  className="absolute end-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-theme-text-muted hover:bg-theme-surface-secondary transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            {/* Category Filter Pills Strip */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="rounded-full px-4 py-2 text-xs font-bold transition-all"
                  style={
                    activeCategory === null
                      ? {
                          background: 'var(--theme-primary)',
                          color: 'var(--theme-primary-contrast)',
                          boxShadow: 'var(--theme-shadow-card)',
                        }
                      : {
                          background: 'var(--theme-surface)',
                          color: 'var(--theme-text-secondary)',
                          border: '1px solid var(--theme-border)',
                        }
                  }
                >
                  {t('categoryAll') || 'All Harvests'} ({visibleAll.length})
                </button>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const catCount = visibleAll.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(isActive ? null : cat)}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all"
                      style={
                        isActive
                          ? {
                              background: 'var(--theme-primary)',
                              color: 'var(--theme-primary-contrast)',
                              boxShadow: 'var(--theme-shadow-card)',
                            }
                          : {
                              background: 'var(--theme-surface)',
                              color: 'var(--theme-text-secondary)',
                              border: '1px solid var(--theme-border)',
                            }
                      }
                    >
                      <span>{getCatLabel(cat)}</span>
                      <span className="text-[10px] opacity-75">({catCount})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Results Metadata & Sort Toolbar */}
          <div className="flex items-center justify-between gap-4 border-b border-theme-border pb-4 pt-4">
            <div className="text-xs sm:text-sm font-medium text-theme-text-muted">
              {trimmedSearch ? (
                <span>
                  {filteredSorted.length === 1
                    ? t('productsSearchResultsOne', { query: trimmedSearch, count: filteredSorted.length })
                    : t('productsSearchResultsMany', { query: trimmedSearch, count: filteredSorted.length })}
                </span>
              ) : (
                <span>
                  {filteredSorted.length === 1
                    ? t('productsCountOne', { count: filteredSorted.length })
                    : t('productsCountMany', { count: filteredSorted.length })}
                </span>
              )}
            </div>

            {/* Custom styled select */}
            <div className="shrink-0">
              <ShopSelect
                id="pacific-sort-products"
                label={t('productsSort')}
                hideLabel
                buttonClassName="h-10 rounded-full border border-theme-border bg-theme-surface px-4 text-xs font-semibold text-theme-text shadow-sm hover:border-theme-primary transition-all"
                options={sortOptions}
                value={sort}
                onChange={(val) => setSort(val as SortKey)}
                isOpen={sortOpen}
                onToggle={() => setSortOpen((o) => !o)}
              />
            </div>
          </div>

          {/* Product Grid */}
          {filteredSorted.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 rounded-[var(--theme-radius-card)] border border-dashed p-12 text-center"
              style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
            >
              <ShoppingBag className="h-8 w-8 text-theme-text-muted opacity-40" />
              <p className="text-sm font-semibold text-theme-text">{t('productsNoMatch')}</p>
              <p className="text-xs text-theme-text-muted">{t('productsNoMatchBody')}</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCategory(null);
                }}
                className="mt-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"
                style={{ background: 'var(--theme-primary)' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                className="mt-14 lg:mt-20"
                page={safePage}
                total={filteredSorted.length}
                pageSize={SHOP_LIST_PAGE_SIZE}
                onPage={setPage}
              />
            </>
          )}
        </div>
      )}
    </main>
  );
}
