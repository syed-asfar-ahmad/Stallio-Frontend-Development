import { useEffect, useRef, useState } from 'react';
import { IconArrowUpRight, IconCheck, IconGlobe } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Link } from 'react-router-dom';

import { BezelShell } from '@/components/ui/bezel-shell';
import {
  getCountryOptionsList,
  getCurrencyForCountry,
  type CountryOption,
} from '@/lib/countryCurrencyOptions';
import { fetchUsdTo, type UsdFxQuote } from '@/lib/exchangeRateFx';
import { wrapLtrIsolate } from '@/lib/ltrIsolate';
import { motionEase } from '@/lib/motion';
import { getStaticPerUsd, PRICING_RATE_COUNTRY_CODES } from '@/lib/pricingLocalRates';
import {
  formatSubscriptionUsd,
  SUBSCRIPTION_USD_MONTHLY as USD_MONTHLY,
  SUBSCRIPTION_USD_YEARLY as USD_YEARLY,
} from '@/lib/subscriptionPricing';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

type CurrencyQuote = UsdFxQuote & { currency: string };

const DEFAULT_COUNTRY = 'US';
const USD_SAVE_YEARLY = USD_MONTHLY * 12 - USD_YEARLY;
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'IDR', 'HUF', 'ISK']);
/** Only countries with a static (or live-overridable) planning rate — same set as Stallio Website. */
const PRICING_RATE_SET = new Set(PRICING_RATE_COUNTRY_CODES);
const COUNTRY_OPTIONS = getCountryOptionsList().filter((o) => PRICING_RATE_SET.has(o.value));

function formatMoneyApprox(amount: number, currency: string, locale: string): string {
  const z = ZERO_DECIMAL_CURRENCIES.has(currency);
  return wrapLtrIsolate(
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: z ? 0 : 2,
      maximumFractionDigits: z ? 0 : 2,
    }).format(amount),
  );
}

