import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { IconArrowUpRight, IconHome, IconMail } from '@tabler/icons-react';

import PublicLayout from '@/components/PublicLayout';
import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { Button } from '@/components/ui/button';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { fadeUp } from '@/lib/motion';

export default function NotFound() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  useEffect(() => {
    document.title = t('notFound.metaTitle');
  }, [t]);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className={heroBleedClassName}>
          <HeroAtmosphere sparkleId="not-found-hero-sparkles" />

          <div className="relative z-10 mx-auto flex min-h-[70dvh] w-full max-w-6xl flex-col items-start justify-center px-4 py-24 sm:px-6 md:min-h-[78dvh] md:py-28">
            <motion.div
              className="flex max-w-xl flex-col gap-5"
              initial={reduce ? false : 'hidden'}
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
              }}
            >
              <motion.span
                className="border-border/70 bg-background/80 text-muted-foreground inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase"
                variants={fadeUp(0.6, 14)}
              >
                {t('notFound.eyebrow')}
              </motion.span>

              <motion.p
                className="text-brand text-[clamp(4.5rem,14vw,8rem)] leading-[0.9] font-semibold tracking-tight tabular-nums"
                variants={fadeUp(0.75, 22)}
                aria-hidden
              >
                404
              </motion.p>

              <motion.h1
                className="text-foreground max-w-[14ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.1rem] lg:leading-[1.06]"
                variants={fadeUp(0.7, 18)}
              >
                {t('notFound.title')}
              </motion.h1>

              <motion.p
                className="text-muted-foreground max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8"
                variants={fadeUp(0.65, 16)}
              >
                {t('notFound.body')}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-3 pt-2"
                variants={fadeUp()}
              >
                <MovingBorderButton
                  as={Link}
                  to="/"
                  borderRadius="9999px"
                  containerClassName="h-11"
                  className="px-5"
                >
                  <IconHome className="size-4" stroke={1.5} aria-hidden />
                  {t('notFound.backHome')}
                </MovingBorderButton>

                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-full px-5 active:scale-[0.98]"
                >
                  <Link to="/pricing" className="inline-flex items-center gap-2">
                    {t('notFound.viewPricing')}
                    <IconArrowUpRight className="size-4" stroke={1.5} aria-hidden />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-full px-5 active:scale-[0.98]"
                >
                  <Link to="/contact" className="inline-flex items-center gap-2">
                    <IconMail className="size-4" stroke={1.5} aria-hidden />
                    {t('notFound.contactUs')}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
