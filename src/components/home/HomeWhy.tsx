import {
  IconCreditCardOff,
  IconDeviceMobile,
  IconDiscount2,
  IconLink,
  IconPackages,
  IconWorldOff,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import {
  HoverEffect,
  type HoverEffectItem,
} from '@/components/ui/card-hover-effect';
import { motionEase } from '@/lib/motion';

const iconProps = { stroke: 1.5, 'aria-hidden': true } as const;

const reasonIcons = [
  <IconWorldOff key="world" {...iconProps} />,
  <IconCreditCardOff key="card" {...iconProps} />,
  <IconDeviceMobile key="mobile" {...iconProps} />,
  <IconPackages key="packages" {...iconProps} />,
  <IconDiscount2 key="discount" {...iconProps} />,
  <IconLink key="link" {...iconProps} />,
] as const;

type WhyItem = {
  title: string;
  description: string;
};

export function HomeWhy() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('home.why.items', { returnObjects: true }) as WhyItem[];

  const reasons: HoverEffectItem[] = items.map((item, index) => ({
    title: item.title,
    description: item.description,
    icon: reasonIcons[index],
  }));

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,color-mix(in_srgb,var(--brand)_11%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_0%_100%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <motion.div
            className="space-y-5 lg:sticky lg:top-28 lg:col-span-4 lg:self-start"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('home.why.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">
              {t('home.why.title')}
            </h2>
            <p className="text-muted-foreground max-w-[34ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('home.why.body')}
            </p>
          </motion.div>

          <motion.div
            className="lg:col-span-8"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.85,
              delay: reduce ? 0 : 0.06,
              ease: motionEase,
            }}
          >
            <BezelShell innerClassName="overflow-hidden p-1 md:p-2">
              <HoverEffect items={reasons} />
            </BezelShell>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
