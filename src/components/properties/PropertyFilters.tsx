"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { AnimatedSearch } from "@/components/shared/AnimatedIcon";
import { Spinner } from "@/components/shared/Spinner";
import { PropertyRequestPanel } from "@/components/properties/PropertyRequestPanel";
import { FilterDrawer } from "@/components/properties/FilterDrawer";
import { FEATURE_ICONS, TYPE_ICONS } from "@/components/properties/featureIcons";
import { featureLabel } from "@/lib/features";
import {
  PROPERTY_TYPES, SORTS, activeFilterCount, filtersToQuery, parseFilters, type PropertyFilters as Filters,
} from "@/lib/property-search";
import { useLang } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const COPY = {
  en: {
    placeholder: "City, area or property name", search: "Search", clearSearch: "Clear search",
    all: "All", buy: "Buy", rent: "Rent", filters: "Filters", sort: "Sort",
    sorts: { recommended: "Recommended", "price-asc": "Price: low to high", "price-desc": "Price: high to low", "area-desc": "Largest first" },
    types: { VILLA: "Villas", ESTATE: "Estates", PENTHOUSE: "Penthouses", RESIDENCE: "Residences", RIAD: "Riads", LAND: "Land" },
    clearAll: "Clear all", cant: "Can't find exactly what you're after?", tell: "Tell us what you need",
    bed: "bed", bath: "bath", perMo: "/mo", from: "From", upTo: "Up to",
  },
  fr: {
    placeholder: "Ville, quartier ou nom du bien", search: "Rechercher", clearSearch: "Effacer la recherche",
    all: "Tous", buy: "Acheter", rent: "Louer", filters: "Filtres", sort: "Trier",
    sorts: { recommended: "Recommandés", "price-asc": "Prix croissant", "price-desc": "Prix décroissant", "area-desc": "Plus grands d'abord" },
    types: { VILLA: "Villas", ESTATE: "Domaines", PENTHOUSE: "Penthouses", RESIDENCE: "Résidences", RIAD: "Riads", LAND: "Terrains" },
    clearAll: "Tout effacer", cant: "Vous ne trouvez pas exactement ce que vous cherchez ?", tell: "Dites-nous ce qu'il vous faut",
    bed: "ch.", bath: "sdb", perMo: "/mois", from: "Dès", upTo: "Jusqu'à",
  },
} as const;

const DEBOUNCE_MS = 800;

