"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/Spinner";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

const PROPERTY_TYPES = ["", "VILLA", "ESTATE", "PENTHOUSE", "RESIDENCE", "RIAD", "LAND"];
const EASE = [0.16, 1, 0.3, 1] as const;

type Initial = { listingType?: string; propertyType?: string; city?: string; bedrooms?: string };
type FormState = {
  name: string; email: string; phone: string;
  listingType: "SALE" | "RENT";
  propertyType: string; city: string; bedrooms: string;
  minBudget: string; maxBudget: string; notes: string;
};

const EMPTY = (initial?: Initial): FormState => ({
  name: "", email: "", phone: "",
  listingType: initial?.listingType === "RENT" ? "RENT" : "SALE",
  propertyType: initial?.propertyType ?? "",
  city: initial?.city ?? "",
  bedrooms: initial?.bedrooms ?? "",
  minBudget: "", maxBudget: "", notes: "",
});

export function PropertyRequestPanel({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Initial;
}) {
  const { currency, fromDisplay } = useCurrency();
  const [data, setData] = useState<FormState>(() => EMPTY(initial));
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Re-seed from the current filter state each time the panel opens, so a
  // visitor who just filtered Rent/Riad/Gueliz sees that reflected here.
  useEffect(() => {
    if (open) setData(EMPTY(initial));
    if (open) setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const patch = (p: Partial<FormState>) => setData((d) => ({ ...d, ...p }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      listingType: data.listingType,
      propertyType: data.propertyType || undefined,
      city: data.city || undefined,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      minBudget: data.minBudget ? fromDisplay(Number(data.minBudget)) : undefined,
      maxBudget: data.maxBudget ? fromDisplay(Number(data.maxBudget)) : undefined,
      notes: data.notes || undefined,
    };
    const res = await fetch("/api/property-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      setStatus("error");
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setStatus("sent");
  }

  const budgetUnit = data.listingType === "RENT" ? `${currency} / month` : currency;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-[90] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Tell us what you're looking for"
            data-lenis-prevent
            className="fixed inset-x-0 bottom-0 z-[91] max-h-[90vh] overflow-y-auto border-t border-sand-200 bg-sand-50 p-8 dark:border-sand-800 dark:bg-sand-900 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-full sm:max-w-md sm:border sm:p-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-6 top-6 text-sand-500 transition-colors hover:text-sand-900 dark:hover:text-sand-100"
            >
              <X size={18} />
            </button>

            {status === "sent" ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="py-6 text-center"
              >
                <motion.svg width="48" height="48" viewBox="0 0 56 56" className="mx-auto text-sand-900 dark:text-sand-100">
                  <motion.circle
                    cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                  <motion.path
                    d="M17 29l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
                  />
                </motion.svg>
                <p className="font-display text-2xl text-sand-900 dark:text-sand-100 mt-5">We&apos;re on it.</p>
                <p className="mt-3 text-sand-700 dark:text-sand-300 leading-relaxed">
                  Our office will search the full portfolio — including properties not yet listed publicly — and contact you within one business day.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5">
                <div>
                  <p className="eyebrow">Buyer brief</p>
                  <h3 className="font-display text-2xl text-sand-900 dark:text-sand-100 mt-2">Tell us what you need.</h3>
                  <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
                    We&apos;ll search off-market inventory too, and come back to you personally.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["SALE", "RENT"] as const).map((lt) => {
                    const active = data.listingType === lt;
                    return (
                      <button
                        key={lt}
                        type="button"
                        onClick={() => patch({ listingType: lt })}
                        className={cn(
                          "relative overflow-hidden border px-4 py-3 text-left transition-colors",
                          active ? "border-sand-900 dark:border-sand-100" : "border-sand-300 hover:border-sand-500 dark:border-sand-700"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="request-intent-bg"
                            className="absolute inset-0 bg-sand-900 dark:bg-sand-100"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                          />
                        )}
                        <span className={cn("relative z-10 text-sm", active ? "text-sand-50 dark:text-sand-900" : "text-sand-900 dark:text-sand-100")}>
                          {lt === "SALE" ? "Buy" : "Rent"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="req-name">Name</Label>
                    <Input id="req-name" required minLength={2} maxLength={120} value={data.name} onChange={(e) => patch({ name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="req-email">Email</Label>
                    <Input id="req-email" type="email" required maxLength={255} value={data.email} onChange={(e) => patch({ email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="req-phone">Phone (optional)</Label>
                    <Input id="req-phone" type="tel" maxLength={40} value={data.phone} onChange={(e) => patch({ phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="req-type">Property type</Label>
                    <Select id="req-type" value={data.propertyType} onChange={(e) => patch({ propertyType: e.target.value })}>
                      {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t || "Any"}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="req-city">Preferred area</Label>
                    <Input id="req-city" maxLength={120} placeholder="e.g. Gueliz" value={data.city} onChange={(e) => patch({ city: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="req-bedrooms">Bedrooms</Label>
                    <Select id="req-bedrooms" value={data.bedrooms} onChange={(e) => patch({ bedrooms: e.target.value })}>
                      <option value="">Any</option>
                      {[2, 3, 4, 5, 6, 8].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="req-min">Min budget ({budgetUnit})</Label>
                    <Input id="req-min" type="number" min={0} value={data.minBudget} onChange={(e) => patch({ minBudget: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="req-max">Max budget ({budgetUnit})</Label>
                    <Input id="req-max" type="number" min={0} value={data.maxBudget} onChange={(e) => patch({ maxBudget: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="req-notes">Anything else?</Label>
                  <Textarea id="req-notes" maxLength={2000} className="min-h-20" value={data.notes} onChange={(e) => patch({ notes: e.target.value })} />
                </div>

                {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

                <Button type="submit" disabled={status === "loading"} className="gap-2">
                  {status === "loading" && <Spinner size={15} />}
                  {status === "loading" ? "Sending…" : "Send my brief"}
                </Button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
