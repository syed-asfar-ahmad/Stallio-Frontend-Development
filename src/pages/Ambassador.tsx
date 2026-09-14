import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Check, ExternalLink } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';

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

export default function Ambassador() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('ambassador.metaTitle');
  }, [t]);

  const highlightsRaw = t('ambassador.highlights', { returnObjects: true });
  const highlights = Array.isArray(highlightsRaw) ? (highlightsRaw as string[]) : [];

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className={`${heroBleedClassName} bg-white text-stone-900 dark:bg-zinc-950 dark:text-zinc-50`}>
          <HeroAtmosphere sparkleId="ambassador-hero-sparkles" />

          <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 py-10 text-center max-lg:px-4 sm:py-14 md:px-5 md:py-24 lg:py-28">
            <p className="opacity-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-brand-600 animate-fade-up animation-delay-100 dark:text-brand-400">
              {t('ambassador.hero.eyebrow')}
            </p>
            <h1 className="home-headline opacity-0 mt-4 text-balance text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-stone-900 animate-fade-up animation-delay-150 dark:text-zinc-50 sm:mt-5 sm:text-[2rem] md:text-5xl lg:text-[3.15rem] lg:leading-[1.08]">
              {t('ambassador.hero.title')}
            </h1>
            <p className="opacity-0 mx-auto mt-4 max-w-[42ch] text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-200 dark:text-zinc-300 sm:mt-6 sm:text-base md:text-lg">
              {t('ambassador.hero.subtitle')}
            </p>
          </div>
        </section>

        <section className="scroll-mt-28 border-t border-stone-200/80 bg-stone-50 py-12 dark:border-zinc-800 dark:bg-zinc-950 sm:py-16 md:py-24">
          <div className="mx-auto w-full min-w-0 max-w-3xl px-4 max-lg:px-4 sm:max-w-2xl md:px-5">
            <Reveal>
              <SpotlightCard className="rounded-[1.35rem] border border-stone-200/70 bg-white p-6 opacity-95 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow] duration-500 sm:rounded-[1.75rem] sm:p-8 dark:border-zinc-700/80 dark:bg-zinc-900">
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950/50 dark:text-brand-300 dark:ring-brand-800/60"
                    aria-hidden
                  >
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8125rem] font-semibold tracking-[0.04em] text-brand-700 dark:text-brand-400">
                      {t('ambassador.badge')}
                    </p>
                    <h2 className="mt-2 text-balance text-xl font-extrabold leading-snug tracking-[-0.02em] text-stone-900 dark:text-zinc-50 sm:text-2xl">
                      {t('ambassador.title')}
                    </h2>
                  </div>
                </div>

                <p className="mt-5 max-w-[42ch] text-sm font-medium leading-relaxed text-stone-600 dark:text-zinc-300 sm:text-base">
                  {t('ambassador.description')}
                </p>

                {highlights.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm leading-relaxed text-stone-700 dark:text-zinc-200"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:ring-brand-800/60">
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-8">
                  <a
                    href={AMBASSADOR_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('ambassador.applyAria')}
                    className="home-btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-3.5 text-sm font-bold text-white no-underline sm:w-auto sm:text-base"
                  >
                    <span className="relative z-[2] inline-flex items-center gap-2">
                      {t('ambassador.apply')}
                      <ExternalLink className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                    </span>
                  </a>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}