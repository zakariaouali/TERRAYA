import { prisma } from "@/lib/prisma";
import { properties as staticProperties, type SeedProperty } from "@/data/properties";
import { cleanFeatures, deriveFeatures } from "@/lib/features";
import { matches, sortProperties, tokens, type PropertyFilters } from "@/lib/property-search";
import type { Prisma } from "@prisma/client";

type PropertyRow = Awaited<ReturnType<typeof prisma.property.findFirst>>;

function parseArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function toSeed(p: NonNullable<PropertyRow>): SeedProperty {
  return {
    slug: p.slug,
    title: p.title,
    tagline: p.tagline ?? "",
    description: p.description,
    type: p.type as SeedProperty["type"],
    listingType: p.listingType as SeedProperty["listingType"],
    location: p.location,
    city: p.city,
    country: p.country,
    priceEur: Number(p.priceEur),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaSqm: p.areaSqm,
    landSqm: p.landSqm ?? undefined,
    yieldPercent: p.yieldPercent ?? undefined,
    featured: p.featured,
    heroImage: p.heroImage,
    images: parseArr(p.images),
    amenities: parseArr(p.amenities),
    highlights: parseArr(p.highlights),
    features: cleanFeatures(parseArr(p.features)),
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
  };
}

/** All publicly visible properties (DB-backed, falls back to the static catalogue). */
export async function getAllProperties(): Promise<SeedProperty[]> {
  try {
    const rows = await prisma.property.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });
    if (rows.length > 0) return rows.map(toSeed);
  } catch {
    /* no database — fall through to static */
  }
  return staticProperties;
}

export async function getFeaturedProperties(): Promise<SeedProperty[]> {
  return (await getAllProperties()).filter((p) => p.featured);
}

export async function getPropertyBySlug(slug: string): Promise<SeedProperty | null> {
  try {
    const row = await prisma.property.findUnique({ where: { slug } });
    if (row && row.status !== "DRAFT") return toSeed(row);
  } catch {
    /* fall through to static */
  }
  return staticProperties.find((p) => p.slug === slug) ?? null;
}

export async function getPropertySlugs(): Promise<string[]> {
  try {
    const rows = await prisma.property.findMany({
      where: { status: { not: "DRAFT" } },
      select: { slug: true },
    });
    if (rows.length > 0) return rows.map((r) => r.slug);
  } catch {
    /* fall through */
  }
  return staticProperties.map((p) => p.slug);
}

/**
 * Search the catalogue. With a database the filtering, sorting is done by
 * MySQL (indexed columns; features are matched as quoted JSON keys, so
 * "pool" can never match "poolhouse"); with none it falls back to the same
 * rules applied in memory over the static catalogue (`matches()`).
 */
export async function searchProperties(f: PropertyFilters): Promise<SeedProperty[]> {
  try {
    const total = await prisma.property.count({ where: { status: { not: "DRAFT" } } });
    if (total > 0) {
      const and: Prisma.PropertyWhereInput[] = [];
      for (const t of tokens(f.q)) {
        and.push({
          OR: [
            { title: { contains: t } },
            { tagline: { contains: t } },
            { city: { contains: t } },
            { country: { contains: t } },
            { location: { contains: t } },
            { type: { contains: t } },
          ],
        });
      }
      for (const k of f.features) and.push({ features: { contains: `"${k}"` } });
      if (f.listingType && f.min) and.push({ priceEur: { gte: BigInt(f.min) } });
      if (f.listingType && f.max) and.push({ priceEur: { lte: BigInt(f.max) } });

      const orderBy: Prisma.PropertyOrderByWithRelationInput[] =
        f.sort === "price-asc" ? [{ priceEur: "asc" }]
        : f.sort === "price-desc" ? [{ priceEur: "desc" }]
        : f.sort === "area-desc" ? [{ areaSqm: "desc" }]
        : [{ featured: "desc" }, { updatedAt: "desc" }];

      const rows = await prisma.property.findMany({
        where: {
          status: { not: "DRAFT" },
          ...(f.listingType ? { listingType: f.listingType } : {}),
          ...(f.types.length ? { type: { in: f.types } } : {}),
          ...(f.bedrooms ? { bedrooms: { gte: f.bedrooms } } : {}),
          ...(f.bathrooms ? { bathrooms: { gte: f.bathrooms } } : {}),
          ...(f.area ? { areaSqm: { gte: f.area } } : {}),
          ...(and.length ? { AND: and } : {}),
        },
        orderBy,
      });
      return rows.map(toSeed);
    }
  } catch {
    /* no database — fall through to static */
  }
  return sortProperties(staticProperties.filter((p) => matches(p, f)), f.sort);
}
