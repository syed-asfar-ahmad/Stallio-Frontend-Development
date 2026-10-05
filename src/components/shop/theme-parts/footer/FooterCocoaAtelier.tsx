import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { formatHoursRange, hasFooterAvailability, normalizeAvailabilityHours } from '../../../../lib/shopAvailability';
import { getLocalizedFooterAddress, getLocalizedFooterDescription } from '../../../../lib/shopContentLanguages';
import { shopWeekdayKey } from '../../../../lib/shopUiTranslations';
import type { ThemeFooterProps } from '../types';

const CREAM = '#f7ead4';
const SOFT = 'rgb(247 234 212 / 0.66)';
const HAIR = 'rgb(247 234 212 / 0.14)';

/**
 * Cocoa Atelier footer — deep espresso, cream type, and an oversized serif wordmark
 * that closes the page the way the hero opens it.
 */
export default function FooterCocoaAtelier({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { t, lang } = useShopLanguage();
  if (!shop.footerEnabled) return null;

  const socials = (shop.footerSocialLinks ?? []).filter((l) => l?.url?.trim());
  const description = getLocalizedFooterDescription(shop, lang);
  const address = getLocalizedFooterAddress(shop, lang);
  const phone = shop.footerPhone?.trim();
  const email = shop.footerEmail?.trim();
  const hasContact = Boolean(address.trim() || phone || email);
  const showHours = hasFooterAvailability(shop.availabilityEnabled, shop.availabilityHours);
  const schedule = normalizeAvailabilityHours(shop.availabilityHours);
  const year = new Date().getFullYear();

  const heading = 'mb-4 text-[13px] font-semibold';

  return (
    <footer
      className="relative mt-auto overflow-hidden"
      style={{ background: 'color-mix(in srgb, var(--theme-primary) 22%, #1a0f07)', color: CREAM }}
    >
      <div className={`${containerClass} relative z-10 pb-6 pt-14 lg:pt-20`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              {shop.footerLogo ? (
                <img src={shop.footerLogo} alt="" className="h-12 w-12 shrink-0 object-contain" />
              ) : null}
              <h3
                className="text-3xl font-semibold leading-none lg:text-4xl"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em', color: CREAM }}
              >
                {shop.footerTitle?.trim() || shop.shopName}
              </h3>
            </div>
            {description ? (
              <p className="mt-5 max-w-sm text-sm leading-relaxed" style={{ color: SOFT }}>
                {description}
              </p>
            ) : null}
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white/10"
                    style={{ borderColor: HAIR, color: CREAM }}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <nav aria-label={t('footerQuickLinks')} className="lg:col-span-2">
            <h4 className={heading} style={{ color: CREAM }}>
              {t('footerQuickLinks')}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm no-underline transition-colors hover:text-white"
                    style={{ color: SOFT }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hours */}
          {showHours ? (
            <div className="lg:col-span-2">
              <h4 className={heading} style={{ color: CREAM }}>
                {t('footerOpeningHours')}
              </h4>
              <ul className="space-y-2 text-[13px]">
                {schedule.map((slot) => (
                  <li key={slot.day} className="flex justify-between gap-3" style={{ color: SOFT }}>
                    <span style={{ color: CREAM }}>{t(shopWeekdayKey(slot.day))}</span>
                    <span dir={slot.enabled ? 'ltr' : undefined} className="tabular-nums [unicode-bidi:isolate]">
                      {slot.enabled
                        ? shop.availability24Hours
                          ? t('footerOpen24Hours')
                          : formatHoursRange(slot.openTime, slot.closeTime)
                        : t('footerClosedDay')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Contact */}
          <div className={showHours ? 'lg:col-span-3' : 'lg:col-span-5'}>
            <h4 className={heading} style={{ color: CREAM }}>
              {t('footerContactSocial')}
            </h4>
            {hasContact ? (
              <ul className="space-y-3 text-sm" style={{ color: SOFT }}>
                {address.trim() && (
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: CREAM }} aria-hidden />
                    <span dir={lang === 'ar' ? 'rtl' : 'ltr'}>{address}</span>
                  </li>
                )}
                {phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0" style={{ color: CREAM }} aria-hidden />
                    <a href={`tel:${phone}`} className="no-underline hover:text-white" style={{ color: SOFT }}>
                      <ContactLtrText>{phone}</ContactLtrText>
                    </a>
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0" style={{ color: CREAM }} aria-hidden />
                    <a href={`mailto:${email}`} className="break-all no-underline hover:text-white" style={{ color: SOFT }}>
                      <ContactLtrText>{email}</ContactLtrText>
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: SOFT }}>
                {t('footerContactEmpty')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: HAIR, color: SOFT }}>
          <p>{t('footerCopyright', { year, shopName: shop.shopName })}</p>
        </div>
      </div>

      {/* Oversized wordmark */}
      <p
        aria-hidden
        className="pointer-events-none relative z-0 -mt-4 select-none whitespace-nowrap px-4 text-center font-semibold leading-[0.8] lg:-mt-8"
        style={{
          fontFamily: 'var(--theme-font-heading)',
          fontSize: 'clamp(4rem, 17vw, 15rem)',
          letterSpacing: '-0.05em',
          color: 'rgb(247 234 212 / 0.07)',
          transform: 'translateY(18%)',
        }}
      >
        {shop.shopName}
      </p>
    </footer>
  );
}
