import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize, TrendingUp } from "lucide-react";
import { getAllProperties, getPropertyBySlug, getPropertySlugs } from "@/lib/properties";
import { Container } from "@/components/shared/Container";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { LazyMap } from "@/components/properties/LazyMap";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { InquiryForm } from "@/components/properties/InquiryForm";
import { formatArea, listingPriceLabel, rentalTerms } from "@/lib/utils";
import { Price } from "@/components/shared/Price";

export async function generateStaticParams() {
  return (await getPropertySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return { title: "Property not found" };
  return {
    title: `${p.title} — ${p.city}`,
    description: p.tagline,
    openGraph: { title: p.title, description: p.tagline, images: [p.heroImage] },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) notFound();

  const similar = (await getAllProperties())
    .filter((x) => x.slug !== p.slug && x.listingType === p.listingType && x.type === p.type)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: p.title,
    description: p.tagline,
    image: p.images,
    numberOfRooms: p.bedrooms,
    floorSize: { "@type": "QuantitativeValue", value: p.areaSqm, unitCode: "MTK" },
    address: {
      "@type": "PostalAddress",
      addressLocality: p.city,
      addressCountry: p.country,
    },
    ...(p.listingType === "SALE" && {
      offers: { "@type": "Offer", price: p.priceEur, priceCurrency: "EUR", availability: "https://schema.org/InStock" },
    }),
  };

  return (
    <div className="pt-28 lg:pt-32 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <Link href="/properties" className="text-xs tracking-[0.28em] uppercase text-sand-600 dark:text-sand-400 hover:text-sand-900 dark:hover:text-sand-100">
          ← Back to Collection
        </Link>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow"><span className="luxury-divider">{p.type}</span></p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.02] mt-4">
              {p.title}
            </h1>
            <p className="mt-4 text-sand-700 dark:text-sand-300 text-lg font-display italic">{p.tagline}</p>
            <p className="mt-3 flex items-center gap-2 text-sand-600 dark:text-sand-400 text-sm tracking-[0.18em] uppercase">
              <MapPin size={14} /> {p.location} · {p.city}, {p.country}
            </p>
          </div>
          <div className="lg:text-right">
            <p className="eyebrow">{listingPriceLabel(p.listingType)}</p>
            <Price eur={p.priceEur} listingType={p.listingType} className="font-display text-4xl lg:text-5xl text-sand-900 dark:text-sand-100 mt-2 block" />
            {rentalTerms(p.listingType) && (
              <p className="mt-1 text-xs tracking-[0.2em] uppercase text-sand-500 dark:text-sand-500">
                {rentalTerms(p.listingType)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <PropertyGallery images={p.images} title={p.title} />
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-sand-200 dark:border-sand-800 py-8">
              <Metric icon={<BedDouble size={18} />} label="Bedrooms" value={String(p.bedrooms)} />
              <Metric icon={<Bath size={18} />} label="Bathrooms" value={String(p.bathrooms)} />
              <Metric icon={<Maximize size={18} />} label="Interior" value={formatArea(p.areaSqm)} />
              {p.yieldPercent ? (
                <Metric icon={<TrendingUp size={18} />} label="Indicative Yield" value={`${p.yieldPercent}%`} />
              ) : p.landSqm ? (
                <Metric icon={<Maximize size={18} />} label="Land" value={formatArea(p.landSqm)} />
              ) : null}
            </div>

            <section>
              <p className="eyebrow mb-4">The Residence</p>
              <p className="font-display text-2xl md:text-3xl leading-snug text-sand-900 dark:text-sand-100 whitespace-pre-line">
                {p.description}
              </p>
            </section>

            <section>
              <p className="eyebrow mb-4">Highlights</p>
              <ul className="grid gap-3 md:grid-cols-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sand-800 dark:text-sand-200">
                    <span className="mt-2 h-px w-5 bg-sand-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="eyebrow mb-4">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {p.amenities.map((a) => (
                  <span key={a} className="px-4 py-2 border border-sand-300 dark:border-sand-700 text-sand-800 dark:text-sand-200 text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </section>

            {p.latitude && p.longitude && (
              <section>
                <p className="eyebrow mb-4">Location</p>
                <div className="relative aspect-[16/9] overflow-hidden border border-sand-200 dark:border-sand-800">
                  <LazyMap
                    title={`${p.title} — location`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude - 0.05}%2C${p.latitude - 0.03}%2C${p.longitude + 0.05}%2C${p.latitude + 0.03}&layer=mapnik&marker=${p.latitude}%2C${p.longitude}`}
                  />
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-32 h-fit">
            <div className="border border-sand-200 dark:border-sand-800 p-8 bg-sand-50 dark:bg-sand-900">
              <p className="eyebrow">Private Inquiry</p>
              <h3 className="font-display text-3xl text-sand-900 dark:text-sand-100 mt-3">Speak with our office.</h3>
              <p className="mt-3 text-sand-700 dark:text-sand-300 leading-relaxed">
                Brochure, viewing arrangements, and complete property dossier are available on request.
              </p>
              <div className="mt-8">
                <InquiryForm propertyId={p.slug} />
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-32">
            <p className="eyebrow mb-4"><span className="luxury-divider">Similar Properties</span></p>
            <h2 className="font-display text-4xl text-sand-900 dark:text-sand-100">You may also consider.</h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.slug} p={s} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sand-600 dark:text-sand-400">{icon}<span className="eyebrow">{label}</span></div>
      <p className="font-display text-2xl text-sand-900 dark:text-sand-100 mt-1">{value}</p>
    </div>
  );
}
