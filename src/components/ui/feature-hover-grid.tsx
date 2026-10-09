
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FeatureHoverItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

type FeatureHoverGridProps = {
  items: FeatureHoverItem[];
  className?: string;
};

/**
 * Aceternity Features Section With Hover Effects: connected lattice grid.
 * @see https://ui.aceternity.com/blocks/feature-sections/simple-with-hover-effects
 */
export function FeatureHoverGrid({
  items,
  className,
}: FeatureHoverGridProps) {
  const columns = 3;
  const lastRowStart = Math.floor((items.length - 1) / columns) * columns;

  return (
    <div
      className={cn(
        "relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, index) => {
        const isFirstInLgRow = index % columns === 0;
        const showBottomBorder = index < lastRowStart;
        const washFromBottom = index < columns * 2;

        return (
          <div
            key={item.title}
            className={cn(
              "group/feature relative flex flex-col py-8 md:py-10",
              "border-border/55 border-b last:border-b-0",
              "md:border-border/55 md:border-r md:[&:nth-child(even)]:border-r-0 md:border-b",
              "lg:border-border/55 lg:border-r lg:[&:nth-child(3n)]:border-r-0",
              isFirstInLgRow && "lg:border-l",
              showBottomBorder ? "lg:border-b" : "lg:border-b-0",
            )}
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/feature:opacity-100",
                washFromBottom
                  ? "bg-gradient-to-t from-brand/[0.07] to-transparent dark:from-brand/[0.14]"
                  : "bg-gradient-to-b from-brand/[0.07] to-transparent dark:from-brand/[0.14]",
              )}
            />

            <div className="text-brand relative z-10 mb-4 px-6 md:px-8 [&>svg]:size-6">
              {item.icon}
            </div>

            <div className="relative z-10 mb-2 px-6 md:px-8">
              <div
                aria-hidden
                className="bg-border absolute inset-y-0 left-0 my-auto h-6 w-1 origin-center rounded-tr-full rounded-br-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/feature:h-8 group-hover/feature:bg-brand"
              />
              <h3 className="text-foreground inline-block text-base font-semibold tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/feature:translate-x-1.5 md:text-lg">
                {item.title}
              </h3>
            </div>

            <p className="text-muted-foreground relative z-10 max-w-[30ch] px-6 text-sm leading-6 md:px-8 md:leading-7">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
