"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SeedProperty } from "@/data/properties";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { useLang } from "@/lib/i18n";
import { ArrowLink } from "@/components/shared/ArrowLink";

export function FeaturedProperties({ properties }: { properties: SeedProperty[] }) {
  const { t } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const featured = properties;

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 40 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="py-28 lg:py-40">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow={t("home.feat.eyebrow")}
            title={t("home.feat.title")}
            description={t("home.feat.desc")}
          />
          <div className="flex items-center gap-6 self-start lg:self-end">
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Previous"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-300 dark:border-sand-700 text-sand-800 dark:text-sand-200 transition-colors hover:bg-sand-900 hover:text-sand-50 hover:border-sand-900 dark:hover:bg-sand-100 dark:hover:text-sand-900"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Next"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-300 dark:border-sand-700 text-sand-800 dark:text-sand-200 transition-colors hover:bg-sand-900 hover:text-sand-50 hover:border-sand-900 dark:hover:bg-sand-100 dark:hover:text-sand-900"
              >
                <ArrowRight size={16} />
              </button>
            </div>
            <ArrowLink href="/properties">{t("home.feat.link")}</ArrowLink>
          </div>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-10 overflow-x-auto px-6 pb-2 lg:gap-14"
        >
          {featured.map((p) => (
            <div
              key={p.slug}
              data-card
              className="w-[78vw] shrink-0 snap-start sm:w-[55vw] lg:w-[calc((100%-7rem)/3)]"
            >
              <PropertyCard p={p} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
