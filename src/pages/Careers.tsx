import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Laptop } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';

const TONE_MUTED =
  'bg-stone-100 text-stone-500 ring-stone-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-600';

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`home-reveal ${inView ? 'home-reveal--inview' : ''} ${className}`}>
      {children}
    </div>
  );
}

function SpotlightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty('--spot-x');
    el.style.removeProperty('--spot-y');
  };
  return (
    <div ref={ref} className={`home-spotlight ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

function InternshipCard({
  badge,
  title,
  description,
  highlights,
  closedLabel,
  closedAria,
}: {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  closedLabel: string;
  closedAria: string;
}) {
  return (
    <Reveal className="h-full">
      <SpotlightCard className="flex h-full flex-col rounded-[1.35rem] border border-stone-200/70 bg-white p-6 opacity-95 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow] duration-500 sm:rounded-[1.75rem] sm:p-8 dark:border-zinc-700/80 dark:bg-zinc-900">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${TONE_MUTED}`}
            aria-hidden
          >
            <Laptop className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.8125rem] font-semibold tracking-[0.04em] text-brand-700 dark:text-brand-400">
                {badge}
              </p>
              <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-stone-600 ring-1 ring-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600">
                {closedLabel}
              </span>
            </div>
            <h2 className="mt-2 text-balance text-xl font-extrabold leading-snug tracking-[-0.02em] text-stone-900 dark:text-zinc-50 sm:text-2xl">
              {title}
            </h2>
          </div>
        </div>

        <p className="mt-5 max-w-[42ch] text-sm font-medium leading-relaxed text-stone-600 dark:text-zinc-300 sm:text-base">
          {description}
        </p>

        <ul className="mt-6 space-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-stone-700 dark:text-zinc-200">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${TONE_MUTED}`}>
                <Check className="h-3 w-3" aria-hidden />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <button
            type="button"
            disabled
            aria-label={closedAria}
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-100 px-6 py-3.5 text-sm font-bold text-stone-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 sm:w-auto sm:text-base"
          >
            {closedLabel}
          </button>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

export default function Careers() {
  const { t } = useTranslation();
  const internshipTitle = t('careers.internship.title');
  const internshipHighlights = t('careers.internship.highlights', { returnObjects: true }) as string[];

  useEffect(() => {
    document.title = t('careers.metaTitle');
  }, [t]);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className={`${heroBleedClassName} bg-white text-stone-900 dark:bg-zinc-950 dark:text-zinc-50`}>
          <HeroAtmosphere sparkleId="careers-hero-sparkles" />

          <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 py-10 text-center max-lg:px-4 sm:py-14 md:px-5 md:py-24 lg:py-28">
            <p className="opacity-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-brand-600 animate-fade-up animation-delay-100 dark:text-brand-400">
              {t('careers.hero.eyebrow')}
            </p>
            <h1 className="home-headline opacity-0 mt-4 text-balance text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-stone-900 animate-fade-up animation-delay-150 dark:text-zinc-50 sm:mt-5 sm:text-[2rem] md:text-5xl lg:text-[3.15rem] lg:leading-[1.08]">
              {t('careers.hero.title')}
            </h1>
            <p className="opacity-0 mx-auto mt-4 max-w-[42ch] text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-200 dark:text-zinc-300 sm:mt-6 sm:text-base md:text-lg">
              {t('careers.hero.subtitle')}
            </p>
          </div>
        </section>

        <section
          id="open-roles"
          className="scroll-mt-28 border-t border-stone-200/80 bg-stone-50 py-12 dark:border-zinc-800 dark:bg-zinc-950 sm:py-16 md:py-24"
        >
          <div className="mx-auto w-full max-w-xl px-4 max-lg:px-4 sm:max-w-2xl md:px-5">
            <InternshipCard
              badge={t('careers.internship.badge')}
              title={internshipTitle}
              description={t('careers.internship.description')}
              highlights={internshipHighlights}
              closedLabel={t('careers.closed')}
              closedAria={t('careers.closedAria', { program: internshipTitle })}
            />
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
