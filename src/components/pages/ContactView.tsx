"use client";

import { Clock, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { InquiryForm } from "@/components/properties/InquiryForm";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { useLang } from "@/lib/i18n";

const offices = [
  { city: "Paris", lines: ["8e arrondissement", "+33 1 00 00 00 00"] },
  { city: "Marrakech", lines: ["Hivernage", "+212 5 24 00 00 00"] },
  { city: "Lisbon", lines: ["Chiado", "+351 21 000 00 00"] },
  { city: "Milan", lines: ["Brera", "+39 02 0000 0000"] },
];

export function ContactView() {
  const { t } = useLang();
  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container className="grid gap-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("contact.eyebrow")}</span></p>
          <h1 className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.02]">
            {t("contact.title")}
          </h1>
          <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed max-w-lg">
            {t("contact.text")}
          </p>

          <div className="mt-16 grid gap-10 sm:grid-cols-2">
            {offices.map((o) => (
              <div key={o.city} className="border-t border-sand-300 dark:border-sand-700 pt-5">
                <p className="font-display text-2xl text-sand-900 dark:text-sand-100">{o.city}</p>
                {o.lines.map((l) => (
                  <p key={l} className="text-sand-700 dark:text-sand-300 mt-1">{l}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-16">
            <p className="eyebrow mb-2">{t("contact.general")}</p>
            <p className="font-display text-xl text-sand-900 dark:text-sand-100">private@terraya.com</p>
          </div>
        </div>

        <div className="border border-sand-200 dark:border-sand-800 p-8 lg:p-12 bg-sand-50 dark:bg-sand-900 h-fit">
          <p className="eyebrow">{t("contact.form.eyebrow")}</p>
          <h2 className="font-display text-3xl text-sand-900 dark:text-sand-100 mt-3">{t("contact.form.title")}</h2>
          <div className="mt-8">
            <InquiryForm />
          </div>
        </div>
      </Container>

      {/* Visit us — hours, address & map */}
      <Container className="mt-28 lg:mt-40">
        <p className="eyebrow mb-4"><span className="luxury-divider">{t("contact.visit.eyebrow")}</span></p>
        <h2 className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">
          {t("contact.visit.title")}
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-stretch">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <MapPin size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-sand-500" />
              <div>
                <p className="eyebrow mb-2">{t("contact.address.label")}</p>
                {CONTACT.addressLines.map((line) => (
                  <p key={line} className="text-sand-700 dark:text-sand-300 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-sand-500" />
              <div>
                <p className="eyebrow mb-2">{t("contact.hours.label")}</p>
                <p className="text-sand-700 dark:text-sand-300">{t("contact.hours.value")}</p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-sand-900 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
              >
                <WhatsAppIcon size={15} /> {t("card.whatsapp")}
              </a>
              <a
                href={CONTACT.phoneHref}
                className="inline-flex items-center gap-2 border border-sand-300 dark:border-sand-700 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-900 dark:text-sand-100 transition-colors hover:border-sand-900 dark:hover:border-sand-100"
              >
                <Phone size={14} /> {t("card.call")}
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${CONTACT.lat},${CONTACT.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-sand-300 dark:border-sand-700 px-6 py-3 text-[0.68rem] uppercase tracking-[0.22em] text-sand-900 dark:text-sand-100 transition-colors hover:border-sand-900 dark:hover:border-sand-100"
              >
                {t("contact.directions")} <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden border border-sand-200 dark:border-sand-800 lg:aspect-auto lg:min-h-[360px]">
            <iframe
              title="TERRAYA Marrakech office"
              className="absolute inset-0 h-full w-full grayscale-[0.2] dark:grayscale dark:invert-[0.9] dark:hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${CONTACT.lng - 0.02}%2C${CONTACT.lat - 0.012}%2C${CONTACT.lng + 0.02}%2C${CONTACT.lat + 0.012}&layer=mapnik&marker=${CONTACT.lat}%2C${CONTACT.lng}`}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
