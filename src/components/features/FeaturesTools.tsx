import {
  IconChartBar,
  IconCreditCardOff,
  IconDiscount2,
  IconFileInvoice,
  IconFolder,
  IconHeadset,
  IconMessages,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { FeatureHoverGrid } from '@/components/ui/feature-hover-grid';
import { motionEase } from '@/lib/motion';

const toolIcons = [
  IconDiscount2,
  IconFileInvoice,
  IconTruckDelivery,
  IconFolder,
  IconCreditCardOff,
  IconChartBar,
  IconMessages,
  IconHeadset,
] as const;

type ToolItem = {
  title: string;
  description: string;
};

export function FeaturesTools() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('features.tools.items', { returnObjects: true }) as ToolItem[];

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32 md:pb-36">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <motion.div
            className="space-y-4 lg:sticky lg:top-28 lg:col-span-4 lg:self-start"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase dark:bg-white/[0.06] dark:text-zinc-300">
              {t('features.tools.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">
              {t('features.tools.title')}
            </h2>
          </motion.div>

          <motion.div
            className="lg:col-span-8"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <FeatureHoverGrid
              items={items.map((item, index) => {
                const Icon = toolIcons[index]!;
                return {
                  title: item.title,
                  description: item.description,
                  icon: <Icon stroke={1.5} aria-hidden />,
                };
              })}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
