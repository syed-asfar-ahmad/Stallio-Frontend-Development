import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth, getStoredToken } from '../context/AuthContext';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import { AdminLoadingInline } from '../components/DashboardLoading';
import DashboardSwitch from '../components/DashboardSwitch';
import {
  DASHBOARD_INPUT,
  DASHBOARD_BTN_PRIMARY,
  DASHBOARD_BTN_SECONDARY,
  DASHBOARD_SEARCH_INPUT,
  DASHBOARD_ICON_CLOSE_BTN,
  DASHBOARD_TOGGLE_ROW,
  DASHBOARD_TOGGLE_ROW_LABEL,
  DASHBOARD_TOGGLE_ROW_SWITCH,
} from '../lib/dashboardFormClasses';
import ConfirmDialog from '../components/ConfirmDialog';
import { getSellerPlanLimits, canUpgradePlan } from '../lib/sellerPlanLimits';
import PlanLimitBanner from '../components/plan/PlanLimitBanner';
import PlanUsageBar from '../components/plan/PlanUsageBar';
import { FieldLabelWithHelp, FieldTitleWithHelp } from '../components/FieldLabelWithHelp';
import DashboardBulkSelectBar from '../components/DashboardBulkSelectBar';
import BulkItemCheckbox from '../components/BulkItemCheckbox';
import { useBulkSelection } from '../hooks/useBulkSelection';
import {
  LayoutGrid,
  Plus,
  Trash2,
  Upload,
  X,
  Pencil,
  Search,
  ListFilter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import MultilingualTextSection from '../components/MultilingualTextSection';
import {
  SHOP_CONTENT_LANGUAGES,
  categoryHasTranslation,
  isContentFieldRequired,
  isSharedFieldLocked,
  isSharedFieldRequired,
  type ShopContentLang,
} from '../lib/shopContentLanguages';
import SharedLockedField from '../components/SharedLockedField';
import { useSellerContentLanguages, useSellerMultilingualEnabled } from '../hooks/useSellerContentLanguages';
import ImageCropModal from '../components/ImageCropModal';
import DashboardImageRemoveButton from '../components/DashboardImageRemoveButton';
import { CATEGORY_CARD_ASPECT_CLASS, CATEGORY_CARD_VIEWPORT } from '../lib/imageCropViewports';
import { scrollOnPaginationChange } from '../lib/scrollDashboardMainToTop';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const PAGE_SIZE = 15;
const EMPTY_FORM_NAMES: Record<ShopContentLang, string> = { en: '', es: '', ar: '' };

type CategoryItem = { name: string; nameEs?: string; nameAr?: string; slug: string; image?: string; visible?: boolean };

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'category';
}

export default function DashboardCategories() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth();
  const contentLanguages = useSellerContentLanguages();
  const multilingualEnabled = useSellerMultilingualEnabled();
  const contentLangMeta = useMemo(
    () => SHOP_CONTENT_LANGUAGES.filter((l) => contentLanguages.includes(l.id)),
    [contentLanguages],
  );
  const [categoriesEnabled, setCategoriesEnabled] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toggleConfirm, setToggleConfirm] = useState<boolean | null>(null);
  const [formVisibleToggleConfirm, setFormVisibleToggleConfirm] = useState<boolean | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; name: string } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const bulk = useBulkSelection();
  const planLimits = getSellerPlanLimits(user?.plan);
  const categoryLimitReached = categories.length >= planLimits.maxCategories;

  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
