import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { motionEase } from '@/lib/motion';

export function HowChannels() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const channels = t('howItWorks.channels.items', {
    returnObjects: true,
  }) as string[];

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-28 md:pb-32">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.p
          className="text-foreground text-section-heading max-w-[18ch] sm:max-w-none"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.85, ease: motionEase }}
        >
          {t('howItWorks.channels.titleBefore')}
          <span className="text-muted-foreground"> · </span>
          {t('howItWorks.channels.titleMid')}
          <span className="text-muted-foreground"> · </span>
          <span className="text-brand">{t('howItWorks.channels.titleAfter')}</span>
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-3"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.7,
            delay: reduce ? 0 : 0.12,
            ease: motionEase,
          }}
        >
          {channels.map((channel, index) => (
            <span key={channel} className="contents">
              {index > 0 ? (
                <span className="text-border px-3 text-sm" aria-hidden>
                  /
                </span>
              ) : null}
              <span className="text-muted-foreground text-sm tracking-[0.18em] uppercase">
                {channel}
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
