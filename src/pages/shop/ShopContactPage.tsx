import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { getLocalizedFooterAddress } from '../../lib/shopContentLanguages';
import { getSocialBrandColor, SocialIcon } from '../../components/SocialIcons';
import ContactLtrText from '../../components/ContactLtrText';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

export default function ShopContactPage() {
  const { shop, username } = useShop();
  const { t, lang } = useShopLanguage();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState('');

  if (!shop) return null;

  if (contactSent) {
    return (
      <main className={`${containerClass} flex-1 pt-6 pb-8 max-lg:pt-6 max-lg:pb-8 max-w-xl mx-auto text-center lg:pt-10 lg:pb-12`}>
        <div className="rounded-theme-card border border-theme-border bg-theme-surface p-6 shadow-theme-card max-lg:p-6 sm:p-10 lg:p-10">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-theme-card bg-theme-primary-light text-theme-primary max-lg:mb-3 lg:mb-4 lg:h-16 lg:w-16">
            <Send className="h-6 w-6 lg:h-7 lg:w-7" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-theme-text max-lg:leading-snug lg:text-2xl">{t('contactSuccessTitle')}</h2>
          <p className="mb-5 text-sm text-theme-text-muted max-lg:mb-5 lg:mb-6 lg:text-base">{t('contactSuccessBody', { shopName: shop.shopName })}</p>
          <Link to={`/${username}`} className="inline-flex w-full max-lg:w-full items-center justify-center rounded-theme-btn px-5 py-2.5 text-sm font-semibold text-theme-badge-text bg-theme-primary hover:bg-theme-primary-hover no-underline lg:inline-block lg:w-auto lg:text-base">{t('backToStore')}</Link>
        </div>
      </main>
    );
  }

  const localizedAddress = getLocalizedFooterAddress(shop, lang);
  const contactLinks = (shop.footerSocialLinks ?? []).filter((link) => link?.url?.trim());
  const hasDirectContactDetails = Boolean(
    (shop.footerPhone && shop.footerPhone.trim()) ||
    (shop.footerEmail && shop.footerEmail.trim()) ||
    localizedAddress.trim()
  );
  const hasContactSidebar = hasDirectContactDetails || contactLinks.length > 0;

  async function handleSubmitContact(e: React.FormEvent) {
    e.preventDefault();
    setContactError('');
    setContactSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/shop/${encodeURIComponent(username)}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName.trim(), email: contactEmail.trim(), message: contactMessage.trim() }),
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

  return (
    <main className={`${containerClass} flex-1 pt-4 pb-8 max-lg:pt-4 max-lg:pb-8 lg:pt-8 lg:pb-12`}>
      <section className="relative mb-5 max-lg:mb-5 overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:p-4 lg:mb-8 lg:p-10">
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-theme-badge border border-theme-border bg-theme-primary-light px-2.5 py-0.5 text-[10px] font-semibold text-theme-primary lg:px-3 lg:py-1 lg:text-xs">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {t('contactBadge')}
          </p>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-theme-text max-lg:leading-snug lg:mt-4 lg:text-3xl xl:text-4xl">
            {t('contactTitle', { shopName: shop.shopName })}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-theme-text-muted lg:mt-2 lg:text-base">
            {t('contactIntro')}
          </p>
        </div>
      </section>

      <section
        className={
          hasContactSidebar
            ? 'grid items-start gap-4 max-lg:gap-4 lg:gap-8 xl:grid-cols-[0.95fr_1.05fr]'
            : ''
        }
      >
        {hasContactSidebar && (
          <div className="space-y-3 max-lg:space-y-3 lg:space-y-4">
            {hasDirectContactDetails && (
              <div className="rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:p-4 lg:p-6">
                <h3 className="mb-3 text-base font-bold text-theme-text max-lg:mb-3 lg:mb-4 lg:text-lg">
                  {t('storeContactDetails')}
                </h3>
                <div className="max-lg:divide-y max-lg:divide-theme-border lg:space-y-3">
                  {shop.footerPhone?.trim() && (
                    <a
                      href={`tel:${shop.footerPhone.trim()}`}
                      className="flex items-center gap-2.5 py-2.5 text-theme-text no-underline transition-colors hover:text-theme-primary max-lg:gap-2.5 max-lg:py-2.5 max-lg:first:pt-0 max-lg:last:pb-0 lg:items-start lg:gap-3 lg:rounded-theme-card lg:border lg:border-theme-border lg:bg-theme-surface-secondary lg:p-3.5 lg:hover:border-theme-primary"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-theme-btn bg-theme-primary-light text-theme-primary lg:h-9 lg:w-9">
                        <Phone className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-theme-text-muted lg:text-xs lg:font-semibold lg:tracking-wider">
                          {t('phoneNumber')}
                        </span>
                        <span className="mt-0.5 block text-sm font-medium leading-snug text-theme-text lg:mt-0 lg:text-base lg:font-semibold">
                          <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                        </span>
                      </span>
                    </a>
                  )}
                  {shop.footerEmail?.trim() && (
                    <a
                      href={`mailto:${shop.footerEmail.trim()}`}
                      className="flex items-center gap-2.5 py-2.5 text-theme-text no-underline transition-colors hover:text-theme-primary max-lg:gap-2.5 max-lg:py-2.5 lg:items-start lg:gap-3 lg:rounded-theme-card lg:border lg:border-theme-border lg:bg-theme-surface-secondary lg:p-3.5 lg:hover:border-theme-primary"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-theme-btn bg-theme-primary-light text-theme-primary lg:h-9 lg:w-9">
                        <Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-theme-text-muted lg:text-xs lg:font-semibold lg:tracking-wider">
                          {t('email')}
                        </span>
                        <span className="mt-0.5 block break-all text-sm font-medium leading-snug text-theme-text lg:mt-0 lg:text-base lg:font-semibold">
                          <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                        </span>
                      </span>
                    </a>
                  )}
                  {localizedAddress.trim() && (
                    <div className="flex items-start gap-2.5 py-2.5 text-theme-text max-lg:gap-2.5 max-lg:py-2.5 lg:gap-3 lg:rounded-theme-card lg:border lg:border-theme-border lg:bg-theme-surface-secondary lg:p-3.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-theme-btn bg-theme-primary-light text-theme-primary lg:h-9 lg:w-9">
                        <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-theme-text-muted lg:text-xs lg:font-semibold lg:tracking-wider">
                          {t('address')}
                        </span>
                        <span
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className="mt-0.5 block text-sm font-medium leading-relaxed text-theme-text whitespace-pre-wrap lg:mt-0 lg:text-base lg:font-semibold lg:leading-normal"
                        >
                          {localizedAddress}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contactLinks.length > 0 && (
              <div className="rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:p-4 lg:p-6">
                <h3 className="mb-3 text-base font-bold text-theme-text max-lg:mb-3 lg:mb-4 lg:text-lg">
                  {t('socialLinks')}
                </h3>
                <div className="flex flex-wrap gap-2 max-lg:gap-2 lg:gap-2.5">
                  {contactLinks.map((link, index) => (
                    <a
                      key={`${link.platform}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-2 rounded-theme-btn border border-theme-border bg-theme-surface px-3 py-2 text-sm font-medium text-theme-text no-underline hover:border-theme-primary hover:bg-theme-primary-light max-lg:py-2 lg:px-3.5 lg:py-2.5"
                    >
                      <span style={{ color: getSocialBrandColor(link.platform) }}><SocialIcon platform={link.platform} /></span>
                      <span className="capitalize">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmitContact}
          className={`space-y-3.5 rounded-theme-card border border-theme-border bg-theme-surface p-4 shadow-theme-card max-lg:space-y-3.5 max-lg:p-4 lg:space-y-4 lg:p-8 ${hasContactSidebar ? '' : 'mx-auto w-full max-w-3xl'}`}
        >
          <h3 className="text-base font-bold text-theme-text lg:text-lg">{t('sendMessageTitle')}</h3>
          <p className="text-xs text-theme-text-muted lg:text-sm">{t('sendMessageIntro')}</p>
          {contactError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{contactError}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-theme-text">{t('yourName')} <span className="text-red-500">*</span></label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} required placeholder={t('contactNamePh')} className="w-full rounded-theme-input border-2 border-theme-border bg-theme-surface-secondary px-3 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-theme-text">{t('email')} <span className="text-red-500">*</span></label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required placeholder={t('contactEmailPh')} className="w-full rounded-theme-input border-2 border-theme-border bg-theme-surface-secondary px-3 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-theme-text">{t('message')} <span className="text-red-500">*</span></label>
            <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required rows={5} placeholder={t('contactMessagePh')} className="w-full min-h-[7.5rem] resize-y rounded-theme-input border-2 border-theme-border bg-theme-surface-secondary px-3 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
          </div>
          <button
            type="submit"
            disabled={contactSubmitting}
            className="w-full rounded-theme-btn bg-theme-primary py-3 text-sm font-semibold text-theme-badge-text hover:bg-theme-primary-hover disabled:opacity-60 max-lg:py-3 lg:py-3.5 lg:text-base"
          >
            {contactSubmitting ? t('sending') : t('sendMessage')}
          </button>
        </form>
      </section>
    </main>
  );
}
