import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SeedProperty } from "@/data/properties";
import { getAllProperties } from "@/lib/properties";
import { Container } from "@/components/shared/Container";
import { FadeImage } from "@/components/shared/FadeImage";
import { Price } from "@/components/shared/Price";
import { formatArea } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare Properties",
  description: "Compare exceptional properties from the TERRAYA collection side by side.",
  robots: { index: false, follow: true },
};

type SearchParams = { slugs?: string };

const rows: { label: string; value: (p: SeedProperty) => ReactNode }[] = [
  { label: "Location", value: (p) => `${p.city}, ${p.country}` },
  { label: "Type", value: (p) => p.type.charAt(0) + p.type.slice(1).toLowerCase() },
  { label: "Price", value: (p) => <Price eur={p.priceEur} listingType={p.listingType} /> },
  { label: "Bedrooms", value: (p) => String(p.bedrooms) },
  { label: "Bathrooms", value: (p) => String(p.bathrooms) },
  { label: "Interior", value: (p) => formatArea(p.areaSqm) },
  { label: "Land", value: (p) => (p.landSqm ? formatArea(p.landSqm) : "—") },
  { label: "Indicative Yield", value: (p) => (p.yieldPercent ? `${p.yieldPercent}%` : "—") },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const slugs = (sp.slugs ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);
  const all = await getAllProperties();
  const selected = slugs
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is SeedProperty => Boolean(p));

  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">
            <span className="luxury-divider">Compare</span>
          </p>
          <h1 className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.05]">
            Side by side.
          </h1>
        </div>

        {selected.length === 0 ? (
          <div className="mt-16 border-t border-sand-200 dark:border-sand-800 pt-16 text-center">
            <p className="font-display text-2xl text-sand-700 dark:text-sand-300">
              Save a few properties, then compare them here.
            </p>
            <Link
              href="/properties"
              className="mt-8 inline-flex items-center bg-sand-900 px-9 py-4 text-[0.7rem] uppercase tracking-[0.24em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
            >
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-40 align-bottom p-4" />
                  {selected.map((p) => (
                    <th key={p.slug} className="p-4 align-bottom">
                      <Link href={`/properties/${p.slug}`} className="group block">
                        <div className="relative aspect-[4/3] overflow-hidden ">
                          <FadeImage
                            src={p.heroImage}
                            alt={p.title}
                            fill
                            sizes="(min-width:1024px) 22vw, 60vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <span className="mt-4 block font-display text-xl text-sand-900 dark:text-sand-100">
                          {p.title}
                        </span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-sand-200 dark:border-sand-800">
                    <th scope="row" className="p-4 text-[0.66rem] uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400 font-normal align-top">
                      {row.label}
                    </th>
                    {selected.map((p) => (
                      <td key={p.slug} className="p-4 text-sand-800 dark:text-sand-200 align-top">
                        {row.value(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </div>
  );
}
