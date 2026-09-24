import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * "View more" link with a circular arrow badge: on hover the badge fills and
 * the arrow slides out to the right while a fresh one slides in from the
 * left — after Originkit's "Arrow Reveal Button". Pure CSS (no client JS), so
 * it can be used from server and client components alike.
 */
export function ArrowLink({
  href,
  children,
  onDark = false,
  className,
}: {
  href: string;
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-4 text-xs uppercase tracking-[0.28em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2",
        onDark ? "text-white" : "text-sand-900 dark:text-sand-100",
        className
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors duration-500",
          onDark
            ? "border-white/60 group-hover:border-white group-hover:bg-white group-hover:text-sand-900"
            : "border-sand-900/40 group-hover:border-sand-900 group-hover:bg-sand-900 group-hover:text-sand-50 dark:border-sand-100/40 dark:group-hover:border-sand-100 dark:group-hover:bg-sand-100 dark:group-hover:text-sand-900"
        )}
      >
        <ArrowRight
          size={15}
          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-9"
        />
        <ArrowRight
          size={15}
          className="absolute -translate-x-9 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0"
        />
      </span>
    </Link>
  );
}
