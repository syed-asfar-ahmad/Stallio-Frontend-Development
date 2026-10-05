import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useShopLanguage } from '../../context/ShopLanguageContext';

type Props = {
  title: string;
  description?: string;
  trailing?: ReactNode;
};

export function ShopActionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-semibold no-underline transition-opacity hover:opacity-75"
      style={{ color: 'var(--theme-primary)' }}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" aria-hidden />
    </Link>
  );
}

export function ShopViewAllLink({ to }: { to: string }) {
  const { t } = useShopLanguage();
  return <ShopActionLink to={to}>{t('linkViewAll')}</ShopActionLink>;
}

export default function ShopSectionHeading({ title, description, trailing }: Props) {
  return (
    <div className="mb-4 lg:mb-6">
      <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="min-w-0 flex-1">
          <h2
            className="text-lg font-bold leading-tight tracking-tight lg:text-xl"
            style={{
              color: 'var(--theme-text-primary)',
              fontFamily: 'var(--theme-font-heading, inherit)',
              letterSpacing: 'var(--theme-heading-spacing)',
            }}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed lg:text-sm" style={{ color: 'var(--theme-text-muted)' }}>
              {description}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
      </div>
    </div>
  );
}
