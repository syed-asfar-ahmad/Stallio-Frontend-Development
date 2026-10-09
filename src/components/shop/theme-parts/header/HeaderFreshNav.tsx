import { Link } from 'react-router-dom';
import { Menu, Moon, Phone, Search, ShoppingBag, Sun, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../context/ThemeContext';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import { SocialIcon } from '../../../SocialIcons';
import ContactLtrText from '../../../ContactLtrText';
import { FRESH_INK, FRESH_LIME, FRESH_LIME_SOFT } from '../fresh/FreshParts';
import type { ThemeHeaderProps } from '../types';

/**
 * Fresh header — lime announcement strip (social · message · phone) above a sage bar with a serif
 * wordmark, centered navigation with a lime active underline, and icon actions.
 */
export default function HeaderFreshNav({
  shop,
  username,
  navLinks,
  isNavActive,
  cartCount,
  onOpenCheckout,
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  announcements,
  showAnnouncementBar,
  containerClass,
}: ThemeHeaderProps) {
  const { t } = useShopLanguage();
  const { t: tApp } = useTranslation();
  const { resolved, toggleLightDark } = useTheme();
  const isDark = resolved === 'dark';

  const socials = (shop.footerSocialLinks ?? []).filter((l) => l?.url?.trim()).slice(0, 3);
  const phone = shop.footerPhone?.trim();
  const showBar = showAnnouncementBar && announcements.length > 0;

  const iconBtn = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--theme-primary-light)]';

  return (
    <>
      {showBar && (
        <aside aria-label={t('announcementsAria')} style={{ background: FRESH_LIME_SOFT, color: FRESH_INK }}>
          <div className={`${containerClass} grid grid-cols-1 items-center py-2 text-[11px] font-medium sm:text-xs lg:grid-cols-[1fr_auto_1fr]`}>
            <div className="hidden items-center gap-2.5 lg:flex">
              {socials.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.platform} className="flex h-5 w-5 items-center justify-center opacity-80 transition-opacity hover:opacity-100">
                  <SocialIcon platform={l.platform} />
                </a>
              ))}
            </div>
            <p className="text-center">{announcements[0]}</p>
            <div className="hidden justify-end lg:flex">
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 no-underline" style={{ color: FRESH_INK }}>
                  <Phone className="h-3 w-3" aria-hidden />
                  <ContactLtrText>{phone}</ContactLtrText>
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      )}

      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--theme-surface-secondary) 92%, transparent)' }}>
        <div className={`${containerClass} grid h-16 grid-cols-[1fr_auto] items-center gap-4 lg:h-[4.5rem] lg:grid-cols-[1fr_auto_1fr]`}>
          <Link to={`/${username}`} className="flex min-w-0 items-center no-underline" style={{ color: 'var(--theme-text-primary)' }}>
            {shop.logo ? (
              <img src={shop.logo} alt={shop.shopName} className="h-8 w-auto max-w-[150px] object-contain sm:h-9 sm:max-w-[190px]" />
            ) : (
              <span className="truncate text-[1.65rem] font-semibold leading-none" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.04em' }}>
                {shop.shopName}
              </span>
            )}
          </Link>

          <nav aria-label="Main Navigation" className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => {
              const active = isNavActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className="relative py-1.5 text-[13px] font-medium no-underline transition-colors"
                  style={{ color: 'var(--theme-text-primary)', opacity: active ? 1 : 0.72 }}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0'}`}
                    style={{ background: FRESH_LIME }}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-0.5">
            <ShopLanguageToggle />
            <Link to={`/${username}/products`} aria-label={t('productsSearchAria')} className={`${iconBtn} no-underline`} style={{ color: 'var(--theme-text-primary)' }}>
              <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              onClick={toggleLightDark}
              aria-label={isDark ? tApp('layout.theme.switchToLight') : tApp('layout.theme.switchToDark')}
              title={isDark ? tApp('layout.theme.lightMode') : tApp('layout.theme.darkMode')}
              className={iconBtn}
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />}
            </button>
            <button type="button" onClick={onOpenCheckout} aria-label={t('navCart')} className={`${iconBtn} relative`} style={{ color: 'var(--theme-text-primary)' }}>
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none" style={{ background: FRESH_LIME, color: FRESH_INK }}>
                  {cartCount}
                </span>
              )}
            </button>
            <button type="button" onClick={onToggleMobileMenu} aria-expanded={mobileMenuOpen} aria-label={t('navMenu')} className={`${iconBtn} lg:hidden`} style={{ color: 'var(--theme-text-primary)' }}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="px-3 pb-4 lg:hidden">
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-1 rounded-2xl border p-2" style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              {navLinks.map((link) => {
                const active = isNavActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onCloseMobileMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium no-underline"
                    style={{ color: 'var(--theme-text-primary)', background: active ? 'var(--theme-primary-light)' : 'transparent' }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
