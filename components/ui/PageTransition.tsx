"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pageFade } from "@/lib/motion";

/** Soft route enter/exit for the main app chrome. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={pageFade.initial}
        animate={pageFade.animate}
        exit={pageFade.exit}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
