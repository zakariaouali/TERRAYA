"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * Word-by-word masked reveal for headings: each word rises out from behind a
 * clip line, staggered. Pure CSS transitions, triggered once when the heading
 * scrolls into view.
 *
 * Safety properties (a stuck-invisible heading is worse than no animation):
 *  - a fallback timer reveals the text even if the observer never fires;
 *  - the mask has bottom padding so serif descenders (g, y, p) aren't clipped;
 *  - the full string is exposed via aria-label, the split words are aria-hidden.
 */
export function RevealText({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  step = 70,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  /** Extra delay before the first word, in ms. */
  delay?: number;
  /** Stagger between words, in ms. */
  step?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    const fallback = setTimeout(() => setRevealed(true), 2500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const words = children.split(" ");

  return (
    <Tag ref={ref} aria-label={children} className={className}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          <span className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-bottom">
            <span
              className={cn(
                "inline-block animate-reveal-failsafe transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                revealed ? "translate-y-0" : "translate-y-[110%]"
              )}
              style={{ transitionDelay: revealed ? `${delay + i * step}ms` : "0ms" }}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
