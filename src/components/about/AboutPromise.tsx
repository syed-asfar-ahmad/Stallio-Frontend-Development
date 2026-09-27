import {
  IconBolt,
  IconBuildingStore,
  IconTarget,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { motionEase } from '@/lib/motion';
import { cn } from '@/lib/utils';

const promiseCards = [
  { key: 'simple' as const, index: '01', icon: IconTarget },
  { key: 'fast' as const, index: '02', icon: IconBolt },
  { key: 'credible' as const, index: '03', icon: IconBuildingStore },
];

export function AboutPromise() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section className="border-border relative overflow-hidden border-y bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,color-mix(in_srgb,var(--brand)_12%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_80%_20%,color-mix(in_srgb,var(--brand)_20%,transparent),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <motion.div
            className="max-w-md space-y-5 lg:sticky lg:top-28 lg:col-span-4 lg:self-start"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('about.promise.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">
              {t('about.promise.title')}
            </h2>
            <p className="text-muted-foreground max-w-[34ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('about.promise.body')}
            </p>
          </motion.div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 md:grid-rows-2 lg:col-span-8">
            {promiseCards.map((card, i) => {
              const isLead = card.key === 'simple';
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.key}
                  className={cn(
                    'group relative min-h-[11.5rem]',
                    isLead && 'md:row-span-2 md:min-h-full',
                  )}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.7,
                    delay: reduce ? 0 : 0.08 + i * 0.06,
                    ease: motionEase,
                  }}
                >
                  <BezelShell
                    className={cn(
                      'h-full rounded-[1.85rem] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      isLead
                        ? 'bg-brand/10 ring-brand/20 shadow-[0_32px_64px_-40px_color-mix(in_srgb,var(--brand)_55%,transparent)]'
                        : 'hover:-translate-y-0.5 hover:ring-brand/25 hover:shadow-[0_24px_48px_-32px_color-mix(in_srgb,var(--brand)_40%,transparent)]',
                    )}
                    innerClassName={cn(
                      'relative h-full overflow-hidden rounded-[calc(1.85rem-0.375rem)] p-6 sm:p-8',
                      isLead
                        ? 'bg-accent dark:bg-brand/15 flex flex-col justify-between'
                        : 'bg-background/90 dark:bg-card/90',
                      'before:pointer-events-none before:absolute before:inset-0 before:bg-brand/[0.08] before:opacity-0 before:transition-opacity before:duration-300 before:ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:before:opacity-100 dark:before:bg-brand/[0.14]',
                    )}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <span
                        className={cn(
                          'inline-flex size-11 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105',
                          isLead
                            ? 'bg-brand text-white shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--brand)_80%,transparent)]'
                            : 'bg-muted text-brand',
                        )}
                      >
                        <Icon className="size-5" stroke={1.5} aria-hidden />
                      </span>
                      <span className="text-muted-foreground/55 text-sm font-semibold tracking-[0.18em] tabular-nums">
                        {card.index}
                      </span>
                    </div>

                    <div
                      className={cn(
                        'relative z-10',
                        isLead ? 'mt-16 md:mt-auto md:pt-20' : 'mt-8',
                      )}
                    >
                      <p
                        className={cn(
                          'text-foreground font-semibold tracking-tight',
                          isLead
                            ? 'text-4xl sm:text-5xl lg:text-[3.25rem]'
                            : 'text-2xl sm:text-3xl',
                        )}
                      >
                        {t(`about.promise.${card.key}`)}
                      </p>
                      <p
                        className={cn(
                          'text-muted-foreground mt-2 leading-6',
                          isLead
                            ? 'max-w-[22ch] text-base sm:text-lg sm:leading-8'
                            : 'max-w-[24ch] text-sm',
                        )}
                      >
                        {t(`about.promise.${card.key}Sub`)}
                      </p>
                    </div>
                  </BezelShell>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
