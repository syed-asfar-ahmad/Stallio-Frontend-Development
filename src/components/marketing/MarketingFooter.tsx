import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Info,
  ListOrdered,
  Zap,
  CreditCard,
  Mail,
  ArrowRight,
  FileText,
  Scale,
  RotateCcw,
  Briefcase,
} from 'lucide-react';

import { getSocialBrandColor, SocialIcon } from '@/components/SocialIcons';
import ContactLtrText from '@/components/ContactLtrText';
import { marketingSocialLinks } from '@/lib/marketingSocialLinks';

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
      className="group inline-flex min-w-0 w-full items-center gap-2.5 rounded-xl py-1.5 ps-2.5 pe-3 text-sm font-medium text-stone-600 no-underline transition-[color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-50 hover:text-brand-800 hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_18%,transparent)] dark:text-zinc-300 dark:hover:bg-brand-950/55 dark:hover:text-brand-100 dark:hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_28%,transparent)]"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-brand-600 ring-1 ring-stone-200/80 transition-[transform,background-color,color,box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04] group-hover:bg-white group-hover:text-brand-700 group-hover:ring-brand-200/80 group-hover:shadow-sm dark:bg-zinc-800 dark:text-brand-400 dark:ring-zinc-600 dark:group-hover:bg-zinc-900 dark:group-hover:text-brand-200 dark:group-hover:ring-brand-700/50">
        <Icon
          className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-[-6deg]"
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1 truncate leading-none">{label}</span>
    </Link>
  );
}

/** Footer from `main` branch PublicLayout, with richer hover motion. */
export function MarketingFooter() {
  const { t } = useTranslation();

  const footerLinks = [
    { to: '/', label: t('layout.nav.home'), icon: Home },
    { to: '/about', label: t('layout.nav.about'), icon: Info },
    { to: '/features', label: t('layout.nav.features'), icon: Zap },
    { to: '/pricing', label: t('layout.nav.pricing'), icon: CreditCard },
    { to: '/how-it-works', label: t('layout.footer.howItWorks'), icon: ListOrdered },
    { to: '/contact', label: t('layout.nav.contact'), icon: Mail },
    { to: '/careers', label: t('layout.nav.careers'), icon: Briefcase },
  ];

  const footerLegal = [
    { to: '/privacy', label: t('layout.footer.privacy'), icon: FileText },
    { to: '/terms', label: t('layout.footer.terms'), icon: Scale },
    { to: '/refund-policy', label: t('layout.footer.refund'), icon: RotateCcw },
  ];

  return (
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
                className="block h-9 w-auto max-h-9 object-contain object-start transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03] group-hover:opacity-90 sm:h-10 sm:max-h-10"
                aria-hidden
              />
              <span
                className="nav-brand-wordmark shrink-0 text-[1.65rem] text-brand-950 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-80 sm:text-[1.85rem] dark:text-brand-50"
                aria-hidden
              >
                Stallio
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600 dark:text-zinc-300">
              {t('layout.footer.tagline')}
            </p>
            <div className="mt-6 max-lg:mt-6 sm:mt-8">
              <Link
                to="/signup"
                onClick={() => window.scrollTo(0, 0)}
                className="group/cta inline-flex w-full max-w-sm items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white no-underline shadow-md shadow-brand-600/25 transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/35 active:scale-[0.98] sm:w-auto sm:gap-2 sm:px-4 lg:px-5 dark:bg-brand-500 dark:shadow-brand-900/30 dark:hover:bg-brand-400 dark:hover:shadow-brand-900/45"
              >
                {t('layout.footer.getStartedFree')}
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5"
                  aria-hidden
                />
              </Link>
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
                className="group/mail flex w-full min-w-0 items-center gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm no-underline transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-brand-600/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100/80 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/mail:scale-105 dark:bg-zinc-800 dark:text-brand-300 dark:ring-zinc-600/80">
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition-[transform,border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:scale-110 hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-md active:scale-[0.96] dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:border-brand-500/50 dark:hover:bg-zinc-600"
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
                    className="group/legal inline-flex min-h-[2.75rem] flex-1 items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-sm font-semibold text-stone-800 shadow-sm no-underline transition-[transform,border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/40 hover:shadow-md min-[420px]:flex-initial min-[420px]:min-w-[calc(50%-0.25rem)] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-brand-600/40 dark:hover:bg-zinc-700"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-700 ring-1 ring-brand-100/80 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/legal:scale-105 dark:border-zinc-600/80 dark:bg-zinc-800 dark:text-brand-300 dark:ring-zinc-600/60">
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
                className="text-sm font-semibold text-stone-600 no-underline transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-brand-800 dark:text-zinc-300 dark:hover:text-brand-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
