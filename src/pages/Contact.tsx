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
            <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
              <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-12 lg:gap-16">
                <ContactInfo />
                <ContactForm onSuccess={() => setSubmitted(true)} />
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
