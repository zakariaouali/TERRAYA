import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/PropertyForm";

export const dynamic = "force-dynamic";

function parseArr(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.property.findUnique({ where: { id } });
  if (!p) notFound();

  const initial = {
    slug: p.slug,
    title: p.title,
    tagline: p.tagline ?? "",
    description: p.description,
    type: p.type,
    listingType: p.listingType,
    status: p.status,
    location: p.location,
    city: p.city,
    country: p.country,
    priceEur: Number(p.priceEur),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaSqm: p.areaSqm,
    landSqm: p.landSqm,
    yieldPercent: p.yieldPercent,
    featured: p.featured,
    images: parseArr(p.images),
    amenities: parseArr(p.amenities),
    highlights: parseArr(p.highlights),
    latitude: p.latitude,
    longitude: p.longitude,
  };

  return (
    <div>
      <p className="eyebrow">Portfolio</p>
      <h1 className="font-display text-4xl text-sand-900 mt-3">Edit · {p.title}</h1>
      <div className="mt-10">
        <PropertyForm id={p.id} initial={initial} />
      </div>
    </div>
  );
}
