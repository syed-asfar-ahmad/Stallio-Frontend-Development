import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowRight, Sparkles, Check, Droplets, ShieldCheck, Sprout, Sun, Apple, Heart } from 'lucide-react';
import type { ReactNode } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import type { ShopCategory } from '../../../../types';

/** Micro-tag badge with subtle background and crisp uppercase typography */
export function PacificPillTag({
  children,
  icon: Icon = Sprout,
  className = '',
}: {
  children: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] shadow-sm transition-all ${className}`}
      style={{
        background: 'var(--theme-primary-light)',
        color: 'var(--theme-primary)',
        border: '1px solid var(--theme-border)',
      }}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

/** Editorial section header with balanced typography, serif title, and optional view-all action */
export function PacificEditorialHeader({
  tag,
  tagIcon,
  title,
  body,
  actionTo,
  actionLabel,
  align = 'center',
  className = '',
}: {
  tag?: string;
  tagIcon?: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  actionTo?: string;
  actionLabel?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  const isLeft = align === 'left';
  return (
    <div
      className={`flex flex-col md:flex-row ${
        isLeft ? 'items-start md:items-end justify-between' : 'items-center text-center justify-center'
      } gap-4 mb-8 lg:mb-12 ${className}`}
    >
      <div className={isLeft ? 'max-w-2xl text-start' : 'max-w-2xl mx-auto'}>
        {tag && (
          <div className={`mb-3 ${isLeft ? 'flex justify-start' : 'flex justify-center'}`}>
            <PacificPillTag icon={tagIcon}>{tag}</PacificPillTag>
          </div>
        )}
        <h2
          className="text-2.5xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-theme-text leading-[1.12]"
          style={{
            fontFamily: 'var(--theme-font-heading)',
            letterSpacing: 'var(--theme-heading-spacing)',
            textWrap: 'balance' as never,
          }}
        >
          {title}
        </h2>
        {body && (
          <p className="mt-3 text-sm sm:text-base text-theme-text-muted leading-relaxed max-w-xl mx-auto">
            {body}
          </p>
        )}
      </div>

      {actionTo && actionLabel && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase no-underline transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm shrink-0"
          style={{
            background: 'var(--theme-surface-secondary)',
            color: 'var(--theme-text-primary)',
            border: '1px solid var(--theme-border)',
          }}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 text-theme-primary" />
        </Link>
      )}
    </div>
  );
}

/** 4-Pillar Quality and Sourcing Guarantee Matrix */
export function PacificSourcingPillars({ className = '' }: { className?: string }) {
  const pillars = [
    {
      icon: Sprout,
      title: 'Regenerative Estates',
      desc: 'Cultivated in living soil without synthetic pesticides, honoring natural biodiversity.',
    },
    {
      icon: Droplets,
      title: 'Cold-Chain Purity',
      desc: 'Harvested at peak ripeness and transported in temperature-controlled artisan small batches.',
    },
    {
      icon: Sun,
      title: 'Seasonal Selection',
      desc: 'Rotated with natural growing cycles to ensure peak botanical flavor and highest nutrient density.',
    },
    {
      icon: ShieldCheck,
      title: '100% Traceable',
      desc: 'Direct partnerships with independent growers, ensuring complete origin transparency.',
    },
  ];

  return (
    <section className={`w-full ${className}`}>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 lg:p-10 rounded-[var(--theme-radius-card)] border shadow-[var(--theme-shadow-card)]"
        style={{
          background: 'linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)',
          borderColor: 'var(--theme-border)',
        }}
      >
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={i}
              className="flex flex-col gap-3 p-4 sm:p-5 rounded-[calc(var(--theme-radius-card)*0.75)] border transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full shadow-sm"
                style={{
                  background: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4
                  className="text-base font-bold tracking-tight text-theme-text"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {p.title}
                </h4>
                <p className="mt-1 text-xs text-theme-text-muted leading-relaxed">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Editorial Category Mosaic */
export function PacificCategoryMosaic({
  categories,
  username,
  counts = {},
}: {
  categories: ShopCategory[];
  username: string;
  counts?: Record<string, number>;
}) {
  const { categoryName, t } = useShopLanguage();
  if (categories.length === 0) return null;

  const first = categories[0];
  const second = categories[1];
  const third = categories[2];
  const rest = categories.slice(3, 7);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
      {/* Primary featured large tile */}
      {first && (
        <Link
          to={`/${username}/category/${first.slug}`}
          className="group relative md:col-span-7 isolate flex min-h-[22rem] sm:min-h-[26rem] lg:min-h-[32rem] flex-col justify-end overflow-hidden rounded-[var(--theme-radius-card)] border p-6 sm:p-8 lg:p-10 no-underline shadow-[var(--theme-shadow-card)] transition-all duration-500 hover:-translate-y-1"
          style={{
            borderColor: 'var(--theme-border)',
            background: 'var(--theme-surface-secondary)',
          }}
        >
          {first.image ? (
            <img
              src={first.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900/20 to-transparent">
              <Sprout className="w-16 h-16 opacity-20 text-theme-primary" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md bg-white/20 border border-white/25">
              <span>Featured Harvest</span>
              {counts[first.slug] != null && <span>• {counts[first.slug]} Provisions</span>}
            </span>
            <h3
              className="text-2xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {categoryName(first)}
            </h3>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 pt-1">
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      )}

      {/* Secondary stacked column */}
      <div className="md:col-span-5 flex flex-col gap-4 lg:gap-6">
        {second && (
          <Link
            to={`/${username}/category/${second.slug}`}
            className="group relative isolate flex flex-1 min-h-[14rem] sm:min-h-[16rem] flex-col justify-end overflow-hidden rounded-[var(--theme-radius-card)] border p-5 sm:p-6 no-underline shadow-[var(--theme-shadow-card)] transition-all duration-500 hover:-translate-y-1"
            style={{
              borderColor: 'var(--theme-border)',
              background: 'var(--theme-surface-secondary)',
            }}
          >
            {second.image ? (
              <img
                src={second.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                {counts[second.slug] != null ? `${counts[second.slug]} items` : 'Artisanal'}
              </span>
              <h3
                className="text-xl sm:text-2xl font-normal text-white tracking-tight"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {categoryName(second)}
              </h3>
            </div>
          </Link>
        )}

        {third && (
          <Link
            to={`/${username}/category/${third.slug}`}
            className="group relative isolate flex flex-1 min-h-[14rem] sm:min-h-[16rem] flex-col justify-end overflow-hidden rounded-[var(--theme-radius-card)] border p-5 sm:p-6 no-underline shadow-[var(--theme-shadow-card)] transition-all duration-500 hover:-translate-y-1"
            style={{
              borderColor: 'var(--theme-border)',
              background: 'var(--theme-surface-secondary)',
            }}
          >
            {third.image ? (
              <img
                src={third.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                {counts[third.slug] != null ? `${counts[third.slug]} items` : 'Artisanal'}
              </span>
              <h3
                className="text-xl sm:text-2xl font-normal text-white tracking-tight"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {categoryName(third)}
              </h3>
            </div>
          </Link>
        )}
      </div>

      {/* Additional grid tiles */}
      {rest.length > 0 && (
        <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {rest.map((c) => (
            <Link
              key={c.slug}
              to={`/${username}/category/${c.slug}`}
              className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[var(--theme-radius-card)] border p-4 no-underline shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
              style={{
                borderColor: 'var(--theme-border)',
                background: 'var(--theme-surface-secondary)',
              }}
            >
              {c.image ? (
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="relative z-10">
                <h4
                  className="text-base sm:text-lg font-normal text-white tracking-tight"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {categoryName(c)}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Individual Refined Category Card */
export function PacificCategoryCard({
  category: c,
  shopUsername,
  productCount,
}: {
  category: ShopCategory;
  shopUsername: string;
  productCount: number;
}) {
  const { categoryName, t } = useShopLanguage();
  const displayName = categoryName(c);

  return (
    <Link
      to={`/${shopUsername}/category/${c.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[var(--theme-radius-card)] border no-underline shadow-[var(--theme-shadow-card)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--theme-shadow-card-hover)]"
      style={{
        borderColor: 'var(--theme-border)',
        background: 'var(--theme-surface)',
      }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: 'var(--theme-surface-secondary)' }}>
        {c.image ? (
          <img
            src={c.image}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-theme-primary/10 via-theme-primary/5 to-transparent">
            <Sprout className="h-10 w-10 text-theme-primary opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md bg-black/30 border border-white/20">
          {productCount === 1 ? t('categoryCountOne', { count: productCount }) : t('categoryCountMany', { count: productCount })}
        </span>
      </div>

      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <h3
          className="text-base sm:text-lg font-semibold text-theme-text tracking-tight group-hover:text-theme-primary transition-colors"
          style={{ fontFamily: 'var(--theme-font-heading)' }}
        >
          {displayName}
        </h3>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] group-hover:border-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)] group-hover:text-[var(--theme-primary-contrast)] transition-all">
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}
