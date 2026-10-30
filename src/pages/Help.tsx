import { Search } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import PublicLayout from '@/components/PublicLayout';
import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import {
  HELP_ARTICLES,
  HELP_CATEGORY_IDS,
  type HelpArticleCopy,
  type HelpCategoryId,
} from '@/lib/helpCatalog';
import { fadeUp, motionEase } from '@/lib/motion';

export default function Help() {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<HelpCategoryId | 'all'>('all');

  useEffect(() => {
    document.title = t('help.metaTitle');
  }, [t, i18n.language]);

  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  const filtered = HELP_ARTICLES.filter((meta) => {
    if (category !== 'all' && meta.category !== category) return false;
    if (!q) return true;
    const copy = t(`help.articles.${meta.slug}`, { returnObjects: true }) as HelpArticleCopy;
    const haystack = [
      meta.slug,
      meta.category,
      ...meta.keywords,
      copy.title,
      copy.excerpt,
      copy.intro,
      ...(Array.isArray(copy.steps) ? copy.steps : []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q) || q.split(' ').every((part) => part && haystack.includes(part));
  });

  const chips: { id: HelpCategoryId | 'all'; label: string }[] = [
    { id: 'all', label: t('help.categories.all') },
    ...HELP_CATEGORY_IDS.map((id) => ({
      id,
      label: t(`help.categories.${id}`),
    })),
  ];

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className={heroBleedClassName}>
          <HeroAtmosphere sparkleId="help-hero-sparkles" variant="home" />
          <div className="relative z-10 mx-auto flex min-h-[42vh] w-full max-w-6xl flex-col justify-end px-6 pt-16 pb-14 md:min-h-[48vh] md:pt-20 md:pb-20">
            <motion.div
              className="max-w-2xl space-y-5"
              initial={reduce ? false : 'hidden'}
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: reduce ? 0 : 0.1 },
                },
              }}
            >
              <motion.span
                className="border-border/70 bg-background/70 text-muted-foreground inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase backdrop-blur-sm"
                variants={fadeUp(0.65, 18)}
              >
                {t('help.hero.eyebrow')}
              </motion.span>
              <motion.h1
                className="text-foreground max-w-[16ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.2rem] lg:leading-[1.08]"
                variants={fadeUp(0.7, 22)}
              >
                {t('help.hero.title')}
              </motion.h1>
              <motion.p
                className="text-muted-foreground max-w-[46ch] text-base leading-7 sm:text-lg sm:leading-8"
                variants={fadeUp(0.7, 20)}
              >
                {t('help.hero.body')}
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="relative border-t border-border bg-surface dark:bg-background">
          <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
            <label className="sr-only" htmlFor="help-search">
              {t('help.searchLabel')}
            </label>
            <div className="relative max-w-xl">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
                aria-hidden
              />
              <input
                id="help-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('help.searchPlaceholder')}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border py-3 ps-10 pe-4 text-sm font-medium shadow-sm outline-none transition-[border-color,box-shadow] focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-500"
              />
            </div>

            <div
              className="mt-6 flex flex-wrap gap-2"
              role="tablist"
              aria-label={t('help.categories.all')}
            >
              {chips.map((chip) => {
                const active = category === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(chip.id)}
                    className={
                      active
                        ? 'rounded-full bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white dark:bg-brand-500'
                        : 'border-border text-foreground hover:border-brand-300 hover:text-brand-800 dark:hover:border-brand-600 dark:hover:text-brand-200 rounded-full border bg-background px-3.5 py-2 text-sm font-medium transition-colors'
                    }
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <p className="text-muted-foreground mt-8 text-sm font-medium">
              {t('help.resultsCount', { count: filtered.length })}
            </p>

            {filtered.length === 0 ? (
              <div className="mt-8 max-w-lg space-y-4">
                <h2 className="text-foreground text-xl font-semibold tracking-tight">
                  {t('help.noResults.title')}
                </h2>
                <p className="text-muted-foreground text-base leading-7">
                  {t('help.noResults.body')}
                </p>
                <Link
                  to="/contact"
                  className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white no-underline transition-colors"
                >
                  {t('help.noResults.cta')}
                </Link>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {filtered.map((meta, index) => {
                  const copy = t(`help.articles.${meta.slug}`, {
                    returnObjects: true,
                  }) as HelpArticleCopy;
                  return (
                    <motion.li
                      key={meta.slug}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        duration: 0.55,
                        delay: reduce ? 0 : Math.min(index, 5) * 0.04,
                        ease: motionEase,
                      }}
                      className="py-6 first:pt-2 last:pb-0 md:py-7"
                    >
                      <Link
                        to={`/help/${meta.slug}`}
                        className="group block text-inherit no-underline"
                      >
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          {t(`help.categories.${meta.category}`)}
                        </p>
                        <h2 className="text-foreground group-hover:text-brand-700 dark:group-hover:text-brand-300 mt-1.5 text-lg font-semibold tracking-tight transition-colors sm:text-xl">
                          {copy.title}
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-[62ch] text-sm leading-6 sm:text-base sm:leading-7">
                          {copy.excerpt}
                        </p>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
