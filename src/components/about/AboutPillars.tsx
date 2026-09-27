import {
  IconBolt,
  IconDashboard,
  IconFileInvoice,
  IconLayoutGrid,
  IconLink,
  IconShoppingBag,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import {
  FeatureHoverGrid,
  type FeatureHoverItem,
} from '@/components/ui/feature-hover-grid';
import { motionEase } from '@/lib/motion';

const iconProps = { stroke: 1.5, 'aria-hidden': true } as const;

const offerIcons = [
  <IconBolt key="bolt" {...iconProps} />,
  <IconLayoutGrid key="grid" {...iconProps} />,
  <IconLink key="link" {...iconProps} />,
  <IconDashboard key="dash" {...iconProps} />,
  <IconShoppingBag key="shop" {...iconProps} />,
  <IconFileInvoice key="invoice" {...iconProps} />,
] as const;

type OfferItem = {
  title: string;
  detail: string;
};

export function AboutPillars() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const rows = t('about.pillars.offers', { returnObjects: true }) as OfferItem[];

  const items: FeatureHoverItem[] = rows.map((row, index) => ({
    title: row.title,
    description: row.detail,
    icon: offerIcons[index],
  }));

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_52%)] dark:bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_52%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-12 grid items-end gap-8 md:mb-14 lg:grid-cols-12 lg:gap-10">
          <motion.div
            className="max-w-xl space-y-5 lg:col-span-7"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('about.pillars.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">
              {t('about.pillars.title')}
            </h2>
            <p className="text-muted-foreground max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('about.pillars.body')}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: motionEase }}
        >
          <BezelShell innerClassName="overflow-hidden p-0 md:p-1">
            <FeatureHoverGrid items={items} />
          </BezelShell>
        </motion.div>
      </div>
    </section>
  );
}
