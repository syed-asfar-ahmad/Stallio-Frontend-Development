import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Send, RefreshCw } from 'lucide-react';
import AdminLoading, { AdminLoadingInline } from './admin/AdminLoading';
import { api } from '../lib/api';
import { DASHBOARD_PRESSABLE } from '../lib/dashboardFormClasses';

export type SupportChatMessage = {
  id: string;
  senderRole: 'seller' | 'admin';
  body: string;
  readAt: string | null;
  createdAt: string;
};

type Mode = 'seller' | 'admin';

type Props = {
  mode: Mode;
  sellerId?: string;
  sellerLabel?: string;
  className?: string;
  showFooterRefresh?: boolean;
  onRegisterRefresh?: (refresh: () => void | Promise<void>) => void;
};

const POLL_MS = 5000;

export default function SupportChatPanel({
  mode,
  sellerId,
  sellerLabel,
  className = '',
  showFooterRefresh = true,
  onRegisterRefresh,
}: Props) {
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchPath =
    mode === 'seller'
      ? '/api/support-chat'
      : sellerId
        ? `/api/support-chat/admin/sellers/${sellerId}`
        : null;

  const load = useCallback(async (opts?: { manual?: boolean }) => {
    if (!fetchPath) return;
    if (opts?.manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await api<{ messages: SupportChatMessage[] }>(fetchPath);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError('');
      if (mode === 'admin') {
        window.dispatchEvent(new Event('admin-support-chat-refresh'));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchPath, mode]);

  useEffect(() => {
    if (!fetchPath) return;
    void load();
    const id = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchPath, load]);

  useEffect(() => {
    onRegisterRefresh?.(() => load({ manual: true }));
  }, [load, onRegisterRefresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    if (mode === 'admin' && !sellerId) return;

    setSending(true);
    setError('');
    try {
      const postPath =
        mode === 'seller' ? '/api/support-chat' : `/api/support-chat/admin/sellers/${sellerId}`;
      const created = await api<SupportChatMessage>(postPath, {
        method: 'POST',
        body: { body },
      });
      setMessages((prev) => [...prev, created]);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  if (mode === 'admin' && !sellerId) {
    return (
      <div
        className={`flex flex-1 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50/80 p-8 text-sm text-stone-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 ${className}`}
      >
        Select a seller to start chatting
      </div>
    );
  }

  const myRole = mode === 'seller' ? 'seller' : 'admin';

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl max-lg:rounded-xl lg:rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900 min-w-0 ${className}`}
    >
      {sellerLabel && mode === 'admin' && (
        <header className="shrink-0 border-b border-stone-100 px-3 max-lg:px-3 lg:px-4 py-2.5 max-lg:py-2.5 lg:py-3 dark:border-zinc-800">
          <p className="text-sm max-lg:text-sm lg:text-sm font-semibold text-stone-900 dark:text-zinc-100 truncate">{sellerLabel}</p>
          <p className="text-[11px] max-lg:text-[11px] lg:text-xs text-stone-500 dark:text-zinc-400">Platform support chat</p>
        </header>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 max-lg:p-3 lg:p-4">
        {loading && messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <AdminLoading compact />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <p className="text-center text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400 px-2">
              {mode === 'seller'
                ? 'No messages yet. Send a message to reach the Stallio team.'
                : 'No messages yet. Send the first message to this seller.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const mine = m.senderRole === myRole;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[min(85%,calc(100vw-4rem))] rounded-2xl max-lg:rounded-2xl px-3.5 max-lg:px-3.5 lg:px-4 py-2 max-lg:py-2 lg:py-2.5 text-sm max-lg:text-sm ${
                      mine
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : 'bg-stone-100 text-stone-800 rounded-bl-md dark:bg-zinc-800 dark:text-zinc-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${mine ? 'text-brand-100/90' : 'text-stone-400 dark:text-zinc-500'}`}
                    >
                      {format(new Date(m.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && <p className="shrink-0 px-4 pb-1 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <form
        onSubmit={handleSend}
        className="shrink-0 flex items-end gap-2 border-t border-stone-100 p-2.5 max-lg:p-2.5 lg:p-3 dark:border-zinc-800 min-w-0"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={mode === 'seller' ? 'Message to admin...' : 'Message to seller...'}
          rows={1}
          maxLength={4000}
          className="h-11 min-h-11 max-h-24 flex-1 min-w-0 resize-none overflow-y-auto rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm leading-5 text-stone-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 ${DASHBOARD_PRESSABLE}`}
          title="Send"
          aria-busy={sending}
        >
          {sending ? <AdminLoadingInline light dotsOnly /> : <Send className="h-5 w-5" />}
        </button>
        {showFooterRefresh && (
          <button
            type="button"
            onClick={() => void load({ manual: true })}
            disabled={refreshing}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800 ${DASHBOARD_PRESSABLE}`}
            title="Refresh"
            aria-busy={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </form>
    </div>
  );
}

