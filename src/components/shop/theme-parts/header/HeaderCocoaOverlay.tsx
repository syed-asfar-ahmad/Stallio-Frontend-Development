import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../context/ThemeContext';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import { getLocalizedHomeHeroTitle, getLocalizedHomeIntro } from '../../../../lib/shopContentLanguages';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import type { ThemeHeaderProps } from '../types';

const CREAM = '#fbf3e4';

/**
 * Cocoa Overlay header.
 * - On the home page (with the hero enabled) the bar is transparent and floats over the photograph.
 * - Everywhere else it becomes a solid, sticky deep-cocoa bar so pages stay legible.
 */
export default function HeaderCocoaOverlay({
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
  const { t, lang } = useShopLanguage();
  const { pathname } = useLocation();
  const { t: tApp } = useTranslation();
  const { resolved, toggleLightDark } = useTheme();
  const isDark = resolved === 'dark';

  const isHome = pathname === `/${username}` || pathname === `/${username}/`;
  const heroVisible = Boolean(
    shop.homeHeroEnabled &&
      (getLocalizedHomeHeroTitle(shop, lang) || getLocalizedHomeIntro(shop, lang) || shop.homeHeroImage),
  );
  const overlay = isHome && heroVisible;

  const solidBg = 'color-mix(in srgb, var(--theme-primary) 38%, #1a0f07)';

  return (
    <>
      {showAnnouncementBar && announcements.length > 0 && (
        <aside
          aria-label={t('announcementsAria')}
          className="relative z-50 px-4 py-2 text-center text-xs font-medium"
          style={{ background: '#1f130b', color: CREAM }}
        >
          {announcements[0]}
        </aside>
      )}

      <header className={overlay ? 'relative z-40 h-0' : 'sticky top-0 z-40'}>
        <div
          className={overlay ? 'absolute inset-x-0 top-0' : 'backdrop-blur-md'}
          style={overlay ? undefined : { background: solidBg }}
        >
          <div
            className={`${containerClass} grid h-[4.5rem] grid-cols-[1fr_auto] items-center gap-6 lg:h-[5.25rem] lg:grid-cols-[1fr_auto_1fr]`}
            style={{ color: CREAM }}
          >
            {/* Brand */}
            <Link to={`/${username}`} className="flex min-w-0 items-center gap-2.5 no-underline" style={{ color: CREAM }}>
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.shopName}
                  className="h-8 w-auto max-w-[150px] object-contain sm:h-9 sm:max-w-[190px]"
                />
              ) : (
                <>
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[3px]"
                    style={{ borderColor: CREAM }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: CREAM }} />
                  </span>
                  <span
                    className="truncate text-xl font-semibold leading-none sm:text-2xl"
                    style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
                  >
                    {shop.shopName}
                  </span>
                </>
              )}
            </Link>

            {/* Primary navigation */}
            <nav aria-label="Main Navigation" className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => {
                const active = isNavActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    className="group relative py-1 text-[13px] font-medium no-underline transition-opacity"
                    style={{ color: CREAM, opacity: active ? 1 : 0.82 }}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                        active ? '!scale-x-100' : ''
                      }`}
                      style={{ background: CREAM }}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <ShopLanguageToggle />
              <button
                type="button"
                onClick={toggleLightDark}
                aria-label={isDark ? tApp('layout.theme.switchToLight') : tApp('layout.theme.switchToDark')}
                title={isDark ? tApp('layout.theme.lightMode') : tApp('layout.theme.darkMode')}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: CREAM }}
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />}
              </button>
              <Link
                to={`/${username}/products`}
                aria-label={t('productsSearchAria')}
                className="flex h-10 w-10 items-center justify-center rounded-full no-underline transition-colors hover:bg-white/10"
                style={{ color: CREAM }}
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </Link>
              <button
                type="button"
                onClick={onOpenCheckout}
                aria-label={t('navCart')}
                className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: CREAM }}
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span
                    className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none"
                    style={{ background: CREAM, color: '#2b1b10' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-expanded={mobileMenuOpen}
                aria-label={t('navMenu')}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 lg:hidden"
                style={{ color: CREAM }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="absolute inset-x-0 top-full px-3 pb-4 pt-1 lg:hidden">
            <nav
              aria-label="Mobile Navigation"
              className="flex flex-col gap-1 rounded-2xl p-3 shadow-2xl"
              style={{ background: '#24160c', border: '1px solid rgb(251 243 228 / 0.12)' }}
            >
              {navLinks.map((link) => {
                const active = isNavActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onCloseMobileMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium no-underline transition-colors"
                    style={{
                      color: CREAM,
                      background: active ? 'rgb(251 243 228 / 0.12)' : 'transparent',
                    }}
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