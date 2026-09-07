import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import PublicLayout from './PublicLayout';

export type LegalDocKey = 'legalPrivacy' | 'legalTerms' | 'legalRefund';

type Section = { heading: string; paragraphs: string[] };

export default function LegalDocumentPage({ docKey }: { docKey: LegalDocKey }) {
  const { t } = useTranslation();
  const sections = useMemo(
    () => t(`${docKey}.sections`, { returnObjects: true }) as Section[],
    [docKey, t],
  );

  useEffect(() => {
    document.title = t(`${docKey}.metaTitle`);
  }, [docKey, t]);

  return (
    <PublicLayout>
      <div className="home-marketing relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-clip border-b border-stone-200/80 bg-white dark:border-zinc-700 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand-200/70 to-transparent dark:via-brand-800/40"
          aria-hidden
        />
        <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 py-10 max-lg:px-4 max-lg:py-12 sm:py-12 md:px-5 md:py-14 lg:py-16">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg py-1 text-sm font-semibold text-brand-700 no-underline transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
            {t('legalDoc.backHome')}
          </Link>

          <div className="marketing-pricing-shell mt-6 min-w-0 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.25)] max-lg:mt-6 sm:mt-8 sm:rounded-[1.75rem] md:mt-10 md:rounded-[2rem]">
            <div className="border-b border-stone-100 bg-gradient-to-br from-brand-50/70 via-white to-white px-4 py-6 max-lg:py-6 sm:px-8 sm:py-10 dark:border-zinc-700/80 dark:from-brand-950/30 dark:via-zinc-900 dark:to-zinc-900">
              <h1 className="home-headline text-pretty text-2xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-50 max-lg:text-2xl sm:text-3xl md:text-4xl">
                {t(`${docKey}.title`)}
              </h1>
              <p className="mt-3 text-sm font-semibold text-stone-500 dark:text-zinc-400">
                {t('legalDoc.lastUpdated')}
              </p>
              <p className="mt-3 max-w-none text-[0.9375rem] font-medium leading-relaxed text-stone-600 dark:text-zinc-300 max-lg:mt-3 sm:mt-4 sm:text-base md:text-lg">
                {t(`${docKey}.intro`)}
              </p>
            </div>

            <div className="min-w-0 px-4 py-6 max-lg:py-6 sm:px-8 sm:py-10">
              <div className="space-y-4 sm:space-y-8 lg:space-y-10">
                {sections.map((sec, si) => (
                  <section
                    key={sec.heading}
                    className="relative isolate scroll-mt-24 rounded-xl border border-stone-100 bg-stone-50/50 p-3.5 max-lg:p-3.5 sm:rounded-2xl sm:p-6 dark:border-zinc-700/80 dark:bg-zinc-800/25"
                  >
                    <div
                      className="absolute start-0 top-4 bottom-4 w-1 rounded-full bg-brand-500 dark:bg-brand-500 sm:top-6 sm:bottom-6"
                      aria-hidden
                    />
                    <div className="min-w-0 ps-3.5 sm:ps-5">
                      <h2 className="text-pretty text-base font-extrabold tracking-tight text-stone-900 dark:text-zinc-50 sm:text-xl">
                        {sec.heading}
                      </h2>
                      <div className="mt-3 space-y-3 text-[0.875rem] font-medium leading-[1.65] break-words text-stone-600 [overflow-wrap:anywhere] dark:text-zinc-300 sm:mt-4 sm:space-y-3.5 sm:text-[0.9375rem] sm:leading-[1.7]">
                        {sec.paragraphs.map((p, pi) => (
                          <p key={`${si}-${pi}`}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
