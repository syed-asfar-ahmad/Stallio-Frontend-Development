import { IconArrowUpRight } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  StickyScroll,
  type StickyScrollItem,
} from '@/components/ui/sticky-scroll-reveal';
import { MARKETING_DEMO_SHOP_PATH } from '@/lib/marketingDemoShop';
import { motionEase } from '@/lib/motion';

type DemoItem = {
  title: string;
  description: string;
  alt: string;
  altMobile?: string;
};

export function HomeDemo() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('home.demo.items', { returnObjects: true }) as DemoItem[];

  const stickyContent: StickyScrollItem[] = [
    {
      title: items[0].title,
      description: items[0].description,
      content: (
        <img
          src="/assets/images/demo-catalog.png"
          alt={items[0].alt}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ),
    },
    {
      title: items[1].title,
      description: items[1].description,
      content: (
        <img
          src="/assets/images/demo-product.png"
          alt={items[1].alt}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ),
    },
    {
      title: items[2].title,
      description: items[2].description,
      content: (
        <img
          src="/assets/images/demo-checkout.png"
          alt={items[2].alt}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ),
      mobileContent: (
        <img
          src="/assets/images/demo-checkout-mobile.png"
          alt={items[2].altMobile ?? items[2].alt}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ),
    },
  ];

  return (
    <section className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_80%_0%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_50%)]"
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
              {t('home.demo.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">
              {t('home.demo.title')}
            </h2>
            <p className="text-muted-foreground max-w-[38ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('home.demo.body')}
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3"
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
              className="group rounded-full px-5 active:scale-[0.98]"
            >
              <Link to="/signup" className="inline-flex items-center gap-2">
                {t('home.demo.openShop')}
                <span className="bg-background/15 inline-flex size-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <IconArrowUpRight className="size-4" stroke={1.5} />
                </span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-6 active:scale-[0.98]"
            >
              <Link to={MARKETING_DEMO_SHOP_PATH} target="_blank" rel="noopener noreferrer">
                {t('home.demo.browseDemo')}
              </Link>
            </Button>
          </motion.div>
        </div>

        <StickyScroll content={stickyContent} />

        <p className="text-muted-foreground mt-6 text-sm">
          {t('home.demo.liveExample')}{' '}
          <Link
            to={MARKETING_DEMO_SHOP_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
          >
            stallio.shop/sweet-cravings-studio
          </Link>
        </p>
      </div>
    </section>
  );
}
