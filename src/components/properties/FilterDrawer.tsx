"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FEATURES, FEATURE_GROUPS, type FeatureKey } from "@/lib/features";
import { filtersToQuery, type PropertyFilters } from "@/lib/property-search";
import { FEATURE_ICONS } from "@/components/properties/featureIcons";
import { Spinner } from "@/components/shared/Spinner";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  en: {
    title: "Filters", close: "Close", price: "Price", perMonth: "per month", min: "Min", max: "Max",
    pricePick: "Choose Buy or Rent above to filter by price.", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
    area: "Interior size", any: "Any", features: "Features", clear: "Clear all", show: "Show", one: "property",
    many: "properties", none: "No properties", buy: "Buy", rent: "Rent", all: "All",
  },
  fr: {
    title: "Filtres", close: "Fermer", price: "Prix", perMonth: "par mois", min: "Min", max: "Max",
    pricePick: "Choisissez Acheter ou Louer pour filtrer par prix.", bedrooms: "Chambres", bathrooms: "Salles de bain",
    area: "Surface habitable", any: "Tous", features: "Équipements", clear: "Tout effacer", show: "Voir",
    one: "bien", many: "biens", none: "Aucun bien", buy: "Acheter", rent: "Louer", all: "Tous",
  },
} as const;

const SALE_PRESETS: [number, number][] = [[0, 2_500_000], [2_500_000, 5_000_000], [5_000_000, 10_000_000], [10_000_000, 0]];
const RENT_PRESETS: [number, number][] = [[0, 2_000], [2_000, 4_000], [4_000, 8_000], [8_000, 0]];

