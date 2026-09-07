import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Eye, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import ProductForm from '../ProductForm';
import ProductViewDialog from '../ProductViewDialog';
import ConfirmDialog from '../ConfirmDialog';
import AdminPagination from './AdminPagination';
import { adminTheme } from './adminTheme';
import { DASHBOARD_BTN_PRIMARY } from '../../lib/dashboardFormClasses';
import { api } from '../../lib/api';
import { getProductImageDisplayUrl } from '../../lib/productImageUrl';
import type { Product } from '../../types';
import type { AdminSellerFull } from '../../types/admin';

const PAGE_LIMIT = 10;

function productThumbUrl(product: AdminSellerFull['products'][0]): string | null {
  if (product.images?.length) return product.images[0];
  return product.image ?? null;
}

function productCategoryLabel(
  category: string | null,
  shopCategories: { name: string; slug: string }[],
): string {
  const slug = category?.trim() ?? '';
  if (!slug) return 'Uncategorized';
  const match = shopCategories.find((c) => c.slug === slug);
  if (match?.name?.trim()) return match.name.trim();
  return slug
    .split(/[-_]/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .filter(Boolean)
    .join(' ');
}

function adminProductToForm(p: AdminSellerFull['products'][0]): Product {
  return {
    id: p.id,
    name: p.name,
    nameEs: p.nameEs,
    nameAr: p.nameAr,
    description: p.description,
    descriptionEs: p.descriptionEs,
    descriptionAr: p.descriptionAr,
    price: p.price,
    image: p.image,
    images: p.images?.length ? p.images : p.image ? [p.image] : [],
    category: p.category,
    options: p.options,
    optionsEs: p.optionsEs,
    optionsAr: p.optionsAr,
    allowCustomerMessage: p.allowCustomerMessage,
    customerMessageLabel: p.customerMessageLabel,
    customerMessageLabelEs: p.customerMessageLabelEs,
    customerMessageLabelAr: p.customerMessageLabelAr,
  };
}

type Props = {
  sellerId: string;
  seller: AdminSellerFull['seller'];
  products: AdminSellerFull['products'];
  onReload: () => void | Promise<void>;
};

export default function AdminSellerProductsPanel({ sellerId, seller, products, onReload }: Props) {
  const [page, setPage] = useState(1);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminSellerFull['products'][0] | null>(null);
  const [viewProduct, setViewProduct] = useState<AdminSellerFull['products'][0] | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const shopCategories = seller.categories ?? [];
  const paginated = products.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT);

  async function confirmDeleteProduct() {
    if (!deleteProductId || deletingProduct) return;
    setDeletingProduct(true);
    try {
      await api(`/api/admin/products/${deleteProductId}`, { method: 'DELETE' });
      toast.success('Product deleted');
      setDeleteProductId(null);
      await onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingProduct(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 max-lg:gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between min-w-0">
        <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
          {products.length} product{products.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={() => setShowAddProduct(true)}
          className={`${DASHBOARD_BTN_PRIMARY} inline-flex w-full max-lg:w-full sm:w-auto items-center justify-center gap-2 max-lg:py-2.5 max-lg:text-sm`}
        >
          <Plus className="h-4 w-4 shrink-0" />
          Add Product
        </button>
      </div>

      <div className={`${adminTheme.tableWrap} min-w-0`}>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className={adminTheme.theadRow}>
                <th className={adminTheme.th}>Product</th>
                <th className={adminTheme.th}>Price</th>
                <th className={adminTheme.th}>Category</th>
                <th className={adminTheme.th}>Added</th>
                <th className={adminTheme.th}>Actions</th>
              </tr>
            </thead>
            <tbody className={adminTheme.tbodyDivide}>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-4 py-10 text-center ${adminTheme.muted}`}>
                    No products yet. Add the first product for this seller.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const thumb = productThumbUrl(p);
                  return (
                    <tr key={p.id} className={adminTheme.rowHover}>
                      <td className={adminTheme.td}>
                        <div className="flex min-w-0 items-center gap-3">
                          {thumb ? (
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 dark:border-zinc-700 dark:bg-zinc-950">
                              <img src={getProductImageDisplayUrl(thumb)} alt="" className="absolute inset-0 h-full w-full object-contain" />
                            </div>
                          ) : (
                            <div className={`${adminTheme.imagePlaceholder} h-11 w-11 shrink-0`}>
                              <Package className="h-5 w-5 text-stone-400 dark:text-zinc-500" aria-hidden />
                            </div>
                          )}
                          <p className="min-w-0 truncate font-medium text-stone-900 dark:text-zinc-100">{p.name}</p>
                        </div>
                      </td>
                      <td className={adminTheme.td}>{p.price.toLocaleString()}</td>
                      <td className={adminTheme.td}>{productCategoryLabel(p.category, shopCategories)}</td>
                      <td className={`${adminTheme.td} ${adminTheme.muted}`}>
                        {format(new Date(p.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className={adminTheme.td}>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setViewProduct(p)}
                            className={`inline-flex items-center gap-1.5 ${adminTheme.link}`}
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditProduct(p)}
                            className={`inline-flex items-center gap-1.5 ${adminTheme.link}`}
                          >
                            <Pencil className="h-3.5 w-3.5 shrink-0" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteProductId(p.id)}
                            className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden">
          {products.length === 0 ? (
            <p className={`px-4 py-10 text-center text-sm ${adminTheme.muted}`}>
              No products yet. Add the first product for this seller.
            </p>
          ) : (
            <ul className={`divide-y ${adminTheme.divide}`}>
              {paginated.map((p) => {
                const thumb = productThumbUrl(p);
                return (
                  <li key={p.id} className="flex flex-col gap-3 p-4 min-w-0">
                    <div className="flex items-start gap-3 min-w-0">
                      {thumb ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 dark:border-zinc-700 dark:bg-zinc-950">
                          <img
                            src={getProductImageDisplayUrl(thumb)}
                            alt=""
                            className="absolute inset-0 h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className={`${adminTheme.imagePlaceholder} h-12 w-12 shrink-0`}>
                          <Package className="h-5 w-5 text-stone-400 dark:text-zinc-500" aria-hidden />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 dark:text-zinc-100 truncate">{p.name}</p>
                        <p className={`mt-0.5 text-xs ${adminTheme.muted}`}>
                          {productCategoryLabel(p.category, shopCategories)}
                        </p>
                        <p className="mt-1 text-sm font-semibold tabular-nums text-stone-900 dark:text-zinc-100">
                          {p.price.toLocaleString()}
                        </p>
                        <p className={`text-xs ${adminTheme.muted}`}>
                          Added {format(new Date(p.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setViewProduct(p)}
                        className={`inline-flex flex-1 min-w-[5rem] items-center justify-center gap-1.5 ${adminTheme.btnSecondary} py-2 text-xs`}
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditProduct(p)}
                        className={`inline-flex flex-1 min-w-[5rem] items-center justify-center gap-1.5 ${adminTheme.btnSecondary} py-2 text-xs`}
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteProductId(p.id)}
                        className="inline-flex flex-1 min-w-[5rem] items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {products.length > 0 && (
          <AdminPagination
            embedded
            className="mx-3 max-lg:mx-3 lg:mx-4 mb-4"
            page={page}
            total={products.length}
            limit={PAGE_LIMIT}
            onPage={setPage}
          />
        )}
      </div>

      {(showAddProduct || editProduct) && (
        <ProductForm
          product={editProduct ? adminProductToForm(editProduct) : null}
          title={editProduct ? 'Edit Product' : 'Add Product'}
          adminButtons
          currencyCode={seller.currency}
          categoriesEnabled={Boolean(seller.categoriesEnabled && shopCategories.length > 0)}
          categories={shopCategories}
          onClose={() => {
            setShowAddProduct(false);
            setEditProduct(null);
          }}
          onSaved={async () => {
            await onReload();
            setShowAddProduct(false);
            setEditProduct(null);
          }}
          onSavePayload={async (payload) => {
            if (editProduct) {
              await api(`/api/admin/products/${editProduct.id}`, {
                method: 'PATCH',
                body: {
                  name: payload.name,
                  nameEs: payload.nameEs ?? null,
                  nameAr: payload.nameAr ?? null,
                  description: payload.description,
                  descriptionEs: payload.descriptionEs ?? null,
                  descriptionAr: payload.descriptionAr ?? null,
                  price: payload.price,
                  category: payload.category ?? null,
                  image: payload.image ?? null,
                  imagePublicId: payload.imagePublicId ?? null,
                  images: payload.images,
                  imagePublicIds: payload.imagePublicIds,
                  options: payload.options,
                  optionsEs: payload.optionsEs,
                  optionsAr: payload.optionsAr,
                  allowCustomerMessage: payload.allowCustomerMessage,
                  customerMessageLabel: payload.customerMessageLabel,
                  customerMessageLabelEs: payload.customerMessageLabelEs ?? null,
                  customerMessageLabelAr: payload.customerMessageLabelAr ?? null,
                },
              });
            } else {
              await api(`/api/admin/users/${sellerId}/products`, {
                method: 'POST',
                body: {
                  name: payload.name,
                  nameEs: payload.nameEs ?? null,
                  nameAr: payload.nameAr ?? null,
                  description: payload.description,
                  descriptionEs: payload.descriptionEs ?? null,
                  descriptionAr: payload.descriptionAr ?? null,
                  price: payload.price,
                  category: payload.category ?? null,
                  image: payload.image ?? null,
                  imagePublicId: payload.imagePublicId ?? null,
                  images: payload.images,
                  imagePublicIds: payload.imagePublicIds,
                  options: payload.options,
                  optionsEs: payload.optionsEs,
                  optionsAr: payload.optionsAr,
                  allowCustomerMessage: payload.allowCustomerMessage,
                  customerMessageLabel: payload.customerMessageLabel,
                  customerMessageLabelEs: payload.customerMessageLabelEs ?? null,
                  customerMessageLabelAr: payload.customerMessageLabelAr ?? null,
                },
              });
            }
          }}
        />
      )}

      {viewProduct && (
        <ProductViewDialog
          product={adminProductToForm(viewProduct)}
          currencyCode={seller.currency}
          onClose={() => setViewProduct(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteProductId}
        title="Delete product?"
        message="This permanently removes the product."
        confirmLabel={deletingProduct ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        danger
        loading={deletingProduct}
        adminBusy
        onConfirm={() => void confirmDeleteProduct()}
        onCancel={() => !deletingProduct && setDeleteProductId(null)}
      />
    </>
  );
}
