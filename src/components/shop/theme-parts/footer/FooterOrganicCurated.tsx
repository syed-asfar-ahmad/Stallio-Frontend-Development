import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, Leaf, ShieldCheck, Heart } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedFooterAddress } from '../../../../lib/shopContentLanguages';
import { getSocialBrandColor, SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import type { ThemeFooterProps } from '../types';

export default function FooterOrganicCurated({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { t, lang } = useShopLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const localizedAddress = getLocalizedFooterAddress(shop, lang);
  const socialLinks = (shop.footerSocialLinks ?? []).filter((l) => l?.url?.trim());

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  }

  return (
    <footer
      className="mt-auto border-t transition-colors duration-300"
      style={{
        borderColor: 'var(--theme-border)',
        background: 'linear-gradient(180deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
      }}
    >
      <div className={`${containerClass} py-12 lg:py-16`}>
        {/* ── Top Newsletter & Ethos Banner ── */}
        <div
          className="mb-12 p-6 sm:p-10 rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)]"
          style={{
            background: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full"
                style={{
                  background: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary)',
                }}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Join Our Organic Journal</span>
              </span>
              <h3
                className="text-xl sm:text-2xl lg:text-3xl font-normal leading-tight"
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                Receive seasonal rituals & botanical insights
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                Subscribe for private invitations, exclusive early releases, and mindful wellness guides.
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div
                  className="flex items-center gap-2 p-3.5 rounded-full border text-xs sm:text-sm font-semibold"
                  style={{
                    background: 'var(--theme-primary-light)',
                    borderColor: 'var(--theme-primary)',
                    color: 'var(--theme-primary)',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Welcome to our botanical circle!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-full border focus:outline-none transition-colors"
                    style={{
                      background: 'var(--theme-surface-secondary)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold rounded-full transition-all hover:opacity-90 active:scale-95 shadow-sm shrink-0"
                    style={{
                      background: 'var(--theme-primary)',
                      color: 'var(--theme-primary-contrast)',
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Subscribe</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Multi-Column Links Section ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Bio */}
          <div className="lg:col-span-4 space-y-4">
            <Link to={quickLinks[0]?.to ?? '#'} className="inline-block no-underline">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.shopName} className="h-9 w-auto max-w-[180px] object-contain" />
              ) : (
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: 'var(--theme-font-heading)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  {shop.shopName}
                </span>
              )}
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed max-w-sm" style={{ color: 'var(--theme-text-secondary)' }}>
              {shop.aboutContentPlain ||
                'Crafting mindful botanical goods and clean living essentials with care, precision, and pure intentions.'}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {socialLinks.map((link, idx) => (
                  <a
                    key={`${link.platform}-${idx}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border)',
                      color: getSocialBrandColor(link.platform),
                    }}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h4
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Explore Collection
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm list-none p-0 m-0">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="no-underline transition-colors hover:underline"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {shop.refundEnabled && (
                <li>
                  <Link
                    to={`${quickLinks[0]?.to || ''}/refund`}
                    className="no-underline transition-colors hover:underline"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {t('returnExchangePolicy')}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-3">
            <h4
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Studio & Direct Inquiries
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              {shop.footerEmail?.trim() && (
                <a
                  href={`mailto:${shop.footerEmail.trim()}`}
                  className="flex items-center gap-2.5 no-underline transition-colors"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                </a>
              )}
              {shop.footerPhone?.trim() && (
                <a
                  href={`tel:${shop.footerPhone.trim()}`}
                  className="flex items-center gap-2.5 no-underline transition-colors"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                </a>
              )}
              {localizedAddress.trim() && (
                <div
                  className="flex items-start gap-2.5"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
                  <span>{localizedAddress}</span>
                </div>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div
              className="flex flex-wrap items-center gap-4 pt-4 border-t"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                <span>100% Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                <Heart className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                <span>Cruelty Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Copyright Bar ── */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
        >
          <p>© {new Date().getFullYear()} {shop.shopName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>Stallio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
