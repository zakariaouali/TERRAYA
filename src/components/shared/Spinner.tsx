import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline loading indicator for buttons mid-request. Uses currentColor so it
 * always matches the button's own text color across variants.
 */
export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return <LoaderCircle size={size} className={cn("animate-spin", className)} aria-hidden="true" />;
}
