"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for next/image's <Image fill /> that shows a pulsing
 * placeholder until the image has actually painted, then cross-fades to it.
 * Must be rendered inside a `relative`-positioned parent, same as a plain
 * `fill` image — it renders the placeholder and the image as siblings.
 */
export function FadeImage({ className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 animate-pulse bg-sand-200/70 dark:bg-sand-800/70 transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100"
        )}
      />
      <Image
        {...props}
        className={cn(className, "transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0")}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </>
  );
}
