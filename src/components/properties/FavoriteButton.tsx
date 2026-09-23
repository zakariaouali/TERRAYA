"use client";

import { AnimatedHeart } from "@/components/shared/AnimatedIcon";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({ slug, className }: { slug: string; className?: string }) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = ready && isFavorite(slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from saved" : "Save property"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-sand-50/85 text-sand-900 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        className
      )}
    >
      <AnimatedHeart active={active} size={16} className={active ? "fill-sand-700 text-sand-700" : "text-sand-800"} />
    </button>
  );
}
