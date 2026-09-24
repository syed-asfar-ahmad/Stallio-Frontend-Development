import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import ThemeToggle from '../../../ThemeToggle';
import type { ThemeHeaderProps } from '../types';

export default function HeaderInlineCompact({
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
    <header
      className="sticky top-0 z-50 border-b bg-[var(--theme-surface)]/95 backdrop-blur-md"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      {showAnnouncementBar && announcements.length > 0 && (
        <div
          className="py-1 px-3 text-center text-[11px] font-semibold text-white truncate"
          style={{ background: 'var(--theme-primary)' }}
        >
          {announcements[0]}
        </div>
      )}

      <div className={`${containerClass} flex items-center justify-between gap-3 py-2 sm:py-2.5`}>
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border lg:hidden"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
            aria-label={mobileMenuOpen ? t('navCloseMenu') : t('navOpenMenu')}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Link to={`/${username}`} className="flex items-center gap-2 no-underline" aria-label={shop.shopName}>
            {shop.logo ? (
              <img src={shop.logo} alt="" className="h-7 w-7 object-contain rounded" />
            ) : (
              <span
                className="w-7 h-7 flex items-center justify-center text-white rounded font-bold text-xs"
                style={{ background: 'var(--theme-primary)' }}
              >
                {shop.shopName.charAt(0)}
              </span>
            )}
            <span
              className="text-sm font-bold tracking-tight line-clamp-1"
              style={{
                color: 'var(--theme-text-primary)',
                fontFamily: 'var(--theme-font-heading)',
              }}
            >
              {shop.shopName}
            </span>
          </Link>
        </div>

        {/* Center: Inline Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-1 text-xs font-semibold rounded-md no-underline transition-colors"
              style={{
                color: isNavActive(to) ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                background: isNavActive(to) ? 'var(--theme-surface-secondary)' : 'transparent',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <ShopLanguageToggle />
          <ThemeToggle className="h-7 w-7" />

          <button
            type="button"
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all"
            style={
              cartCount > 0
                ? { borderColor: 'transparent', background: 'var(--theme-primary)', color: '#ffffff' }
                : { borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }
            }
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className={`${containerClass} pb-3 pt-1 border-t`} style={{ borderColor: 'var(--theme-border)' }}>
          <nav className="flex flex-col gap-0.5">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md no-underline"
                style={{
                  color: isNavActive(to) ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                  background: isNavActive(to) ? 'var(--theme-surface-secondary)' : 'transparent',
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
