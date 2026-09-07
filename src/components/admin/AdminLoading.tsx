import { useTranslation } from 'react-i18next';

type Props = {
  message?: string;
  compact?: boolean;
};

function AdminLoadingDots({
  dotSize,
  gap,
  className = '',
}: {
  dotSize: string;
  gap: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center ${gap} ${className}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${dotSize} rounded-full bg-brand-500 dark:bg-brand-400 animate-admin-loader-dot motion-reduce:animate-none`}
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

export function AdminLoadingInline({
  className = '',
  light = false,
  dotsOnly = false,
}: {
  className?: string;
  light?: boolean;
  dotsOnly?: boolean;
}) {
  const { t } = useTranslation();
  const dotClass = light ? 'bg-white/90' : 'bg-brand-500 dark:bg-brand-400';
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('dashboard.common.loadingAria')}
    >
      {!dotsOnly ? (
        <img
          src="/assets/logo.png"
          alt=""
          className="h-4 w-4 shrink-0 object-contain animate-admin-loader-float motion-reduce:animate-none"
        />
      ) : null}
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1 w-1 rounded-full ${dotClass} animate-admin-loader-dot motion-reduce:animate-none`}
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </span>
    </span>
  );
}

export default function AdminLoading({ message, compact = false }: Props) {
  const logo = compact ? 'h-9 w-9' : 'h-14 w-14';
  const minH = compact ? 'py-8' : 'min-h-[280px] py-16';
  const dotsGap = compact ? 'mt-3 gap-1' : 'mt-5 gap-1.5';
  const dotSize = compact ? 'h-1 w-1' : 'h-1.5 w-1.5';

  return (
    <div
      className={`flex w-full flex-col items-center justify-center ${minH}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message || 'Loading'}
    >
      <img
        src="/assets/logo.png"
        alt=""
        className={`${logo} object-contain animate-admin-loader-float motion-reduce:animate-none`}
      />

      <AdminLoadingDots dotSize={dotSize} gap={dotsGap} />

      {message ? (
        <p
          className={`mt-4 text-center font-medium text-stone-500 dark:text-zinc-400 ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {message}
        </p>
      ) : null}
      <span className="sr-only">Loading</span>
    </div>
  );
}
