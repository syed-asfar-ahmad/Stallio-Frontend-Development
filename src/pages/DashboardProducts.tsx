import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth, getStoredToken } from '../context/AuthContext';
import { formatPrice } from '../lib/countryCurrencyOptions';
import ProductForm from '../components/ProductForm';
import ProductViewDialog from '../components/ProductViewDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import DashboardBulkSelectBar from '../components/DashboardBulkSelectBar';
import BulkItemCheckbox from '../components/BulkItemCheckbox';
import DashboardLayout from '../components/DashboardLayout';
import DashboardLoading from '../components/DashboardLoading';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useCloseOnOutsideClick } from '../hooks/useCloseOnOutsideClick';
import { useSellerContentLanguages, useSellerMultilingualEnabled } from '../hooks/useSellerContentLanguages';
import { SHOP_CONTENT_LANGUAGES, productHasTranslation } from '../lib/shopContentLanguages';
import type { Product } from '../types';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  ListFilter,
  ArrowDownAZ,
  RotateCcw,
  Star,
} from 'lucide-react';
import { scrollOnPaginationChange } from '../lib/scrollDashboardMainToTop';
import { PRODUCT_CARD_ASPECT_CLASS, PRODUCT_IMAGE_FRAME_CLASS } from '../lib/imageCropViewports';
import { DASHBOARD_SEARCH_INPUT, DASHBOARD_FILTER_SELECT } from '../lib/dashboardFormClasses';
import ProductImage from '../components/ProductImage';
import { getSellerPlanLimits } from '../lib/sellerPlanLimits';

const PAGE_SIZE = 15;
const CATEGORY_UNCATEGORIZED = '__uncategorized__';

type SortKey = 'default' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

