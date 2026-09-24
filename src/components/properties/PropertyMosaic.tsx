"use client";

import Image from "next/image";
import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Lightbox, PropertyGallery } from "@/components/properties/PropertyGallery";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Desktop: an editorial mosaic (one large photo + four supporting) that opens
 * the full-screen lightbox at the photo you clicked. Small screens keep the
 * swipeable carousel, which suits touch better than a grid of thumbnails.
 */
export function PropertyMosaic({ images, title }: { images: string[]; title: string }) {
  const { lang } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const shown = images.slice(0, 5);
  const label = lang === "fr" ? `Voir les ${images.length} photos` : `Show all ${images.length} photos`;

  if (images.length < 3) {
    return <PropertyGallery images={images} title={title} />;
  }

  return (
    <>
      <div className="lg:hidden">
        <PropertyGallery images={images} title={title} />
      </div>

      <div className="relative hidden h-[34rem] grid-cols-4 grid-rows-2 gap-2 lg:grid xl:h-[38rem]">
        {shown.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`${title} — ${i + 1} / ${images.length}`}
            className={cn(
              "group relative cursor-zoom-in overflow-hidden bg-sand-200 dark:bg-sand-800",
              i === 0 ? "col-span-2 row-span-2" : (shown.length === 3 && i > 0) || (shown.length === 4 && i === 3) ? "col-span-2" : ""
            )}
          >
            {i === 0 ? (
              <FadeImage src={src} alt={title} fill priority quality={85} sizes="50vw" className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]" />
            ) : (
              <Image src={src} alt="" fill sizes="25vw" className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]" />
            )}
            <span aria-hidden="true" className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 border border-sand-900/20 bg-sand-50/95 px-4 py-2.5 text-[0.68rem] uppercase tracking-[0.2em] text-sand-900 shadow-lg backdrop-blur transition-colors hover:bg-white"
        >
          <LayoutGrid size={14} />
          {label}
        </button>
      </div>

      {open !== null && <Lightbox images={images} title={title} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
