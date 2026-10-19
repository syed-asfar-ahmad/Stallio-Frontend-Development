import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import ThemeToggle from '../../../ThemeToggle';
import type { ThemeHeaderProps } from '../types';

export default function HeaderNoirAtelier({
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
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ background: 'color-mix(in srgb, var(--theme-background) 88%, transparent)', borderColor: 'var(--theme-border)' }}
    >
      {showAnnouncementBar && announcements.length > 0 ? (
        <div
          className="border-b py-2 text-center text-[10px] font-semibold uppercase tracking-[0.4em]"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-primary)' }}
        >
          ✦ {announcements[0]} ✦
        </div>
      ) : null}

      <div className={`${containerClass} flex items-center justify-between gap-4 py-2 sm:py-2.5`}>
        <nav className="hidden flex-1 items-center gap-6 lg:flex" aria-label={t('navStoreNav')}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="group relative pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] no-underline transition-colors hover:text-[var(--theme-primary)]"
              style={{ color: isNavActive(to) ? 'var(--theme-primary)' : 'var(--theme-text-secondary)' }}
            >
              {label}
              <span
                className={`absolute inset-x-0 bottom-0 h-px origin-center transition-transform duration-300 ${isNavActive(to) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                style={{ background: 'var(--theme-primary)' }}
              />
            </Link>
          ))}
        </nav>

        <Link to={`/${username}`} className="shrink-0 text-center no-underline lg:flex-1" aria-label={shop.shopName}>
          {shop.logo ? (
            <img src={shop.logo} alt="" className="mx-auto h-7 w-auto max-w-[8rem] object-contain" />
          ) : (
            <span
              className="text-base uppercase tracking-[0.4em] lg:text-lg"
              style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)' }}
            >
              {shop.shopName}
            </span>
          )}
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <ShopLanguageToggle />
          <ThemeToggle className="h-7 w-7" />
          <button
            type="button"
            onClick={onOpenCheckout}
            className="flex items-center gap-1.5 border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primary-contrast)]"
            style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t('navCart')}</span>
            {cartCount > 0 ? <span className="tabular-nums">({cartCount})</span> : null}
          </button>
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="inline-flex h-8 w-8 items-center justify-center lg:hidden"
            style={{ color: 'var(--theme-text-primary)' }}
            aria-label={mobileMenuOpen ? t('navCloseMenu') : t('navOpenMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" strokeWidth={1.5} /> : <Menu className="h-4.5 w-4.5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t transition-[max-height,opacity] duration-300 lg:hidden ${mobileMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
        style={{ borderColor: 'var(--theme-border)' }}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className={`${containerClass} flex flex-col py-3`} aria-label={t('navStoreNav')}>
          {navLinks.map(({ to, label }, i) => (
            <Link
              key={to}
              to={to}
              onClick={onCloseMobileMenu}
              className="flex items-center gap-3.5 border-b py-3 text-xs uppercase tracking-[0.2em] no-underline"
              style={{ borderColor: 'var(--theme-border)', color: isNavActive(to) ? 'var(--theme-primary)' : 'var(--theme-text-secondary)' }}
            >
              <span className="text-[9px] tabular-nums" style={{ color: 'var(--theme-primary)' }}>0{i + 1}</span>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}