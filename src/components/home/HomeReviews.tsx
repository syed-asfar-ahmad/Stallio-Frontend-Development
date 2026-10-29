import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { motionEase } from '@/lib/motion';

type ReviewItem = {
  name: string;
  role: string;
  quote: string;
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ReviewCard({
  review,
  starsLabel,
  textDir,
}: {
  review: ReviewItem;
  starsLabel: string;
  textDir: 'ltr' | 'rtl';
}) {
  return (
    <blockquote
      dir={textDir}
      className="flex h-full min-h-[17rem] flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.18)] sm:min-h-[18.5rem] sm:p-7 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.65)]"
    >
      <div className="space-y-4">
        <span className="inline-flex gap-0.5 text-amber-500 dark:text-amber-400" aria-label={starsLabel}>
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
        </span>
        <p className="text-[0.9375rem] leading-7 text-stone-800 sm:text-base sm:leading-7 dark:text-zinc-100">
          {review.quote}
        </p>
      </div>
      <footer className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-5 dark:border-zinc-800">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {initialsFromName(review.name)}
        </span>
        <div className="min-w-0">
          <cite className="block text-sm font-semibold not-italic text-stone-900 dark:text-zinc-50">
            {review.name}
          </cite>
          <p className="text-sm text-stone-500 dark:text-zinc-400">{review.role}</p>
        </div>
      </footer>
    </blockquote>
  );
}

export function HomeReviews() {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const textDir = i18n.dir() === 'rtl' ? 'rtl' : 'ltr';
  const items = t('home.reviews.items', { returnObjects: true }) as ReviewItem[];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const updateNav = () => {
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft < max - 4);
    };
    el.scrollLeft = 0;
    updateNav();
    el.addEventListener('scroll', updateNav, { passive: true });
    const ro = new ResizeObserver(updateNav);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateNav);
      ro.disconnect();
    };
  }, [items.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.max(el.clientWidth * 0.85, 280) * direction;
    el.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (!Array.isArray(items) || items.length === 0) return null;

  const navBtnClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-[opacity,background-color,border-color] hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-brand-500/50 dark:hover:bg-zinc-800';

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_80%_0%,color-mix(in_srgb,var(--brand)_16%,transparent),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <motion.div
          className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: motionEase }}
        >
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded-full border border-stone-200/80 bg-white/80 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-stone-600 uppercase dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
              {t('home.reviews.eyebrow')}
            </span>
            <h2 className="text-section-heading text-stone-900 dark:text-zinc-50">
              {t('home.reviews.title')}
            </h2>
            <p className="max-w-[40ch] text-base leading-7 text-stone-600 sm:text-lg sm:leading-8 dark:text-zinc-400">
              {t('home.reviews.body')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start sm:self-end">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canPrev}
              aria-label={t('home.reviews.prev')}
              className={navBtnClass}
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canNext}
              aria-label={t('home.reviews.next')}
              className={navBtnClass}
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: motionEase }}
        >
          <div
            ref={scrollerRef}
            dir="ltr"
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={t('home.reviews.carouselAria')}
          >
            {items.map((review) => (
              <div
                key={review.name}
                className="w-[min(100%,20.5rem)] shrink-0 snap-start sm:w-[22rem]"
              >
                <ReviewCard
                  review={review}
                  starsLabel={t('home.reviews.starsLabel')}
                  textDir={textDir}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
