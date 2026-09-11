import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Check, ExternalLink } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

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
        <section className="relative isolate overflow-hidden bg-white text-stone-900 dark:bg-zinc-950 dark:text-zinc-50">
          <div
            className="pointer-events-none absolute -left-32 top-1/4 h-[280px] w-[280px] rounded-full bg-brand-400/15 blur-[80px] animate-blob max-lg:opacity-70 sm:h-[360px] sm:w-[360px] lg:h-[420px] lg:w-[420px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-20 bottom-0 h-[240px] w-[240px] rounded-full bg-brand-400/12 blur-[70px] animate-blob animate-blob-delayed max-lg:opacity-70 sm:h-[320px] sm:w-[320px] lg:h-[380px] lg:w-[380px]"
            aria-hidden
          />

          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:py-14 md:px-5 md:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="opacity-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-brand-600 animate-fade-up animation-delay-100 dark:text-brand-400">
                {t('ambassador.hero.eyebrow')}
              </p>
              <h1 className="home-headline opacity-0 mt-4 text-balance text-[1.75rem] font-extrabold leading-[1.12] text-stone-900 animate-fade-up animation-delay-150 dark:text-zinc-50 sm:text-[2rem] md:text-5xl">
                {t('ambassador.hero.title')}
              </h1>
              <p className="opacity-0 mx-auto mt-4 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-200 dark:text-zinc-300 sm:mt-6 sm:text-base md:text-lg">
                {t('ambassador.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200/80 bg-[#fafaf9] py-12 dark:border-zinc-800 dark:bg-zinc-950 sm:py-16 lg:py-20">
          <div className="mx-auto w-full min-w-0 max-w-5xl px-4 md:px-5">
            <Reveal>
              <SpotlightCard className="rounded-3xl border border-stone-200/90 bg-white p-8 shadow-sm shadow-stone-200/40 dark:border-zinc-700/90 dark:bg-zinc-900 dark:shadow-black/20 sm:p-10 lg:p-12">
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950/50 dark:text-brand-300 dark:ring-brand-800/60"
                    aria-hidden
                  >
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
                      {t('ambassador.badge')}
                    </p>
                    <h2 className="mt-1 text-balance text-xl font-bold leading-snug text-stone-900 dark:text-zinc-50 sm:text-3xl">
                      {t('ambassador.title')}
                    </h2>
                  </div>
                </div>
                <p className="mt-6 text-base leading-relaxed text-stone-600 dark:text-zinc-300 sm:text-lg">
                  {t('ambassador.description')}
                </p>
                {highlights.length > 0 && (
                  <ul className="mt-8 space-y-4">
                    {highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-stone-700 dark:text-zinc-200 sm:text-lg">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:ring-brand-800/60">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-10 pt-2">
                  <a
                    href={AMBASSADOR_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('ambassador.applyAria')}
                    className="home-btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-4 text-base font-bold text-white no-underline sm:w-auto sm:text-lg"
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