import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Info,
  ListOrdered,
  Zap,
  CreditCard,
  Mail,
  LogIn,
  UserPlus,
  Menu,
  X,
  ArrowRight,
  FileText,
  Scale,
  RotateCcw,
  Briefcase,
} from 'lucide-react';
import { getSocialBrandColor, SocialIcon } from './SocialIcons';
import ContactLtrText from './ContactLtrText';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { marketingSocialLinks } from '../lib/marketingSocialLinks';

function NavPillLink({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={() => {
        onClick?.();
        window.scrollTo(0, 0);
      }}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-2 text-xs font-medium leading-snug no-underline transition-colors duration-200 xl:gap-1.5 xl:px-2.5 xl:text-sm ${
        active
          ? 'bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-100 dark:ring-brand-800/80'
          : 'text-stone-600 hover:bg-white hover:text-stone-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
      }`}
    >
      <Icon
        className={`hidden h-3.5 w-3.5 shrink-0 xl:block ${active ? 'text-brand-600 dark:text-brand-400' : 'text-stone-400 dark:text-zinc-400'}`}
        aria-hidden
      />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}

function CtaSignupLink({
  to,
  children,
  className = '',
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={() => {
        onClick?.();
        window.scrollTo(0, 0);
      }}
      className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-colors hover:bg-brand-700 no-underline sm:gap-2 sm:px-4 lg:px-5 dark:bg-brand-500 dark:shadow-brand-900/30 dark:hover:bg-brand-400 ${className}`}
    >
      {children}
    </Link>
  );
}

function FooterLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Home;
}) {
  return (
    <Link
      to={to}
      onClick={() => window.scrollTo(0, 0)}
      className="group inline-flex min-w-0 w-full items-center gap-2 rounded-lg py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-brand-50/60 hover:text-brand-800 no-underline dark:text-zinc-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-200"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-brand-600 ring-1 ring-stone-200/80 transition-colors group-hover:bg-brand-100/80 group-hover:text-brand-800 dark:bg-zinc-800 dark:text-brand-400 dark:ring-zinc-600 dark:group-hover:bg-brand-950/80 dark:group-hover:text-brand-200">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function PublicLayout({ children, hideFooter }: { children: React.ReactNode; hideFooter?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNav = useMemo(
    () =>
      [
        { to: '/', labelKey: 'layout.nav.home' as const, icon: Home },
        { to: '/about', labelKey: 'layout.nav.about' as const, icon: Info },
        { to: '/how-it-works', labelKey: 'layout.nav.howItWorks' as const, icon: ListOrdered },
        { to: '/features', labelKey: 'layout.nav.features' as const, icon: Zap },
        { to: '/pricing', labelKey: 'layout.nav.pricing' as const, icon: CreditCard },
        { to: '/contact', labelKey: 'layout.nav.contact' as const, icon: Mail },
      ].map((item) => ({ ...item, label: t(item.labelKey) })),
    [t],
  );

  const footerLinks = useMemo(
    () =>
      [
        { to: '/', labelKey: 'layout.nav.home' as const, icon: Home },
        { to: '/about', labelKey: 'layout.nav.about' as const, icon: Info },
        { to: '/features', labelKey: 'layout.nav.features' as const, icon: Zap },
        { to: '/pricing', labelKey: 'layout.nav.pricing' as const, icon: CreditCard },
        { to: '/how-it-works', labelKey: 'layout.footer.howItWorks' as const, icon: ListOrdered },
        { to: '/contact', labelKey: 'layout.nav.contact' as const, icon: Mail },
        { to: '/careers', labelKey: 'layout.nav.careers' as const, icon: Briefcase },
      ].map((item) => ({ ...item, label: t(item.labelKey) })),
    [t],
  );

  const footerLegal = useMemo(
    () =>
      [
        { to: '/privacy', labelKey: 'layout.footer.privacy' as const, icon: FileText },
        { to: '/terms', labelKey: 'layout.footer.terms' as const, icon: Scale },
        { to: '/refund-policy', labelKey: 'layout.footer.refund' as const, icon: RotateCcw },
      ].map((item) => ({ ...item, label: t(item.labelKey) })),
    [t],
  );

  useEffect(() => {
    const defaultTitlePaths = new Set([
      '/',
      '/about',
      '/how-it-works',
      '/features',
      '/pricing',
      '/contact',
      '/careers',
      '/login',
      '/signup',
      '/forgot-password',
      '/forgot-password/check-email',
      '/reset-password',
    ]);
    if (defaultTitlePaths.has(location.pathname)) {
      document.title = t('layout.metaTitle');
    }
  }, [location.pathname, t]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  return (
    <div
      className={`home-marketing flex min-w-0 flex-col bg-[#fafaf9] dark:bg-zinc-950 ${
        hideFooter ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 pt-[max(0.5rem,env(safe-area-inset-top,0px))] backdrop-blur-md shadow-sm shadow-stone-200/40 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:shadow-black/20">
        <div
          className={`relative mx-auto flex min-h-[3.5rem] w-full max-w-7xl items-center gap-2 px-4 py-2 max-lg:px-4 sm:min-h-[4rem] sm:py-2.5 lg:min-h-[4.5rem] lg:gap-2 lg:px-5 xl:px-6${
            mobileMenuOpen
              ? ' max-lg:relative max-lg:z-[52] max-lg:bg-white/90 max-lg:pb-4 dark:max-lg:bg-zinc-900/90'
              : ''
          }`}
        >
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="group relative z-[52] inline-flex min-w-0 shrink-0 items-end gap-1.5 no-underline sm:gap-2"
            aria-label={t('layout.aria.homeLogo')}
          >
            <img
              src="/assets/logo.png"
              alt=""
              width={180}
              height={44}
              decoding="async"
              className="block h-8 w-auto max-h-8 max-w-[min(140px,34vw)] object-contain object-start transition-opacity group-hover:opacity-90 sm:h-9 sm:max-w-[min(160px,38vw)] lg:h-10 lg:max-h-10 lg:max-w-[min(200px,46vw)]"
              aria-hidden
            />
            <span
              className="nav-brand-wordmark hidden shrink-0 text-[1.75rem] text-brand-950 transition-opacity duration-300 group-hover:opacity-80 xl:inline sm:text-[1.9rem] lg:text-[2.05rem] dark:text-brand-50"
              aria-hidden
            >
              Stallio
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center px-1 lg:flex">
            <nav
              className="inline-flex max-w-full flex-nowrap items-center gap-0.5 rounded-full border border-stone-200/90 bg-stone-50/90 p-0.5 dark:border-zinc-600/90 dark:bg-zinc-800/90"
              aria-label={t('layout.aria.mainNav')}
            >
              {mainNav.map(({ to, label, icon }) => (
                <NavPillLink key={to} to={to} label={label} icon={icon} active={location.pathname === to} />
              ))}
            </nav>
          </div>

          <div className="relative z-[52] ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher className="shrink-0" />
            <ThemeToggle className="h-10 w-10 max-lg:h-10 max-lg:w-10" />
            <Link
              to="/login"
              onClick={() => window.scrollTo(0, 0)}
              className="hidden items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-brand-200 bg-white px-3 py-2 text-sm font-semibold text-brand-900 transition-colors hover:border-brand-300 hover:bg-brand-50/80 no-underline min-[1200px]:inline-flex dark:border-zinc-500 dark:bg-zinc-800 dark:text-brand-100 dark:hover:border-brand-500 dark:hover:bg-zinc-700"
            >
              <LogIn className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
              {t('layout.navCta.logIn')}
            </Link>
            <CtaSignupLink
              to="/signup"
              className="hidden md:inline-flex max-lg:px-3.5 max-lg:py-2 max-lg:text-xs lg:px-5"
              onClick={() => window.scrollTo(0, 0)}
            >
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              {t('layout.navCta.createYourShop')}
            </CtaSignupLink>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white transition-colors lg:hidden dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-brand-500/40 dark:hover:bg-zinc-700 ${
                mobileMenuOpen
                  ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800/60 dark:hover:bg-red-950/40'
                  : 'border-stone-200 text-stone-800 hover:border-brand-200 hover:bg-brand-50/40'
              }`}
              aria-label={mobileMenuOpen ? t('layout.aria.closeMenu') : t('layout.aria.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <button
            type="button"
            className="fixed inset-0 top-[calc(max(0.5rem,env(safe-area-inset-top,0px))+4rem)] z-40 bg-stone-900/40 backdrop-blur-[2px] sm:top-[calc(max(0.5rem,env(safe-area-inset-top,0px))+4.25rem)] lg:hidden"
            aria-label={t('layout.aria.closeMenu')}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div
          className={`relative z-50 lg:hidden ${
            mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
              mobileMenuOpen ? 'max-h-[min(88dvh,560px)] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mx-4 mb-3 mt-3 overflow-y-auto overscroll-contain rounded-2xl border border-stone-200/80 bg-white shadow-xl shadow-stone-300/25 dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-black/40 max-lg:mx-4 sm:mb-3">
              <nav
                className="flex max-h-[min(80dvh,520px)] flex-col gap-0.5 p-2 sm:p-3"
                aria-label={t('layout.aria.mobileMainNav')}
              >
                {mainNav.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.scrollTo(0, 0);
                      }}
                      className={`flex min-h-[2.75rem] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                        active
                          ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-100 dark:bg-brand-950/50 dark:text-brand-100 dark:ring-brand-800/60'
                          : 'text-stone-700 hover:bg-stone-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-stone-400 dark:text-zinc-500'}`}
                        aria-hidden
                      />
                      {label}
                    </Link>
                  );
                })}
                <div className="my-2 h-px bg-stone-100 dark:bg-zinc-700 md:hidden" aria-hidden />
                <div className="grid grid-cols-2 gap-2 md:hidden">
                  <Link
                    to="/login"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    className="flex min-h-[2.75rem] min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-brand-200 bg-white px-2.5 py-2.5 text-xs font-semibold text-brand-900 no-underline hover:bg-brand-50/60 sm:px-3 sm:text-sm dark:border-brand-700/50 dark:bg-zinc-800 dark:text-brand-100 dark:hover:bg-brand-950/40"
                  >
                    <LogIn className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
                    {t('layout.navCta.logIn')}
                  </Link>
                  <CtaSignupLink
                    to="/signup"
                    className="min-h-[2.75rem] min-w-0 px-2.5 py-2.5 text-xs sm:px-3 sm:text-sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
                    {t('layout.navCta.createYourShop')}
                  </CtaSignupLink>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main
        className={
          hideFooter
            ? 'flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-clip overflow-y-hidden'
            : 'flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-x-clip'
        }
      >
        {children}
      </main>

      {!hideFooter && (
        <footer className="relative mt-auto border-t border-stone-200/90 bg-[#fafaf9] dark:border-zinc-700/90 dark:bg-zinc-950">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(94,43,236,0.07),transparent_55%)]"
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 py-10 max-lg:px-4 sm:py-12 lg:px-5 lg:py-14 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]">
            <div className="grid w-full grid-cols-1 gap-10 max-lg:gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-0">
              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                <Link
                  to="/"
                  onClick={() => window.scrollTo(0, 0)}
                  className="group inline-flex items-end gap-1.5 no-underline sm:gap-2"
                  aria-label={t('layout.aria.homeLogo')}
                >
                  <img
                    src="/assets/logo.png"
                    alt=""
                    width={200}
                    height={48}
                    decoding="async"
                    className="block h-9 w-auto max-h-9 object-contain object-start transition-opacity group-hover:opacity-90 sm:h-10 sm:max-h-10"
                    aria-hidden
                  />
                  <span
                    className="nav-brand-wordmark shrink-0 text-[1.65rem] text-brand-950 transition-opacity duration-300 group-hover:opacity-80 sm:text-[1.85rem] dark:text-brand-50"
                    aria-hidden
                  >
                    Stallio
                  </span>
                </Link>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
                  {t('layout.footer.tagline')}
                </p>
                <div className="mt-6 max-lg:mt-6 sm:mt-8">
                  <CtaSignupLink
                    to="/signup"
                    className="w-full max-w-sm sm:w-auto"
                    onClick={() => {
                      window.scrollTo(0, 0);
                    }}
                  >
                    {t('layout.footer.getStartedFree')}
                    <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
                  </CtaSignupLink>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
                  {t('layout.footer.linksHeading')}
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  {footerLinks.map((item) => (
                    <li key={item.to} className="min-w-0">
                      <FooterLink to={item.to} label={item.label} icon={item.icon} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
                  {t('layout.footer.contactHeading')}
                </p>
                <div className="mt-4 space-y-3">
                  <a
                    href="mailto:contact@stallio.shop"
                    className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm transition-shadow hover:border-brand-200 hover:shadow-md no-underline dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-brand-600/40"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-zinc-600/80">
                      <Mail className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 break-all text-sm font-semibold leading-snug text-stone-800 dark:text-zinc-100">
                      <ContactLtrText>contact@stallio.shop</ContactLtrText>
                    </span>
                  </a>
                </div>
              </div>

              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
                  {t('layout.footer.socialHeading')}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {marketingSocialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50/50 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:border-brand-500/50 dark:hover:bg-zinc-600"
                      style={{ color: getSocialBrandColor(link.platform) }}
                      aria-label={link.platform}
                    >
                      <SocialIcon platform={link.platform} size={18} />
                    </a>
                  ))}
                </div>

                <div className="mt-8 max-lg:mt-8 lg:hidden">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
                    {t('layout.footer.legalHeading')}
                  </p>
                  <nav className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap" aria-label={t('layout.footer.legalNavAria')}>
                    {footerLegal.map(({ to, label, icon: LegIcon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => window.scrollTo(0, 0)}
                        className="inline-flex min-h-[2.75rem] flex-1 items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40 no-underline min-[420px]:flex-initial min-[420px]:min-w-[calc(50%-0.25rem)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-brand-600/40 dark:hover:bg-zinc-700"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-700 ring-1 ring-brand-100/80 dark:border-zinc-600/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-zinc-600/60">
                          <LegIcon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 text-start leading-snug">{label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-stone-200/90 pt-6 max-lg:gap-4 dark:border-zinc-700 lg:mt-10 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-center text-sm text-stone-500 max-lg:text-center lg:text-start dark:text-zinc-400">
                {t('layout.footer.copyright', { year: new Date().getFullYear() })}
              </p>
              <nav
                className="hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:flex lg:justify-end"
                aria-label={t('layout.footer.legalNavAria')}
              >
                {footerLegal.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-sm font-semibold text-stone-600 no-underline transition-colors hover:text-brand-800 dark:text-zinc-300 dark:hover:text-brand-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