export function PropertyFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const { lang } = useLang();
  const { formatCompact: fmt } = useCurrency();
  const c = COPY[lang === "fr" ? "fr" : "en"];
  const [pending, startTransition] = useTransition();
  const filters = useMemo(() => parseFilters(params), [params]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function apply(next: Filters) {
    const qs = filtersToQuery(next);
    startTransition(() => router.replace(qs ? `/properties?${qs}` : "/properties", { scroll: false }));
  }
  // Read through a ref so a debounced search never applies stale filters.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const patch = (p: Partial<Filters>) => apply({ ...filtersRef.current, ...p });

  // ── Search box: applies on Enter / button, or after the visitor pauses.
  // It never fires per keystroke.
  const [text, setText] = useState(filters.q);
  const lastApplied = useRef(filters.q);
  useEffect(() => {
    // URL changed from elsewhere (clear all, back button): mirror it.
    if (filters.q !== lastApplied.current) { lastApplied.current = filters.q; setText(filters.q); }
  }, [filters.q]);
  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === lastApplied.current) return;
    const id = setTimeout(() => submitSearch(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  function submitSearch(value = text.trim()) {
    if (value === lastApplied.current) return;
    lastApplied.current = value;
    patch({ q: value });
  }

  const count = activeFilterCount(filters);
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...filters.types.map((t) => ({ key: `t-${t}`, label: c.types[t as keyof typeof c.types] ?? t, remove: () => patch({ types: filters.types.filter((x) => x !== t) }) })),
    ...(filters.min || filters.max
      ? [{
          key: "price",
          label: `${filters.min && filters.max ? `${fmt(filters.min)} – ${fmt(filters.max)}` : filters.min ? `${c.from} ${fmt(filters.min)}` : `${c.upTo} ${fmt(filters.max)}`}${filters.listingType === "RENT" ? ` ${c.perMo}` : ""}`,
          remove: () => patch({ min: 0, max: 0 }),
        }]
      : []),
    ...(filters.bedrooms ? [{ key: "bed", label: `${filters.bedrooms}+ ${c.bed}`, remove: () => patch({ bedrooms: 0 }) }] : []),
    ...(filters.bathrooms ? [{ key: "bath", label: `${filters.bathrooms}+ ${c.bath}`, remove: () => patch({ bathrooms: 0 }) }] : []),
    ...(filters.area ? [{ key: "area", label: `${filters.area}+ m²`, remove: () => patch({ area: 0 }) }] : []),
    ...filters.features.map((k) => ({ key: `f-${k}`, label: featureLabel(k, lang === "fr" ? "fr" : "en"), remove: () => patch({ features: filters.features.filter((x) => x !== k) }) })),
  ];

  return (
    <div className="space-y-5">
      {/* Row 1 — search + buy/rent */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <form
          role="search"
          onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
          className="relative flex h-14 flex-1 items-center border border-sand-300 bg-white/40 transition-colors focus-within:border-sand-700 dark:border-sand-700 dark:bg-white/5 dark:focus-within:border-sand-400"
        >
          <span className="pointer-events-none pl-4 text-sand-500 dark:text-sand-400"><AnimatedSearch size={17} /></span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={c.placeholder}
            aria-label={c.placeholder}
            maxLength={100}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sand-900 placeholder:text-sand-500 focus:outline-none dark:text-sand-100 dark:placeholder:text-sand-400"
          />
          {text && (
            <button type="button" aria-label={c.clearSearch} onClick={() => { setText(""); submitSearch(""); }} className="px-2 text-sand-500 transition-colors hover:text-sand-900 dark:hover:text-sand-100">
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="mr-1.5 inline-flex h-11 items-center gap-2 bg-sand-900 px-6 text-[0.68rem] uppercase tracking-[0.2em] text-sand-50 transition-colors hover:bg-sand-800 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-200"
          >
            {pending ? <Spinner size={13} /> : null}
            {c.search}
          </button>
        </form>

        <div role="group" className="relative inline-flex self-start border border-sand-300 dark:border-sand-700">
          {([["", c.all], ["SALE", c.buy], ["RENT", c.rent]] as const).map(([value, label]) => {
            const active = filters.listingType === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => patch({ listingType: value, min: 0, max: 0 })}
                className={cn(
                  "relative h-14 px-6 text-[0.7rem] uppercase tracking-[0.24em] transition-colors",
                  active ? "text-sand-50 dark:text-sand-900" : "text-sand-700 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100"
                )}
              >
                {active && (
                  <motion.span layoutId="listing-type-bg" className="absolute inset-0 bg-sand-900 dark:bg-sand-100" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2 — property types, filters, sort */}
      <div className="flex items-center gap-3">
        <div className="no-scrollbar -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-1">
          {PROPERTY_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t];
            const on = filters.types.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => patch({ types: on ? filters.types.filter((x) => x !== t) : [...filters.types, t] })}
                className={cn(
                  "group inline-flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm transition-all duration-300",
                  on
                    ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
                    : "border-sand-300 text-sand-800 hover:-translate-y-0.5 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-400"
                )}
              >
                {Icon && <Icon size={16} strokeWidth={1.6} className="transition-transform duration-300 group-hover:scale-110" />}
                {c.types[t]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="relative inline-flex h-11 shrink-0 items-center gap-2.5 border border-sand-900 px-5 text-[0.7rem] uppercase tracking-[0.2em] text-sand-900 transition-colors hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900"
        >
          <SlidersHorizontal size={15} />
          {c.filters}
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sand-900 px-1.5 text-[0.65rem] text-sand-50 dark:bg-sand-100 dark:text-sand-900">{count}</span>
          )}
        </button>

        <label className="hidden shrink-0 sm:block">
          <span className="sr-only">{c.sort}</span>
          <select
            value={filters.sort}
            onChange={(e) => patch({ sort: e.target.value as Filters["sort"] })}
            className="h-11 border border-sand-300 bg-transparent px-3 text-sm text-sand-800 focus:border-sand-700 focus:outline-none dark:border-sand-700 dark:text-sand-200"
          >
            {SORTS.map((s) => <option key={s} value={s}>{c.sorts[s]}</option>)}
          </select>
        </label>
      </div>

      {/* Row 3 — active filters */}
      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="flex flex-wrap items-center gap-2 pt-1">
              <AnimatePresence initial={false}>
                {chips.map((chip) => {
                  const featureKey = chip.key.startsWith("f-") ? chip.key.slice(2) : null;
                  const Icon = featureKey ? FEATURE_ICONS[featureKey] : null;
                  return (
                    <motion.li
                      key={chip.key}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        type="button"
                        onClick={chip.remove}
                        aria-label={`Remove ${chip.label}`}
                        className="inline-flex items-center gap-2 rounded-full bg-sand-200 px-3.5 py-1.5 text-sm text-sand-900 transition-colors hover:bg-sand-300 dark:bg-sand-800 dark:text-sand-100 dark:hover:bg-sand-700"
                      >
                        {Icon && <Icon size={14} strokeWidth={1.6} />}
                        {chip.label}
                        <X size={13} />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              <li>
                <button type="button" onClick={() => apply({ ...filters, types: [], bedrooms: 0, bathrooms: 0, min: 0, max: 0, area: 0, features: [] })} className="ml-1 text-sm text-sand-700 underline underline-offset-4 hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100">
                  {c.clearAll}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm text-sand-600 dark:text-sand-400">
        {c.cant}{" "}
        <button
          type="button"
          onClick={() => setRequestOpen(true)}
          className="border-b border-sand-900 pb-0.5 text-sand-900 transition-colors hover:text-sand-600 dark:border-sand-100 dark:text-sand-100 dark:hover:text-sand-300"
        >
          {c.tell}
        </button>
      </p>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} applied={filters} onApply={apply} />

      <PropertyRequestPanel
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        initial={{
          listingType: filters.listingType === "RENT" ? "RENT" : "SALE",
          propertyType: filters.types[0] ?? "",
          city: filters.q,
          bedrooms: filters.bedrooms ? String(filters.bedrooms) : "",
        }}
      />
    </div>
  );
}
