import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import PublicLayout from '@/components/PublicLayout';
import { HELP_ARTICLES, type HelpArticleCopy } from '@/lib/helpCatalog';
import { fadeUp, motionEase } from '@/lib/motion';

export default function HelpArticle() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const meta = HELP_ARTICLES.find((a) => a.slug === slug);
  const copy = meta
    ? (t(`help.articles.${meta.slug}`, { returnObjects: true }) as HelpArticleCopy)
    : null;

  useEffect(() => {
    document.title =
      meta && copy?.title
        ? t('help.metaTitleArticle', { title: copy.title })
        : t('help.metaTitle');
  }, [meta, copy, t, i18n.language]);

  if (!meta || !copy?.title || !Array.isArray(copy?.steps)) {
    return (
      <PublicLayout>
        <div className="home-marketing mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center px-6 py-24">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            {t('help.notFound.title')}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-[40ch] text-base leading-7">
            {t('help.notFound.body')}
          </p>
          <Link
            to="/help"
            className="text-brand-700 hover:text-brand-800 dark:text-brand-300 mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold no-underline"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t('help.notFound.cta')}
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const related = meta.related
    .map((relatedSlug) => {
      if (!HELP_ARTICLES.some((a) => a.slug === relatedSlug)) return null;
      const relatedCopy = t(`help.articles.${relatedSlug}`, {
        returnObjects: true,
      }) as HelpArticleCopy;
      if (!relatedCopy?.title) return null;
      return { slug: relatedSlug, title: relatedCopy.title };
    })
    .filter(Boolean) as { slug: string; title: string }[];

  return (
    <PublicLayout>
      <article className="home-marketing min-w-0 w-full overflow-x-clip">
        <header className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-3xl px-6 pt-14 pb-12 md:pt-20 md:pb-16">
            <motion.div
              initial={reduce ? false : 'hidden'}
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: reduce ? 0 : 0.08 },
                },
              }}
              className="space-y-6"
            >
              <motion.div variants={fadeUp(0.55, 14)}>
                <Link
                  to="/help"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
                >
                  <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
                  {t('help.article.back')}
                </Link>
              </motion.div>

              <motion.p
                className="text-muted-foreground text-sm font-medium tracking-wide uppercase"
                variants={fadeUp(0.6, 16)}
              >
                {t(`help.categories.${meta.category}`)}
              </motion.p>

              <motion.h1
                className="text-foreground text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
                variants={fadeUp(0.7, 20)}
              >
                {copy.title}
              </motion.h1>

              <motion.p
                className="text-muted-foreground max-w-[58ch] text-base leading-7 sm:text-lg sm:leading-8"
                variants={fadeUp(0.65, 16)}
              >
                {copy.intro}
              </motion.p>
            </motion.div>
          </div>
        </header>

        <div className="bg-surface dark:bg-background">
          <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              {t('help.article.stepsHeading')}
            </h2>
            <ol className="mt-6 space-y-5">
              {copy.steps.map((step, index) => (
                <motion.li
                  key={`${meta.slug}-${index}`}
                  className="flex gap-4"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.5,
                    delay: reduce ? 0 : Math.min(index, 6) * 0.04,
                    ease: motionEase,
                  }}
                >
                  <span className="bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
                    {index + 1}
                  </span>
                  <p className="text-stone-600 dark:text-zinc-300 max-w-[58ch] pt-1 text-base font-medium leading-7">
                    {step}
                  </p>
                </motion.li>
              ))}
            </ol>

            {meta.slug === 'request-refund' ? (
              <p className="mt-8">
                <Link
                  to="/refund-policy"
                  className="text-brand-700 hover:text-brand-800 dark:text-brand-300 text-sm font-semibold no-underline"
                >
                  {t('help.article.refundPolicyLink')}
                </Link>
              </p>
            ) : null}

            {related.length > 0 ? (
              <section className="border-border mt-14 border-t pt-10">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                  {t('help.article.related')}
                </h2>
                <ul className="mt-4 space-y-3">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={`/help/${item.slug}`}
                        className="text-foreground hover:text-brand-700 dark:hover:text-brand-300 group inline-flex items-baseline gap-2 text-base font-medium no-underline transition-colors"
                      >
                        <span
                          className="bg-border group-hover:bg-brand mt-2 h-px w-4 shrink-0 transition-colors"
                          aria-hidden
                        />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="border-border mt-14 border-t pt-10">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                {t('help.article.stillNeedHelp')}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-[48ch] text-base leading-7">
                {t('help.article.stillNeedHelpBody')}
              </p>
              <Link
                to="/contact"
                className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400 mt-5 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white no-underline transition-colors"
              >
                {t('help.article.contactCta')}
              </Link>
            </section>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
