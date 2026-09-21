import { IconArrowUpRight } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { BackgroundBeams } from '@/components/ui/background-beams';
import { BezelShell } from '@/components/ui/bezel-shell';
import { Button } from '@/components/ui/button';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { motionEase } from '@/lib/motion';

export function HomeCta() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="relative mx-auto w-full max-w-6xl">
        <BezelShell
          className="overflow-hidden rounded-[2rem]"
          innerClassName="relative overflow-hidden rounded-[calc(2rem-0.375rem)] px-6 py-20 sm:px-10 md:py-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--brand)_14%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--brand)_22%,transparent),transparent_55%)]"
          />
          {!reduce ? (
            <BackgroundBeams className="opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]" />
          ) : null}

          <motion.div
            className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('home.cta.eyebrow')}
            </span>

            <h2 className="text-foreground mt-5 text-section-heading">
              {t('home.cta.title')}
              <span className="text-brand" aria-hidden>
                .
              </span>
            </h2>

            <p className="text-muted-foreground mt-5 max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('home.cta.body')}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {reduce ? (
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
              ) : (
                <MovingBorderButton
                  as={Link}
                  to="/signup"
                  borderRadius="9999px"
                  duration={2800}
                  containerClassName="group h-12 w-auto min-w-[10.5rem] active:scale-[0.98]"
                  className="bg-brand gap-2 px-5 hover:bg-[color-mix(in_srgb,var(--brand)_88%,black)]"
                >
                  {t('home.actions.startFree')}
                  <span className="bg-background/15 inline-flex size-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                    <IconArrowUpRight className="size-4" stroke={1.5} />
                  </span>
                </MovingBorderButton>
              )}

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background/80 rounded-full px-6 active:scale-[0.98]"
              >
                <Link to="/login">{t('home.actions.logIn')}</Link>
              </Button>
            </div>
          </motion.div>
        </BezelShell>
      </div>
    </section>
  );
}
