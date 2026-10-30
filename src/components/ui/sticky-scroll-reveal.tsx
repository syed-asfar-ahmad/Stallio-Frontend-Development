
import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { BezelShell } from "@/components/ui/bezel-shell";
import { cn } from "@/lib/utils";
import { motionEase } from "@/lib/motion";

export type StickyScrollItem = {
  title: string;
  description: string;
  content?: React.ReactNode;
  /** Optional mobile-only visual (falls back to content). */
  mobileContent?: React.ReactNode;
};

type StickyScrollProps = {
  content: StickyScrollItem[];
  className?: string;
};

export function StickyScroll({ content, className }: StickyScrollProps) {
  const reduce = useReducedMotion();
  const [activeCard, setActiveCard] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;

    const updateActive = () => {
      const center = window.innerHeight * 0.45;
      let bestIndex = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      stepRefs.current.forEach((node, index) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = index;
        }
      });

      setActiveCard((prev) => (prev === bestIndex ? prev : bestIndex));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [content.length]);

  return (
    <BezelShell
      className={cn(className)}
      innerClassName="relative flex items-start gap-10 p-6 md:gap-14 md:p-10"
    >
      <div className="relative w-full max-w-xl flex-1">
        {content.map((item, index) => {
          const mobileNode = item.mobileContent ?? item.content;

          return (
          <div
            key={item.title + index}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            data-sticky-step={index}
            className="flex min-h-[55vh] flex-col justify-center py-10 first:pt-4 last:pb-4 md:min-h-[60vh]"
          >
            <motion.div
              animate={{ opacity: reduce || activeCard === index ? 1 : 0.28 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: motionEase }}
            >
              <h3 className="text-foreground text-2xl font-semibold tracking-tight md:text-3xl">
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-5 max-w-sm text-sm leading-7 md:text-base md:leading-8">
                {item.description}
              </p>
              {mobileNode ? (
                <div className="border-border/50 bg-background relative mt-8 aspect-[9/16] w-full max-w-[13.5rem] overflow-hidden rounded-[1.25rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] lg:hidden">
                  {React.isValidElement(mobileNode)
                    ? React.cloneElement(mobileNode)
                    : mobileNode}
                </div>
              ) : null}
            </motion.div>
          </div>
          );
        })}
      </div>

      <div className="border-border/50 bg-background sticky top-28 hidden h-80 w-[22rem] shrink-0 overflow-hidden rounded-[1.35rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] lg:block xl:h-[26rem] xl:w-[26rem]">
        <div className="relative h-full w-full">
          {content.map((item, index) => (
            <motion.div
              key={item.title + index}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: activeCard === index ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: motionEase }}
              aria-hidden={activeCard !== index}
            >
              {React.isValidElement(item.content)
                ? React.cloneElement(item.content)
                : item.content}
            </motion.div>
          ))}
        </div>
      </div>
    </BezelShell>
  );
}
