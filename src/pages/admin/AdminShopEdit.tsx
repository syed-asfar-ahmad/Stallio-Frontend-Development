import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink, Store } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminSellerShopForm from '../../components/admin/AdminSellerShopForm';
import AdminSellerProductsPanel from '../../components/admin/AdminSellerProductsPanel';
import { adminTheme } from '../../components/admin/adminTheme';
import { api } from '../../lib/api';
import { pickShopFields } from '../../lib/adminShopFields';
import type { AdminSellerFull, AdminSellerShopFields } from '../../types/admin';

export default function AdminShopEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminSellerFull | null>(null);
  const [shopForm, setShopForm] = useState<AdminSellerShopFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await api<AdminSellerFull>(`/api/admin/users/${id}/detail`);
      setData(d);
      setShopForm(pickShopFields(d.seller));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load shop');
      navigate('/admin/shops');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveShop(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !shopForm) return;
    setSaving(true);
    try {
      await api(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: {
          ...shopForm,
          categories: shopForm.categories.filter((c) => c.name.trim()),
          footerSocialLinks: shopForm.footerSocialLinks.filter((l) => l.platform.trim() && l.url.trim()),
        },
      });
      toast.success('Shop Settings saved');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  const seller = data?.seller;

  return (
    <AdminLayout>
      <Link
        to="/admin/shops"
        className={`mb-3 max-lg:mb-3 lg:mb-5 inline-flex items-center gap-2 text-xs max-lg:text-xs lg:text-sm ${adminTheme.link}`}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back To Shop Settings
      </Link>

      {loading ? (
        <AdminLoading />
      ) : !seller || !shopForm || !data ? (
        <p className={adminTheme.muted}>Seller not found</p>
      ) : (
        <>
          <header className={`${adminTheme.card} mb-4 max-lg:mb-4 lg:mb-6 overflow-hidden min-w-0`}>
            <div className="bg-gradient-to-r from-brand-50/90 via-white to-brand-50/50 px-4 max-lg:px-4 py-5 max-lg:py-5 lg:px-6 lg:py-6 dark:from-brand-950/40 dark:via-zinc-900 dark:to-brand-950/25">
              <div className="flex flex-col gap-3 max-lg:gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-4 min-w-0">
                <div className="flex min-w-0 items-start gap-3 max-lg:gap-3 lg:gap-4">
                  {seller.logo ? (
                    <img
                      src={seller.logo}
                      alt=""
                      className="h-12 w-12 max-lg:h-12 lg:h-14 lg:w-14 shrink-0 rounded-2xl border-2 border-white object-cover shadow-md dark:border-zinc-700"
                    />
                  ) : (
                    <span className={`${adminTheme.statIcon} h-12 w-12 max-lg:h-12 lg:h-14 lg:w-14 rounded-2xl`}>
                      <Store className="h-6 w-6 max-lg:h-6 lg:h-7 lg:w-7" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] max-lg:text-[10px] lg:text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-400">
                      Storefront
                    </p>
                    <h1 className="mt-0.5 truncate text-xl max-lg:text-xl lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                      {seller.shopName}
                    </h1>
                    <p className={`mt-1 text-xs max-lg:text-xs lg:text-sm ${adminTheme.muted} flex flex-col gap-0.5 sm:max-lg:flex-row sm:max-lg:flex-wrap sm:max-lg:items-center sm:max-lg:gap-x-2`}>
                      <span>@{seller.username}</span>
                      <span className="hidden sm:max-lg:inline text-stone-400 dark:text-zinc-500" aria-hidden>
                        ·
                      </span>
                      <span className="truncate">{seller.email}</span>
                    </p>
                  </div>
                </div>
                <a
                  href={`/${seller.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${adminTheme.btnSecondary} inline-flex w-full max-lg:w-full lg:w-auto shrink-0 items-center justify-center gap-2`}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  View Live Shop
                </a>
              </div>
            </div>
          </header>

          <AdminSellerShopForm
            form={shopForm}
            onChange={setShopForm}
            onSubmit={saveShop}
            saving={saving}
            shopName={seller.shopName}
            currencyCode={seller.currency}
            productsPanel={
              <AdminSellerProductsPanel
                sellerId={seller.id}
                seller={seller}
                products={data.products}
                onReload={load}
              />
            }
          />
        </>
      )}
    </AdminLayout>
  );
}
