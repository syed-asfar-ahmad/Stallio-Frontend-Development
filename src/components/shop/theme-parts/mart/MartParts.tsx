import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, LayoutGrid } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useShopLanguage } from '../../../../context/ShopLanguageContext';
import type { Product, ShopCategory } from '../../../../types';

/* ───────────── Palette for fixed-colour surfaces (bands, footer, banners) ───────────── */
export const MART_DEEP = '#0c4a43';
export const MART_INK = MART_DEEP;
export const MART_ORANGE = '#f5a623';
export const MART_BLUE = MART_ORANGE; // alias used by page layouts
export const MART_TEXT = '#ffffff';
export const MART_SOFT = 'rgb(255 255 255 / 0.74)';
export const MART_HAIR = 'rgb(255 255 255 / 0.16)';
export const MART_ORANGE_INK = '#2a1a00'; // readable text on orange

/** Soft sheen used on deep-teal panels. */
export const MART_GRID_BG: CSSProperties = {
  background: 'radial-gradient(60% 90% at 92% 0%, rgb(255 255 255 / 0.10), transparent 60%)',
};
export const MART_STAGE_BG = 'var(--theme-surface)';

/** Pastel tints derived from theme tokens so they also work in dark mode. */
export const MART_TINTS = [
  'color-mix(in srgb, var(--theme-primary) 9%, var(--theme-surface))',
  'color-mix(in srgb, var(--theme-secondary) 14%, var(--theme-surface))',
  'color-mix(in srgb, #3b82f6 9%, var(--theme-surface))',
  'color-mix(in srgb, #facc15 16%, var(--theme-surface))',
];

/** Small outlined pill label ("Women's Fashion", "Super Sale 50%"). */
export function MartEyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium leading-none"
      style={
        dark
          ? { borderColor: MART_HAIR, color: MART_TEXT, background: 'rgb(255 255 255 / 0.08)' }
          : { borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)', background: 'var(--theme-surface)' }
      }
    >
      {children}
    </span>
  );
}

