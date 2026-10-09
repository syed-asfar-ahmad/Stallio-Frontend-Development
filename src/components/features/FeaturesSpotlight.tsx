import { IconCheck } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { motionEase } from '@/lib/motion';

export function FeaturesSpotlight() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const points = t('features.spotlight.points', {
    returnObjects: true,
  }) as string[];

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32 md:pb-36">
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-12 md:gap-10">
        <motion.div
          className="md:col-span-5"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: motionEase }}
        >
          <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase dark:bg-white/[0.06] dark:text-zinc-300">
            {t('features.spotlight.eyebrow')}
          </span>
          <h2 className="text-foreground mt-5 text-section-heading">
            {t('features.spotlight.title')}
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8">
            {t('features.spotlight.body')}
          </p>
          <ul className="mt-7 space-y-3">
            {points.map((item) => (
              <li
                key={item}
                className="text-foreground/90 flex items-start gap-3 text-sm leading-6 sm:text-base"
              >
                <span className="bg-brand/10 text-brand mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full">
                  <IconCheck className="size-3.5" stroke={1.5} aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="relative md:col-span-7"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.85,
            delay: reduce ? 0 : 0.08,
            ease: motionEase,
          }}
        >
          <BezelShell
            className="rounded-[2rem] md:rotate-1"
            innerClassName="overflow-hidden rounded-[calc(2rem-0.375rem)]"
          >
            <div className="relative aspect-[5/4] w-full">
              <img
                src="/assets/images/audience-clothing.jpg"
                alt={t('features.spotlight.altWorkspace')}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </BezelShell>

          <BezelShell
            className="absolute -bottom-6 -left-2 w-[42%] max-w-[14rem] rounded-[1.5rem] sm:-left-4 md:-bottom-8 md:-rotate-2"
            innerClassName="overflow-hidden rounded-[calc(1.5rem-0.375rem)]"
          >
            <div className="relative aspect-[9/16] w-full">
              <img
                src="/assets/images/demo-catalog.png"
                alt={t('features.spotlight.altCatalog')}
                className="absolute inset-0 size-full object-cover object-top"
              />
            </div>
          </BezelShell>
        </motion.div>
      </div>
    </section>
  );
}
