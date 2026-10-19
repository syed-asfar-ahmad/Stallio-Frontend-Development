import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { brandColors } from '@/constants/colors';
import { fadeUp } from '@/lib/motion';

export function ContactHero() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section className={heroBleedClassName}>
      <HeroAtmosphere sparkleId="contact-hero-sparkles" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Spotlight
          className="-top-40 end-0 md:-top-24 md:end-40"
          fill={brandColors.brand}
        />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[60dvh] w-full max-w-7xl items-center justify-center px-6 py-24 md:py-32">
        <motion.div
          className="pointer-events-auto flex flex-col items-center gap-6 text-center"
          initial={reduce ? false : 'hidden'}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduce ? 0 : 0.12 } },
          }}
        >
          <motion.span
            className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase"
            variants={fadeUp(0.6, 14)}
          >
            {t('contact.hero.eyebrow')}
          </motion.span>

          <motion.h1
            className="text-foreground max-w-[16ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.05]"
            variants={fadeUp(0.75, 22)}
          >
            {t('contact.hero.title')}
          </motion.h1>

          <motion.div className="max-w-2xl" variants={fadeUp()}>
            <TextGenerateEffect
              words={t('contact.hero.subtitle')}
              className="text-base leading-7 sm:text-lg sm:leading-8 md:text-xl"
              duration={0.35}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
