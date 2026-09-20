import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import ThemeToggle from '../../../ThemeToggle';
import type { ThemeHeaderProps } from '../types';

export default function HeaderCenteredLogo({
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
  const { t, isRtl } = useShopLanguage();

  return (
    <header
      className="sticky top-0 z-50 border-b bg-[var(--theme-surface)]/95 backdrop-blur-md"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      {/* Announcement Bar */}
      {showAnnouncementBar && announcements.length > 0 && (
        <div
          className="py-1.5 px-4 text-center text-xs font-medium text-white tracking-wide"
          style={{ background: 'var(--theme-primary)' }}
        >
          {announcements[0]}
        </div>
      )}

      <div className={`${containerClass} py-3 sm:py-4`}>
        <div className="flex items-center justify-between">
          {/* Left: Navigation (Desktop) / Mobile Toggle */}
          <div className="flex items-center gap-4 flex-1">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-btn)] border lg:hidden"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
              aria-label={mobileMenuOpen ? t('navCloseMenu') : t('navOpenMenu')}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <nav className="hidden lg:flex items-center gap-6" aria-label={t('navStoreNav')}>
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-xs font-semibold uppercase tracking-wider transition-colors no-underline"
                  style={{
                    color: isNavActive(to) ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Brand Logo / Shop Name */}
          <div className="flex-shrink-0 text-center px-4">
            <Link to={`/${username}`} className="inline-block no-underline" aria-label={shop.shopName}>
              {shop.logo ? (
                <img src={shop.logo} alt="" className="h-9 sm:h-11 w-auto max-w-[140px] sm:max-w-[180px] object-contain mx-auto" />
              ) : (
                <span
                  className="text-lg sm:text-xl font-bold tracking-tight block"
                  style={{
                    color: 'var(--theme-text-primary)',
                    fontFamily: 'var(--theme-font-heading)',
                    letterSpacing: 'var(--theme-heading-spacing)',
                  }}
                >
                  {shop.shopName}
                </span>
              )}
            </Link>
          </div>

          {/* Right: Actions & Cart */}
          <div className="flex items-center justify-end gap-2 flex-1">
            <ShopLanguageToggle />
            <ThemeToggle className="h-8 w-8 sm:h-9 sm:w-9" />

            <button
              type="button"
              onClick={onOpenCheckout}
              className="inline-flex items-center gap-1.5 rounded-[var(--theme-radius-btn)] border px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
              style={
                cartCount > 0
                  ? { borderColor: 'transparent', background: 'var(--theme-primary)', color: '#ffffff' }
                  : { borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }
              }
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('navCart')}</span>
              <span
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                style={
                  cartCount > 0
                    ? { background: 'rgba(255,255,255,0.3)', color: '#ffffff' }
                    : { background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }
                }
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className={`${containerClass} pb-4 border-t`} style={{ borderColor: 'var(--theme-border)' }}>
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg no-underline transition-colors"
                style={{
                  color: isNavActive(to) ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                  background: isNavActive(to) ? 'var(--theme-surface-secondary)' : 'transparent',
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
