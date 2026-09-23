"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedSearch } from "@/components/shared/AnimatedIcon";
import { PropertyRequestPanel } from "@/components/properties/PropertyRequestPanel";
import { cn } from "@/lib/utils";

const TYPES = ["", "VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"];

const LISTING_TYPES = [
  { value: "", label: "All" },
  { value: "SALE", label: "Buy" },
  { value: "RENT", label: "Rent" },
];

// Sale prices run into the millions; rent runs monthly, in the thousands —
// two different scales that can't share one set of options (that mismatch
// used to silently hide every rental whenever a sale-sized price was picked
// on the "All" tab). Each listing type now gets its own appropriate range,
// and price simply doesn't show at all on "All", where the scales would
// collide again.
const SALE_MIN = [1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000];
const SALE_MAX = [2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000];
const RENT_MIN = [1_000, 2_000, 3_000, 5_000, 8_000];
const RENT_MAX = [2_000, 3_000, 5_000, 8_000, 15_000];

export function PropertyFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const listingType = params.get("listingType") ?? "";
  const [requestOpen, setRequestOpen] = useState(false);

  const update = useCallback(
    (k: string, v: string) => {
      const next = new URLSearchParams(params.toString());
      if (v) next.set(k, v); else next.delete(k);
      // Price scales don't carry over between listing types.
      if (k === "listingType") { next.delete("min"); next.delete("max"); }
      router.replace(`/properties?${next.toString()}`);
    },
    [router, params]
  );

  const minOptions = listingType === "RENT" ? RENT_MIN : SALE_MIN;
  const maxOptions = listingType === "RENT" ? RENT_MAX : SALE_MAX;
  const priceUnit = listingType === "RENT" ? "/mo" : "";
  const formatPrice = (n: number) => (n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(1)}M` : `€${(n / 1000).toFixed(0)}K`);

  return (
    <div className="space-y-6">
      <div className="relative inline-flex flex-wrap gap-3">
        {LISTING_TYPES.map((lt) => {
          const active = listingType === lt.value;
          return (
            <button
              key={lt.value}
              type="button"
              onClick={() => update("listingType", lt.value)}
              className={cn(
                "relative px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.24em] border transition-colors",
                active
                  ? "border-sand-900 text-sand-50 dark:border-sand-100 dark:text-sand-900"
                  : "border-sand-300 text-sand-700 hover:border-sand-600 dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-400"
              )}
            >
              {active && (
                <motion.span
                  layoutId="listing-type-bg"
                  className="absolute inset-0 -z-10 bg-sand-900 dark:bg-sand-100"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative">{lt.label}</span>
            </button>
          );
        })}
      </div>

      <div className={cn("grid gap-4 md:grid-cols-2 border-y border-sand-200 dark:border-sand-800 py-6", listingType ? "lg:grid-cols-5" : "lg:grid-cols-3")}>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-1 text-sand-500 dark:text-sand-400">
            <AnimatedSearch size={15} />
          </span>
          <input
            defaultValue={params.get("q") ?? ""}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search by city, country, or name"
            className="h-12 w-full border-b border-sand-300 dark:border-sand-700 bg-transparent pl-6 pr-1 text-sand-900 dark:text-sand-100 placeholder:text-sand-500 dark:placeholder:text-sand-400 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
          />
        </div>
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
        {listingType && (
          <>
            <select
              value={params.get("min") ?? ""}
              onChange={(e) => update("min", e.target.value)}
              className="h-12 border-b border-sand-300 dark:border-sand-700 bg-transparent px-1 text-sand-900 dark:text-sand-100 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
            >
              <option value="">Min price</option>
              {minOptions.map((n) => (
                <option key={n} value={n}>{formatPrice(n)}+{priceUnit}</option>
              ))}
            </select>
            <select
              value={params.get("max") ?? ""}
              onChange={(e) => update("max", e.target.value)}
              className="h-12 border-b border-sand-300 dark:border-sand-700 bg-transparent px-1 text-sand-900 dark:text-sand-100 focus:outline-none focus:border-sand-700 dark:focus:border-sand-400"
            >
              <option value="">Max price</option>
              {maxOptions.map((n) => (
                <option key={n} value={n}>up to {formatPrice(n)}{priceUnit}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-sand-600 dark:text-sand-400">
          Can&apos;t find exactly what you&apos;re after?{" "}
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="border-b border-sand-900 pb-0.5 text-sand-900 transition-colors hover:text-sand-600 dark:border-sand-100 dark:text-sand-100 dark:hover:text-sand-300"
          >
            Tell us what you need
          </button>
        </p>
      </div>

      <PropertyRequestPanel
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        initial={{
          listingType: listingType === "RENT" ? "RENT" : "SALE",
          propertyType: params.get("type") ?? "",
          city: params.get("q") ?? "",
          bedrooms: params.get("bedrooms") ?? "",
        }}
      />
    </div>
  );
}
