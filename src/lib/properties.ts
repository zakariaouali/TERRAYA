import { prisma } from "@/lib/prisma";
import { properties as staticProperties, type SeedProperty } from "@/data/properties";

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
