import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ExternalLink, Briefcase, ArrowRight, Mail, Laptop } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';

const INTERNSHIP_FORM_URL = 'https://forms.gle/sLyEVVnSfDG6Lmf39';

const PROGRAMS = [
  { key: 'internship' as const, icon: Laptop, applyUrl: INTERNSHIP_FORM_URL, closed: true },
  { key: 'jobs' as const, icon: Briefcase, closed: true },
] as const;

const TONE_MUTED =
  'bg-stone-100 text-stone-500 ring-stone-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-600';
const TONE_BRAND =
  'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:ring-brand-800/60';
const TONE_ICON_BRAND =
  'bg-brand-50 text-brand-700 ring-brand-100 dark:bg-brand-950/50 dark:text-brand-300 dark:ring-brand-800/60';

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

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
      {children}
    </p>
  );
}

type ProgramCardProps = {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  applyUrl?: string;
  applyLabel: string;
  closedLabel: string;
  applyAria: string;
  closed?: boolean;
  icon: typeof Briefcase;
  delayMs?: number;
};

function ProgramCard({
  badge,
  title,
  description,
  highlights,
  applyUrl,
  applyLabel,
  closedLabel,
  applyAria,
  closed = false,
  icon: Icon,
  delayMs = 0,
}: ProgramCardProps) {
  const tone = closed ? TONE_MUTED : TONE_BRAND;
  const iconTone = closed ? TONE_MUTED : TONE_ICON_BRAND;

  return (
    <Reveal delayMs={delayMs} className="h-full">
      <SpotlightCard
        className={`flex h-full flex-col rounded-[1.35rem] border bg-white p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow] duration-500 sm:rounded-[1.75rem] sm:p-8 dark:bg-zinc-900 ${
          closed
            ? 'border-stone-200/70 opacity-95 dark:border-zinc-700/80'
            : 'border-stone-200/90 hover:border-brand-200/80 dark:border-zinc-700/90'
        }`}
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${iconTone}`}
            aria-hidden
          >
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.8125rem] font-semibold tracking-[0.04em] text-brand-700 dark:text-brand-400">
                {badge}
              </p>
              {closed ? (
                <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-stone-600 ring-1 ring-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600">
                  {closedLabel}
                </span>
              ) : null}
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
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ${tone}`}>
                <Check className="h-3 w-3" aria-hidden />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          {closed || !applyUrl ? (
            <button
              type="button"
              disabled
              aria-label={applyAria}
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-100 px-6 py-3.5 text-sm font-bold text-stone-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 sm:w-auto sm:text-base"
            >
              {closedLabel}
            </button>
          ) : (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={applyAria}
              className="home-btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white no-underline transition-transform active:scale-[0.98] sm:w-auto sm:text-base"
            >
              <span className="relative z-[2] inline-flex items-center gap-2">
                {applyLabel}
                <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </span>
            </a>
          )}
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
            <div className="marketing-twin-cta-sm justify-center opacity-0 animate-fade-up animation-delay-300">
              <a
                href="#open-roles"
                className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-8"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {t('careers.hero.viewRoles')}
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </span>
              </a>
              <Link
                to="/contact"
                className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-6 dark:text-zinc-100"
              >
                {t('careers.hero.contactUs')}
              </Link>
            </div>
          </div>
        </section>

        <section
          id="open-roles"
          className="scroll-mt-28 border-t border-stone-200/80 bg-stone-50 py-12 dark:border-zinc-800 dark:bg-zinc-950 sm:py-16 md:py-24"
        >
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 max-lg:px-4 md:px-5">
            <Reveal className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-start">
              <SectionEyebrow>{t('careers.programs.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mt-4 text-balance text-2xl font-extrabold tracking-[-0.02em] text-stone-900 dark:text-zinc-50 sm:text-3xl md:text-4xl">
                {t('careers.programs.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-base font-medium leading-relaxed text-stone-600 dark:text-zinc-300 sm:text-lg lg:mx-0">
                {t('careers.programs.subtitle')}
              </p>
            </Reveal>

            <div className="mt-10 grid items-stretch gap-6 sm:mt-12 lg:mt-14 lg:grid-cols-2 lg:gap-8">
              {PROGRAMS.map(({ key, icon, closed, ...rest }, index) => {
                const prefix = `careers.${key}` as const;
                const highlights = t(`${prefix}.highlights`, { returnObjects: true }) as string[];
                const title = t(`${prefix}.title`);
                const applyUrl = 'applyUrl' in rest ? rest.applyUrl : undefined;
                return (
                  <ProgramCard
                    key={key}
                    badge={t(`${prefix}.badge`)}
                    title={title}
                    description={t(`${prefix}.description`)}
                    highlights={highlights}
                    applyUrl={applyUrl}
                    applyLabel={t('careers.apply')}
                    applyAria={
                      closed
                        ? t('careers.closedAria', { program: title })
                        : t('careers.applyAria', { program: title })
                    }
                    closed={closed}
                    closedLabel={t('careers.closed')}
                    icon={icon}
                    delayMs={index * 80}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200/80 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950 max-lg:py-10 md:py-16">
          <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col items-center gap-6 px-4 text-center max-lg:px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:text-start md:px-5">
            <div className="min-w-0 max-w-xl">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-700 sm:mx-0 dark:border-zinc-600 dark:bg-zinc-800 dark:text-brand-300">
                <Mail className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-lg font-semibold text-stone-900 dark:text-zinc-100">{t('careers.strip.title')}</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-stone-600 dark:text-zinc-300">
                {t('careers.strip.body')}
              </p>
            </div>
            <div className="flex w-full max-w-sm shrink-0 flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center">
              <Link
                to="/about"
                className="home-btn-secondary inline-flex w-full items-center justify-center whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm font-bold text-stone-800 no-underline dark:text-zinc-100 sm:w-auto"
              >
                {t('careers.strip.about')}
              </Link>
              <Link
                to="/contact"
                className="home-btn-primary group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white no-underline sm:w-auto"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {t('careers.strip.contact')}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
