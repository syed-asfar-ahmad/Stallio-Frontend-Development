import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { Product } from '../../../../types';

/* Fixed brand colours (lime + espresso are identical in light and dark). */
export const FRESH_LIME = '#a0d422';
export const FRESH_LIME_SOFT = '#d3e8a3';
export const FRESH_INK = '#1e1611';
export const FRESH_CREAM = '#f6f1e9';

/** Pastel arch / blob colours that sit behind products (mint, pink, butter, lavender, aqua, peach). */
export const FRESH_SHAPES = ['#cfeccb', '#f9d3d9', '#fbeaa8', '#dcd3f0', '#c8eef0', '#fbd9c2'];

/** Peach tile background, tinted from theme tokens so it also works in dark mode. */
export const FRESH_PEACH = 'color-mix(in srgb, #f4b183 13%, var(--theme-surface))';
export const FRESH_BEIGE = 'color-mix(in srgb, var(--theme-text-primary) 6%, var(--theme-surface))';

/** Deterministic pastel pick so a product always gets the same colour. */
export function shapeFor(key: string, offset = 0): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FRESH_SHAPES[(h + offset) % FRESH_SHAPES.length];
}

export function isRecentlyAdded(p: Product, days = 30): boolean {
  const raw = p.createdAt;
  if (!raw) return false;
  const ts = new Date(raw).getTime();
  return Number.isFinite(ts) && Date.now() - ts < days * 86_400_000;
}

/** Left-aligned serif heading with an optional lime action button. */
export function FreshHeading({
  title,
  action,
  center = false,
  body,
  as: Tag = 'h2',
}: {
  title: string;
  action?: { to: string; label: string };
  center?: boolean;
  body?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={`mb-7 flex gap-4 lg:mb-10 ${center ? 'flex-col items-center text-center' : 'items-end justify-between'}`}>
      <div className="min-w-0">
        <Tag
          className="text-[1.75rem] font-medium leading-[1.1] sm:text-4xl"
          style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.025em' }}
        >
          {title}
        </Tag>
        {body ? (
          <p className={`mt-2.5 max-w-md text-sm leading-relaxed ${center ? 'mx-auto' : ''}`} style={{ color: 'var(--theme-text-muted)' }}>
            {body}
          </p>
        ) : null}
      </div>
      {action ? <FreshButton to={action.to} size="sm">{action.label}</FreshButton> : null}
    </div>
  );
}

/** Lime button (ink text) or ink button. Rendered as a router link. */
export function FreshButton({
  to,
  children,
  variant = 'lime',
  size = 'md',
  arrow = false,
}: {
  to: string;
  children: ReactNode;
  variant?: 'lime' | 'ink' | 'cream';
  size?: 'sm' | 'md';
  arrow?: boolean;
}) {
  const styles: Record<string, CSSProperties> = {
    lime: { background: FRESH_LIME, color: FRESH_INK },
    ink: { background: FRESH_INK, color: FRESH_CREAM },
    cream: { background: FRESH_CREAM, color: FRESH_INK },
  };
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold no-underline transition-all hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7aa012] ${
        size === 'sm' ? 'h-9 px-5 text-xs' : 'h-11 px-7 text-sm'
      }`}
      style={styles[variant]}
    >
      {children}
      {arrow ? <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden /> : null}
    </Link>
  );
}
