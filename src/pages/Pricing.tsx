import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { wrapLtrIsolate } from '../lib/ltrIsolate';
import {
  ArrowRight,
  Check,
  Sparkles,
  CalendarClock,
  BadgePercent,
  ShieldCheck,
  Store,
  Globe,
  Coins,
  Zap,
  ChevronDown,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { HeroAtmosphere, heroBleedClassName } from '../components/marketing/HeroAtmosphere';
import { useTheme } from '../context/ThemeContext';
import { getCountryOptionsList, getCurrencyForCountry, getFlagUrl } from '../lib/countryCurrencyOptions';
import type { CountryOption } from '../lib/countryCurrencyOptions';
import { fetchUsdTo, type UsdFxQuote } from '../lib/exchangeRateFx';
import {
  SUBSCRIPTION_USD_MONTHLY as USD_MONTHLY,
  SUBSCRIPTION_USD_YEARLY as USD_YEARLY,
} from '../lib/subscriptionPricing';

const USD_SAVE_YEARLY = USD_MONTHLY * 12 - USD_YEARLY;

const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'IDR', 'HUF', 'ISK']);

function formatMoneyApprox(amount: number, currency: string, locale: string): string {
  const z = ZERO_DECIMAL_CURRENCIES.has(currency);
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: z ? 0 : 2,
    maximumFractionDigits: z ? 0 : 2,
  }).format(amount);
  return wrapLtrIsolate(formatted);
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-600">{children}</p>
  );
}

function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`home-reveal ${inView ? 'home-reveal--inview' : ''} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty('--spot-x');
    el.style.removeProperty('--spot-y');
  };
  return (
    <div ref={ref} className={`home-spotlight ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

const DEFAULT_COUNTRY = 'US';

function pricingSelectStyles(menuZ: number, dark: boolean) {
  return {
    control: (base: object, state: { isFocused: boolean }) => ({
      ...base,
      minHeight: 50,
      paddingLeft: 44,
      borderWidth: 2,
      borderColor: state.isFocused ? (dark ? '#5e2bec' : '#5b45e5') : dark ? '#52525b' : '#e7e5e4',
      borderRadius: 14,
      backgroundColor: dark ? '#18181b' : '#fff',
      boxShadow: state.isFocused
        ? dark
          ? '0 0 0 4px rgba(94, 43, 236, 0.15)'
          : '0 0 0 4px rgba(63, 52, 186, 0.12)'
        : 'none',
    }),
    menu: (base: object) => ({
      ...base,
      borderRadius: 14,
      overflow: 'hidden',
      zIndex: menuZ,
      backgroundColor: dark ? '#18181b' : '#fff',
      border: dark ? '1px solid #3f3f46' : undefined,
    }),
    menuPortal: (base: object) => ({ ...base, zIndex: menuZ }),
    option: (base: Record<string, unknown>, state: { isFocused: boolean; isSelected: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? dark
          ? 'rgb(37 26 102)'
          : 'rgb(235 232 252)'
        : state.isFocused
          ? dark
            ? 'rgb(39 39 42)'
            : 'rgb(245 245 244)'
          : dark
            ? '#18181b'
            : ((base.backgroundColor as string) ?? '#fff'),
      color: state.isSelected ? (dark ? '#d6cff9' : '#2f2184') : dark ? '#fafafa' : '#1c1917',
    }),
    placeholder: (base: object) => ({ ...base, color: dark ? '#a1a1aa' : '#a8a29e' }),
    input: (base: object) => ({ ...base, margin: 0, padding: 0, color: dark ? '#fafafa' : undefined }),
    singleValue: (base: object) => ({ ...base, color: dark ? '#fafafa' : '#1c1917', fontWeight: 600 }),
  };
}

