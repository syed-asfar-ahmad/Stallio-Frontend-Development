import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { formatHoursRange, hasFooterAvailability, normalizeAvailabilityHours } from '../../../../lib/shopAvailability';
import { getLocalizedFooterAddress, getLocalizedFooterDescription } from '../../../../lib/shopContentLanguages';
import { shopWeekdayKey } from '../../../../lib/shopUiTranslations';
import { FRESH_CREAM, FRESH_INK, FRESH_LIME } from '../fresh/FreshParts';
import type { ThemeFooterProps } from '../types';

const SOFT = 'rgb(246 241 233 / 0.68)';
const HAIR = 'rgb(246 241 233 / 0.14)';

/** Fresh footer — espresso with cream type, serif wordmark and lime accents. */
export default function FooterFreshSage({ shop, quickLinks, containerClass }: ThemeFooterProps) {
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
  const heading = 'mb-4 text-sm font-semibold';

  return (
    <footer className="mt-auto" style={{ background: FRESH_INK, color: FRESH_CREAM }}>
      <div className={`${containerClass} pb-6 pt-14 lg:pt-20`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              {shop.footerLogo ? <img src={shop.footerLogo} alt="" className="h-11 w-11 shrink-0 object-contain" /> : null}
              <h3 className="text-3xl font-semibold leading-none" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.04em' }}>
                {shop.footerTitle?.trim() || shop.shopName}
              </h3>
            </div>
            {description ? <p className="mt-5 max-w-sm text-sm leading-relaxed" style={{ color: SOFT }}>{description}</p> : null}
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-[#a0d422] hover:bg-[#a0d422] hover:text-[#1e1611]"
                    style={{ borderColor: HAIR, color: FRESH_CREAM }}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label={t('footerQuickLinks')} className="lg:col-span-2">
            <h4 className={heading} style={{ color: FRESH_LIME }}>{t('footerQuickLinks')}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm no-underline transition-colors hover:text-white" style={{ color: SOFT }}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {showHours ? (
            <div className="lg:col-span-3">
              <h4 className={heading} style={{ color: FRESH_LIME }}>{t('footerOpeningHours')}</h4>
              <ul className="space-y-2 text-[13px]">
                {schedule.map((slot) => (
                  <li key={slot.day} className="flex justify-between gap-3" style={{ color: SOFT }}>
                    <span style={{ color: FRESH_CREAM }}>{t(shopWeekdayKey(slot.day))}</span>
                    <span dir={slot.enabled ? 'ltr' : undefined} className="tabular-nums [unicode-bidi:isolate]">
                      {slot.enabled ? (shop.availability24Hours ? t('footerOpen24Hours') : formatHoursRange(slot.openTime, slot.closeTime)) : t('footerClosedDay')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={showHours ? 'lg:col-span-3' : 'lg:col-span-6'}>
            <h4 className={heading} style={{ color: FRESH_LIME }}>{t('footerContactSocial')}</h4>
            {hasContact ? (
              <ul className="space-y-3 text-sm" style={{ color: SOFT }}>
                {address.trim() && (
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: FRESH_LIME }} aria-hidden />
                    <span dir={lang === 'ar' ? 'rtl' : 'ltr'}>{address}</span>
                  </li>
                )}
                {phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0" style={{ color: FRESH_LIME }} aria-hidden />
                    <a href={`tel:${phone}`} className="no-underline hover:text-white" style={{ color: SOFT }}><ContactLtrText>{phone}</ContactLtrText></a>
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0" style={{ color: FRESH_LIME }} aria-hidden />
                    <a href={`mailto:${email}`} className="break-all no-underline hover:text-white" style={{ color: SOFT }}><ContactLtrText>{email}</ContactLtrText></a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: SOFT }}>{t('footerContactEmpty')}</p>
            )}
          </div>
        </div>

        <div className="mt-14 border-t pt-5 text-xs" style={{ borderColor: HAIR, color: SOFT }}>
          {t('footerCopyright', { year, shopName: shop.shopName })}
        </div>
      </div>
    </footer>
  );
}
