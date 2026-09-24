"use client";

import Link from "next/link";
import { ArrowUpRight, BedDouble, Maximize2 } from "lucide-react";
import type { SeedProperty } from "@/data/properties";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FadeIn } from "@/components/shared/FadeIn";
import { FadeImage } from "@/components/shared/FadeImage";
import { HoverFrame } from "@/components/shared/HoverFrame";
import { Price } from "@/components/shared/Price";
import { FavoriteButton } from "@/components/properties/FavoriteButton";
import { ArrowLink } from "@/components/shared/ArrowLink";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Editorial gallery: one lead residence beside two supporting ones. Tiles
 * stay image-first; on hover the price and key facts rise over the photo.
 * On touch (no hover) the details are always visible.
 */
function GalleryTile({ p, lead }: { p: SeedProperty; lead: boolean }) {
  const { t } = useLang();
  return (
    <FadeIn className={cn("h-full", lead && "lg:col-span-2 lg:row-span-2")}>
      <HoverFrame
        className="group h-full min-h-[340px] lg:min-h-0"
        cursorLabel={t("cursor.view")}
        image={
          <FadeImage
            src={p.heroImage}
            alt={p.title}
            fill
            sizes={lead ? "(min-width:1024px) 66vw, 100vw" : "(min-width:1024px) 33vw, 100vw"}
            className="object-cover"
          />
        }
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-500" />

        <div className="pointer-events-none absolute left-5 top-5 flex gap-2 text-[0.6rem] uppercase tracking-[0.28em]">
          <span className="bg-sand-50/90 px-3 py-1 text-sand-900">{p.type}</span>
          {p.listingType === "RENT" && <span className="bg-sand-700/90 px-3 py-1 text-sand-50">{t("prop.forRent")}</span>}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 text-sand-50 lg:p-8">
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-sand-100/85">
            {p.city}, {p.country}
          </p>
          <h3 className={cn("mt-2 font-display leading-tight", lead ? "text-3xl lg:text-5xl" : "text-2xl lg:text-3xl")}>
            {p.title}
          </h3>
          {/* Details: always visible on touch, rise in on hover for pointers */}
          <div className="mt-4 flex items-center justify-between gap-4 text-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
            <Price eur={p.priceEur} listingType={p.listingType} className="text-lg font-medium" />
            <span className="flex items-center gap-4 text-sand-100/90">
              <span className="flex items-center gap-1.5"><BedDouble size={15} />{p.bedrooms}</span>
              <span className="flex items-center gap-1.5"><Maximize2 size={14} />{p.areaSqm} m²</span>
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>

        <FavoriteButton slug={p.slug} className="absolute right-4 top-4 z-20" />
        <Link href={`/properties/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title}>
          <span className="sr-only">{p.title}</span>
        </Link>
      </HoverFrame>
    </FadeIn>
  );
}

export function FeaturedProperties({ properties }: { properties: SeedProperty[] }) {
  const { t } = useLang();
  const shown = properties.slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow={t("home.feat.eyebrow")} title={t("home.feat.title")} description={t("home.feat.desc")} />
          <ArrowLink href="/properties" className="self-start lg:self-end">{t("home.feat.link")}</ArrowLink>
        </div>

        <div className="grid gap-4 lg:h-[46rem] lg:grid-cols-3 lg:grid-rows-2 lg:gap-5">
          {shown.map((p, i) => (
            <GalleryTile key={p.slug} p={p} lead={i === 0 && shown.length > 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}
