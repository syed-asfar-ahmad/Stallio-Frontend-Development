/** Shared motion curve for marketing section reveals. */
export const motionEase = [0.32, 0.72, 0, 1] as const;

/** Stagger-child fade-up for hero / section entry. */
export function fadeUp(duration = 0.65, y = 16) {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: motionEase },
    },
  };
}
