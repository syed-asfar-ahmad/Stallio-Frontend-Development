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
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:p-6 sm:p-10 lg:rounded-3xl">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 max-lg:mb-3 lg:mb-4 lg:h-16 lg:w-16">
            <Send className="h-6 w-6 lg:h-7 lg:w-7" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-stone-900 dark:text-zinc-100 max-lg:leading-snug lg:text-2xl">{t('contactSuccessTitle')}</h2>
          <p className="mb-5 text-sm text-stone-600 dark:text-zinc-400 max-lg:mb-5 lg:mb-6 lg:text-base">{t('contactSuccessBody', { shopName: shop.shopName })}</p>
          <Link to={`/${username}`} className="inline-flex w-full max-lg:w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 no-underline lg:inline-block lg:w-auto lg:text-base">{t('backToStore')}</Link>
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
      <section className="relative mb-5 max-lg:mb-5 overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-brand-50/45 to-brand-50/45 p-4 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-brand-950/30 dark:to-brand-950/20 max-lg:p-4 lg:mb-8 lg:rounded-3xl lg:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-200/25 blur-3xl dark:bg-brand-500/10" aria-hidden />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-brand-200/25 blur-3xl dark:bg-brand-500/10" aria-hidden />
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/80 px-2.5 py-0.5 text-[10px] font-semibold text-brand-700 dark:border-brand-700/50 dark:bg-brand-950/50 dark:text-brand-300 lg:px-3 lg:py-1 lg:text-xs">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {t('contactBadge')}
          </p>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-stone-900 max-lg:leading-snug dark:text-zinc-100 lg:mt-4 lg:text-3xl xl:text-4xl">
            {t('contactTitle', { shopName: shop.shopName })}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-zinc-400 lg:mt-2 lg:text-base">
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
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:p-4 lg:rounded-3xl lg:p-6">
                <h3 className="mb-3 text-base font-bold text-stone-900 dark:text-zinc-100 max-lg:mb-3 lg:mb-4 lg:text-lg">
                  {t('storeContactDetails')}
                </h3>
                <div className="max-lg:divide-y max-lg:divide-stone-200/90 dark:max-lg:divide-zinc-700/80 lg:space-y-3">
                  {shop.footerPhone?.trim() && (
                    <a
                      href={`tel:${shop.footerPhone.trim()}`}
                      className="flex items-center gap-2.5 py-2.5 text-stone-800 no-underline transition-colors hover:text-brand-700 dark:text-zinc-200 dark:hover:text-brand-400 max-lg:gap-2.5 max-lg:py-2.5 max-lg:first:pt-0 max-lg:last:pb-0 lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-stone-200 lg:bg-stone-50/70 lg:p-3.5 lg:hover:border-brand-300 dark:lg:border-zinc-700 dark:lg:bg-zinc-800/80 dark:lg:hover:border-brand-500/50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-100/80 dark:bg-brand-950/40 dark:text-brand-400 dark:ring-brand-800/40 lg:h-9 lg:w-9 lg:rounded-lg lg:bg-brand-100 lg:ring-0 dark:lg:bg-brand-950/50">
                        <Phone className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500 lg:text-xs lg:font-semibold lg:tracking-wider lg:text-stone-500">
                          {t('phoneNumber')}
                        </span>
                        <span className="mt-0.5 block text-sm font-medium leading-snug text-stone-800 dark:text-zinc-100 lg:mt-0 lg:text-base lg:font-semibold">
                          <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                        </span>
                      </span>
                    </a>
                  )}
                  {shop.footerEmail?.trim() && (
                    <a
                      href={`mailto:${shop.footerEmail.trim()}`}
                      className="flex items-center gap-2.5 py-2.5 text-stone-800 no-underline transition-colors hover:text-brand-700 dark:text-zinc-200 dark:hover:text-brand-400 max-lg:gap-2.5 max-lg:py-2.5 lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-stone-200 lg:bg-stone-50/70 lg:p-3.5 lg:hover:border-brand-300 dark:lg:border-zinc-700 dark:lg:bg-zinc-800/80 dark:lg:hover:border-brand-500/50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-100/80 dark:bg-brand-950/40 dark:text-brand-400 dark:ring-brand-800/40 lg:h-9 lg:w-9 lg:rounded-lg lg:bg-brand-100 lg:ring-0 dark:lg:bg-brand-950/50">
                        <Mail className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500 lg:text-xs lg:font-semibold lg:tracking-wider lg:text-stone-500">
                          {t('email')}
                        </span>
                        <span className="mt-0.5 block break-all text-sm font-medium leading-snug text-stone-800 dark:text-zinc-100 lg:mt-0 lg:text-base lg:font-semibold">
                          <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                        </span>
                      </span>
                    </a>
                  )}
                  {localizedAddress.trim() && (
                    <div className="flex items-start gap-2.5 py-2.5 text-stone-800 dark:text-zinc-200 max-lg:gap-2.5 max-lg:py-2.5 lg:gap-3 lg:rounded-xl lg:border lg:border-stone-200 lg:bg-stone-50/70 lg:p-3.5 dark:lg:border-zinc-700 dark:lg:bg-zinc-800/80">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-100/80 dark:bg-brand-950/40 dark:text-brand-400 dark:ring-brand-800/40 lg:h-9 lg:w-9 lg:rounded-lg lg:bg-brand-100 lg:ring-0 dark:lg:bg-brand-950/50">
                        <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-500 lg:text-xs lg:font-semibold lg:tracking-wider lg:text-stone-500">
                          {t('address')}
                        </span>
                        <span
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          className="mt-0.5 block text-sm font-medium leading-relaxed text-stone-800 whitespace-pre-wrap dark:text-zinc-100 lg:mt-0 lg:text-base lg:font-semibold lg:leading-normal"
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
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:p-4 lg:rounded-3xl lg:p-6">
                <h3 className="mb-3 text-base font-bold text-stone-900 dark:text-zinc-100 max-lg:mb-3 lg:mb-4 lg:text-lg">
                  {t('socialLinks')}
                </h3>
                <div className="flex flex-wrap gap-2 max-lg:gap-2 lg:gap-2.5">
                  {contactLinks.map((link, index) => (
                    <a
                      key={`${link.platform}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 no-underline hover:border-brand-300 hover:bg-brand-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-brand-500/50 dark:hover:bg-brand-950/40 max-lg:py-2 lg:px-3.5 lg:py-2.5"
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
          className={`space-y-3.5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 max-lg:space-y-3.5 max-lg:p-4 lg:space-y-4 lg:rounded-3xl lg:p-8 ${hasContactSidebar ? '' : 'mx-auto w-full max-w-3xl'}`}
        >
          <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 lg:text-lg">{t('sendMessageTitle')}</h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400 lg:text-sm">{t('sendMessageIntro')}</p>
          {contactError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{contactError}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('yourName')} <span className="text-red-500">*</span></label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} required placeholder={t('contactNamePh')} className="w-full rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-brand-500 max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('email')} <span className="text-red-500">*</span></label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required placeholder={t('contactEmailPh')} className="w-full rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-brand-500 max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-800 dark:text-zinc-200">{t('message')} <span className="text-red-500">*</span></label>
            <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required rows={5} placeholder={t('contactMessagePh')} className="w-full min-h-[7.5rem] resize-y rounded-xl border-2 border-stone-200 bg-stone-50/50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-brand-500 max-lg:py-2.5 lg:px-4 lg:py-3 lg:text-base" />
          </div>
          <button
            type="submit"
            disabled={contactSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-600 py-3 text-sm font-semibold text-white hover:from-brand-500 hover:to-brand-500 disabled:opacity-60 max-lg:py-3 lg:py-3.5 lg:text-base"
          >
            {contactSubmitting ? t('sending') : t('sendMessage')}
          </button>
        </form>
      </section>
    </main>
  );
}