export function PricingPlans() {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);

  const lang = i18n.language?.split('-')[0];
  const moneyLocale = lang === 'es' || lang === 'ar' ? lang : 'en-US';
  const displayCurrency = getCurrencyForCountry(countryCode) ?? 'USD';
  const selectedCountry = COUNTRY_OPTIONS.find((o) => o.value === countryCode) ?? null;
  const staticPerUsd = getStaticPerUsd(countryCode);

  const fxCacheRef = useRef<Map<string, CurrencyQuote>>(new Map());
  const [fxQuote, setFxQuote] = useState<CurrencyQuote | null>(null);
  const [fxLoading, setFxLoading] = useState(false);
  const [fxError, setFxError] = useState(false);

  useEffect(() => {
    const cur = displayCurrency;
    setFxError(false);

    if (cur === 'USD') {
      setFxQuote(null);
      setFxLoading(false);
      return;
    }

    const cached = fxCacheRef.current.get(cur);
    if (cached) {
      setFxQuote(cached);
      setFxLoading(false);
      return;
    }

    // Keep any prior quote only if it matches this currency (avoids PKR flashing at rate 1).
    setFxQuote((prev) => (prev?.currency === cur ? prev : null));
    setFxLoading(true);
    const ac = new AbortController();
    fetchUsdTo(cur, ac.signal)
      .then((q) => {
        const next = { ...q, currency: cur };
        fxCacheRef.current.set(cur, next);
        setFxQuote(next);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setFxQuote(null);
          // Static table covers common countries; only surface an error when we have neither.
          if (getStaticPerUsd(countryCode) == null) setFxError(true);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setFxLoading(false);
      });
    return () => ac.abort();
  }, [displayCurrency, countryCode]);

  const liveRate =
    fxQuote && fxQuote.currency === displayCurrency && !fxLoading ? fxQuote.rate : null;
  const rate =
    displayCurrency === 'USD' ? null : (liveRate ?? staticPerUsd ?? null);
  const showLocal = rate != null;
  const approxMonthly = showLocal
    ? formatMoneyApprox(USD_MONTHLY * rate, displayCurrency, moneyLocale)
    : null;
  const approxYearly = showLocal
    ? formatMoneyApprox(USD_YEARLY * rate, displayCurrency, moneyLocale)
    : null;

  const highlights = t('pricing.plans.highlights', { returnObjects: true }) as string[];

  const plans = [
    { id: 'monthly' as const, usd: USD_MONTHLY, featured: false, approx: approxMonthly },
    { id: 'yearly' as const, usd: USD_YEARLY, featured: true, approx: approxYearly },
  ];

  return (
    <section
      id="plans"
      className="border-border relative overflow-hidden border-y bg-surface scroll-mt-28 dark:bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_88%_0%,color-mix(in_srgb,var(--brand)_10%,transparent),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_88%_0%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_50%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 md:py-32 md:pb-36">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <motion.div
            className="space-y-6 lg:sticky lg:top-28 lg:col-span-4 lg:self-start"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: motionEase }}
          >
            <span className="border-border/70 bg-background/80 text-muted-foreground inline-flex rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase">
              {t('pricing.plans.eyebrow')}
            </span>
            <h2 className="text-foreground text-section-heading">{t('pricing.plans.title')}</h2>
            <p className="text-muted-foreground max-w-[34ch] text-base leading-7 sm:text-lg sm:leading-8">
              {t('pricing.plans.body')}
            </p>

            <div className="space-y-2">
              <label htmlFor="pricing-country" className="text-foreground text-sm font-medium">
                {t('pricing.plans.yourCountry')}
              </label>
              <p className="text-muted-foreground text-xs leading-5">{t('pricing.plans.countryHelp')}</p>
              <div className="relative mt-2">
                <IconGlobe
                  className="text-brand/70 pointer-events-none absolute start-3.5 top-1/2 z-10 size-5 -translate-y-1/2"
                  stroke={1.5}
                  aria-hidden
                />
                <Select<CountryOption>
                  inputId="pricing-country"
                  isSearchable
                  isClearable={false}
                  menuPosition="fixed"
                  menuPlacement="auto"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  options={COUNTRY_OPTIONS}
                  value={selectedCountry}
                  onChange={(opt) => setCountryCode(opt?.value ?? DEFAULT_COUNTRY)}
                  placeholder={t('pricing.plans.searchCountryPlaceholder')}
                  noOptionsMessage={() => t('pricing.plans.noCountryFound')}
                  formatOptionLabel={(opt) => (
                    <span className="flex items-center gap-2">
                      {opt.flagUrl ? (
                        <img src={opt.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded object-cover" />
                      ) : null}
                      <span>
                        {opt.label} · {getCurrencyForCountry(opt.value) ?? 'USD'}
                      </span>
                    </span>
                  )}
                  classNamePrefix="pricing-select"
                  unstyled
                  classNames={{
                    control: ({ isFocused }) =>
                      cn(
                        'pricing-select__control flex min-h-12 items-center rounded-2xl border bg-background ps-10 pe-3 text-sm',
                        isFocused ? 'border-brand ring-brand/20 ring-4' : 'border-border/70',
                      ),
                    menu: () =>
                      'pricing-select__menu z-[9999] mt-1 overflow-hidden rounded-[14px] border border-border/70 bg-background shadow-lg',
                    menuPortal: () => 'z-[9999]',
                    option: ({ isFocused, isSelected }) =>
                      cn(
                        'cursor-pointer px-3 py-2 text-sm',
                        isSelected && 'bg-brand/10 text-brand-800 dark:bg-brand-950 dark:text-brand-200',
                        !isSelected && isFocused && 'bg-muted',
                        !isSelected && !isFocused && 'text-foreground',
                      ),
                    placeholder: () => 'text-muted-foreground',
                    input: () => 'text-foreground',
                    singleValue: () => 'font-semibold text-foreground',
                    noOptionsMessage: () => 'px-3 py-2 text-sm text-muted-foreground',
                  }}
                />
              </div>
              {fxLoading && staticPerUsd == null && displayCurrency !== 'USD' ? (
                <span className="text-muted-foreground text-xs font-medium" aria-live="polite">
                  {t('pricing.plans.updatingRates')}
                </span>
              ) : null}
              {fxError ? (
                <p
                  className="border-destructive/30 bg-destructive/10 text-destructive mt-3 rounded-xl border px-3 py-2 text-xs font-medium"
                  role="alert"
                >
                  {t('pricing.plans.fxError')}
                </p>
              ) : null}
            </div>

            <div
              role="tablist"
              aria-label={t('pricing.plans.billingCycle')}
              className="bg-background ring-border/60 relative hidden w-full rounded-full p-1 ring-1 lg:inline-flex"
            >
              {(['monthly', 'yearly'] as const).map((id) => {
                const selected = cycle === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setCycle(id)}
                    className={cn(
                      'relative z-10 h-10 flex-1 cursor-pointer rounded-full text-sm font-medium transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                      selected
                        ? 'text-brand-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {selected ? (
                      <motion.span
                        layoutId={reduce ? undefined : 'pricing-cycle-pill'}
                        className="bg-brand absolute inset-0 rounded-full"
                        transition={{ duration: 0.45, ease: motionEase }}
                      />
                    ) : null}
                    <span className="relative z-10">{t(`pricing.plans.${id}.label`)}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-8"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.8,
              delay: reduce ? 0 : 0.06,
              ease: motionEase,
            }}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-0">
              {plans.map((plan) => {
                const active = cycle === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'w-full lg:w-1/2',
                      plan.featured ? 'lg:relative lg:z-10 lg:-ml-4 lg:mt-0' : 'lg:mt-8',
                      !reduce && plan.featured ? 'lg:rotate-[1.25deg]' : '',
                      !reduce && !plan.featured ? 'lg:-rotate-[1.25deg]' : '',
                      !reduce && !active && 'lg:scale-[0.98] lg:opacity-[0.88]',
                    )}
                  >
                    <BezelShell
                      className={cn('h-full rounded-[2rem]', active ? 'ring-brand/25' : '')}
                      innerClassName={cn(
                        'flex h-full flex-col rounded-[calc(2rem-0.375rem)] p-6 sm:p-7',
                        plan.featured
                          ? 'bg-[color-mix(in_srgb,var(--brand)_6%,var(--background))] dark:bg-[color-mix(in_srgb,var(--brand)_14%,var(--card))]'
                          : '',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-medium tracking-[0.2em] uppercase">
                          <span className="text-brand">{t(`pricing.plans.${plan.id}.label`)}</span>
                        </p>
                        {plan.featured ? (
                          <span className="bg-brand/10 text-brand rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] uppercase">
                            {t('pricing.plans.save', {
                              amount: formatSubscriptionUsd(USD_SAVE_YEARLY),
                            })}
                          </span>
                        ) : null}
                      </div>

                      <p className="text-foreground mt-5 flex items-end gap-1.5">
                        <span className="text-5xl font-semibold tracking-tight tabular-nums">
                          {formatSubscriptionUsd(plan.usd)}
                        </span>
                        <span className="text-muted-foreground mb-1.5 text-sm">
                          {t(`pricing.plans.${plan.id}.cadence`)}
                        </span>
                      </p>

                      <p className="text-muted-foreground mt-1 text-xs leading-5">
                        {plan.approx
                          ? t(
                              plan.id === 'monthly'
                                ? 'pricing.plans.approxPerMonth'
                                : 'pricing.plans.approxPerYear',
                              { amount: plan.approx },
                            )
                          : t('pricing.plans.afterTrial')}
                      </p>
                      <p className="text-muted-foreground mt-4 max-w-[32ch] text-sm leading-6">
                        {t(`pricing.plans.${plan.id}.blurb`)}
                      </p>

                      <Link
                        to="/signup"
                        className={cn(
                          'group mt-8 inline-flex h-12 w-full items-center justify-between rounded-full px-5 text-sm font-medium transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]',
                          plan.featured
                            ? 'bg-brand text-brand-foreground hover:bg-[color-mix(in_srgb,var(--brand)_88%,black)]'
                            : 'border-border/70 bg-background text-foreground hover:bg-muted/50 border',
                        )}
                      >
                        {t(`pricing.plans.${plan.id}.cta`)}
                        <span
                          className={cn(
                            'inline-flex size-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105',
                            plan.featured
                              ? 'bg-background/15'
                              : 'bg-foreground/5 dark:bg-white/10',
                          )}
                        >
                          <IconArrowUpRight className="size-4" stroke={1.5} />
                        </span>
                      </Link>
                    </BezelShell>
                  </div>
                );
              })}
            </div>

            <BezelShell
              className="mt-6 rounded-[1.5rem]"
              innerClassName="rounded-[calc(1.5rem-0.375rem)] p-5 sm:p-6"
            >
              <ul className="grid gap-2 sm:grid-cols-3">
                {highlights.map((line) => (
                  <li
                    key={line}
                    className="text-foreground/90 flex items-start gap-2 text-sm leading-6"
                  >
                    <span className="bg-brand/10 text-brand mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                      <IconCheck className="size-3" stroke={1.5} aria-hidden />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </BezelShell>

            <BezelShell
              className="mt-5 rounded-[1.5rem]"
              innerClassName="flex flex-col gap-3 rounded-[calc(1.5rem-0.375rem)] p-5 sm:flex-row sm:items-center sm:gap-4 sm:p-6"
            >
              <div className="bg-brand/10 text-brand inline-flex size-11 shrink-0 items-center justify-center rounded-2xl">
                <IconCheck className="size-5" stroke={1.5} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-foreground text-sm font-semibold">{t('pricing.plans.trustTitle')}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">{t('pricing.plans.trustBody')}</p>
              </div>
            </BezelShell>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
