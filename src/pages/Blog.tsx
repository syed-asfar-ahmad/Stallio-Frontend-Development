import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import PublicLayout from '@/components/PublicLayout';
import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { fadeUp, motionEase } from '@/lib/motion';

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readMinutes: number;
};

function formatBlogDate(dateIso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale.split('-')[0], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateIso}T12:00:00`));
}

export default function Blog() {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const posts = t('blog.posts', { returnObjects: true }) as BlogPost[];

  useEffect(() => {
    document.title = t('blog.metaTitle');
  }, [t, i18n.language]);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className={heroBleedClassName}>
          <HeroAtmosphere sparkleId="blog-hero-sparkles" variant="home" />
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
                {t('blog.hero.eyebrow')}
              </motion.span>
              <motion.h1
                className="text-foreground max-w-[16ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.2rem] lg:leading-[1.08]"
                variants={fadeUp(0.7, 22)}
              >
                {t('blog.hero.title')}
              </motion.h1>
              <motion.p
                className="text-muted-foreground max-w-[42ch] text-base leading-7 sm:text-lg sm:leading-8"
                variants={fadeUp(0.7, 20)}
              >
                {t('blog.hero.body')}
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="relative border-t border-border bg-surface dark:bg-background">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
            <div className="space-y-0 divide-y divide-border">
              {posts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  className="py-8 first:pt-0 last:pb-0 md:py-10"
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.65,
                    delay: reduce ? 0 : Math.min(index, 4) * 0.05,
                    ease: motionEase,
                  }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group grid gap-4 text-inherit no-underline md:grid-cols-[9rem_minmax(0,1fr)_auto] md:items-start md:gap-8"
                  >
                    <div className="text-muted-foreground space-y-1 text-sm">
                      <time dateTime={post.date}>{formatBlogDate(post.date, i18n.language)}</time>
                      <p className="text-foreground/70 text-xs font-medium tracking-wide">
                        {post.category}
                      </p>
                    </div>

                    <div className="min-w-0 space-y-3">
                      <h2 className="text-foreground text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-brand-700 sm:text-2xl dark:group-hover:text-brand-300">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground max-w-[52ch] text-sm leading-relaxed sm:text-base sm:leading-7">
                        {post.excerpt}
                      </p>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {t('blog.byAuthor', { author: post.author })}
                        <span aria-hidden className="mx-2 text-border">
                          ·
                        </span>
                        {post.readMinutes} min
                      </p>
                    </div>

                    <span className="text-brand-700 group-hover:text-brand-800 dark:text-brand-300 dark:group-hover:text-brand-200 inline-flex items-center gap-1.5 self-start text-sm font-semibold transition-colors md:mt-1">
                      {t('blog.readMore')}
                      <ArrowUpRight className="size-4 rtl:rotate-[-90deg]" aria-hidden />
                    </span>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
