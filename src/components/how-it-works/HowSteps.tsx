import { IconCheck } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { motionEase } from '@/lib/motion';

const stepMeta = [
  {
    src: '/assets/images/audience-baker.jpg',
    reverse: false,
  },
  {
    src: '/assets/images/audience-craft.jpg',
    reverse: true,
  },
  {
    src: '/assets/images/audience-clothing.jpg',
    reverse: false,
  },
] as const;

type StepDetail = {
  n: string;
  title: string;
  body: string;
  checks: string[];
  alt: string;
};

export function HowSteps() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const details = t('howItWorks.steps.details', {
    returnObjects: true,
  }) as StepDetail[];

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32 md:pb-36">
      <div className="relative mx-auto w-full max-w-6xl space-y-20 md:space-y-28">
        <motion.div
          className="max-w-2xl space-y-4"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: motionEase }}
        >
          <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
            {t('howItWorks.steps.eyebrow')}
          </span>
          <h2 className="text-foreground text-section-heading">
            {t('howItWorks.steps.title')}
          </h2>
        </motion.div>

        {details.map((step, index) => {
          const meta = stepMeta[index];
          if (!meta) return null;
          const reverse = meta.reverse;

          return (
            <motion.article
              key={step.n}
              className="grid items-center gap-8 md:grid-cols-12 md:gap-10"
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.8,
                delay: reduce ? 0 : 0.05,
                ease: motionEase,
              }}
            >
              <div
                className={`md:col-span-5 ${reverse ? 'md:order-2 md:col-start-8' : ''}`}
              >
                <p className="text-brand font-mono text-sm tracking-[0.2em] tabular-nums">
                  {step.n}
                </p>
                <h3 className="text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-4 max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8">
                  {step.body}
                </p>
                <ul className="mt-6 space-y-3">
                  {step.checks.map((item) => (
                    <li
                      key={item}
                      className="text-foreground/90 flex items-start gap-3 text-sm leading-6 sm:text-base"
                    >
                      <span className="bg-brand/10 text-brand mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full">
                        <IconCheck
                          className="size-3.5"
                          stroke={1.5}
                          aria-hidden
                        />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`md:col-span-6 ${reverse ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}
              >
                <BezelShell
                  className={`rounded-[2rem] ${reduce ? '' : index % 2 === 0 ? 'md:-rotate-1' : 'md:rotate-1'}`}
                  innerClassName="overflow-hidden rounded-[calc(2rem-0.375rem)]"
                >
                  <div className="relative aspect-[5/4] w-full">
                    <img
                      src={meta.src}
                      alt={step.alt}
                      className="absolute inset-0 size-full object-cover"
                    />
                  </div>
                </BezelShell>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