const fmt = (n: number) => (n >= 1_000_000 ? `€${+(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `€${+(n / 1000).toFixed(1)}K` : `€${n}`);
const presetLabel = ([a, b]: [number, number]) => (!a ? `< ${fmt(b)}` : !b ? `${fmt(a)}+` : `${fmt(a)} – ${fmt(b)}`);

function Pills({ value, options, onChange, any }: { value: number; options: number[]; onChange: (n: number) => void; any: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[0, ...options].map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className={cn(
            "min-w-[3.25rem] rounded-full border px-4 py-2 text-sm transition-colors",
            value === n
              ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
              : "border-sand-300 text-sand-800 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-400"
          )}
        >
          {n === 0 ? any : `${n}+`}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-sand-200 py-7 dark:border-sand-800">
      <h3 className="mb-4 font-display text-xl text-sand-900 dark:text-sand-100">{title}</h3>
      {children}
    </section>
  );
}

export function FilterDrawer({
  open,
  onClose,
  applied,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  applied: PropertyFilters;
  onApply: (f: PropertyFilters) => void;
}) {
  const { lang } = useLang();
  const c = COPY[lang === "fr" ? "fr" : "en"];
  const [draft, setDraft] = useState(applied);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Start each opening from what is currently applied.
  useEffect(() => {
    if (open) {
      setDraft(applied);
      opener.current = document.activeElement as HTMLElement | null;
    } else {
      opener.current?.focus?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Live result count for the draft, debounced so dragging through options
  // doesn't fire a request per click.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/properties/search?${filtersToQuery(draft)}`, { signal: ctrl.signal });
        const json = await res.json();
        setCount(typeof json.count === "number" ? json.count : null);
        setLoading(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") { setCount(null); setLoading(false); }
      }
    }, 300);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [draft, open]);

  // Escape to close, Tab kept inside the panel, page scroll locked.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const els = panelRef.current.querySelectorAll<HTMLElement>("button, input, select, [tabindex]:not([tabindex='-1'])");
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prevOverflow; document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  const patch = (p: Partial<PropertyFilters>) => setDraft((d) => ({ ...d, ...p }));
  const toggleFeature = (k: FeatureKey) =>
    patch({ features: draft.features.includes(k) ? draft.features.filter((x) => x !== k) : [...draft.features, k] });

  const presets = draft.listingType === "RENT" ? RENT_PRESETS : SALE_PRESETS;
  const priceInput = "h-12 w-full border border-sand-300 bg-transparent px-4 text-sand-900 focus:border-sand-700 focus:outline-none dark:border-sand-700 dark:text-sand-100 dark:focus:border-sand-400";

  const cta =
    count === null ? `${c.show}` : count === 0 ? c.none : `${c.show} ${count} ${count === 1 ? c.one : c.many}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={c.title}
            tabIndex={-1}
            className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-xl flex-col bg-sand-50 shadow-2xl outline-none dark:bg-sand-900"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <header className="flex items-center justify-between border-b border-sand-200 px-6 py-5 dark:border-sand-800 sm:px-8">
              <h2 className="font-display text-2xl text-sand-900 dark:text-sand-100">{c.title}</h2>
              <button type="button" onClick={onClose} aria-label={c.close} className="flex h-10 w-10 items-center justify-center rounded-full text-sand-600 transition-colors hover:bg-sand-200 dark:text-sand-300 dark:hover:bg-sand-800">
                <X size={18} />
              </button>
            </header>

            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 sm:px-8">
              <Section title={c.price}>
                <div className="mb-4 inline-flex gap-2">
                  {([["", c.all], ["SALE", c.buy], ["RENT", c.rent]] as const).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={draft.listingType === v}
                      onClick={() => patch({ listingType: v, min: 0, max: 0 })}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        draft.listingType === v
                          ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
                          : "border-sand-300 text-sand-800 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {draft.listingType ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((pr) => {
                        const on = draft.min === pr[0] && draft.max === pr[1];
                        return (
                          <button
                            key={pr.join("-")}
                            type="button"
                            aria-pressed={on}
                            onClick={() => patch(on ? { min: 0, max: 0 } : { min: pr[0], max: pr[1] })}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm transition-colors",
                              on ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900" : "border-sand-300 text-sand-800 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200"
                            )}
                          >
                            {presetLabel(pr)}{draft.listingType === "RENT" ? " /mo" : ""}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <label className="block text-xs uppercase tracking-[0.18em] text-sand-500 dark:text-sand-400">
                        {c.min} (€{draft.listingType === "RENT" ? " / mo" : ""})
                        <input type="number" inputMode="numeric" min={0} value={draft.min || ""} onChange={(e) => patch({ min: Math.max(0, Number(e.target.value) || 0) })} className={cn(priceInput, "mt-2")} />
                      </label>
                      <label className="block text-xs uppercase tracking-[0.18em] text-sand-500 dark:text-sand-400">
                        {c.max} (€{draft.listingType === "RENT" ? " / mo" : ""})
                        <input type="number" inputMode="numeric" min={0} value={draft.max || ""} onChange={(e) => patch({ max: Math.max(0, Number(e.target.value) || 0) })} className={cn(priceInput, "mt-2")} />
                      </label>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-sand-600 dark:text-sand-400">{c.pricePick}</p>
                )}
              </Section>

              <Section title={c.bedrooms}><Pills value={draft.bedrooms} options={[1, 2, 3, 4, 5, 6]} onChange={(n) => patch({ bedrooms: n })} any={c.any} /></Section>
              <Section title={c.bathrooms}><Pills value={draft.bathrooms} options={[1, 2, 3, 4, 5]} onChange={(n) => patch({ bathrooms: n })} any={c.any} /></Section>

              <Section title={c.area}>
                <div className="flex flex-wrap gap-2">
                  {[0, 150, 300, 500, 800].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={draft.area === n}
                      onClick={() => patch({ area: n })}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        draft.area === n ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900" : "border-sand-300 text-sand-800 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200"
                      )}
                    >
                      {n === 0 ? c.any : `${n}+ m²`}
                    </button>
                  ))}
                </div>
              </Section>

              <section className="py-7">
                <h3 className="mb-5 font-display text-xl text-sand-900 dark:text-sand-100">{c.features}</h3>
                <div className="space-y-6">
                  {FEATURE_GROUPS.map((g) => (
                    <div key={g.key}>
                      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.24em] text-sand-500 dark:text-sand-400">{g[lang === "fr" ? "fr" : "en"]}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {FEATURES.filter((f) => f.group === g.key).map((f) => {
                          const Icon = FEATURE_ICONS[f.key];
                          const on = draft.features.includes(f.key);
                          return (
                            <button
                              key={f.key}
                              type="button"
                              aria-pressed={on}
                              onClick={() => toggleFeature(f.key)}
                              className={cn(
                                "flex items-center gap-3 border px-4 py-3.5 text-left text-sm transition-all duration-300",
                                on
                                  ? "border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-100 dark:bg-sand-100 dark:text-sand-900"
                                  : "border-sand-300 text-sand-800 hover:border-sand-600 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-400"
                              )}
                            >
                              {Icon && <Icon size={18} strokeWidth={1.6} className="shrink-0" />}
                              {f[lang === "fr" ? "fr" : "en"]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-sand-200 bg-sand-50 px-6 py-4 dark:border-sand-800 dark:bg-sand-900 sm:px-8">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, types: [], bedrooms: 0, bathrooms: 0, min: 0, max: 0, area: 0, features: [], listingType: "" })}
                className="text-sm text-sand-700 underline underline-offset-4 transition-colors hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100"
              >
                {c.clear}
              </button>
              <button
                type="button"
                onClick={() => { onApply(draft); onClose(); }}
                className="inline-flex h-12 items-center justify-center gap-2 bg-sand-900 px-8 text-[0.72rem] uppercase tracking-[0.2em] text-sand-50 transition-colors hover:bg-sand-800 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-200"
              >
                {loading && <Spinner size={14} />}
                {cta}
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
