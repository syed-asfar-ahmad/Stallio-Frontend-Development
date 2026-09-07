import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import SupportChatPanel from '../components/SupportChatPanel';
import { DASHBOARD_BTN_OUTLINE } from '../lib/dashboardFormClasses';

export default function DashboardSupportChat() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef<(() => Promise<void>) | null>(null);
  const registerRefresh = useCallback((refresh: () => void | Promise<void>) => {
    refreshRef.current = async () => {
      await refresh();
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!refreshRef.current || refreshing) return;
    setRefreshing(true);
    try {
      await refreshRef.current();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100dvh-7rem)] max-lg:min-h-[calc(100dvh-6rem)] flex-col min-w-0">
        <div className="mb-4 max-lg:mb-4 lg:mb-4 flex shrink-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-snug">
              {t('dashboard.supportChat.title')}
            </h1>
            <p className="mt-0.5 max-lg:mt-0.5 lg:mt-1 text-xs max-lg:text-xs lg:text-sm text-stone-500 dark:text-zinc-400">
              {t('dashboard.supportChat.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className={`${DASHBOARD_BTN_OUTLINE} w-full lg:w-auto shrink-0 justify-center max-lg:py-2.5 max-lg:text-sm disabled:opacity-60`}
            aria-busy={refreshing}
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? t('dashboard.common.refreshing') : t('dashboard.common.refresh')}
          </button>
        </div>
        <SupportChatPanel
          mode="seller"
          className="flex-1 min-h-[min(520px,calc(100dvh-12rem))] max-lg:min-h-[min(480px,calc(100dvh-11rem))] lg:min-h-0"
          showFooterRefresh={false}
          onRegisterRefresh={registerRefresh}
        />
      </div>
    </DashboardLayout>
  );
}
