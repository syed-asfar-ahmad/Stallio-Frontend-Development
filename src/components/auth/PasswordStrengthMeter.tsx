import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getPasswordStrength } from '@/lib/passwordStrength';
import { cn } from '@/lib/utils';

type PasswordStrengthMeterProps = {
  password: string;
  className?: string;
};

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const { t } = useTranslation();
  const {
    score,
    strengthKey,
    color,
    hasMinLen,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
  } = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  const labelClass =
    score <= 1
      ? 'text-red-600 dark:text-red-400'
      : score === 2
        ? 'text-amber-600 dark:text-amber-400'
        : score === 3
          ? 'text-lime-600 dark:text-lime-400'
          : 'text-brand-600 dark:text-brand-400';

  const rules = [
    { ok: hasMinLen, label: t('auth.signup.rules.min8') },
    { ok: hasLower, label: t('auth.signup.rules.lower') },
    { ok: hasUpper, label: t('auth.signup.rules.upper') },
    { ok: hasNumber, label: t('auth.signup.rules.number') },
    { ok: hasSpecial, label: t('auth.signup.rules.special') },
  ] as const;

  return (
    <div className={cn('mt-2', className)}>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i <= score ? color : 'bg-stone-200 dark:bg-zinc-600',
            )}
          />
        ))}
      </div>
      <p className={cn('mt-1.5 text-xs font-medium', labelClass)}>
        {t('auth.signup.passwordStrength')}{' '}
        {strengthKey ? t(`auth.signup.strength.${strengthKey}`) : ''}
      </p>
      <ul className="text-muted-foreground mt-1 space-y-0.5 text-[0.7rem] sm:text-xs">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={cn(rule.ok && 'text-brand-600 dark:text-brand-400')}
          >
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
