import { IconArrowUpRight } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { BezelShell } from '@/components/ui/bezel-shell';
import { Button } from '@/components/ui/button';
import { MARKETING_DEMO_SHOP_PATH } from '@/lib/marketingDemoShop';
import { motionEase } from '@/lib/motion';

const journeyMeta = [
  {
    src: '/assets/images/demo-catalog.png',
    rotateClass: 'md:-rotate-[2.5deg]',
  },
  {
    src: '/assets/images/product-2.jpg',
    rotateClass: 'md:rotate-[2deg]',
  },
  {
    src: '/assets/images/demo-checkout.png',
    rotateClass: 'md:-rotate-[1.5deg]',
  },
] as const;

type JourneyItem = {
  n: string;
  label: string;
  detail: string;
  alt: string;
};

export function HowHero() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const journey = t('howItWorks.hero.journey', {
    returnObjects: true,
  }) as JourneyItem[];

  return (
    <section className={heroBleedClassName}>
      <HeroAtmosphere sparkleId="how-hero-sparkles" variant="home" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col justify-end gap-12 px-4 py-24 sm:px-6 md:justify-center md:py-28 lg:gap-16">
        <div className="grid items-end gap-12 md:grid-cols-12 md:gap-8 lg:gap-12">
          <motion.div
            className="flex max-w-xl flex-col gap-6 md:col-span-6 md:pb-6 lg:col-span-5"
            initial={reduce ? false : 'hidden'}
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: reduce ? 0 : 0.1 },
              },
            }}
          >
            <motion.div
              className="flex items-center gap-3"
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.65, ease: motionEase },
                },
              }}
            >
              <img
                src="/assets/images/logo.png"
                alt=""
                width={44}
                height={46}
                className="h-11 w-auto"
              />
              <p className="text-foreground text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                {t('home.actions.brandName')}
              </p>
            </motion.div>

            <motion.span
              className="border-border/70 bg-background/80 text-muted-foreground w-fit rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase"
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: motionEase },
                },
              }}
            >
              {t('howItWorks.hero.eyebrow')}
            </motion.span>

            <motion.h1
              className="text-foreground max-w-[12ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.06]"
              variants={{
                hidden: { opacity: 0, y: 22 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.75, ease: motionEase },
                },
              }}
            >
              {t('howItWorks.hero.titleBefore')}{' '}
              <span className="text-brand">{t('howItWorks.hero.titleAccent')}</span>
            </motion.h1>

            <motion.p
              className="text-muted-foreground max-w-[38ch] text-base leading-7 sm:text-lg sm:leading-8"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: motionEase },
                },
              }}
            >
              {t('howItWorks.hero.body')}
            </motion.p>

            <motion.div
              className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.65, ease: motionEase },
                },
              }}
            >
              <span>{t('howItWorks.hero.metaFast')}</span>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span>{t('howItWorks.hero.metaMobile')}</span>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center gap-3 pt-1"
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.65, ease: motionEase },
                },
              }}
            >
              <Button
                asChild
                size="lg"
                className="group rounded-full px-5 active:scale-[0.98]"
              >
                <Link to="/signup" className="inline-flex items-center gap-2">
                  {t('home.actions.startFree')}
                  <span className="bg-background/15 inline-flex size-8 items-center justify-center rounded-full">
                    <IconArrowUpRight className="size-4" stroke={1.5} />
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full px-5 active:scale-[0.98]"
              >
                <Link
                  to={MARKETING_DEMO_SHOP_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('about.hero.viewDemoStore')}
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative md:col-span-6 lg:col-span-7">
            <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible md:pb-0">
              {journey.map((item, index) => {
                const meta = journeyMeta[index];
                if (!meta) return null;

                return (
                  <motion.div
                    key={item.n}
                    className={`w-[72%] shrink-0 snap-center sm:w-[56%] md:w-auto md:shrink ${
                      index === 0
                        ? 'md:col-span-7 md:row-span-2'
                        : index === 1
                          ? 'md:col-span-5 md:mt-8'
                          : 'md:col-span-5 md:-mt-4 md:col-start-8'
                    } ${reduce ? '' : meta.rotateClass}`}
                    initial={reduce ? false : { opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: reduce ? 0 : 0.18 + index * 0.1,
                      ease: motionEase,
                    }}
                  >
                    <BezelShell
                      className="rounded-[1.75rem]"
                      innerClassName="overflow-hidden rounded-[calc(1.75rem-0.375rem)]"
                    >
                      <div
                        className={`relative w-full ${index === 0 ? 'aspect-[4/5] md:min-h-[22rem]' : 'aspect-[5/4]'}`}
                      >
                        <img
                          src={meta.src}
                          alt={item.alt}
                          className="absolute inset-0 size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.2em] text-white/70 tabular-nums">
                              {item.n}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                              {item.label}
                            </p>
                            <p className="text-xs text-white/75 sm:text-sm">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    </BezelShell>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
