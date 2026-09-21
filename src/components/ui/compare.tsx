import React, { useState, useEffect, useRef, useCallback } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { IconDotsVertical } from "@tabler/icons-react";

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
}
export const Compare = ({
  firstImage = "",
  secondImage = "",
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
}: CompareProps) => {
  const reduce = useReducedMotion();
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderXPercentRef = useRef(initialSliderPercentage);

  /** 1 = sweeping toward 100%, -1 = sweeping toward 0% */
  const autoplayDirectionRef = useRef<1 | -1>(1);

  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canAutoplay = autoplay && !reduce;

  const setPercent = useCallback((value: number) => {
    const next = Math.max(0, Math.min(100, value));
    sliderXPercentRef.current = next;
    setSliderXPercent(next);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(
    (fromPercent?: number) => {
      if (!canAutoplay) return;

      stopAutoplay();

      const startPercent = Math.max(
        0,
        Math.min(100, fromPercent ?? sliderXPercentRef.current),
      );
      const direction = autoplayDirectionRef.current;

      // Triangle wave: 0→1 rises 0%→100%, 1→2 falls 100%→0%.
      // Offset the clock so the handle keeps going from where the user dropped it.
      const risingPhase = startPercent / 100;
      const fallingPhase = 2 - startPercent / 100;
      const startPhase = direction === 1 ? risingPhase : fallingPhase;
      const startTime = Date.now() - startPhase * autoplayDuration;

      const animate = () => {
        const elapsedTime = Date.now() - startTime;
        const progress =
          (elapsedTime % (autoplayDuration * 2)) / autoplayDuration;
        const percentage =
          progress <= 1 ? progress * 100 : (2 - progress) * 100;

        autoplayDirectionRef.current = progress <= 1 ? 1 : -1;
        setPercent(percentage);
        autoplayRef.current = setTimeout(animate, 16); // ~60fps
      };

      animate();
    },
    [canAutoplay, autoplayDuration, setPercent, stopAutoplay],
  );

  useEffect(() => {
    startAutoplay(0);
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  function mouseEnterHandler() {
    stopAutoplay();
  }

  function mouseLeaveHandler() {
    if (slideMode === "drag") {
      setIsDragging(false);
    }
    // Continue autoplay from the dropped position (e.g. mid), not from 0%.
    autoplayDirectionRef.current = 1;
    startAutoplay(sliderXPercentRef.current);
  }

  const handleStart = useCallback(
    (clientX: number) => {
      if (slideMode === "drag") {
        setIsDragging(true);
      }
    },
    [slideMode]
  );

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") {
      setIsDragging(false);
    }
  }, [slideMode]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setPercent(percent);
        });
      }
    },
    [slideMode, isDragging, setPercent]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => handleStart(e.clientX),
    [handleStart]
  );
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handleMove(e.clientX),
    [handleMove]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      stopAutoplay();
      handleStart(e.touches[0].clientX);
    },
    [handleStart, stopAutoplay]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
    // Continue from where the finger left the handle.
    autoplayDirectionRef.current = 1;
    startAutoplay(sliderXPercentRef.current);
  }, [handleEnd, startAutoplay]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  return (
    <div
      ref={sliderRef}
      className={cn("w-[400px] h-[400px] overflow-hidden", className)}
      style={{
        position: "relative",
        cursor: slideMode === "drag" ? "grab" : "col-resize",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={mouseLeaveHandler}
      onMouseEnter={mouseEnterHandler}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <AnimatePresence initial={false}>
        <motion.div
          className="absolute top-0 z-30 m-auto h-full w-px bg-gradient-to-b from-transparent from-[5%] via-[#5E2BEC] to-transparent to-[95%]"
          style={{
            left: `${sliderXPercent}%`,
            top: "0",
            zIndex: 40,
          }}
          transition={{ duration: 0 }}
        >
          <div className="absolute top-1/2 left-0 z-20 h-full w-36 -translate-y-1/2 bg-gradient-to-r from-[#5E2BEC]/60 via-transparent to-transparent opacity-50 [mask-image:radial-gradient(100px_at_left,white,transparent)]" />
          <div className="absolute top-1/2 left-0 z-10 h-1/2 w-10 -translate-y-1/2 bg-gradient-to-r from-[#A78BFA] via-transparent to-transparent opacity-100 [mask-image:radial-gradient(50px_at_left,white,transparent)]" />
          <div className="absolute top-1/2 -right-10 h-3/4 w-10 -translate-y-1/2 [mask-image:radial-gradient(100px_at_left,white,transparent)]">
            <MemoizedSparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={420}
              className="h-full w-full"
              particleColor="#FFFFFF"
            />
          </div>
          {showHandlebar && (
            <div className="absolute top-1/2 -right-2.5 z-30 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-white shadow-[0px_-1px_0px_0px_#FFFFFF40]">
              <IconDotsVertical className="h-4 w-4 text-black" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="overflow-hidden w-full h-full relative z-20 pointer-events-none">
        <AnimatePresence initial={false}>
          {firstImage ? (
            <motion.div
              className={cn(
                "absolute inset-0 z-20 rounded-2xl shrink-0 w-full h-full select-none overflow-hidden",
                firstImageClassName
              )}
              style={{
                clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
              }}
              transition={{ duration: 0 }}
            >
              <img
                alt="first image"
                src={firstImage}
                className={cn(
                  "absolute inset-0  z-20 rounded-2xl shrink-0 w-full h-full select-none",
                  firstImageClassName
                )}
                draggable={false}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {secondImage ? (
          <motion.img
            className={cn(
              "absolute top-0 left-0 z-[19]  rounded-2xl w-full h-full select-none",
              secondImageClassname
            )}
            alt="second image"
            src={secondImage}
            draggable={false}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const MemoizedSparklesCore = React.memo(SparklesCore);
