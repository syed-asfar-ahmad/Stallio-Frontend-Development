import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { ShopTestimonial } from '../../types';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import ShopSectionHeading from './ShopSectionHeading';

export const REVIEW_TEXT_MAX = 280;
export const REVIEW_NAME_MAX = 60;

const CARD_GAP_PX = 16;

function useVisibleReviewCount() {
  const [count, setCount] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCount(1);
      else if (w < 768) setCount(2);
      else if (w < 1024) setCount(3);
      else setCount(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return count;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function StarRating({ rating = 5 }: { rating?: number }) {
  const { t } = useShopLanguage();
  const n = Math.min(5, Math.max(1, Math.round(rating ?? 5)));
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-label={t('reviewsStars', { n })}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? 'fill-current' : 'fill-none opacity-30'}`} aria-hidden />
      ))}
    </span>
  );
}

function ReviewCard({ review, textDir }: { review: ShopTestimonial; textDir: 'ltr' | 'rtl' }) {
  return (
    <article
      dir={textDir}
      className="flex w-full flex-col overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface shadow-theme-card"
    >
      <div className="rounded-t-theme-card border-b border-theme-border bg-theme-primary-light px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-primary text-xs font-bold text-theme-badge-text">
            {initialsFromName(review.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold leading-snug text-theme-text">{review.name}</p>
            <div className="mt-0.5">
              <StarRating rating={review.rating} />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3.5">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-theme-text-secondary">{review.text}</p>
      </div>
    </article>
  );
}

type Props = {
  reviews: ShopTestimonial[];
  containerClass: string;
};

export default function ShopReviewsSection({ reviews, containerClass }: Props) {
  const { t, dir } = useShopLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const visibleCount = useVisibleReviewCount();
  const useCarousel = reviews.length > 3 && reviews.length > visibleCount;
  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const [index, setIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  const clampIndex = useCallback((i: number) => Math.min(Math.max(0, i), maxIndex), [maxIndex]);

  useEffect(() => {
    setIndex((i) => clampIndex(i));
  }, [clampIndex, visibleCount, reviews.length]);

  const measureSlides = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp || !useCarousel) {
      setSlideWidth(0);
      return;
    }
    const cs = getComputedStyle(vp);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const contentW = vp.clientWidth - padX;
    const gaps = CARD_GAP_PX * (visibleCount - 1);
    setSlideWidth(Math.max(0, (contentW - gaps) / visibleCount));
  }, [useCarousel, visibleCount]);

  useEffect(() => {
    measureSlides();
    window.addEventListener('resize', measureSlides);
    const vp = viewportRef.current;
    const ro = vp ? new ResizeObserver(measureSlides) : null;
    if (vp && ro) ro.observe(vp);
    return () => {
      window.removeEventListener('resize', measureSlides);
      ro?.disconnect();
    };
  }, [measureSlides, reviews.length]);

  const goPrev = () => setIndex((i) => clampIndex(i - 1));
  const goNext = () => setIndex((i) => clampIndex(i + 1));

  const offsetPx = index * (slideWidth + CARD_GAP_PX);

  const gridClass =
    reviews.length === 1
      ? 'mx-auto max-w-md'
      : reviews.length === 2
        ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
        : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <section className={`${containerClass} mt-6 max-lg:mt-6 pb-8 max-lg:pb-8 lg:mt-10 lg:pb-12`} aria-label={t('reviewsAria')}>
      <ShopSectionHeading
        title={t('reviewsTitle')}
        description={t('reviewsBody')}
        trailing={
          useCarousel ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={index <= 0}
                aria-label={t('reviewsPrev')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text shadow-theme-card hover:border-theme-primary hover:bg-theme-primary-light disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={index >= maxIndex}
                aria-label={t('reviewsNext')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text shadow-theme-card hover:border-theme-primary hover:bg-theme-primary-light disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
              </button>
            </>
          ) : null
        }
      />

      <div className="rounded-theme-card border border-theme-border bg-theme-surface-secondary p-3 max-lg:p-3 lg:p-5">
        {useCarousel ? (
          <div ref={viewportRef} dir="ltr" className="w-full overflow-hidden px-1">
            <div
              className="flex items-start py-0.5 transition-transform duration-300 ease-out"
              style={{
                gap: CARD_GAP_PX,
                transform: slideWidth > 0 ? `translateX(-${offsetPx}px)` : undefined,
              }}
            >
              {reviews.map((review, i) => (
                <div
                  key={`${review.name}-${i}`}
                  className="shrink-0"
                  style={{ width: slideWidth > 0 ? slideWidth : undefined }}
                >
                  <ReviewCard review={review} textDir={dir} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={gridClass}>
            {reviews.map((review, i) => (
              <ReviewCard key={`${review.name}-${i}`} review={review} textDir={dir} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