export default function DashboardProducts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = useMemo(
    () => SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id)),
    [contentLanguages],
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const bulk = useBulkSelection();
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const sortFilterRef = useRef<HTMLDivElement>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(sortDropdownOpen, () => setSortDropdownOpen(false), sortFilterRef);
  useCloseOnOutsideClick(categoryDropdownOpen, () => setCategoryDropdownOpen(false), categoryFilterRef);

  const categoriesEnabled = Boolean(user?.categoriesEnabled && user?.categories && user.categories.length > 0);
  const shopCategories = user?.categories ?? [];
  const planLimits = getSellerPlanLimits(user?.plan);
  const productLimitReached = products.length >= planLimits.maxProducts;

  function handleAddProductClick() {
    if (productLimitReached) {
      toast.error(t('dashboard.products.planLimitBody', { max: planLimits.maxProducts }));
      return;
    }
    setEditing(null);
    setShowForm(true);
  }

  const SORT_OPTIONS = useMemo(
    () =>
      (
        [
          ['default', 'dashboard.products.sortDefault'],
          ['price-low', 'dashboard.products.sortPriceLow'],
          ['price-high', 'dashboard.products.sortPriceHigh'],
          ['name-asc', 'dashboard.products.sortNameAsc'],
          ['name-desc', 'dashboard.products.sortNameDesc'],
        ] as const
      ).map(([value, key]) => ({ value: value as SortKey, label: t(key) })),
    [t]
  );

  const categorySelectLabel = () => {
    if (!categoryFilter) return t('dashboard.products.allCategories');
    if (categoryFilter === CATEGORY_UNCATEGORIZED) return t('dashboard.products.uncategorized');
    return shopCategories.find((c) => c.slug === categoryFilter)?.name ?? t('dashboard.products.categoryFallback');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || sortKey !== 'default' || categoryFilter !== '';

  function clearAllFilters() {
    setSearchQuery('');
    setSortKey('default');
    setCategoryFilter('');
    setSortDropdownOpen(false);
    setCategoryDropdownOpen(false);
  }

  function closeFiltersPanel() {
    setFiltersOpen(false);
    setSortDropdownOpen(false);
    setCategoryDropdownOpen(false);
  }

  async function load() {
    const token = getStoredToken();
    if (!token) return;
    try {
      const data = await api<Product[]>('/api/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q) {
        const hay = [p.name, p.nameEs, p.nameAr, p.description, p.descriptionEs, p.descriptionAr]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (!categoryFilter) return true;
      if (categoryFilter === CATEGORY_UNCATEGORIZED) return !String(p.category ?? '').trim();
      return String(p.category ?? '').trim() === categoryFilter;
    });
    if (sortKey === 'price-low') list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortKey === 'price-high') list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortKey === 'name-asc') list = [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' }));
    else if (sortKey === 'name-desc') list = [...list].sort((a, b) => (b.name ?? '').localeCompare(a.name ?? '', undefined, { sensitivity: 'base' }));
    return list;
  }, [products, searchQuery, sortKey, categoryFilter]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const pageIndex = Math.min(page, totalPages - 1);
  const pageProducts = useMemo(
    () => filteredProducts.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE),
    [filteredProducts, pageIndex]
  );
  const rangeStart = totalProducts === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const rangeEnd = totalProducts === 0 ? 0 : Math.min((pageIndex + 1) * PAGE_SIZE, totalProducts);
  const selectableIds = useMemo(() => filteredProducts.map((p) => p.id), [filteredProducts]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, sortKey, categoryFilter]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredProducts.length / PAGE_SIZE) - 1);
    setPage((p) => Math.min(p, maxPage));
  }, [filteredProducts.length]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api(`/api/products?id=${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      toast.success(t('dashboard.products.toastDeleted'));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteSelected() {
    const ids = Array.from(bulk.selectedIds);
    if (ids.length === 0) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => api(`/api/products?id=${id}`, { method: 'DELETE' }))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      const succeeded = ids.length - failed;
      setProducts((prev) => prev.filter((p) => !bulk.selectedIds.has(p.id)));
      bulk.exitSelectionMode();
      setBulkDeleteOpen(false);
      if (succeeded > 0) {
        toast.success(t('dashboard.common.toastDeletedSelected', { count: succeeded }));
      }
      if (failed > 0) {
        const firstErr = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
        toast.error(firstErr?.reason instanceof Error ? firstErr.reason.message : t('dashboard.notifications.loadError'));
      }
    } finally {
      setBulkDeleting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 mb-0.5 max-lg:mb-0.5 lg:mb-1">
          <Package className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">{t('dashboard.products.section')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">{t('dashboard.products.title')}</h1>
        <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">{t('dashboard.products.subtitle')}</p>
        <div className="mt-3 flex flex-col gap-2.5 min-w-0 lg:hidden">
          <button
            type="button"
            onClick={handleAddProductClick}
            disabled={bulk.selectionMode || productLimitReached}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {t('dashboard.products.addProduct')}
          </button>
          <p className={`text-xs ${productLimitReached ? 'text-red-500 dark:text-red-400 font-medium' : 'text-stone-500 dark:text-zinc-500'}`}>
            {productLimitReached
              ? t('dashboard.products.planLimitBody', { max: planLimits.maxProducts })
              : t('dashboard.products.planLimitUsage', { count: products.length, max: planLimits.maxProducts })}
          </p>
          {products.length > 0 && (
            bulk.selectionMode ? (
              <div className="w-full min-w-0 [&>div]:w-full [&>div]:flex [&>div]:flex-col [&>div]:gap-2 [&_button]:w-full [&_button]:justify-center">
                {filteredProducts.length > 0 && (
                  <DashboardBulkSelectBar
                    selectionMode={bulk.selectionMode}
                    onToggleSelectionMode={bulk.toggleSelectionMode}
                    selectedCount={bulk.selectedCount}
                    totalSelectable={selectableIds.length}
                    onSelectAll={() => bulk.selectAll(selectableIds)}
                    onClearSelection={bulk.clearSelection}
                    onDeleteSelected={() => setBulkDeleteOpen(true)}
                    deleteDisabled={bulkDeleting}
                  />
                )}
              </div>
            ) : (
              <div
                className={`grid min-w-0 w-full gap-2 ${filteredProducts.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}
              >
                {filteredProducts.length > 0 && (
                  <div className="min-w-0 [&_button]:flex [&_button]:h-full [&_button]:min-h-[2.75rem] [&_button]:w-full [&_button]:justify-center">
                    <DashboardBulkSelectBar
                      selectionMode={bulk.selectionMode}
                      onToggleSelectionMode={bulk.toggleSelectionMode}
                      selectedCount={bulk.selectedCount}
                      totalSelectable={selectableIds.length}
                      onSelectAll={() => bulk.selectAll(selectableIds)}
                      onClearSelection={bulk.clearSelection}
                      onDeleteSelected={() => setBulkDeleteOpen(true)}
                      deleteDisabled={bulkDeleting}
                    />
                  </div>
                )}
                <button
                  type="button"
                  aria-expanded={filtersOpen}
                  aria-label={filtersOpen ? t('dashboard.products.ariaHideFilters') : t('dashboard.products.ariaShowFilters')}
                  onClick={() => {
                    if (filtersOpen) closeFiltersPanel();
                    else {
                      setSortDropdownOpen(false);
                      setCategoryDropdownOpen(false);
                      setFiltersOpen(true);
                    }
                  }}
                  className={`inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    filtersOpen
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-950/35 dark:text-brand-400'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-brand-200 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40 shadow-sm'
                  }`}
                >
                  <ListFilter className="h-4 w-4 shrink-0" />
                  {filtersOpen ? t('dashboard.common.hideFilters') : t('dashboard.common.filters')}
                </button>
              </div>
            )
          )}
        </div>

        <div className="mt-4 hidden min-w-0 flex-wrap items-center justify-between gap-3 lg:flex">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddProductClick}
              disabled={bulk.selectionMode || productLimitReached}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/30 disabled:opacity-50"
            >
              <Plus className="h-5 w-5 shrink-0" />
              {t('dashboard.products.addProduct')}
            </button>
            <span className={`text-xs ${productLimitReached ? 'text-red-500 dark:text-red-400 font-medium' : 'text-stone-500 dark:text-zinc-500'}`}>
              {productLimitReached
                ? t('dashboard.products.planLimitBody', { max: planLimits.maxProducts })
                : t('dashboard.products.planLimitUsage', { count: products.length, max: planLimits.maxProducts })}
            </span>
            {filteredProducts.length > 0 && (
              <DashboardBulkSelectBar
                selectionMode={bulk.selectionMode}
                onToggleSelectionMode={bulk.toggleSelectionMode}
                selectedCount={bulk.selectedCount}
                totalSelectable={selectableIds.length}
                onSelectAll={() => bulk.selectAll(selectableIds)}
                onClearSelection={bulk.clearSelection}
                onDeleteSelected={() => setBulkDeleteOpen(true)}
                deleteDisabled={bulkDeleting}
              />
            )}
          </div>
          {products.length > 0 && (
            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-label={filtersOpen ? t('dashboard.products.ariaHideFilters') : t('dashboard.products.ariaShowFilters')}
              onClick={() => {
                if (filtersOpen) closeFiltersPanel();
                else {
                  setSortDropdownOpen(false);
                  setCategoryDropdownOpen(false);
                  setFiltersOpen(true);
                }
              }}
              className={`ml-auto inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 transition-colors ${
                filtersOpen
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-950/35 dark:text-brand-400'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-brand-200 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40 shadow-sm'
              }`}
            >
              <ListFilter className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold">{filtersOpen ? t('dashboard.common.hideFilters') : t('dashboard.common.filters')}</span>
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={async () => {
            await load();
            setShowForm(false);
            setEditing(null);
          }}
          currencyCode={user?.currency}
          categoriesEnabled={user?.categoriesEnabled}
          categories={user?.categories}
          catalogProducts={products.filter((p) => !editing || p.id !== editing.id)}
          maxImages={planLimits.maxImagesPerProduct}
        />
      )}

      {products.length === 0 ? (
        <div className="min-w-0 w-full max-w-full rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 p-8 max-lg:p-8 sm:max-lg:p-10 lg:p-16 text-center shadow-lg shadow-stone-200/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-500/5 pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/25">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2">{t('dashboard.products.noProductsTitle')}</h2>
            <p className="text-stone-600 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
              {t('dashboard.products.noProductsBody')}
            </p>
            <button
              type="button"
              onClick={handleAddProductClick}
              disabled={productLimitReached}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {t('dashboard.products.addProduct')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {filtersOpen && (
            <div className="mb-4 max-lg:mb-4 lg:mb-6 min-w-0 w-full max-w-full overflow-visible rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 shadow-md shadow-stone-200/30 dark:shadow-black/40 ring-1 ring-brand-500/10">
              <div className="space-y-3 max-lg:space-y-3 lg:space-y-4 overflow-visible rounded-t-xl max-lg:rounded-t-xl lg:rounded-t-2xl p-3 max-lg:p-3 sm:max-lg:p-4 lg:p-5 min-w-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500 pointer-events-none" aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dashboard.products.searchPlaceholder')}
                  autoComplete="off"
                  className={`${DASHBOARD_SEARCH_INPUT} min-w-0 py-2.5 max-lg:py-2.5 lg:py-3 pr-4 text-sm`}
                />
              </div>
              <div className="flex flex-col gap-4 overflow-visible sm:flex-row sm:flex-wrap sm:items-end">
                <div ref={sortFilterRef} className="relative z-[200] min-w-[min(100%,14rem)] flex-1 overflow-visible">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-400">{t('dashboard.products.sort')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSortDropdownOpen((o) => !o);
                      setCategoryDropdownOpen(false);
                    }}
                    className={DASHBOARD_FILTER_SELECT}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2 truncate text-left">
                      <ArrowDownAZ className="w-4 h-4 shrink-0 text-brand-500" aria-hidden />
                      {SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? t('dashboard.products.sortDefault')}
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-stone-500 dark:text-zinc-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortDropdownOpen ? (
                    <div className="absolute left-0 top-full z-[210] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-xl">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortKey(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            sortKey === opt.value ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {categoriesEnabled && (
                  <div ref={categoryFilterRef} className="relative z-[200] min-w-[min(100%,14rem)] flex-1 overflow-visible">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-zinc-400">{t('dashboard.products.category')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryDropdownOpen((o) => !o);
                        setSortDropdownOpen(false);
                      }}
                      className={DASHBOARD_FILTER_SELECT}
                    >
                      <span className="inline-flex min-w-0 items-center gap-2 truncate text-left">
                        <Package className="w-4 h-4 shrink-0 text-brand-500" aria-hidden />
                        {categorySelectLabel()}
                      </span>
                      <ChevronDown className={`w-4 h-4 shrink-0 text-stone-500 dark:text-zinc-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {categoryDropdownOpen ? (
                      <div className="absolute left-0 top-full z-[210] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter('');
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            categoryFilter === '' ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {t('dashboard.products.allCategories')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter(CATEGORY_UNCATEGORIZED);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            categoryFilter === CATEGORY_UNCATEGORIZED ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {t('dashboard.products.uncategorized')}
                        </button>
                        {shopCategories.map((c) => (
                          <button
                            key={c.slug}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(c.slug);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                              categoryFilter === c.slug ? 'bg-brand-50 dark:bg-brand-950/35 text-brand-700 dark:text-brand-400' : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              </div>

              <div className="rounded-b-xl max-lg:rounded-b-xl lg:rounded-b-2xl border-t border-stone-200/80 dark:border-zinc-600/80 bg-gradient-to-r from-stone-50/90 via-brand-50/30 to-stone-50/90 dark:from-zinc-900 dark:via-brand-950/25 dark:to-zinc-900 px-3 max-lg:px-3 sm:max-lg:px-4 lg:px-5 py-3 max-lg:py-3 lg:py-3.5">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 max-lg:py-2 lg:py-2.5 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  {t('dashboard.common.clearFilters')}
                </button>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="min-w-0 w-full max-w-full rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 p-8 max-lg:p-8 lg:p-14 text-center shadow-sm">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 mb-2">{t('dashboard.products.noMatchTitle')}</h2>
              <p className="text-stone-600 dark:text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                {t('dashboard.products.noMatchBody')}
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border-2 border-brand-200 dark:border-brand-800/60 bg-brand-50 dark:bg-brand-950/35 text-brand-800 dark:text-brand-300 hover:bg-brand-100 text-sm"
              >
                {t('dashboard.common.clearFilters')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 max-lg:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 min-w-0 w-full max-w-full">
                {pageProducts.map((p) => (
                  <div
                    key={p.id}
                    role={bulk.selectionMode ? 'button' : undefined}
                    tabIndex={bulk.selectionMode ? 0 : undefined}
                    onClick={bulk.selectionMode ? () => bulk.toggleId(p.id) : undefined}
                    onKeyDown={
                      bulk.selectionMode
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              bulk.toggleId(p.id);
                            }
                          }
                        : undefined
                    }
                    className={`group min-w-0 rounded-xl max-lg:rounded-xl lg:rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-lg shadow-stone-200/20 transition-all duration-300 flex flex-col h-full ${
                      bulk.selectionMode
                        ? bulk.isSelected(p.id)
                          ? 'border-brand-500 ring-2 ring-brand-500/30 cursor-pointer'
                          : 'border-stone-200/80 dark:border-zinc-600/80 cursor-pointer hover:border-brand-300'
                        : 'border-stone-200/80 dark:border-zinc-600/80 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-200/60'
                    }`}
                  >
                    {p.image ? (
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        imageClassName="transition-transform duration-300 group-hover:scale-105"
                      >
                        {bulk.selectionMode && (
                          <BulkItemCheckbox
                            checked={bulk.isSelected(p.id)}
                            onChange={() => bulk.toggleId(p.id)}
                            label={p.name}
                          />
                        )}
                        {(p.isFeatured || p.isVisible === false || p.inStock === false) && (
                          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                            {p.isFeatured && (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-500/95 text-white px-2 py-0.5 rounded-md inline-flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-current" aria-hidden />
                                {t('dashboard.products.featuredBadge')}
                              </span>
                            )}
                            {p.isVisible === false && (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-stone-900/75 text-white px-2 py-0.5 rounded-md">
                                {t('dashboard.products.hiddenBadge')}
                              </span>
                            )}
                            {p.inStock === false && (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-red-600/90 text-white px-2 py-0.5 rounded-md">
                                {t('dashboard.products.outOfStockBadge')}
                              </span>
                            )}
                          </div>
                        )}
                      </ProductImage>
                    ) : (
                      <div className={`${PRODUCT_CARD_ASPECT_CLASS} ${PRODUCT_IMAGE_FRAME_CLASS} relative`}>
                        {bulk.selectionMode && (
                          <BulkItemCheckbox
                            checked={bulk.isSelected(p.id)}
                            onChange={() => bulk.toggleId(p.id)}
                            label={p.name}
                          />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center text-stone-400 dark:text-zinc-500">
                          <Package className="w-14 h-14" />
                        </span>
                        {(p.isFeatured || p.isVisible === false || p.inStock === false) && (
                          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                            {p.isFeatured && (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-500/95 text-white px-2 py-0.5 rounded-md inline-flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-current" aria-hidden />
                                {t('dashboard.products.featuredBadge')}
                              </span>
                            )}
                            {p.isVisible === false && (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-stone-900/75 text-white px-2 py-0.5 rounded-md">
                                {t('dashboard.products.hiddenBadge')}
                              </span>
                            )}
                            {p.inStock === false && (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-red-600/90 text-white px-2 py-0.5 rounded-md">
                                {t('dashboard.products.outOfStockBadge')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4 max-lg:p-4 lg:p-5 flex flex-col flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-900 dark:text-zinc-100 mb-1 truncate text-base max-lg:text-base lg:text-lg">{p.name}</h3>
                      {multilingualEnabled ? (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {contentLangMeta.map((lang) =>
                            productHasTranslation(p, lang.id) ? (
                              <span
                                key={lang.id}
                                className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {lang.short}
                              </span>
                            ) : null,
                          )}
                        </div>
                      ) : null}
                      {p.description?.trim() ? (
                        <p className="text-stone-500 dark:text-zinc-400 text-xs max-lg:text-xs lg:text-sm mb-2.5 max-lg:mb-2.5 lg:mb-3 line-clamp-2">{p.description.trim()}</p>
                      ) : (
                        <p className="text-stone-400 dark:text-zinc-500 text-xs max-lg:text-xs lg:text-sm mb-2.5 max-lg:mb-2.5 lg:mb-3 line-clamp-2">{t('dashboard.products.noDescription')}</p>
                      )}
                      <div className="mb-3 max-lg:mb-3 lg:mb-4 mt-auto flex flex-wrap items-baseline gap-2">
                        <p className="font-bold text-brand-600 dark:text-brand-400 text-lg max-lg:text-lg lg:text-xl tabular-nums">{formatPrice(Number(p.price), user?.currency)}</p>
                        {p.compareAtPrice != null && p.compareAtPrice > Number(p.price) && (
                          <p className="text-sm text-stone-400 dark:text-zinc-500 line-through tabular-nums">
                            {formatPrice(p.compareAtPrice, user?.currency)}
                          </p>
                        )}
                      </div>
                      {!bulk.selectionMode && (
                        <div className="mt-auto flex min-w-0 gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => setViewProduct(p)}
                            className="inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-lg border-2 border-stone-200 bg-white px-1.5 py-2 text-[10px] font-medium text-stone-700 transition-all hover:border-brand-200 hover:bg-brand-50 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40"
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">{t('dashboard.common.view')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(products.find((item) => item.id === p.id) ?? p);
                              setShowForm(true);
                            }}
                            className="inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-lg border-2 border-stone-200 bg-white px-1.5 py-2 text-[10px] font-medium text-stone-700 transition-all hover:border-brand-200 hover:bg-brand-50 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40"
                          >
                            <Pencil className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">{t('dashboard.common.edit')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(p)}
                            className="inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-lg border-2 border-red-200 bg-red-50 px-1.5 py-2 text-[10px] font-semibold text-red-600 transition-all hover:bg-red-100 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-sm dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50"
                          >
                            <Trash2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">{t('dashboard.common.delete')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 max-lg:mt-5 lg:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-lg:gap-3 lg:gap-4 min-w-0 w-full max-w-full rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 px-3 max-lg:px-3 lg:px-4 py-3 max-lg:py-3 lg:py-3.5 shadow-sm">
                <p className="text-xs max-lg:text-xs lg:text-sm text-stone-600 dark:text-zinc-400 tabular-nums text-center sm:text-start">
                  {t('dashboard.common.showingRangeProducts', { start: rangeStart, end: rangeEnd, total: totalProducts })}
                </p>
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setPage((p) => Math.max(0, p - 1));
                        scrollOnPaginationChange();
                      }}
                      disabled={pageIndex <= 0}
                      className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                      {t('dashboard.common.previous')}
                    </button>
                    <span className="px-1 text-xs max-lg:text-xs lg:text-sm font-medium text-stone-500 dark:text-zinc-400 tabular-nums shrink-0">
                      {t('dashboard.common.pageOf', { current: pageIndex + 1, total: totalPages })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPage((p) => Math.min(totalPages - 1, p + 1));
                        scrollOnPaginationChange();
                      }}
                      disabled={pageIndex >= totalPages - 1}
                      className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg max-lg:rounded-lg lg:rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs max-lg:text-xs lg:text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:pointer-events-none disabled:opacity-40"
                    >
                      {t('dashboard.common.next')}
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title={t('dashboard.products.deleteTitle')}
        message={deleteConfirm ? t('dashboard.products.deleteMessage', { name: deleteConfirm.name }) : ''}
        confirmLabel={deleting ? t('dashboard.products.deleting') : t('dashboard.common.delete')}
        onConfirm={() => deleteConfirm && void handleDelete(deleteConfirm.id)}
        onCancel={() => !deleting && setDeleteConfirm(null)}
        danger
        loading={deleting}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={t('dashboard.common.deleteSelected')}
        message={t('dashboard.common.deleteSelectedConfirm', { count: bulk.selectedCount })}
        confirmLabel={bulkDeleting ? t('dashboard.common.deletingSelected') : t('dashboard.common.delete')}
        onConfirm={() => void handleDeleteSelected()}
        onCancel={() => !bulkDeleting && setBulkDeleteOpen(false)}
        danger
        loading={bulkDeleting}
      />

      {viewProduct &&
        createPortal(
          <ProductViewDialog
            product={viewProduct}
            currencyCode={user?.currency}
            onClose={() => setViewProduct(null)}
          />,
          document.body
        )}
    </DashboardLayout>
  );
}
