import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  Package,
  Share2,
  LayoutDashboard,
  Smartphone,
  Store,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';
import { MARKETING_DEMO_SHOP_PATH } from '../lib/marketingDemoShop';

const STEP_LAYOUT = [
  {
    num: '01',
    accent: 'from-brand-400 to-brand-500',
    borderTop: 'border-t-brand-500',
    icon: UserPlus,
  },
  {
    num: '02',
    accent: 'from-brand-400 to-brand-500',
    borderTop: 'border-t-brand-500',
    icon: Package,
  },
  {
    num: '03',
    accent: 'from-brand-400 to-brand-600',
    borderTop: 'border-t-brand-500',
    icon: Share2,
  },
] as const;

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-brand-600">{children}</p>
  );
}

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
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
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

export default function HowItWorks() {
  const { t } = useTranslation();

  const steps = useMemo(() => {
    const rows = t('howItWorks.flow.steps', { returnObjects: true }) as {
      title: string;
      description: string;
      items: string[];
    }[];
    return rows.map((row, i) => ({
      ...STEP_LAYOUT[i]!,
      title: row.title,
      description: row.description,
      items: row.items,
    }));
  }, [t]);

  const previewCards = t('howItWorks.hero.previewCards', { returnObjects: true }) as { n: string; t: string; d: string }[];

  const stripSegments = useMemo(() => {
    const raw = t('howItWorks.strip');
    return raw
      .split(/\s*[·•]\s*/u)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [t]);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip bg-white">
        <section className={`${heroBleedClassName} bg-white text-stone-900 max-lg:min-h-0 lg:min-h-[min(88svh,880px)]`}>
          <HeroAtmosphere sparkleId="how-hero-sparkles" />

          <div className="relative mx-auto grid w-full min-w-0 max-w-7xl items-center gap-8 px-4 py-10 max-lg:px-4 sm:gap-10 sm:py-14 md:px-5 md:py-20 lg:min-h-[min(88svh,880px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-24">
            <div className="min-w-0 text-center lg:text-start">
              <h1 className="home-headline opacity-0 text-balance text-[1.75rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-stone-900 animate-fade-up animation-delay-100 sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[0.98] lg:tracking-[-0.04em]">
                <span className="block">{t('howItWorks.hero.titleLine1')}</span>
                <span className="marketing-gradient-text mt-2 block bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent">
                  {t('howItWorks.hero.titleLine2')}
                </span>
              </h1>
              <p className="opacity-0 mx-auto mt-4 max-w-xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-150 max-lg:mt-4 sm:mt-6 sm:text-lg md:text-xl lg:mx-0 lg:max-w-lg lg:mt-8">
                {t('howItWorks.hero.subtitle')}
              </p>

              <p
                className="opacity-0 mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium text-stone-500 animate-fade-up animation-delay-200 max-lg:mt-4 sm:mt-6 sm:text-sm lg:mx-0 lg:justify-start"
                role="note"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-brand-600/90" strokeWidth={2} aria-hidden />
                  {t('howItWorks.hero.noteDraft')}
                </span>
                <span className="hidden text-stone-300 sm:inline" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 shrink-0 text-amber-600/90" strokeWidth={2} aria-hidden />
                  {t('howItWorks.hero.noteMobile')}
                </span>
              </p>

              <div className="marketing-twin-cta-sm opacity-0 animate-fade-up animation-delay-250">
                <Link
                  to="/signup"
                  className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-9"
                >
                  <span className="relative z-[2] inline-flex items-center gap-2">
                    {t('howItWorks.hero.startFree')}
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                  </span>
                </Link>
                <Link
                  to={MARKETING_DEMO_SHOP_PATH}
                  className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-7"
                >
                  {t('howItWorks.hero.viewDemoStore')}
                </Link>
              </div>

              <div className="relative mx-auto mt-8 grid w-full max-w-md gap-3 opacity-0 animate-fade-up animation-delay-300 max-lg:grid-cols-1 sm:max-w-lg lg:hidden">
                {previewCards.map((c) => (
                  <div
                    key={c.n}
                    className="rounded-2xl border border-stone-200/90 bg-white p-4 text-start shadow-md shadow-stone-900/5"
                  >
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-600">{c.n}</p>
                    <p className="mt-1 text-base font-extrabold text-stone-900">{c.t}</p>
                    <p className="mt-0.5 text-xs font-semibold text-stone-500">{c.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto hidden h-[min(440px,50vw)] w-full max-w-md lg:block" aria-hidden>
              <div className="pointer-events-none absolute inset-0 rounded-full bg-brand-400/12 blur-[72px]" />
              {previewCards.map((c, idx) => (
                <div
                  key={c.n}
                  className="absolute w-[88%] rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xl shadow-stone-900/5 animate-float"
                  style={{
                    top: ['0', '22%', '44%'][idx],
                    left: ['0', '6%', '-3%'][idx],
                    transform: `rotate(${['-4deg', '3deg', '-2deg'][idx]})`,
                    animationDelay: ['0s', '0.5s', '1s'][idx],
                  }}
                >
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-brand-600">{c.n}</p>
                  <p className="mt-1 text-lg font-extrabold text-stone-900">{c.t}</p>
                  <p className="mt-0.5 text-xs font-semibold text-stone-500">{c.d}</p>
                  <div className="mt-4 h-2 w-full max-w-[70%] rounded-full bg-stone-100" />
                  <div className="mt-2 h-2 w-full max-w-[45%] rounded-full bg-stone-100/80" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-stone-200/80 bg-stone-50 py-12 max-lg:py-12 md:py-28">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 max-lg:px-4 md:px-5">
            <div className="relative overflow-hidden rounded-[1.25rem] border border-stone-200/90 bg-white px-4 py-8 shadow-sm max-lg:rounded-[1.25rem] sm:rounded-[2rem] sm:px-5 sm:py-14 md:px-10 md:py-16">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(91,69,229,0.08),transparent_55%)]"
                aria-hidden
              />
              <Reveal className="relative text-center">
                <SectionEyebrow>{t('howItWorks.flow.eyebrow')}</SectionEyebrow>
                <h2 className="home-headline mx-auto mt-4 max-w-4xl text-2xl font-extrabold text-stone-900 max-lg:mt-4 sm:mt-5 sm:text-3xl md:text-5xl lg:text-6xl md:leading-[1.05]">
                  {t('howItWorks.flow.title')}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-6 sm:text-lg">
                  {t('howItWorks.flow.subtitle')}
                </p>
              </Reveal>

              <div className="relative mx-auto mt-8 max-w-6xl max-lg:mt-8 sm:mt-12 lg:mt-16">
                <div
                  aria-hidden
                  className="hiw-step-connector pointer-events-none absolute inset-x-0 top-[50px] z-0 hidden h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 sm:block [clip-path:inset(0_17%_0_17%)] md:[clip-path:inset(0_18%_0_18%)]"
                />
                <div className="relative z-[1] grid gap-6 max-lg:gap-6 sm:grid-cols-3 sm:gap-8 lg:gap-10">
                  {steps.map(({ num, title, description, icon: Icon, items, accent, borderTop }, i) => (
                    <Reveal key={num} delayMs={i * 90} className="flex flex-col items-center text-center sm:items-stretch sm:text-start">
                      <div className="relative z-20 flex h-[88px] shrink-0 items-center justify-center max-lg:h-[88px] sm:h-[100px]">
                        <div
                          className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-[1.15rem] border border-brand-200/80 bg-gradient-to-br ${accent} p-[2px] shadow-md shadow-brand-900/5 ring-2 ring-white transition-transform duration-500 hover:scale-[1.03] max-lg:h-[88px] max-lg:w-[88px] sm:h-[100px] sm:w-[100px] sm:rounded-[1.25rem]`}
                        >
                          <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-white sm:rounded-[1.1rem]">
                            <Icon className="h-8 w-8 text-brand-700 sm:h-10 sm:w-10" aria-hidden />
                          </div>
                          <span className="absolute -right-1.5 -top-1.5 flex h-9 w-9 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-brand-500 to-brand-600 text-[0.65rem] font-black text-white shadow-md">
                            {num}
                          </span>
                        </div>
                      </div>
                      <SpotlightCard
                        className={`relative z-[1] mt-5 w-full rounded-2xl border border-stone-200/90 ${borderTop} border-t-[3px] bg-white p-5 text-start shadow-sm transition-all duration-300 hover:border-brand-200/90 hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.12)] sm:mt-6 sm:p-7`}
                      >
                        <h3 className="text-xl font-extrabold text-stone-900">{title}</h3>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-stone-600">{description}</p>
                        <ul className="mt-5 space-y-2.5">
                          {items.map((item) => (
                            <li key={item} className="flex gap-3 text-sm text-stone-800">
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                                aria-hidden
                              />
                              <span className="font-semibold leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </SpotlightCard>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="marketing-accent-strip relative z-[1] overflow-hidden border-y border-brand-100 bg-gradient-to-r from-brand-50 via-brand-50 to-brand-50 py-3.5 dark:border-zinc-700 sm:py-5">
          <div className="overflow-x-auto overflow-y-hidden px-4 text-center [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 md:px-8 [&::-webkit-scrollbar]:hidden">
            <p
              className="inline-flex min-w-0 flex-nowrap items-center justify-center gap-x-1.5 whitespace-nowrap py-0.5 text-[0.58rem] font-extrabold uppercase leading-tight tracking-[0.06em] text-brand-900 sm:gap-x-2 sm:text-sm sm:tracking-[0.22em] md:tracking-[0.26em] dark:text-brand-300"
              role="note"
            >
              {stripSegments.map((seg, i) => (
                <Fragment key={i}>
                  {i > 0 ? (
                    <span className="shrink-0 text-brand-800/40 dark:text-brand-500/40" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span>{seg}</span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>

        <section className="relative bg-white py-12 max-lg:py-12 md:py-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(90%,800px)] -translate-x-1/2 rounded-full bg-brand-400/8 blur-3xl max-lg:hidden" aria-hidden />
          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 max-lg:px-4 md:px-5">
            <Reveal className="text-center">
              <SectionEyebrow>{t('howItWorks.live.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:mt-4 sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl">
                {t('howItWorks.live.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-5 sm:text-lg">
                {t('howItWorks.live.subtitle')}
              </p>
            </Reveal>

            <div className="mt-8 grid gap-4 max-lg:mt-8 max-lg:gap-4 sm:mt-14 sm:gap-6 lg:grid-cols-12 lg:gap-8">
              <Reveal className="lg:col-span-7" delayMs={0}>
                <SpotlightCard className="marketing-dark-gradient-card group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-gradient-to-br from-white via-brand-50/40 to-brand-50/30 p-5 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_24px_48px_-24px_rgba(47,33,132,0.15)] sm:min-h-[280px] sm:p-8 md:min-h-[300px] md:p-10">
                  <div className="relative flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-200/80 bg-white text-brand-700 shadow-sm transition-transform duration-500 group-hover:scale-105">
                      <LayoutDashboard className="h-7 w-7" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-stone-900">{t('howItWorks.live.commandTitle')}</h3>
                      <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-stone-600">
                        {t('howItWorks.live.commandBody')}
                      </p>
                    </div>
                  </div>
                  <ul className="relative mt-8 space-y-3 border-t border-stone-200/80 pt-8">
                    {(t('howItWorks.live.commandBullets', { returnObjects: true }) as string[]).map(
                      (item) => (
                        <li key={item} className="flex items-center gap-3 text-sm font-semibold text-stone-800">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                            <ArrowRight className="h-3.5 w-3.5 rotate-[-45deg]" aria-hidden />
                          </span>
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </SpotlightCard>
              </Reveal>
              <Reveal className="lg:col-span-5" delayMs={100}>
                <SpotlightCard className="group flex h-full flex-col justify-between rounded-[1.75rem] border border-stone-200/90 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_24px_48px_-24px_rgba(47,33,132,0.12)] sm:p-8 md:p-10">
                  <div>
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25 transition-transform duration-500 group-hover:scale-105">
                      <Smartphone className="h-7 w-7" aria-hidden />
                    </span>
                    <h3 className="mt-6 text-2xl font-extrabold text-stone-900">{t('howItWorks.live.thumbTitle')}</h3>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-stone-600">
                      {t('howItWorks.live.thumbBody')}
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {(t('howItWorks.live.thumbTags', { returnObjects: true }) as string[]).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-brand-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-stone-200/80 bg-white py-12 max-lg:py-12 md:py-32">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(91,69,229,0.1),transparent_55%)]"
            aria-hidden
          />
          <Reveal className="relative mx-auto w-full min-w-0 max-w-2xl px-4 text-center max-lg:px-4 md:px-5">
            <h2 className="home-headline text-balance text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:text-3xl md:text-5xl lg:text-6xl">
              {t('howItWorks.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-stone-600 max-lg:mt-4 sm:mt-6 sm:text-lg">
              {t('howItWorks.cta.subtitle')}
            </p>
            <div className="marketing-twin-cta-md">
              <Link
                to="/signup"
                className="home-btn-primary marketing-twin-cta-btn-wide group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-10"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <Store className="h-5 w-5 shrink-0" aria-hidden />
                  {t('howItWorks.cta.createYourShop')}
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </span>
              </Link>
              <Link
                to="/features"
                className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-8"
              >
                {t('howItWorks.cta.exploreFeatures')}
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </PublicLayout>
  );
}
