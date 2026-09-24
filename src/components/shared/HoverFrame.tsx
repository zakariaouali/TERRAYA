"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const PARALLAX_PX = 10; // how far the photo drifts against the cursor
const BADGE = 76; // diameter of the cursor label, px

/**
 * A premium hover treatment for image tiles. With a mouse it layers:
 *  - depth: the photo drifts slightly against the cursor while slowly zooming;
 *  - light: a soft sheen follows the pointer;
 *  - a fine inset frame that draws in;
 *  - optionally a round label ("Read", "Explore") that follows the cursor.
 *
 * `image` goes in the moving layer; `children` are static overlays (gradients,
 * captions, buttons) above it. Pointer tracking lives on the root, which
 * contains the overlays, so they can't swallow the events. Touch and
 * reduced-motion users get the static image — every effect is pointer-only.
 */
export function HoverFrame({
  image,
  children,
  cursorLabel,
  className,
  frame = true,
}: {
  image: ReactNode;
  children?: ReactNode;
  cursorLabel?: string;
  className?: string;
  frame?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const reduce = useReducedMotion();

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || reduce) return;
    const root = rootRef.current;
    const layer = layerRef.current;
    if (!root || !layer) return;
    const { clientX, clientY } = e;
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = root.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);
      layer.style.setProperty("--px", `${(-(x / r.width - 0.5) * 2 * PARALLAX_PX).toFixed(2)}px`);
      layer.style.setProperty("--py", `${(-(y / r.height - 0.5) * 2 * PARALLAX_PX).toFixed(2)}px`);
    });
  }

  function onLeave() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    layerRef.current?.style.setProperty("--px", "0px");
    layerRef.current?.style.setProperty("--py", "0px");
  }

  return (
    <div
      ref={rootRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("group/hf relative overflow-hidden bg-sand-200 dark:bg-sand-800", className)}
    >
      <div
        ref={layerRef}
        className="absolute inset-[-14px] transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] [transform:translate3d(var(--px,0px),var(--py,0px),0)_scale(var(--hf-scale,1))] group-hover/hf:[--hf-scale:1.07]"
      >
        {image}
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover/hf:opacity-100"
        style={{
          background:
            "radial-gradient(circle 260px at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.55), transparent 70%)",
        }}
      />

      {frame && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 scale-[0.96] border border-white/70 opacity-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/hf:scale-100 group-hover/hf:opacity-100"
        />
      )}

      {children}

      {cursorLabel && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 hidden [@media(hover:hover)]:block"
          style={{ transform: `translate3d(calc(var(--mx, 50%) - ${BADGE / 2}px), calc(var(--my, 50%) - ${BADGE / 2}px), 0)`, transition: "transform 180ms ease-out" }}
        >
          <span
            className="flex items-center justify-center rounded-full bg-white text-[0.58rem] uppercase tracking-[0.22em] text-sand-900 opacity-0 scale-50 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/hf:scale-100 group-hover/hf:opacity-100"
            style={{ width: BADGE, height: BADGE }}
          >
            {cursorLabel}
          </span>
        </span>
      )}
    </div>
  );
}
