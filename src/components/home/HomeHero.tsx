import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { HomeHeroVisual } from '@/components/home/HomeHeroVisual';
import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { Button } from '@/components/ui/button';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { brandColors } from '@/constants/colors';
import { MARKETING_DEMO_SHOP_PATH } from '@/lib/marketingDemoShop';
import { motionEase } from '@/lib/motion';

export function HomeHero() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section className={heroBleedClassName}>
      <HeroAtmosphere sparkleId="hero-sparkles" variant="home" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:-top-24 md:left-40"
          fill={brandColors.brand}
        />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-7xl items-center gap-8 px-6 pt-8 pb-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-10 md:pt-10 md:pb-16 lg:gap-14">
        <motion.div
          className="pointer-events-auto flex max-w-xl flex-col gap-5 max-lg:order-2 md:gap-6 lg:order-none"
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
              hidden: { opacity: 0, y: 18 },
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
              width={48}
              height={50}
              className="h-12 w-auto"
            />
            <p className="text-foreground text-[1.75rem] font-semibold tracking-tight sm:text-3xl">
              {t('home.actions.brandName')}
            </p>
          </motion.div>

          <motion.h1
            className="text-foreground max-w-[13ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]"
            variants={{
              hidden: { opacity: 0, y: 22 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: motionEase },
              },
            }}
          >
            {t('home.hero.titleBefore')}{' '}
            <span className="text-brand">{t('home.hero.titleAccent')}</span>
          </motion.h1>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { duration: 0.2, delay: reduce ? 0 : 0.15 },
              },
            }}
          >
            <TextGenerateEffect
              words={t('home.hero.subtext')}
              className="max-w-[34ch] text-base leading-7 sm:text-lg sm:leading-8"
              duration={0.35}
            />
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-3 pt-1"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: motionEase },
              },
            }}
          >
            {reduce ? (
              <Button
                asChild
                size="lg"
                className="rounded-full px-6 active:scale-[0.98]"
              >
                <Link to="/signup">
                  {t('home.actions.startFree')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <MovingBorderButton
                as={Link}
                to="/signup"
                borderRadius="9999px"
                duration={2800}
                containerClassName="h-11 w-auto min-w-[9.5rem]"
                className="bg-brand px-6 hover:bg-[color-mix(in_srgb,var(--brand)_88%,black)]"
              >
                {t('home.actions.startFree')}
                <ArrowRight className="size-4" />
              </MovingBorderButton>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/75 rounded-full px-6 backdrop-blur-sm active:scale-[0.98]"
            >
              <Link to={MARKETING_DEMO_SHOP_PATH} target="_blank" rel="noopener noreferrer">
                {t('home.actions.viewDemo')}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <div className="pointer-events-auto min-w-0 max-lg:order-1 lg:order-none">
          <HomeHeroVisual />
        </div>
      </div>
    </section>
  );
}
