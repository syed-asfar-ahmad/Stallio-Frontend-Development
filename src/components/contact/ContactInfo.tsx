import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import ContactLtrText from '@/components/ContactLtrText';
import { getSocialBrandColor, SocialIcon } from '@/components/SocialIcons';
import { BezelShell } from '@/components/ui/bezel-shell';
import { marketingSocialLinks } from '@/lib/marketingSocialLinks';
import { fadeUp } from '@/lib/motion';

const CONTACT_EMAIL = 'contact@stallio.shop';

export function ContactInfo() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
      }}
    >
      <BezelShell className="rounded-2xl" innerClassName="rounded-[calc(1rem-0.375rem)] p-6 sm:p-8">
        <div className="space-y-8">
          <motion.div className="space-y-3" variants={fadeUp()}>
            <h2 className="text-foreground text-lg font-semibold">{t('contact.info.title')}</h2>
            <p className="text-muted-foreground text-sm leading-6">{t('contact.info.body')}</p>
          </motion.div>

          <motion.a
            href={`mailto:${CONTACT_EMAIL}`}
            className="border-border/50 hover:border-brand/40 hover:bg-brand/5 group flex items-center gap-4 rounded-xl border p-4 no-underline transition-colors duration-300"
            variants={fadeUp()}
          >
            <div className="bg-brand/10 flex size-10 items-center justify-center rounded-lg">
              <span className="text-brand text-sm font-semibold">@</span>
            </div>
            <span className="text-foreground group-hover:text-brand font-medium transition-colors">
              <ContactLtrText>{CONTACT_EMAIL}</ContactLtrText>
            </span>
          </motion.a>

          <motion.div className="space-y-3" variants={fadeUp()}>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
              {t('contact.info.social')}
            </p>
            <div className="flex flex-wrap gap-2">
              {marketingSocialLinks.map((link, index) => (
                <a
                  key={`${link.platform}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/50 text-muted-foreground hover:border-brand/50 hover:bg-brand/5 hover:text-brand inline-flex size-10 items-center justify-center rounded-lg border transition-all duration-300"
                  aria-label={link.platform === 'twitter' ? 'X' : link.platform}
                >
                  <span style={{ color: getSocialBrandColor(link.platform) }}>
                    <SocialIcon platform={link.platform} size={18} />
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </BezelShell>
    </motion.div>
  );
}
