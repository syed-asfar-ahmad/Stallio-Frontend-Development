import {
  IconArrowRight,
  IconCash,
  IconFileInvoice,
  IconLayoutGrid,
  IconLink,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { BezelShell } from '@/components/ui/bezel-shell';
import { Button } from '@/components/ui/button';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { brandColors } from '@/constants/colors';
import { MARKETING_DEMO_SHOP_PATH } from '@/lib/marketingDemoShop';
import { fadeUp, motionEase } from '@/lib/motion';

const pillarIcons = [IconLink, IconLayoutGrid, IconFileInvoice, IconCash] as const;

export function AboutHero() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const labels = t('about.hero.mockRows', { returnObjects: true }) as string[];
  const pillars = labels.map((label, i) => ({
    label,
    icon: pillarIcons[i] ?? IconLink,
  }));

  return (
    <section className={heroBleedClassName}>
      <HeroAtmosphere sparkleId="about-hero-sparkles" variant="home" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:-top-24 md:left-40"
          fill={brandColors.brand}
        />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-7xl items-center gap-10 px-6 pt-8 pb-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-12 md:pt-10 md:pb-16 lg:gap-16">
        <motion.div
          className="pointer-events-auto flex max-w-xl flex-col gap-5 md:gap-6"
          initial={reduce ? false : 'hidden'}
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: reduce ? 0 : 0.1 },
            },
          }}
        >
          <motion.span
            className="border-border/70 bg-background/70 text-muted-foreground inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase backdrop-blur-sm"
            variants={fadeUp(0.65, 18)}
          >
            {t('about.hero.eyebrow')}
          </motion.span>

          <motion.h1
            className="text-foreground max-w-[16ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]"
            variants={fadeUp(0.7, 22)}
          >
            {t('about.hero.title')}
          </motion.h1>

          <motion.div variants={fadeUp(0.2, 0)}>
            <TextGenerateEffect
              words={t('about.hero.subtitle')}
              className="max-w-[42ch] text-base leading-7 sm:text-lg sm:leading-8"
              duration={0.35}
            />
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-3 pt-1"
            variants={fadeUp(0.55, 16)}
          >
            {reduce ? (
              <Button
                asChild
                size="lg"
                className="rounded-full px-6 active:scale-[0.98]"
              >
                <Link to="/signup">
                  {t('about.hero.startFree')}
                  <IconArrowRight className="size-4 rtl:rotate-180" stroke={1.5} />
                </Link>
              </Button>
            ) : (
              <MovingBorderButton
                as={Link}
                to="/signup"
                borderRadius="9999px"
                duration={2800}
                containerClassName="group h-11 w-auto min-w-[9.5rem] active:scale-[0.98]"
                className="bg-brand gap-2 px-6 hover:bg-[color-mix(in_srgb,var(--brand)_88%,black)]"
              >
                {t('about.hero.startFree')}
                <span className="bg-background/15 inline-flex size-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 rtl:group-hover:-translate-x-0.5">
                  <IconArrowRight className="size-4 rtl:rotate-180" stroke={1.5} />
                </span>
              </MovingBorderButton>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/75 rounded-full px-6 backdrop-blur-sm active:scale-[0.98]"
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

        <motion.div
          className="pointer-events-auto min-w-0"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.85,
            delay: reduce ? 0 : 0.18,
            ease: motionEase,
          }}
        >
          <BezelShell
            className="border-border/60 mx-auto max-w-lg rounded-[2rem] border shadow-[0_40px_80px_-48px_color-mix(in_srgb,var(--brand)_45%,transparent)] ring-0 lg:me-0 lg:ms-auto dark:bg-white/[0.04]"
            innerClassName="overflow-hidden rounded-[calc(2rem-0.375rem)] p-0"
          >
            <ul className="m-0 list-none divide-y divide-border/60 p-0">
              {pillars.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <div className="group flex items-start gap-3.5 px-5 py-4 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand/[0.05] sm:gap-4 sm:px-6 sm:py-5 dark:hover:bg-brand/[0.1]">
                    <span className="bg-brand/10 text-brand inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                      <Icon className="size-[1.125rem]" stroke={1.5} aria-hidden />
                    </span>
                    <p className="text-foreground min-w-0 flex-1 pt-1.5 text-start text-[0.9375rem] font-semibold leading-snug">
                      {label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </BezelShell>
        </motion.div>
      </div>
    </section>
  );
}
