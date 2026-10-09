import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type BezelShellProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  as?: ElementType;
};

/** Nested shell + core surface used across marketing sections. */
export function BezelShell({
  children,
  className,
  innerClassName,
  as: Comp = "div",
}: BezelShellProps) {
  return (
    <Comp
      className={cn(
        "bg-foreground/[0.03] ring-border/50 rounded-[1.75rem] p-1.5 ring-1",
        className,
      )}
    >
      <div
        className={cn(
          "bg-background dark:bg-card rounded-[calc(1.75rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Comp>
  );
}
