import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  LogIn,
  Link2,
  Image,
  LayoutGrid,
  BarChart3,
  UserPlus,
  Package,
  Share2,
  X,
  Check,
  Link as LinkIcon,
  Smartphone,
  Palette,
  Gift,
  Cookie,
  Shirt,
  Store,
  Clock,
  ShieldCheck,
  Zap,
  BadgePercent,
  FileText,
  Globe,
  Banknote,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';
import { MARKETING_DEMO_SHOP_PATH } from '../lib/marketingDemoShop';

const BULLET_ICONS = [Link2, Image, BarChart3] as const;
const WHO_ICONS = [Cookie, Share2, Shirt, Palette, Store] as const;
const STEP_ICONS = [UserPlus, Package, Share2] as const;
const BENEFIT_ICONS = [LinkIcon, Smartphone, ShieldCheck, Clock, BarChart3, Gift] as const;
const PREVIEW_BULLET_ICONS = [LayoutGrid, BadgePercent, FileText, Globe, Banknote] as const;
const HOME_PREVIEW_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=82',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=82',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=82',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=82',
] as const;

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

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-600">{children}</p>
  );
}

export default function Home() {
  const { t } = useTranslation();

  const bulletTexts = t('home.bullets', { returnObjects: true }) as string[];
  const bullets = useMemo(
    () => bulletTexts.map((text, i) => ({ icon: BULLET_ICONS[i]!, text })),
    [bulletTexts],
  );

  const whoForRows = t('home.whoFor', { returnObjects: true }) as { label: string }[];
  const whoFor = useMemo(
    () => whoForRows.map((row, i) => ({ label: row.label, icon: WHO_ICONS[i]! })),
    [whoForRows],
  );

  const problems = t('home.beforeAfter.problems', { returnObjects: true }) as string[];
  const solutions = t('home.beforeAfter.solutions', { returnObjects: true }) as string[];

  const stepRows = t('home.stepsSection.steps', { returnObjects: true }) as { title: string; desc: string; sub: string }[];
  const steps = useMemo(
    () => stepRows.map((row, i) => ({ icon: STEP_ICONS[i]!, title: row.title, desc: row.desc, sub: row.sub })),
    [stepRows],
  );

  const benefitRows = t('home.benefits.items', { returnObjects: true }) as { title: string; desc: string }[];
  const benefits = useMemo(
    () => benefitRows.map((row, i) => ({ icon: BENEFIT_ICONS[i]!, title: row.title, desc: row.desc })),
    [benefitRows],
  );

  const previewBulletTexts = t('home.preview.bullets', { returnObjects: true }) as string[];
  const previewBullets = useMemo(
    () => previewBulletTexts.map((text, i) => ({ icon: PREVIEW_BULLET_ICONS[i] ?? Package, text })),
    [previewBulletTexts],
  );

  const includedItems = t('home.included.items', { returnObjects: true }) as string[];

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
      <section className={`${heroBleedClassName} bg-white text-stone-900 max-lg:min-h-0 lg:min-h-[min(92svh,920px)]`}>
        <HeroAtmosphere sparkleId="home-hero-sparkles" variant="home" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 pb-12 pt-10 max-lg:min-h-0 sm:pb-14 sm:pt-12 md:px-5 md:pt-16 lg:min-h-0 lg:pb-16 lg:pt-20">
          <div className="grid flex-1 items-center gap-8 text-center max-lg:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:text-start xl:gap-14">
            <div className="mx-auto w-full max-w-xl max-lg:order-2 lg:order-none lg:mx-0">
              <h1 className="home-headline opacity-0 text-balance text-[1.75rem] font-extrabold leading-[1.14] text-stone-900 animate-fade-up animation-delay-100 max-lg:px-0 sm:text-[2rem] md:text-5xl lg:text-[2.75rem] xl:text-5xl">
                {t('home.hero.titleLine1')}{' '}
                <span className="marketing-gradient-text marketing-gradient-text--inline bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent">
                  {t('home.hero.titleLine2')}
                </span>
              </h1>

              <p className="opacity-0 mx-auto mt-4 max-w-xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-150 max-lg:mt-4 sm:mt-6 sm:text-base md:text-lg lg:mx-0">
                {t('home.hero.subtitle')}
              </p>

              <ul className="opacity-0 mt-6 flex w-full max-w-lg flex-col gap-2.5 animate-fade-up animation-delay-200 max-lg:mt-6 sm:mt-8 sm:gap-3 lg:mt-10 lg:max-w-none">
                {bullets.map(({ icon: Icon, text }) => (
                  <li key={text}>
                    <SpotlightCard className="group flex items-center gap-3 rounded-xl border border-stone-200/90 bg-white px-3 py-3 text-start shadow-sm transition-[border-color,box-shadow] duration-500 hover:border-brand-300/60 hover:shadow-[0_12px_40px_-16px_rgba(47,33,132,0.15)] max-lg:rounded-xl sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3.5">
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-brand-200/80 bg-gradient-to-br from-brand-50 to-white text-brand-700 transition-all duration-500 group-hover:scale-105 group-hover:border-brand-300 group-hover:shadow-[0_0_24px_-4px_rgba(91,69,229,0.35)] max-lg:h-10 max-lg:w-10 sm:h-11 sm:w-11 sm:rounded-xl dark:border-brand-700/45 dark:from-zinc-800 dark:to-zinc-900 dark:text-brand-300 dark:group-hover:border-brand-500/40 dark:group-hover:shadow-[0_0_20px_-4px_rgba(91,69,229,0.2)]">
                        <Icon className="relative z-[1] h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 text-[0.875rem] font-semibold leading-snug text-stone-800 sm:text-[0.95rem]">{text}</span>
                    </SpotlightCard>
                  </li>
                ))}
              </ul>

              <div className="marketing-twin-cta-sm opacity-0 animate-fade-up animation-delay-250">
                <Link
                  to="/signup"
                  className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-8"
                >
                  <span className="relative z-[2] inline-flex items-center gap-2">
                    {t('home.hero.startFree')}
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                  </span>
                </Link>
                <Link
                  to={MARKETING_DEMO_SHOP_PATH}
                  className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-6"
                >
                  {t('home.hero.viewDemoStore')}
                </Link>
              </div>
            </div>

            <div className="relative flex w-full justify-center max-lg:order-1 lg:order-none lg:justify-end">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                <div className="h-[min(75%,380px)] w-[min(85%,380px)] rounded-full bg-brand-400/12 blur-[60px] animate-home-float-slow max-lg:opacity-80 lg:h-[min(90%,520px)] lg:w-[min(90%,520px)] lg:blur-[80px] lg:opacity-100" />
              </div>
              <div className="relative w-full max-w-[min(100%,300px)] opacity-0 animate-fade-up animation-delay-300 max-lg:mx-auto sm:max-w-[320px] md:max-w-[360px] lg:me-2 lg:max-w-[360px]">
                <div className="absolute -inset-3 rounded-[2.85rem] bg-gradient-to-tr from-brand-400/25 via-transparent to-brand-300/20 opacity-80 blur-2xl transition-opacity duration-700 hover:opacity-100" aria-hidden />
                <SpotlightCard className="rounded-[2.25rem] p-[2px] shadow-2xl shadow-stone-900/10 ring-1 ring-stone-200/80 transition-[transform,ring-color] duration-500 hover:-translate-y-2 hover:ring-brand-300/60 max-lg:rounded-[2.25rem] sm:rounded-[2.75rem] lg:rounded-[2.75rem]">
                  <div className="overflow-hidden rounded-[2.15rem] border-[10px] border-stone-800 bg-stone-900 max-lg:border-[10px] sm:rounded-[2.65rem] sm:border-[12px]">
                    <div className="flex h-8 items-center justify-center bg-stone-900 sm:h-9">
                      <div className="h-1 w-14 rounded-full bg-stone-600 sm:w-16" aria-hidden />
                    </div>
                    <div className="marketing-device-screen min-h-[340px] bg-gradient-to-b from-stone-50 to-white px-4 pb-5 pt-4 max-lg:min-h-[340px] sm:min-h-[400px] sm:px-5 sm:pb-6 sm:pt-5 md:min-h-[440px]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-700">{t('home.hero.deviceLive')}</p>
                          <p className="text-lg font-bold text-stone-900">{t('home.hero.deviceYourShop')}</p>
                          <p className="text-xs font-medium text-stone-500">{t('home.hero.deviceUrl')}</p>
                        </div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200/80 bg-brand-50 text-brand-700">
                          <Zap className="h-5 w-5" aria-hidden />
                        </span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-2.5">
                        {HOME_PREVIEW_IMAGES.map((src) => (
                          <div
                            key={src}
                            className="group/p aspect-square overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-100 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_12px_28px_-14px_rgba(47,33,132,0.35)]"
                          >
                            <img
                              src={src}
                              alt=""
                              width={200}
                              height={200}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/p:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-2 py-3.5 text-center text-xs font-bold tracking-wide text-white shadow-lg shadow-brand-700/30 transition-transform duration-300 hover:scale-[1.02] sm:text-sm">
                        {t('home.hero.checkoutReady')}
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-stone-50 py-12 max-lg:py-12 md:py-16 lg:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" aria-hidden />
        <div className="mx-auto w-full max-w-7xl px-4 max-lg:px-4 md:px-5">
          <Reveal className="text-center">
            <SectionEyebrow>{t('home.audience.eyebrow')}</SectionEyebrow>
            <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:mt-4 max-lg:text-2xl sm:mt-5 sm:text-3xl md:text-4xl lg:mt-5 lg:text-[2.5rem] lg:leading-tight">
              {t('home.audience.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-5 sm:text-lg">
              {t('home.audience.subtitle')}
            </p>
          </Reveal>

          <div className="mt-10 grid min-w-0 grid-cols-2 gap-2.5 max-lg:mt-10 max-lg:gap-2.5 sm:mt-12 sm:gap-3 md:mt-16 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-5">
            {whoFor.map(({ label, icon: Icon }, i) => {
              const centerLastOnTwoCol =
                i === whoFor.length - 1 && whoFor.length % 2 === 1;
              return (
                <Reveal
                  key={label}
                  delayMs={i * 70}
                  className={`min-w-0 max-md:max-w-full ${centerLastOnTwoCol ? 'max-md:col-span-2 max-md:flex max-md:justify-center' : ''}`}
                >
                  <SpotlightCard
                    className={`group relative flex h-full min-h-0 w-full flex-col items-center rounded-2xl border border-stone-200/90 bg-white px-4 py-5 text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-brand-300/70 hover:shadow-[0_24px_48px_-20px_rgba(47,33,132,0.2)] sm:px-5 sm:py-6 md:p-7 ${centerLastOnTwoCol ? 'max-md:max-w-[min(100%,17.5rem)]' : ''}`}
                  >
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white text-brand-700 transition-all duration-500 group-hover:scale-110 group-hover:border-brand-200 group-hover:shadow-[0_12px_28px_-10px_rgba(91,69,229,0.45)] sm:h-14 sm:w-14 sm:rounded-2xl dark:border-brand-800/50 dark:from-zinc-800 dark:to-zinc-900 dark:text-brand-300 dark:group-hover:border-brand-600/40">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" aria-hidden />
                    </span>
                    <span className="mt-3 min-w-0 text-pretty text-xs font-bold leading-snug text-stone-800 transition-colors duration-300 group-hover:text-brand-900 sm:mt-4 sm:text-sm md:mt-5 md:text-base">
                      {label}
                    </span>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-12 max-lg:py-12 md:py-16 lg:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 max-lg:px-4 md:px-5">
          <Reveal className="text-center">
            <SectionEyebrow>{t('home.beforeAfter.eyebrow')}</SectionEyebrow>
            <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:mt-5 sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t('home.beforeAfter.title')}
            </h2>
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
                      <X className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden />
                    </span>
                    {t('home.beforeAfter.chatOnly')}
                  </h3>
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
                    {t('home.beforeAfter.withStallio')}
                  </h3>
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

      <section className="relative overflow-hidden bg-stone-100 py-12 max-lg:py-12 md:py-16 lg:py-28">
        <div className="pointer-events-none absolute left-0 top-24 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl max-lg:hidden" aria-hidden />
        <div className="mx-auto w-full max-w-7xl px-4 max-lg:px-4 md:px-5">
          <Reveal className="text-center">
            <SectionEyebrow>{t('home.stepsSection.eyebrow')}</SectionEyebrow>
            <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:mt-5 sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t('home.stepsSection.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-medium text-stone-600 max-lg:mt-3 sm:mt-4 sm:text-lg">{t('home.stepsSection.subtitle')}</p>
          </Reveal>

          <div className="relative mx-auto mt-10 max-w-5xl max-lg:mt-10 md:mt-16 lg:mt-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-[52px] z-0 hidden h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 sm:block [clip-path:inset(0_19%_0_19%)]"
            />
            <div className="relative z-[1] grid gap-10 max-lg:gap-10 sm:grid-cols-3 sm:gap-10 lg:gap-14">
              {steps.map(({ icon: Icon, title, desc, sub }, i) => (
                <Reveal key={title} delayMs={i * 100} className="relative text-center">
                  <div className="relative z-20 mx-auto flex h-[88px] w-[88px] items-center justify-center max-lg:h-[88px] max-lg:w-[88px] sm:h-[104px] sm:w-[104px]">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.1rem] border border-brand-300/70 bg-white text-brand-700 shadow-[0_12px_32px_-12px_rgba(47,33,132,0.35)] ring-2 ring-white transition-all duration-500 hover:-translate-y-2 hover:rotate-2 hover:shadow-[0_20px_44px_-16px_rgba(47,33,132,0.45)] max-lg:h-20 max-lg:w-20 sm:h-24 sm:w-24 sm:rounded-[1.25rem]">
                      <Icon className="h-9 w-9 max-lg:h-9 max-lg:w-9 sm:h-11 sm:w-11" aria-hidden />
                      <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-brand-500 to-brand-600 text-[0.65rem] font-black text-white shadow-lg sm:h-9 sm:w-9 sm:rounded-xl sm:text-xs">
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-stone-900 max-lg:mt-5 sm:mt-8 sm:text-xl">{title}</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-stone-600">{desc}</p>
                  <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-brand-700 max-lg:mt-2 sm:mt-3 sm:text-[0.7rem]">{sub}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 max-lg:py-12 md:py-16 lg:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 max-lg:px-4 md:px-5">
          <div className="grid items-center gap-10 max-lg:gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="order-2 text-center max-lg:order-2 lg:order-1 lg:text-start">
              <SectionEyebrow>{t('home.preview.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mx-auto mt-4 max-w-2xl text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:mt-5 sm:text-3xl md:text-4xl lg:mx-0 lg:max-w-none">
                {t('home.preview.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-5 sm:text-lg lg:mx-0 lg:max-w-none">
                {t('home.preview.subtitle')}
              </p>

              <ul className="mt-6 space-y-2.5 max-lg:mt-6 sm:mt-10 sm:space-y-3">
                {previewBullets.map(({ icon: Icon, text }) => (
                  <li key={text}>
                    <SpotlightCard className="group flex cursor-default items-center gap-3 rounded-xl border border-stone-200/90 bg-stone-50/50 p-3 transition-all duration-500 hover:border-brand-200 hover:bg-white hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.18)] max-lg:rounded-xl max-lg:p-3 sm:gap-4 sm:rounded-2xl sm:p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200/80 bg-white text-brand-700 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-brand-200 group-hover:shadow-md max-lg:h-10 max-lg:w-10 sm:h-12 sm:w-12 sm:rounded-xl">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                      </span>
                      <span className="text-start text-sm font-bold text-stone-800 sm:text-base">{text}</span>
                    </SpotlightCard>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="group mt-10 inline-flex items-center gap-2 text-sm font-bold text-brand-700 no-underline transition-all hover:gap-3 hover:text-brand-900"
              >
                {t('home.preview.openYourShop')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
              </Link>
            </Reveal>

            <Reveal className="order-1 flex justify-center max-lg:order-1 lg:order-2 lg:justify-end" delayMs={80}>
              <div className="relative w-full max-w-[min(100%,340px)] max-lg:mx-auto sm:max-w-md">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-brand-400/25 via-transparent to-brand-300/20 blur-2xl" aria-hidden />
                <SpotlightCard className="relative overflow-hidden rounded-[1.85rem] border border-stone-200/90 bg-white shadow-[0_24px_64px_-24px_rgba(0,0,0,0.2)] transition-transform duration-500 hover:-translate-y-2">
                  <div className="marketing-demo-header border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-6 py-5">
                    <p className="text-lg font-bold text-stone-900">{t('home.preview.demoStore')}</p>
                    <p className="text-sm font-semibold text-brand-700">{t('home.preview.demoUrl')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-6">
                    {HOME_PREVIEW_IMAGES.map((src) => (
                      <div
                        key={src}
                        className="group/c aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 transition-all duration-500 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
                      >
                        <img
                          src={src}
                          alt=""
                          width={200}
                          height={200}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover/c:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-6 pt-0">
                    <Link
                      to={MARKETING_DEMO_SHOP_PATH}
                      className="home-btn-primary group relative block w-full rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-4 text-center text-sm font-bold text-white no-underline"
                    >
                      <span className="relative z-[2] inline-flex items-center justify-center gap-2">
                        {t('home.preview.browseDemo')}
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                      </span>
                    </Link>
                  </div>
                </SpotlightCard>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative border-y border-stone-200/80 bg-stone-50 py-12 max-lg:py-12 md:py-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(91,69,229,0.12),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 max-lg:px-4 md:px-5">
          <Reveal className="text-center">
            <SectionEyebrow>{t('home.included.eyebrow')}</SectionEyebrow>
            <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:mt-5 sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t('home.included.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-5 sm:text-lg">
              {t('home.included.subtitle')}
            </p>
          </Reveal>

          <ul className="mt-8 grid list-none grid-cols-1 gap-3 p-0 max-lg:mt-8 sm:mt-10 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:auto-rows-fr">
            {includedItems.map((line, i) => (
              <Reveal key={line} delayMs={(i % 3) * 50} className="h-full min-h-0">
                <li className="h-full">
                  <SpotlightCard className="flex h-full min-h-[3.25rem] w-full items-center gap-2.5 rounded-xl border border-stone-200/90 bg-white px-3 py-3 text-start shadow-sm sm:gap-3 sm:rounded-2xl sm:px-3.5 sm:py-3.5 lg:min-h-[3rem] dark:border-zinc-600/90 dark:bg-zinc-900">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-zinc-800 dark:text-brand-300">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    <span
                      title={line}
                      className="min-w-0 flex-1 text-[0.8125rem] font-semibold leading-tight text-stone-800 sm:text-sm lg:truncate lg:whitespace-nowrap dark:text-zinc-100"
                    >
                      {line}
                    </span>
                  </SpotlightCard>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-12 max-lg:py-12 md:py-16 lg:py-28">
        <div className="relative mx-auto w-full max-w-7xl px-4 max-lg:px-4 md:px-5">
          <Reveal className="text-center">
            <SectionEyebrow>{t('home.benefits.eyebrow')}</SectionEyebrow>
            <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:mt-5 sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t('home.benefits.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-5 sm:text-lg">
              {t('home.benefits.subtitle')}
            </p>
          </Reveal>

          <div className="mt-8 grid gap-3 max-lg:mt-8 max-lg:grid-cols-1 max-lg:gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delayMs={(i % 3) * 70}>
                <SpotlightCard className="group flex h-full flex-col items-center rounded-2xl border border-stone-200/90 bg-white px-5 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/90 hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.18)] sm:px-6 sm:py-6">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50/80 text-brand-700 transition-all duration-300 group-hover:scale-105 group-hover:border-brand-200 group-hover:shadow-md">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-base font-bold text-stone-900 transition-colors duration-300 group-hover:text-brand-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{desc}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-stone-200/80 bg-stone-50 py-12 max-lg:py-12 md:py-20 lg:py-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(91,69,229,0.12),transparent_55%)]"
          aria-hidden
        />
        <Reveal className="relative mx-auto max-w-3xl px-4 text-center max-lg:px-4 md:px-5">
          <h2 className="home-headline text-balance text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            {t('home.finalCta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-stone-600 max-lg:mt-4 sm:mt-6 sm:text-lg">
            {t('home.finalCta.subtitle')}
          </p>
          <div className="marketing-twin-cta-md">
            <Link
              to="/signup"
              className="home-btn-primary marketing-twin-cta-btn-wide group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-10"
            >
              <span className="relative z-[2] inline-flex items-center gap-2">
                {t('home.finalCta.createFreeStore')}
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
              </span>
            </Link>
            <Link
              to="/login"
              className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-8"
            >
              <LogIn className="h-5 w-5" aria-hidden />
              {t('home.finalCta.logIn')}
            </Link>
          </div>
        </Reveal>
      </section>
      </div>
    </PublicLayout>
  );
}
