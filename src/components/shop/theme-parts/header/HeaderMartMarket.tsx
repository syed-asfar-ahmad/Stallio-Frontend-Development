import { Link } from 'react-router-dom';
import { Menu, Moon, Search, ShoppingBag, ShoppingCart, Sun, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../context/ThemeContext';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import { MART_DEEP, MART_ORANGE, MART_ORANGE_INK } from '../mart/MartParts';
import type { ThemeHeaderProps } from '../types';

/**
 * Mart marketplace header — deep-teal announcement bar, then a single white row:
 * logo · navigation · search icon, language, light/dark and cart.
 */
export default function HeaderMartMarket({
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

  const iconBtn =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--theme-surface-secondary)]';

  return (
    <>
      {showAnnouncementBar && announcements.length > 0 && (
        <aside
          aria-label={t('announcementsAria')}
          className="px-4 py-2 text-center text-[11px] font-medium sm:text-xs"
          style={{ background: MART_DEEP, color: '#fff' }}
        >
          {announcements[0]}
        </aside>
      )}

      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className={`${containerClass} flex h-16 items-center gap-6 lg:h-[4.5rem] lg:gap-10`}>
          <Link to={`/${username}`} className="flex min-w-0 shrink-0 items-center gap-2.5 no-underline" style={{ color: 'var(--theme-text-primary)' }}>
            {shop.logo ? (
              <img src={shop.logo} alt={shop.shopName} className="h-8 w-auto max-w-[150px] object-contain sm:max-w-[190px]" />
            ) : (
              <>
                <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: MART_ORANGE, color: MART_ORANGE_INK }}>
                  <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </span>
                <span className="truncate text-lg font-extrabold sm:text-xl" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}>
                  {shop.shopName}
                </span>
              </>
            )}
          </Link>

          <nav aria-label="Main Navigation" className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active = isNavActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className="relative py-2 text-[13px] font-medium no-underline transition-colors hover:text-[var(--theme-primary)]"
                  style={{ color: active ? 'var(--theme-primary)' : 'var(--theme-text-primary)' }}
                >
                  {link.label}
                  {active && <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full" style={{ background: MART_ORANGE }} />}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-1">
            <ShopLanguageToggle />
            <Link
              to={`/${username}/products`}
              aria-label={t('productsSearchAria')}
              title={t('productsSearchAria')}
              className={`${iconBtn} no-underline`}
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              onClick={toggleLightDark}
              aria-label={isDark ? tApp('layout.theme.switchToLight') : tApp('layout.theme.switchToDark')}
              title={isDark ? tApp('layout.theme.lightMode') : tApp('layout.theme.darkMode')}
              className={iconBtn}
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
            </button>
            <button type="button" onClick={onOpenCheckout} aria-label={t('navCart')} className={`${iconBtn} relative`} style={{ color: 'var(--theme-text-primary)' }}>
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none" style={{ background: MART_ORANGE, color: MART_ORANGE_INK }}>
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
          <div className="border-t px-3 pb-4 pt-2 lg:hidden" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isNavActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onCloseMobileMenu}
                    className="rounded-lg px-4 py-3 text-sm font-medium no-underline"
                    style={{ color: active ? 'var(--theme-primary)' : 'var(--theme-text-primary)', background: active ? 'var(--theme-primary-light)' : 'transparent' }}
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
