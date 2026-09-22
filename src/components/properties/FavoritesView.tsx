"use client";

import Link from "next/link";
import type { SeedProperty } from "@/data/properties";
import { Container } from "@/components/shared/Container";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyGridSkeleton } from "@/components/ui/Skeleton";
import { useFavorites } from "@/lib/favorites";
import { useLang } from "@/lib/i18n";

export function FavoritesView({ properties }: { properties: SeedProperty[] }) {
  const { favorites, ready, clear } = useFavorites();
  const { t } = useLang();
  const saved = properties.filter((p) => favorites.includes(p.slug));

  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">
            <span className="luxury-divider">{t("saved.eyebrow")}</span>
          </p>
          <h1 className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.05]">
            {t("saved.title")}
          </h1>
        </div>

        {/* Loading state while reading saved items from storage */}
        {!ready && (
          <div className="mt-12">
            <PropertyGridSkeleton count={3} />
          </div>
        )}

        {/* Render only after hydration to avoid SSR/client mismatch */}
        {ready && saved.length === 0 && (
          <div className="mt-16 border-t border-sand-200 dark:border-sand-800 pt-16 text-center">
            <p className="font-display text-2xl text-sand-700 dark:text-sand-300">{t("saved.empty")}</p>
            <Link
              href="/properties"
              className="mt-8 inline-flex items-center bg-sand-900 px-9 py-4 text-[0.7rem] uppercase tracking-[0.24em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
            >
              {t("saved.browse")}
            </Link>
          </div>
        )}

        {ready && saved.length > 0 && (
          <>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <span className="text-sm uppercase tracking-[0.22em] text-sand-600 dark:text-sand-400">
                {saved.length} {saved.length === 1 ? t("saved.one") : t("saved.many")}
              </span>
              {saved.length > 1 && (
                <Link
                  href={`/compare?slugs=${saved.map((p) => p.slug).join(",")}`}
                  className="border-b border-sand-900 dark:border-sand-100 pb-0.5 text-xs uppercase tracking-[0.24em] text-sand-900 dark:text-sand-100"
                >
                  {t("saved.compare")}
                </Link>
              )}
              <button
                type="button"
                onClick={clear}
                className="text-xs uppercase tracking-[0.24em] text-sand-500 dark:text-sand-400 hover:text-sand-900 dark:hover:text-sand-100 transition-colors"
              >
                {t("saved.clear")}
              </button>
            </div>

            <div className="mt-12 grid gap-14 md:grid-cols-2 lg:grid-cols-3">
              {saved.map((p) => (
                <PropertyCard key={p.slug} p={p} />
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
