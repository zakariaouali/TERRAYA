import * as React from "react";
import { cn } from "@/lib/utils";

export const Container = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto w-full max-w-7xl px-6 lg:px-10", className)} {...props} />
);
