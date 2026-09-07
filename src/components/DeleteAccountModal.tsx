import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { AdminLoadingInline } from './DashboardLoading';
import { DASHBOARD_ICON_CLOSE_BTN } from '../lib/dashboardFormClasses';

type Props = {
  open: boolean;
  expectedPhrase: string;
  phrase: string;
  onPhraseChange: (value: string) => void;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteAccountModal({
  open,
  expectedPhrase,
  phrase,
  onPhraseChange,
  deleting,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  if (!open) return null;

  const canSubmit = phrase.trim() === expectedPhrase && !deleting;

  return (
    <div
      className="fixed inset-0 z-[200] flex max-lg:items-end lg:items-center justify-center p-0 max-lg:p-0 lg:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !deleting && onClose()}
    >
      <div
        className="w-full max-w-lg max-lg:max-w-none max-lg:max-h-[92vh] max-lg:overflow-y-auto max-lg:rounded-t-2xl max-lg:rounded-b-none lg:rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 p-4 max-lg:p-4 lg:p-6 shadow-xl dark:shadow-black/40"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-modal-title"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 id="delete-account-modal-title" className="text-lg font-bold text-stone-900 dark:text-zinc-100">
            {t('dashboard.deleteModal.title')}
          </h3>
          <button
            type="button"
            onClick={() => !deleting && onClose()}
            disabled={deleting}
            className={`${DASHBOARD_ICON_CLOSE_BTN} h-8 w-8 disabled:opacity-50`}
            aria-label={t('dashboard.common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-stone-600 dark:text-zinc-300 mb-4">
          {t('dashboard.deleteModal.confirmPrompt')}{' '}
          <kbd className="rounded border border-stone-300 dark:border-zinc-600 bg-stone-100 dark:bg-zinc-950 px-1.5 py-0.5 font-mono text-xs text-stone-900 dark:text-zinc-100">
            {expectedPhrase}
          </kbd>{' '}
          {t('dashboard.deleteModal.inBoxBelow')}
        </p>
        <input
          type="text"
          value={phrase}
          onChange={(e) => onPhraseChange(e.target.value)}
          autoComplete="off"
          placeholder={expectedPhrase}
          disabled={deleting}
          className="w-full rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 font-mono text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder-zinc-500 focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 mb-6"
        />
        <div className="flex flex-col max-lg:flex-col sm:flex-row gap-2 max-lg:gap-2 sm:gap-3">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onConfirm}
            className="inline-flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {deleting ? <AdminLoadingInline light dotsOnly /> : null}
            {deleting ? t('dashboard.deleteModal.deleting') : t('dashboard.deleteModal.confirmBtn')}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="inline-flex flex-1 min-w-0 items-center justify-center rounded-xl border-2 border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {t('dashboard.common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
