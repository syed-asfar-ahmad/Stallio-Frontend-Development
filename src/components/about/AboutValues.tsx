import {
  IconCompass,
  IconHeart,
  IconRocket,
  IconShield,
  IconUsers,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { Timeline, type TimelineEntry } from '@/components/ui/timeline';
import { motionEase } from '@/lib/motion';
import { cn } from '@/lib/utils';

const valueIcons = [IconUsers, IconShield, IconCompass] as const;
const valueNumbers = ['01', '02', '03'] as const;

type ValueItem = {
  title: string;
  detail: string;
};

export function AboutValues() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('about.values.items', { returnObjects: true }) as ValueItem[];

  const data: TimelineEntry[] = items.map((item, index) => ({
    title: valueNumbers[index]!,
    content: (
      <ValueCard
        title={item.title}
        detail={item.detail}
        icon={valueIcons[index] ?? IconUsers}
      />
    ),
  }));

  return (
    <section className="border-border relative overflow-hidden border-y bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,color-mix(in_srgb,var(--brand)_16%,transparent),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <motion.div
          className="mb-6 max-w-2xl space-y-5 md:mb-4"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.8, ease: motionEase }}
        >
          <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
            {t('about.values.eyebrow')}
          </span>
          <h2 className="text-foreground text-section-heading">
            {t('about.values.title')}
          </h2>
        </motion.div>

        <Timeline data={data} />

        <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-[1.35fr_1fr] md:gap-6">
          <SpotlightNote
            tone="brand"
            icon={IconRocket}
            title={t('about.values.momentumTitle')}
            body={t('about.values.momentumBody')}
            delay={0.08}
          />
          <SpotlightNote
            tone="muted"
            icon={IconHeart}
            title={t('about.values.visionTitle')}
            body={t('about.values.visionBody')}
            delay={0.14}
          />
        </div>
      </div>
    </section>
  );
}

function ValueCard({
  title,
  detail,
  icon: Icon,
}: {
  title: string;
  detail: string;
  icon: typeof IconUsers;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: motionEase }}
    >
      <BezelShell innerClassName="p-6 sm:p-8">
        <span className="bg-brand mb-5 inline-flex size-11 items-center justify-center rounded-full text-white shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--brand)_80%,transparent)]">
          <Icon className="size-5" stroke={1.5} aria-hidden />
        </span>
        <h3 className="text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground mt-3 max-w-[40ch] text-sm leading-7 sm:text-base">
          {detail}
        </p>
      </BezelShell>
    </motion.div>
  );
}

function SpotlightNote({
  tone,
  icon: Icon,
  title,
  body,
  delay,
}: {
  tone: 'brand' | 'muted';
  icon: typeof IconRocket;
  title: string;
  body: string;
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
          'h-full p-6 sm:p-8',
          isBrand ? 'bg-accent dark:bg-brand/15' : 'bg-background/80',
        )}
      >
        <span
          className={cn(
            'mb-5 inline-flex size-11 items-center justify-center rounded-full',
            isBrand
              ? 'bg-brand text-white'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-5" stroke={1.5} aria-hidden />
        </span>
        <h3 className="text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground mt-3 text-sm leading-7 sm:text-base">
          {body}
        </p>
      </BezelShell>
    </motion.article>
  );
}
