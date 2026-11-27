import { useRef } from 'react';
import { Zap } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { motionEase } from '@/lib/motion';

const HOME_PREVIEW_IMAGES = [
  '/assets/images/product-1.jpg',
  '/assets/images/product-2.jpg',
  '/assets/images/product-3.jpg',
  '/assets/images/product-4.jpg',
] as const;

function SpotlightCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
    <div
      ref={ref}
      className={`home-spotlight ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

/** Previous client hero visual: phone mock with shop preview grid. */
export function HomeHeroVisual() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative flex w-full justify-center lg:justify-end"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.75,
        delay: reduce ? 0 : 0.1,
        ease: motionEase,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div className="h-[min(75%,380px)] w-[min(85%,380px)] rounded-full bg-brand-400/12 blur-[60px] animate-home-float-slow max-lg:opacity-80 lg:h-[min(90%,520px)] lg:w-[min(90%,520px)] lg:blur-[80px] lg:opacity-100" />
      </div>
      <div className="relative w-full max-w-[min(100%,300px)] max-lg:mx-auto sm:max-w-[320px] md:max-w-[360px] lg:me-2 lg:max-w-[360px]">
        <div
          className="absolute -inset-3 rounded-[2.85rem] bg-gradient-to-tr from-brand-400/25 via-transparent to-brand-300/20 opacity-80 blur-2xl transition-opacity duration-700 hover:opacity-100"
          aria-hidden
        />
        <SpotlightCard className="rounded-[2.25rem] p-[2px] shadow-2xl shadow-stone-900/10 ring-1 ring-stone-200/80 transition-[transform,ring-color] duration-500 hover:-translate-y-2 hover:ring-brand-300/60 max-lg:rounded-[2.25rem] sm:rounded-[2.75rem] lg:rounded-[2.75rem]">
          <div className="overflow-hidden rounded-[2.15rem] border-[10px] border-stone-800 bg-stone-900 max-lg:border-[10px] sm:rounded-[2.65rem] sm:border-[12px]">
            <div className="flex h-8 items-center justify-center bg-stone-900 sm:h-9">
              <div className="h-1 w-14 rounded-full bg-stone-600 sm:w-16" aria-hidden />
            </div>
            <div className="marketing-device-screen min-h-[340px] bg-gradient-to-b from-stone-50 to-white px-4 pb-5 pt-4 max-lg:min-h-[340px] sm:min-h-[400px] sm:px-5 sm:pb-6 sm:pt-5 md:min-h-[440px]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-700">
                    {t('home.hero.deviceLive')}
                  </p>
                  <p className="text-lg font-bold text-stone-900">
                    {t('home.hero.deviceYourShop')}
                  </p>
                  <p className="text-xs font-medium text-stone-500">
                    {t('home.hero.deviceUrl')}
                  </p>
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
    </motion.div>
  );
}
