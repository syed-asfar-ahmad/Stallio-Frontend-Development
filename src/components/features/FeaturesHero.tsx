import { IconArrowRight, IconCheck } from '@tabler/icons-react';
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
import { fadeUp, motionEase } from '@/lib/motion';

const stack = [
  {
    src: '/assets/images/demo-catalog.png',
    className: 'md:col-span-8',
    aspect: 'aspect-[16/10]',
    rotateClass: '',
  },
  {
    src: '/assets/images/demo-product.png',
    className: 'md:col-span-4 md:mt-10',
    aspect: 'aspect-[4/5]',
    rotateClass: 'md:rotate-[2deg]',
  },
  {
    src: '/assets/images/demo-checkout.png',
    className: 'md:col-span-5 md:-mt-6',
    aspect: 'aspect-[5/4]',
    rotateClass: 'md:-rotate-[1.5deg]',
  },
] as const;

export function FeaturesHero() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const bullets = t('features.hero.bullets', { returnObjects: true }) as string[];
  const alts = t('features.hero.alts', { returnObjects: true }) as {
    catalog: string;
    product: string;
    checkout: string;
  };
  const stackAlts = [alts.catalog, alts.product, alts.checkout];

  return (
    <section className={heroBleedClassName}>
      <HeroAtmosphere sparkleId="features-hero-sparkles" />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-12 md:gap-10 md:py-28 lg:gap-14">
        <motion.div
          className="order-2 md:order-1 md:col-span-7"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: motionEase }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-4">
            {stack.map((item, index) => (
              <motion.div
                key={item.src}
                className={item.className}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: reduce ? 0 : 0.12 + index * 0.1,
                  ease: motionEase,
                }}
              >
                <BezelShell
                  className={`rounded-[1.75rem] ${item.rotateClass}`}
                  innerClassName="overflow-hidden rounded-[calc(1.75rem-0.375rem)]"
                >
                  <div className={`relative w-full ${item.aspect}`}>
                    <img
                      src={item.src}
                      alt={stackAlts[index]}
                      className="absolute inset-0 size-full object-cover object-top"
                    />
                  </div>
                </BezelShell>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="order-1 flex max-w-xl flex-col gap-6 md:order-2 md:col-span-5 md:justify-center"
          initial={reduce ? false : 'hidden'}
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: reduce ? 0 : 0.1 },
            },
          }}
        >
          <motion.div className="flex items-center gap-3" variants={fadeUp(0.65, 16)}>
            <img
              src="/assets/images/logo.png"
              alt=""
              width={44}
              height={46}
              className="h-11 w-auto"
            />
            <p className="text-foreground text-2xl font-semibold tracking-tight">
              {t('home.actions.brandName')}
            </p>
          </motion.div>

          <motion.span
            className="border-border/70 bg-background/80 text-muted-foreground w-fit rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase dark:bg-white/[0.06] dark:text-zinc-300"
            variants={fadeUp(0.6, 14)}
          >
            {t('features.hero.eyebrow')}
          </motion.span>

          <motion.h1
            className="text-foreground max-w-[14ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]"
            variants={fadeUp(0.75, 22)}
          >
            {t('features.hero.titleBefore')}{' '}
            <span className="text-brand">{t('features.hero.titleAccent')}</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground max-w-[38ch] text-base leading-7 sm:text-lg sm:leading-8"
            variants={fadeUp(0.7, 18)}
          >
            {t('features.hero.body')}
          </motion.p>

          <motion.ul className="space-y-2.5" variants={fadeUp()}>
            {bullets.map((item) => (
              <li
                key={item}
                className="text-foreground/90 flex items-start gap-2.5 text-sm leading-6 sm:text-base"
              >
                <span className="bg-brand/10 text-brand mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                  <IconCheck className="size-3" stroke={1.5} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="flex flex-wrap items-center gap-3 pt-1"
            variants={fadeUp()}
          >
            {reduce ? (
              <Button
                asChild
                size="lg"
                className="rounded-full px-6 active:scale-[0.98]"
              >
                <Link to="/signup">
                  {t('home.actions.startFree')}
                  <IconArrowRight className="size-4" stroke={1.5} />
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
                <IconArrowRight className="size-4" stroke={1.5} />
              </MovingBorderButton>
            )}
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full px-5 active:scale-[0.98]"
            >
              <Link to="/how-it-works">{t('features.hero.secondary')}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
