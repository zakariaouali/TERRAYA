import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl", className)}>
      {eyebrow && (
        <p className="eyebrow mb-4">
          <span className="luxury-divider">{eyebrow}</span>
        </p>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-sand-900 dark:text-sand-100">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-sand-700/90 dark:text-sand-300 leading-relaxed text-lg max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}
