"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, animate, useMotionValue, useTransform, useReducedMotion } from "framer-motion";

/**
 * A thin top-of-page progress bar that starts the instant an internal link
 * is clicked — before the RSC payload even starts fetching — and completes
 * when the route actually changes. This is the missing "something is
 * happening" signal for the 1-3s Next.js can take to compile/fetch a route
 * (mainly in dev; still a good affordance in production on a slow network).
 * A safety timeout also completes it for same-path navigations (e.g. a
 * filter link that only changes the query string), which don't change
 * `pathname` and so wouldn't otherwise be observed here.
 */
export function NavigationProgressBar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const opacity = useMotionValue(0);
  const width = useTransform(progress, (v) => `${v}%`);
  const pending = useRef(false);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function complete() {
      pending.current = false;
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      animate(progress, 100, { duration: 0.2, ease: "easeOut" });
      animate(opacity, 0, { duration: 0.3, delay: 0.2 });
      setTimeout(() => progress.set(0), 600);
    }

    if (pending.current) complete();

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const targetEl = e.target as Element | null;
      const anchor = targetEl?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;
      if (isSamePage) return; // no-op link, or an in-page hash jump

      pending.current = true;
      progress.set(0);
      opacity.set(1);
      animate(progress, 80, { duration: reduceMotion ? 0.05 : 1, ease: [0.16, 1, 0.3, 1] });

      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => {
        if (pending.current) complete();
      }, 4000);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
    // Re-registering per pathname change is intentional: it both completes
    // any in-flight bar and gives the click listener a fresh `pathname`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-gradient-to-r from-sand-700 via-sand-900 to-sand-700 dark:from-sand-300 dark:via-sand-100 dark:to-sand-300"
      style={{ width, opacity }}
    />
  );
}
