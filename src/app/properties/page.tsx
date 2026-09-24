import type { Metadata } from "next";
import Link from "next/link";
import type { ListingType } from "@/data/properties";
import { searchProperties } from "@/lib/properties";
import { parseFilters } from "@/lib/property-search";
import { Container } from "@/components/shared/Container";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { RevealText } from "@/components/shared/RevealText";

export const metadata: Metadata = {
  title: "Properties",
  description: "A curated collection of exceptional properties from the TERRAYA portfolio.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const COPY: Record<ListingType | "ALL", { eyebrow: string; title: string; description: string }> = {
  ALL: {
    eyebrow: "Collection",
    title: "Properties held with intention.",
    description:
      "Each property in our portfolio is sourced through long-standing relationships and personally surveyed before it is released.",
  },
  SALE: {
    eyebrow: "For Sale",
    title: "Properties held with intention.",
    description:
      "Each property in our portfolio is sourced through long-standing relationships and personally surveyed before it is released.",
  },
  RENT: {
    eyebrow: "For Rent",
    title: "Long-term residences, ready to call home.",
    description:
      "Furnished, fully managed residences offered on a long-term lease — six months minimum — in Marrakech.",
  },
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const filtered = await searchProperties(filters);
  const listingType = filters.listingType;

  const copy = COPY[listingType || "ALL"];

  return (
    <div className="pt-32 lg:pt-40">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow mb-4"><span className="luxury-divider">{copy.eyebrow}</span></p>
          <RevealText as="h1" className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.05]">{copy.title}</RevealText>
          <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed">
            {copy.description}
          </p>
        </div>

        <div className="mt-16">
          <PropertyFilters />
        </div>

        <p className="mt-8 text-sm tracking-[0.22em] uppercase text-sand-600 dark:text-sand-400">
          {filtered.length} {filtered.length === 1 ? "Property" : "Properties"}
        </p>

        <div className="mt-12 grid gap-14 md:grid-cols-2 lg:grid-cols-3 pb-24">
          {filtered.map((p) => (
            <PropertyCard key={p.slug} p={p} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="font-display text-2xl italic text-sand-700 dark:text-sand-300">
                Nothing in the collection matches yet — tell us what you need above, and we&apos;ll find it for you.
              </p>
              <Link href="/properties" className="mt-6 inline-block border-b border-sand-900 pb-0.5 text-sm text-sand-900 dark:border-sand-100 dark:text-sand-100">
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
