import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  subtitle = true,
  onDark = false,
}: {
  className?: string;
  subtitle?: boolean;
  onDark?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex flex-col items-start leading-none", className)}>
      <span
        className={cn(
          "font-display text-2xl tracking-[0.32em] transition-colors duration-300",
          onDark ? "text-white" : "text-sand-900 dark:text-sand-100"
        )}
      >
        TERRAYA
      </span>
      {subtitle && (
        <span
          className={cn(
            "mt-1 text-[0.6rem] tracking-[0.4em] uppercase transition-colors duration-300",
            onDark ? "text-white/70" : "text-sand-600 dark:text-sand-400"
          )}
        >
          Real Estate
        </span>
      )}
    </Link>
  );
}
