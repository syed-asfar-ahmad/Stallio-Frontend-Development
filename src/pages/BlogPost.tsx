import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import PublicLayout from '@/components/PublicLayout';
import { fadeUp, motionEase } from '@/lib/motion';

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readMinutes: number;
  paragraphs: string[];
};

function formatBlogDate(dateIso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale.split('-')[0], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateIso}T12:00:00`));
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const posts = t('blog.posts', { returnObjects: true }) as BlogPost[];
  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    document.title = post
      ? t('blog.metaTitlePost', { title: post.title })
      : t('blog.metaTitle');
  }, [post, t, i18n.language]);

  if (!post) {
    return (
      <PublicLayout>
        <div className="home-marketing mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center px-6 py-24">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            {t('blog.notFound.title')}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-[40ch] text-base leading-7">
            {t('blog.notFound.body')}
          </p>
          <Link
            to="/blog"
            className="text-brand-700 hover:text-brand-800 dark:text-brand-300 mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold no-underline"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t('blog.notFound.cta')}
          </Link>
        </div>
      </PublicLayout>
    );
  }

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
                  to="/blog"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
                >
                  <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
                  {t('blog.backToBlog')}
                </Link>
              </motion.div>

              <motion.p className="text-muted-foreground text-sm" variants={fadeUp(0.6, 16)}>
                <span className="text-foreground/80 font-medium">{post.category}</span>
                <span aria-hidden className="mx-2 text-border">
                  ·
                </span>
                <time dateTime={post.date}>{formatBlogDate(post.date, i18n.language)}</time>
                <span aria-hidden className="mx-2 text-border">
                  ·
                </span>
                {post.readMinutes} min
              </motion.p>

              <motion.h1
                className="text-foreground text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
                variants={fadeUp(0.7, 20)}
              >
                {post.title}
              </motion.h1>

              <motion.p
                className="text-muted-foreground text-base sm:text-lg"
                variants={fadeUp(0.65, 16)}
              >
                {t('blog.byAuthor', { author: post.author })}
              </motion.p>
            </motion.div>
          </div>
        </header>

        <div className="bg-surface dark:bg-background">
          <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-12 md:space-y-7 md:py-16">
            {post.paragraphs.map((paragraph, index) => (
              <motion.p
                key={`${post.slug}-${index}`}
                className="text-foreground/90 text-base leading-8 sm:text-[1.0625rem] sm:leading-8"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.55,
                  delay: reduce ? 0 : Math.min(index, 3) * 0.04,
                  ease: motionEase,
                }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
