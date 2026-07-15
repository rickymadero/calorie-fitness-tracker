/** Shared motion tokens for Evolve — keep feel athletic, not decorative. */

export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeSoft = [0.33, 1, 0.68, 1] as const;

export const pageFade = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: easeSoft },
  },
};

export const feedStagger = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const feedItem = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: easeOut },
  },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 420, damping: 28 },
  },
};

export const tapScale = { scale: 0.96 };
export const tapSoft = { scale: 0.98 };
