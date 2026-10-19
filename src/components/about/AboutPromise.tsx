import {
  IconBolt,
  IconBuildingStore,
  IconCheck,
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
  const simplePoints = t('about.promise.simplePoints', {
    returnObjects: true,
  }) as string[];

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

          <div className="lg:col-span-8">
            <BezelShell
              className="rounded-[1.85rem]"
              innerClassName="overflow-hidden rounded-[calc(1.85rem-0.375rem)] p-0"
            >
              <ul className="m-0 divide-y divide-border/60 p-0">
                {promiseCards.map((card, i) => {
                  const isLead = card.key === 'simple';
                  const Icon = card.icon;

                  return (
                    <motion.li
                      key={card.key}
                      className={cn(
                        'group relative list-none',
                        isLead
                          ? 'bg-brand/[0.05] dark:bg-brand/[0.1]'
                          : 'bg-background/90 dark:bg-card/90',
                      )}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.65,
                        delay: reduce ? 0 : 0.08 + i * 0.06,
                        ease: motionEase,
                      }}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-brand/[0.07] opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100 dark:bg-brand/[0.12]"
                      />

                      <div className="relative z-10 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 p-6 sm:gap-6 sm:p-8">
                        <span
                          className={cn(
                            'inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105',
                            isLead
                              ? 'bg-brand text-white shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--brand)_80%,transparent)]'
                              : 'bg-muted text-brand',
                          )}
                        >
                          <Icon className="size-5" stroke={1.5} aria-hidden />
                        </span>

                        <div className="min-w-0 space-y-3">
                          <div className="flex items-baseline gap-3">
                            <span className="text-muted-foreground/45 text-xs font-semibold tracking-[0.18em] tabular-nums">
                              {card.index}
                            </span>
                            <p
                              className={cn(
                                'text-foreground font-semibold tracking-tight',
                                isLead
                                  ? 'text-3xl sm:text-4xl'
                                  : 'text-xl sm:text-2xl',
                              )}
                            >
                              {t(`about.promise.${card.key}`)}
                            </p>
                          </div>

                          <p className="text-foreground/80 max-w-[48ch] text-sm leading-6 sm:text-base sm:leading-7">
                            {t(`about.promise.${card.key}Detail`)}
                          </p>

                          {isLead ? (
                            <ul className="mt-1 flex flex-wrap gap-2">
                              {simplePoints.map((point) => (
                                <li
                                  key={point}
                                  className="border-border/70 bg-background/80 text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium dark:bg-zinc-900/70"
                                >
                                  <IconCheck
                                    className="text-brand size-3.5 shrink-0"
                                    stroke={1.75}
                                    aria-hidden
                                  />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </BezelShell>
          </div>
        </div>
      </div>
    </section>
  );
}
