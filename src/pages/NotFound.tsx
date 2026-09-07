import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, CreditCard, Mail } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

export default function NotFound() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('notFound.metaTitle');
  }, [t]);

  return (
    <PublicLayout>
      <div className="home-marketing flex min-h-0 min-w-0 w-full flex-1 flex-col items-center justify-center overflow-x-clip px-4 py-12 text-center max-lg:py-16 sm:py-20 md:py-28">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600 sm:text-sm dark:text-brand-400">404</p>
        <h1 className="home-headline mt-3 max-w-lg text-pretty text-2xl font-extrabold text-stone-900 max-lg:text-2xl dark:text-zinc-50 sm:text-3xl md:text-4xl">
          {t('notFound.title')}
        </h1>
        <p className="mt-4 max-w-md text-pretty text-[0.9375rem] font-medium leading-relaxed text-stone-600 sm:text-base dark:text-zinc-300">
          {t('notFound.body')}
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Link
            to="/"
            className="home-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white no-underline sm:w-auto sm:text-base"
          >
            <Home className="h-4 w-4" aria-hidden />
            {t('notFound.backHome')}
          </Link>
          <Link
            to="/pricing"
            className="home-btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-stone-800 no-underline sm:w-auto sm:text-base"
          >
            <CreditCard className="h-4 w-4" aria-hidden />
            {t('notFound.viewPricing')}
          </Link>
          <Link
            to="/contact"
            className="home-btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-stone-800 no-underline sm:w-auto sm:text-base"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {t('notFound.contactUs')}
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
