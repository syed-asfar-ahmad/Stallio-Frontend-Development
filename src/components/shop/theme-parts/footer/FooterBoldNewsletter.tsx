import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ShieldCheck, Truck, RotateCcw, MapPin, Phone, Mail } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getSocialBrandColor, SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { getLocalizedFooterDescription, getLocalizedFooterAddress } from '../../../../lib/shopContentLanguages';
import type { ThemeFooterProps } from '../types';

export default function FooterBoldNewsletter({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { t, lang } = useShopLanguage();
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  if (!shop.footerEnabled) return null;
  const links = shop.footerSocialLinks ?? [];
  const year = new Date().getFullYear();
  const copyrightText = t('footerCopyright', { year, shopName: shop.shopName });
  const localizedAddress = getLocalizedFooterAddress(shop, lang);
  const hasContact =
    localizedAddress.trim() || (shop.footerPhone && shop.footerPhone.trim()) || (shop.footerEmail && shop.footerEmail.trim());

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput('');
  };

  return (
    <footer
      className="mt-auto border-t"
      style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
    >
      <div className={`${containerClass} py-10 lg:py-16 space-y-12`}>
        {/* Newsletter & Club Callout Section */}
        <div
          className="rounded-[var(--theme-radius-card)] p-6 sm:p-8 lg:p-10 border shadow-[var(--theme-shadow-card)]"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface-secondary)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-2">
              <span
                className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md tracking-wider inline-block text-white"
                style={{ background: 'var(--theme-primary)' }}
              >
                Join the Community
              </span>
              <h3
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight"
                style={{
                  color: 'var(--theme-text-primary)',
                  fontFamily: 'var(--theme-font-heading)',
                }}
              >
                Stay ahead of new drops & offers
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                Subscribe to get exclusive member discounts and early product access.
              </p>
            </div>

            <div className="lg:col-span-6">
              {subscribed ? (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Thank you! You are subscribed to updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 px-4 py-2.5 rounded-[var(--theme-radius-input)] border text-sm outline-none transition-all focus:border-[var(--theme-primary)]"
                    style={{
                      borderColor: 'var(--theme-border)',
                      background: 'var(--theme-surface)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-[var(--theme-radius-btn)] font-bold text-xs text-white flex items-center gap-1.5 transition-all hover:opacity-90 shrink-0"
                    style={{ background: 'var(--theme-primary)' }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Links & Brand Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              {shop.footerLogo ? (
                <img src={shop.footerLogo} alt="" className="h-10 w-10 object-contain rounded" />
              ) : (
                <span
                  className="w-10 h-10 rounded-[var(--theme-radius-card)] flex items-center justify-center font-bold text-white text-base"
                  style={{ background: 'var(--theme-primary)' }}
                >
                  {shop.shopName.charAt(0)}
                </span>
              )}
              <h4
                className="text-base font-bold"
                style={{
                  color: 'var(--theme-text-primary)',
                  fontFamily: 'var(--theme-font-heading)',
                }}
              >
                {shop.shopName}
              </h4>
            </div>
            {getLocalizedFooterDescription(shop, lang) && (
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                {getLocalizedFooterDescription(shop, lang)}
              </p>
            )}

            {/* Social Links */}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg border flex items-center justify-center transition-transform hover:scale-105"
                    style={{
                      borderColor: 'var(--theme-border)',
                      background: 'var(--theme-surface)',
                      color: getSocialBrandColor(link.platform),
                    }}
                    aria-label={link.platform}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation Col */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              {t('footerQuickLinks')}
            </h5>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-xs sm:text-sm no-underline transition-colors hover:underline"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-5 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              {t('footerContactSocial')}
            </h5>
            {hasContact ? (
              <div className="space-y-2 text-xs sm:text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                {localizedAddress.trim() && (
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
                    <span dir={lang === 'ar' ? 'rtl' : 'ltr'}>{localizedAddress}</span>
                  </p>
                )}
                {shop.footerPhone?.trim() && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                    <a href={`tel:${shop.footerPhone.trim()}`} className="no-underline hover:underline" style={{ color: 'var(--theme-text-secondary)' }}>
                      <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                    </a>
                  </p>
                )}
                {shop.footerEmail?.trim() && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                    <a href={`mailto:${shop.footerEmail.trim()}`} className="no-underline hover:underline break-all" style={{ color: 'var(--theme-text-secondary)' }}>
                      <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                {t('footerContactEmpty')}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}>
          <p>{copyrightText}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              Tracked Shipping
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