/** Section heading. `center` for storefront sections; left + action for catalog pages; `tone="dark"` on teal bands. */
export function MartSectionHeader({
  eyebrow,
  title,
  body,
  action,
  center = false,
  tone = 'light',
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: { to: string; label: string };
  center?: boolean;
  tone?: 'light' | 'dark';
  as?: 'h1' | 'h2';
}) {
  const dark = tone === 'dark';
  const headingColor = dark ? MART_TEXT : 'var(--theme-text-primary)';
  const bodyColor = dark ? MART_SOFT : 'var(--theme-text-muted)';
  return (
    <div className={`mb-7 flex gap-4 lg:mb-9 ${center ? 'flex-col items-center text-center' : 'items-end justify-between'}`}>
      <div className="min-w-0">
        {eyebrow ? <MartEyebrow dark={dark}>{eyebrow}</MartEyebrow> : null}
        <Tag
          className={`${eyebrow ? 'mt-3' : ''} text-[1.5rem] font-bold leading-tight sm:text-[1.75rem]`}
          style={{ color: headingColor, fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.025em' }}
        >
          {title}
        </Tag>
        {body ? (
          <p className={`mt-2 max-w-md text-sm leading-relaxed ${center ? 'mx-auto' : ''}`} style={{ color: bodyColor }}>
            {body}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold no-underline transition-colors"
          style={
            dark
              ? { borderColor: MART_HAIR, color: MART_TEXT }
              : { borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)', background: 'var(--theme-surface)' }
          }
        >
          {action.label}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

/** Stock indicator: dot + label. */
export function MartStock({ product }: { product: Product }) {
  const { t } = useShopLanguage();
  const out = product.inStock === false;
  const qty = product.stockQuantity;
  const low = !out && typeof qty === 'number' && qty > 0 && qty <= 5;
  const color = out ? '#ef4444' : low ? '#f59e0b' : '#10b981';
  const label = out ? t('badgeSoldOut') : low ? t('lowStockLabel', { n: qty as number }) : t('inStockLabel');
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Pill button for hero / banners. */
export function MartButton({
  to,
  children,
  variant = 'primary',
}: {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'orange' | 'ghost' | 'light';
}) {
  const styles: Record<string, CSSProperties> = {
    primary: { background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' },
    orange: { background: MART_ORANGE, color: MART_ORANGE_INK },
    ghost: { background: 'transparent', color: MART_TEXT, border: `1px solid ${MART_HAIR}` },
    light: { background: '#ffffff', color: '#101c1a' },
  };
  return (
    <Link
      to={to}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold no-underline transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)] sm:text-[13px]"
      style={styles[variant]}
    >
      {children}
    </Link>
  );
}

/** Image tile with gradient + arrow, used on category pages. */
export function MartCategoryTile({
  category,
  username,
  count,
  className = '',
  large = false,
}: {
  category: ShopCategory;
  username: string;
  count?: number;
  className?: string;
  large?: boolean;
}) {
  const { t, categoryName } = useShopLanguage();
  return (
    <Link
      to={`/${username}/category/${category.slug}`}
      className={`group relative isolate block overflow-hidden rounded-xl no-underline ${className}`}
      style={{ background: MART_DEEP, boxShadow: 'var(--theme-shadow-card)' }}
    >
      {category.image ? (
        <img
          src={category.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
        />
      ) : (
        <>
          <div aria-hidden className="absolute inset-0" style={MART_GRID_BG} />
          <LayoutGrid className="absolute end-6 top-6 h-10 w-10 text-white/25" strokeWidth={1.25} aria-hidden />
        </>
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'linear-gradient(0deg, rgb(8 46 41 / 0.88) 0%, rgb(8 46 41 / 0.15) 58%, rgb(8 46 41 / 0) 100%)' }}
      />
      <span
        className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#101c1a] transition-colors group-hover:bg-[#f5a623]"
        aria-hidden
      >
        <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
        <p
          className={`font-bold leading-tight text-white ${large ? 'text-3xl lg:text-4xl' : 'text-lg lg:text-xl'}`}
          style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.025em' }}
        >
          {categoryName(category)}
        </p>
        {typeof count === 'number' ? (
          <p className="mt-1 text-xs text-white/75">
            {count} {count === 1 ? t('categoryProduct') : t('categoryProducts')}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

/** Wide pastel promo banner: text on one side, photo fading in from the other. */
export function MartPromoBanner({
  title,
  caption,
  image,
  to,
  tint,
  cta,
  className = '',
}: {
  title: string;
  caption?: string;
  image?: string | null;
  to: string;
  tint: string;
  cta: string;
  className?: string;
}) {
  const { lang } = useShopLanguage();
  const mask = `linear-gradient(${lang === 'ar' ? 270 : 90}deg, transparent 0%, #000 42%)`;
  return (
    <Link
      to={to}
      className={`group relative isolate flex min-h-[11.5rem] overflow-hidden rounded-xl no-underline ${className}`}
      style={{ background: tint, color: 'var(--theme-text-primary)' }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-y-0 end-0 h-full w-[62%] object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        />
      ) : null}
      <div className="relative z-10 flex max-w-[60%] flex-col items-start justify-center gap-2 p-5 sm:p-6">
        {caption ? (
          <span className="text-[11px] font-semibold" style={{ color: 'var(--theme-primary)' }}>
            {caption}
          </span>
        ) : null}
        <p className="text-xl font-bold leading-tight sm:text-2xl" style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.025em' }}>
          {title}
        </p>
        <span
          className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[11px] font-semibold"
          style={{ background: 'var(--theme-primary)', color: 'var(--theme-primary-contrast)' }}
        >
          {cta} <ArrowRight className="h-3 w-3 rtl:-scale-x-100" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
