"use client";

import { Clock, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { InquiryForm } from "@/components/properties/InquiryForm";
import { ConversationPreview } from "@/components/contact/ConversationPreview";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { CONTACT, whatsappHref, whatsappMessageForPath } from "@/lib/contact";
import { useLang } from "@/lib/i18n";
import { RevealText } from "@/components/shared/RevealText";


export function ContactView() {
  const { t } = useLang();
  const channels = [
    { key: "wa", icon: WhatsAppIcon, title: t("card.whatsapp"), detail: t("contact.channel.wa.d"), href: whatsappHref(whatsappMessageForPath("/contact")), external: true },
    { key: "call", icon: Phone, title: t("card.call"), detail: `${CONTACT.phone} · ${t("contact.channel.call.d")}`, href: CONTACT.phoneHref, external: false },
    { key: "mail", icon: Mail, title: t("card.email"), detail: `${CONTACT.email} · ${t("contact.channel.mail.d")}`, href: `mailto:${CONTACT.email}`, external: false },
  ];
  return (
    <div className="pt-32 lg:pt-40 pb-24">
      <Container className="grid gap-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow mb-4"><span className="luxury-divider">{t("contact.eyebrow")}</span></p>
          <RevealText as="h1" className="font-display text-5xl lg:text-7xl text-sand-900 dark:text-sand-100 leading-[1.02]">{t("contact.title")}</RevealText>
          <p className="mt-6 text-sand-700 dark:text-sand-300 text-lg leading-relaxed max-w-lg">
            {t("contact.text")}
          </p>

          <div className="mt-14 grid gap-3">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.key}
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="group relative flex items-center gap-5 overflow-hidden border border-sand-300 p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-sand-900 hover:shadow-lg dark:border-sand-700 dark:hover:border-sand-300"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sand-300 text-sand-800 transition-all duration-500 group-hover:border-sand-900 group-hover:bg-sand-900 group-hover:text-sand-50 dark:border-sand-700 dark:text-sand-200 dark:group-hover:border-sand-100 dark:group-hover:bg-sand-100 dark:group-hover:text-sand-900">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl text-sand-900 dark:text-sand-100">{c.title}</span>
                    <span className="mt-0.5 block text-sm text-sand-600 dark:text-sand-400">{c.detail}</span>
                  </span>
                  <ArrowUpRight size={18} className="shrink-0 text-sand-400 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sand-900 dark:group-hover:text-sand-100" />
                </a>
              );
            })}
          </div>

          <ConversationPreview />
        </div>

        <div className="h-fit border border-sand-200 bg-sand-50 p-8 shadow-sm dark:border-sand-800 dark:bg-sand-900 lg:sticky lg:top-28 lg:p-12">
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
        <RevealText as="h2" className="font-display text-4xl md:text-5xl text-sand-900 dark:text-sand-100 leading-[1.05]">{t("contact.visit.title")}</RevealText>

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
                href={whatsappHref(whatsappMessageForPath("/contact"))}
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
