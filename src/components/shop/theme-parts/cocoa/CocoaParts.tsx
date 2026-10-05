import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import type { ReactNode } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import type { ShopCategory } from '../../../../types';

export const COCOA_CREAM = '#f7ead4';
export const COCOA_INK = '#2b1b10';

/** Centered serif section heading with a quiet one-line description (as in the reference). */
export function CocoaHeading({
  title,
  body,
  as: Tag = 'h2',
  className = '',
}: {
  title: string;
  body?: string;
  as?: 'h1' | 'h2';
  className?: string;
}) {
  return (
    <div className={`mx-auto mb-9 max-w-2xl text-center lg:mb-12 ${className}`}>
      <Tag
        className="text-[2rem] font-bold leading-[1.08] sm:text-5xl"
        style={{
          color: 'var(--theme-text-primary)',
          fontFamily: 'var(--theme-font-heading)',
          letterSpacing: '-0.035em',
          textWrap: 'balance' as never,
        }}
      >
        {title}
      </Tag>
      {body ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

/** Outlined, softly raised call-to-action — "See More Collections" in the reference. */
export function CocoaOutlineLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-[var(--theme-radius-btn)] border px-6 py-2.5 text-xs font-semibold no-underline transition-all hover:-translate-y-0.5 hover:bg-[var(--theme-primary-light)]"
      style={{
        borderColor: 'var(--theme-border)',
        background: 'var(--theme-surface-secondary)',
        color: 'var(--theme-text-primary)',
        boxShadow: '0 1px 0 rgb(255 255 255 / 0.7) inset, 0 2px 6px -2px rgb(43 27 16 / 0.18)',
      }}
    >
      {children}
    </Link>
  );
}

function ImageOrFallback({ src, className = '' }: { src?: string | null; className?: string }) {
  return src ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none ${className}`}
    />
  ) : (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, var(--theme-primary-light), var(--theme-surface-secondary))', color: 'var(--theme-primary)' }}
    >
      <LayoutGrid className="h-10 w-10 opacity-40" strokeWidth={1.25} aria-hidden />
    </div>
  );
}

/* ───────────────────────────── Tall promo cards ───────────────────────────── */

export type CocoaPromoItem = {
  key: string;
  title: string;
  caption?: string;
  image?: string | null;
  to: string;
  cta: string;
};

/** Three tall rounded photo cards. Cards 1 and 2 caption at the bottom; card 3 is a centered title. */
export function CocoaPromoCards({ items }: { items: CocoaPromoItem[] }) {
  if (items.length === 0) return null;
  const cols = items.length === 1 ? 'md:grid-cols-1 md:max-w-md md:mx-auto' : items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
  return (
    <div className={`grid grid-cols-1 gap-4 lg:gap-5 ${cols}`}>
      {items.map((it, i) => {
        const centered = items.length >= 3 && i === 2;
        return (
          <Link
            key={it.key}
            to={it.to}
            className="group relative isolate block min-h-[26rem] overflow-hidden rounded-[var(--theme-radius-card)] no-underline md:min-h-[28rem] lg:min-h-[30rem]"
            style={{ background: 'var(--theme-surface-secondary)', boxShadow: 'var(--theme-shadow-card)' }}
          >
            <ImageOrFallback src={it.image} />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: centered
                  ? 'linear-gradient(180deg, rgb(26 15 7 / 0.08), rgb(26 15 7 / 0.22))'
                  : 'linear-gradient(180deg, rgb(43 27 16 / 0.05) 0%, rgb(60 38 20 / 0.28) 45%, rgb(36 22 11 / 0.82) 100%)',
              }}
            />
            {centered ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <span
                  className="text-[2rem] font-medium uppercase leading-none sm:text-4xl"
                  style={{ color: '#fff', fontFamily: 'var(--theme-font-heading)', letterSpacing: '0.01em', textShadow: '0 2px 18px rgb(0 0 0 / 0.35)' }}
                >
                  {it.title}
                </span>
                <span className="rounded-lg bg-white px-5 py-2.5 text-xs font-semibold" style={{ color: COCOA_INK }}>
                  {it.cta}
                </span>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <p className="max-w-[16rem] text-[1.35rem] font-semibold leading-snug text-white lg:text-2xl" style={{ letterSpacing: '-0.015em' }}>
                  {it.title}
                </p>
                {it.caption ? <p className="mt-1.5 text-xs text-white/75">{it.caption}</p> : null}
                <span
                  className="mt-5 inline-flex rounded-lg px-5 py-2.5 text-xs font-semibold transition-colors group-hover:bg-black"
                  style={{ background: '#2b1b10', color: COCOA_CREAM }}
                >
                  {it.cta}
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

/* ───────────────────────────── Collection mosaic ───────────────────────────── */

function MosaicTile({
  category,
  username,
  labelPosition,
  className,
}: {
  category: ShopCategory;
  username: string;
  labelPosition: 'top' | 'bottom';
  className: string;
}) {
  const { t, categoryName } = useShopLanguage();
  const name = categoryName(category);
  return (
    <Link
      to={`/${username}/category/${category.slug}`}
      className={`group relative isolate block overflow-hidden rounded-[var(--theme-radius-card)] no-underline ${className}`}
      style={{ background: 'var(--theme-surface-secondary)' }}
    >
      <ImageOrFallback src={category.image} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            labelPosition === 'top'
              ? 'linear-gradient(180deg, rgb(26 15 7 / 0.38) 0%, rgb(26 15 7 / 0) 55%)'
              : 'linear-gradient(0deg, rgb(26 15 7 / 0.5) 0%, rgb(26 15 7 / 0) 55%)',
        }}
      />
      <div
        className={`absolute inset-x-0 flex flex-col items-start gap-2.5 p-5 lg:p-6 ${
          labelPosition === 'top' ? 'top-0' : 'bottom-0'
        }`}
      >
        <span
          className="text-3xl font-medium leading-none text-white lg:text-[2.1rem]"
          style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em', textShadow: '0 2px 16px rgb(0 0 0 / 0.3)' }}
        >
          {name}
        </span>
        <span className="rounded-lg bg-white px-4 py-2 text-[11px] font-semibold transition-colors group-hover:bg-[#f7ead4]" style={{ color: COCOA_INK }}>
          {t('viewCollection')}
        </span>
      </div>
    </Link>
  );
}

/** Mosaic from the reference: one tall tile, two stacked tiles, then a wide banner. */
export function CocoaMosaic({ categories, username }: { categories: ShopCategory[]; username: string }) {
  const [a, b, c, d] = categories;
  if (!a) return null;

  if (!b) {
    return (
      <div className="grid grid-cols-1">
        <MosaicTile category={a} username={username} labelPosition="bottom" className="min-h-[20rem] sm:min-h-[26rem]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 lg:gap-5">
      <MosaicTile
        category={a}
        username={username}
        labelPosition="bottom"
        className={`min-h-[22rem] sm:col-span-7 ${c ? 'sm:row-span-2 sm:min-h-[34rem]' : 'sm:min-h-[26rem]'}`}
      />
      <MosaicTile category={b} username={username} labelPosition="top" className="min-h-[16rem] sm:col-span-5" />
      {c ? <MosaicTile category={c} username={username} labelPosition="top" className="min-h-[16rem] sm:col-span-5" /> : null}
      {d ? <MosaicTile category={d} username={username} labelPosition="bottom" className="min-h-[13rem] sm:col-span-12 sm:min-h-[17rem]" /> : null}
    </div>
  );
}

/** Tall category tile used in the categories index grid. */
export function CocoaCategoryTile({
  category,
  username,
  count,
}: {
  category: ShopCategory;
  username: string;
  count: number;
}) {
  const { t, categoryName } = useShopLanguage();
  return (
    <Link
      to={`/${username}/category/${category.slug}`}
      className="group relative isolate block aspect-[4/5] overflow-hidden rounded-[var(--theme-radius-card)] no-underline"
      style={{ background: 'var(--theme-surface-secondary)', boxShadow: 'var(--theme-shadow-card)' }}
    >
      <ImageOrFallback src={category.image} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'linear-gradient(0deg, rgb(26 15 7 / 0.7) 0%, rgb(26 15 7 / 0) 58%)' }}
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p
          className="text-2xl font-medium leading-tight text-white"
          style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
        >
          {categoryName(category)}
        </p>
        <p className="mt-1 text-xs text-white/75">
          {count} {count === 1 ? t('categoryProduct') : t('categoryProducts')}
        </p>
      </div>
    </Link>
  );
}