export default function Pricing() {
  const { t, i18n } = useTranslation();
  const moneyLocale = useMemo(() => {
    const code = i18n.language?.split('-')[0];
    if (code === 'es') return 'es';
    if (code === 'ar') return 'ar';
    return 'en-US';
  }, [i18n.language]);
  const included = t('pricing.billing.includedItems', { returnObjects: true }) as string[];
  const faqItems = t('pricing.faq.items', { returnObjects: true }) as { q: string; a: string }[];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const countryOptions = useMemo(() => getCountryOptionsList(), []);
  const displayCurrency = useMemo(() => getCurrencyForCountry(countryCode) ?? 'USD', [countryCode]);
  const selectedCountry = useMemo(
    () => countryOptions.find((o) => o.value === countryCode) ?? null,
    [countryCode, countryOptions],
  );
  const selectStyles = useMemo(() => pricingSelectStyles(9999, isDark), [isDark]);
  const fxCacheRef = useRef<Map<string, UsdFxQuote>>(new Map());
  const [fxQuote, setFxQuote] = useState<UsdFxQuote | null>({ rate: 1, date: new Date().toISOString().slice(0, 10) });
  const [fxLoading, setFxLoading] = useState(false);
  const [fxError, setFxError] = useState(false);

  useEffect(() => {
    const cur = displayCurrency;
    setFxError(false);
    if (cur === 'USD') {
      setFxLoading(false);
      setFxQuote({ rate: 1, date: new Date().toISOString().slice(0, 10) });
      return;
    }
    const cached = fxCacheRef.current.get(cur);
    if (cached) {
      setFxQuote(cached);
      setFxLoading(false);
      return;
    }
    setFxLoading(true);
    setFxQuote(null);
    const ac = new AbortController();
    fetchUsdTo(cur, ac.signal)
      .then((q) => {
        fxCacheRef.current.set(cur, q);
        setFxQuote(q);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setFxError(true);
          setFxQuote(null);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setFxLoading(false);
      });
    return () => ac.abort();
  }, [displayCurrency]);

  const showLocal = Boolean(fxQuote && !fxLoading && !fxError && displayCurrency !== 'USD');
  const approxMonthly =
    showLocal && fxQuote ? formatMoneyApprox(USD_MONTHLY * fxQuote.rate, displayCurrency, moneyLocale) : null;
  const approxYearly =
    showLocal && fxQuote ? formatMoneyApprox(USD_YEARLY * fxQuote.rate, displayCurrency, moneyLocale) : null;

  return (
    <PublicLayout>
      <div className="home-marketing min-w-0 w-full overflow-x-clip bg-stone-50">
        <section className={`${heroBleedClassName} border-b border-stone-200/60 bg-white text-stone-900`}>
          <HeroAtmosphere sparkleId="pricing-hero-sparkles" />

          <div className="relative z-[1] mx-auto w-full min-w-0 max-w-7xl px-4 pb-10 pt-10 max-lg:px-4 md:px-5 md:pb-24 md:pt-20">
            <div className="grid min-w-0 items-center gap-8 text-center max-lg:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:text-start xl:gap-14">
              <div className="mx-auto w-full min-w-0 max-w-xl lg:mx-0">
                <p className="opacity-0 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-brand-600 animate-fade-up animation-delay-100">
                  {t('pricing.hero.eyebrow')}
                </p>
                <h1 className="home-headline opacity-0 mt-3 text-balance text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-stone-900 animate-fade-up animation-delay-150 max-lg:mt-3 sm:mt-4 sm:text-5xl md:text-[3rem]">
                  {t('pricing.hero.titleLine1')}
                  <span className="marketing-gradient-text mt-2 block bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent">
                    {t('pricing.hero.titleLine2')}
                  </span>
                </h1>
                <p className="opacity-0 mx-auto mt-4 max-w-2xl text-[0.9375rem] font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-200 max-lg:mt-4 sm:mt-5 sm:text-base md:text-lg lg:mx-0">
                  {t('pricing.hero.subtitle')}
                </p>

                <p
                  className="opacity-0 mx-auto mt-5 max-w-xl text-xs font-medium leading-relaxed text-stone-600 animate-fade-up animation-delay-250 max-lg:mt-5 sm:mt-8 sm:text-sm md:text-base lg:mx-0"
                  role="note"
                >
                  <span className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-x-2 lg:justify-start">
                    <Coins className="inline h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    <span>{t('pricing.hero.fromMonthly', { amount: wrapLtrIsolate(String(USD_MONTHLY)) })}</span>
                    <span className="mx-1 hidden text-stone-300 sm:inline" aria-hidden>
                      |
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
                      <span>{t('pricing.hero.noCard')}</span>
                    </span>
                  </span>
                </p>

                <div className="marketing-twin-cta-sm border-t border-stone-100 pt-6 opacity-0 animate-fade-up animation-delay-300 lg:border-t-0 lg:pt-0">
                  <Link
                    to="/signup"
                    className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-8 sm:py-4 sm:text-base"
                  >
                    <span className="relative z-[2] inline-flex items-center gap-2">
                      {t('pricing.hero.startFreeTrial')}
                      <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                    </span>
                  </Link>
                  <Link
                    to="/features"
                    className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-7 sm:py-4 sm:text-base"
                  >
                    {t('pricing.hero.whatYouGet')}
                  </Link>
                </div>
              </div>

              <div className="relative flex w-full min-w-0 justify-center lg:justify-end">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                  <div className="h-[min(90%,480px)] w-[min(90%,480px)] rounded-full bg-brand-400/12 blur-[80px] animate-home-float-slow" />
                </div>
                <div className="relative w-full min-w-0 max-w-[min(100%,320px)] opacity-0 animate-fade-up animation-delay-300 max-lg:mx-auto sm:max-w-[360px] lg:me-2 lg:max-w-[360px]">
                  <div
                    className="absolute -inset-3 rounded-[2.25rem] bg-gradient-to-tr from-brand-400/25 via-transparent to-brand-300/20 opacity-80 blur-2xl transition-opacity duration-700 hover:opacity-100"
                    aria-hidden
                  />
                  <SpotlightCard className="rounded-[1.35rem] border border-stone-200/90 bg-white/95 p-4 shadow-2xl shadow-stone-900/10 ring-1 ring-stone-200/80 transition-[transform,ring-color] duration-500 hover:-translate-y-2 hover:ring-brand-300/60 sm:rounded-[2rem] sm:p-6 dark:bg-zinc-900/90">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
                      {t('pricing.billing.eyebrow')}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-snug text-stone-600 dark:text-zinc-300">
                      {t('pricing.billing.subtitle')}
                    </p>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-stone-50/90 px-4 py-3.5 dark:border-zinc-600 dark:bg-zinc-800/50">
                        <span className="flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-zinc-100">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm ring-1 ring-stone-200/80 dark:bg-zinc-900 dark:ring-zinc-600">
                            <Zap className="h-4 w-4" aria-hidden />
                          </span>
                          {t('pricing.billing.monthly')}
                        </span>
                        <span dir="ltr" className="text-lg font-extrabold tabular-nums [unicode-bidi:isolate] text-stone-900 dark:text-zinc-50">
                          ${USD_MONTHLY}
                          <span className="text-xs font-bold text-stone-500 dark:text-zinc-400">/mo</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-200/90 bg-gradient-to-r from-brand-50/90 to-white px-4 py-3.5 dark:border-brand-800/50 dark:from-brand-950/40 dark:to-zinc-900">
                        <span className="flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-zinc-100">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm ring-1 ring-brand-200/80 dark:bg-zinc-900 dark:text-brand-300 dark:ring-brand-800/60">
                            <BadgePercent className="h-4 w-4" aria-hidden />
                          </span>
                          {t('pricing.billing.yearly')}
                        </span>
                        <span dir="ltr" className="text-lg font-extrabold tabular-nums [unicode-bidi:isolate] text-brand-900 dark:text-brand-200">
                          ${USD_YEARLY}
                          <span className="text-xs font-bold text-brand-700/80 dark:text-brand-300/80">/yr</span>
                        </span>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-10 max-lg:py-10 md:py-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/70 to-transparent" aria-hidden />
          <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 max-lg:px-4 md:px-5">
            <Reveal className="text-center">
              <SectionEyebrow>{t('pricing.billing.eyebrow')}</SectionEyebrow>
              <h2 className="home-headline mx-auto mt-3 max-w-2xl text-2xl font-extrabold tracking-tight text-stone-900 max-lg:text-2xl sm:text-3xl md:text-4xl">
                {t('pricing.billing.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base font-medium text-stone-600 sm:text-lg">
                {t('pricing.billing.subtitle')}
              </p>
            </Reveal>

            <Reveal className="mt-8 max-lg:mt-8 md:mt-14" delayMs={40}>
              <div className="marketing-pricing-shell overflow-hidden rounded-[1.35rem] border border-stone-200/90 bg-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.25)] max-lg:rounded-[1.35rem] md:rounded-[2rem]">
                <div className="grid lg:grid-cols-12">
                  <div className="marketing-pricing-region relative border-b border-stone-100 bg-gradient-to-br from-brand-50/80 via-white to-white p-6 sm:p-8 lg:col-span-4 lg:border-b-0 lg:border-r lg:border-stone-100">
                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-400/10 blur-2xl" aria-hidden />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-brand-800">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                          <Globe className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="text-start">
                          <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-600/90">
                            {t('pricing.billing.estimate')}
                          </p>
                          <p className="text-sm font-extrabold text-stone-900">{t('pricing.billing.yourCountry')}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-start text-sm leading-relaxed text-stone-600">
                        {t('pricing.billing.countryHelp')}
                      </p>

                      <label htmlFor="pricing-country" className="sr-only">
                        {t('pricing.billing.countryLabelSr')}
                      </label>
                      <div className="relative mt-5">
                        <Globe className="absolute start-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-brand-600/70 pointer-events-none" aria-hidden />
                        <Select<CountryOption>
                          inputId="pricing-country"
                          isSearchable
                          isClearable={false}
                          menuPosition="fixed"
                          menuPlacement="auto"
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                          options={countryOptions}
                          value={selectedCountry}
                          onChange={(opt) => setCountryCode(opt?.value ?? DEFAULT_COUNTRY)}
                          placeholder={t('pricing.billing.searchCountryPlaceholder')}
                          noOptionsMessage={() => t('pricing.billing.noCountryFound')}
                          formatOptionLabel={(opt) => (
                            <span className="flex items-center gap-2">
                              {opt.flagUrl ? (
                                <img src={opt.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded object-cover" />
                              ) : null}
                              <span>{opt.label}</span>
                            </span>
                          )}
                          styles={selectStyles}
                          classNamePrefix="pricing-select"
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <img
                          src={getFlagUrl(countryCode)}
                          alt=""
                          className="h-5 w-7 shrink-0 rounded border border-stone-200/80 object-cover shadow-sm"
                        />
                        <span className="inline-flex items-center rounded-full border border-stone-200/90 bg-white px-3 py-1 text-xs font-bold text-stone-700">
                          {displayCurrency}
                        </span>
                        {fxLoading && (
                          <span className="text-xs font-medium text-stone-500" aria-live="polite">
                            {t('pricing.billing.updatingRates')}
                          </span>
                        )}
                      </div>

                      {fxError && (
                        <p className="mt-3 rounded-xl border border-red-100 bg-red-50/80 px-3 py-2 text-start text-xs font-medium text-red-700" role="alert">
                          {t('pricing.billing.fxError')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-0 sm:grid-cols-2 lg:col-span-8">
                    <div className="flex flex-col border-b border-stone-100 p-4 sm:border-b-0 sm:border-e sm:border-stone-100 sm:p-8">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-stone-600">
                          <Zap className="h-3 w-3 text-amber-500" aria-hidden />
                          {t('pricing.billing.monthly')}
                        </span>
                      </div>
                      <div className="mt-8">
                        <p className="flex items-baseline gap-1 font-extrabold tracking-tight text-stone-900">
                          <span dir="ltr" className="text-4xl sm:text-5xl [unicode-bidi:isolate]">${USD_MONTHLY}</span>
                          <span className="text-lg font-bold text-stone-500">{t('pricing.billing.perMo')}</span>
                        </p>
                        {approxMonthly ? (
                          <p className="mt-2 text-sm font-semibold text-brand-800">
                            {t('pricing.billing.approxPerMonth', { amount: approxMonthly })}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-stone-500">{t('pricing.billing.afterTrial')}</p>
                        )}
                        <p className="mt-4 text-sm leading-relaxed text-stone-600">
                          {t('pricing.billing.monthlyDesc')}
                        </p>
                      </div>
                      <Link
                        to="/signup"
                        className="home-btn-secondary mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-200 bg-white py-3.5 text-center text-sm font-bold text-stone-900 no-underline transition-colors hover:border-brand-300 hover:bg-brand-50/50 sm:mt-auto sm:rounded-2xl sm:py-4"
                      >
                        {t('pricing.billing.startMonthly')}
                        <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
                      </Link>
                    </div>

                    <div className="marketing-pricing-yearly relative flex flex-col overflow-hidden bg-gradient-to-b from-brand-50/50 to-white p-4 sm:p-8">
                      <div
                        className="marketing-pricing-yearly-glow pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_90%_0%,rgba(91,69,229,0.2),transparent_45%)]"
                        aria-hidden
                      />
                      <div className="relative flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/90 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-brand-800">
                          <CalendarClock className="h-3 w-3" aria-hidden />
                          {t('pricing.billing.yearly')}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">
                          <BadgePercent className="h-3 w-3" aria-hidden />
                          {t('pricing.billing.saveAmount', { amount: wrapLtrIsolate(String(USD_SAVE_YEARLY)) })}
                        </span>
                      </div>
                      <div className="relative mt-8">
                        <p className="flex items-baseline gap-1 font-extrabold tracking-tight text-stone-900">
                          <span dir="ltr" className="text-4xl sm:text-5xl [unicode-bidi:isolate]">${USD_YEARLY}</span>
                          <span className="text-lg font-bold text-stone-500">{t('pricing.billing.perYr')}</span>
                        </p>
                        {approxYearly ? (
                          <p className="mt-2 text-sm font-semibold text-brand-800">
                            {t('pricing.billing.approxPerYear', { amount: approxYearly })}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-stone-500">{t('pricing.billing.afterTrial')}</p>
                        )}
                        <p className="mt-4 text-sm leading-relaxed text-stone-600">
                          {t('pricing.billing.yearlyDesc')}
                        </p>
                      </div>
                      <Link
                        to="/signup"
                        className="home-btn-primary group relative mt-10 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 py-3.5 text-center text-sm font-bold text-white no-underline shadow-md shadow-brand-900/10 sm:rounded-2xl sm:py-4"
                      >
                        <span className="relative z-[2] inline-flex items-center gap-2">
                          {t('pricing.billing.startYearly')}
                          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-10 md:mt-12" delayMs={80}>
              <div className="rounded-2xl border border-stone-200/90 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                      {t('pricing.billing.includedEyebrow')}
                    </p>
                    <h3 className="home-headline mt-1 text-xl font-extrabold text-stone-900 sm:text-2xl">
                      {t('pricing.billing.includedTitle')}
                    </h3>
                  </div>
                  <Sparkles className="hidden h-8 w-8 shrink-0 text-brand-500 sm:block" aria-hidden />
                </div>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr">
                  {included.map((item) => (
                    <li
                      key={item}
                      className="flex min-h-[3.25rem] items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-3 text-sm font-semibold text-stone-800 lg:min-h-[3rem]"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                      </span>
                      <span title={item} className="min-w-0 flex-1 leading-tight lg:truncate lg:whitespace-nowrap">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal className="mt-8" delayMs={100}>
              <div className="marketing-pricing-trust flex flex-col items-center gap-4 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50/60 to-white px-5 py-6 text-center shadow-sm sm:flex-row sm:px-8 sm:text-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm ring-1 ring-brand-100 dark:bg-zinc-800 dark:ring-brand-900/50">
                  <ShieldCheck className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-stone-900">{t('pricing.billing.trustTitle')}</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-stone-600">
                    {t('pricing.billing.trustBody')}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-12 md:mt-16" delayMs={110}>
              <div className="w-full">
                <div className="text-center">
                  <SectionEyebrow>{t('pricing.faq.eyebrow')}</SectionEyebrow>
                  <h2 className="home-headline mx-auto mt-3 max-w-3xl text-2xl font-extrabold text-stone-900 dark:text-zinc-50 sm:text-3xl md:text-4xl">
                    {t('pricing.faq.title')}
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-base font-medium leading-relaxed text-stone-600 dark:text-zinc-300">
                    {t('pricing.faq.subtitle')}
                  </p>
                </div>
                <div className="mt-8 w-full overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white shadow-[0_16px_48px_-36px_rgba(15,23,42,0.12)] dark:border-zinc-700 dark:bg-zinc-900/50 dark:shadow-black/20">
                  {faqItems.map((item, i) => {
                    const open = openFaq === i;
                    return (
                      <div
                        key={item.q}
                        className={`border-stone-100 dark:border-zinc-700/80 ${i > 0 ? 'border-t' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(open ? null : i)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-stone-50/80 sm:px-7 sm:py-5 dark:hover:bg-zinc-800/60"
                          aria-expanded={open}
                        >
                          <span className="min-w-0 text-[0.9375rem] font-extrabold leading-snug text-stone-900 sm:text-base dark:text-zinc-100">
                            {item.q}
                          </span>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200/80 bg-stone-50 text-stone-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                              aria-hidden
                            />
                          </span>
                        </button>
                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                        >
                          <div className="overflow-hidden">
                            <p className="border-t border-stone-100/90 bg-stone-50/40 px-5 pb-5 pt-4 text-sm font-medium leading-relaxed text-stone-600 sm:px-7 dark:border-zinc-700/60 dark:bg-zinc-950/40 dark:text-zinc-300">
                              {item.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-stone-200/80 bg-white py-12 max-lg:py-12 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,rgba(91,69,229,0.09),transparent_55%)]"
            aria-hidden
          />
          <Reveal className="relative mx-auto max-w-2xl px-4 text-center md:px-5">
            <h2 className="home-headline text-balance text-2xl font-extrabold text-stone-900 sm:text-3xl md:text-4xl">
              {t('pricing.bottomCta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-stone-600 sm:text-lg">
              {t('pricing.bottomCta.subtitle')}
            </p>
            <div className="marketing-twin-cta-9">
              <Link
                to="/contact"
                className="home-btn-secondary marketing-twin-cta-btn inline-flex items-center gap-2 rounded-2xl font-bold text-stone-800 no-underline sm:px-8 sm:py-4 sm:text-base"
              >
                {t('pricing.bottomCta.contactUs')}
              </Link>
              <Link
                to="/signup"
                className="home-btn-primary marketing-twin-cta-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 font-bold text-white no-underline sm:px-8 sm:py-4 sm:text-base"
              >
                <span className="relative z-[2] inline-flex items-center gap-2">
                  <Store className="h-5 w-5 shrink-0" aria-hidden />
                  {t('pricing.bottomCta.createYourShop')}
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </span>
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </PublicLayout>
  );
}
