import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
      className="inline-flex items-center gap-1 text-sm font-semibold text-theme-primary no-underline transition-opacity hover:opacity-80"
    >
      {children}
      <ChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
    </Link>
  );
}

export function ShopViewAllLink({ to }: { to: string }) {
  const { t } = useShopLanguage();
  return <ShopActionLink to={to}>{t('linkViewAll')}</ShopActionLink>;
}

export default function ShopSectionHeading({ title, description, trailing }: Props) {
  return (
    <div className="mb-4 max-lg:mb-4 lg:mb-5">
      <div className="flex items-start justify-between gap-2 max-lg:gap-2 lg:gap-3">
        <div className="min-w-0 flex-1 pe-2">
          <h2 className="text-base max-lg:leading-snug font-bold tracking-tight text-theme-primary lg:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 max-lg:mt-0.5 text-xs max-lg:text-xs leading-relaxed text-theme-muted lg:mt-1 lg:text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-2 pt-0.5">{trailing}</div> : null}
      </div>
    </div>
  );
}
