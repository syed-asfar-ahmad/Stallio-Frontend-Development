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
  compactAnnouncement,
  containerClass,
}: ThemeHeaderProps) {
  const { t, isRtl } = useShopLanguage();

  const copies = announcements.length === 1 ? (compactAnnouncement ? 12 : 16) : compactAnnouncement ? 3 : 4;
  const translatePercent = 100 / copies;
  const scrollSeconds =
    announcements.length === 1 ? (compactAnnouncement ? 22 : 25) : compactAnnouncement ? 16 : 20;

  return (
    <header
      className="sticky top-0 z-50 border-b bg-[var(--theme-surface)]/95 backdrop-blur-md"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      {/* Announcement bar */}
      {showAnnouncementBar && announcements.length > 0 ? (
        <>
          <style>{`
            @keyframes theme-announcement-scroll-mf {
              0% { transform: translateX(0); }
              100% { transform: translateX(${isRtl ? '' : '-'}${translatePercent}%); }
            }
            @media (prefers-reduced-motion: reduce) {
              .theme-announcement-track-mf { animation: none !important; transform: none !important; }
            }
          `}</style>
          <div
            className="h-7 overflow-hidden border-b lg:h-8"
            style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)', borderColor: 'transparent' }}
            role="region"
            aria-label={t('navAnnouncementAria')}
          >
            <div
              className="theme-announcement-track-mf flex h-full shrink-0 items-center whitespace-nowrap text-[11px] font-light uppercase tracking-[0.12em] leading-none lg:text-xs"
              style={{ width: 'max-content', animation: `theme-announcement-scroll-mf ${scrollSeconds}s linear infinite` }}
            >
              {Array.from({ length: copies }, () => announcements).flat().map((text, i) => (
                <span key={i} className="shrink-0">
                  <span className="inline-block px-4 lg:px-6">{text}</span>
                  <span className="opacity-50" aria-hidden>·</span>
                </span>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Main bar */}
      <div className={`${containerClass} flex items-center justify-between gap-4 py-4 lg:py-5`}>
        {/* Logo / shop name */}
        <Link to={`/${username}`} className="shrink-0 no-underline" aria-label={shop.shopName}>
          {shop.logo ? (
            <img src={shop.logo} alt="" className="h-8 w-auto max-w-[8rem] object-contain lg:h-9" />
          ) : (
            <span
              className="text-base font-light uppercase tracking-[0.3em] lg:text-lg"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {shop.shopName}
            </span>
          )}
        </Link>

        {/* Desktop nav — plain text links with active underline */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label={t('navStoreNav')}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="relative pb-1 text-xs font-medium uppercase tracking-[0.18em] no-underline transition-colors"
              style={isNavActive(to) ? { color: 'var(--theme-text-primary)' } : { color: 'var(--theme-text-muted)' }}
            >
              {label}
              {isNavActive(to) && (
                <span
                  className="absolute inset-x-0 bottom-0 h-px"
                  style={{ background: 'var(--theme-text-primary)' }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2.5 lg:gap-3">
          <ShopLanguageToggle />
          <ThemeToggle className="h-8 w-8 lg:h-9 lg:w-9" />

          {/* Cart */}
          <button
            type="button"
            onClick={onOpenCheckout}
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            <ShoppingBag className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.5} />
            <span className="hidden lg:inline">{t('navCart')}</span>
            {cartCount > 0 && (
              <span
                className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums"
                style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="inline-flex h-8 w-8 items-center justify-center lg:hidden"
            style={{ color: 'var(--theme-text-primary)' }}
            aria-label={mobileMenuOpen ? t('navCloseMenu') : t('navOpenMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen
              ? <X className="h-5 w-5" strokeWidth={1.5} />
              : <Menu className="h-5 w-5" strokeWidth={1.5} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{ borderColor: 'var(--theme-border)' }}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className={`${containerClass} flex flex-col py-4`} aria-label={t('navStoreNav')}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onCloseMobileMenu}
              className="border-b py-3.5 text-sm font-light uppercase tracking-[0.18em] no-underline"
              style={{
                borderColor: 'var(--theme-border)',
                color: isNavActive(to) ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
              }}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => { onOpenCheckout(); onCloseMobileMenu(); }}
            className="mt-4 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em]"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            {t('navCart')} ({cartCount})
          </button>
        </nav>
      </div>
    </header>
  );
}
