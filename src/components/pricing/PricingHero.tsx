import { IconCalendarOff, IconTag } from '@tabler/icons-react';
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
import { brandColors } from '@/constants/colors';
import { fadeUp, motionEase } from '@/lib/motion';
import {
  formatSubscriptionUsd,
  SUBSCRIPTION_USD_MONTHLY as USD_MONTHLY,
  SUBSCRIPTION_USD_YEARLY as USD_YEARLY,
} from '@/lib/subscriptionPricing';

export function PricingHero() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  const billingPreview = [
    {
      key: 'monthly' as const,
      price: t('pricing.hero.monthly.price', { price: formatSubscriptionUsd(USD_MONTHLY) }),
    },
    {
      key: 'yearly' as const,
      price: t('pricing.hero.yearly.price', { price: formatSubscriptionUsd(USD_YEARLY) }),
    },
  ];

  return (
    <section className={heroBleedClassName}>
      <HeroAtmosphere sparkleId="pricing-hero-sparkles" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Spotlight
          className="-top-40 end-0 md:-top-24 md:end-40"
          fill={brandColors.brand}
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-12 md:gap-10 md:py-28 lg:gap-14">
        <motion.div
          className="flex max-w-xl flex-col gap-6 md:col-span-6"
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
            <p className="text-foreground text-2xl font-semibold tracking-tight">Stallio</p>
          </motion.div>

          <motion.span
            className="border-border/70 bg-background/80 text-muted-foreground w-fit rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase"
            variants={fadeUp(0.6, 14)}
          >
            {t('pricing.hero.eyebrow')}
          </motion.span>

          <motion.h1
            className="text-foreground max-w-[14ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]"
            variants={fadeUp(0.75, 22)}
          >
            {t('pricing.hero.titleBefore')}{' '}
            <span className="text-brand">{t('pricing.hero.titleAccent')}</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8"
            variants={fadeUp(0.7, 18)}
          >
            {t('pricing.hero.body')}
          </motion.p>

          <motion.ul className="space-y-2.5" variants={fadeUp()}>
            <li className="text-foreground/90 flex items-center gap-2.5 text-sm leading-6 sm:text-base">
              <span className="bg-brand/10 text-brand inline-flex size-8 shrink-0 items-center justify-center rounded-full">
                <IconTag className="size-4" stroke={1.5} aria-hidden />
              </span>
              {t('pricing.hero.fromPrice', { price: formatSubscriptionUsd(USD_MONTHLY) })}
            </li>
            <li className="text-foreground/90 flex items-center gap-2.5 text-sm leading-6 sm:text-base">
              <span className="bg-brand/10 text-brand inline-flex size-8 shrink-0 items-center justify-center rounded-full">
                <IconCalendarOff className="size-4" stroke={1.5} aria-hidden />
              </span>
              {t('pricing.hero.noCard')}
            </li>
          </motion.ul>

          <motion.div className="flex flex-wrap items-center gap-3 pt-1" variants={fadeUp()}>
            <MovingBorderButton
              as={Link}
              to="/signup"
              borderRadius="9999px"
              containerClassName="h-11"
              className="px-5"
            >
              {t('pricing.hero.startFree')}
            </MovingBorderButton>
            <Button asChild size="lg" variant="ghost" className="rounded-full px-5 active:scale-[0.98]">
              <Link to="/features">{t('pricing.hero.whatYouGet')}</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="md:col-span-6"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.85,
            delay: reduce ? 0 : 0.12,
            ease: motionEase,
          }}
        >
          <BezelShell
            className="rounded-[2rem] md:rotate-[1.5deg]"
            innerClassName="rounded-[calc(2rem-0.375rem)] p-5 sm:p-7 md:rotate-[-1.5deg]"
          >
            <p className="text-brand text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('pricing.hero.chooseBilling')}
            </p>
            <p className="text-muted-foreground mt-2 max-w-[36ch] text-sm leading-6">
              {t('pricing.hero.previewNote')}
            </p>

            <div className="mt-6 space-y-2.5">
              {billingPreview.map((option) => (
                <div
                  key={option.key}
                  className="ring-border/60 flex items-center justify-between rounded-[1.35rem] px-5 py-4 ring-1"
                >
                  <span>
                    <span className="text-foreground block text-sm font-semibold tracking-tight">
                      {t(`pricing.hero.${option.key}.label`)}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                      {t(`pricing.hero.${option.key}.note`)}
                    </span>
                  </span>
                  <span className="text-foreground text-lg font-semibold tracking-tight tabular-nums">
                    {option.price}
                  </span>
                </div>
              ))}
            </div>
          </BezelShell>
        </motion.div>
      </div>
    </section>
  );
}
