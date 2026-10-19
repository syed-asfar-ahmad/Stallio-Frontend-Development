import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { BezelShell } from '@/components/ui/bezel-shell';
import { motionEase } from '@/lib/motion';
import { cn } from '@/lib/utils';

type FaqItem = {
  q: string;
  a: string;
};

export function PricingFaq() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const faqs = t('pricing.faq.items', { returnObjects: true }) as FaqItem[];

  return (
    <section className="border-border relative overflow-hidden border-y bg-surface dark:bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_100%,color-mix(in_srgb,var(--brand)_9%,transparent),transparent_52%)] dark:bg-[radial-gradient(ellipse_at_8%_100%,color-mix(in_srgb,var(--brand)_16%,transparent),transparent_52%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 md:py-32 md:pb-36">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-12">
          <motion.div
            className="space-y-4 lg:sticky lg:top-28 lg:col-span-4 lg:self-start"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('pricing.faq.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">{t('pricing.faq.title')}</h2>
            <p className="text-muted-foreground max-w-[32ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('pricing.faq.body')}
            </p>
          </motion.div>

          <motion.div
            className="lg:col-span-8"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: motionEase }}
          >
            <BezelShell
              className="rounded-[2rem]"
              innerClassName="divide-border/70 overflow-hidden rounded-[calc(2rem-0.375rem)] divide-y"
            >
              {faqs.map((item, index) => {
                const isOpen = open === index;
                const panelId = `pricing-faq-${index}`;
                return (
                  <div key={item.q}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpen(isOpen ? null : index)}
                        className="hover:bg-muted/40 flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-start transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-brand/30 focus-visible:ring-2 focus-visible:outline-none sm:px-7"
                      >
                        <span className="text-foreground text-sm font-semibold tracking-tight sm:text-base">
                          {item.q}
                        </span>
                        <span
                          className={cn(
                            'bg-foreground/5 text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-white/10',
                            isOpen && 'rotate-180',
                          )}
                        >
                          <IconChevronDown className="size-4" stroke={1.5} />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      className={cn(
                        'grid',
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                        !reduce &&
                          'transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="text-muted-foreground px-5 pb-6 text-sm leading-6 sm:px-7 sm:text-base sm:leading-7">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </BezelShell>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
