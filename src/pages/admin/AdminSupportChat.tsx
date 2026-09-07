import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Headphones, MessageCircle, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoading from '../../components/admin/AdminLoading';
import SupportChatPanel from '../../components/SupportChatPanel';
import { adminTheme } from '../../components/admin/adminTheme';
import { api } from '../../lib/api';

type Conversation = {
  sellerId: string;
  shopName: string;
  username: string;
  email: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSenderRole: string | null;
  unreadCount: number;
};

export default function AdminSupportChat() {
  const { sellerId: routeSellerId } = useParams<{ sellerId?: string }>();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(routeSellerId ?? null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (query) params.set('search', query);
      const data = await api<{ conversations: Conversation[]; totalUnread?: number }>(
        `/api/support-chat/admin/conversations?${params}`,
      );
      setConversations(data.conversations ?? []);
      if (typeof data.totalUnread === 'number') {
        window.dispatchEvent(
          new CustomEvent('admin-support-chat-unread', { detail: { unreadCount: data.totalUnread } }),
        );
      }
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 10000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (routeSellerId) setSelectedId(routeSellerId);
  }, [routeSellerId]);

  const selected = conversations.find((c) => c.sellerId === selectedId);
  const activeSellerId = selectedId ?? routeSellerId ?? undefined;
  const sellerLabel = selected
    ? `${selected.shopName} (@${selected.username})`
    : routeSellerId
      ? 'Seller'
      : undefined;

  function selectSeller(id: string) {
    setSelectedId(id);
    navigate(`/admin/support-chat/${id}`, { replace: true });
  }

  function backToList() {
    setSelectedId(null);
    navigate('/admin/support-chat', { replace: true });
  }

  const showMobileChat = Boolean(activeSellerId);

  return (
    <AdminLayout>
      <div className="mb-4 max-lg:mb-4 lg:mb-5 min-w-0">
        <div className="mb-1 flex items-center gap-2 text-brand-700 dark:text-brand-400">
          <Headphones className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-widest lg:text-sm">Admin</span>
        </div>
        <h1 className="text-xl max-lg:leading-snug lg:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          Seller Support Chat
        </h1>
        <p className="mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
          Chat with sellers. They can also message you from their dashboard.
        </p>
      </div>

      <div className="flex min-h-[min(72vh,calc(100dvh-11rem))] max-lg:min-h-[min(68vh,calc(100dvh-10rem))] min-h-[480px] gap-0 max-lg:gap-0 lg:gap-4 flex-col lg:flex-row min-w-0">
        <aside
          className={`flex w-full shrink-0 flex-col overflow-hidden rounded-2xl max-lg:rounded-xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 min-h-0 ${
            showMobileChat ? 'hidden lg:flex' : 'flex'
          } lg:w-80 lg:max-h-none max-lg:flex-1`}
        >
          <form
            className="shrink-0 border-b border-stone-100 p-3 max-lg:p-3 dark:border-zinc-800"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search.trim());
            }}
          >
            <div className="flex gap-2 min-w-0">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sellers..."
                  className={`${adminTheme.input} pl-9`}
                />
              </div>
              <button type="submit" className={`${adminTheme.btnPrimary} shrink-0 px-3`}>
                Go
              </button>
            </div>
          </form>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="p-4">
                <AdminLoading compact />
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-stone-500 dark:text-zinc-400">
                No conversations yet. Sellers appear here when they message support.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
                {conversations.map((c) => {
                  const active = c.sellerId === selectedId;
                  return (
                    <li key={c.sellerId}>
                      <button
                        type="button"
                        onClick={() => selectSeller(c.sellerId)}
                        className={`flex w-full gap-3 px-4 py-3 max-lg:py-3.5 text-left transition hover:bg-stone-50 dark:hover:bg-zinc-800/60 ${
                          active ? 'bg-brand-50 dark:bg-brand-950/30' : ''
                        }`}
                      >
                        <MessageCircle
                          className={`mt-0.5 h-5 w-5 shrink-0 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-stone-400 dark:text-zinc-500'}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="truncate font-semibold text-stone-900 dark:text-zinc-100">
                              {c.shopName}
                            </span>
                            {c.unreadCount > 0 && (
                              <span className="inline-flex min-w-5 h-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                {c.unreadCount > 99 ? '99+' : c.unreadCount}
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-stone-500 dark:text-zinc-400">
                            @{c.username}
                          </span>
                          {c.lastMessage ? (
                            <span className="mt-1 block truncate text-xs text-stone-600 dark:text-zinc-300">
                              {c.lastMessage}
                            </span>
                          ) : null}
                          {c.lastMessageAt ? (
                            <span className="mt-0.5 block text-[10px] text-stone-400 dark:text-zinc-500">
                              {format(new Date(c.lastMessageAt), 'MMM d, h:mm a')}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <div
          className={`min-h-[360px] max-lg:min-h-[min(60vh,calc(100dvh-12rem))] flex-1 flex-col min-w-0 ${
            showMobileChat ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {showMobileChat ? (
            <button
              type="button"
              onClick={backToList}
              className={`lg:hidden mb-2 inline-flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800`}
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to conversations
            </button>
          ) : null}
          <SupportChatPanel
            mode="admin"
            sellerId={activeSellerId}
            sellerLabel={sellerLabel}
            className="min-h-0 flex-1"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