const [categoryModal, setCategoryModal] = useState<null | 'add' | number>(null);
  const [formLang, setFormLang] = useState<ShopContentLang>('en');
  const [formNames, setFormNames] = useState<Record<ShopContentLang, string>>(EMPTY_FORM_NAMES);
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(true);
  const [uploadingFormImage, setUploadingFormImage] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const formFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setCategoriesEnabled(user.categoriesEnabled ?? false);
      setCategories(
        (user.categories ?? []).map((c) => ({
          name: c.name,
          nameEs: (c as CategoryItem).nameEs,
          nameAr: (c as CategoryItem).nameAr,
          slug: c.slug,
          image: (c as CategoryItem).image,
          visible: (c as CategoryItem).visible !== false,
        }))
      );
    }
  }, [user]);

  const hasActiveFilters = searchQuery.trim() !== '';

  function clearAllFilters() {
    setSearchQuery('');
  }

  function closeFiltersPanel() {
    setFiltersOpen(false);
  }

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((c) => {
      if (q) {
        const hay = [c.name, c.nameEs, c.nameAr].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [categories, searchQuery]);

  const totalCategories = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalCategories / PAGE_SIZE));
  const pageIndex = Math.min(page, totalPages - 1);
  const pageCategories = useMemo(
    () => filteredCategories.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE),
    [filteredCategories, pageIndex]
  );
  const rangeStart = totalCategories === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const rangeEnd = totalCategories === 0 ? 0 : Math.min((pageIndex + 1) * PAGE_SIZE, totalCategories);
  const selectableSlugs = useMemo(() => filteredCategories.map((c) => c.slug), [filteredCategories]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredCategories.length / PAGE_SIZE) - 1);
    setPage((p) => Math.min(p, maxPage));
  }, [filteredCategories.length]);

  async function saveCategories(payload: { categoriesEnabled?: boolean; categories?: CategoryItem[] }): Promise<boolean> {
    setError('');
    setSaving(true);
    try {
      await api('/api/user', { method: 'PATCH', body: payload });
      await fetchUser();
      return true;
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleConfirm(confirmed: boolean) {
    setCategoriesEnabled(confirmed);
    await saveCategories({
      categoriesEnabled: confirmed,
      categories: mapCategoriesForSave(categories).filter((c) => c.name.trim()),
    });
    toast.success(confirmed ? t('dashboard.categories.toastEnabled') : t('dashboard.categories.toastDisabled'));
    setToggleConfirm(null);
  }

  function mapCategoriesForSave(list: CategoryItem[]) {
    return list.map((c) => ({
      name: c.name,
      nameEs: c.nameEs?.trim() || undefined,
      nameAr: c.nameAr?.trim() || undefined,
      slug: c.slug,
      image: c.image,
      visible: c.visible !== false,
    }));
  }

  function resetFormNames() {
    setFormNames(EMPTY_FORM_NAMES);
    setFormLang('en');
  }

  function openAddModal() {
    if (categoryLimitReached) {
      toast.error(t('dashboard.categories.planLimitBody', { max: planLimits.maxCategories }));
      return;
    }
    resetFormNames();
    setFormImage(null);
    setFormVisible(true);
    setCategoryModal('add');
  }

  function openEditModal(index: number) {
    const c = categories[index];
    if (!c) return;
    setFormNames({
      en: c.name ?? '',
      es: c.nameEs ?? '',
      ar: c.nameAr ?? '',
    });
    setFormLang('en');
    setFormImage(c.image ?? null);
    setFormVisible(c.visible !== false);
    setCategoryModal(index);
  }

  function closeCategoryModal() {
    setCategoryModal(null);
    resetFormNames();
    setFormImage(null);
    setFormVisible(true);
  }

  async function saveCategoryModal() {
    if (saving) return;
    const name = formNames.en.trim();
    if (!name) {
      toast.error(t('dashboard.categories.toastName'));
      setFormLang('en');
      return;
    }
    if (!formImage) {
      toast.error(t('dashboard.categories.toastImage'));
      return;
    }

    const nameEs = formNames.es.trim() || undefined;
    const nameAr = formNames.ar.trim() || undefined;

    if (categoryModal === 'add') {
      const slug = slugFromName(name);
      const newCat: CategoryItem = {
        name,
        nameEs,
        nameAr,
        slug,
        image: formImage ?? undefined,
        visible: formVisible,
      };
      const next = [...categories, newCat];
      setCategories(next);
      const ok = await saveCategories({
        categoriesEnabled,
        categories: mapCategoriesForSave(next),
      });
      if (ok) {
        toast.success(t('dashboard.categories.toastAdded'));
        closeCategoryModal();
      }
      return;
    }

    if (typeof categoryModal === 'number') {
      const idx = categoryModal;
      const next = categories.map((c, i) =>
        i === idx
          ? {
              ...c,
              name,
              nameEs,
              nameAr,
              slug: slugFromName(name),
              image: formImage ?? undefined,
              visible: formVisible,
            }
          : c
      );
      setCategories(next);
      const ok = await saveCategories({
        categoriesEnabled,
        categories: mapCategoriesForSave(next),
      });
      if (ok) {
        toast.success(t('dashboard.categories.toastUpdated'));
        closeCategoryModal();
      }
    }
  }

  async function handleDeleteConfirm() {
    if (deleteTarget === null || deleting) return;
    setDeleting(true);
    try {
      const { index } = deleteTarget;
      const next = categories.filter((_, i) => i !== index);
      setCategories(next);
      const ok = await saveCategories({
        categoriesEnabled,
        categories: mapCategoriesForSave(next),
      });
      if (ok) {
        toast.success(t('dashboard.categories.toastRemoved'));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteSelected() {
    if (bulk.selectedCount === 0) return;
    setBulkDeleting(true);
    try {
      const next = categories.filter((c) => !bulk.selectedIds.has(c.slug));
      setCategories(next);
      await saveCategories({
        categoriesEnabled,
        categories: mapCategoriesForSave(next),
      });
      bulk.exitSelectionMode();
      setBulkDeleteOpen(false);
      toast.success(t('dashboard.common.toastDeletedSelected', { count: bulk.selectedCount }));
    } catch {
} finally {
      setBulkDeleting(false);
    }
  }

  function pickCategoryImage(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error(t('dashboard.home.cropImageOnly'));
      return;
    }
    setCropFile(file);
    setCropOpen(true);
  }

  async function uploadFormCategoryBlob(blob: Blob) {
    const token = getStoredToken();
    if (!token) return;
    setCropOpen(false);
    setCropFile(null);
    setUploadingFormImage(true);
    setError('');
    const form = new FormData();
    form.append('file', blob, 'category.jpg');
    form.append('type', 'product');
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dashboard.productForm.toastUploadFail'));
      setFormImage(data.url);
      toast.success(t('dashboard.categories.toastUpload'));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploadingFormImage(false);
    }
  }

  const modalTitle = categoryModal === 'add' ? t('dashboard.categories.modalAdd') : t('dashboard.categories.modalEdit');
  const activeFormLang = contentLangMeta.find((l) => l.id === formLang) ?? contentLangMeta[0] ?? SHOP_CONTENT_LANGUAGES[0];
  const sharedLocked = isSharedFieldLocked(multilingualEnabled, formLang);
  const formLangFilled = {
    en: Boolean(formNames.en.trim()),
    es: Boolean(formNames.es.trim()),
    ar: Boolean(formNames.ar.trim()),
  };

  return (
    <DashboardLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-8 min-w-0">
        <div className="flex items-center gap-1.5 max-lg:gap-1.5 lg:gap-2 text-brand-600 mb-0.5 max-lg:mb-0.5 lg:mb-1">
          <LayoutGrid className="w-4 h-4 max-lg:w-4 max-lg:h-4 lg:w-5 lg:h-5" />
          <span className="text-[11px] max-lg:text-[11px] lg:text-sm font-semibold uppercase tracking-wide max-lg:tracking-wide lg:tracking-widest">{t('dashboard.categories.section')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">{t('dashboard.categories.title')}</h1>
        <p className="text-stone-500 dark:text-zinc-400 mt-0.5 text-xs max-lg:text-xs lg:text-sm">
          {t('dashboard.categories.subtitle')}
        </p>

        {categoriesEnabled && (
          <>
            <div className="mt-3 flex flex-col gap-2.5 min-w-0 lg:hidden">
              <button
                type="button"
                onClick={openAddModal}
                disabled={bulk.selectionMode || categoryLimitReached}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                <Plus className="h-4 w-4 shrink-0" />
                {t('dashboard.categories.addCategory')}
              </button>
              <PlanUsageBar
                count={categories.length}
                max={planLimits.maxCategories}
                label={t('dashboard.categories.planLimitUsage', { count: categories.length, max: planLimits.maxCategories })}
                limitReached={categoryLimitReached}
              />
              {categories.length > 0 && (
                bulk.selectionMode ? (
                  <div className="w-full min-w-0 [&>div]:w-full [&>div]:flex [&>div]:flex-col [&>div]:gap-2 [&_button]:w-full [&_button]:justify-center">
                    {filteredCategories.length > 0 && (
                      <DashboardBulkSelectBar
                        selectionMode={bulk.selectionMode}
                        onToggleSelectionMode={bulk.toggleSelectionMode}
                        selectedCount={bulk.selectedCount}
                        totalSelectable={selectableSlugs.length}
                        onSelectAll={() => bulk.selectAll(selectableSlugs)}
                        onClearSelection={bulk.clearSelection}
                        onDeleteSelected={() => setBulkDeleteOpen(true)}
                        deleteDisabled={bulkDeleting || saving || deleting}
                      />
                    )}
                  </div>
                ) : (
                  <div className={`grid min-w-0 w-full gap-2 ${filteredCategories.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {filteredCategories.length > 0 && (
                      <div className="min-w-0 [&_button]:flex [&_button]:h-full [&_button]:min-h-[2.75rem] [&_button]:w-full [&_button]:justify-center">
                        <DashboardBulkSelectBar
                          selectionMode={bulk.selectionMode}
                          onToggleSelectionMode={bulk.toggleSelectionMode}
                          selectedCount={bulk.selectedCount}
                          totalSelectable={selectableSlugs.length}
                          onSelectAll={() => bulk.selectAll(selectableSlugs)}
                          onClearSelection={bulk.clearSelection}
                          onDeleteSelected={() => setBulkDeleteOpen(true)}
                          deleteDisabled={bulkDeleting || saving || deleting}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      aria-expanded={filtersOpen}
                      aria-label={filtersOpen ? t('dashboard.products.ariaHideFilters') : t('dashboard.products.ariaShowFilters')}
                      onClick={() => {
                        if (filtersOpen) closeFiltersPanel();
                        else setFiltersOpen(true);
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
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openAddModal}
                  disabled={bulk.selectionMode || categoryLimitReached}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/30 disabled:opacity-50"
                >
                  <Plus className="h-5 w-5 shrink-0" />
                  {t('dashboard.categories.addCategory')}
                </button>
                <div className="min-w-[140px]">
                  <PlanUsageBar
                    count={categories.length}
                    max={planLimits.maxCategories}
                    label={t('dashboard.categories.planLimitUsage', { count: categories.length, max: planLimits.maxCategories })}
                    limitReached={categoryLimitReached}
                  />
                </div>
                {filteredCategories.length > 0 && (
                  <DashboardBulkSelectBar
                    selectionMode={bulk.selectionMode}
                    onToggleSelectionMode={bulk.toggleSelectionMode}
                    selectedCount={bulk.selectedCount}
                    totalSelectable={selectableSlugs.length}
                    onSelectAll={() => bulk.selectAll(selectableSlugs)}
                    onClearSelection={bulk.clearSelection}
                    onDeleteSelected={() => setBulkDeleteOpen(true)}
                    deleteDisabled={bulkDeleting || saving || deleting}
                  />
                )}
              </div>
              {categories.length > 0 && (
                <button
                  type="button"
                  aria-expanded={filtersOpen}
                  aria-label={filtersOpen ? t('dashboard.products.ariaHideFilters') : t('dashboard.products.ariaShowFilters')}
                  onClick={() => {
                    if (filtersOpen) closeFiltersPanel();
                    else setFiltersOpen(true);
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
          </>
        )}
      </div>

      {categoriesEnabled && (
        <PlanLimitBanner show={categoryLimitReached && canUpgradePlan(user?.plan)} />
      )}

      <div className="w-full max-w-6xl mx-auto space-y-4 max-lg:space-y-4 lg:space-y-6 min-w-0">
        {error && (
          <div className="rounded-lg max-lg:rounded-lg lg:rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 px-3 max-lg:px-3 lg:px-4 py-2.5 max-lg:py-2.5 lg:py-3 text-red-700 dark:text-red-300 text-xs max-lg:text-xs lg:text-sm font-medium break-words">
            {error}
          </div>
        )}

        <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-visible">
          <div className="p-4 max-lg:p-4 lg:p-6 border-b border-stone-100 dark:border-zinc-800">
            <div className={DASHBOARD_TOGGLE_ROW}>
              <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                <FieldTitleWithHelp
                  title={t('dashboard.categories.toggleTitle')}
                  help={t('dashboard.categories.toggleHint')}
                  titleClassName="text-sm max-lg:text-sm lg:text-base font-semibold text-stone-800 dark:text-zinc-200"
                />
              </div>
              <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                <DashboardSwitch checked={categoriesEnabled} onCheckedChange={(next) => setToggleConfirm(next)} />
              </div>
            </div>
          </div>

          {categoriesEnabled && categories.length === 0 && (
            <div className="p-8 max-lg:p-8 lg:p-16 text-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-brand-500/5 pointer-events-none" />
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/25">
                  <LayoutGrid className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100 mb-2">{t('dashboard.categories.emptyTitle')}</h2>
                <p className="text-stone-600 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                  {t('dashboard.categories.emptyBody')}
                </p>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  {t('dashboard.categories.addCategory')}
                </button>
              </div>
            </div>
          )}

          {categoriesEnabled && categories.length > 0 && (
            <>
              {filtersOpen && (
                <div className="mx-3 max-lg:mx-3 lg:mx-6 mb-4 max-lg:mb-4 lg:mb-6 mt-4 max-lg:mt-4 lg:mt-6 min-w-0 overflow-visible rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 shadow-md shadow-stone-200/30 dark:shadow-black/40 ring-1 ring-brand-500/10 first:mt-0">
                  <div className="rounded-t-xl max-lg:rounded-t-xl lg:rounded-t-2xl p-3 max-lg:p-3 sm:max-lg:p-4 lg:p-5">
                    <div className="relative min-w-0">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500 pointer-events-none" aria-hidden />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('dashboard.categories.searchPh')}
                        autoComplete="off"
                        className={`${DASHBOARD_SEARCH_INPUT} min-w-0 py-2.5 max-lg:py-2.5 lg:py-3 pr-4 text-sm`}
                      />
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

              <div className="p-4 max-lg:p-4 lg:p-6 min-w-0">
                {filteredCategories.length === 0 ? (
                  <div className="rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 p-8 max-lg:p-8 lg:p-14 text-center shadow-sm">
                    <LayoutGrid className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 mb-2">{t('dashboard.categories.noMatchTitle')}</h2>
                    <p className="text-stone-600 dark:text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                      {t('dashboard.categories.noMatchBody')}
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
                    <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-2.5 max-lg:mb-2.5 lg:mb-3">{t('dashboard.categories.yourCategories')}</p>
                    <ul className="grid gap-4 max-lg:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 min-w-0 w-full max-w-full">
                      {pageCategories.map((c) => {
                        const i = categories.indexOf(c);
                        return (
                          <li
                            key={`${c.slug}-${i}`}
                            className={`min-w-0 rounded-xl max-lg:rounded-xl lg:rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-lg shadow-stone-200/20 transition-all duration-300 flex flex-col h-full ${
                              bulk.selectionMode
                                ? bulk.isSelected(c.slug)
                                  ? 'border-brand-500 ring-2 ring-brand-500/30'
                                  : 'border-stone-200/80 dark:border-zinc-600/80'
                                : 'border-stone-200/80 dark:border-zinc-600/80 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-200/60'
                            }`}
                          >
                            <div className={`${CATEGORY_CARD_ASPECT_CLASS} relative overflow-hidden bg-stone-100 dark:bg-zinc-800`}>
                              {bulk.selectionMode && (
                                <BulkItemCheckbox
                                  checked={bulk.isSelected(c.slug)}
                                  onChange={() => bulk.toggleId(c.slug)}
                                  label={c.name}
                                />
                              )}
                              {c.image ? (
                                <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-zinc-500">
                                  <Upload className="w-14 h-14" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent pointer-events-none" />
                              <div className="absolute bottom-2 max-lg:bottom-2 lg:bottom-3 left-2 max-lg:left-2 lg:left-3 right-2 max-lg:right-2 lg:right-3 pointer-events-none flex flex-wrap items-end gap-1.5 max-lg:gap-1.5 lg:gap-2">
                                <p className="text-white font-semibold text-base max-lg:text-base lg:text-lg line-clamp-1">{c.name}</p>
                                {c.visible === false && (
                                  <span className="text-[10px] font-bold uppercase tracking-wide bg-stone-900/70 text-white px-2 py-0.5 rounded-md">
                                    {t('dashboard.categories.hiddenBadge')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {!bulk.selectionMode && (
                            <div className="p-4 max-lg:p-4 lg:p-5 flex flex-col gap-2.5 max-lg:gap-2.5 lg:gap-3 mt-auto min-w-0">
                              {multilingualEnabled ? (
                              <div className="flex flex-wrap gap-1.5">
                                {contentLangMeta.map((lang) =>
                                  categoryHasTranslation(c, lang.id) ? (
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
                            <div className="flex min-w-0 gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => i >= 0 && openEditModal(i)}
                                className="inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-lg border-2 border-stone-200 bg-white px-1.5 py-2 text-[10px] font-medium text-stone-700 transition-all hover:border-brand-200 hover:bg-brand-50 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-xl lg:px-4 lg:py-2.5 lg:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600/45 dark:hover:bg-brand-950/40"
                              >
                                <Pencil className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                <span className="truncate">{t('dashboard.common.edit')}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => i >= 0 && setDeleteTarget({ index: i, name: c.name })}
                                className="inline-flex min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-lg border-2 border-red-200 bg-red-50 px-1.5 py-2 text-[10px] font-semibold text-red-600 transition-all hover:bg-red-100 sm:gap-1.5 sm:px-2.5 sm:text-xs lg:rounded-xl lg:px-4 lg:py-2.5 lg:text-sm dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-400 dark:hover:bg-red-950/50"
                              >
                                <Trash2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                <span className="truncate">{t('dashboard.common.delete')}</span>
                              </button>
                            </div>
                            </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-5 max-lg:mt-5 lg:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-lg:gap-3 lg:gap-4 min-w-0 w-full max-w-full rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200/80 dark:border-zinc-600/80 bg-white dark:bg-zinc-900 px-3 max-lg:px-3 lg:px-4 py-3 max-lg:py-3 lg:py-3.5 shadow-sm">
                      <p className="text-xs max-lg:text-xs lg:text-sm text-stone-600 dark:text-zinc-400 tabular-nums text-center sm:text-start">
                        {t('dashboard.common.showingRangeCategories', { start: rangeStart, end: rangeEnd, total: totalCategories })}
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
              </div>
            </>
          )}
        </div>
      </div>

      {categoryModal !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="w-full max-h-[min(92vh,100%)] sm:max-h-[90vh] max-w-lg overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between px-4 max-lg:px-4 sm:px-6 py-3 max-lg:py-3 sm:py-4 border-b border-stone-100 dark:border-zinc-800 sticky top-0 z-10 bg-white dark:bg-zinc-900">
              <h3 className="text-base max-lg:text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100 pr-2">{modalTitle}</h3>
              <button
                type="button"
                onClick={closeCategoryModal}
                className={`${DASHBOARD_ICON_CLOSE_BTN} h-9 w-9`}
                aria-label={t('dashboard.categories.ariaClose')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-lg:p-4 sm:p-6 space-y-4 max-lg:space-y-4 sm:space-y-5 min-w-0">
              {multilingualEnabled ? (
                <MultilingualTextSection
                  label={t('dashboard.categories.langLabel')}
                  hint={t('dashboard.categories.langHint')}
                  value={formLang}
                  onChange={setFormLang}
                  filled={formLangFilled}
                  languages={contentLanguages}
                >
                  <div>
                    <FieldLabelWithHelp
                      required={isContentFieldRequired(multilingualEnabled, formLang)}
                      htmlFor="category-form-name"
                    >
                      {`${t('dashboard.categories.nameLabel')} (${activeFormLang.label})`}
                    </FieldLabelWithHelp>
                    <input
                      id="category-form-name"
                      type="text"
                      dir={activeFormLang.dir}
                      value={formNames[formLang]}
                      onChange={(e) => setFormNames((prev) => ({ ...prev, [formLang]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), saveCategoryModal())}
                      placeholder={t('dashboard.categories.namePh')}
                      className={DASHBOARD_INPUT}
                    />
                  </div>
                </MultilingualTextSection>
              ) : (
                <div>
                  <FieldLabelWithHelp required htmlFor="category-form-name">
                    {t('dashboard.categories.nameLabel')}
                  </FieldLabelWithHelp>
                  <input
                    id="category-form-name"
                    type="text"
                    value={formNames.en}
                    onChange={(e) => setFormNames((prev) => ({ ...prev, en: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), saveCategoryModal())}
                    placeholder={t('dashboard.categories.namePh')}
                    className={DASHBOARD_INPUT}
                  />
                </div>
              )}

              <SharedLockedField locked={sharedLocked}>
              <div>
                <FieldLabelWithHelp required={isSharedFieldRequired(multilingualEnabled, formLang)} help={t('dashboard.categories.imageHint')}>
                  {t('dashboard.categories.imageLabel')}
                </FieldLabelWithHelp>
                <input
                  ref={formFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) pickCategoryImage(file);
                    e.target.value = '';
                  }}
                />
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  {formImage ? (
                    <div className="relative z-10 shrink-0 overflow-visible">
                      <div className="overflow-hidden rounded-xl border-2 border-stone-200 dark:border-zinc-700">
                        <img
                          src={formImage}
                          alt=""
                          className="w-20 rounded-xl object-cover"
                          style={{ aspectRatio: `${CATEGORY_CARD_VIEWPORT.width} / ${CATEGORY_CARD_VIEWPORT.height}` }}
                        />
                      </div>
                      <DashboardImageRemoveButton
                        onClick={() => setFormImage(null)}
                        disabled={sharedLocked}
                        aria-label={t('dashboard.categories.ariaRemoveImage')}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => formFileRef.current?.click()}
                      disabled={uploadingFormImage || sharedLocked}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-700 flex items-center justify-center text-stone-400 dark:text-zinc-500 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingFormImage ? <AdminLoadingInline dotsOnly /> : <Upload className="w-5 h-5" />}
                    </button>
                  )}
                  {formImage && (
                    <button
                      type="button"
                      onClick={() => formFileRef.current?.click()}
                      disabled={uploadingFormImage || sharedLocked}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingFormImage ? <AdminLoadingInline dotsOnly /> : <Upload className="w-4 h-4" />}
                      {t('dashboard.categories.changeImage')}
                    </button>
                  )}
                </div>
              </div>
              </SharedLockedField>

              <SharedLockedField locked={sharedLocked}>
              <div className={`${DASHBOARD_TOGGLE_ROW} rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-950/50 p-3 max-lg:p-3 sm:p-4`}>
                <div className={DASHBOARD_TOGGLE_ROW_LABEL}>
                  <FieldTitleWithHelp
                    title={t('dashboard.categories.visibleOnStore')}
                    help={t('dashboard.categories.visibleHint')}
                    titleClassName="text-sm max-lg:text-sm sm:text-base"
                  />
                </div>
                <div className={DASHBOARD_TOGGLE_ROW_SWITCH}>
                  <DashboardSwitch checked={formVisible} disabled={sharedLocked} onCheckedChange={setFormVisibleToggleConfirm} />
                </div>
              </div>
              </SharedLockedField>
            </div>

            <div className="px-4 max-lg:px-4 sm:px-6 py-3 max-lg:py-3 sm:py-4 border-t border-stone-100 dark:border-zinc-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sticky bottom-0 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={closeCategoryModal}
                className={`${DASHBOARD_BTN_SECONDARY} w-full sm:w-auto justify-center`}
              >
                {t('dashboard.common.cancel')}
              </button>
              <button
                type="button"
                onClick={saveCategoryModal}
                disabled={saving || deleting || !formNames.en.trim() || !formImage}
                className={`${DASHBOARD_BTN_PRIMARY} !px-4 !py-2.5 inline-flex w-full sm:w-auto items-center justify-center gap-2`}
              >
                {saving && !deleting ? <AdminLoadingInline light dotsOnly /> : null}
                {saving && !deleting
                  ? t('dashboard.common.saving')
                  : categoryModal === 'add'
                    ? t('dashboard.categories.addCategoryBtn')
                    : t('dashboard.categories.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageCropModal
        open={cropOpen}
        imageFile={cropFile}
        viewport={CATEGORY_CARD_VIEWPORT}
        onClose={() => {
          setCropOpen(false);
          setCropFile(null);
        }}
        onConfirm={uploadFormCategoryBlob}
      />

      <ConfirmDialog
        open={toggleConfirm !== null}
        title={toggleConfirm ? t('dashboard.categories.enableTitle') : t('dashboard.categories.disableTitle')}
        message={toggleConfirm ? t('dashboard.categories.enableMsg') : t('dashboard.categories.disableMsg')}
        confirmLabel={
          saving
            ? toggleConfirm
              ? t('dashboard.common.enabling')
              : t('dashboard.common.disabling')
            : toggleConfirm
              ? t('dashboard.common.enable')
              : t('dashboard.common.disable')
        }
        loading={saving}
        onConfirm={() => void handleToggleConfirm(toggleConfirm!)}
        onCancel={() => !saving && setToggleConfirm(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('dashboard.categories.removeTitle')}
        message={
          deleteTarget !== null
            ? t('dashboard.categories.removeMsg', { name: deleteTarget.name })
            : ''
        }
        confirmLabel={deleting ? t('dashboard.common.removing') : t('dashboard.categories.removeBtn')}
        loading={deleting}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => !deleting && setDeleteTarget(null)}
        danger
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

      <ConfirmDialog
        open={formVisibleToggleConfirm !== null}
        title={
          formVisibleToggleConfirm
            ? t('dashboard.categories.enableVisibleTitle')
            : t('dashboard.categories.disableVisibleTitle')
        }
        message={
          formVisibleToggleConfirm
            ? t('dashboard.categories.enableVisibleMsg')
            : t('dashboard.categories.disableVisibleMsg')
        }
        confirmLabel={formVisibleToggleConfirm ? t('dashboard.common.enable') : t('dashboard.common.disable')}
        onConfirm={() => {
          if (formVisibleToggleConfirm !== null) {
            setFormVisible(formVisibleToggleConfirm);
            setFormVisibleToggleConfirm(null);
          }
        }}
        onCancel={() => setFormVisibleToggleConfirm(null)}
      />
    </DashboardLayout>
  );
}
