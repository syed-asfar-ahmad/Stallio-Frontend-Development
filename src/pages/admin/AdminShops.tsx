import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Pencil, Search, Store } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminLoading from '../../components/admin/AdminLoading';
import { adminTheme } from '../../components/admin/adminTheme';
import { api } from '../../lib/api';
import type { AdminSeller } from '../../types/admin';

const LIMIT = 20;

export default function AdminShops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminSeller[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const query = searchParams.get('search')?.trim() ?? '';
  const [search, setSearch] = useState(query);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (query) params.set('search', query);
      const data = await api<{ users: AdminSeller[]; total: number }>(`/api/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    load();
  }, [load]);

  function patchParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in updates)) next.set('page', '1');
    setSearchParams(next);
  }

  return (
    <AdminLayout>
      <div className="mb-5 max-lg:mb-5 lg:mb-6 min-w-0">
        <div className="mb-1 flex items-center gap-2 text-brand-700 dark:text-brand-400">
          <Store className="h-4 w-4 max-lg:h-4 lg:h-5 lg:w-5 shrink-0" aria-hidden />
          <span className="text-xs max-lg:text-xs lg:text-sm font-semibold uppercase tracking-widest">Admin</span>
        </div>
        <h1 className="text-xl max-lg:leading-snug lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          Shop Settings
        </h1>
        <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
          Edit home, announcements, categories, footer, delivery, and policies for each seller
        </p>
      </div>

      <section className={`mb-4 max-lg:mb-4 lg:mb-6 ${adminTheme.card} p-4 max-lg:p-4 lg:p-4 min-w-0`}>
        <form
          className="flex flex-col gap-2 max-lg:gap-2 lg:flex-row lg:items-center lg:gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            patchParams({ search: search.trim() || null });
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by shop, email, or username..."
              className={`${adminTheme.input} pl-10`}
            />
          </div>
          <button type="submit" className={`${adminTheme.btnPrimary} w-full max-lg:w-full lg:w-auto shrink-0`}>
            Search
          </button>
        </form>
      </section>

      <div className={`${adminTheme.tableWrap} min-w-0`}>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className={adminTheme.theadRow}>
                <th className={adminTheme.th}>Shop</th>
                <th className={adminTheme.th}>Email</th>
                <th className={adminTheme.th}>Username</th>
                <th className={adminTheme.th}>Joined</th>
                <th className={adminTheme.th}>Actions</th>
              </tr>
            </thead>
            <tbody className={adminTheme.tbodyDivide}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-2">
                    <AdminLoading compact />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-4 py-8 text-center ${adminTheme.muted}`}>
                    No sellers match your search
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={adminTheme.rowHover}>
                    <td className={adminTheme.td}>
                      <p className="font-medium text-stone-900 dark:text-zinc-100">{u.shopName}</p>
                      {u.suspended && (
                        <span className={`mt-1 inline-block ${adminTheme.badgeSuspended}`}>Suspended</span>
                      )}
                    </td>
                    <td className={adminTheme.td}>{u.email}</td>
                    <td className={`${adminTheme.td} ${adminTheme.muted}`}>@{u.username}</td>
                    <td className={`${adminTheme.td} ${adminTheme.muted}`}>
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className={adminTheme.td}>
                      <Link
                        to={`/admin/shops/${u.id}`}
                        className={`${adminTheme.link} inline-flex items-center gap-1.5`}
                      >
                        <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                        Edit Shop
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden min-w-0">
          {loading ? (
            <div className="p-4">
              <AdminLoading compact />
            </div>
          ) : users.length === 0 ? (
            <p className={`px-4 py-8 text-center text-sm ${adminTheme.muted}`}>No sellers match your search</p>
          ) : (
            <ul className={`divide-y ${adminTheme.divide}`}>
              {users.map((u) => (
                <li key={u.id} className="flex flex-col gap-3 p-4 min-w-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-zinc-100 truncate">{u.shopName}</p>
                    <p className={`text-xs ${adminTheme.muted}`}>@{u.username}</p>
                    <p className="mt-1 text-xs text-stone-600 dark:text-zinc-400 truncate">{u.email}</p>
                    <p className={`mt-1 text-xs ${adminTheme.muted}`}>
                      Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </p>
                    {u.suspended ? (
                      <span className={`mt-2 inline-block ${adminTheme.badgeSuspended}`}>Suspended</span>
                    ) : null}
                  </div>
                  <Link
                    to={`/admin/shops/${u.id}`}
                    className={`${adminTheme.btnPrimary} inline-flex w-full items-center justify-center gap-1.5 no-underline`}
                  >
                    <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                    Edit Shop
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && total > 0 && (
          <AdminPagination
            embedded
            className="mx-3 max-lg:mx-3 lg:mx-4 mb-4"
            page={page}
            total={total}
            limit={LIMIT}
            onPage={(p) => patchParams({ page: String(p) })}
          />
        )}
      </div>
    </AdminLayout>
  );
}
