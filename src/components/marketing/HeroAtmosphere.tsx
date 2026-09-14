import { useReducedMotion } from 'motion/react';

import { SparklesCore } from '@/components/ui/sparkles';
import { cn } from '@/lib/utils';

/** Pulls the hero under the sticky header so gradients + sparkles fill the nav band. */
export const heroBleedClassName =
  'relative isolate overflow-hidden -mt-[4.75rem] pt-[4.75rem]';

const BRAND_SPARKLE = '#5E2BEC';

type HeroAtmosphereProps = {
  sparkleId: string;
  className?: string;
  variant?: 'home' | 'default';
};

/** Shared hero backdrop: surface, brand washes, sparkles behind the sticky nav. */
export function HeroAtmosphere({
  sparkleId,
  className,
  variant = 'default',
}: HeroAtmosphereProps) {
  const reduce = useReducedMotion();
  const isHome = variant === 'home';

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white dark:bg-zinc-950',
        className,
      )}
    >
      <div className="absolute -top-28 left-[18%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(94,43,236,0.22),transparent_72%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(94,43,236,0.34),transparent_72%)]" />
      <div className="absolute top-[35%] right-[8%] h-[380px] w-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.18),transparent_70%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.14),transparent_70%)]" />

      {!reduce ? (
        <SparklesCore
          id={sparkleId}
          background="transparent"
          minSize={0.3}
          maxSize={1.1}
          particleDensity={isHome ? 48 : 36}
          speed={2.4}
          className="absolute inset-0 h-full w-full"
          particleColor={BRAND_SPARKLE}
        />
      ) : null}
    </div>
  );
}
