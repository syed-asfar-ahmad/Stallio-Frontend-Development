import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import type { ThemeHeaderProps } from '../types';

export default function HeaderFloatingCapsule({
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

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* ── Top Announcement Bar (if enabled) ── */}
      {showAnnouncementBar && announcements.length > 0 && (
        <aside
          aria-label={t('announcementsAria')}
          className="relative z-50 overflow-hidden py-1.5 px-4 text-center text-xs font-semibold tracking-wide border-b"
          style={{
            background: 'var(--theme-primary)',
            color: 'var(--theme-primary-contrast)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span>✨ {announcements[0]}</span>
          </div>
        </aside>
      )}

      {/* ── Floating Capsule Navigation Bar ── */}
      <div className={`${containerClass} pt-2.5 pb-2`}>
        <div
          className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6 sm:py-3 rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)] backdrop-blur-xl transition-all duration-300"
          style={{
            background: 'color-mix(in srgb, var(--theme-surface) 88%, transparent)',
            borderColor: 'var(--theme-border)',
          }}
        >
          {/* Brand Logo / Name */}
          <Link
            to={`/${username}`}
            className="flex items-center gap-2.5 no-underline transition-opacity hover:opacity-90 shrink-0"
          >
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.shopName}
                className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[180px] object-contain"
              />
            ) : (
              <span
                className="text-lg sm:text-2xl font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  color: 'var(--theme-text-primary)',
                  letterSpacing: 'var(--theme-heading-spacing)',
                }}
              >
                {shop.shopName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1.5 p-1 rounded-full border"
            style={{
              background: 'var(--theme-surface-secondary)',
              borderColor: 'var(--theme-border)',
            }}
          >
            {navLinks.map((link) => {
              const active = isNavActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-1.5 text-xs font-semibold rounded-full no-underline transition-all duration-200"
                  style={
                    active
                      ? {
                          background: 'var(--theme-primary)',
                          color: 'var(--theme-primary-contrast)',
                          boxShadow: 'var(--theme-shadow-card)',
                        }
                      : {
                          color: 'var(--theme-text-secondary)',
                        }
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ShopLanguageToggle />

            {/* Cart Capsule Button */}
            <button
              type="button"
              onClick={onOpenCheckout}
              aria-label={t('navCart')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-sm"
              style={{
                background: 'var(--theme-primary)',
                color: 'var(--theme-primary-contrast)',
              }}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">{t('navCart')}</span>
              <span
                className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[11px] font-extrabold rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--theme-primary-contrast) 20%, transparent)',
                  color: 'var(--theme-primary-contrast)',
                }}
              >
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label={t('navMenu')}
              className="lg:hidden p-2 rounded-full border transition-colors"
              style={{
                background: 'var(--theme-surface-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown / Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className="p-4 rounded-[var(--theme-radius-card)] border shadow-xl flex flex-col gap-2"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            {navLinks.map((link) => {
              const active = isNavActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onCloseMobileMenu}
                  className="px-4 py-2.5 text-sm font-semibold rounded-full no-underline transition-all"
                  style={
                    active
                      ? {
                          background: 'var(--theme-primary)',
                          color: 'var(--theme-primary-contrast)',
                        }
                      : {
                          color: 'var(--theme-text-primary)',
                          background: 'var(--theme-surface-secondary)',
                        }
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
