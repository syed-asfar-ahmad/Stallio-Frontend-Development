import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Sprout, Clock, Check, ArrowRight } from 'lucide-react';
import type { Shop } from '../../../../types';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedFooterAddress } from '../../../../lib/shopContentLanguages';
import { getSocialBrandColor, SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { PacificPillTag } from './PacificParts';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Props = {
  shop: Shop;
  username: string;
  containerClass: string;
};

export default function PacificContactPage({ shop, username, containerClass }: Props) {
  const { t, lang } = useShopLanguage();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  const localizedAddress = getLocalizedFooterAddress(shop, lang);
  const contactLinks = (shop.footerSocialLinks ?? []).filter((link) => link?.url?.trim());
  const hasDirectContactDetails = Boolean(
    (shop.footerPhone && shop.footerPhone.trim()) ||
    (shop.footerEmail && shop.footerEmail.trim()) ||
    localizedAddress.trim()
  );

  async function handleSubmitContact(e: React.FormEvent) {
    e.preventDefault();
    setContactError('');
    setContactSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          message: contactMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errorContactFailed'));
      setContactSent(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err) {
      setContactError((err as Error).message);
    } finally {
      setContactSubmitting(false);
    }
  }

  if (contactSent) {
    return (
      <main className={`${containerClass} flex-1 pt-8 pb-16 max-w-xl mx-auto text-center lg:pt-16`}>
        <div className="rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface p-8 sm:p-12 shadow-[var(--theme-shadow-card)] space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary">
            <Check className="h-8 w-8" />
          </div>
          <h2
            className="text-2xl sm:text-3xl font-normal text-theme-text"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            {t('contactSuccessTitle') || 'Inquiry Received with Gratitude'}
          </h2>
          <p className="text-sm text-theme-text-muted leading-relaxed">
            {t('contactSuccessBody', { shopName: shop.shopName }) ||
              'Our concierge team will review your message and reply promptly within one business day.'}
          </p>
          <div className="pt-4">
            <Link
              to={`/${username}`}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider text-white no-underline shadow-sm"
              style={{ background: 'var(--theme-primary)' }}
            >
              <span>{t('backToStore')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${containerClass} flex-1 pt-8 pb-16 lg:pt-14 lg:pb-28 max-w-6xl mx-auto`}>
      {/* Editorial Header */}
      <div className="text-center mb-10 lg:mb-16 max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center">
          <PacificPillTag icon={Mail}>Artisanal Concierge Desk</PacificPillTag>
        </div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-theme-text"
          style={{
            fontFamily: 'var(--theme-font-heading, inherit)',
            letterSpacing: 'var(--theme-heading-spacing)',
          }}
        >
          {t('contactTitle', { shopName: shop.shopName }) || `Connect with ${shop.shopName}`}
        </h1>
        <p className="text-sm sm:text-base text-theme-text-muted leading-relaxed">
          {t('contactIntro') || 'Inquiries regarding custom harvest crates, partner estates, wholesale provisions, or order concierge support.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Estate / Concierge Information */}
        <section
          className="lg:col-span-5 rounded-[var(--theme-radius-card)] border p-6 sm:p-10 shadow-[var(--theme-shadow-card)] space-y-8"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
          }}
        >
          <div className="space-y-2">
            <h3
              className="text-xl sm:text-2xl font-normal text-theme-text"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              Estate & Studio Desk
            </h3>
            <p className="text-xs sm:text-sm text-theme-text-muted leading-relaxed">
              We welcome patrons to reach out directly with questions regarding harvest sourcing and provisions.
            </p>
          </div>

          <div className="space-y-4">
            {shop.footerEmail?.trim() && (
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-theme-surface border border-theme-border shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">Direct Email</span>
                  <a
                    href={`mailto:${shop.footerEmail.trim()}`}
                    className="text-xs sm:text-sm font-semibold text-theme-text hover:text-theme-primary transition-colors no-underline break-all"
                  >
                    <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                  </a>
                </div>
              </div>
            )}

            {shop.footerPhone?.trim() && (
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-theme-surface border border-theme-border shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">Telephone Concierge</span>
                  <a
                    href={`tel:${shop.footerPhone.trim()}`}
                    className="text-xs sm:text-sm font-semibold text-theme-text hover:text-theme-primary transition-colors no-underline"
                  >
                    <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                  </a>
                </div>
              </div>
            )}

            {localizedAddress.trim() && (
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-theme-surface border border-theme-border shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">Location / Packing Atelier</span>
                  <span className="text-xs sm:text-sm text-theme-text leading-relaxed font-medium">
                    {localizedAddress.trim()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-theme-surface border border-theme-border shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">Harvest Dispatch Hours</span>
                <span className="text-xs sm:text-sm text-theme-text font-medium">
                  Monday – Friday: 8:00 AM – 6:00 PM
                </span>
              </div>
            </div>
          </div>

          {contactLinks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-theme-border">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-text-muted">Follow Our Harvest Journal</span>
              <div className="flex flex-wrap gap-2">
                {contactLinks.map((link, idx) => (
                  <a
                    key={`${link.platform}-${idx}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text hover:border-theme-primary hover:text-theme-primary transition-colors shadow-xs"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Refined Contact Form */}
        <section className="lg:col-span-7 rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface p-6 sm:p-10 lg:p-12 shadow-[var(--theme-shadow-card)]">
          <div className="space-y-1 mb-6">
            <h3
              className="text-xl sm:text-2xl font-normal text-theme-text"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('sendMessageTitle') || 'Send a Direct Message'}
            </h3>
            <p className="text-xs sm:text-sm text-theme-text-muted">
              {t('sendMessageIntro') || 'Fill out the form below and our team will get back to you.'}
            </p>
          </div>

          <form onSubmit={handleSubmitContact} className="space-y-4 sm:space-y-5">
            {contactError && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-50 text-xs font-semibold text-red-700 border border-red-200">
                {contactError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pacific-contact-name"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-theme-text"
                >
                  {t('yourName')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="pacific-contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  placeholder={t('contactNamePh') || 'e.g. Eleanor Vance'}
                  className="w-full rounded-full border border-theme-border bg-theme-surface-secondary px-4 py-3 text-xs sm:text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="pacific-contact-email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-theme-text"
                >
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="pacific-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder={t('contactEmailPh') || 'e.g. eleanor@estate.com'}
                  className="w-full rounded-full border border-theme-border bg-theme-surface-secondary px-4 py-3 text-xs sm:text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="pacific-contact-message"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-theme-text"
              >
                {t('message')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="pacific-contact-message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={5}
                placeholder={t('contactMessagePh') || 'Describe your inquiry or order requirements in detail...'}
                className="w-full rounded-2xl border border-theme-border bg-theme-surface-secondary p-4 text-xs sm:text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={contactSubmitting}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--theme-primary)' }}
            >
              <Send className="h-4 w-4" />
              <span>{contactSubmitting ? t('sending') : t('sendMessage')}</span>
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
