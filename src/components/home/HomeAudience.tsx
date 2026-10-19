import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { motionEase } from '@/lib/motion';

type AudienceItem = {
  title: string;
  copy: string;
  alt: string;
};

export function HomeAudience() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const items = t('home.audience.items', { returnObjects: true }) as AudienceItem[];

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <motion.div
          className="mb-10 max-w-2xl space-y-4 md:mb-14"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: motionEase }}
        >
          <h2 className="text-foreground text-section-heading">
            {t('home.audience.title')}
          </h2>
          <p className="text-muted-foreground max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
            {t('home.audience.body')}
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-12 md:gap-5">
          <motion.article
            className="group relative min-h-[22rem] overflow-hidden rounded-3xl md:col-span-7 md:row-span-2 md:min-h-[28rem]"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: motionEase }}
          >
            <img
              src="/assets/images/audience-clothing.jpg"
              alt={items[0].alt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent dark:from-black/85 dark:via-black/35" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 sm:p-8">
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                {items[0].title}
              </h3>
              <p className="max-w-[28ch] text-sm leading-6 text-white/80 sm:text-base">
                {items[0].copy}
              </p>
            </div>
          </motion.article>

          <motion.article
            className="group relative min-h-[10.5rem] overflow-hidden rounded-3xl md:col-span-5 md:min-h-[13.5rem]"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: reduce ? 0 : 0.06, ease: motionEase }}
          >
            <img
              src="/assets/images/audience-clothing-labels.png"
              alt={items[1].alt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent dark:from-black/85 dark:via-black/35" />
            <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-6 sm:p-7">
              <h3 className="text-xl font-semibold tracking-tight text-white">
                {items[1].title}
              </h3>
              <p className="max-w-[26ch] text-sm leading-6 text-white/80">
                {items[1].copy}
              </p>
            </div>
          </motion.article>

          <motion.article
            className="group relative min-h-[10.5rem] overflow-hidden rounded-3xl md:col-span-5 md:min-h-[13.5rem]"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: reduce ? 0 : 0.12, ease: motionEase }}
          >
            <img
              src="/assets/images/product-1.jpg"
              alt={items[2].alt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent dark:from-black/85 dark:via-black/40" />
            <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-6 sm:p-7">
              <h3 className="text-xl font-semibold tracking-tight text-white">
                {items[2].title}
              </h3>
              <p className="max-w-[26ch] text-sm leading-6 text-white/80">
                {items[2].copy}
              </p>
            </div>
          </motion.article>

          <motion.article
            className="group relative min-h-[16rem] overflow-hidden rounded-3xl sm:min-h-[18rem] md:col-span-6"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.08, ease: motionEase }}
          >
            <img
              src="/assets/images/audience-baker.jpg"
              alt={items[3].alt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent dark:from-black/80 dark:via-black/30" />
            <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5 sm:p-6">
              <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {items[3].title}
              </h3>
              <p className="max-w-[32ch] text-sm leading-6 text-white/80 sm:text-base">
                {items[3].copy}
              </p>
            </div>
          </motion.article>

          <motion.article
            className="group relative min-h-[16rem] overflow-hidden rounded-3xl sm:min-h-[18rem] md:col-span-6"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.14, ease: motionEase }}
          >
            <img
              src="/assets/images/audience-craft.jpg"
              alt={items[4].alt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-black/80 dark:via-black/30" />
            <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5 sm:p-6">
              <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                {items[4].title}
              </h3>
              <p className="max-w-[28ch] text-sm leading-6 text-white/80">
                {items[4].copy}
              </p>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
