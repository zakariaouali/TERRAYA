import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center px-3 py-1 text-[0.65rem] tracking-[0.22em] uppercase border border-sand-900/15 text-sand-700 bg-sand-100/60 dark:border-sand-100/15 dark:text-sand-300 dark:bg-sand-900/60",
      className
    )}
    {...props}
  />
);
