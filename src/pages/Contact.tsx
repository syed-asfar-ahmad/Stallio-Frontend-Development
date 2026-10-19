import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import PublicLayout from '@/components/PublicLayout';
import {
  ContactForm,
  ContactHero,
  ContactInfo,
  ContactSuccess,
} from '@/components/contact';
import { MarketingCta } from '@/components/marketing/MarketingCta';

export default function Contact() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip">
        {submitted ? (
          <ContactSuccess />
        ) : (
          <>
            <ContactHero />

            <section
              id="write"
              className="border-border relative scroll-mt-28 overflow-hidden border-y bg-surface dark:bg-background"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_12%_0%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_50%)]"
              />
              <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6 md:py-32 lg:grid-cols-12 lg:gap-14 lg:py-36">
                <ContactInfo className="lg:col-span-5" />
                <ContactForm
                  className="lg:col-span-7"
                  onSuccess={() => setSubmitted(true)}
                />
              </div>
            </section>

            <MarketingCta
              eyebrow={t('contact.cta.eyebrow')}
              title={t('contact.cta.title')}
              body={t('contact.cta.body')}
              primaryLabel={t('contact.success.openShop')}
              secondaryLabel={t('contact.cta.secondary')}
              secondaryTo="/how-it-works"
            />
          </>
        )}
      </div>
    </PublicLayout>
  );
}
