"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const TYPES = ["", "VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"];

const LISTING_TYPES = [
  { value: "", label: "All" },
  { value: "SALE", label: "Buy" },
  { value: "RENT", label: "Rent" },
];

export function PropertyFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const listingType = params.get("listingType") ?? "";

  const update = useCallback(
    (k: string, v: string) => {
      const next = new URLSearchParams(params.toString());
      if (v) next.set(k, v); else next.delete(k);
      router.replace(`/properties?${next.toString()}`);
    },
    [router, params]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {LISTING_TYPES.map((lt) => (
          <button
            key={lt.value}
            type="button"
            onClick={() => update("listingType", lt.value)}
            className={cn(
              "px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.24em] border transition-colors",
              listingType === lt.value
                ? "bg-sand-900 text-sand-50 border-sand-900 dark:bg-sand-100 dark:text-sand-900 dark:border-sand-100"
                : "border-sand-300 text-sand-700 hover:border-sand-600 dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-400"
            )}
          >
            {lt.label}
          </button>
        ))}
      </div>

      <div className={cn("grid gap-4 md:grid-cols-2 border-y border-sand-200 dark:border-sand-800 py-6", listingType === "" || listingType === "SALE" ? "lg:grid-cols-5" : "lg:grid-cols-3")}>
        <input
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Search by city, country, or name"
          className="h-12 border-b border-sand-300 dark:border-sand-700 bg-transparent px-1 text-sand-900 dark:text-sand-100 placeholder:text-sand-500 dark:placeholder:text-sand-400 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
        />
        <select
          defaultValue={params.get("type") ?? ""}
          onChange={(e) => update("type", e.target.value)}
          className="h-12 border-b border-sand-300 dark:border-sand-700 bg-transparent px-1 text-sand-900 dark:text-sand-100 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t || "All property types"}</option>
          ))}
        </select>
        <select
          defaultValue={params.get("bedrooms") ?? ""}
          onChange={(e) => update("bedrooms", e.target.value)}
          className="h-12 border-b border-sand-300 dark:border-sand-700 bg-transparent px-1 text-sand-900 dark:text-sand-100 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
        >
          <option value="">Any bedrooms</option>
          {[2, 3, 4, 5, 6, 8].map((n) => (
            <option key={n} value={n}>{n}+ bedrooms</option>
          ))}
        </select>
        {(listingType === "" || listingType === "SALE") && (
          <>
            <select
              defaultValue={params.get("min") ?? ""}
              onChange={(e) => update("min", e.target.value)}
              className="h-12 border-b border-sand-300 dark:border-sand-700 bg-transparent px-1 text-sand-900 dark:text-sand-100 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
            >
              <option value="">Min price</option>
              {[1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000].map((n) => (
                <option key={n} value={n}>€{(n / 1_000_000).toFixed(1)}M+</option>
              ))}
            </select>
            <select
              defaultValue={params.get("max") ?? ""}
              onChange={(e) => update("max", e.target.value)}
              className="h-12 border-b border-sand-300 dark:border-sand-700 bg-transparent px-1 text-sand-900 dark:text-sand-100 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
            >
              <option value="">Max price</option>
              {[2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000].map((n) => (
                <option key={n} value={n}>up to €{(n / 1_000_000).toFixed(1)}M</option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}
