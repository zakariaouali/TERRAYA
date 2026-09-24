"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * The article element, with a thin bar at the top of the screen that fills as
 * the article is read (hidden for reduced-motion users).
 */
export function ArticleShell({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <article ref={ref} className={className}>
      {!reduce && (
        <motion.div
          aria-hidden="true"
          style={{ scaleX }}
          className="fixed inset-x-0 top-0 z-[65] h-[3px] origin-left bg-sand-700 dark:bg-sand-300"
        />
      )}
      {children}
    </article>
  );
}
