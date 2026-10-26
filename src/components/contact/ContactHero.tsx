import { IconArrowDown, IconMail } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ContactLtrText from '@/components/ContactLtrText';
import { CONTACT_EMAIL } from '@/components/contact/constants';
import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { Button } from '@/components/ui/button';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { Spotlight } from '@/components/ui/spotlight';
import { brandColors } from '@/constants/colors';
import { fadeUp, motionEase } from '@/lib/motion';

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

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-12 md:gap-10 md:py-28 lg:gap-14">
        <motion.div
          className="flex max-w-xl flex-col gap-6 md:col-span-6"
          initial={reduce ? false : 'hidden'}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
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

          <motion.h1
            className="text-foreground max-w-[14ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]"
            variants={fadeUp(0.75, 22)}
          >
            {t('contact.hero.titleBefore')}{' '}
            <span className="text-brand">{t('contact.hero.titleAccent')}</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8"
            variants={fadeUp(0.7, 18)}
          >
            {t('contact.hero.body')}
          </motion.p>

          <motion.div className="flex flex-wrap items-center gap-3 pt-1" variants={fadeUp()}>
            <MovingBorderButton
              as="a"
              href="#write"
              borderRadius="9999px"
              containerClassName="h-11"
              className="px-5"
            >
              {t('contact.hero.writeUs')}
              <IconArrowDown className="size-4" stroke={1.5} aria-hidden />
            </MovingBorderButton>
            <Button asChild size="lg" variant="ghost" className="rounded-full px-5 active:scale-[0.98]">
              <Link to="/signup">{t('contact.success.openShop')}</Link>
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
          <div className="border-border/40 relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,color-mix(in_srgb,var(--brand)_22%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_18%_12%,color-mix(in_srgb,var(--brand)_28%,transparent),transparent_55%)]"
            />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-brand/10 text-brand dark:text-white inline-flex size-11 items-center justify-center rounded-2xl">
                  <IconMail className="size-5" stroke={1.5} aria-hidden />
                </span>
                <p className="text-muted-foreground text-[10px] font-medium tracking-[0.2em] uppercase">
                  {t('contact.hero.directLine')}
                </p>
              </div>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground hover:text-brand block text-2xl font-semibold tracking-tight no-underline transition-colors duration-300 sm:text-3xl md:text-[2.15rem] md:leading-tight"
              >
                <ContactLtrText>{CONTACT_EMAIL}</ContactLtrText>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
