import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getSocialBrandColor, SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import {
  formatHoursRange,
  hasFooterAvailability,
  normalizeAvailabilityHours,
} from '../../../../lib/shopAvailability';
import { getLocalizedFooterDescription, getLocalizedFooterAddress } from '../../../../lib/shopContentLanguages';
import { shopWeekdayKey } from '../../../../lib/shopUiTranslations';
import type { ThemeFooterProps } from '../types';

export default function FooterMultiColumn({ shop, quickLinks, containerClass }: ThemeFooterProps) {
  const { t, lang } = useShopLanguage();
  if (!shop.footerEnabled) return null;
  const links = shop.footerSocialLinks ?? [];
  const year = new Date().getFullYear();
  const copyrightText = t('footerCopyright', { year, shopName: shop.shopName });
  const localizedAddress = getLocalizedFooterAddress(shop, lang);
  const hasContact =
    localizedAddress.trim() || (shop.footerPhone && shop.footerPhone.trim()) || (shop.footerEmail && shop.footerEmail.trim());
  const showAvailability = hasFooterAvailability(shop.availabilityEnabled, shop.availabilityHours);
  const availabilitySchedule = normalizeAvailabilityHours(shop.availabilityHours);

  return (
    <footer className="mt-auto border-t" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface-secondary)' }}>
      <div className={`${containerClass} py-6 lg:py-10`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-x-6">
          <div className="min-w-0 max-lg:w-full lg:max-w-xs">
            <div className="flex items-center gap-3">
              {shop.footerLogo ? (
                <img src={shop.footerLogo} alt="" className="h-12 w-12 shrink-0 object-contain lg:h-16 lg:w-16" />
              ) : (
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--theme-radius-card)] text-white lg:h-14 lg:w-14"
                  style={{ background: 'var(--theme-primary)' }}
                >
                  <MapPin className="h-5 w-5 lg:h-6 lg:w-6" />
                </span>
              )}
              <h3 className="text-base font-bold lg:text-lg" style={{ color: 'var(--theme-text-primary)' }}>
                {shop.shopName}
              </h3>
            </div>
            {getLocalizedFooterDescription(shop, lang) ? (
              <p className="mt-1.5 max-w-md text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                {getLocalizedFooterDescription(shop, lang)}
              </p>
            ) : null}
          </div>

          <div className="min-w-0 shrink-0 max-lg:w-full">
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider lg:mb-3" style={{ color: 'var(--theme-text-muted)' }}>
              {t('footerQuickLinks')}
            </h4>
            <div className="grid grid-cols-1 gap-0.5 max-lg:grid-cols-2 max-lg:gap-x-2 lg:flex lg:flex-col">
              {quickLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group inline-flex items-center gap-2 rounded-[var(--theme-radius-btn)] px-2 py-2 text-sm font-medium no-underline transition-colors"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--theme-radius-btn)]"
                    style={{ background: 'var(--theme-surface)', color: 'var(--theme-primary)' }}
                  >
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {showAvailability ? (
            <div className="min-w-0 shrink-0 max-lg:w-full">
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider lg:mb-3" style={{ color: 'var(--theme-text-muted)' }}>
                {t('footerOpeningHours')}
              </h4>
              <ul className="space-y-1.5 text-sm lg:space-y-2">
                {availabilitySchedule.map((slot) => (
                  <li key={slot.day} className="flex items-start gap-2 lg:gap-3" style={{ color: 'var(--theme-text-secondary)' }}>
                    <span className="min-w-0 shrink-0 font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {t(shopWeekdayKey(slot.day))}
                    </span>
                    <span
                      dir={slot.enabled ? 'ltr' : undefined}
                      className={`min-w-0 flex-1 ${slot.enabled ? 'text-end tabular-nums [unicode-bidi:isolate]' : 'text-center font-medium'}`}
                    >
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

          <div className="min-w-0 shrink-0 max-lg:w-full lg:max-w-xs">
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider lg:mb-3" style={{ color: 'var(--theme-text-muted)' }}>
              {t('footerContactSocial')}
            </h4>
            {hasContact ? (
              <div className="space-y-2.5 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                {localizedAddress.trim() && (
                  <p className="flex items-start gap-2 leading-relaxed">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--theme-primary)' }} aria-hidden />
                    <span className="min-w-0 flex-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      {localizedAddress}
                    </span>
                  </p>
                )}
                {shop.footerPhone?.trim() && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-primary)' }} aria-hidden />
                    <a href={`tel:${shop.footerPhone.trim()}`} className="no-underline" style={{ color: 'var(--theme-text-secondary)' }}>
                      <ContactLtrText>{shop.footerPhone.trim()}</ContactLtrText>
                    </a>
                  </p>
                )}
                {shop.footerEmail?.trim() && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" style={{ color: 'var(--theme-primary)' }} aria-hidden />
                    <a
                      href={`mailto:${shop.footerEmail.trim()}`}
                      className="min-w-0 flex-1 break-all no-underline"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      <ContactLtrText>{shop.footerEmail.trim()}</ContactLtrText>
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                {t('footerContactEmpty')}
              </p>
            )}

            {links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 lg:mt-4">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-btn)] border lg:h-10 lg:w-10"
                    style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: getSocialBrandColor(link.platform) }}
                    aria-label={link.platform}
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 border-t pt-4 lg:mt-7 lg:pt-5" style={{ borderColor: 'var(--theme-border)' }}>
          <p className="text-center text-xs leading-relaxed lg:text-sm" style={{ color: 'var(--theme-text-muted)' }}>
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
