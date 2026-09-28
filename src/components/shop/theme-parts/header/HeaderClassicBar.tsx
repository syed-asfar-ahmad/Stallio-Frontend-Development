import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronRight } from 'lucide-react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import ShopLanguageToggle from '../../ShopLanguageToggle';
import ThemeToggle from '../../../ThemeToggle';
import type { ThemeHeaderProps } from '../types';

export default function HeaderClassicBar({
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
      {showAnnouncementBar && announcements.length > 0 ? (
        <>
          <style>{`
            @keyframes theme-announcement-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(${isRtl ? '' : '-'}${translatePercent}%); }
            }
            @media (prefers-reduced-motion: reduce) {
              .theme-announcement-track {
                animation: none !important;
                transform: none !important;
              }
            }
          `}</style>
          <div
            className="h-7 overflow-hidden text-white lg:h-8"
            style={{ background: 'var(--theme-primary)' }}
            role="region"
            aria-label={t('navAnnouncementAria')}
          >
            <div
              className="theme-announcement-track flex h-full shrink-0 items-center whitespace-nowrap text-[11px] font-medium leading-none lg:text-sm"
              style={{ width: 'max-content', animation: `theme-announcement-scroll ${scrollSeconds}s linear infinite` }}
            >
              {Array.from({ length: copies }, () => announcements).flat().map((text, i) => (
                <span key={i} className="shrink-0">
                  <span className="inline-block px-3 lg:px-5">{text}</span>
                  <span className="opacity-70" aria-hidden>{'\u2022'}</span>
                </span>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className={`${containerClass} flex min-h-[3.25rem] items-center justify-between gap-1.5 py-2 lg:min-h-[4rem] lg:gap-3 lg:py-2.5`}>
        <Link to={`/${username}`} className="group flex shrink-0 items-center no-underline" aria-label={shop.shopName}>
          {shop.logo ? (
            <img src={shop.logo} alt="" className="h-9 w-9 shrink-0 object-contain lg:h-11 lg:w-11" />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--theme-radius-card)] text-white shadow-[var(--theme-shadow-card)] lg:h-11 lg:w-11"
              style={{ background: 'var(--theme-primary)' }}
            >
              <ShoppingBag className="h-[1.15rem] w-[1.15rem] lg:h-[1.35rem] lg:w-[1.35rem]" />
            </span>
          )}
        </Link>

        <nav
          className="hidden max-w-full items-center gap-1 overflow-x-auto rounded-[var(--theme-radius-btn)] border p-1 [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden"
          style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface-secondary)' }}
          aria-label={t('navStoreNav')}
        >
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--theme-radius-btn)] px-3 py-2 text-sm font-semibold no-underline transition-all"
              style={
                isNavActive(to)
                  ? { background: 'var(--theme-surface)', color: 'var(--theme-primary)' }
                  : { color: 'var(--theme-text-secondary)' }
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          <ShopLanguageToggle />
          <ThemeToggle className="h-9 w-9 lg:h-10 lg:w-10" />
          <button
            type="button"
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-1 rounded-[var(--theme-radius-btn)] border px-2.5 py-2 text-sm font-semibold transition-all lg:gap-2 lg:px-3.5 lg:py-2.5"
            style={
              cartCount > 0
                ? { borderColor: 'transparent', background: 'var(--theme-primary)', color: '#ffffff' }
                : { borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }
            }
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="hidden lg:inline">{t('navCart')}</span>
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--theme-radius-badge)] px-1 text-[11px] font-bold"
              style={
                cartCount > 0
                  ? { background: 'rgba(255,255,255,0.25)', color: '#ffffff' }
                  : { background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }
              }
            >
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--theme-radius-btn)] border lg:hidden"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-primary)' }}
            aria-label={mobileMenuOpen ? t('navCloseMenu') : t('navOpenMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? 'max-h-[min(88vh,480px)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={`${containerClass} pb-3`}>
          <nav
            className="flex flex-col gap-1 rounded-[var(--theme-radius-card)] border p-2 shadow-[var(--theme-shadow-dropdown)]"
            style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
          >
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={onCloseMobileMenu}
                className="flex items-center justify-between rounded-[var(--theme-radius-btn)] px-3 py-2.5 text-sm font-medium no-underline transition-colors"
                style={
                  isNavActive(to)
                    ? { background: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }
                    : { color: 'var(--theme-text-secondary)' }
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 opacity-50 rtl:rotate-180" />
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              onOpenCheckout();
              onCloseMobileMenu();
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-[var(--theme-radius-btn)] border px-3 py-3 text-start transition-colors"
            style={
              cartCount > 0
                ? { borderColor: 'transparent', background: 'var(--theme-primary)', color: '#ffffff' }
                : { borderColor: 'var(--theme-border)', background: 'var(--theme-surface-secondary)', color: 'var(--theme-text-primary)' }
            }
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--theme-radius-btn)]"
              style={cartCount > 0 ? { background: 'rgba(255,255,255,0.2)' } : { background: 'var(--theme-surface)' }}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-tight">{t('navCheckout')}</span>
              {cartCount > 0 ? (
                <span className="mt-0.5 block text-xs font-medium opacity-90">{t('navCartItems', { count: cartCount })}</span>
              ) : null}
            </span>
            <span
              className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[var(--theme-radius-badge)] px-1.5 text-[11px] font-bold tabular-nums"
              style={cartCount > 0 ? { background: 'rgba(255,255,255,0.25)' } : { background: 'var(--theme-badge-bg)', color: 'var(--theme-badge-text)' }}
            >
              {cartCount}
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 opacity-70 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
