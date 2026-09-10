import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Check, ExternalLink, Sun } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';

const INTERNSHIP_FORM_URL = 'https://forms.gle/sLyEVVnSfDG6Lmf39';
const AMBASSADOR_FORM_URL = 'https://forms.gle/9DjnukUrwMTuDTj6A';

function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
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
    <div
      ref={ref}
      className={`home-reveal ${inView ? 'home-reveal--inview' : ''} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
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

type ProgramCardProps = {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  applyUrl: string;
  applyLabel: string;
  applyAria: string;
  closedLabel?: string;
  closed?: boolean;
  icon: typeof GraduationCap;
  accentClass: string;
  delayMs?: number;
};

function ProgramCard({
  badge,
  title,
  description,
  highlights,
  applyUrl,
  applyLabel,
  applyAria,
  closedLabel,
  closed = false,
  icon: Icon,
  accentClass,
  delayMs = 0,
}: ProgramCardProps) {
  return (
    <Reveal delayMs={delayMs}>
      <SpotlightCard className="h-full rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm shadow-stone-200/40 dark:border-zinc-700/90 dark:bg-zinc-900 dark:shadow-black/20 sm:p-8">
        <div className="flex h-full flex-col">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${accentClass}`}
              aria-hidden
            >
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">{badge}</p>
                {closed && closedLabel ? (
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-stone-600 ring-1 ring-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600">
                    {closedLabel}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-2 text-balance text-xl font-bold leading-snug text-stone-900 dark:text-zinc-50 sm:text-2xl">{title}</h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-stone-600 dark:text-zinc-300 sm:text-base">{description}</p>
          <ul className="mt-6 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-stone-700 dark:text-zinc-200">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:ring-brand-800/60">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-2">
            {closed ? (
              <button
                type="button"
                disabled
                aria-label={applyAria}
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-stone-200 px-6 py-3.5 text-sm font-bold text-stone-500 sm:w-auto sm:text-base dark:bg-zinc-800 dark:text-zinc-500"
              >
                {applyLabel}
                <ExternalLink className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              </button>
            ) : (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={applyAria}
                className="home-btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white no-underline sm:w-auto sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {applyLabel}
                  <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                </span>
              </a>
            )}
          </div>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

export default function Careers() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('careers.metaTitle');
  }, [t]);

  const programs = useMemo(
    () => [
      {
        key: 'ambassador' as const,
        icon: GraduationCap,
        applyUrl: AMBASSADOR_FORM_URL,
        closed: false,
        accentClass:
          'bg-brand-50 text-brand-700 ring-brand-100 dark:bg-brand-950/50 dark:text-brand-300 dark:ring-brand-800/60',
      },
      {
        key: 'internship' as const,
        icon: Sun,
        applyUrl: INTERNSHIP_FORM_URL,
        closed: true,
        accentClass:
          'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
      },
    ],
    [],
  );

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className={`${heroBleedClassName} bg-white text-stone-900 dark:bg-zinc-950 dark:text-zinc-50`}>
          <HeroAtmosphere sparkleId="careers-hero-sparkles" />

          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:py-14 md:px-5 md:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="opacity-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-brand-600 animate-fade-up animation-delay-100 dark:text-brand-400">
                {t('careers.hero.eyebrow')}
              </p>
              <h1 className="home-headline opacity-0 mt-4 text-balance text-[1.75rem] font-extrabold leading-[1.12] text-stone-900 animate-fade-up animation-delay-150 dark:text-zinc-50 sm:text-[2rem] md:text-5xl">
                {t('careers.hero.title')}
              </h1>
              <p className="opacity-0 mx-auto mt-4 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-200 dark:text-zinc-300 sm:mt-6 sm:text-base md:text-lg">
                {t('careers.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200/80 bg-[#fafaf9] py-12 dark:border-zinc-800 dark:bg-zinc-950 sm:py-16 lg:py-20">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 md:px-5">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {programs.map(({ key, icon, applyUrl, accentClass, closed }, index) => {
                const prefix = `careers.${key}` as const;
                const highlights = t(`${prefix}.highlights`, { returnObjects: true }) as string[];
                const title = t(`${prefix}.title`);
                return (
                  <ProgramCard
                    key={key}
                    badge={t(`${prefix}.badge`)}
                    title={title}
                    description={t(`${prefix}.description`)}
                    highlights={highlights}
                    applyUrl={applyUrl}
                    applyLabel={t('careers.apply')}
                    applyAria={t('careers.applyAria', { program: title })}
                    closed={closed}
                    closedLabel={closed ? t('careers.closed') : undefined}
                    icon={icon}
                    accentClass={accentClass}
                    delayMs={index * 80}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
