"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { FadeIn } from "@/components/shared/FadeIn";
import { FEATURES } from "@/lib/features";
import { FEATURE_ICONS } from "@/components/properties/featureIcons";
import { Price } from "@/components/shared/Price";
import type { ListingType } from "@/data/properties";
import { useLang } from "@/lib/i18n";

export function ShareButton({ title }: { title: string }) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed share sheet or clipboard blocked — nothing to do */
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-sand-300 px-4 text-xs uppercase tracking-[0.18em] text-sand-800 transition-colors hover:border-sand-600 dark:border-sand-700 dark:text-sand-200"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? (lang === "fr" ? "Lien copié" : "Link copied") : lang === "fr" ? "Partager" : "Share"}
    </button>
  );
}

/** Icon grid of the property's structured features (the same ones the filters use). */
export function FeatureGrid({ features }: { features: string[] }) {
  const { lang } = useLang();
  const l = lang === "fr" ? "fr" : "en";
  const list = FEATURES.filter((f) => features.includes(f.key));
  if (list.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
      {list.map((f, i) => {
        const Icon = FEATURE_ICONS[f.key];
        return (
          <li key={f.key}>
            <FadeIn delay={(i % 3) * 0.06}>
              <div className="group flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sand-300 text-sand-800 transition-all duration-500 group-hover:border-sand-900 group-hover:bg-sand-900 group-hover:text-sand-50 dark:border-sand-700 dark:text-sand-200 dark:group-hover:border-sand-100 dark:group-hover:bg-sand-100 dark:group-hover:text-sand-900">
                  {Icon && <Icon size={20} strokeWidth={1.5} />}
                </span>
                <span className="text-sand-900 dark:text-sand-100">{f[l]}</span>
              </div>
            </FadeIn>
          </li>
        );
      })}
    </ul>
  );
}

/** Mobile-only bar so the price and contact action are always in reach. */
export function MobileContactBar({ eur, listingType }: { eur: number; listingType: ListingType }) {
  const { lang } = useLang();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-sand-200 bg-sand-50/95 px-5 py-3 backdrop-blur dark:border-sand-800 dark:bg-sand-900/95 lg:hidden">
      <Price eur={eur} listingType={listingType} className="text-lg font-medium text-sand-900 dark:text-sand-100" />
      <a
        href="#inquiry"
        className="bg-sand-900 px-6 py-3 text-[0.68rem] uppercase tracking-[0.2em] text-sand-50 dark:bg-sand-100 dark:text-sand-900"
      >
        {lang === "fr" ? "Nous contacter" : "Enquire"}
      </a>
    </div>
  );
}
