import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import ThemeToggle from '../../../ThemeToggle';
import type { ThemeHeaderProps } from '../types';

export default function HeaderMinimalFloating({
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
      className="sticky top-0 z-50 border-b bg-[var(--theme-surface)]/90 backdrop-blur-md"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      {showAnnouncementBar && announcements.length > 0 ? (
        <div
          className="border-b py-2 text-center text-[11px] font-light uppercase tracking-[0.2em] text-white"
          style={{ background: 'var(--theme-secondary)', borderColor: 'var(--theme-border)' }}
        >
          {announcements[0]}
        </div>
      ) : null}

      <div className={`${containerClass} flex items-center justify-between gap-4 py-5 lg:py-7`}>
        <Link to={`/${username}`} className="shrink-0 no-underline" aria-label={shop.shopName}>
          {shop.logo ? (
            <img src={shop.logo} alt="" className="h-8 w-auto max-w-[9rem] object-contain lg:h-9" />
          ) : (
            <span
              className="text-lg font-light uppercase tracking-[0.35em] lg:text-xl"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {shop.shopName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={t('navStoreNav')}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="border-b pb-0.5 text-xs font-light uppercase tracking-[0.2em] no-underline transition-colors"
              style={
                isNavActive(to)
                  ? { borderColor: 'var(--theme-text-primary)', color: 'var(--theme-text-primary)' }
                  : { borderColor: 'transparent', color: 'var(--theme-text-muted)' }
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <ShopLanguageToggle />
          <ThemeToggle className="h-8 w-8 lg:h-9 lg:w-9" />
          <button
            type="button"
            onClick={onOpenCheckout}
            className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.25} />
            <span className="hidden lg:inline">{t('navCart')}</span>
            <span>({cartCount})</span>
          </button>
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="inline-flex h-8 w-8 items-center justify-center lg:hidden"
            style={{ color: 'var(--theme-text-primary)' }}
            aria-label={mobileMenuOpen ? t('navCloseMenu') : t('navOpenMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.25} /> : <Menu className="h-5 w-5" strokeWidth={1.25} />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{ borderColor: 'var(--theme-border)' }}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className={`${containerClass} flex flex-col gap-1 py-4`}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onCloseMobileMenu}
              className="py-2.5 text-sm font-light uppercase tracking-[0.2em] no-underline"
              style={{ color: isNavActive(to) ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
