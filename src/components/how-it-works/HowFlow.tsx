import {
  IconBuildingStore,
  IconLink,
  IconPhoto,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { motionEase } from '@/lib/motion';
import { cn } from '@/lib/utils';

const stepIcons = [IconBuildingStore, IconPhoto, IconLink] as const;

type FlowStep = {
  n: string;
  title: string;
  body: string;
  note: string;
};

export function HowFlow() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const steps = t('howItWorks.flow.steps', {
    returnObjects: true,
  }) as FlowStep[];

  return (
    <section className="border-border relative overflow-hidden border-y bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_48%)] dark:bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_48%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 md:py-32 md:pb-36">
        <div className="grid gap-14 md:grid-cols-12 md:gap-12 lg:gap-16">
          <motion.div
            className="md:col-span-5 md:sticky md:top-28 md:self-start"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('howItWorks.flow.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading mt-5">
              {t('howItWorks.flow.title')}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-[32ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('howItWorks.flow.body')}
            </p>

            <div className="mt-10 hidden md:block">
              <BezelShell
                className="rounded-[1.75rem]"
                innerClassName="overflow-hidden rounded-[calc(1.75rem-0.375rem)] p-5"
              >
                <p className="text-muted-foreground text-[10px] font-medium tracking-[0.18em] uppercase">
                  {t('howItWorks.flow.pathLabel')}
                </p>
                <ol className="mt-4 space-y-3">
                  {steps.map((step) => (
                    <li
                      key={step.n}
                      className="text-foreground flex items-baseline gap-3 text-sm"
                    >
                      <span className="text-brand font-mono text-xs tracking-[0.14em] tabular-nums">
                        {step.n}
                      </span>
                      <span className="font-medium tracking-tight">
                        {step.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </BezelShell>
            </div>
          </motion.div>

          <div className="relative md:col-span-7">
            <div
              aria-hidden
              className="bg-border/70 absolute top-6 bottom-6 left-[1.35rem] hidden w-px md:block"
            />

            <ol className="flex flex-col gap-6 md:gap-8">
              {steps.map((step, index) => {
                const Icon = stepIcons[index] ?? IconLink;
                const rotate =
                  index === 0
                    ? 'md:-rotate-[1.25deg]'
                    : index === 1
                      ? 'md:rotate-[1.5deg]'
                      : 'md:-rotate-[0.75deg]';

                return (
                  <motion.li
                    key={step.n}
                    className="relative"
                    initial={reduce ? false : { opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.8,
                      delay: reduce ? 0 : index * 0.1,
                      ease: motionEase,
                    }}
                  >
                    <div
                      aria-hidden
                      className="bg-brand absolute top-8 left-[1.05rem] z-10 hidden size-2.5 rounded-full md:block"
                    />

                    <BezelShell
                      className={cn(
                        'rounded-[2rem] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
                        reduce ? '' : rotate,
                      )}
                      innerClassName="relative overflow-hidden rounded-[calc(2rem-0.375rem)] p-6 sm:p-8"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_70%)]"
                      />

                      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-mono text-xs tracking-[0.18em] tabular-nums">
                              {step.n}
                            </span>
                            <span className="text-brand text-[10px] font-medium tracking-[0.18em] uppercase">
                              {step.note}
                            </span>
                          </div>
                          <h3 className="text-foreground text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground max-w-[38ch] text-sm leading-6 sm:text-base sm:leading-7">
                            {step.body}
                          </p>
                        </div>

                        <span className="bg-brand inline-flex size-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--brand)_80%,transparent)]">
                          <Icon className="size-5" stroke={1.5} aria-hidden />
                        </span>
                      </div>
                    </BezelShell>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
