import {
  IconArrowUpRight,
  IconChartBar,
  IconDiscount2,
  IconFileInvoice,
  IconLanguage,
  IconGift,
  IconMessages,
  IconPackage,
  IconReceipt,
  IconShoppingCart,
  IconTruckDelivery,
  IconUserCircle,
  IconWorldWww,
} from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { BezelShell } from '@/components/ui/bezel-shell';
import { Button } from '@/components/ui/button';
import {
  FeatureHoverGrid,
  type FeatureHoverItem,
} from '@/components/ui/feature-hover-grid';
import { motionEase } from '@/lib/motion';

const iconProps = { stroke: 1.5, 'aria-hidden': true } as const;

const toolkitIcons = [
  <IconWorldWww key="www" {...iconProps} />,
  <IconPackage key="package" {...iconProps} />,
  <IconShoppingCart key="cart" {...iconProps} />,
  <IconDiscount2 key="discount" {...iconProps} />,
  <IconUserCircle key="user" {...iconProps} />,
  <IconTruckDelivery key="truck" {...iconProps} />,
  <IconFileInvoice key="invoice" {...iconProps} />,
  <IconReceipt key="receipt" {...iconProps} />,
  <IconLanguage key="lang" {...iconProps} />,
  <IconChartBar key="chart" {...iconProps} />,
  <IconMessages key="messages" {...iconProps} />,
  <IconGift key="gift" {...iconProps} />,
] as const;

type ToolkitItem = {
  title: string;
  description: string;
};

export function HomeToolkit() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('home.toolkit.items', { returnObjects: true }) as ToolkitItem[];

  const toolkit: FeatureHoverItem[] = items.map((item, index) => ({
    title: item.title,
    description: item.description,
    icon: toolkitIcons[index],
  }));

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_52%)] dark:bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_52%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-12 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between">
          <motion.div
            className="max-w-xl space-y-5"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('home.toolkit.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">
              {t('home.toolkit.title')}
            </h2>
            <p className="text-muted-foreground max-w-[40ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('home.toolkit.body')}
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.7,
              delay: reduce ? 0 : 0.08,
              ease: motionEase,
            }}
          >
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group border-brand/40 text-brand hover:bg-brand/5 hover:text-brand rounded-full px-5 active:scale-[0.98]"
            >
              <Link to="/signup" className="inline-flex items-center gap-2">
                {t('home.toolkit.cta')}
                <span className="bg-brand/10 inline-flex size-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <IconArrowUpRight className="size-4" stroke={1.5} />
                </span>
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: motionEase }}
        >
          <BezelShell innerClassName="overflow-hidden p-0 md:p-1">
            <FeatureHoverGrid items={toolkit} />
          </BezelShell>
        </motion.div>
      </div>
    </section>
  );
}
