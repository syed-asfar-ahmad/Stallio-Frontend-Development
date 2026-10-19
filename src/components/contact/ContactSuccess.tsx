import { IconArrowUpRight, IconCheck } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { fadeUp } from '@/lib/motion';

export function ContactSuccess() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--brand)_12%,transparent),transparent_55%)]"
      />
      <motion.div
        className="relative mx-auto flex w-full max-w-lg flex-col items-center text-center"
        initial={reduce ? false : 'hidden'}
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
        }}
      >
        <motion.div
          className="bg-brand/10 text-brand mb-6 inline-flex size-14 items-center justify-center rounded-2xl"
          variants={fadeUp(0.6, 14)}
        >
          <IconCheck className="size-7" stroke={1.5} aria-hidden />
        </motion.div>
        <motion.h1
          className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl"
          variants={fadeUp(0.7, 18)}
        >
          {t('contact.success.title')}
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-3 text-base leading-7 sm:text-lg"
          variants={fadeUp(0.7, 16)}
        >
          {t('contact.success.body')}
        </motion.p>
        <motion.p className="text-muted-foreground mt-3 text-sm leading-6" variants={fadeUp()}>
          {t('contact.success.hint')}
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          variants={fadeUp()}
        >
          <MovingBorderButton
            as={Link}
            to="/signup"
            borderRadius="9999px"
            containerClassName="h-11"
            className="px-5"
          >
            {t('contact.success.openShop')}
            <IconArrowUpRight className="size-4" stroke={1.5} />
          </MovingBorderButton>
          <Button asChild size="lg" variant="ghost" className="rounded-full px-5 active:scale-[0.98]">
            <Link to="/">{t('contact.success.backHome')}</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
