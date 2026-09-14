import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Link2,
  Package,
  LayoutDashboard,
  Smartphone,
  CreditCard,
  Sparkles,
  Zap,
  Shield,
  Rocket,
  ArrowRight,
  Check,
  BadgePercent,
  FileDown,
  Truck,
  LayoutGrid,
  BarChart3,
  Inbox,
  Headphones,
  Banknote,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';
import { MARKETING_DEMO_SHOP_PATH } from '../lib/marketingDemoShop';

const CORE_ICONS = [Link2, Package, LayoutDashboard, Smartphone, BadgePercent, FileDown, Truck, LayoutGrid] as const;
const HERO_VISUAL_ICONS = [LayoutDashboard, Package, BadgePercent, FileDown] as const;
const QUALITY_ICONS = [Banknote, BarChart3, Inbox, Headphones] as const;

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">{children}</p>
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

export default function Features() {
  const { t } = useTranslation();
  const Icon = Store;

  const checklist = t('features.hero.checklist', { returnObjects: true }) as string[];
  const heroVisualTiles = useMemo(() => {
    const labels = t('features.hero.mockRows', { returnObjects: true }) as string[];
    return labels.map((label, i) => ({
      label,
      icon: HERO_VISUAL_ICONS[i] ?? LayoutDashboard,
    }));
  }, [t]);

  const flagshipTitle = t('features.grid.flagship.title');
  const flagshipDescription = t('features.grid.flagship.description');
  const flagshipBullets = t('features.grid.flagship.bullets', { returnObjects: true }) as string[];

  const coreFeatures = useMemo(() => {
    const rows = t('features.grid.core', { returnObjects: true }) as { title: string; description: string }[];
    return rows.map((row, i) => ({ ...row, icon: CORE_ICONS[i]! }));
  }, [t]);

  const coreFeaturesBeside = coreFeatures.slice(0, 4);
  const coreFeaturesRow = coreFeatures.slice(4);

  const qualityFeatures = useMemo(() => {
    const rows = t('features.grid.quality', { returnObjects: true }) as { title: string; description: string }[];
    return rows.map((row, i) => ({ ...row, icon: QUALITY_ICONS[i]! }));
  }, [t]);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip bg-white">
        <section className={`${heroBleedClassName} overflow-x-clip bg-white text-stone-900`}>
          <HeroAtmosphere sparkleId="features-hero-sparkles" />

          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 py-10 max-lg:px-4 sm:py-14 md:px-5 md:py-28">
            <div className="grid min-w-0 items-center gap-8 text-center max-lg:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:text-start xl:gap-14">
              <div className="mx-auto w-full min-w-0 max-w-xl lg:mx-0">
                <p className="opacity-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-brand-600 animate-fade-up animation-delay-100 dark:text-brand-400">
                  {t('features.hero.eyebrow')}
                </p>
                <h1 className="home-headline opacity-0 mt-4 text-balance text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-stone-900 animate-fade-up animation-delay-150 max-lg:mt-4 sm:mt-5 sm:text-5xl md:text-[3.25rem] dark:text-zinc-50">
                  {t('features.hero.titleLine1')}
                  <span className="marketing-gradient-text mt-2 block bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent dark:from-brand-400 dark:via-brand-300 dark:to-brand-400">
                    {t('features.hero.titleLine2')}
                  </span>
                </h1>
                <p className="opacity-0 mx-auto mt-4 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-200 max-lg:mt-4 sm:mt-6 sm:text-base md:text-lg lg:mx-0 dark:text-zinc-400">
                  {t('features.hero.subtitle')}
                </p>

                <ul className="opacity-0 mx-auto mt-6 flex max-w-lg flex-col gap-2.5 text-start animate-fade-up animation-delay-250 max-lg:mt-6 sm:mt-8 sm:max-w-xl lg:mx-0 lg:mt-10 lg:max-w-none">
                  {checklist.map((line) => (
                    <li key={line} className="flex gap-3 text-sm font-semibold text-stone-800 sm:text-[0.95rem] dark:text-zinc-200">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-zinc-800 dark:text-brand-300"
                        aria-hidden
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="marketing-twin-cta-sm opacity-0 animate-fade-up animation-delay-300">
                  <Link
                    to="/signup"
                    className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-8"
                  >
                    <span className="relative z-[2] inline-flex items-center gap-2">
                      {t('features.hero.startFree')}
                      <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                    </span>
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-7"
                  >
                    {t('features.hero.seeHowItWorks')}
                  </Link>
                </div>
              </div>

              <div className="relative flex w-full justify-center lg:justify-end">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                  <div className="h-[min(75%,320px)] w-[min(85%,320px)] rounded-full bg-gradient-to-tr from-brand-400/12 via-brand-400/10 to-brand-300/8 blur-[60px] animate-home-float-slow max-lg:opacity-80 sm:h-[min(85%,400px)] sm:w-[min(90%,400px)] sm:blur-[72px] lg:h-[min(90%,460px)] lg:w-[min(90%,460px)] lg:blur-[80px] lg:opacity-100 dark:from-brand-500/25 dark:via-brand-500/15 dark:to-brand-500/10" />
                </div>
                <div className="relative z-[1] w-full max-w-[min(100%,340px)] opacity-0 animate-fade-up animation-delay-300 max-lg:mx-auto sm:max-w-[400px] lg:me-2 lg:max-w-[min(100%,440px)]">
                  <div className="relative overflow-hidden rounded-[1.35rem] border border-stone-200/90 bg-gradient-to-b from-white via-white to-stone-50/90 p-4 shadow-[0_22px_48px_-28px_rgba(47,33,132,0.18),0_8px_24px_-12px_rgba(0,0,0,0.06)] ring-1 ring-brand-500/[0.06] max-lg:rounded-[1.35rem] sm:rounded-[1.85rem] sm:p-8 dark:border-brand-500/25 dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:shadow-[0_28px_56px_-20px_rgba(0,0,0,0.55),0_0_48px_-12px_rgba(94,43,236,0.18),inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:ring-brand-400/20">
                    <div
                      className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 dark:opacity-100 dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(91,69,229,0.14),transparent_50%)]"
                      aria-hidden
                    />
                    <div className="relative z-[1] mb-6 flex items-start gap-4 sm:mb-8">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-[0_12px_28px_-8px_rgba(63,52,186,0.55)] dark:shadow-[0_0_32px_rgba(91,69,229,0.45),0_12px_28px_-8px_rgba(63,52,186,0.4)]"
                        aria-hidden
                      >
                        <Store className="h-6 w-6" strokeWidth={2} />
                      </span>
                      <p
                        id="features-hero-flow-heading"
                        className="min-w-0 pt-1 text-balance text-base font-extrabold leading-snug tracking-tight text-stone-900 sm:text-lg dark:text-zinc-50"
                      >
                        {t('features.hero.flowHeading')}
                      </p>
                    </div>

                    <ol
                      className="relative z-[1] m-0 list-none space-y-0 p-0"
                      aria-labelledby="features-hero-flow-heading"
                    >
                      {heroVisualTiles.map((tile, i) => {
                        const RowIcon = tile.icon;
                        const isLast = i === heroVisualTiles.length - 1;
                        const step = i + 1;
                        return (
                          <li key={tile.label} className="relative pb-8 last:pb-0 sm:pb-9">
                            {!isLast && (
                              <span
                                className="absolute start-[1.3125rem] top-[2.75rem] bottom-0 w-[3px] rounded-full bg-gradient-to-b from-brand-400/55 via-brand-200/35 to-brand-100/20 sm:start-[1.375rem] dark:from-brand-400/90 dark:via-brand-500/50 dark:to-brand-600/15 dark:shadow-[0_0_12px_rgba(91,69,229,0.35)]"
                                aria-hidden
                              />
                            )}
                            <span
                              className="absolute start-0 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[0.8125rem] font-extrabold tabular-nums text-white shadow-md ring-[3px] ring-white sm:h-12 sm:w-12 sm:text-sm dark:ring-zinc-950 dark:shadow-[0_0_24px_rgba(94,43,236,0.45),0_4px_14px_-4px_rgba(0,0,0,0.4)]"
                              aria-hidden
                            >
                              {step}
                            </span>
                            <div className="ms-14 rounded-2xl border border-stone-100 bg-white/90 px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-brand-200/80 hover:shadow-md sm:ms-16 sm:px-5 sm:py-4 dark:border-white/10 dark:bg-zinc-800/55 dark:backdrop-blur-md dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_8px_28px_-8px_rgba(0,0,0,0.45)] dark:hover:border-brand-400/45 dark:hover:shadow-[0_12px_36px_-10px_rgba(91,69,229,0.22),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                              <div className="flex items-start gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700 dark:border-zinc-600/80 dark:bg-zinc-800 dark:text-brand-300">
                                  <RowIcon className="size-4" strokeWidth={2} aria-hidden />
                                </span>
                                <p className="min-w-0 flex-1 text-pretty text-[0.8125rem] font-semibold leading-snug text-stone-800 sm:text-[0.9375rem] dark:text-zinc-100">
                                  {tile.label}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-stone-200/80 bg-stone-50 py-12 max-lg:py-12 md:py-28 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/80 to-transparent dark:via-brand-500/30" aria-hidden />
          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 max-lg:px-4 md:px-5">
            <Reveal className="text-center">
              <SectionEyebrow>{t('features.grid.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mx-auto mt-4 max-w-3xl text-2xl font-extrabold text-stone-900 max-lg:mt-4 sm:mt-5 sm:text-3xl md:text-4xl md:leading-tight lg:text-[2.5rem] dark:text-zinc-50">
                {t('features.grid.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-stone-600 max-lg:mt-4 sm:mt-5 sm:text-lg dark:text-zinc-400">
                {t('features.grid.subtitle')}
              </p>
            </Reveal>

            <div className="mt-8 grid gap-4 max-lg:mt-8 max-lg:gap-4 sm:mt-14 sm:gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
              <Reveal className="flex h-full lg:col-span-5" delayMs={0}>
                <SpotlightCard className="marketing-dark-gradient-card group flex h-full w-full flex-col rounded-[1.75rem] border border-stone-200/90 bg-gradient-to-br from-white via-brand-50/50 to-brand-50/30 p-5 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_24px_48px_-24px_rgba(47,33,132,0.14)] sm:p-8 md:p-10 dark:border-zinc-700/80 dark:hover:border-brand-500/35">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-200/80 bg-white text-brand-700 shadow-sm transition-transform duration-500 group-hover:scale-105 dark:border-brand-700/45 dark:bg-zinc-800 dark:text-brand-300">
                    <Icon className="h-7 w-7" aria-hidden />
                  </span>
                  <h3 className="home-headline mt-8 text-2xl font-extrabold text-stone-900 dark:text-zinc-50">{flagshipTitle}</h3>
                  <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-stone-600 sm:text-base dark:text-zinc-400">{flagshipDescription}</p>
                  <ul className="mt-8 space-y-3 border-t border-stone-200/80 pt-8 dark:border-zinc-700/80 lg:mt-auto">
                    {flagshipBullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm font-semibold text-stone-800 dark:text-zinc-200">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-zinc-800 dark:text-brand-300">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </Reveal>

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:col-span-7 lg:auto-rows-fr lg:gap-6">
                {coreFeaturesBeside.map(({ icon: F, title, description }, i) => (
                  <Reveal key={title} className="flex h-full" delayMs={80 + i * 60}>
                    <SpotlightCard className="group flex h-full w-full flex-col rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/90 hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.12)] sm:p-7 dark:border-zinc-700/80 dark:bg-zinc-950 dark:hover:border-brand-500/35">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50/90 text-brand-700 transition-all duration-300 group-hover:scale-105 group-hover:border-brand-200 group-hover:shadow-md dark:border-brand-800/50 dark:bg-zinc-800 dark:text-brand-300 dark:group-hover:border-brand-600/40">
                        <F className="h-5 w-5" aria-hidden />
                      </span>
                      <h3 className="mt-5 text-lg font-bold text-stone-900 transition-colors duration-300 group-hover:text-brand-900 dark:text-zinc-100 dark:group-hover:text-brand-300">
                        {title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-stone-600 dark:text-zinc-400">{description}</p>
                    </SpotlightCard>
                  </Reveal>
                ))}
              </div>

              {coreFeaturesRow.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:col-span-12 lg:grid-cols-4 lg:gap-6">
                  {coreFeaturesRow.map(({ icon: F, title, description }, i) => (
                    <Reveal key={title} className="flex h-full" delayMs={320 + i * 60}>
                      <SpotlightCard className="group flex h-full w-full flex-col rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/90 hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.12)] sm:p-7 dark:border-zinc-700/80 dark:bg-zinc-950 dark:hover:border-brand-500/35">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50/90 text-brand-700 transition-all duration-300 group-hover:scale-105 group-hover:border-brand-200 group-hover:shadow-md dark:border-brand-800/50 dark:bg-zinc-800 dark:text-brand-300 dark:group-hover:border-brand-600/40">
                          <F className="h-5 w-5" aria-hidden />
                        </span>
                        <h3 className="mt-5 text-lg font-bold text-stone-900 transition-colors duration-300 group-hover:text-brand-900 dark:text-zinc-100 dark:group-hover:text-brand-300">
                          {title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-stone-600 dark:text-zinc-400">{description}</p>
                      </SpotlightCard>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 max-lg:mt-6 max-lg:gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {qualityFeatures.map(({ icon: F, title, description }, i) => (
                <Reveal key={title} delayMs={i * 70}>
                  <SpotlightCard className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200/90 hover:shadow-[0_16px_40px_-20px_rgba(47,33,132,0.12)] sm:p-6 lg:text-start dark:border-zinc-700/80 dark:bg-zinc-950 dark:hover:border-brand-500/35">
                    <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50/90 text-brand-700 transition-all duration-300 group-hover:scale-105 group-hover:border-brand-200 group-hover:shadow-md dark:border-brand-800/50 dark:bg-zinc-800 dark:text-brand-300 dark:group-hover:border-brand-600/40 lg:mx-0">
                      <F className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-stone-900 transition-colors duration-300 group-hover:text-brand-900 dark:text-zinc-100 dark:group-hover:text-brand-300">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-stone-600 dark:text-zinc-400">{description}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-stone-200/80 bg-white py-12 max-lg:py-12 md:py-28 dark:border-zinc-800 dark:bg-zinc-950">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(91,69,229,0.1),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(91,69,229,0.08),transparent_55%)]"
            aria-hidden
          />
          <Reveal className="relative mx-auto w-full min-w-0 max-w-2xl px-4 text-center max-lg:px-4 md:px-5">
            <h2 className="home-headline text-balance text-2xl font-extrabold text-stone-900 max-lg:text-2xl sm:text-3xl md:text-4xl lg:text-5xl dark:text-zinc-50">
              {t('features.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-stone-600 max-lg:mt-4 sm:mt-6 sm:text-lg dark:text-zinc-400">
              {t('features.cta.subtitle')}
            </p>
            <div className="marketing-twin-cta-md">
              <Link
                to="/signup"
                className="home-btn-primary marketing-twin-cta-btn-wide group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-10"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <Store className="h-5 w-5 shrink-0" aria-hidden />
                  {t('features.cta.createYourShop')}
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </span>
              </Link>
              <Link
                to={MARKETING_DEMO_SHOP_PATH}
                className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-8"
              >
                {t('features.cta.viewDemoStore')}
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </PublicLayout>
  );
}
