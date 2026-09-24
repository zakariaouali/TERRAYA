import { cleanFeatures, type FeatureKey } from "@/lib/features";

/**
 * Pure (client-safe) description of a property search: URL <-> filter state,
 * plus the in-memory matcher used when there is no database. The database
 * path lives in lib/properties.ts and must stay equivalent to `matches()`.
 */
export const PROPERTY_TYPES = ["VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"] as const;
export const SORTS = ["recommended", "price-asc", "price-desc", "area-desc"] as const;
export type Sort = (typeof SORTS)[number];

export type PropertyFilters = {
  q: string;
  listingType: "" | "SALE" | "RENT";
  types: string[];
  bedrooms: number; // minimum, 0 = any
  bathrooms: number; // minimum, 0 = any
  min: number; // 0 = none
  max: number; // 0 = none
  area: number; // minimum m², 0 = any
  features: FeatureKey[];
  sort: Sort;
};

type Raw = Record<string, string | string[] | undefined> | URLSearchParams;

function get(sp: Raw, k: string): string {
  const v = sp instanceof URLSearchParams ? sp.get(k) : sp[k];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

export function parseFilters(sp: Raw): PropertyFilters {
  const listingType = get(sp, "listingType");
  const sort = get(sp, "sort") as Sort;
  return {
    q: get(sp, "q").trim().slice(0, 100),
    listingType: listingType === "SALE" || listingType === "RENT" ? listingType : "",
    types: get(sp, "type").split(",").filter((t) => (PROPERTY_TYPES as readonly string[]).includes(t)),
    bedrooms: Math.min(num(get(sp, "bedrooms")), 20),
    bathrooms: Math.min(num(get(sp, "bathrooms")), 20),
    min: num(get(sp, "min")),
    max: num(get(sp, "max")),
    area: num(get(sp, "area")),
    features: cleanFeatures(get(sp, "features").split(",")),
    sort: (SORTS as readonly string[]).includes(sort) ? sort : "recommended",
  };
}

/** Filters -> URL query string (only non-default values). */
export function filtersToQuery(f: PropertyFilters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.listingType) p.set("listingType", f.listingType);
  if (f.types.length) p.set("type", f.types.join(","));
  if (f.bedrooms) p.set("bedrooms", String(f.bedrooms));
  if (f.bathrooms) p.set("bathrooms", String(f.bathrooms));
  if (f.listingType && f.min) p.set("min", String(f.min));
  if (f.listingType && f.max) p.set("max", String(f.max));
  if (f.area) p.set("area", String(f.area));
  if (f.features.length) p.set("features", f.features.join(","));
  if (f.sort !== "recommended") p.set("sort", f.sort);
  return p.toString();
}

export const tokens = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);

type Searchable = {
  title: string; tagline: string; city: string; country: string; location: string;
  type: string; listingType: string; bedrooms: number; bathrooms: number;
  areaSqm: number; priceEur: number; features: string[];
};

export function matches(p: Searchable, f: PropertyFilters): boolean {
  if (f.listingType && p.listingType !== f.listingType) return false;
  if (f.types.length && !f.types.includes(p.type)) return false;
  if (f.bedrooms && p.bedrooms < f.bedrooms) return false;
  if (f.bathrooms && p.bathrooms < f.bathrooms) return false;
  if (f.area && p.areaSqm < f.area) return false;
  // Sale and rent prices live on different scales, so price only applies
  // once a listing type is chosen.
  if (f.listingType && f.min && p.priceEur < f.min) return false;
  if (f.listingType && f.max && p.priceEur > f.max) return false;
  if (f.features.some((k) => !p.features.includes(k))) return false;
  const hay = [p.title, p.tagline, p.city, p.country, p.location, p.type].join(" ").toLowerCase();
  return tokens(f.q).every((t) => hay.includes(t));
}

export function sortProperties<T extends { priceEur: number; areaSqm: number }>(list: T[], sort: Sort): T[] {
  if (sort === "price-asc") return [...list].sort((a, b) => a.priceEur - b.priceEur);
  if (sort === "price-desc") return [...list].sort((a, b) => b.priceEur - a.priceEur);
  if (sort === "area-desc") return [...list].sort((a, b) => b.areaSqm - a.areaSqm);
  return list;
}

/** Number of non-search filters in effect — drives the "Filters (n)" badge. */
export function activeFilterCount(f: PropertyFilters): number {
  return (
    f.types.length + (f.bedrooms ? 1 : 0) + (f.bathrooms ? 1 : 0) + (f.min || f.max ? 1 : 0) +
    (f.area ? 1 : 0) + f.features.length
  );
}
