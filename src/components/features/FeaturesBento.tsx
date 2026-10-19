import {
  IconDeviceMobile,
  IconLink,
  IconPackages,
  IconPhoto,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { motionEase } from '@/lib/motion';

const capabilityMeta = [
  { n: '01', icon: IconLink },
  { n: '02', icon: IconPhoto },
  { n: '03', icon: IconPackages },
  { n: '04', icon: IconDeviceMobile },
] as const;

type BentoItem = {
  title: string;
  body: string;
  badge?: string;
};

export function FeaturesBento() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('features.bento.items', { returnObjects: true }) as BentoItem[];

  return (
    <section className="border-border relative overflow-hidden border-y bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,color-mix(in_srgb,var(--brand)_8%,transparent),transparent_48%)] dark:bg-[radial-gradient(ellipse_at_10%_0%,color-mix(in_srgb,var(--brand)_16%,transparent),transparent_48%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 md:py-32 md:pb-36">
        <motion.div
          className="mb-12 max-w-xl space-y-4 md:mb-16"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.75, ease: motionEase }}
        >
          <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase dark:bg-white/[0.06] dark:text-zinc-300">
            {t('features.bento.eyebrow')}
          </span>
          <h2 className="text-foreground text-section-heading">
            {t('features.bento.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-5">
          {items.map((item, index) => {
            const meta = capabilityMeta[index]!;
            const Icon = meta.icon;
            return (
              <motion.div
                key={item.title}
                className="col-span-1 md:col-span-6"
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.75,
                  delay: reduce ? 0 : index * 0.07,
                  ease: motionEase,
                }}
              >
                <BezelShell
                  className="group h-full rounded-[2rem] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5"
                  innerClassName="flex h-full flex-col gap-5 p-6 sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground font-mono text-xs tracking-[0.18em] tabular-nums">
                      {meta.n}
                    </span>
                    <span className="bg-brand/10 text-brand inline-flex size-10 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                      <Icon className="size-5" stroke={1.5} aria-hidden />
                    </span>
                  </div>

                  <div className="mt-auto space-y-3">
                    {item.badge ? (
                      <p className="text-brand text-[10px] font-medium tracking-[0.18em] uppercase">
                        {item.badge}
                      </p>
                    ) : null}
                    <h3 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground max-w-[36ch] text-sm leading-6 sm:text-base sm:leading-7">
                      {item.body}
                    </p>
                  </div>
                </BezelShell>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
