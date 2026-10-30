import { IconClockHour4 } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { getSocialBrandColor, SocialIcon } from '@/components/SocialIcons';
import { marketingSocialLinks } from '@/lib/marketingSocialLinks';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ContactInfoProps = {
  className?: string;
};

export function ContactInfo({ className }: ContactInfoProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const topics = t('contact.info.topics', { returnObjects: true }) as string[];

  return (
    <motion.aside
      className={cn('space-y-10 lg:sticky lg:top-28 lg:self-start', className)}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
      }}
    >
      <motion.div className="space-y-4" variants={fadeUp(0.7, 18)}>
        <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
          {t('contact.info.eyebrow')}
        </span>
        <h2 className="text-foreground text-section-heading max-w-[12ch]">
          {t('contact.info.title')}
        </h2>
        <p className="text-muted-foreground max-w-[36ch] text-base leading-7 sm:text-lg sm:leading-8">
          {t('contact.info.body')}
        </p>
      </motion.div>

      <motion.div className="flex items-start gap-3" variants={fadeUp()}>
        <span className="bg-brand/10 text-brand dark:text-white mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full">
          <IconClockHour4 className="size-4" stroke={1.5} aria-hidden />
        </span>
        <p className="text-foreground/90 max-w-[34ch] text-sm leading-6 sm:text-base">
          {t('contact.info.replyTime')}
        </p>
      </motion.div>

      <motion.ul className="space-y-3" variants={fadeUp()}>
        {topics.map((topic) => (
          <li
            key={topic}
            className="text-muted-foreground flex items-start gap-3 text-sm leading-6 sm:text-base"
          >
            <span className="bg-brand mt-2 size-1.5 shrink-0 rounded-full" aria-hidden />
            <span>{topic}</span>
          </li>
        ))}
      </motion.ul>

      <motion.div className="space-y-3" variants={fadeUp()}>
        <p className="text-muted-foreground text-[10px] font-medium tracking-[0.18em] uppercase">
          {t('contact.info.social')}
        </p>
        <div className="flex flex-wrap gap-2">
          {marketingSocialLinks.map((link, index) => (
            <a
              key={`${link.platform}-${index}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border/60 text-muted-foreground hover:border-brand/50 hover:bg-brand/5 hover:text-brand inline-flex size-11 items-center justify-center rounded-2xl border transition-all duration-300 active:scale-[0.96]"
              aria-label={link.platform === 'twitter' ? 'X' : link.platform}
            >
              <span style={{ color: getSocialBrandColor(link.platform) }}>
                <SocialIcon platform={link.platform} size={18} />
              </span>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.aside>
  );
}
