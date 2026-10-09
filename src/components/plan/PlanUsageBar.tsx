import { limitFraction } from '../../lib/sellerPlanLimits';

interface PlanUsageBarProps {
  count: number;
  max: number | null;
  label: string;
  limitReached: boolean;
  className?: string;
}

/**
 * A small progress bar + counter that shows plan usage inline.
 * Renders nothing when max === null (unlimited).
 */
export default function PlanUsageBar({
  count,
  max,
  label,
  limitReached,
  className = '',
}: PlanUsageBarProps) {
  const fraction = limitFraction(count, max);
  if (fraction === null) return null; 

  const pct = Math.round(fraction * 100);
  const isWarning = pct >= 80 && !limitReached;
  const isDanger = limitReached;

  const barColor = isDanger
    ? 'bg-red-500'
    : isWarning
      ? 'bg-amber-500'
      : 'bg-brand-500';

  const textColor = isDanger
    ? 'text-red-500 dark:text-red-400 font-semibold'
    : isWarning
      ? 'text-amber-600 dark:text-amber-400 font-medium'
      : 'text-stone-500 dark:text-zinc-500';

  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      {/* Label */}
      <p className={`text-xs leading-none ${textColor}`}>{label}</p>
      {/* Bar track */}
      <div
        className="h-1 w-full rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={max ?? undefined}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
