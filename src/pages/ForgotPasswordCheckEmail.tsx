import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

export default function ForgotPasswordCheckEmail() {
  const { t } = useTranslation();

  return (
    <PublicLayout hideFooter>
      <div className="relative flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-stone-50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(91,69,229,0.14),transparent_55%)] dark:opacity-40"
          aria-hidden
        />
        <div className="relative w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex justify-center" aria-hidden>
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full bg-brand-400/20 motion-safe:animate-ping dark:bg-brand-400/12"
                style={{ animationDuration: '2.5s' }}
              />
              <div className="relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 shadow-[0_12px_40px_-12px_rgba(63,52,186,0.65)] ring-[6px] ring-brand-400/20 dark:from-brand-500 dark:via-brand-500 dark:to-brand-600 dark:shadow-[0_16px_48px_-16px_rgba(94,43,236,0.45)] dark:ring-brand-400/15">
                <Check className="h-11 w-11 text-white drop-shadow-sm" strokeWidth={3} aria-hidden />
              </div>
            </div>
          </div>

          <p className="text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
            {t('auth.forgot.confirmEyebrow')}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl dark:text-zinc-100">
            {t('auth.forgot.confirmTitle')}
          </h1>
          <p className="mx-auto mt-2 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800 ring-1 ring-brand-200/90 dark:bg-brand-950/60 dark:text-brand-200 dark:ring-brand-700/50">
            {t('auth.forgot.confirmBadge')}
          </p>

          <div className="mt-6 rounded-[1.35rem] border border-stone-200/90 bg-white/95 p-6 text-start shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)] ring-1 ring-stone-100/80 backdrop-blur-sm sm:rounded-3xl sm:p-8 dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:ring-zinc-800/80 dark:shadow-black/40">
            <p className="text-center text-sm font-medium leading-relaxed text-stone-600 sm:text-base dark:text-zinc-400">
              {t('auth.forgot.confirmBody')}
            </p>

            <p className="mt-6 border-t border-stone-100 pt-5 text-center dark:border-zinc-700">
              <Link
                to="/forgot-password"
                className="mb-3 block text-sm font-bold text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {t('auth.forgot.tryAnotherEmail')}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-brand-700 no-underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
                {t('auth.forgot.backToSignIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
