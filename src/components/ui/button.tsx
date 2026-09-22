import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center font-medium transition-all duration-300 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-100 dark:ring-offset-sand-900 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-sand-900 text-sand-50 hover:bg-sand-800 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-200 tracking-[0.18em] uppercase text-xs",
  outline:
    "border border-sand-900/30 text-sand-900 hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100/30 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900 tracking-[0.18em] uppercase text-xs",
  ghost: "text-sand-900 hover:text-sand-600 dark:text-sand-100 dark:hover:text-sand-400",
  link: "text-sand-700 dark:text-sand-300 underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-7",
  lg: "h-14 px-10",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
