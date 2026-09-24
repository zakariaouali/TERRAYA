"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Inertial, fluid page scrolling (Lenis) for the public site.
 *
 * Deliberate choices:
 *  - Wheel/trackpad only: touch keeps the browser's native momentum, which
 *    already feels right on phones and avoids fighting iOS/Android gestures.
 *  - Off in the admin area, where dense tables and forms want native scroll.
 *  - Reduced-motion users get 1:1 scrolling (Lenis honours the setting).
 *  - Overlays that scroll or lock the page carry `data-lenis-prevent`, so the
 *    smooth scroller never scrolls the page behind them.
 *  - Route changes reset to the top instantly; otherwise a smooth scroll
 *    still in flight would drag the new page down from where you left.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const enabled = !pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      allowNestedScroll: true,
    });
    lenisRef.current = lenis;
    if (process.env.NODE_ENV !== "production") window.lenis = lenis; // dev-only, for testing
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  // Only on real route changes — not the first render, which would wipe the
  // browser's scroll restoration and any #hash deep link.
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
