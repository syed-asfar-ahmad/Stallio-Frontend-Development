import {
  IconBuildingStore,
  IconLink,
  IconPhoto,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { Timeline, type TimelineEntry } from '@/components/ui/timeline';
import { motionEase } from '@/lib/motion';

const stepIcons = [IconBuildingStore, IconPhoto, IconLink] as const;
const stepNumbers = ['01', '02', '03'] as const;

type StepItem = {
  title: string;
  body: string;
  detail: string;
  note: string;
};

export function HomeSteps() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('home.steps.items', { returnObjects: true }) as StepItem[];

  const data: TimelineEntry[] = items.map((step, index) => ({
    title: stepNumbers[index],
    content: (
      <StepCard
        title={step.title}
        body={step.body}
        note={step.note}
        detail={step.detail}
        icon={stepIcons[index]}
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
            {t('home.steps.eyebrow')}
          </span>
          <h2 className="text-foreground text-section-heading">
            {t('home.steps.title')}
          </h2>
          <p className="text-muted-foreground max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8">
            {t('home.steps.body')}
          </p>
        </motion.div>

        <Timeline data={data} />
      </div>
    </section>
  );
}

function StepCard({
  title,
  body,
  note,
  detail,
  icon: Icon,
}: {
  title: string;
  body: string;
  note: string;
  detail: string;
  icon: typeof IconBuildingStore;
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
        <div className="mb-5 flex items-start justify-between gap-4">
          <span className="bg-brand inline-flex size-11 items-center justify-center rounded-full text-white shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--brand)_80%,transparent)]">
            <Icon className="size-5" stroke={1.5} />
          </span>
          <span className="text-brand text-[10px] font-medium tracking-[0.18em] uppercase">
            {note}
          </span>
        </div>

        <h3 className="text-foreground mb-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h3>
        <p className="text-foreground/85 mb-3 max-w-[34ch] text-sm leading-6 sm:text-base sm:leading-7">
          {body}
        </p>
        <p className="text-muted-foreground max-w-[38ch] text-sm leading-6">
          {detail}
        </p>
      </BezelShell>
    </motion.div>
  );
}
