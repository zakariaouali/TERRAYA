"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FadeImage } from "@/components/shared/FadeImage";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-4">
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-200 dark:bg-sand-800">
        <FadeImage
          key={images[active]}
          src={images[active]}
          alt={`${title} — image ${active + 1}`}
          fill
          priority
          quality={80}
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover animate-fade-up"
        />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden transition-opacity",
              i === active ? "ring-2 ring-sand-900 dark:ring-sand-100" : "opacity-70 hover:opacity-100"
            )}
            aria-label={`View image ${i + 1}`}
          >
            <Image src={src} alt="" fill sizes="150px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
