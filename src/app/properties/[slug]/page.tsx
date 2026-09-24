import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize, TrendingUp } from "lucide-react";
import { getAllProperties, getPropertyBySlug, getPropertySlugs } from "@/lib/properties";
import { Container } from "@/components/shared/Container";
import { PropertyMosaic } from "@/components/properties/PropertyMosaic";
import { CurrencyNote, FeatureGrid, MobileContactBar, ShareButton } from "@/components/properties/PropertyExtras";
import { FavoriteButton } from "@/components/properties/FavoriteButton";
import { RevealText } from "@/components/shared/RevealText";
import { LazyMap } from "@/components/properties/LazyMap";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { InquiryForm } from "@/components/properties/InquiryForm";
import { formatArea, formatListingPrice, listingPriceLabel, rentalTerms } from "@/lib/utils";
import { Price } from "@/components/shared/Price";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { whatsappHref } from "@/lib/contact";

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const whatsappMessage = `Hello TERRAYA, I'm interested in ${p.title} (${formatListingPrice(p.priceEur, p.listingType)}) — ${p.city}, ${p.country}.\n${siteUrl}/properties/${p.slug}`;

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
    ...(p.latitude && p.longitude && {
      geo: { "@type": "GeoCoordinates", latitude: p.latitude, longitude: p.longitude },
    }),
    ...(p.listingType === "SALE" && {
      offers: { "@type": "Offer", price: p.priceEur, priceCurrency: "EUR", availability: "https://schema.org/InStock" },
    }),
  };

  return (
    <div className="pb-28 pt-28 lg:pb-24 lg:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="flex items-center justify-between gap-4">
          <Link href="/properties" className="text-xs tracking-[0.28em] uppercase text-sand-600 dark:text-sand-400 hover:text-sand-900 dark:hover:text-sand-100">
            ← Back to Collection
          </Link>
          <div className="flex items-center gap-2">
            <ShareButton title={p.title} />
            <FavoriteButton slug={p.slug} className="border border-sand-300 bg-transparent dark:border-sand-700" />
          </div>
        </div>

        <div className="mt-6">
          <PropertyMosaic images={p.images} title={p.title} />
        </div>

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="min-w-0 space-y-14">
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow"><span className="luxury-divider">{p.type}</span></p>
                <span className="bg-sand-900 px-3 py-1 text-[0.6rem] uppercase tracking-[0.26em] text-sand-50 dark:bg-sand-100 dark:text-sand-900">
                  {p.listingType === "RENT" ? "For Rent" : "For Sale"}
                </span>
              </div>
              <RevealText as="h1" className="mt-4 font-display text-4xl leading-[1.05] text-sand-900 dark:text-sand-100 lg:text-6xl">
                {p.title}
              </RevealText>
              <p className="mt-4 font-display text-xl italic text-sand-700 dark:text-sand-300">{p.tagline}</p>
              <p className="mt-4 flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-sand-600 dark:text-sand-400">
                <MapPin size={14} /> {p.location} · {p.city}, {p.country}
              </p>
            </header>

            <div className="grid grid-cols-2 gap-6 border-y border-sand-200 py-8 dark:border-sand-800 md:grid-cols-4">
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
              <p className="max-w-3xl whitespace-pre-line font-display text-2xl leading-snug text-sand-900 dark:text-sand-100 md:text-3xl">
                {p.description}
              </p>
            </section>

            {p.features.length > 0 && (
              <section>
                <p className="eyebrow mb-6">What this place offers</p>
                <FeatureGrid features={p.features} />
              </section>
            )}

            {p.highlights.length > 0 && (
              <section>
                <p className="eyebrow mb-4">Highlights</p>
                <ul className="grid gap-3 md:grid-cols-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-sand-800 dark:text-sand-200">
                      <span className="mt-2 h-px w-5 shrink-0 bg-sand-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.amenities.length > 0 && (
              <section>
                <p className="eyebrow mb-4">Also included</p>
                <div className="flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <span key={a} className="border border-sand-300 px-4 py-2 text-sm text-sand-800 dark:border-sand-700 dark:text-sand-200">
                      {a}
                    </span>
                  ))}
                </div>
              </section>
            )}

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

          <aside id="inquiry" className="scroll-mt-28 lg:sticky lg:top-28">
            <div className="border border-sand-200 bg-white/50 p-7 shadow-sm dark:border-sand-800 dark:bg-white/[0.03] sm:p-8">
              <p className="eyebrow">{listingPriceLabel(p.listingType)}</p>
              <Price eur={p.priceEur} listingType={p.listingType} className="mt-2 block text-3xl font-medium text-sand-900 dark:text-sand-100 lg:text-4xl" />
              <CurrencyNote />
              {rentalTerms(p.listingType) && (
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sand-500">{rentalTerms(p.listingType)}</p>
              )}
              <a
                href={whatsappHref(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 bg-sand-900 px-6 py-3.5 text-[0.68rem] uppercase tracking-[0.22em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
              >
                <WhatsAppIcon size={15} /> Ask on WhatsApp
              </a>
              <Link
                href="/consultation"
                className="mt-3 flex w-full items-center justify-center border border-sand-900/30 px-6 py-3.5 text-[0.68rem] uppercase tracking-[0.22em] text-sand-900 transition-colors hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100/30 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900"
              >
                Book a private viewing
              </Link>

              <div className="mt-7 border-t border-sand-200 pt-6 dark:border-sand-800">
                <h3 className="font-display text-2xl text-sand-900 dark:text-sand-100">Speak with our office.</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
                  Brochure, viewing arrangements, and the full property dossier on request.
                </p>
                <div className="mt-5">
                  <InquiryForm propertyId={p.slug} />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-28">
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
      <MobileContactBar eur={p.priceEur} listingType={p.listingType} />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sand-600 dark:text-sand-400">{icon}<span className="eyebrow">{label}</span></div>
      <p className="text-2xl font-medium text-sand-900 dark:text-sand-100 mt-1">{value}</p>
    </div>
  );
}
