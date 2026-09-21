import type { ReactNode } from 'react';
import { IconMessageCircle, IconShoppingBag } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { Compare } from '@/components/ui/compare';
import { motionEase } from '@/lib/motion';
import { cn } from '@/lib/utils';

export function HomeCompare() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const before = t('home.compare.before', { returnObjects: true }) as string[];
  const after = t('home.compare.after', { returnObjects: true }) as string[];

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,color-mix(in_srgb,var(--brand)_12%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_70%_20%,color-mix(in_srgb,var(--brand)_20%,transparent),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            className="max-w-xl space-y-5 lg:col-span-5"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase backdrop-blur-sm">
              {t('home.compare.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">
              {t('home.compare.title')}
            </h2>
            <p className="text-muted-foreground max-w-[36ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('home.compare.body')}
            </p>
          </motion.div>

          <motion.div
            className="lg:col-span-7"
            initial={reduce ? false : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.9,
              delay: reduce ? 0 : 0.08,
              ease: motionEase,
            }}
          >
            <BezelShell
              className="border-border/60 rounded-[2rem] border shadow-[0_40px_80px_-48px_color-mix(in_srgb,var(--brand)_45%,transparent)] ring-0 dark:bg-white/[0.04]"
              innerClassName="border-border/40 relative overflow-hidden rounded-[calc(2rem-0.375rem)] border shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 sm:p-5">
                <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white uppercase backdrop-blur-sm">
                  {t('home.compare.beforeLabel')}
                </span>
                <span className="bg-brand/90 rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white uppercase">
                  {t('home.compare.afterLabel')}
                </span>
              </div>

              <Compare
                firstImage="/assets/images/compare-before.png"
                secondImage="/assets/images/compare-after.png"
                firstImageClassName="object-cover object-center"
                secondImageClassname="object-cover object-center"
                className="h-[18rem] w-full sm:h-[22rem] md:h-[26rem] lg:h-[28rem]"
                slideMode="drag"
                autoplay={!reduce}
                autoplayDuration={5500}
                initialSliderPercentage={48}
              />
            </BezelShell>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6">
          <ComparePanel
            tone="muted"
            icon={<IconMessageCircle className="size-4" stroke={1.5} />}
            title={t('home.compare.beforeTitle')}
            items={before}
            delay={0.1}
          />
          <ComparePanel
            tone="brand"
            icon={<IconShoppingBag className="size-4" stroke={1.5} />}
            title={t('home.compare.afterTitle')}
            items={after}
            delay={0.16}
          />
        </div>
      </div>
    </section>
  );
}

function ComparePanel({
  tone,
  icon,
  title,
  items,
  delay,
}: {
  tone: 'muted' | 'brand';
  icon: ReactNode;
  title: string;
  items: readonly string[];
  delay: number;
}) {
  const reduce = useReducedMotion();
  const isBrand = tone === 'brand';

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.75,
        delay: reduce ? 0 : delay,
        ease: motionEase,
      }}
    >
      <BezelShell
        className={isBrand ? 'bg-brand/10 ring-brand/15' : undefined}
        innerClassName={cn(
          'p-6 sm:p-7',
          isBrand ? 'bg-accent dark:bg-brand/15' : 'bg-background/80',
        )}
      >
        <div className="mb-5 flex items-center gap-3">
          <span
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-full',
              isBrand
                ? 'bg-brand text-white'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {icon}
          </span>
          <h3
            className={cn(
              'text-lg font-semibold tracking-tight',
              isBrand ? 'text-brand' : 'text-foreground',
            )}
          >
            {title}
          </h3>
        </div>
        <ul className="space-y-3.5">
          {items.map((item) => (
            <li
              key={item}
              className={cn(
                'flex gap-3 text-sm leading-6',
                isBrand ? 'text-foreground/85' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'mt-2 size-1.5 shrink-0 rounded-full',
                  isBrand ? 'bg-brand' : 'bg-muted-foreground/45',
                )}
              />
              {item}
            </li>
          ))}
        </ul>
      </BezelShell>
    </motion.article>
  );
}
