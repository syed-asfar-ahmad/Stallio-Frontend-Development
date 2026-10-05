import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useStorefrontTheme } from '../../themes';
import { useShopLanguage } from '../../context/ShopLanguageContext';
import { getLocalizedFooterAddress } from '../../lib/shopContentLanguages';
import { getSocialBrandColor, SocialIcon } from '../../components/SocialIcons';
import ContactLtrText from '../../components/ContactLtrText';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const containerClass = 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-5';

export default function ShopContactPage() {
  const { shop, username } = useShop();
  const { layout } = useStorefrontTheme();
  const contactVariant = layout.contactVariant ?? 'split-card';
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
        <div className="rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface p-6 shadow-theme-card max-lg:p-6 sm:p-10 lg:p-10">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary max-lg:mb-3 lg:mb-4 lg:h-16 lg:w-16">
            <Send className="h-6 w-6 lg:h-7 lg:w-7" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-theme-text max-lg:leading-snug lg:text-2xl">{t('contactSuccessTitle')}</h2>
          <p className="mb-5 text-sm text-theme-text-muted max-lg:mb-5 lg:mb-6 lg:text-base">{t('contactSuccessBody', { shopName: shop.shopName })}</p>
          <Link to={`/${username}`} className="inline-flex w-full max-lg:w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-theme-primary-contrast bg-theme-primary hover:bg-theme-primary-hover no-underline lg:inline-block lg:w-auto lg:text-base shadow-sm">{t('backToStore')}</Link>
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

  // ── COCOA-STUDIO (Boutique Artisan) ──────────────────────────────────────
  if (contactVariant === 'cocoa-studio') {
    const CREAM = '#f7ead4';
    const SOFT = 'rgb(247 234 212 / 0.72)';
    const field =
      'w-full rounded-[var(--theme-radius-input)] border px-4 py-3.5 text-[15px] transition-colors placeholder:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]';
    const fieldStyle = {
      borderColor: 'var(--theme-border)',
      background: 'var(--theme-surface-secondary)',
      color: 'var(--theme-text-primary)',
    } as const;
    const label = 'mb-2 block text-sm font-semibold';

    return (
      <main className={`${containerClass} flex-1 pb-16 pt-5 lg:pb-28 lg:pt-8`}>
        <div className="grid overflow-hidden rounded-[var(--theme-radius-card)] lg:grid-cols-[5fr_7fr]" style={{ boxShadow: 'var(--theme-shadow-card)' }}>
          {/* Details panel */}
          <section
            className="relative flex flex-col justify-between gap-12 p-8 sm:p-12 lg:p-14"
            style={{ background: 'color-mix(in srgb, var(--theme-primary) 30%, #1a0f07)', color: CREAM }}
          >
            <div>
              <h1
                className="text-[2.4rem] font-semibold leading-[1.05] sm:text-5xl"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.035em', textWrap: 'balance' as never }}
              >
                {t('contactTitle', { shopName: shop.shopName })}
              </h1>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed" style={{ color: SOFT }}>
                {t('contactIntro')}
              </p>
            </div>

            {hasContactSidebar && (
              <div className="space-y-6">
                {hasDirectContactDetails && (
                  <ul className="space-y-4 text-[15px]">
                    {shop.footerEmail?.trim() && (
                      <li className="flex items-start gap-3.5">
                        <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden />
                        <a href={`mailto:${shop.footerEmail.trim()}`} className="break-all no-underline hover:underline" style={{ color: CREAM }}>
                          <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                        </a>
                      </li>
                    )}
                    {shop.footerPhone?.trim() && (
                      <li className="flex items-start gap-3.5">
                        <Phone className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden />
                        <a href={`tel:${shop.footerPhone.trim()}`} className="no-underline hover:underline" style={{ color: CREAM }}>
                          <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                        </a>
                      </li>
                    )}
                    {localizedAddress.trim() && (
                      <li className="flex items-start gap-3.5">
                        <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden />
                        <span className="leading-relaxed" style={{ color: SOFT }}>{localizedAddress.trim()}</span>
                      </li>
                    )}
                  </ul>
                )}
                {contactLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {contactLinks.map((link, index) => (
                      <a
                        key={`${link.platform}-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                        style={{ borderColor: 'rgb(247 234 212 / 0.2)', color: CREAM }}
                      >
                        <SocialIcon platform={link.platform} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Form */}
          <section className="p-8 sm:p-12 lg:p-14" style={{ background: 'var(--theme-surface)' }}>
            <h2
              className="text-2xl font-semibold sm:text-3xl"
              style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
            >
              {t('sendMessageTitle')}
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>{t('sendMessageIntro')}</p>

            <form onSubmit={handleSubmitContact} className="mt-8 space-y-5">
              {contactError && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {contactError}
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="cocoa-contact-name" className={label} style={{ color: 'var(--theme-text-primary)' }}>
                    {t('yourName')} <span className="text-red-600" aria-hidden>*</span>
                  </label>
                  <input
                    id="cocoa-contact-name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    placeholder={t('contactNamePh')}
                    className={field}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label htmlFor="cocoa-contact-email" className={label} style={{ color: 'var(--theme-text-primary)' }}>
                    {t('email')} <span className="text-red-600" aria-hidden>*</span>
                  </label>
                  <input
                    id="cocoa-contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    placeholder={t('contactEmailPh')}
                    className={field}
                    style={fieldStyle}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cocoa-contact-message" className={label} style={{ color: 'var(--theme-text-primary)' }}>
                  {t('message')} <span className="text-red-600" aria-hidden>*</span>
                </label>
                <textarea
                  id="cocoa-contact-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder={t('contactMessagePh')}
                  className={`${field} min-h-[9rem] resize-y`}
                  style={fieldStyle}
                />
              </div>
              <button
                type="submit"
                disabled={contactSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--theme-radius-btn)] px-8 text-sm font-semibold transition-colors hover:bg-[var(--theme-primary-hover)] disabled:opacity-60 sm:w-auto"
                style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
              >
                <Send className="h-4 w-4" aria-hidden />
                {contactSubmitting ? t('sending') : t('sendMessage')}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  // ── VARIANT 0: ORGANIC-CONCIERGE (Pacific Fresh Botanical Concierge) ─────
  if (contactVariant === 'organic-concierge') {
    return (
      <main className={`${containerClass} flex-1 pt-8 pb-14 lg:pt-14 lg:pb-24 max-w-5xl mx-auto`}>
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-theme-border bg-theme-primary-light text-theme-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>Concierge & Studio Support</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--theme-font-heading, inherit)',
              letterSpacing: 'var(--theme-heading-spacing)',
            }}
            className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-theme-text"
          >
            {t('contactTitle', { shopName: shop.shopName })}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-theme-text-muted leading-relaxed">
            {t('contactIntro')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct Concierge Cards Column */}
          {hasContactSidebar && (
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface shadow-[var(--theme-shadow-card)] space-y-5">
                <h3
                  className="text-lg font-bold text-theme-text"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Direct Channels
                </h3>

                <div className="space-y-3">
                  {shop.footerEmail?.trim() && (
                    <a
                      href={`mailto:${shop.footerEmail.trim()}`}
                      className="flex items-center gap-3.5 p-3.5 rounded-full border border-theme-border bg-theme-surface-secondary text-theme-text no-underline transition-all hover:border-theme-primary hover:bg-theme-surface"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary">
                        <Mail className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                          {t('email')}
                        </span>
                        <span className="block text-sm font-semibold truncate text-theme-text">
                          <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                        </span>
                      </div>
                    </a>
                  )}

                  {shop.footerPhone?.trim() && (
                    <a
                      href={`tel:${shop.footerPhone.trim()}`}
                      className="flex items-center gap-3.5 p-3.5 rounded-full border border-theme-border bg-theme-surface-secondary text-theme-text no-underline transition-all hover:border-theme-primary hover:bg-theme-surface"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary">
                        <Phone className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                          {t('phoneNumber')}
                        </span>
                        <span className="block text-sm font-semibold truncate text-theme-text">
                          <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                        </span>
                      </div>
                    </a>
                  )}

                  {localizedAddress.trim() && (
                    <div className="flex items-start gap-3.5 p-3.5 rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface-secondary text-theme-text">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary mt-0.5">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                          {t('address')}
                        </span>
                        <span className="block text-sm font-medium leading-relaxed text-theme-text">
                          {localizedAddress}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {contactLinks.length > 0 && (
                  <div className="pt-4 border-t border-theme-border">
                    <span className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-3">
                      {t('socialLinks')}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {contactLinks.map((link, index) => (
                        <a
                          key={`${link.platform}-${index}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-surface px-3.5 py-1.5 text-xs font-medium text-theme-text no-underline hover:border-theme-primary hover:bg-theme-primary-light transition-all"
                        >
                          <span style={{ color: getSocialBrandColor(link.platform) }}>
                            <SocialIcon platform={link.platform} />
                          </span>
                          <span className="capitalize">{link.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Column */}
          <div className={hasContactSidebar ? 'lg:col-span-7' : 'max-w-2xl mx-auto w-full'}>
            <form
              onSubmit={handleSubmitContact}
              className="p-6 sm:p-10 rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface shadow-[var(--theme-shadow-card)] space-y-4"
            >
              <h3
                className="text-xl font-bold text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Send a Message
              </h3>
              <p className="text-xs sm:text-sm text-theme-text-muted">
                Our team responds promptly to all inquiries and bespoke requests.
              </p>

              {contactError && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{contactError}</p>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-theme-text">
                  {t('yourName')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  placeholder={t('contactNamePh')}
                  className="w-full rounded-full border border-theme-border bg-theme-surface-secondary px-4 py-3 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-theme-text">
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder={t('contactEmailPh')}
                  className="w-full rounded-full border border-theme-border bg-theme-surface-secondary px-4 py-3 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-theme-text">
                  {t('message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder={t('contactMessagePh')}
                  className="w-full min-h-[7.5rem] resize-y rounded-[var(--theme-radius-card)] border border-theme-border bg-theme-surface-secondary px-4 py-3 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full rounded-full bg-theme-primary py-3.5 text-sm font-bold text-theme-primary-contrast shadow-md hover:bg-theme-primary-hover disabled:opacity-60 transition-all active:scale-[0.99]"
              >
                {contactSubmitting ? t('sending') : t('sendMessage')}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ── VARIANT 1: CENTERED-MINIMAL (Minimalist & Luxury brands) ────────────
  if (contactVariant === 'centered-minimal') {
    return (
      <main className={`${containerClass} flex-1 pt-6 pb-12 lg:pt-12 lg:pb-20 max-w-2xl mx-auto`}>
        <div className="text-center mb-8 lg:mb-12">
          <h1
            style={{
              fontFamily: 'var(--theme-font-heading, inherit)',
              letterSpacing: 'var(--theme-heading-spacing)',
              textTransform: 'var(--theme-heading-transform)' as any,
            }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-theme-text"
          >
            {t('contactTitle', { shopName: shop.shopName })}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-theme-text-muted leading-relaxed max-w-lg mx-auto">
            {t('contactIntro')}
          </p>
        </div>

        <form
          onSubmit={handleSubmitContact}
          className="space-y-4 rounded-theme-card border border-theme-border bg-theme-surface p-6 sm:p-8 lg:p-10 shadow-theme-card"
        >
          {contactError && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{contactError}</p>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-theme-text">
              {t('yourName')} <span className="text-red-500">*</span>
            </label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              placeholder={t('contactNamePh')}
              className="w-full rounded-theme-input border border-theme-border bg-theme-surface-secondary px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface lg:px-4 lg:py-3 lg:text-base transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-theme-text">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              placeholder={t('contactEmailPh')}
              className="w-full rounded-theme-input border border-theme-border bg-theme-surface-secondary px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface lg:px-4 lg:py-3 lg:text-base transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-theme-text">
              {t('message')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
              rows={5}
              placeholder={t('contactMessagePh')}
              className="w-full min-h-[7.5rem] resize-y rounded-theme-input border border-theme-border bg-theme-surface-secondary px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:outline-none focus:bg-theme-surface lg:px-4 lg:py-3 lg:text-base transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={contactSubmitting}
            className="w-full rounded-theme-btn bg-theme-primary py-3 text-sm font-semibold text-theme-primary-contrast shadow-theme-card hover:bg-theme-primary-hover disabled:opacity-60 lg:py-3.5 lg:text-base transition-theme"
          >
            {contactSubmitting ? t('sending') : t('sendMessage')}
          </button>
        </form>

        {hasDirectContactDetails && (
          <div className="mt-8 pt-8 border-t border-theme-border/60 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-theme-text-muted">
            {shop.footerPhone?.trim() && (
              <a
                href={`tel:${shop.footerPhone.trim()}`}
                className="inline-flex items-center gap-2 hover:text-theme-primary transition-colors text-inherit no-underline"
              >
                <Phone className="w-3.5 h-3.5 text-theme-primary" />
                <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
              </a>
            )}
            {shop.footerEmail?.trim() && (
              <a
                href={`mailto:${shop.footerEmail.trim()}`}
                className="inline-flex items-center gap-2 hover:text-theme-primary transition-colors text-inherit no-underline"
              >
                <Mail className="w-3.5 h-3.5 text-theme-primary" />
                <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
              </a>
            )}
            {localizedAddress.trim() && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                <span>{localizedAddress.trim()}</span>
              </span>
            )}
          </div>
        )}

        {contactLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {contactLinks.map((link, index) => (
              <a
                key={`${link.platform}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-theme-btn border border-theme-border bg-theme-surface px-3 py-1.5 text-xs font-medium text-theme-text no-underline hover:border-theme-primary hover:bg-theme-primary-light transition-colors"
              >
                <span style={{ color: getSocialBrandColor(link.platform) }}><SocialIcon platform={link.platform} /></span>
                <span className="capitalize">{link.platform}</span>
              </a>
            ))}
          </div>
        )}
      </main>
    );
  }

  // ── VARIANT 2: SPLIT-CARD (Default classic & catalog layout) ─────────────
  return (
    <main className={`${containerClass} flex-1 pt-4 pb-8 max-lg:pt-4 max-lg:pb-8 lg:pt-8 lg:pb-12`}>
      <section className="relative mb-5 max-lg:mb-5 overflow-hidden rounded-theme-card border border-theme-border bg-theme-surface p-5 shadow-theme-card max-lg:p-5 lg:mb-8 lg:p-10">
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-theme-badge border border-theme-border bg-theme-primary-light px-3 py-1 text-xs font-semibold text-theme-primary">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {t('contactBadge')}
          </p>
          <h2
            style={{ fontFamily: 'var(--theme-font-heading, inherit)' }}
            className="mt-3 text-2xl font-bold tracking-tight text-theme-text max-lg:leading-snug lg:mt-4 lg:text-3xl xl:text-4xl"
          >
            {t('contactTitle', { shopName: shop.shopName })}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-theme-text-muted lg:mt-3 lg:text-base">
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
                <h3
                  style={{ fontFamily: 'var(--theme-font-heading, inherit)' }}
                  className="mb-3 text-base font-bold text-theme-text max-lg:mb-3 lg:mb-4 lg:text-lg"
                >
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
                <h3
                  style={{ fontFamily: 'var(--theme-font-heading, inherit)' }}
                  className="mb-3 text-base font-bold text-theme-text max-lg:mb-3 lg:mb-4 lg:text-lg"
                >
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
          <h3
            style={{ fontFamily: 'var(--theme-font-heading, inherit)' }}
            className="text-base font-bold text-theme-text lg:text-xl"
          >
            {t('sendMessageTitle')}
          </h3>
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
            className="w-full rounded-theme-btn bg-theme-primary py-3 text-sm font-semibold text-theme-primary-contrast shadow-theme-card hover:bg-theme-primary-hover disabled:opacity-60 max-lg:py-3 lg:py-3.5 lg:text-base"
          >
            {contactSubmitting ? t('sending') : t('sendMessage')}
          </button>
        </form>
      </section>
    </main>
  );
}
