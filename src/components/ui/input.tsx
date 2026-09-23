import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-12 w-full border border-sand-300 bg-transparent dark:border-sand-700 px-4 font-sans text-sand-900 dark:text-sand-100 placeholder:text-sand-500/70 dark:placeholder:text-sand-400 focus:border-sand-600 dark:focus:border-sand-400 focus:outline-none transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full border border-sand-300 bg-transparent dark:border-sand-700 px-4 py-3 font-sans text-sand-900 dark:text-sand-100 placeholder:text-sand-500/70 dark:placeholder:text-sand-400 focus:border-sand-600 dark:focus:border-sand-400 focus:outline-none transition-colors min-h-32",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-12 w-full border border-sand-300 bg-transparent dark:border-sand-700 px-4 font-sans text-sand-900 dark:text-sand-100 focus:border-sand-600 dark:focus:border-sand-400 focus:outline-none transition-colors appearance-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("eyebrow block mb-2", className)} {...props} />
);
