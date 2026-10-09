
import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.45,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (reduce) {
      animate(
        "span",
        { opacity: 1, filter: "none" },
        { duration: 0 },
      );
      return;
    }

    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration,
        delay: stagger(0.07),
      },
    );
  }, [animate, duration, filter, reduce]);

  return (
    <div className={cn(className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="text-muted-foreground opacity-0"
            style={{
              filter: reduce ? "none" : filter ? "blur(8px)" : "none",
              opacity: reduce ? 1 : undefined,
            }}
          >
            {word}{" "}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
