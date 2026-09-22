"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import type { SeedProperty } from "@/data/properties";
import { Price } from "@/components/shared/Price";
import { FavoriteButton } from "@/components/properties/FavoriteButton";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { propertyTaglineFr } from "@/data/content.fr";
import { useLang } from "@/lib/i18n";

const LISTING_BADGE: Record<SeedProperty["listingType"], string | null> = {
  SALE: null,
  RENT: "For Rent",
  HOLIDAY_RENT: "Vacation Rental",
};

export function PropertyCard({ p }: { p: SeedProperty }) {
  const { t, lang } = useLang();
  const listingBadge = LISTING_BADGE[p.listingType];
  const tagline = lang === "fr" ? propertyTaglineFr[p.slug] ?? p.tagline : p.tagline;
  const message = `${p.title} — ${p.city}, ${p.country}`;

  const contacts = [
    { label: t("card.whatsapp"), href: whatsappHref(message), icon: <WhatsAppIcon size={15} />, external: true },
    { label: t("card.call"), href: CONTACT.phoneHref, icon: <Phone size={15} />, external: false },
    { label: t("card.email"), href: `mailto:${CONTACT.email}?subject=${encodeURIComponent(message)}`, icon: <Mail size={15} />, external: false },
  ];

  return (
    <div className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand-200 dark:bg-sand-800">
        <Image
          src={p.heroImage}
          alt={p.title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-70" />

        <div className="absolute top-5 left-5 flex gap-2">
          <span className="px-3 py-1 text-[0.6rem] tracking-[0.28em] uppercase bg-sand-50/90 text-sand-900">{p.type}</span>
          {listingBadge && (
            <span className="px-3 py-1 text-[0.6rem] tracking-[0.28em] uppercase bg-sand-700/90 text-sand-50">{listingBadge}</span>
          )}
          {p.featured && (
            <span className="px-3 py-1 text-[0.6rem] tracking-[0.28em] uppercase bg-sand-900/85 text-sand-50">Signature</span>
          )}
        </div>

        <FavoriteButton slug={p.slug} className="absolute top-4 right-4 z-20" />

        {/* Quick contact — reveals on hover */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-2 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              aria-label={c.label}
              title={c.label}
              target={c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90 text-sand-900 backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:scale-105"
            >
              {c.icon}
            </a>
          ))}
        </div>

        <div className="absolute bottom-5 left-5 right-5 text-sand-50">
          <p className="text-[0.65rem] tracking-[0.32em] uppercase opacity-90">{p.city}, {p.country}</p>
          <h3 className="font-display text-2xl mt-1">{p.title}</h3>
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <Price eur={p.priceEur} listingType={p.listingType} rentalPeriod={p.rentalPeriod} className="font-display text-xl text-sand-900 dark:text-sand-100" />
        <p className="text-xs tracking-[0.22em] uppercase text-sand-600 dark:text-sand-400">
          {p.bedrooms} bd · {p.bathrooms} ba · {p.areaSqm} m²
        </p>
      </div>
      <p className="mt-3 text-sand-700/90 dark:text-sand-300 leading-relaxed line-clamp-2">{tagline}</p>

      {/* Stretched navigation link sits under the interactive overlays (favorite / contact) */}
      <Link href={`/properties/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title}>
        <span className="sr-only">{p.title}</span>
      </Link>
    </div>
  );
}
