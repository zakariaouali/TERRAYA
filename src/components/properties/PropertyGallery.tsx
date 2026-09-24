"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { FadeImage } from "@/components/shared/FadeImage";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SWIPE_PX = 50;

/** Left/right swipe on touch (and drag with a mouse) without blocking vertical scroll. */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      startX.current = e.clientX;
      moved.current = false;
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      startX.current = null;
      if (Math.abs(dx) > SWIPE_PX) {
        moved.current = true;
        dx > 0 ? onPrev() : onNext();
      }
    },
    onPointerCancel: () => {
      startX.current = null;
    },
    /** True right after a swipe, so the click that follows it doesn't also open the lightbox. */
    swiped: () => moved.current,
  };
}

function NavButton({
  dir,
  onClick,
  label,
  className,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  label: string;
  className?: string;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-sand-50/90 text-sand-900 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        className
      )}
    >
      <Icon size={20} />
    </button>
  );
}

function Lightbox({
  images,
  title,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  title: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = images.length;
  const prev = useCallback(() => onIndex((index - 1 + total) % total), [index, total, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % total), [index, total, onIndex]);
  const swipe = useSwipe(prev, next);

  // Scroll lock, and give focus back to whatever opened us.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Tab" && dialogRef.current) {
        // Keep focus inside the dialog.
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button");
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-lenis-prevent
      className="fixed inset-0 z-[120] bg-black/95 animate-page-in"
      onClick={() => {
        if (swipe.swiped()) return;
        onClose();
      }}
    >
      <div
        className="absolute inset-0 touch-pan-y p-4 sm:p-14"
        onPointerDown={swipe.onPointerDown}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerCancel}
      >
        <div className="relative h-full w-full" onClick={(e) => e.stopPropagation()}>
          <FadeImage
            key={images[index]}
            src={images[index]}
            alt={`${title} — ${t("gallery.counter").replace("{n}", String(index + 1)).replace("{total}", String(total))}`}
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        aria-label={t("gallery.close")}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:top-6"
      >
        <X size={20} />
      </button>

      {total > 1 && (
        <>
          <NavButton dir="prev" label={t("gallery.prev")} onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 sm:left-6" />
          <NavButton dir="next" label={t("gallery.next")} onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 sm:right-6" />
          <p
            aria-live="polite"
            className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs uppercase tracking-[0.24em] text-white/80"
          >
            {t("gallery.counter").replace("{n}", String(index + 1)).replace("{total}", String(total))}
          </p>
        </>
      )}
    </div>,
    document.body
  );
}

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const total = images.length;
  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);
  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const swipe = useSwipe(prev, next);

  const counter = t("gallery.counter").replace("{n}", String(active + 1)).replace("{total}", String(total));

  return (
    <div
      className="grid gap-4"
      role="group"
      aria-roledescription="carousel"
      aria-label={title}
      onKeyDown={(e) => {
        if (open || total < 2) return;
        if (e.key === "ArrowLeft") prev();
        else if (e.key === "ArrowRight") next();
      }}
    >
      <div
        className="group relative aspect-[16/10] cursor-zoom-in touch-pan-y overflow-hidden bg-sand-200 dark:bg-sand-800"
        onPointerDown={swipe.onPointerDown}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerCancel}
        onClick={() => {
          if (swipe.swiped()) return;
          setOpen(true);
        }}
      >
        <FadeImage
          key={images[active]}
          src={images[active]}
          alt={`${title} — ${counter}`}
          fill
          priority
          quality={80}
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />

        <button
          type="button"
          aria-label={t("gallery.expand")}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-sand-50/90 text-sand-900 opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Maximize2 size={16} />
        </button>

        {total > 1 && (
          <>
            <NavButton
              dir="prev"
              label={t("gallery.prev")}
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            />
            <NavButton
              dir="next"
              label={t("gallery.next")}
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            />
            <p className="pointer-events-none absolute bottom-4 left-4 bg-black/55 px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-white">
              {active + 1} / {total}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={t("gallery.counter").replace("{n}", String(i + 1)).replace("{total}", String(total))}
            aria-current={i === active}
            className={cn(
              "relative aspect-square overflow-hidden transition-opacity",
              i === active ? "ring-2 ring-sand-900 dark:ring-sand-100" : "opacity-70 hover:opacity-100"
            )}
          >
            <Image src={src} alt="" fill sizes="150px" className="object-cover" />
          </button>
        ))}
      </div>

      {open && <Lightbox images={images} title={title} index={active} onIndex={setActive} onClose={() => setOpen(false)} />}
    </div>
  );
}
