"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { FadeImage } from "@/components/shared/FadeImage";
import { useLang } from "@/lib/i18n";

export function ContactCTA() {
  const { t } = useLang();
  return (
    <section className="relative py-32 lg:py-48 overflow-hidden">
      <FadeImage
        src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2400&q=80"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-sand-900/65" />
      <Container className="relative text-center text-sand-50">
        <p className="eyebrow text-sand-300"><span className="luxury-divider">{t("home.cta.eyebrow")}</span></p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl mt-6 leading-[1.05] max-w-3xl mx-auto">
          {t("home.cta.title")}
        </h2>
        <p className="mt-6 text-sand-200/90 max-w-xl mx-auto leading-relaxed text-lg">
          {t("home.cta.text")}
        </p>
        <Link
          href="/contact"
          className="mt-12 inline-block bg-sand-50 text-sand-900 px-10 py-4 tracking-[0.22em] uppercase text-xs hover:bg-sand-200 transition-colors"
        >
          {t("home.cta.button")}
        </Link>
      </Container>
    </section>
  );
}
