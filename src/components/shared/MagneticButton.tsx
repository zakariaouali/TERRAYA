"use client";

import Link from "next/link";
import { useRef, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "solid" | "light" | "outline-light";

// base = resting look, wipe = the colour that floods in from the cursor.
const VARIANTS: Record<Variant, { base: string; wipe: string; labelHover: string }> = {
  // dark button (on light backgrounds)
  solid: {
    base: "border border-transparent bg-sand-900 text-sand-50 dark:bg-sand-100 dark:text-sand-900",
    wipe: "bg-sand-50 dark:bg-sand-900",
    labelHover: "group-hover/btn:text-sand-900 dark:group-hover/btn:text-sand-100",
  },
  // white button (on photos / dark backgrounds)
  light: {
    base: "border border-transparent bg-white text-sand-900",
    wipe: "bg-sand-900",
    labelHover: "group-hover/btn:text-white",
  },
  // ghost button on photos
  "outline-light": {
    base: "border border-white/60 text-white backdrop-blur-sm",
    wipe: "bg-white",
    labelHover: "group-hover/btn:text-sand-900",
  },
};

const MAGNET_RANGE = 14; // px the button may drift toward the cursor

/**
 * CTA button with a magnetic pull toward the cursor and a colour wipe that
 * expands from the exact point the pointer entered — after Originkit's
 * "Magnetic Hover Button". Both effects are pointer-only: touch devices and
 * reduced-motion users get a plain button, and the label stays readable at
 * every stage (it swaps colour with the wipe rather than sitting under it).
 */
export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  variant = "solid",
  className,
  external,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: Variant;
  className?: string;
  external?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const v = VARIANTS[variant];

  function onMove(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set((dx / (r.width / 2)) * MAGNET_RANGE);
    y.set((dy / (r.height / 2)) * MAGNET_RANGE * 0.6);
  }

  function onEnter(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--wx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--wy", `${e.clientY - r.top}px`);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const shared = {
    ref: ref as never,
    onPointerEnter: onEnter,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    className: cn(
      "group/btn relative inline-flex items-center justify-center overflow-hidden px-10 py-4 text-[0.7rem] uppercase tracking-[0.26em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      v.base,
      className
    ),
  };

  const inner = (
    <>
      {/* The wipe: a circle that grows from the pointer's entry point. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 [clip-path:circle(0%_at_var(--wx,50%)_var(--wy,50%))] transition-[clip-path] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:[clip-path:circle(150%_at_var(--wx,50%)_var(--wy,50%))] group-focus-visible/btn:[clip-path:circle(150%_at_var(--wx,50%)_var(--wy,50%))]",
          v.wipe
        )}
      />
      <span className={cn("relative z-10 inline-flex items-center gap-3 transition-colors duration-500", v.labelHover)}>
        {children}
      </span>
    </>
  );

  const style = { x, y };

  if (href) {
    const ext = external || /^https?:/.test(href);
    return (
      <motion.span style={style} className="inline-block">
        <Link
          href={href}
          {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...(shared as object)}
        >
          {inner}
        </Link>
      </motion.span>
    );
  }
  return (
    <motion.span style={style} className="inline-block">
      <button type={type} onClick={onClick} disabled={disabled} {...(shared as object)}>
        {inner}
      </button>
    </motion.span>
  );
}
