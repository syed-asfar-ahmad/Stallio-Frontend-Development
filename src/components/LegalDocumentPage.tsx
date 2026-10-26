import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { IconArrowLeft } from '@tabler/icons-react';

import PublicLayout from './PublicLayout';
import {
  HeroAtmosphere,
  heroBleedClassName,
} from '@/components/marketing/HeroAtmosphere';
import { motionEase } from '@/lib/motion';

export type LegalDocKey = 'legalPrivacy' | 'legalTerms' | 'legalRefund';

type Section = { heading: string; paragraphs: string[] };

const LEGAL_NAV: { key: LegalDocKey; href: string; labelKey: string }[] = [
  { key: 'legalPrivacy', href: '/privacy', labelKey: 'legalDoc.privacy' },
  { key: 'legalTerms', href: '/terms', labelKey: 'legalDoc.terms' },
  { key: 'legalRefund', href: '/refund-policy', labelKey: 'legalDoc.refund' },
];

export default function LegalDocumentPage({ docKey }: { docKey: LegalDocKey }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const sections = t(`${docKey}.sections`, { returnObjects: true }) as Section[];

  useEffect(() => {
    document.title = t(`${docKey}.metaTitle`);
  }, [docKey, t]);

  const otherDocs = LEGAL_NAV.filter((item) => item.key !== docKey);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        <section className={heroBleedClassName}>
          <HeroAtmosphere sparkleId={`legal-${docKey}-sparkles`} />

          <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-12 md:gap-12 md:py-28 lg:py-32">
            <motion.div
              className="flex max-w-2xl flex-col gap-5 md:col-span-8"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: motionEase }}
            >
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-2 text-sm font-medium no-underline transition-colors duration-300"
              >
                <IconArrowLeft
                  className="size-4 shrink-0 rtl:rotate-180"
                  stroke={1.5}
                  aria-hidden
                />
                {t('legalDoc.backHome')}
              </Link>

              <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex w-fit rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
                {t('legalDoc.eyebrow')}
              </span>

              <h1 className="text-foreground max-w-[16ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
                {t(`${docKey}.title`)}
              </h1>

              <p className="text-muted-foreground text-sm font-medium">
                {t('legalDoc.lastUpdated')}
              </p>

              <p className="text-muted-foreground max-w-[48ch] text-base leading-7 sm:text-lg sm:leading-8">
                {t(`${docKey}.intro`)}
              </p>
            </motion.div>

            <motion.aside
              className="md:col-span-4 md:pt-16"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: reduce ? 0 : 0.12, ease: motionEase }}
            >
              <p className="text-muted-foreground text-[10px] font-medium tracking-[0.2em] uppercase">
                {t('legalDoc.alsoRead')}
              </p>
              <ul className="mt-4 space-y-3">
                {otherDocs.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-foreground hover:text-brand group inline-flex items-baseline gap-2 text-base font-medium no-underline transition-colors duration-300"
                    >
                      <span
                        className="bg-border group-hover:bg-brand mt-2 h-px w-4 shrink-0 transition-colors duration-300"
                        aria-hidden
                      />
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.aside>
          </div>
        </section>

        <section className="border-border relative border-y bg-surface dark:bg-background">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_0%,color-mix(in_srgb,var(--brand)_8%,transparent),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_8%_0%,color-mix(in_srgb,var(--brand)_14%,transparent),transparent_45%)]"
          />

          <article className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-24 lg:py-28">
            <div className="divide-border/60 divide-y">
              {sections.map((sec) => (
                <section key={sec.heading} className="scroll-mt-28 py-10 first:pt-0 last:pb-0 sm:py-12">
                  <h2 className="text-foreground text-xl font-semibold tracking-tight text-pretty sm:text-2xl">
                    {sec.heading}
                  </h2>
                  <div className="mt-4 max-w-[65ch] space-y-4 text-base font-medium leading-7 text-stone-600 sm:leading-8 dark:text-zinc-300">
                    {sec.paragraphs.map((p, i) => (
                      <p key={i} className="text-pretty">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <footer className="border-border/60 mt-14 border-t pt-10 sm:mt-16">
              <p className="text-muted-foreground max-w-[48ch] text-sm leading-6">
                {t('legalDoc.contactNote')}{' '}
                <Link
                  to="/contact"
                  className="text-foreground hover:text-brand font-medium underline-offset-4 transition-colors hover:underline"
                >
                  {t('legalDoc.contactLink')}
                </Link>
                .
              </p>
            </footer>
          </article>
        </section>
      </div>
    </PublicLayout>
  );
}
