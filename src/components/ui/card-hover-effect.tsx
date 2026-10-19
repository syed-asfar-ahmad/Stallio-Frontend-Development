
import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { motionEase } from "@/lib/motion";

export type HoverEffectItem = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type HoverEffectProps = {
  items: HoverEffectItem[];
  className?: string;
};

/**
 * Aceternity Card Hover Effect: shared layoutId wash behind floating cards.
 * @see https://ui.aceternity.com/components/card-hover-effect
 */
export function HoverEffect({ items, className }: HoverEffectProps) {
  const reduce = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={item.title} className="min-h-full list-none">
          <div
            className="group relative h-full w-full p-2"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
            tabIndex={0}
          >
            <AnimatePresence>
              {!reduce && hoveredIndex === index && (
                <motion.span
                  className="bg-brand/[0.08] absolute inset-0 block h-full w-full rounded-[1.35rem] dark:bg-brand/[0.14]"
                  layoutId="whyHoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.2, ease: motionEase },
                  }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: 0.2,
                      delay: 0.12,
                      ease: motionEase,
                    },
                  }}
                />
              )}
            </AnimatePresence>
            <div className="bg-background/90 ring-border/50 relative z-20 h-full space-y-3 overflow-hidden rounded-[1.2rem] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] ring-1 md:p-6 dark:bg-card/90">
              {item.icon ? (
                <div className="text-brand [&>svg]:size-6">{item.icon}</div>
              ) : null}
              <h3 className="text-foreground text-base font-semibold tracking-tight md:text-lg">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-6 md:leading-7">
                {item.description}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
