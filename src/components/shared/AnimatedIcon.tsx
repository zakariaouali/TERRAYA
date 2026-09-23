"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronDown, Sun, Moon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 15 };

/** Heart that pops with a little spring burst the moment it becomes active. */
export function AnimatedHeart({ active, size = 16, className }: { active: boolean; size?: number; className?: string }) {
  return (
    <motion.span
      className="inline-flex"
      animate={active ? { scale: [1, 1.35, 1] } : { scale: 1 }}
      transition={active ? { duration: 0.4, ease: "easeOut" } : { duration: 0.2 }}
    >
      <Heart size={size} className={cn("transition-colors", className)} />
    </motion.span>
  );
}

/** Chevron that springs to its rotated state instead of a linear CSS turn. */
export function AnimatedChevron({ open, size = 12, className }: { open: boolean; size?: number; className?: string }) {
  return (
    <motion.span className="inline-flex" animate={{ rotate: open ? 180 : 0 }} transition={SPRING}>
      <ChevronDown size={size} className={className} />
    </motion.span>
  );
}

/** Sun/moon crossfade-and-rotate, instead of an instant icon swap. */
export function AnimatedThemeIcon({ isDark, size = 16, className }: { isDark: boolean; size?: number; className?: string }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            className="absolute inset-0 inline-flex"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.25 }}
          >
            <Sun size={size} className={className} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            className="absolute inset-0 inline-flex"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.25 }}
          >
            <Moon size={size} className={className} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Search icon that gives a small reassuring pulse on hover — used on search/filter triggers. */
export function AnimatedSearch({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <motion.span className="inline-flex" whileHover={{ scale: 1.15, rotate: -8 }} transition={SPRING}>
      <Search size={size} className={className} />
    </motion.span>
  );
}
