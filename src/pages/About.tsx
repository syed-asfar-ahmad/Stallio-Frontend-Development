import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Store,
  MessageCircle,
  LayoutGrid,
  Link2,
  LayoutDashboard,
  ShoppingBag,
  Zap,
  Heart,
  Rocket,
  ArrowRight,
  Target,
  Users,
  Shield,
  Compass,
  Check,
  FileDown,
  Banknote,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { MARKETING_DEMO_SHOP_PATH } from '../lib/marketingDemoShop';

const OFFER_ICONS = [Zap, LayoutGrid, Link2, LayoutDashboard, ShoppingBag, FileDown] as const;
const VALUE_ICONS = [Users, Shield, Compass] as const;

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-600">{children}</p>
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

export default function About() {
  const { t } = useTranslation();

  const problems = t('about.mission.problems', { returnObjects: true }) as string[];
  const solutions = t('about.mission.solutions', { returnObjects: true }) as string[];

  const aboutVisualPillars = useMemo(() => {
    const labels = t('about.hero.mockRows', { returnObjects: true }) as string[];
    const icons = [Link2, LayoutGrid, FileDown, Banknote] as const;
    return labels.map((label, i) => ({ label, icon: icons[i] ?? Link2 }));
  }, [t]);

  const offers = useMemo(() => {
    const rows = t('about.pillars.offers', { returnObjects: true }) as { title: string; detail: string }[];
    return rows.map((row, i) => ({ ...row, icon: OFFER_ICONS[i] ?? Zap }));
  }, [t]);

  const values = useMemo(() => {
    const rows = t('about.values.items', { returnObjects: true }) as { title: string; detail: string }[];
    return rows.map((row, i) => ({ ...row, icon: VALUE_ICONS[i]! }));
  }, [t]);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className="relative isolate overflow-hidden bg-white text-stone-900 max-lg:min-h-0">
          <div
            className="pointer-events-none absolute -left-32 top-1/4 h-[280px] w-[280px] rounded-full bg-brand-400/15 blur-[80px] animate-blob max-lg:opacity-70 sm:h-[360px] sm:w-[360px] sm:blur-[90px] lg:h-[420px] lg:w-[420px] lg:blur-[100px] lg:opacity-100"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-20 bottom-0 h-[240px] w-[240px] rounded-full bg-brand-400/12 blur-[70px] animate-blob animate-blob-delayed max-lg:opacity-70 sm:h-[320px] sm:w-[320px] sm:blur-[80px] lg:h-[380px] lg:w-[380px] lg:blur-[90px] lg:opacity-100"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[min(55%,480px)] w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(91,69,229,0.14),transparent_58%)]"
            aria-hidden
          />

          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 py-10 max-lg:px-4 sm:py-14 md:px-5 md:py-28">
            <div className="grid min-w-0 items-center gap-8 text-center max-lg:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:text-start xl:gap-14">
              <div className="mx-auto w-full min-w-0 max-w-xl lg:mx-0">
                <p className="opacity-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-brand-600 animate-fade-up animation-delay-100">
                  {t('about.hero.eyebrow')}
                </p>
                <h1 className="home-headline opacity-0 mt-4 text-balance text-[1.75rem] font-extrabold leading-[1.12] text-stone-900 animate-fade-up animation-delay-150 max-lg:mt-4 sm:mt-5 sm:text-[2rem] md:text-5xl lg:text-[3.15rem] lg:leading-[1.1]">
                  {t('about.hero.title')}
                </h1>
                <p className="opacity-0 mx-auto mt-4 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-200 max-lg:mt-4 sm:mt-6 sm:text-base md:text-lg lg:mx-0">
                  {t('about.hero.subtitle')}
                </p>
                <div className="marketing-twin-cta-sm opacity-0 animate-fade-up animation-delay-300">
                  <Link
                    to="/signup"
                    className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-8"
                  >
                    <span className="relative z-[2] inline-flex items-center gap-2">
                      {t('about.hero.startFree')}
                      <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                    </span>
                  </Link>
                  <Link
                    to={MARKETING_DEMO_SHOP_PATH}
                    className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-6"
                  >
                    {t('about.hero.viewDemoStore')}
                  </Link>
                </div>
              </div>

              <div className="relative flex w-full justify-center lg:justify-end">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                  <div className="h-[min(75%,320px)] w-[min(85%,320px)] rounded-full bg-brand-400/11 blur-[60px] animate-home-float-slow max-lg:opacity-80 sm:h-[min(80%,380px)] sm:w-[min(85%,380px)] sm:blur-[68px] lg:h-[min(85%,440px)] lg:w-[min(85%,440px)] lg:blur-[76px] lg:opacity-100" />
                </div>
                <div className="relative w-full min-w-0 max-w-lg opacity-0 animate-fade-up animation-delay-300 max-lg:mx-auto max-lg:max-w-xl lg:max-w-xl lg:me-0">
                  <SpotlightCard className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_20px_50px_-28px_rgba(15,23,42,0.12)] ring-1 ring-stone-100/80 transition-[border-color,box-shadow] duration-500 hover:border-brand-200/80 hover:shadow-[0_24px_56px_-28px_rgba(63,52,186,0.2)] sm:rounded-[1.35rem] dark:border-zinc-600/90 dark:bg-zinc-900 dark:ring-zinc-800/80">
                    <ul className="m-0 list-none divide-y divide-stone-100/90 p-0 dark:divide-zinc-700/80">
                      {aboutVisualPillars.map(({ label, icon: PIcon }) => (
                        <li key={label}>
                          <div className="group flex items-start gap-3.5 px-4 py-4 transition-colors duration-300 hover:bg-brand-50/40 sm:gap-4 sm:px-5 sm:py-[1.125rem] dark:hover:bg-brand-950/25">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-100/90 bg-brand-50 text-brand-700 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-zinc-600/80 dark:bg-zinc-800 dark:text-brand-300">
                              <PIcon className="size-[1.125rem] shrink-0" strokeWidth={2} aria-hidden />
                            </span>
                            <p className="min-w-0 flex-1 pt-1.5 text-start text-[0.875rem] font-semibold leading-snug text-stone-800 sm:text-[0.9375rem] dark:text-zinc-100">
                              {label}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200/80 bg-stone-50 py-12 max-lg:py-12 md:py-24">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 max-lg:px-4 md:px-5">
            <Reveal className="text-center">
              <SectionEyebrow>{t('about.mission.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:mt-4 sm:mt-5 sm:text-3xl md:text-4xl">
                {t('about.mission.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-5 sm:text-lg">
                {t('about.mission.subtitle')}
              </p>
            </Reveal>

            <div className="relative mx-auto mt-10 max-w-5xl max-lg:mt-10 md:mt-16">
              <div className="absolute left-1/2 top-1/2 z-20 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-stone-200 bg-white text-xs font-extrabold uppercase tracking-widest text-stone-800 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.2)] md:flex">
                {t('home.beforeAfter.vs')}
              </div>
              <div className="grid gap-4 max-lg:gap-4 md:grid-cols-2 md:gap-8">
              <Reveal delayMs={0}>
                <div className="marketing-dark-rose-card home-tilt relative h-full rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-white p-5 shadow-[0_4px_24px_-8px_rgba(225,29,72,0.12)] max-lg:rounded-2xl max-lg:p-5 sm:rounded-3xl sm:p-8 md:p-10">
                  <h3 className="mb-5 flex items-center gap-3 text-lg font-bold text-stone-900 max-lg:mb-5 sm:mb-8 sm:gap-4 sm:text-xl">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-100 text-rose-600 shadow-inner max-lg:h-11 max-lg:w-11 sm:h-14 sm:w-14 sm:rounded-2xl">
                      <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden />
                    </span>
                    {t('about.mission.frictionTitle')}
                  </h3>
                  <p className="mb-5 text-sm text-stone-600 max-lg:mb-5 sm:mb-6 sm:text-base">{t('about.mission.frictionIntro')}</p>
                  <ul className="space-y-3 max-lg:space-y-3 sm:space-y-4">
                    {problems.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-stone-600 max-lg:gap-2.5 sm:gap-3 sm:text-base">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.2)]" aria-hidden />
                        <span className="font-semibold leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <div className="flex items-center justify-center py-1 md:hidden" aria-hidden>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-white text-[0.65rem] font-extrabold uppercase tracking-widest text-stone-800 shadow-md">
                  {t('home.beforeAfter.vs')}
                </span>
              </div>
              <Reveal delayMs={120}>
                <div className="marketing-dark-gradient-card home-tilt relative h-full rounded-2xl border border-brand-200/90 bg-gradient-to-br from-brand-50/90 via-white to-brand-50/30 p-5 shadow-[0_4px_28px_-8px_rgba(47,33,132,0.18)] max-lg:rounded-2xl max-lg:p-5 sm:rounded-3xl sm:p-8 md:p-10">
                  <h3 className="mb-5 flex items-center gap-3 text-lg font-bold text-stone-900 max-lg:mb-5 sm:mb-8 sm:gap-4 sm:text-xl">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-100 text-brand-700 shadow-inner max-lg:h-11 max-lg:w-11 sm:h-14 sm:w-14 sm:rounded-2xl">
                      <Check className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden />
                    </span>
                    {t('about.mission.solutionTitle')}
                  </h3>
                  <p className="mb-5 text-sm text-stone-600 max-lg:mb-5 sm:mb-6 sm:text-base">{t('about.mission.solutionIntro')}</p>
                  <ul className="space-y-3 max-lg:space-y-3 sm:space-y-4">
                    {solutions.map((s) => (
                      <li key={s} className="flex gap-2.5 text-sm text-stone-700 max-lg:gap-2.5 sm:gap-3 sm:text-base">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(91,69,229,0.25)]" aria-hidden />
                        <span className="font-bold leading-snug">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 max-lg:py-12 md:py-24">
          <div className="mx-auto w-full min-w-0 max-w-7xl px-4 max-lg:px-4 md:px-5">
            <Reveal className="text-center">
              <SectionEyebrow>{t('about.pillars.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:mt-4 sm:mt-5 sm:text-3xl md:text-4xl">
                {t('about.pillars.title')}
              </h2>
            </Reveal>

            <div className="mt-8 grid gap-3 max-lg:mt-8 max-lg:gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {offers.map(({ icon: Icon, title, detail }, i) => (
                <Reveal key={title} delayMs={(i % 3) * 70}>
                  <SpotlightCard className="group flex h-full flex-col items-center rounded-2xl border border-stone-200/90 bg-white px-5 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/90 hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.18)] sm:px-6 sm:py-6">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50/80 text-brand-700 transition-all duration-300 group-hover:scale-105 group-hover:border-brand-200 group-hover:shadow-md">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="text-base font-bold text-stone-900 transition-colors duration-300 group-hover:text-brand-900">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{detail}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-y border-stone-200/80 bg-stone-50 py-12 max-lg:py-12 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(91,69,229,0.08),transparent_55%)]" aria-hidden />
          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 max-lg:px-4 md:px-5">
            <Reveal className="text-center">
              <SectionEyebrow>{t('about.values.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:mt-4 sm:mt-5 sm:text-3xl md:text-4xl">
                {t('about.values.title')}
              </h2>
            </Reveal>

            <div className="mt-8 grid gap-4 max-lg:mt-8 max-lg:gap-4 sm:mt-14 sm:gap-5 md:grid-cols-3">
              {values.map(({ icon: Icon, title, detail }, i) => (
                <Reveal key={title} delayMs={i * 80}>
                  <SpotlightCard className="group flex h-full flex-col items-center rounded-2xl border border-stone-200/90 bg-white px-5 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/90 hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.18)] sm:px-6 sm:py-6 md:items-start md:text-start">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50/80 text-brand-700 transition-all duration-300 group-hover:scale-105 group-hover:border-brand-200 group-hover:shadow-md md:mx-0">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="text-base font-bold text-stone-900 transition-colors duration-300 group-hover:text-brand-900">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{detail}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 grid gap-4 max-lg:mt-10 max-lg:gap-4 sm:mt-16 sm:gap-6 md:grid-cols-2">
              <Reveal delayMs={0}>
                <SpotlightCard className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-stone-50/50 p-5 transition-all duration-500 hover:border-brand-200 hover:bg-white hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.18)] max-lg:p-5 sm:p-6 md:p-8">
                  <span className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200/80 bg-white text-brand-700 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-brand-200 group-hover:shadow-md">
                    <Rocket className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-xl font-bold text-stone-900">{t('about.values.momentumTitle')}</h3>
                  <p className="mt-3 leading-relaxed text-stone-600">{t('about.values.momentumBody')}</p>
                </SpotlightCard>
              </Reveal>
              <Reveal delayMs={80}>
                <SpotlightCard className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-stone-50/50 p-5 transition-all duration-500 hover:border-brand-200 hover:bg-white hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.18)] max-lg:p-5 sm:p-6 md:p-8">
                  <span className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200/80 bg-white text-rose-600 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-brand-200 group-hover:shadow-md">
                    <Heart className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-xl font-bold text-stone-900">{t('about.values.visionTitle')}</h3>
                  <p className="mt-3 leading-relaxed text-stone-600">{t('about.values.visionBody')}</p>
                </SpotlightCard>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 max-lg:py-10 md:py-20">
          <div className="mx-auto w-full min-w-0 max-w-5xl px-4 max-lg:px-4 md:px-5">
            <div className="grid min-w-0 grid-cols-1 divide-y divide-stone-200/80 overflow-hidden rounded-xl border border-stone-200/90 bg-white/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.1)] backdrop-blur-md sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rounded-2xl dark:divide-zinc-600/80">
              <SpotlightCard className="group relative flex min-w-0 flex-col items-center px-4 py-5 text-center transition-colors duration-500 hover:bg-gradient-to-b hover:from-brand-50/90 hover:to-white sm:px-6 sm:py-8 md:py-10 dark:hover:from-zinc-800/95 dark:hover:to-zinc-900">
                <Target className="mb-2 h-7 w-7 shrink-0 text-brand-600 transition-transform duration-500 group-hover:scale-105 sm:mb-3 sm:h-10 sm:w-10" aria-hidden />
                <p className="home-headline text-xl font-extrabold leading-tight tracking-tight text-stone-900 transition-transform duration-500 group-hover:scale-105 sm:text-2xl md:text-3xl">
                  <span className="marketing-gradient-text bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent">
                    {t('about.promise.simple')}
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium leading-snug text-stone-500 sm:mt-0.5 sm:text-sm dark:text-zinc-400">
                  {t('about.promise.simpleSub')}
                </p>
              </SpotlightCard>
              <SpotlightCard className="group relative flex min-w-0 flex-col items-center px-4 py-5 text-center transition-colors duration-500 hover:bg-gradient-to-b hover:from-brand-50/90 hover:to-white sm:px-6 sm:py-8 md:py-10 dark:hover:from-zinc-800/95 dark:hover:to-zinc-900">
                <Zap className="mb-2 h-7 w-7 shrink-0 text-amber-500 transition-transform duration-500 group-hover:scale-105 sm:mb-3 sm:h-10 sm:w-10" aria-hidden />
                <p className="home-headline text-xl font-extrabold leading-tight tracking-tight text-stone-900 transition-transform duration-500 group-hover:scale-105 sm:text-2xl md:text-3xl">
                  <span className="marketing-gradient-text bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent">
                    {t('about.promise.fast')}
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium leading-snug text-stone-500 sm:mt-0.5 sm:text-sm dark:text-zinc-400">
                  {t('about.promise.fastSub')}
                </p>
              </SpotlightCard>
              <SpotlightCard className="group relative flex min-w-0 flex-col items-center px-4 py-5 text-center transition-colors duration-500 hover:bg-gradient-to-b hover:from-brand-50/90 hover:to-white sm:px-6 sm:py-8 md:py-10 dark:hover:from-zinc-800/95 dark:hover:to-zinc-900">
                <Store className="mb-2 h-7 w-7 shrink-0 text-brand-600 transition-transform duration-500 group-hover:scale-105 sm:mb-3 sm:h-10 sm:w-10" aria-hidden />
                <p className="home-headline text-xl font-extrabold leading-tight tracking-tight text-stone-900 transition-transform duration-500 group-hover:scale-105 sm:text-2xl md:text-3xl">
                  <span className="marketing-gradient-text bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent">
                    {t('about.promise.credible')}
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium leading-snug text-stone-500 sm:mt-0.5 sm:text-sm dark:text-zinc-400">
                  {t('about.promise.credibleSub')}
                </p>
              </SpotlightCard>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-stone-200/80 bg-white py-12 max-lg:py-12 md:py-32">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(91,69,229,0.12),transparent_55%)]"
            aria-hidden
          />
          <Reveal className="relative mx-auto w-full min-w-0 max-w-2xl px-4 text-center max-lg:px-4 md:px-5">
            <h2 className="home-headline text-balance text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              {t('about.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-stone-600 max-lg:mt-4 sm:mt-6 sm:text-lg">
              {t('about.cta.subtitle')}
            </p>
            <div className="marketing-twin-cta-md">
              <Link
                to="/signup"
                className="home-btn-primary marketing-twin-cta-btn-wide group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-10"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  {t('about.cta.createFreeStore')}
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </span>
              </Link>
              <Link
                to="/contact"
                className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-8"
              >
                {t('about.cta.contactUs')}
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </PublicLayout>
  );
}
