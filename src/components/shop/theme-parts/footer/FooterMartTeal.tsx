import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { useShop } from '../../../../context/ShopContext';
import { SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { formatHoursRange, hasFooterAvailability, normalizeAvailabilityHours } from '../../../../lib/shopAvailability';
import { getLocalizedFooterAddress, getLocalizedFooterDescription } from '../../../../lib/shopContentLanguages';
import { shopWeekdayKey } from '../../../../lib/shopUiTranslations';
import { MART_DEEP, MART_HAIR, MART_ORANGE, MART_ORANGE_INK, MART_SOFT, MART_TEXT } from '../mart/MartParts';
import type { ThemeFooterProps } from '../types';

/** Mart footer — deep teal, white type, orange accents. */
export default function FooterMartTeal({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { t, lang } = useShopLanguage();
  const { username } = useShop();
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
  const heading = 'mb-4 text-sm font-bold';

  return (
    <footer className="mt-auto" style={{ background: MART_DEEP, color: MART_TEXT }}>
      <div className={`${containerClass} pb-6 pt-12 lg:pt-16`}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              {shop.footerLogo ? (
                <img src={shop.footerLogo} alt="" className="h-10 w-10 shrink-0 object-contain" />
              ) : (
                <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: MART_ORANGE, color: MART_ORANGE_INK }}>
                  <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </span>
              )}
              <h3 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}>
                {shop.footerTitle?.trim() || shop.shopName}
              </h3>
            </div>
            {description ? <p className="mt-5 max-w-sm text-sm leading-relaxed" style={{ color: MART_SOFT }}>{description}</p> : null}
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-[#f5a623] hover:bg-[#f5a623] hover:text-[#2a1a00]"
                    style={{ borderColor: MART_HAIR, color: MART_TEXT }}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label={t('footerQuickLinks')} className="lg:col-span-2">
            <h4 className={heading}>{t('footerQuickLinks')}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm no-underline transition-colors hover:text-[#f5a623]" style={{ color: MART_SOFT }}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={`/${username}/products`} className="text-sm no-underline transition-colors hover:text-[#f5a623]" style={{ color: MART_SOFT }}>
                  {t('allProductsTitle')}
                </Link>
              </li>
            </ul>
          </nav>

          {showHours ? (
            <div className="lg:col-span-3">
              <h4 className={heading}>{t('footerOpeningHours')}</h4>
              <ul className="space-y-2 text-[13px]">
                {schedule.map((slot) => (
                  <li key={slot.day} className="flex justify-between gap-3" style={{ color: MART_SOFT }}>
                    <span style={{ color: MART_TEXT }}>{t(shopWeekdayKey(slot.day))}</span>
                    <span dir={slot.enabled ? 'ltr' : undefined} className="tabular-nums [unicode-bidi:isolate]">
                      {slot.enabled ? (shop.availability24Hours ? t('footerOpen24Hours') : formatHoursRange(slot.openTime, slot.closeTime)) : t('footerClosedDay')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={showHours ? 'lg:col-span-3' : 'lg:col-span-6'}>
            <h4 className={heading}>{t('footerContactSocial')}</h4>
            {hasContact ? (
              <ul className="space-y-3 text-sm" style={{ color: MART_SOFT }}>
                {address.trim() && (
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: MART_ORANGE }} aria-hidden />
                    <span dir={lang === 'ar' ? 'rtl' : 'ltr'}>{address}</span>
                  </li>
                )}
                {phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0" style={{ color: MART_ORANGE }} aria-hidden />
                    <a href={`tel:${phone}`} className="no-underline hover:text-white" style={{ color: MART_SOFT }}><ContactLtrText>{phone}</ContactLtrText></a>
                  </li>
                )}
                {email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0" style={{ color: MART_ORANGE }} aria-hidden />
                    <a href={`mailto:${email}`} className="break-all no-underline hover:text-white" style={{ color: MART_SOFT }}><ContactLtrText>{email}</ContactLtrText></a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: MART_SOFT }}>{t('footerContactEmpty')}</p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t pt-5 text-xs" style={{ borderColor: MART_HAIR, color: MART_SOFT }}>
          {t('footerCopyright', { year, shopName: shop.shopName })}
        </div>
      </div>
    </footer>
  );
}
